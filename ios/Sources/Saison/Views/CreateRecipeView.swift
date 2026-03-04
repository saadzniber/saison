import SwiftUI

struct CreateRecipeView: View {
    @EnvironmentObject var appVM: AppViewModel
    @Environment(\.dismiss) var dismiss

    var editRecipe: Recipe?

    @State private var title = ""
    @State private var description = ""
    @State private var servings = "4"
    @State private var prepMinutes = "15"
    @State private var cookMinutes = "30"
    @State private var cuisineId = ""
    @State private var isPublic = false
    @State private var selectedSeasons: Set<Season> = []
    @State private var selectedMealTypes: Set<MealType> = []
    @State private var ingredients: [IngredientInput] = [IngredientInput()]
    @State private var instructions: [String] = [""]
    @State private var produceText = ""
    @State private var produceTags: [String] = []
    @State private var isLoading = false
    @State private var error: String?

    struct IngredientInput: Identifiable {
        let id = UUID()
        var name = ""
        var quantity = ""
        var unit = ""
        var isProduce = false
    }

    var isEditing: Bool { editRecipe != nil }

    var body: some View {
        NavigationStack {
            Form {
                Section(header: Text(NSLocalizedString("create_basic_info", comment: ""))) {
                    TextField(NSLocalizedString("create_title", comment: ""), text: $title)
                    TextField(NSLocalizedString("create_description", comment: ""), text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    HStack {
                        Text(NSLocalizedString("create_servings", comment: ""))
                        Spacer()
                        TextField("4", text: $servings)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text(NSLocalizedString("create_prep_time", comment: ""))
                        Spacer()
                        TextField("15", text: $prepMinutes)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.trailing)
                        Text("min")
                    }
                    HStack {
                        Text(NSLocalizedString("create_cook_time", comment: ""))
                        Spacer()
                        TextField("30", text: $cookMinutes)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.trailing)
                        Text("min")
                    }
                }

                Section(header: Text(NSLocalizedString("create_cuisine", comment: ""))) {
                    TextField(NSLocalizedString("create_cuisine_id", comment: ""), text: $cuisineId)
                    Toggle(NSLocalizedString("create_public", comment: ""), isOn: $isPublic)
                }

                Section(header: Text(NSLocalizedString("create_seasons_label", comment: ""))) {
                    ForEach(Season.allCases) { season in
                        Button(action: {
                            if selectedSeasons.contains(season) {
                                selectedSeasons.remove(season)
                            } else {
                                selectedSeasons.insert(season)
                            }
                        }) {
                            HStack {
                                Text("\(season.emoji) \(season.label)")
                                    .foregroundColor(Theme.ink)
                                Spacer()
                                if selectedSeasons.contains(season) {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(Theme.accent)
                                }
                            }
                        }
                    }
                }

                Section(header: Text(NSLocalizedString("create_meal_types", comment: ""))) {
                    ForEach(MealType.allCases) { mt in
                        Button(action: {
                            if selectedMealTypes.contains(mt) {
                                selectedMealTypes.remove(mt)
                            } else {
                                selectedMealTypes.insert(mt)
                            }
                        }) {
                            HStack {
                                Text(mt.label)
                                    .foregroundColor(Theme.ink)
                                Spacer()
                                if selectedMealTypes.contains(mt) {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(Theme.accent)
                                }
                            }
                        }
                    }
                }

                Section(header: Text(NSLocalizedString("recipe_ingredients", comment: ""))) {
                    ForEach(ingredients.indices, id: \.self) { index in
                        VStack(spacing: 8) {
                            HStack {
                                TextField(NSLocalizedString("create_ingredient_name", comment: ""), text: $ingredients[index].name)
                                TextField(NSLocalizedString("create_ingredient_qty", comment: ""), text: $ingredients[index].quantity)
                                    .frame(width: 60)
                                    .keyboardType(.decimalPad)
                                TextField(NSLocalizedString("create_ingredient_unit", comment: ""), text: $ingredients[index].unit)
                                    .frame(width: 60)
                            }
                            Toggle(NSLocalizedString("create_is_produce", comment: ""), isOn: $ingredients[index].isProduce)
                                .font(Theme.ui(13))
                        }
                        .padding(.vertical, 4)
                    }
                    Button(action: { ingredients.append(IngredientInput()) }) {
                        Label(NSLocalizedString("create_add_ingredient", comment: ""), systemImage: "plus.circle")
                    }
                }

                Section(header: Text(NSLocalizedString("recipe_instructions", comment: ""))) {
                    ForEach(instructions.indices, id: \.self) { index in
                        HStack {
                            Text("\(index + 1).")
                                .foregroundColor(Theme.inkMuted)
                            TextField(NSLocalizedString("create_step", comment: ""), text: $instructions[index], axis: .vertical)
                        }
                    }
                    Button(action: { instructions.append("") }) {
                        Label(NSLocalizedString("create_add_step", comment: ""), systemImage: "plus.circle")
                    }
                }

                Section(header: Text(NSLocalizedString("create_produce_tags", comment: ""))) {
                    HStack {
                        TextField(NSLocalizedString("create_produce_placeholder", comment: ""), text: $produceText)
                            .onSubmit {
                                let tag = produceText.trimmingCharacters(in: .whitespaces)
                                if !tag.isEmpty && !produceTags.contains(tag) {
                                    produceTags.append(tag)
                                    produceText = ""
                                }
                            }
                        Button(action: {
                            let tag = produceText.trimmingCharacters(in: .whitespaces)
                            if !tag.isEmpty && !produceTags.contains(tag) {
                                produceTags.append(tag)
                                produceText = ""
                            }
                        }) {
                            Image(systemName: "plus.circle.fill")
                                .foregroundColor(Theme.accent)
                        }
                    }

                    if !produceTags.isEmpty {
                        FlowLayout(spacing: 6) {
                            ForEach(produceTags, id: \.self) { tag in
                                HStack(spacing: 4) {
                                    Text(tag)
                                        .font(Theme.ui(13))
                                    Button(action: { produceTags.removeAll { $0 == tag } }) {
                                        Image(systemName: "xmark.circle.fill")
                                            .font(.system(size: 12))
                                            .foregroundColor(Theme.inkFaint)
                                    }
                                }
                                .padding(.horizontal, 10)
                                .padding(.vertical, 6)
                                .background(Theme.accentBg)
                                .cornerRadius(8)
                            }
                        }
                    }
                }

                if let error {
                    Section {
                        Text(error)
                            .foregroundColor(Theme.error)
                            .font(Theme.ui(14))
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(isEditing ? NSLocalizedString("create_edit_title", comment: "") : NSLocalizedString("create_new_title", comment: ""))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(NSLocalizedString("cancel", comment: "")) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(action: handleSave) {
                        if isLoading {
                            ProgressView()
                        } else {
                            Text(NSLocalizedString("save", comment: ""))
                        }
                    }
                    .disabled(title.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)
                }
            }
            .onAppear { loadEditData() }
        }
    }

