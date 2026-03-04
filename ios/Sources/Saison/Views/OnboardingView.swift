import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var appVM: AppViewModel
    let onComplete: () -> Void

    @State private var step: Step = .choice
    @State private var familyName = ""
    @State private var inviteCode = ""
    @State private var isLoading = false
    @State private var error: String?

    enum Step {
        case choice, create, join
    }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 32) {
                Spacer()

                SaisonLogo(size: 56)

                Text("Saison")
                    .font(Theme.display(36, weight: .semibold))
                    .foregroundColor(Theme.ink)

                switch step {
                case .choice:
                    choiceView
                case .create:
                    createView
                case .join:
                    joinView
                }

                Spacer()
            }
            .padding(.horizontal, Theme.pagePadding)
        }
    }

    private var choiceView: some View {
        VStack(spacing: 16) {
            Text(NSLocalizedString("onboarding_welcome", comment: ""))
                .font(Theme.ui(17))
                .foregroundColor(Theme.inkMuted)
                .multilineTextAlignment(.center)

            Button(action: { withAnimation { step = .create } }) {
                HStack {
                    Image(systemName: "house.fill")
                    Text(NSLocalizedString("onboarding_create_family", comment: ""))
                        .font(Theme.ui(16, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Theme.accent)
                .foregroundColor(.white)
                .cornerRadius(Theme.radiusMD)
            }

            Button(action: { withAnimation { step = .join } }) {
                HStack {
                    Image(systemName: "person.2.fill")
                    Text(NSLocalizedString("onboarding_join_family", comment: ""))
                        .font(Theme.ui(16, weight: .medium))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(Theme.surface)
                .foregroundColor(Theme.ink)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )
                .cornerRadius(Theme.radiusMD)
            }
        }
    }

    private var createView: some View {
        VStack(spacing: 20) {
            Text(NSLocalizedString("onboarding_family_name", comment: ""))
                .font(Theme.ui(17, weight: .medium))
                .foregroundColor(Theme.ink)

            TextField(NSLocalizedString("onboarding_family_name_placeholder", comment: ""), text: $familyName)
                .font(Theme.ui(16))
                .foregroundColor(Theme.ink)
                .tint(Theme.accent)
                .padding()
                .background(Theme.surfaceRaised)
                .cornerRadius(Theme.radiusMD)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )

            if let error {
                Text(error)
                    .font(Theme.ui(14))
                    .foregroundColor(Theme.error)
            }

            Button(action: handleCreate) {
                HStack {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text(NSLocalizedString("onboarding_create", comment: ""))
                            .font(Theme.ui(16, weight: .medium))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(familyName.trimmingCharacters(in: .whitespaces).isEmpty ? Theme.inkFaint : Theme.accent)
                .foregroundColor(.white)
                .cornerRadius(Theme.radiusMD)
            }
            .disabled(familyName.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)

            backButton
        }
    }

    private var joinView: some View {
        VStack(spacing: 20) {
            Text(NSLocalizedString("onboarding_enter_code", comment: ""))
                .font(Theme.ui(17, weight: .medium))
                .foregroundColor(Theme.ink)

            TextField(NSLocalizedString("onboarding_code_placeholder", comment: ""), text: $inviteCode)
                .font(Theme.ui(16))
                .foregroundColor(Theme.ink)
                .tint(Theme.accent)
                .textInputAutocapitalization(.characters)
                .padding()
                .background(Theme.surfaceRaised)
                .cornerRadius(Theme.radiusMD)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )

            if let error {
                Text(error)
                    .font(Theme.ui(14))
                    .foregroundColor(Theme.error)
            }

            Button(action: handleJoin) {
                HStack {
                    if isLoading {
                        ProgressView().tint(.white)
                    } else {
                        Text(NSLocalizedString("onboarding_join", comment: ""))
                            .font(Theme.ui(16, weight: .medium))
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 52)
                .background(inviteCode.trimmingCharacters(in: .whitespaces).isEmpty ? Theme.inkFaint : Theme.accent)
                .foregroundColor(.white)
                .cornerRadius(Theme.radiusMD)
            }
            .disabled(inviteCode.trimmingCharacters(in: .whitespaces).isEmpty || isLoading)

            backButton
        }
    }

    private var backButton: some View {
        Button(action: {
            withAnimation {
                step = .choice
                error = nil
            }
        }) {
            Text(NSLocalizedString("back", comment: ""))
                .font(Theme.ui(15))
                .foregroundColor(Theme.inkMuted)
        }
    }

    private func handleCreate() {
        let name = familyName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        isLoading = true
        error = nil
        Task {
            await appVM.createFamily(name: name)
            isLoading = false
            if appVM.errorMessage != nil {
                error = appVM.errorMessage
                appVM.errorMessage = nil
            } else {
                onComplete()
            }
        }
    }

    private func handleJoin() {
        let code = inviteCode.trimmingCharacters(in: .whitespaces)
        guard !code.isEmpty else { return }
        isLoading = true
        error = nil
        Task {
            await appVM.joinFamily(code: code)
            isLoading = false
            if appVM.errorMessage != nil {
                error = appVM.errorMessage
                appVM.errorMessage = nil
            } else {
                onComplete()
            }
        }
    }
}
