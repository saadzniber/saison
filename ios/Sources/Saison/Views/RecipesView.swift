import SwiftUI

struct RecipesView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var selectedTab = 0
    @State private var searchText = ""
    @State private var showCreateRecipe = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                VStack(spacing: 0) {
                    Picker("", selection: $selectedTab) {
                        Text(NSLocalizedString("recipes_my", comment: "")).tag(0)
                        Text(NSLocalizedString("recipes_starred", comment: "")).tag(1)
                        Text(NSLocalizedString("recipes_community", comment: "")).tag(2)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, Theme.pagePadding)
                    .padding(.top, 8)

                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(Theme.inkFaint)
                        TextField(NSLocalizedString("recipes_search", comment: ""), text: $searchText)
                            .font(Theme.ui(15))
                    }
                    .padding(12)
                    .background(Theme.surfaceRaised)
                    .cornerRadius(Theme.radiusMD)
                    .padding(.horizontal, Theme.pagePadding)
                    .padding(.top, 12)

                    List {
                        ForEach(filteredRecipes) { recipe in
                            NavigationLink(destination: RecipeDetailView(recipe: recipe)) {
                                RecipeRowView(recipe: recipe)
                            }
                            .listRowBackground(Theme.bg)
                        }
                    }
                    .listStyle(.plain)
                    .scrollContentBackground(.hidden)
                    .background(Theme.bg)
                }

                Button(action: { showCreateRecipe = true }) {
                    Image(systemName: "plus")
                        .font(.system(size: 20, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(width: 56, height: 56)
                        .background(Theme.accent)
                        .clipShape(Circle())
                        .shadow(color: Theme.accent.opacity(0.3), radius: 8, y: 4)
                }
                .padding(.trailing, Theme.pagePadding)
                .padding(.bottom, 20)
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(NSLocalizedString("tab_recipes", comment: ""))
            .sheet(isPresented: $showCreateRecipe) {
                CreateRecipeView()
            }
        }
    }

    private var filteredRecipes: [Recipe] {
        let source: [Recipe]
        switch selectedTab {
        case 0:
            source = appVM.recipes
        case 1:
            let userId = appVM.user?.id ?? ""
            source = appVM.recipes.filter { $0.starredBy.contains(userId) }
        default:
            source = appVM.communityRecipes
        }

        if searchText.isEmpty { return source }
        return source.filter { $0.title.localizedCaseInsensitiveContains(searchText) }
    }
}

// MARK: - Recipe Row

struct RecipeRowView: View {
    let recipe: Recipe

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(recipe.title)
                .font(Theme.ui(16, weight: .medium))
                .foregroundColor(Theme.ink)

            Text(recipe.description)
                .font(Theme.ui(13))
                .foregroundColor(Theme.inkMuted)
                .lineLimit(2)

            HStack(spacing: 12) {
                Label("\(recipe.prepMinutes + recipe.cookMinutes) min", systemImage: "clock")
                Label("\(recipe.servings)", systemImage: "person.2")
                if recipe.averageRating > 0 {
                    Label(String(format: "%.1f", recipe.averageRating), systemImage: "star.fill")
                }
            }
            .font(Theme.ui(12))
            .foregroundColor(Theme.inkFaint)
        }
        .padding(.vertical, 4)
    }
}
