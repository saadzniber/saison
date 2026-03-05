import SwiftUI

/// Manages in-app language switching independently of the device locale.
/// Stores the preferred language in UserDefaults and provides a localized bundle.
final class LocalizationManager: ObservableObject {
    static let shared = LocalizationManager()

    @AppStorage("appLanguage") var language: String = Locale.current.language.languageCode?.identifier ?? "en" {
        didSet { updateBundle() }
    }

    @Published private(set) var bundle: Bundle = .main

    private init() {
        updateBundle()
    }

    private func updateBundle() {
        if let path = Bundle.main.path(forResource: language, ofType: "lproj"),
           let langBundle = Bundle(path: path) {
            bundle = langBundle
        } else {
            bundle = .main
        }
    }

    /// Localize a key using the current in-app language.
    func t(_ key: String) -> String {
        bundle.localizedString(forKey: key, value: nil, table: nil)
    }

    /// Localize with a format argument (e.g. "time_minutes_ago" with %d).
    func t(_ key: String, _ args: CVarArg...) -> String {
        let format = bundle.localizedString(forKey: key, value: nil, table: nil)
        return String(format: format, arguments: args)
    }
}

// MARK: - SwiftUI Environment

private struct LocalizationManagerKey: EnvironmentKey {
    static let defaultValue = LocalizationManager.shared
}

extension EnvironmentValues {
    var loc: LocalizationManager {
        get { self[LocalizationManagerKey.self] }
        set { self[LocalizationManagerKey.self] = newValue }
    }
}
