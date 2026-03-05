import SwiftUI
import FirebaseCore
import GoogleSignIn

@main
struct SaisonApp: App {
    @StateObject private var appVM = AppViewModel()
    @StateObject private var loc = LocalizationManager.shared

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appVM)
                .environmentObject(loc)
                .environment(\.loc, loc)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}
