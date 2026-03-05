import Foundation

// MARK: - Enums

enum MealType: String, Codable, CaseIterable, Identifiable {
    case breakfast, lunch, dinner
    var id: String { rawValue }

    var label: String {
        switch self {
        case .breakfast: return LocalizationManager.shared.t("meal_breakfast")
        case .lunch: return LocalizationManager.shared.t("meal_lunch")
        case .dinner: return LocalizationManager.shared.t("meal_dinner")
        }
    }

    var short: String {
        switch self {
        case .breakfast: return "B"
        case .lunch: return "L"
        case .dinner: return "D"
        }
    }
}

enum Season: String, Codable, CaseIterable, Identifiable {
    case spring, summer, autumn, winter
    var id: String { rawValue }

    var label: String {
        switch self {
        case .spring: return LocalizationManager.shared.t("season_spring")
        case .summer: return LocalizationManager.shared.t("season_summer")
        case .autumn: return LocalizationManager.shared.t("season_autumn")
        case .winter: return LocalizationManager.shared.t("season_winter")
        }
    }

    var emoji: String {
        switch self {
        case .spring: return "🌱"
        case .summer: return "☀️"
        case .autumn: return "🍂"
        case .winter: return "❄️"
        }
    }

    static var current: Season {
        let month = Calendar.current.component(.month, from: Date())
        switch month {
        case 3...5: return .spring
        case 6...8: return .summer
        case 9...11: return .autumn
        default: return .winter
        }
    }
}

// MARK: - ProduceName

struct ProduceName: Codable, Hashable {
    let en: String
    let fr: String

    func localized() -> String {
        Locale.current.language.languageCode?.identifier == "fr" ? fr : en
    }
}

// MARK: - Produce

enum ProduceType: String, Codable, CaseIterable {
    case vegetable, fruit, herb, grain, legume, nut

    var label: String {
        switch self {
        case .vegetable: return LocalizationManager.shared.t("produce_vegetable")
        case .fruit: return LocalizationManager.shared.t("produce_fruit")
        case .herb: return LocalizationManager.shared.t("produce_herb")
        case .grain: return LocalizationManager.shared.t("produce_grain")
        case .legume: return LocalizationManager.shared.t("produce_legume")
        case .nut: return LocalizationManager.shared.t("produce_nut")
        }
    }
}

struct Produce: Codable, Hashable, Identifiable {
    let id: String
    let name: ProduceName
    let emoji: String
    let type: ProduceType
    let seasons: [Season]
}

// MARK: - Cuisine

struct Cuisine: Codable, Hashable, Identifiable {
    let id: String
    let name: ProduceName
    let emoji: String
}

// MARK: - CuisineOption

struct CuisineOption: Identifiable {
    let id: String
    let emoji: String
    let en: String
    let fr: String

    var label: String {
        Locale.current.language.languageCode?.identifier == "fr" ? fr : en
    }

    static let all: [CuisineOption] = [
        CuisineOption(id: "french", emoji: "🇫🇷", en: "French", fr: "Française"),
        CuisineOption(id: "italian", emoji: "🇮🇹", en: "Italian", fr: "Italienne"),
        CuisineOption(id: "japanese", emoji: "🇯🇵", en: "Japanese", fr: "Japonaise"),
        CuisineOption(id: "chinese", emoji: "🇨🇳", en: "Chinese", fr: "Chinoise"),
        CuisineOption(id: "indian", emoji: "🇮🇳", en: "Indian", fr: "Indienne"),
        CuisineOption(id: "mexican", emoji: "🇲🇽", en: "Mexican", fr: "Mexicaine"),
        CuisineOption(id: "mediterranean", emoji: "🫒", en: "Mediterranean", fr: "Méditerranéenne"),
        CuisineOption(id: "middle-eastern", emoji: "🧆", en: "Middle Eastern", fr: "Moyen-orientale"),
        CuisineOption(id: "american", emoji: "🇺🇸", en: "American", fr: "Américaine"),
        CuisineOption(id: "thai", emoji: "🇹🇭", en: "Thai", fr: "Thaïlandaise"),
        CuisineOption(id: "greek", emoji: "🇬🇷", en: "Greek", fr: "Grecque"),
        CuisineOption(id: "moroccan", emoji: "🇲🇦", en: "Moroccan", fr: "Marocaine"),
        CuisineOption(id: "lebanese", emoji: "🇱🇧", en: "Lebanese", fr: "Libanaise"),
        CuisineOption(id: "spanish", emoji: "🇪🇸", en: "Spanish", fr: "Espagnole"),
        CuisineOption(id: "vietnamese", emoji: "🇻🇳", en: "Vietnamese", fr: "Vietnamienne"),
        CuisineOption(id: "korean", emoji: "🇰🇷", en: "Korean", fr: "Coréenne"),
        CuisineOption(id: "british", emoji: "🇬🇧", en: "British", fr: "Britannique"),
        CuisineOption(id: "nordic", emoji: "🇸🇪", en: "Nordic", fr: "Nordique"),
        CuisineOption(id: "asian", emoji: "🥢", en: "Asian", fr: "Asiatique"),
    ]
}

