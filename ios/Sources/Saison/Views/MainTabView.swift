import SwiftUI

struct MainTabView: View {
    @EnvironmentObject var loc: LocalizationManager
    @EnvironmentObject var appVM: AppViewModel

    var body: some View {
        TabView(selection: $appVM.selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text(loc.t("tab_home"))
                }
                .tag(0)

            RecipesView()
                .tabItem {
                    Image(systemName: "book.fill")
                    Text(loc.t("tab_recipes"))
                }
                .tag(1)

            CalendarView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text(loc.t("tab_calendar"))
                }
                .tag(2)

            SeasonalView()
                .tabItem {
                    Image(systemName: "leaf.fill")
                    Text(loc.t("tab_seasonal"))
                }
                .tag(3)

            GroceryView()
                .tabItem {
                    Image(systemName: "cart.fill")
                    Text(loc.t("tab_grocery"))
                }
                .tag(4)
        }
        .tint(Theme.accent)
        .onAppear {
            let tabAppearance = UITabBarAppearance()
            tabAppearance.configureWithOpaqueBackground()
            tabAppearance.backgroundColor = UIColor(Theme.surface)
            UITabBar.appearance().standardAppearance = tabAppearance
            UITabBar.appearance().scrollEdgeAppearance = tabAppearance

            let navAppearance = UINavigationBarAppearance()
            navAppearance.configureWithOpaqueBackground()
            navAppearance.backgroundColor = UIColor(Theme.bg)
            navAppearance.titleTextAttributes = [.foregroundColor: UIColor(Theme.ink)]
            navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor(Theme.ink)]
            UINavigationBar.appearance().standardAppearance = navAppearance
            UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        }
    }
}
