import Foundation

// MARK: - Enums

enum MealType: String, Codable, CaseIterable, Identifiable {
    case breakfast, lunch, dinner
    var id: String { rawValue }

    var label: String {
        switch self {
        case .breakfast: return NSLocalizedString("meal_breakfast", comment: "")
        case .lunch: return NSLocalizedString("meal_lunch", comment: "")
        case .dinner: return NSLocalizedString("meal_dinner", comment: "")
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
        case .spring: return NSLocalizedString("season_spring", comment: "")
        case .summer: return NSLocalizedString("season_summer", comment: "")
        case .autumn: return NSLocalizedString("season_autumn", comment: "")
        case .winter: return NSLocalizedString("season_winter", comment: "")
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

struct Produce: Codable, Hashable, Identifiable {
    let id: String
    let name: ProduceName
    let emoji: String
    let seasons: [Season]
}

// MARK: - Cuisine

struct Cuisine: Codable, Hashable, Identifiable {
    let id: String
    let name: ProduceName
    let emoji: String
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
    var type: String // "recipe_added", "calendar_update", "grocery_added"
    var message: String
    var userId: String
    var userName: String
    var timestamp: Date
}
