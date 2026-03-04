import Foundation
import FirebaseFirestore

class RecipeService: FirebaseService, ObservableObject {

    func fetchMyRecipes(uid: String) async throws -> [Recipe] {
        let snapshot = try await db.collection("recipes")
            .whereField("creatorId", isEqualTo: uid)
            .order(by: "createdAt", descending: true)
            .getDocuments()
        return snapshot.documents.compactMap { decodeRecipe(id: $0.documentID, data: $0.data()) }
    }

    func fetchCommunityRecipes() async throws -> [Recipe] {
        let snapshot = try await db.collection("recipes")
            .whereField("isPublic", isEqualTo: true)
            .order(by: "createdAt", descending: true)
            .limit(to: 50)
            .getDocuments()
        return snapshot.documents.compactMap { decodeRecipe(id: $0.documentID, data: $0.data()) }
    }

    func createRecipe(_ recipe: Recipe) async throws {
        let ref = recipe.id.isEmpty ? db.collection("recipes").document() : db.collection("recipes").document(recipe.id)
        try await ref.setData(encodeRecipe(recipe))
    }

    func updateRecipe(_ recipe: Recipe) async throws {
        try await db.collection("recipes").document(recipe.id).setData(encodeRecipe(recipe), merge: true)
    }

    func deleteRecipe(id: String) async throws {
        try await db.collection("recipes").document(id).delete()
    }

    func toggleStar(recipeId: String, userId: String, isStarred: Bool) async throws {
        let ref = db.collection("recipes").document(recipeId)
        if isStarred {
            try await ref.updateData(["starredBy": FieldValue.arrayRemove([userId])])
        } else {
            try await ref.updateData(["starredBy": FieldValue.arrayUnion([userId])])
        }
    }

    func rateRecipe(recipeId: String, userId: String, rating: Int) async throws {
        try await db.collection("recipes").document(recipeId).updateData(["ratings.\(userId)": rating])
    }

    // MARK: - Encode / Decode

    private func encodeRecipe(_ r: Recipe) -> [String: Any] {
        var d: [String: Any] = [
            "title": r.title,
            "description": r.description,
            "ingredients": r.ingredients.map {
                ["name": $0.name, "quantity": $0.quantity, "unit": $0.unit, "isProduce": $0.isProduce]
            },
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
}
