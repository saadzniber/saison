import SwiftUI
import FirebaseAuth
import FirebaseFirestore

@MainActor
class AppViewModel: ObservableObject {
    @Published var isLoading = true
    @Published var isSignedIn = false
    @Published var user: User?
    @Published var family: Family?
    @Published var recipes: [Recipe] = []
    @Published var communityRecipes: [Recipe] = []
    @Published var calendarEntries: [CalendarEntry] = []
    @Published var groceryItems: [GroceryItem] = []
    @Published var weeklyDiversity: WeeklyDiversity?
    @Published var activity: [ActivityItem] = []
    @Published var errorMessage: String?

    private let db = Firestore.firestore()
    private var authListener: AuthStateDidChangeListenerHandle?

    init() {
        authListener = Auth.auth().addStateDidChangeListener { [weak self] _, firebaseUser in
            Task { @MainActor [weak self] in
                guard let self else { return }
                if let firebaseUser {
                    self.isSignedIn = true
                    await self.fetchOrCreateUser(firebaseUser: firebaseUser)
                    if self.user?.familyId != nil {
                        await self.loadData()
                    }
                } else {
                    self.isSignedIn = false
                    self.user = nil
                    self.family = nil
                    self.recipes = []
                    self.communityRecipes = []
                    self.calendarEntries = []
                    self.groceryItems = []
                    self.weeklyDiversity = nil
                    self.activity = []
                }
                self.isLoading = false
            }
        }
    }

    deinit {
        if let listener = authListener {
            Auth.auth().removeStateDidChangeListener(listener)
        }
    }

    // MARK: - Auth

    func signIn() async {
        // Google Sign-In is handled via GoogleSignIn SDK in AuthView
        // This is called after successful Google auth to ensure user doc exists
    }

