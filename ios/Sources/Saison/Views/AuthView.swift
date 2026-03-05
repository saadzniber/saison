import SwiftUI
import FirebaseAuth
import GoogleSignIn
import GoogleSignInSwift

struct AuthView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    @State private var isLoading = false
    @State private var error: String?

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 40) {
                Spacer()

                VStack(spacing: 16) {
                    // Logo mark
                    SaisonLogo(size: 72)

                    Text("Saison")
                        .font(Theme.display(48, weight: .semibold))
                        .foregroundColor(Theme.ink)

                    Text(loc.t("auth_tagline"))
                        .font(Theme.ui(17))
                        .foregroundColor(Theme.inkMuted)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                }

                Spacer()

                VStack(spacing: 16) {
                    if let error {
                        Text(error)
                            .font(Theme.ui(14))
                            .foregroundColor(Theme.error)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 24)
                    }

                    Button(action: handleGoogleSignIn) {
                        HStack(spacing: 12) {
                            Image(systemName: "g.circle.fill")
                                .font(.system(size: 20))

                            if isLoading {
                                ProgressView()
                                    .tint(.white)
                            } else {
                                Text(loc.t("auth_sign_in_google"))
                                    .font(Theme.ui(16, weight: .medium))
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .frame(height: 52)
                        .background(Theme.ink)
                        .foregroundColor(.white)
                        .cornerRadius(Theme.radiusMD)
                    }
                    .disabled(isLoading)
                    .padding(.horizontal, Theme.pagePadding)
                }

                Spacer()
                    .frame(height: 60)
            }
        }
    }

    private func handleGoogleSignIn() {
        isLoading = true
        error = nil

        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootVC = windowScene.windows.first?.rootViewController else {
            error = "Cannot find root view controller"
            isLoading = false
            return
        }

        GIDSignIn.sharedInstance.signIn(withPresenting: rootVC) { result, signInError in
            if let signInError {
                self.error = signInError.localizedDescription
                self.isLoading = false
                return
            }

            guard let user = result?.user,
                  let idToken = user.idToken?.tokenString else {
                self.error = loc.t("error_generic")
                self.isLoading = false
                return
            }

            let credential = GoogleAuthProvider.credential(
                withIDToken: idToken,
                accessToken: user.accessToken.tokenString
            )

            Auth.auth().signIn(with: credential) { _, authError in
                self.isLoading = false
                if let authError {
                    self.error = authError.localizedDescription
                }
                // Auth state listener in AppViewModel handles the rest
            }
        }
    }
}
