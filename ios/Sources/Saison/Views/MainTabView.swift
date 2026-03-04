import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text(NSLocalizedString("tab_home", comment: ""))
                }
                .tag(0)

            RecipesView()
                .tabItem {
                    Image(systemName: "book.fill")
                    Text(NSLocalizedString("tab_recipes", comment: ""))
                }
                .tag(1)

            CalendarView()
                .tabItem {
                    Image(systemName: "calendar")
                    Text(NSLocalizedString("tab_calendar", comment: ""))
                }
                .tag(2)

            SeasonalView()
                .tabItem {
                    Image(systemName: "leaf.fill")
                    Text(NSLocalizedString("tab_seasonal", comment: ""))
                }
                .tag(3)

            GroceryView()
                .tabItem {
                    Image(systemName: "cart.fill")
                    Text(NSLocalizedString("tab_grocery", comment: ""))
                }
                .tag(4)
        }
        .tint(Theme.accent)
    }
}
