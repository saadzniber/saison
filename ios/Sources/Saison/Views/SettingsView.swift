import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appVM: AppViewModel
    @AppStorage("appLanguage") private var appLanguage = "en"
    @State private var showDeleteConfirmation = false

    var body: some View {
        List {
            profileSection
            familySection
            languageSection
            accountSection
        }
        .listStyle(.insetGrouped)
        .scrollContentBackground(.hidden)
        .background(Theme.bg.ignoresSafeArea())
        .navigationTitle(NSLocalizedString("settings_title", comment: ""))
        .alert(NSLocalizedString("settings_delete_confirm", comment: ""), isPresented: $showDeleteConfirmation) {
            Button(NSLocalizedString("cancel", comment: ""), role: .cancel) {}
            Button(NSLocalizedString("settings_delete", comment: ""), role: .destructive) {
                Task { await appVM.deleteAccount() }
            }
        }
    }

    // MARK: - Profile

    private var profileSection: some View {
        Section(header: Text(NSLocalizedString("settings_profile", comment: ""))) {
            HStack(spacing: 12) {
                Circle()
                    .fill(Theme.accentBg)
                    .frame(width: 48, height: 48)
                    .overlay(
                        Text(String(appVM.user?.displayName.prefix(1) ?? "?"))
                            .font(Theme.display(20, weight: .semibold))
                            .foregroundColor(Theme.accent)
                    )
                VStack(alignment: .leading, spacing: 2) {
                    Text(appVM.user?.displayName ?? "")
                        .font(Theme.ui(16, weight: .medium))
                        .foregroundColor(Theme.ink)
                    Text(appVM.user?.email ?? "")
                        .font(Theme.ui(13))
                        .foregroundColor(Theme.inkMuted)
                }
            }
            .padding(.vertical, 4)
        }
    }

    // MARK: - Family

    private var familySection: some View {
        Section(header: Text(NSLocalizedString("settings_family", comment: ""))) {
            if let family = appVM.family {
                HStack {
                    Text(NSLocalizedString("settings_family_name", comment: ""))
                        .foregroundColor(Theme.ink)
                    Spacer()
                    Text(family.name)
                        .foregroundColor(Theme.inkMuted)
                }
                HStack {
                    Text(NSLocalizedString("settings_members", comment: ""))
                        .foregroundColor(Theme.ink)
                    Spacer()
                    Text("\(family.memberIds.count)")
                        .foregroundColor(Theme.inkMuted)
                }
                HStack {
                    Text(NSLocalizedString("settings_invite_code", comment: ""))
                        .foregroundColor(Theme.ink)
                    Spacer()
                    Text(family.inviteCode)
                        .font(Theme.ui(15, weight: .semibold))
                        .foregroundColor(Theme.accent)
                    Button(action: {
                        UIPasteboard.general.string = family.inviteCode
                    }) {
                        Image(systemName: "doc.on.doc")
                            .font(.system(size: 14))
                            .foregroundColor(Theme.inkMuted)
                    }
                }
            } else {
                Text(NSLocalizedString("settings_no_family", comment: ""))
                    .foregroundColor(Theme.inkMuted)
            }
        }
    }

    // MARK: - Language

    private var languageSection: some View {
        Section(header: Text(NSLocalizedString("settings_language", comment: ""))) {
            Picker(NSLocalizedString("settings_language", comment: ""), selection: $appLanguage) {
                Text("English").tag("en")
                Text("Francais").tag("fr")
            }
            .pickerStyle(.segmented)
        }
    }

    // MARK: - Account

    private var accountSection: some View {
        Section {
            Button(action: { appVM.signOut() }) {
                HStack {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                    Text(NSLocalizedString("settings_sign_out", comment: ""))
                }
                .foregroundColor(Theme.ink)
            }

            Button(action: { showDeleteConfirmation = true }) {
                HStack {
                    Image(systemName: "trash")
                    Text(NSLocalizedString("settings_delete_account", comment: ""))
                }
                .foregroundColor(Theme.error)
            }
        }
    }
}
