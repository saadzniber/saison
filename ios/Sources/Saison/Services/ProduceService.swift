import Foundation

class ProduceService: ObservableObject {

    static let catalogue: [Produce] = [
        // ── Spring ──
        Produce(id: "asparagus", name: ProduceName(en: "Asparagus", fr: "Asperge"), emoji: "🌱", type: .vegetable, seasons: [.spring]),
        Produce(id: "artichoke", name: ProduceName(en: "Artichoke", fr: "Artichaut"), emoji: "🌿", type: .vegetable, seasons: [.spring]),
        Produce(id: "pea", name: ProduceName(en: "Pea", fr: "Petit pois"), emoji: "🟢", type: .vegetable, seasons: [.spring]),
        Produce(id: "radish", name: ProduceName(en: "Radish", fr: "Radis"), emoji: "🔴", type: .vegetable, seasons: [.spring]),
        Produce(id: "spinach", name: ProduceName(en: "Spinach", fr: "Epinard"), emoji: "🥬", type: .vegetable, seasons: [.spring]),
        Produce(id: "watercress", name: ProduceName(en: "Watercress", fr: "Cresson"), emoji: "🌿", type: .vegetable, seasons: [.spring]),
        Produce(id: "rhubarb", name: ProduceName(en: "Rhubarb", fr: "Rhubarbe"), emoji: "🌱", type: .vegetable, seasons: [.spring]),
        Produce(id: "spring-onion", name: ProduceName(en: "Spring Onion", fr: "Oignon nouveau"), emoji: "🧅", type: .vegetable, seasons: [.spring]),
        Produce(id: "fava-bean", name: ProduceName(en: "Fava Bean", fr: "Feve"), emoji: "🫘", type: .legume, seasons: [.spring]),
        Produce(id: "strawberry", name: ProduceName(en: "Strawberry", fr: "Fraise"), emoji: "🍓", type: .fruit, seasons: [.spring, .summer]),
        Produce(id: "cherry", name: ProduceName(en: "Cherry", fr: "Cerise"), emoji: "🍒", type: .fruit, seasons: [.spring, .summer]),
        Produce(id: "sorrel", name: ProduceName(en: "Sorrel", fr: "Oseille"), emoji: "🍃", type: .herb, seasons: [.spring]),

        // ── Summer ──
        Produce(id: "tomato", name: ProduceName(en: "Tomato", fr: "Tomate"), emoji: "🍅", type: .vegetable, seasons: [.summer]),
        Produce(id: "zucchini", name: ProduceName(en: "Zucchini", fr: "Courgette"), emoji: "🥒", type: .vegetable, seasons: [.summer]),
        Produce(id: "eggplant", name: ProduceName(en: "Eggplant", fr: "Aubergine"), emoji: "🍆", type: .vegetable, seasons: [.summer]),
        Produce(id: "bell-pepper", name: ProduceName(en: "Bell Pepper", fr: "Poivron"), emoji: "🫑", type: .vegetable, seasons: [.summer]),
        Produce(id: "cucumber", name: ProduceName(en: "Cucumber", fr: "Concombre"), emoji: "🥒", type: .vegetable, seasons: [.summer]),
        Produce(id: "corn", name: ProduceName(en: "Corn", fr: "Mais"), emoji: "🌽", type: .grain, seasons: [.summer]),
        Produce(id: "green-bean", name: ProduceName(en: "Green Bean", fr: "Haricot vert"), emoji: "🫛", type: .vegetable, seasons: [.summer]),
        Produce(id: "fennel", name: ProduceName(en: "Fennel", fr: "Fenouil"), emoji: "🌿", type: .vegetable, seasons: [.summer, .autumn]),
        Produce(id: "peach", name: ProduceName(en: "Peach", fr: "Peche"), emoji: "🍑", type: .fruit, seasons: [.summer]),
        Produce(id: "apricot", name: ProduceName(en: "Apricot", fr: "Abricot"), emoji: "🍑", type: .fruit, seasons: [.summer]),
        Produce(id: "melon", name: ProduceName(en: "Melon", fr: "Melon"), emoji: "🍈", type: .fruit, seasons: [.summer]),
        Produce(id: "watermelon", name: ProduceName(en: "Watermelon", fr: "Pasteque"), emoji: "🍉", type: .fruit, seasons: [.summer]),
        Produce(id: "fig", name: ProduceName(en: "Fig", fr: "Figue"), emoji: "🟤", type: .fruit, seasons: [.summer, .autumn]),
        Produce(id: "raspberry", name: ProduceName(en: "Raspberry", fr: "Framboise"), emoji: "🫐", type: .fruit, seasons: [.summer]),
        Produce(id: "blueberry", name: ProduceName(en: "Blueberry", fr: "Myrtille"), emoji: "🫐", type: .fruit, seasons: [.summer]),
        Produce(id: "blackberry", name: ProduceName(en: "Blackberry", fr: "Mure"), emoji: "🫐", type: .fruit, seasons: [.summer, .autumn]),
        Produce(id: "plum", name: ProduceName(en: "Plum", fr: "Prune"), emoji: "🟣", type: .fruit, seasons: [.summer]),
        Produce(id: "nectarine", name: ProduceName(en: "Nectarine", fr: "Nectarine"), emoji: "🍑", type: .fruit, seasons: [.summer]),
        Produce(id: "basil", name: ProduceName(en: "Basil", fr: "Basilic"), emoji: "🌿", type: .herb, seasons: [.summer]),
        Produce(id: "mint", name: ProduceName(en: "Mint", fr: "Menthe"), emoji: "🌿", type: .herb, seasons: [.summer]),
        Produce(id: "cilantro", name: ProduceName(en: "Cilantro", fr: "Coriandre"), emoji: "🌿", type: .herb, seasons: [.summer]),

        // ── Autumn ──
        Produce(id: "pumpkin", name: ProduceName(en: "Pumpkin", fr: "Citrouille"), emoji: "🎃", type: .vegetable, seasons: [.autumn]),
        Produce(id: "butternut-squash", name: ProduceName(en: "Butternut Squash", fr: "Courge butternut"), emoji: "🎃", type: .vegetable, seasons: [.autumn]),
        Produce(id: "sweet-potato", name: ProduceName(en: "Sweet Potato", fr: "Patate douce"), emoji: "🍠", type: .vegetable, seasons: [.autumn, .winter]),
        Produce(id: "brussels-sprout", name: ProduceName(en: "Brussels Sprout", fr: "Chou de Bruxelles"), emoji: "🥬", type: .vegetable, seasons: [.autumn, .winter]),
        Produce(id: "cauliflower", name: ProduceName(en: "Cauliflower", fr: "Chou-fleur"), emoji: "🥦", type: .vegetable, seasons: [.autumn, .winter]),
        Produce(id: "broccoli", name: ProduceName(en: "Broccoli", fr: "Brocoli"), emoji: "🥦", type: .vegetable, seasons: [.autumn]),
        Produce(id: "celery", name: ProduceName(en: "Celery", fr: "Celeri"), emoji: "🌿", type: .vegetable, seasons: [.autumn]),
        Produce(id: "celeriac", name: ProduceName(en: "Celeriac", fr: "Celeri-rave"), emoji: "🌿", type: .vegetable, seasons: [.autumn, .winter]),
        Produce(id: "turnip", name: ProduceName(en: "Turnip", fr: "Navet"), emoji: "🥔", type: .vegetable, seasons: [.autumn, .winter]),
        Produce(id: "parsnip", name: ProduceName(en: "Parsnip", fr: "Panais"), emoji: "🥕", type: .vegetable, seasons: [.autumn, .winter]),
        Produce(id: "mushroom", name: ProduceName(en: "Mushroom", fr: "Champignon"), emoji: "🍄", type: .vegetable, seasons: [.autumn]),
        Produce(id: "apple", name: ProduceName(en: "Apple", fr: "Pomme"), emoji: "🍎", type: .fruit, seasons: [.autumn]),
        Produce(id: "pear", name: ProduceName(en: "Pear", fr: "Poire"), emoji: "🍐", type: .fruit, seasons: [.autumn]),
        Produce(id: "grape", name: ProduceName(en: "Grape", fr: "Raisin"), emoji: "🍇", type: .fruit, seasons: [.autumn]),
        Produce(id: "quince", name: ProduceName(en: "Quince", fr: "Coing"), emoji: "🍐", type: .fruit, seasons: [.autumn]),
        Produce(id: "cranberry", name: ProduceName(en: "Cranberry", fr: "Canneberge"), emoji: "🔴", type: .fruit, seasons: [.autumn]),
        Produce(id: "pomegranate", name: ProduceName(en: "Pomegranate", fr: "Grenade"), emoji: "🔴", type: .fruit, seasons: [.autumn]),
        Produce(id: "persimmon", name: ProduceName(en: "Persimmon", fr: "Kaki"), emoji: "🟠", type: .fruit, seasons: [.autumn]),
        Produce(id: "chestnut", name: ProduceName(en: "Chestnut", fr: "Chataigne"), emoji: "🌰", type: .nut, seasons: [.autumn]),
        Produce(id: "walnut", name: ProduceName(en: "Walnut", fr: "Noix"), emoji: "🥜", type: .nut, seasons: [.autumn]),
        Produce(id: "hazelnut", name: ProduceName(en: "Hazelnut", fr: "Noisette"), emoji: "🌰", type: .nut, seasons: [.autumn]),

        // ── Winter ──
        Produce(id: "orange", name: ProduceName(en: "Orange", fr: "Orange"), emoji: "🍊", type: .fruit, seasons: [.winter]),
        Produce(id: "clementine", name: ProduceName(en: "Clementine", fr: "Clementine"), emoji: "🍊", type: .fruit, seasons: [.winter]),
        Produce(id: "grapefruit", name: ProduceName(en: "Grapefruit", fr: "Pamplemousse"), emoji: "🍊", type: .fruit, seasons: [.winter]),
        Produce(id: "lemon", name: ProduceName(en: "Lemon", fr: "Citron"), emoji: "🍋", type: .fruit, seasons: [.winter, .spring]),
        Produce(id: "kiwi", name: ProduceName(en: "Kiwi", fr: "Kiwi"), emoji: "🥝", type: .fruit, seasons: [.winter]),
        Produce(id: "blood-orange", name: ProduceName(en: "Blood Orange", fr: "Orange sanguine"), emoji: "🍊", type: .fruit, seasons: [.winter]),
        Produce(id: "mandarin", name: ProduceName(en: "Mandarin", fr: "Mandarine"), emoji: "🍊", type: .fruit, seasons: [.winter]),
        Produce(id: "endive", name: ProduceName(en: "Endive", fr: "Endive"), emoji: "🥬", type: .vegetable, seasons: [.winter]),
        Produce(id: "kale", name: ProduceName(en: "Kale", fr: "Chou frise"), emoji: "🥬", type: .vegetable, seasons: [.winter]),
        Produce(id: "leek", name: ProduceName(en: "Leek", fr: "Poireau"), emoji: "🌿", type: .vegetable, seasons: [.winter]),
        Produce(id: "cabbage", name: ProduceName(en: "Cabbage", fr: "Chou"), emoji: "🥬", type: .vegetable, seasons: [.winter]),
        Produce(id: "rutabaga", name: ProduceName(en: "Rutabaga", fr: "Rutabaga"), emoji: "🥔", type: .vegetable, seasons: [.winter]),
        Produce(id: "salsify", name: ProduceName(en: "Salsify", fr: "Salsifis"), emoji: "🌿", type: .vegetable, seasons: [.winter]),
        Produce(id: "jerusalem-artichoke", name: ProduceName(en: "Jerusalem Artichoke", fr: "Topinambour"), emoji: "🥔", type: .vegetable, seasons: [.winter]),

        // ── Year-round ──
        Produce(id: "garlic", name: ProduceName(en: "Garlic", fr: "Ail"), emoji: "🧄", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "onion", name: ProduceName(en: "Onion", fr: "Oignon"), emoji: "🧅", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "potato", name: ProduceName(en: "Potato", fr: "Pomme de terre"), emoji: "🥔", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "carrot", name: ProduceName(en: "Carrot", fr: "Carotte"), emoji: "🥕", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "shallot", name: ProduceName(en: "Shallot", fr: "Echalote"), emoji: "🧅", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "lettuce", name: ProduceName(en: "Lettuce", fr: "Laitue"), emoji: "🥬", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "beetroot", name: ProduceName(en: "Beetroot", fr: "Betterave"), emoji: "🟣", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "ginger", name: ProduceName(en: "Ginger", fr: "Gingembre"), emoji: "🫚", type: .vegetable, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "avocado", name: ProduceName(en: "Avocado", fr: "Avocat"), emoji: "🥑", type: .fruit, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "banana", name: ProduceName(en: "Banana", fr: "Banane"), emoji: "🍌", type: .fruit, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "pineapple", name: ProduceName(en: "Pineapple", fr: "Ananas"), emoji: "🍍", type: .fruit, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "mango", name: ProduceName(en: "Mango", fr: "Mangue"), emoji: "🥭", type: .fruit, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "lime", name: ProduceName(en: "Lime", fr: "Citron vert"), emoji: "🍋", type: .fruit, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "parsley", name: ProduceName(en: "Parsley", fr: "Persil"), emoji: "🌿", type: .herb, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "thyme", name: ProduceName(en: "Thyme", fr: "Thym"), emoji: "🌿", type: .herb, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "rosemary", name: ProduceName(en: "Rosemary", fr: "Romarin"), emoji: "🌿", type: .herb, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "chive", name: ProduceName(en: "Chive", fr: "Ciboulette"), emoji: "🌿", type: .herb, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "lentil", name: ProduceName(en: "Lentil", fr: "Lentille"), emoji: "🫘", type: .legume, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "chickpea", name: ProduceName(en: "Chickpea", fr: "Pois chiche"), emoji: "🫘", type: .legume, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "white-bean", name: ProduceName(en: "White Bean", fr: "Haricot blanc"), emoji: "🫘", type: .legume, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "rice", name: ProduceName(en: "Rice", fr: "Riz"), emoji: "🍚", type: .grain, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "quinoa", name: ProduceName(en: "Quinoa", fr: "Quinoa"), emoji: "🌾", type: .grain, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "oat", name: ProduceName(en: "Oat", fr: "Avoine"), emoji: "🌾", type: .grain, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "almond", name: ProduceName(en: "Almond", fr: "Amande"), emoji: "🥜", type: .nut, seasons: [.spring, .summer, .autumn, .winter]),
        Produce(id: "coconut", name: ProduceName(en: "Coconut", fr: "Noix de coco"), emoji: "🥥", type: .nut, seasons: [.spring, .summer, .autumn, .winter]),
    ]

    func produceBySeason(_ season: String) -> [Produce] {
        guard let s = Season(rawValue: season) else { return [] }
        return Self.catalogue.filter { $0.seasons.contains(s) }
    }

    func produce(byId id: String) -> Produce? {
        Self.catalogue.first { $0.id == id }
    }
}