    private func loadEditData() {
        guard let r = editRecipe else { return }
        title = r.title
        description = r.description
        servings = "\(r.servings)"
        prepMinutes = "\(r.prepMinutes)"
        cookMinutes = "\(r.cookMinutes)"
        cuisineId = r.cuisineId
        isPublic = r.isPublic
        selectedSeasons = Set(r.seasons)
        selectedMealTypes = Set(r.mealTypes)
        ingredients = r.ingredients.map {
            IngredientInput(name: $0.name, quantity: $0.quantity, unit: $0.unit, isProduce: $0.isProduce)
        }
        instructions = r.instructions
        produceTags = r.produce
    }

    private func handleSave() {
        let trimmedTitle = title.trimmingCharacters(in: .whitespaces)
        guard !trimmedTitle.isEmpty else {
            error = NSLocalizedString("error_title_required", comment: "")
            return
        }

        isLoading = true
        error = nil

        let ingredientModels = ingredients
            .filter { !$0.name.trimmingCharacters(in: .whitespaces).isEmpty }
            .map { Ingredient(name: $0.name, quantity: $0.quantity, unit: $0.unit, isProduce: $0.isProduce) }

        let filteredInstructions = instructions.filter { !$0.trimmingCharacters(in: .whitespaces).isEmpty }

        let recipe = Recipe(
            id: editRecipe?.id ?? "",
            title: trimmedTitle,
            description: description,
            ingredients: ingredientModels,
            instructions: filteredInstructions,
            servings: Int(servings) ?? 4,
            prepMinutes: Int(prepMinutes) ?? 0,
            cookMinutes: Int(cookMinutes) ?? 0,
            cuisineId: cuisineId,
            seasons: Array(selectedSeasons),
            produce: produceTags,
            mealTypes: Array(selectedMealTypes),
            creatorId: appVM.user?.id ?? "",
            familyId: appVM.user?.familyId ?? "",
            isPublic: isPublic,
            starredBy: editRecipe?.starredBy ?? [],
            ratings: editRecipe?.ratings ?? [:],
            imageURL: editRecipe?.imageURL,
            createdAt: editRecipe?.createdAt ?? Date()
        )

        Task {
            let result = await appVM.saveRecipe(recipe)
            isLoading = false
            if result != nil {
                dismiss()
            } else {
                error = appVM.errorMessage ?? NSLocalizedString("error_generic", comment: "")
                appVM.errorMessage = nil
            }
        }
    }
}

// MARK: - Flow Layout

struct FlowLayout: Layout {
    var spacing: CGFloat = 8

    func sizeThatFits(proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) -> CGSize {
        let result = layout(proposal: proposal, subviews: subviews)
        return result.size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize, subviews: Subviews, cache: inout ()) {
        let result = layout(proposal: proposal, subviews: subviews)
        for (index, position) in result.positions.enumerated() {
            subviews[index].place(
                at: CGPoint(x: bounds.minX + position.x, y: bounds.minY + position.y),
                proposal: .unspecified
            )
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews) -> (size: CGSize, positions: [CGPoint]) {
        let maxWidth = proposal.width ?? .infinity
        var positions: [CGPoint] = []
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0

        for subview in subviews {
            let size = subview.sizeThatFits(.unspecified)
            if x + size.width > maxWidth && x > 0 {
                x = 0
                y += rowHeight + spacing
                rowHeight = 0
            }
            positions.append(CGPoint(x: x, y: y))
            rowHeight = max(rowHeight, size.height)
            x += size.width + spacing
        }

        return (CGSize(width: maxWidth, height: y + rowHeight), positions)
    }
}
