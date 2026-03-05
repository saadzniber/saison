import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    @State private var showDeleteConfirmation = false
    @State private var editedName = ""
    @State private var isSavingName = false

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
        .navigationTitle(loc.t("settings_title"))
        .alert(loc.t("settings_delete_confirm"), isPresented: $showDeleteConfirmation) {
            Button(loc.t("cancel"), role: .cancel) {}
            Button(loc.t("settings_delete"), role: .destructive) {
                Task { await appVM.deleteAccount() }
            }
        }
    }

    // MARK: - Profile

    private var profileSection: some View {
        Section(header: Text(loc.t("settings_profile")).foregroundColor(Theme.inkMuted)) {
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
            .listRowBackground(Theme.surface)

            HStack {
                TextField(loc.t("settings_display_name"), text: $editedName)
                    .font(Theme.ui(15))
                    .foregroundColor(Theme.ink)
                    .onAppear {
                        editedName = appVM.user?.displayName ?? ""
                    }

                Button(action: {
                    let trimmed = editedName.trimmingCharacters(in: .whitespaces)
                    guard !trimmed.isEmpty, trimmed != appVM.user?.displayName else { return }
                    isSavingName = true
                    Task {
                        await appVM.updateDisplayName(trimmed)
                        isSavingName = false
                    }
                }) {
                    if isSavingName {
                        ProgressView()
                            .frame(width: 16, height: 16)
                    } else {
                        Text(loc.t("save"))
                            .font(Theme.ui(14, weight: .semibold))
                            .foregroundColor(Theme.accent)
                    }
                }
                .disabled(editedName.trimmingCharacters(in: .whitespaces).isEmpty || editedName.trimmingCharacters(in: .whitespaces) == appVM.user?.displayName || isSavingName)
            }
            .listRowBackground(Theme.surface)
        }
    }

    // MARK: - Family

    private var familySection: some View {
        Section(header: Text(loc.t("settings_family")).foregroundColor(Theme.inkMuted)) {
            if let family = appVM.family {
                HStack {
                    Text(loc.t("settings_family_name"))
                        .foregroundColor(Theme.ink)
                    Spacer()
                    Text(family.name)
                        .foregroundColor(Theme.inkMuted)
                }
                HStack {
                    Text(loc.t("settings_members"))
                        .foregroundColor(Theme.ink)
                    Spacer()
                    Text("\(family.memberIds.count)")
                        .foregroundColor(Theme.inkMuted)
                }
                HStack {
                    Text(loc.t("settings_invite_code"))
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
                Text(loc.t("settings_no_family"))
                    .foregroundColor(Theme.inkMuted)
            }
        }
        .listRowBackground(Theme.surface)
    }

    // MARK: - Language

    private var languageSection: some View {
        Section(header: Text(loc.t("settings_language")).foregroundColor(Theme.inkMuted)) {
            Picker(loc.t("settings_language"), selection: $loc.language) {
                Text(loc.t("lang_english")).tag("en")
                Text(loc.t("lang_french")).tag("fr")
            }
            .pickerStyle(.segmented)
        }
        .listRowBackground(Theme.surface)
    }

    // MARK: - Account

    private var accountSection: some View {
        Section {
            Button(action: { appVM.signOut() }) {
                HStack {
                    Image(systemName: "rectangle.portrait.and.arrow.right")
                    Text(loc.t("settings_sign_out"))
                }
                .foregroundColor(Theme.ink)
            }

            Button(action: { showDeleteConfirmation = true }) {
                HStack {
                    Image(systemName: "trash")
                    Text(loc.t("settings_delete_account"))
                }
                .foregroundColor(Theme.error)
            }
        }
        .listRowBackground(Theme.surface)
    }
}