// MARK: - Ingredient

struct Ingredient: Codable, Hashable, Identifiable {
    var id: String { "\(name)-\(quantity)" }
    let name: String
    let quantity: String
    let unit: String
    let isProduce: Bool

    enum CodingKeys: String, CodingKey {
        case name, quantity, unit, isProduce
    }
}

// MARK: - User

struct User: Codable, Identifiable {
    let id: String
    var displayName: String
    var email: String
    var photoURL: String?
    var familyId: String?
    var language: String
    var createdAt: Date
}

// MARK: - Family

struct Family: Codable, Identifiable {
    let id: String
    var name: String
    var memberIds: [String]
    var inviteCode: String
    var createdAt: Date
}

// MARK: - Recipe

struct Recipe: Codable, Identifiable, Hashable {
    let id: String
    var title: String
    var description: String
    var ingredients: [Ingredient]
    var instructions: [String]
    var servings: Int
    var prepMinutes: Int
    var cookMinutes: Int
    var cuisineId: String
    var seasons: [Season]
    var produce: [String]
    var mealTypes: [MealType]
    var creatorId: String
    var familyId: String
    var isPublic: Bool
    var starredBy: [String]
    var ratings: [String: Int]
    var imageURL: String?
    var createdAt: Date

    var averageRating: Double {
        guard !ratings.isEmpty else { return 0 }
        return Double(ratings.values.reduce(0, +)) / Double(ratings.count)
    }

    static func == (lhs: Recipe, rhs: Recipe) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - CalendarEntry

struct CalendarEntry: Codable, Identifiable, Hashable {
    let id: String
    var date: String // "YYYY-MM-DD"
    var mealType: MealType
    var recipeId: String
    var recipeTitle: String
    var familyId: String
    var addedBy: String
    var createdAt: Date

    static func == (lhs: CalendarEntry, rhs: CalendarEntry) -> Bool { lhs.id == rhs.id }
    func hash(into hasher: inout Hasher) { hasher.combine(id) }
}

// MARK: - GroceryItem

struct GroceryItem: Codable, Identifiable {
    let id: String
    var name: String
    var quantity: String
    var unit: String
    var isChecked: Bool
    var familyId: String
    var addedBy: String
    var addedByName: String
    var createdAt: Date
}

// MARK: - WeeklyDiversity

struct WeeklyDiversity: Codable {
    var weekStart: String
    var uniquePlants: [String]
    var count: Int
    var goal: Int
}

// MARK: - ActivityItem

struct ActivityItem: Codable, Identifiable {
    let id: String
    var type: String // "recipe_created", "calendar_added", "grocery_added"
    var payload: [String: String]
    var userId: String
    var userName: String
    var timestamp: Date

    /// Construct a localized display message from type + payload
    var message: String {
        let loc = LocalizationManager.shared
        switch type {
        case "recipe_created":
            return String(format: loc.t("activity_recipe_created"), payload["recipeName"] ?? "")
        case "recipe_saved":
            return String(format: loc.t("activity_recipe_saved"), payload["recipeName"] ?? "")
        case "calendar_added":
            let meal = payload["mealType"] ?? ""
            let recipe = payload["recipeName"] ?? ""
            return String(format: loc.t("activity_calendar_added"), meal, recipe)
        case "grocery_added":
            return loc.t("activity_grocery_added")
        case "member_joined":
            return loc.t("activity_member_joined")
        default:
            return ""
        }
    }
}
