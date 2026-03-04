import Foundation

class ProduceService: ObservableObject {

    static let catalogue: [Produce] = [
        // SPRING
        Produce(id: "asparagus", name: ProduceName(en: "Asparagus", fr: "Asperge"), emoji: "🌿", seasons: [.spring]),
        Produce(id: "peas", name: ProduceName(en: "Peas", fr: "Petits pois"), emoji: "🟢", seasons: [.spring, .summer]),
        Produce(id: "spinach", name: ProduceName(en: "Spinach", fr: "Epinards"), emoji: "🥬", seasons: [.spring, .autumn]),
        Produce(id: "radish", name: ProduceName(en: "Radish", fr: "Radis"), emoji: "🔴", seasons: [.spring, .autumn]),
        Produce(id: "lettuce", name: ProduceName(en: "Lettuce", fr: "Laitue"), emoji: "🥗", seasons: [.spring, .summer, .autumn]),
        Produce(id: "rhubarb", name: ProduceName(en: "Rhubarb", fr: "Rhubarbe"), emoji: "🌱", seasons: [.spring]),
        Produce(id: "artichoke", name: ProduceName(en: "Artichoke", fr: "Artichaut"), emoji: "🌿", seasons: [.spring, .summer]),
        Produce(id: "mint", name: ProduceName(en: "Mint", fr: "Menthe"), emoji: "🌿", seasons: [.spring, .summer, .autumn]),
        Produce(id: "chives", name: ProduceName(en: "Chives", fr: "Ciboulette"), emoji: "🌱", seasons: [.spring, .summer]),
        Produce(id: "new-potato", name: ProduceName(en: "New Potato", fr: "Pomme de terre nouvelle"), emoji: "🥔", seasons: [.spring, .summer]),

        // SUMMER
        Produce(id: "tomato", name: ProduceName(en: "Tomato", fr: "Tomate"), emoji: "🍅", seasons: [.summer]),
        Produce(id: "zucchini", name: ProduceName(en: "Zucchini", fr: "Courgette"), emoji: "🥒", seasons: [.summer]),
        Produce(id: "cucumber", name: ProduceName(en: "Cucumber", fr: "Concombre"), emoji: "🥒", seasons: [.summer]),
        Produce(id: "eggplant", name: ProduceName(en: "Eggplant", fr: "Aubergine"), emoji: "🍆", seasons: [.summer]),
        Produce(id: "bell-pepper", name: ProduceName(en: "Bell Pepper", fr: "Poivron"), emoji: "🫑", seasons: [.summer, .autumn]),
        Produce(id: "corn", name: ProduceName(en: "Corn", fr: "Mais"), emoji: "🌽", seasons: [.summer]),
        Produce(id: "green-bean", name: ProduceName(en: "Green Bean", fr: "Haricot vert"), emoji: "🌿", seasons: [.summer]),
        Produce(id: "basil", name: ProduceName(en: "Basil", fr: "Basilic"), emoji: "🌿", seasons: [.summer]),
        Produce(id: "strawberry", name: ProduceName(en: "Strawberry", fr: "Fraise"), emoji: "🍓", seasons: [.spring, .summer]),
        Produce(id: "blueberry", name: ProduceName(en: "Blueberry", fr: "Myrtille"), emoji: "🫐", seasons: [.summer]),
        Produce(id: "peach", name: ProduceName(en: "Peach", fr: "Peche"), emoji: "🍑", seasons: [.summer]),
        Produce(id: "melon", name: ProduceName(en: "Melon", fr: "Melon"), emoji: "🍈", seasons: [.summer]),
        Produce(id: "watermelon", name: ProduceName(en: "Watermelon", fr: "Pasteque"), emoji: "🍉", seasons: [.summer]),
        Produce(id: "cherry", name: ProduceName(en: "Cherry", fr: "Cerise"), emoji: "🍒", seasons: [.summer]),
        Produce(id: "apricot", name: ProduceName(en: "Apricot", fr: "Abricot"), emoji: "🍊", seasons: [.summer]),

        // AUTUMN
        Produce(id: "pumpkin", name: ProduceName(en: "Pumpkin", fr: "Citrouille"), emoji: "🎃", seasons: [.autumn]),
        Produce(id: "butternut", name: ProduceName(en: "Butternut Squash", fr: "Courge butternut"), emoji: "🥕", seasons: [.autumn, .winter]),
        Produce(id: "apple", name: ProduceName(en: "Apple", fr: "Pomme"), emoji: "🍎", seasons: [.autumn, .winter]),
        Produce(id: "pear", name: ProduceName(en: "Pear", fr: "Poire"), emoji: "🍐", seasons: [.autumn, .winter]),
        Produce(id: "grape", name: ProduceName(en: "Grape", fr: "Raisin"), emoji: "🍇", seasons: [.autumn]),
        Produce(id: "fig", name: ProduceName(en: "Fig", fr: "Figue"), emoji: "🫐", seasons: [.autumn]),
        Produce(id: "mushroom", name: ProduceName(en: "Mushroom", fr: "Champignon"), emoji: "🍄", seasons: [.autumn]),
        Produce(id: "broccoli", name: ProduceName(en: "Broccoli", fr: "Brocoli"), emoji: "🥦", seasons: [.autumn, .winter]),
        Produce(id: "cauliflower", name: ProduceName(en: "Cauliflower", fr: "Chou-fleur"), emoji: "🥦", seasons: [.autumn, .winter]),
        Produce(id: "cabbage", name: ProduceName(en: "Cabbage", fr: "Chou"), emoji: "🥬", seasons: [.autumn, .winter]),

        // WINTER
        Produce(id: "carrot", name: ProduceName(en: "Carrot", fr: "Carotte"), emoji: "🥕", seasons: [.autumn, .winter]),
        Produce(id: "parsnip", name: ProduceName(en: "Parsnip", fr: "Panais"), emoji: "🌿", seasons: [.winter]),
        Produce(id: "leek", name: ProduceName(en: "Leek", fr: "Poireau"), emoji: "🌿", seasons: [.autumn, .winter]),
        Produce(id: "celeriac", name: ProduceName(en: "Celeriac", fr: "Celeri-rave"), emoji: "🥬", seasons: [.autumn, .winter]),
        Produce(id: "beet", name: ProduceName(en: "Beetroot", fr: "Betterave"), emoji: "🟣", seasons: [.autumn, .winter]),
        Produce(id: "turnip", name: ProduceName(en: "Turnip", fr: "Navet"), emoji: "🌿", seasons: [.winter]),
        Produce(id: "kale", name: ProduceName(en: "Kale", fr: "Chou frise"), emoji: "🥬", seasons: [.autumn, .winter]),
        Produce(id: "brussels-sprout", name: ProduceName(en: "Brussels Sprout", fr: "Chou de Bruxelles"), emoji: "🥦", seasons: [.autumn, .winter]),
        Produce(id: "orange", name: ProduceName(en: "Orange", fr: "Orange"), emoji: "🍊", seasons: [.winter]),
        Produce(id: "clementine", name: ProduceName(en: "Clementine", fr: "Clementine"), emoji: "🍊", seasons: [.winter]),
        Produce(id: "pomelo", name: ProduceName(en: "Pomelo", fr: "Pomelo"), emoji: "🍋", seasons: [.winter]),
        Produce(id: "endive", name: ProduceName(en: "Endive", fr: "Endive"), emoji: "🥬", seasons: [.winter]),
        Produce(id: "onion", name: ProduceName(en: "Onion", fr: "Oignon"), emoji: "🧅", seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "garlic", name: ProduceName(en: "Garlic", fr: "Ail"), emoji: "🧄", seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "potato", name: ProduceName(en: "Potato", fr: "Pomme de terre"), emoji: "🥔", seasons: [.summer, .autumn, .winter]),
        Produce(id: "thyme", name: ProduceName(en: "Thyme", fr: "Thym"), emoji: "🌿", seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "rosemary", name: ProduceName(en: "Rosemary", fr: "Romarin"), emoji: "🌿", seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "parsley", name: ProduceName(en: "Parsley", fr: "Persil"), emoji: "🌿", seasons: [.spring, .summer, .autumn, .winter])
    ]

    func produceBySeason(_ season: String) -> [Produce] {
        guard let s = Season(rawValue: season) else { return [] }
        return Self.catalogue.filter { $0.seasons.contains(s) }
    }

    func produce(byId id: String) -> Produce? {
        Self.catalogue.first { $0.id == id }
    }
}