    func signOut() {
        do {
            try Auth.auth().signOut()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func deleteAccount() async {
        guard let firebaseUser = Auth.auth().currentUser else { return }
        do {
            if let userId = user?.id {
                try await db.collection("users").document(userId).delete()
            }
            try await firebaseUser.delete()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - User

    private func fetchOrCreateUser(firebaseUser: FirebaseAuth.User) async {
        let ref = db.collection("users").document(firebaseUser.uid)
        do {
            let doc = try await ref.getDocument()
            if doc.exists, let data = doc.data() {
                self.user = decodeUser(id: doc.documentID, data: data)
            } else {
                let newUser = User(
                    id: firebaseUser.uid,
                    displayName: firebaseUser.displayName ?? "",
                    email: firebaseUser.email ?? "",
                    photoURL: firebaseUser.photoURL?.absoluteString,
                    familyId: nil,
                    language: Locale.current.language.languageCode?.identifier ?? "en",
                    createdAt: Date()
                )
                try await ref.setData(encodeUser(newUser))
                self.user = newUser
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Family

    func createFamily(name: String) async {
        guard let userId = user?.id else { return }
        let code = String(UUID().uuidString.prefix(8)).uppercased()
        let familyRef = db.collection("families").document()
        let familyId = familyRef.documentID

        let newFamily = Family(
            id: familyId,
            name: name,
            memberIds: [userId],
            inviteCode: code,
            createdAt: Date()
        )

        do {
            try await familyRef.setData(encodeFamily(newFamily))
            // Write invite code to lookup collection so others can join without a list query
            try await db.collection("invites").document(code).setData([
                "familyId": familyId,
                "createdAt": Timestamp(date: Date())
            ])
            try await db.collection("users").document(userId).updateData(["familyId": familyId])
            self.user?.familyId = familyId
            self.family = newFamily
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func joinFamily(code: String) async {
        guard let userId = user?.id else { return }
        do {
            // Look up familyId via invites collection (no memberIds check needed)
            let inviteDoc = try await db.collection("invites").document(code.uppercased()).getDocument()
            guard let familyId = inviteDoc.data()?["familyId"] as? String else {
                errorMessage = NSLocalizedString("error_invalid_code", comment: "")
                return
            }

            // Self-join: allowed by Firestore rules when only adding self to memberIds
            try await db.collection("families").document(familyId).updateData([
                "memberIds": FieldValue.arrayUnion([userId])
            ])
            try await db.collection("users").document(userId).updateData(["familyId": familyId])

            self.user?.familyId = familyId
            let familyDoc = try await db.collection("families").document(familyId).getDocument()
            if let data = familyDoc.data() {
                self.family = decodeFamily(id: familyId, data: data)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Load Data

    func loadData() async {
        guard let familyId = user?.familyId else { return }

        async let recipesTask: () = loadRecipes(familyId: familyId)
        async let communityTask: () = loadCommunityRecipes()
        async let calendarTask: () = loadCalendar(familyId: familyId)
        async let groceryTask: () = loadGrocery(familyId: familyId)
        async let activityTask: () = loadActivity(familyId: familyId)
        async let familyTask: () = loadFamily(familyId: familyId)

        _ = await (recipesTask, communityTask, calendarTask, groceryTask, activityTask, familyTask)
        computeDiversity()
    }

    func refreshAll() async {
        await loadData()
    }

    private func loadFamily(familyId: String) async {
        do {
            let doc = try await db.collection("families").document(familyId).getDocument()
            if let data = doc.data() {
                self.family = decodeFamily(id: doc.documentID, data: data)
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadRecipes(familyId: String) async {
        do {
            let snapshot = try await db.collection("recipes")
                .whereField("familyId", isEqualTo: familyId)
                .order(by: "createdAt", descending: true)
                .getDocuments()
            self.recipes = snapshot.documents.compactMap { decodeRecipe(id: $0.documentID, data: $0.data()) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadCommunityRecipes() async {
        do {
            let snapshot = try await db.collection("recipes")
                .whereField("isPublic", isEqualTo: true)
                .order(by: "createdAt", descending: true)
                .limit(to: 50)
                .getDocuments()
            self.communityRecipes = snapshot.documents.compactMap { decodeRecipe(id: $0.documentID, data: $0.data()) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadCalendar(familyId: String) async {
        do {
            let snapshot = try await db
                .collection("families").document(familyId).collection("calendar")
                .order(by: "date")
                .getDocuments()
            self.calendarEntries = snapshot.documents.compactMap { decodeCalendarEntry(id: $0.documentID, data: $0.data()) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadGrocery(familyId: String) async {
        do {
            let snapshot = try await db
                .collection("families").document(familyId).collection("grocery")
                .order(by: "createdAt", descending: true)
                .getDocuments()
            self.groceryItems = snapshot.documents.compactMap { decodeGroceryItem(id: $0.documentID, data: $0.data()) }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func loadActivity(familyId: String) async {
        do {
            let snapshot = try await db
                .collection("families").document(familyId).collection("activity")
                .order(by: "createdAt", descending: true)
                .limit(to: 20)
                .getDocuments()
            self.activity = snapshot.documents.compactMap { decodeActivityItem(id: $0.documentID, data: $0.data()) }
        } catch {
            // Activity feed is optional, don't set error
        }
    }

    // MARK: - Recipe CRUD

    func saveRecipe(_ recipe: Recipe) async -> String? {
        let isNew = recipe.id.isEmpty
        let ref = isNew ? db.collection("recipes").document() : db.collection("recipes").document(recipe.id)
        var r = recipe
        if isNew { r = Recipe(id: ref.documentID, title: r.title, description: r.description, ingredients: r.ingredients, instructions: r.instructions, servings: r.servings, prepMinutes: r.prepMinutes, cookMinutes: r.cookMinutes, cuisineId: r.cuisineId, seasons: r.seasons, produce: r.produce, mealTypes: r.mealTypes, creatorId: r.creatorId, familyId: r.familyId, isPublic: r.isPublic, starredBy: r.starredBy, ratings: r.ratings, imageURL: r.imageURL, createdAt: Date()) }

        do {
            try await ref.setData(encodeRecipe(r))
            if isNew {
                recipes.insert(r, at: 0)
            } else {
                if let idx = recipes.firstIndex(where: { $0.id == r.id }) {
                    recipes[idx] = r
                }
            }
            return ref.documentID
        } catch {
            errorMessage = error.localizedDescription
            return nil
        }
    }

    func toggleStar(recipe: Recipe) async {
        guard let userId = user?.id else { return }
        let ref = db.collection("recipes").document(recipe.id)
        let isStarred = recipe.starredBy.contains(userId)

        do {
            if isStarred {
                try await ref.updateData(["starredBy": FieldValue.arrayRemove([userId])])
            } else {
                try await ref.updateData(["starredBy": FieldValue.arrayUnion([userId])])
            }
            if let idx = recipes.firstIndex(where: { $0.id == recipe.id }) {
                var updated = recipes[idx]
                var starredBy = updated.starredBy
                if isStarred {
                    starredBy.removeAll { $0 == userId }
                } else {
                    starredBy.append(userId)
                }
                updated = Recipe(id: updated.id, title: updated.title, description: updated.description, ingredients: updated.ingredients, instructions: updated.instructions, servings: updated.servings, prepMinutes: updated.prepMinutes, cookMinutes: updated.cookMinutes, cuisineId: updated.cuisineId, seasons: updated.seasons, produce: updated.produce, mealTypes: updated.mealTypes, creatorId: updated.creatorId, familyId: updated.familyId, isPublic: updated.isPublic, starredBy: starredBy, ratings: updated.ratings, imageURL: updated.imageURL, createdAt: updated.createdAt)
                recipes[idx] = updated
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func rateRecipe(recipe: Recipe, rating: Int) async {
        guard let userId = user?.id else { return }
        let ref = db.collection("recipes").document(recipe.id)
        do {
            try await ref.updateData(["ratings.\(userId)": rating])
            if let idx = recipes.firstIndex(where: { $0.id == recipe.id }) {
                var updated = recipes[idx]
                var ratings = updated.ratings
                ratings[userId] = rating
                updated = Recipe(id: updated.id, title: updated.title, description: updated.description, ingredients: updated.ingredients, instructions: updated.instructions, servings: updated.servings, prepMinutes: updated.prepMinutes, cookMinutes: updated.cookMinutes, cuisineId: updated.cuisineId, seasons: updated.seasons, produce: updated.produce, mealTypes: updated.mealTypes, creatorId: updated.creatorId, familyId: updated.familyId, isPublic: updated.isPublic, starredBy: updated.starredBy, ratings: ratings, imageURL: updated.imageURL, createdAt: updated.createdAt)
                recipes[idx] = updated
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Calendar

    func addToCalendar(recipeId: String, recipeTitle: String, date: String, mealType: MealType) async {
        guard let familyId = user?.familyId, let userId = user?.id else { return }
        let docId = "\(date)_\(mealType.rawValue)"
        let ref = db.collection("families").document(familyId).collection("calendar").document(docId)
        let entry = CalendarEntry(
            id: docId,
            date: date,
            mealType: mealType,
            recipeId: recipeId,
            recipeTitle: recipeTitle,
            familyId: familyId,
            addedBy: userId,
            createdAt: Date()
        )
        do {
            try await ref.setData(encodeCalendarEntry(entry))
            calendarEntries.removeAll { $0.date == date && $0.mealType == mealType }
            calendarEntries.append(entry)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func removeCalendarEntry(_ entry: CalendarEntry) async {
        guard let familyId = user?.familyId else { return }
        do {
            try await db.collection("families").document(familyId).collection("calendar").document(entry.id).delete()
            calendarEntries.removeAll { $0.id == entry.id }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    // MARK: - Grocery

    func addGroceryItem(name: String, quantity: String, unit: String) async {
        guard let familyId = user?.familyId, let userId = user?.id else { return }
        let ref = db.collection("families").document(familyId).collection("grocery").document()
        let item = GroceryItem(
            id: ref.documentID,
            name: name,
            quantity: quantity,
            unit: unit,
            isChecked: false,
            familyId: familyId,
            addedBy: userId,
            createdAt: Date()
        )
        do {
            try await ref.setData(encodeGroceryItem(item))
            groceryItems.insert(item, at: 0)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func addIngredientsToGrocery(ingredients: [Ingredient]) async {
        for ingredient in ingredients {
            await addGroceryItem(name: ingredient.name, quantity: ingredient.quantity, unit: ingredient.unit)
        }
    }

    func toggleGroceryItem(_ item: GroceryItem) async {
        let ref = db.collection("families").document(item.familyId).collection("grocery").document(item.id)
        do {
            try await ref.updateData(["isChecked": !item.isChecked])
            if let idx = groceryItems.firstIndex(where: { $0.id == item.id }) {
                groceryItems[idx] = GroceryItem(
                    id: item.id, name: item.name, quantity: item.quantity,
                    unit: item.unit, isChecked: !item.isChecked,
                    familyId: item.familyId, addedBy: item.addedBy, createdAt: item.createdAt
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func clearCheckedGrocery() async {
        let checked = groceryItems.filter { $0.isChecked }
        for item in checked {
            do {
                try await db.collection("families").document(item.familyId).collection("grocery").document(item.id).delete()
            } catch {
                errorMessage = error.localizedDescription
            }
        }
        groceryItems.removeAll { $0.isChecked }
    }

    // MARK: - Diversity

    private func computeDiversity() {
        let cal = Calendar.current
        let today = Date()
        guard let weekStart = cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else { return }
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        let weekStartStr = fmt.string(from: weekStart)

        let weekEntries = calendarEntries.filter { entry in
            guard let entryDate = fmt.date(from: entry.date) else { return false }
            return entryDate >= weekStart && entryDate < cal.date(byAdding: .day, value: 7, to: weekStart)!
        }

        let recipeIds = Set(weekEntries.map { $0.recipeId })
        var plants = Set<String>()
        for recipe in recipes where recipeIds.contains(recipe.id) {
            for p in recipe.produce { plants.insert(p) }
        }

        weeklyDiversity = WeeklyDiversity(
            weekStart: weekStartStr,
            uniquePlants: Array(plants),
            count: plants.count,
            goal: 30
        )
    }

    // MARK: - Encoders / Decoders

    private func encodeUser(_ u: User) -> [String: Any] {
        var d: [String: Any] = [
            "displayName": u.displayName,
            "email": u.email,
            "language": u.language,
            "createdAt": Timestamp(date: u.createdAt)
        ]
        if let photo = u.photoURL { d["photoURL"] = photo }
        if let fid = u.familyId { d["familyId"] = fid }
        return d
    }

    private func decodeUser(id: String, data: [String: Any]) -> User {
        User(
            id: id,
            displayName: data["displayName"] as? String ?? "",
            email: data["email"] as? String ?? "",
            photoURL: data["photoURL"] as? String,
            familyId: data["familyId"] as? String,
            language: data["language"] as? String ?? "en",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }

    private func encodeFamily(_ f: Family) -> [String: Any] {
        [
            "name": f.name,
            "memberIds": f.memberIds,
            "inviteCode": f.inviteCode,
            "createdAt": Timestamp(date: f.createdAt)
        ]
    }

    private func decodeFamily(id: String, data: [String: Any]) -> Family {
        Family(
            id: id,
            name: data["name"] as? String ?? "",
            memberIds: data["memberIds"] as? [String] ?? [],
            inviteCode: data["inviteCode"] as? String ?? "",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }

    private func encodeRecipe(_ r: Recipe) -> [String: Any] {
        var d: [String: Any] = [
            "title": r.title,
            "description": r.description,
            "ingredients": r.ingredients.map { ["name": $0.name, "quantity": $0.quantity, "unit": $0.unit, "isProduce": $0.isProduce] },
            "instructions": r.instructions,
            "servings": r.servings,
            "prepMinutes": r.prepMinutes,
            "cookMinutes": r.cookMinutes,
            "cuisineId": r.cuisineId,
            "seasons": r.seasons.map { $0.rawValue },
            "produce": r.produce,
            "mealTypes": r.mealTypes.map { $0.rawValue },
            "creatorId": r.creatorId,
            "familyId": r.familyId,
            "isPublic": r.isPublic,
            "starredBy": r.starredBy,
            "ratings": r.ratings,
            "createdAt": Timestamp(date: r.createdAt)
        ]
        if let img = r.imageURL { d["imageURL"] = img }
        return d
    }

    private func decodeRecipe(id: String, data: [String: Any]) -> Recipe? {
        let ingredientDicts = data["ingredients"] as? [[String: Any]] ?? []
        let ingredients = ingredientDicts.map {
            Ingredient(
                name: $0["name"] as? String ?? "",
                quantity: $0["quantity"] as? String ?? "",
                unit: $0["unit"] as? String ?? "",
                isProduce: $0["isProduce"] as? Bool ?? false
            )
        }
        return Recipe(
            id: id,
            title: data["title"] as? String ?? "",
            description: data["description"] as? String ?? "",
            ingredients: ingredients,
            instructions: data["instructions"] as? [String] ?? [],
            servings: data["servings"] as? Int ?? 4,
            prepMinutes: data["prepMinutes"] as? Int ?? 0,
            cookMinutes: data["cookMinutes"] as? Int ?? 0,
            cuisineId: data["cuisineId"] as? String ?? "",
            seasons: (data["seasons"] as? [String] ?? []).compactMap { Season(rawValue: $0) },
            produce: data["produce"] as? [String] ?? [],
            mealTypes: (data["mealTypes"] as? [String] ?? []).compactMap { MealType(rawValue: $0) },
            creatorId: data["creatorId"] as? String ?? "",
            familyId: data["familyId"] as? String ?? "",
            isPublic: data["isPublic"] as? Bool ?? false,
            starredBy: data["starredBy"] as? [String] ?? [],
            ratings: data["ratings"] as? [String: Int] ?? [:],
            imageURL: data["imageURL"] as? String,
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }

    private func encodeCalendarEntry(_ e: CalendarEntry) -> [String: Any] {
        [
            "date": e.date,
            "mealType": e.mealType.rawValue,
            "recipeId": e.recipeId,
            "recipeTitle": e.recipeTitle,
            "familyId": e.familyId,
            "addedBy": e.addedBy,
            "createdAt": Timestamp(date: e.createdAt)
        ]
    }

    private func decodeCalendarEntry(id: String, data: [String: Any]) -> CalendarEntry? {
        guard let mealType = MealType(rawValue: data["mealType"] as? String ?? "") else { return nil }
        return CalendarEntry(
            id: id,
            date: data["date"] as? String ?? "",
            mealType: mealType,
            recipeId: data["recipeId"] as? String ?? "",
            recipeTitle: data["recipeTitle"] as? String ?? "",
            familyId: data["familyId"] as? String ?? "",
            addedBy: data["addedBy"] as? String ?? "",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }

    private func encodeGroceryItem(_ g: GroceryItem) -> [String: Any] {
        [
            "name": g.name,
            "quantity": g.quantity,
            "unit": g.unit,
            "isChecked": g.isChecked,
            "familyId": g.familyId,
            "addedBy": g.addedBy,
            "createdAt": Timestamp(date: g.createdAt)
        ]
    }

    private func decodeGroceryItem(id: String, data: [String: Any]) -> GroceryItem {
        GroceryItem(
            id: id,
            name: data["name"] as? String ?? "",
            quantity: data["quantity"] as? String ?? "",
            unit: data["unit"] as? String ?? "",
            isChecked: data["isChecked"] as? Bool ?? false,
            familyId: data["familyId"] as? String ?? "",
            addedBy: data["addedBy"] as? String ?? "",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }

    private func decodeActivityItem(id: String, data: [String: Any]) -> ActivityItem {
        ActivityItem(
            id: id,
            type: data["type"] as? String ?? "",
            message: data["message"] as? String ?? "",
            userId: data["userId"] as? String ?? "",
            userName: data["userName"] as? String ?? "",
            timestamp: (data["timestamp"] as? Timestamp)?.dateValue() ?? Date()
        )
    }
}
