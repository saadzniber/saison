import SwiftUI

struct RecipeDetailView: View {
    @EnvironmentObject var appVM: AppViewModel
    let recipe: Recipe

    @State private var showAddToCalendar = false
    @State private var showEditRecipe = false
    @State private var calendarDate = Date()
    @State private var calendarMealType: MealType = .dinner

    private var isCreator: Bool {
        recipe.creatorId == appVM.user?.id
    }

    private var isStarred: Bool {
        recipe.starredBy.contains(appVM.user?.id ?? "")
    }

    private var currentRating: Int {
        recipe.ratings[appVM.user?.id ?? ""] ?? 0
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                headerSection
                metaSection
                if !isCreator { ratingSection }
                ingredientsSection
                instructionsSection
                actionsSection
            }
            .padding(.horizontal, Theme.pagePadding)
            .padding(.top, 8)
            .padding(.bottom, 100)
        }
        .background(Theme.bg.ignoresSafeArea())
        .navigationTitle(recipe.title)
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                HStack(spacing: 16) {
                    if !isCreator {
                        Button(action: {
                            Task { await appVM.toggleStar(recipe: recipe) }
                        }) {
                            Image(systemName: isStarred ? "star.fill" : "star")
                                .foregroundColor(isStarred ? Theme.warm : Theme.inkMuted)
                        }
                    }
                    if isCreator {
                        Button(action: { showEditRecipe = true }) {
                            Image(systemName: "pencil")
                                .foregroundColor(Theme.inkMuted)
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showAddToCalendar) {
            addToCalendarSheet
        }
        .sheet(isPresented: $showEditRecipe) {
            CreateRecipeView(editRecipe: recipe)
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(recipe.description)
                .font(Theme.ui(15))
                .foregroundColor(Theme.inkMuted)

            HStack(spacing: 8) {
                ForEach(recipe.seasons) { season in
                    Text("\(season.emoji) \(season.label)")
                        .font(Theme.ui(12, weight: .medium))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Theme.accentBg)
                        .foregroundColor(Theme.accent)
                        .cornerRadius(6)
                }
            }

            if !recipe.produce.isEmpty {
                HStack(spacing: 6) {
                    ForEach(recipe.produce, id: \.self) { p in
                        Text(p)
                            .font(Theme.ui(12))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Theme.surfaceRaised)
                            .cornerRadius(6)
                    }
                }
            }
        }
    }

    // MARK: - Meta

    private var metaSection: some View {
        HStack(spacing: 20) {
            metaItem(icon: "clock", label: NSLocalizedString("recipe_prep", comment: ""), value: "\(recipe.prepMinutes) min")
            metaItem(icon: "flame", label: NSLocalizedString("recipe_cook", comment: ""), value: "\(recipe.cookMinutes) min")
            metaItem(icon: "person.2", label: NSLocalizedString("recipe_servings", comment: ""), value: "\(recipe.servings)")
        }
        .padding(16)
        .background(Theme.surface)
        .cornerRadius(Theme.radiusMD)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusMD)
                .stroke(Theme.border, lineWidth: 1)
        )
    }

    private func metaItem(icon: String, label: String, value: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Theme.accent)
            Text(value)
                .font(Theme.ui(14, weight: .medium))
                .foregroundColor(Theme.ink)
            Text(label)
                .font(Theme.ui(11))
                .foregroundColor(Theme.inkFaint)
        }
        .frame(maxWidth: .infinity)
    }

    // MARK: - Rating

    private var ratingSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(NSLocalizedString("recipe_your_rating", comment: ""))
                .font(Theme.ui(14, weight: .medium))
                .foregroundColor(Theme.ink)

            HStack(spacing: 8) {
                ForEach(1...5, id: \.self) { star in
                    Button(action: {
                        Task { await appVM.rateRecipe(recipe: recipe, rating: star) }
                    }) {
                        Image(systemName: star <= currentRating ? "star.fill" : "star")
                            .font(.system(size: 24))
                            .foregroundColor(star <= currentRating ? Theme.warm : Theme.inkFaint)
                    }
                }
            }

            if recipe.averageRating > 0 {
                Text(String(format: NSLocalizedString("recipe_avg_rating", comment: ""), recipe.averageRating, recipe.ratings.count))
                    .font(Theme.ui(12))
                    .foregroundColor(Theme.inkMuted)
            }
        }
    }

    // MARK: - Ingredients

    private var ingredientsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(NSLocalizedString("recipe_ingredients", comment: ""))
                .font(Theme.ui(17, weight: .semibold))
                .foregroundColor(Theme.ink)

            ForEach(recipe.ingredients) { ingredient in
                HStack {
                    Circle()
                        .fill(ingredient.isProduce ? Theme.accent : Theme.inkFaint)
                        .frame(width: 6, height: 6)
                    Text("\(ingredient.quantity) \(ingredient.unit) \(ingredient.name)")
                        .font(Theme.ui(15))
                        .foregroundColor(Theme.ink)
                    Spacer()
                }
            }
        }
    }

    // MARK: - Instructions

    private var instructionsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(NSLocalizedString("recipe_instructions", comment: ""))
                .font(Theme.ui(17, weight: .semibold))
                .foregroundColor(Theme.ink)

            ForEach(Array(recipe.instructions.enumerated()), id: \.offset) { index, step in
                HStack(alignment: .top, spacing: 12) {
                    Text("\(index + 1)")
                        .font(Theme.ui(13, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 24, height: 24)
                        .background(Theme.accent)
                        .clipShape(Circle())

                    Text(step)
                        .font(Theme.ui(15))
                        .foregroundColor(Theme.ink)
                }
            }
        }
    }

    // MARK: - Actions

    private var actionsSection: some View {
        VStack(spacing: 12) {
            Button(action: { showAddToCalendar = true }) {
                HStack {
                    Image(systemName: "calendar.badge.plus")
                    Text(NSLocalizedString("recipe_add_to_calendar", comment: ""))
                        .font(Theme.ui(15, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(Theme.accent)
                .foregroundColor(.white)
                .cornerRadius(Theme.radiusMD)
            }

            Button(action: {
                Task { await appVM.addIngredientsToGrocery(ingredients: recipe.ingredients) }
            }) {
                HStack {
                    Image(systemName: "cart.badge.plus")
                    Text(NSLocalizedString("recipe_add_to_grocery", comment: ""))
                        .font(Theme.ui(15, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(Theme.surface)
                .foregroundColor(Theme.ink)
                .cornerRadius(Theme.radiusMD)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )
            }
        }
    }

    // MARK: - Add to Calendar Sheet

    private var addToCalendarSheet: some View {
        NavigationStack {
            VStack(spacing: 24) {
                DatePicker(
                    NSLocalizedString("recipe_select_date", comment: ""),
                    selection: $calendarDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)

                Picker(NSLocalizedString("recipe_meal_type", comment: ""), selection: $calendarMealType) {
                    ForEach(MealType.allCases) { mt in
                        Text(mt.label).tag(mt)
                    }
                }
                .pickerStyle(.segmented)

                Button(action: {
                    let fmt = DateFormatter()
                    fmt.dateFormat = "yyyy-MM-dd"
                    Task {
                        await appVM.addToCalendar(
                            recipeId: recipe.id,
                            recipeTitle: recipe.title,
                            date: fmt.string(from: calendarDate),
                            mealType: calendarMealType
                        )
                        showAddToCalendar = false
                    }
                }) {
                    Text(NSLocalizedString("recipe_confirm_add", comment: ""))
                        .font(Theme.ui(16, weight: .medium))
                        .frame(maxWidth: .infinity)
                        .frame(height: 48)
                        .background(Theme.accent)
                        .foregroundColor(.white)
                        .cornerRadius(Theme.radiusMD)
                }
            }
            .padding(Theme.pagePadding)
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(NSLocalizedString("recipe_add_to_calendar", comment: ""))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(NSLocalizedString("cancel", comment: "")) {
                        showAddToCalendar = false
                    }
                }
            }
        }
    }
}
