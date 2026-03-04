import SwiftUI
import FirebaseCore
import GoogleSignIn

@main
struct SaisonApp: App {
    @StateObject private var appVM = AppViewModel()

    init() {
        FirebaseApp.configure()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appVM)
                .onOpenURL { url in
                    GIDSignIn.sharedInstance.handle(url)
                }
        }
    }
}
