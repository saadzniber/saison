import SwiftUI

struct RecipeDetailView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    let recipe: Recipe

    @State private var showAddToCalendar = false
    @State private var showEditRecipe = false
    @State private var showDeleteConfirm = false
    @State private var calendarDate = Date()
    @State private var calendarMealType: MealType = .dinner
    @State private var groceryAdded = false
    @Environment(\.dismiss) private var dismiss

    /// Live version of the recipe from the view model (updates after rating, starring, etc.)
    private var liveRecipe: Recipe {
        appVM.recipes.first(where: { $0.id == recipe.id }) ?? recipe
    }

    private var isCreator: Bool {
        liveRecipe.creatorId == appVM.user?.id
    }

    private var isStarred: Bool {
        appVM.starredRecipeIds.contains(recipe.id)
    }

    private var currentRating: Int {
        liveRecipe.ratings[appVM.user?.id ?? ""] ?? 0
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
        .navigationTitle("")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                HStack(spacing: 16) {
                    if !isCreator {
                        Button(action: {
                            Task { await appVM.toggleStar(recipe: liveRecipe) }
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
                        Button(action: { showDeleteConfirm = true }) {
                            Image(systemName: "trash")
                                .foregroundColor(.red)
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showAddToCalendar) {
            addToCalendarSheet
        }
        .sheet(isPresented: $showEditRecipe) {
            CreateRecipeView(editRecipe: liveRecipe)
        }
        .alert(loc.t("recipe_delete_title"), isPresented: $showDeleteConfirm) {
            Button(loc.t("cancel"), role: .cancel) { }
            Button(loc.t("delete"), role: .destructive) {
                Task {
                    await appVM.deleteRecipe(liveRecipe)
                    dismiss()
                }
            }
        } message: {
            Text(loc.t("recipe_delete_confirm"))
        }
    }

    // MARK: - Header

    private var headerSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(liveRecipe.title)
                .font(Theme.display(24, weight: .semibold))
                .foregroundColor(Theme.ink)

            if !liveRecipe.description.isEmpty {
                Text(liveRecipe.description)
                    .font(Theme.ui(15))
                    .foregroundColor(Theme.inkMuted)
            }

            Text(DateFormatting.fullDate(from: liveRecipe.createdAt))
                .font(Theme.ui(12))
                .foregroundColor(Theme.inkFaint)

            HStack(spacing: 8) {
                ForEach(liveRecipe.seasons) { season in
                    Text("\(season.emoji) \(season.label)")
                        .font(Theme.ui(12, weight: .medium))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Theme.accentBg)
                        .foregroundColor(Theme.accent)
                        .cornerRadius(6)
                }
            }

            if !liveRecipe.produce.isEmpty {
                HStack(spacing: 6) {
                    ForEach(liveRecipe.produce, id: \.self) { p in
                        Text(p)
                            .font(Theme.ui(12))
                            .foregroundColor(Theme.ink)
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
            metaItem(icon: "clock", label: loc.t("recipe_prep"), value: "\(liveRecipe.prepMinutes) min")
            metaItem(icon: "flame", label: loc.t("recipe_cook"), value: "\(liveRecipe.cookMinutes) min")
            metaItem(icon: "person.2", label: loc.t("recipe_servings"), value: "\(liveRecipe.servings)")
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
            Text(loc.t("recipe_your_rating"))
                .font(Theme.ui(14, weight: .medium))
                .foregroundColor(Theme.ink)

            HStack(spacing: 8) {
                ForEach(1...5, id: \.self) { star in
                    Button(action: {
                        Task { await appVM.rateRecipe(recipe: liveRecipe, rating: star) }
                    }) {
                        Image(systemName: star <= currentRating ? "star.fill" : "star")
                            .font(.system(size: 24))
                            .foregroundColor(star <= currentRating ? Theme.warm : Theme.inkFaint)
                    }
                }
            }

            if liveRecipe.averageRating > 0 {
                Text(String(format: loc.t("recipe_avg_rating"), liveRecipe.averageRating, liveRecipe.ratings.count))
                    .font(Theme.ui(12))
                    .foregroundColor(Theme.inkMuted)
            }
        }
    }

    // MARK: - Ingredients

    private var ingredientsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(loc.t("recipe_ingredients"))
                .font(Theme.ui(17, weight: .semibold))
                .foregroundColor(Theme.ink)

            ForEach(liveRecipe.ingredients) { ingredient in
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
            Text(loc.t("recipe_instructions"))
                .font(Theme.ui(17, weight: .semibold))
                .foregroundColor(Theme.ink)

            ForEach(Array(liveRecipe.instructions.enumerated()), id: \.offset) { index, step in
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
                    Text(loc.t("recipe_add_to_calendar"))
                        .font(Theme.ui(15, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(Theme.accent)
                .foregroundColor(.white)
                .cornerRadius(Theme.radiusMD)
            }

            Button(action: {
                guard !groceryAdded else { return }
                Task {
                    await appVM.addIngredientsToGrocery(ingredients: liveRecipe.ingredients)
                    withAnimation { groceryAdded = true }
                }
            }) {
                HStack {
                    Image(systemName: groceryAdded ? "checkmark.circle.fill" : "cart.badge.plus")
                    Text(groceryAdded
                         ? loc.t("recipe_added_to_grocery")
                         : loc.t("recipe_add_to_grocery"))
                        .font(Theme.ui(15, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 48)
                .background(groceryAdded ? Theme.accentBg : Theme.surface)
                .foregroundColor(groceryAdded ? Theme.accent : Theme.ink)
                .cornerRadius(Theme.radiusMD)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMD)
                        .stroke(groceryAdded ? Theme.accent.opacity(0.3) : Theme.border, lineWidth: 1)
                )
            }
            .disabled(groceryAdded)
        }
    }

    // MARK: - Add to Calendar Sheet

    private var addToCalendarSheet: some View {
        NavigationStack {
            VStack(spacing: 24) {
                DatePicker(
                    loc.t("recipe_select_date"),
                    selection: $calendarDate,
                    displayedComponents: .date
                )
                .datePickerStyle(.graphical)

                Picker(loc.t("recipe_meal_type"), selection: $calendarMealType) {
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
                            recipeId: liveRecipe.id,
                            recipeTitle: liveRecipe.title,
                            date: fmt.string(from: calendarDate),
                            mealType: calendarMealType
                        )
                        showAddToCalendar = false
                    }
                }) {
                    Text(loc.t("recipe_confirm_add"))
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
            .navigationTitle(loc.t("recipe_add_to_calendar"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(loc.t("cancel")) {
                        showAddToCalendar = false
                    }
                }
            }
        }
    }
}
