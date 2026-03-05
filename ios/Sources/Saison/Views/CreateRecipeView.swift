import SwiftUI

struct CreateRecipeView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
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
                Section(header: Text(loc.t("create_basic_info")).foregroundColor(Theme.inkMuted)) {
                    TextField(loc.t("create_title"), text: $title)
                    TextField(loc.t("create_description"), text: $description, axis: .vertical)
                        .lineLimit(3...6)
                    HStack {
                        Text(loc.t("create_servings"))
                        Spacer()
                        TextField("4", text: $servings)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Text(loc.t("create_prep_time"))
                        Spacer()
                        TextField("15", text: $prepMinutes)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.trailing)
                        Text(loc.t("unit_minutes"))
                    }
                    HStack {
                        Text(loc.t("create_cook_time"))
                        Spacer()
                        TextField("30", text: $cookMinutes)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                            .multilineTextAlignment(.trailing)
                        Text(loc.t("unit_minutes"))
                    }
                }
                .listRowBackground(Theme.surface)

                Section(header: Text(loc.t("create_cuisine")).foregroundColor(Theme.inkMuted)) {
                    Picker(loc.t("create_cuisine"), selection: $cuisineId) {
                        Text(loc.t("create_cuisine_none")).tag("")
                        ForEach(CuisineOption.all) { cuisine in
                            Text("\(cuisine.emoji) \(cuisine.label)").tag(cuisine.id)
                        }
                    }

                    Toggle(loc.t("create_public"), isOn: $isPublic)
                }
                .listRowBackground(Theme.surface)

                Section(header: Text(loc.t("create_seasons_label")).foregroundColor(Theme.inkMuted)) {
                    FlowLayout(spacing: 8) {
                        ForEach(Season.allCases) { season in
                            Button(action: {
                                if selectedSeasons.contains(season) {
                                    selectedSeasons.remove(season)
                                } else {
                                    selectedSeasons.insert(season)
                                }
                            }) {
                                HStack(spacing: 5) {
                                    Text(season.emoji)
                                        .font(.system(size: 14))
                                    Text(season.label)
                                        .font(Theme.ui(13, weight: selectedSeasons.contains(season) ? .semibold : .regular))
                                }
                                .padding(.horizontal, 14)
                                .padding(.vertical, 7)
                                .background(selectedSeasons.contains(season) ? Theme.accent : Theme.surface)
                                .foregroundColor(selectedSeasons.contains(season) ? .white : Theme.ink)
                                .cornerRadius(20)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 20)
                                        .stroke(selectedSeasons.contains(season) ? Theme.accent : Theme.border, lineWidth: selectedSeasons.contains(season) ? 1.5 : 1)
                                )
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .listRowBackground(Theme.surface)

                Section(header: Text(loc.t("create_meal_types")).foregroundColor(Theme.inkMuted)) {
                    FlowLayout(spacing: 8) {
                        ForEach(MealType.allCases) { mt in
                            Button(action: {
                                if selectedMealTypes.contains(mt) {
                                    selectedMealTypes.remove(mt)
                                } else {
                                    selectedMealTypes.insert(mt)
                                }
                            }) {
                                Text(mt.label)
                                    .font(Theme.ui(13, weight: selectedMealTypes.contains(mt) ? .semibold : .regular))
                                    .padding(.horizontal, 14)
                                    .padding(.vertical, 7)
                                    .background(selectedMealTypes.contains(mt) ? Theme.accent : Theme.surface)
                                    .foregroundColor(selectedMealTypes.contains(mt) ? .white : Theme.ink)
                                    .cornerRadius(20)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 20)
                                            .stroke(selectedMealTypes.contains(mt) ? Theme.accent : Theme.border, lineWidth: selectedMealTypes.contains(mt) ? 1.5 : 1)
                                    )
                            }
                        }
                    }
                    .padding(.vertical, 4)
                }
                .listRowBackground(Theme.surface)

                Section(header: Text(loc.t("recipe_ingredients")).foregroundColor(Theme.inkMuted)) {
                    ForEach(ingredients.indices, id: \.self) { index in
                        VStack(spacing: 8) {
                            HStack {
                                TextField(loc.t("create_ingredient_name"), text: $ingredients[index].name)
                                TextField(loc.t("create_ingredient_qty"), text: $ingredients[index].quantity)
                                    .frame(width: 60)
                                    .keyboardType(.decimalPad)
                                TextField(loc.t("create_ingredient_unit"), text: $ingredients[index].unit)
                                    .frame(width: 60)
                            }
                            Toggle(loc.t("create_is_produce"), isOn: $ingredients[index].isProduce)
                                .font(Theme.ui(13))
                        }
                        .padding(.vertical, 4)
                    }
                    Button(action: { ingredients.append(IngredientInput()) }) {
                        Label(loc.t("create_add_ingredient"), systemImage: "plus.circle")
                    }
                }
                .listRowBackground(Theme.surface)

                Section(header: Text(loc.t("recipe_instructions")).foregroundColor(Theme.inkMuted)) {
                    ForEach(instructions.indices, id: \.self) { index in
                        HStack {
                            Text("\(index + 1).")
                                .foregroundColor(Theme.inkMuted)
                            TextField(loc.t("create_step"), text: $instructions[index], axis: .vertical)
                        }
                    }
                    Button(action: { instructions.append("") }) {
                        Label(loc.t("create_add_step"), systemImage: "plus.circle")
                    }
                }
                .listRowBackground(Theme.surface)

                Section(header: Text(loc.t("create_produce_tags")).foregroundColor(Theme.inkMuted)) {
                    HStack {
                        TextField(loc.t("create_produce_placeholder"), text: $produceText)
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
                .listRowBackground(Theme.surface)

                if let error {
                    Section {
                        Text(error)
                            .foregroundColor(Theme.error)
                            .font(Theme.ui(14))
                    }
                    .listRowBackground(Theme.surface)
                }
            }
            .scrollContentBackground(.hidden)
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(isEditing ? loc.t("create_edit_title") : loc.t("create_new_title"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(loc.t("cancel")) { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(action: handleSave) {
                        if isLoading {
                            ProgressView()
                        } else {
                            Text(loc.t("save"))
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
            error = loc.t("error_title_required")
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
                error = appVM.errorMessage ?? loc.t("error_generic")
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
