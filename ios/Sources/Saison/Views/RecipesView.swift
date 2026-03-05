import SwiftUI

struct RecipesView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    @State private var selectedTab = 0
    @State private var searchText = ""
    @State private var showCreateRecipe = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                VStack(spacing: 0) {
                    Picker("", selection: $selectedTab) {
                        Text(loc.t("recipes_family")).tag(0)
                        Text(loc.t("recipes_starred")).tag(1)
                        Text(loc.t("recipes_community")).tag(2)
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal, Theme.pagePadding)
                    .padding(.top, 8)

                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(Theme.inkFaint)
                        TextField(loc.t("recipes_search"), text: $searchText)
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
                            .listRowBackground(Theme.surface)
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
            .navigationTitle(loc.t("tab_recipes"))
            .refreshable {
                await appVM.refreshAll()
            }
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
            source = appVM.starredRecipes
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
