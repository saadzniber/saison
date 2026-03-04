import SwiftUI

struct ContentView: View {
    @EnvironmentObject var appVM: AppViewModel

    var body: some View {
        Group {
            if appVM.isLoading {
                loadingView
            } else if !appVM.isSignedIn {
                AuthView()
            } else if appVM.user?.familyId == nil {
                OnboardingView {
                    Task { await appVM.loadData() }
                }
            } else {
                MainTabView()
            }
        }
        .animation(.easeInOut(duration: 0.3), value: appVM.isLoading)
        .animation(.easeInOut(duration: 0.3), value: appVM.isSignedIn)
    }

    private var loadingView: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            VStack(spacing: 16) {
                Text("Saison")
                    .font(Theme.display(36, weight: .semibold))
                    .foregroundColor(Theme.ink)
                ProgressView()
                    .tint(Theme.accent)
            }
        }
    }
}
