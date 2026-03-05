import SwiftUI

struct CalendarView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    @State private var weekOffset = 0
    @State private var showRecipePicker = false
    @State private var selectedDate = ""
    @State private var selectedMealType: MealType = .dinner
    @State private var tappedEntry: CalendarEntry?
    @State private var navigateToRecipe: Recipe?

    private var weekDates: [Date] {
        var cal = Calendar.current
        cal.firstWeekday = 2 // Monday
        let today = Date()
        guard let weekStart = cal.date(from: cal.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else { return [] }
        guard let offsetStart = cal.date(byAdding: .weekOfYear, value: weekOffset, to: weekStart) else { return [] }
        return (0..<7).compactMap { cal.date(byAdding: .day, value: $0, to: offsetStart) }
    }

    private let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private var dayFormatter: DateFormatter {
        let f = DateFormatter()
        f.locale = Locale(identifier: loc.language)
        f.dateFormat = "EEE"
        return f
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                weekNavigation

                ScrollView {
                    VStack(spacing: 2) {
                        headerRow
                        ForEach(weekDates, id: \.self) { date in
                            dayRow(date: date)
                        }
                    }
                    .padding(.horizontal, Theme.pagePadding)
                    .padding(.top, 8)
                    .padding(.bottom, 100)
                }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(loc.t("tab_calendar"))
            .refreshable {
                await appVM.refreshAll()
            }
            .sheet(isPresented: $showRecipePicker) {
                recipePickerSheet
            }
            .confirmationDialog(
                tappedEntry?.recipeTitle ?? "",
                isPresented: Binding(
                    get: { tappedEntry != nil },
                    set: { if !$0 { tappedEntry = nil } }
                ),
                titleVisibility: .visible
            ) {
                if let entry = tappedEntry {
                    Button(loc.t("calendar_view_recipe")) {
                        if let recipe = appVM.recipes.first(where: { $0.id == entry.recipeId })
                            ?? appVM.communityRecipes.first(where: { $0.id == entry.recipeId }) {
                            navigateToRecipe = recipe
                        }
                        tappedEntry = nil
                    }
                    Button(loc.t("calendar_remove"), role: .destructive) {
                        Task { await appVM.removeCalendarEntry(entry) }
                        tappedEntry = nil
                    }
                    Button(loc.t("cancel"), role: .cancel) {
                        tappedEntry = nil
                    }
                }
            }
            .navigationDestination(item: $navigateToRecipe) { recipe in
                RecipeDetailView(recipe: recipe)
            }
        }
    }

    // MARK: - Week Navigation

    private var weekNavigation: some View {
        HStack {
            Button(action: { weekOffset -= 1 }) {
                Image(systemName: "chevron.left")
                    .foregroundColor(Theme.ink)
            }
            Spacer()
            Text(weekLabel)
                .font(Theme.ui(15, weight: .medium))
                .foregroundColor(Theme.ink)
            Spacer()
            Button(action: { weekOffset += 1 }) {
                Image(systemName: "chevron.right")
                    .foregroundColor(Theme.ink)
            }
        }
        .padding(.horizontal, Theme.pagePadding)
        .padding(.vertical, 12)
        .background(Theme.surface)
    }

    private var weekLabel: String {
        guard let first = weekDates.first, let last = weekDates.last else { return "" }
        let fmt = DateFormatter()
        fmt.dateFormat = "MMM d"
        return "\(fmt.string(from: first)) - \(fmt.string(from: last))"
    }

    // MARK: - Grid

    private var headerRow: some View {
        HStack(spacing: 2) {
            Text("")
                .frame(width: 50)
            ForEach(MealType.allCases) { mt in
                Text(mt.short)
                    .font(Theme.ui(12, weight: .semibold))
                    .foregroundColor(Theme.inkMuted)
                    .frame(maxWidth: .infinity)
            }
        }
        .padding(.vertical, 8)
    }

    private func dayRow(date: Date) -> some View {
        let dateStr = dateFormatter.string(from: date)
        let isToday = Calendar.current.isDateInToday(date)
        let dayNum = Calendar.current.component(.day, from: date)

        return HStack(spacing: 2) {
            VStack(spacing: 2) {
                Text(DateFormatting.calendarDayLabel(from: date))
                    .font(Theme.ui(11, weight: isToday ? .bold : .medium))
                    .foregroundColor(isToday ? Theme.accent : Theme.inkMuted)
                if !isToday {
                    Text("\(dayNum)")
                        .font(Theme.ui(14, weight: .regular))
                        .foregroundColor(Theme.ink)
                }
            }
            .frame(width: 50)

            ForEach(MealType.allCases) { mealType in
                let entry = appVM.calendarEntries.first { $0.date == dateStr && $0.mealType == mealType }
                cellView(entry: entry, dateStr: dateStr, mealType: mealType)
            }
        }
        .padding(.vertical, 4)
    }

    private func cellView(entry: CalendarEntry?, dateStr: String, mealType: MealType) -> some View {
        Group {
            if let entry {
                Button(action: { tappedEntry = entry }) {
                    Text(entry.recipeTitle)
                        .font(Theme.ui(11))
                        .foregroundColor(Theme.ink)
                        .lineLimit(2)
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .padding(4)
                        .background(Theme.accentBg)
                        .cornerRadius(6)
                }
            } else {
                Button(action: {
                    selectedDate = dateStr
                    selectedMealType = mealType
                    showRecipePicker = true
                }) {
                    Image(systemName: "plus")
                        .font(.system(size: 12))
                        .foregroundColor(Theme.inkFaint)
                        .frame(maxWidth: .infinity, minHeight: 44)
                        .background(Theme.surfaceRaised)
                        .cornerRadius(6)
                }
            }
        }
    }

    // MARK: - Recipe Picker Sheet

    /// Build a map of recipeId -> most recent date string from calendar entries
    private var lastCookedMap: [String: String] {
        var map: [String: String] = [:]
        for entry in appVM.calendarEntries {
            if let existing = map[entry.recipeId] {
                if entry.date > existing { map[entry.recipeId] = entry.date }
            } else {
                map[entry.recipeId] = entry.date
            }
        }
        return map
    }

    private var recipePickerSheet: some View {
        RecipePickerSheetView(
            familyRecipes: appVM.recipes,
            starredRecipes: appVM.starredRecipes,
            communityRecipes: appVM.communityRecipes,
            lastCookedMap: lastCookedMap,
            onPick: { recipe in
                Task {
                    await appVM.addToCalendar(
                        recipeId: recipe.id,
                        recipeTitle: recipe.title,
                        date: selectedDate,
                        mealType: selectedMealType
                    )
                    showRecipePicker = false
                }
            },
            onCancel: { showRecipePicker = false }
        )
    }
}

// MARK: - Recipe Picker Sheet View

private struct RecipePickerSheetView: View {
    @EnvironmentObject var loc: LocalizationManager
    let familyRecipes: [Recipe]
    let starredRecipes: [Recipe]
    let communityRecipes: [Recipe]
    let lastCookedMap: [String: String]
    let onPick: (Recipe) -> Void
    let onCancel: () -> Void
    @State private var selectedTab = 0
    @State private var search = ""

    private var currentRecipes: [Recipe] {
        switch selectedTab {
        case 0: return familyRecipes
        case 1: return starredRecipes
        default: return communityRecipes
        }
    }

    private var filtered: [Recipe] {
        let source = currentRecipes
        if search.trimmingCharacters(in: .whitespaces).isEmpty {
            return source
        }
        let query = search.lowercased()
        return source.filter { $0.title.lowercased().contains(query) }
    }

    private static let shortDateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "MMM d"
        return f
    }()

    private static let parseDateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    private func lastCookedLabel(for recipeId: String) -> String {
        if let dateStr = lastCookedMap[recipeId],
           let date = Self.parseDateFormatter.date(from: dateStr) {
            let formatted = Self.shortDateFormatter.string(from: date)
            return String(format: loc.t("calendar_last_cooked"), formatted)
        }
        return loc.t("calendar_never_cooked")
    }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("", selection: $selectedTab) {
                    Text(loc.t("recipes_family")).tag(0)
                    Text(loc.t("recipes_starred")).tag(1)
                    Text(loc.t("recipes_community")).tag(2)
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.top, 8)

                List {
                    ForEach(filtered) { recipe in
                        Button(action: { onPick(recipe) }) {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(recipe.title)
                                    .font(Theme.ui(15, weight: .medium))
                                    .foregroundColor(Theme.ink)
                                Text(lastCookedLabel(for: recipe.id))
                                    .font(Theme.ui(12))
                                    .foregroundColor(Theme.inkFaint)
                            }
                        }
                    }
                }
                .listStyle(.plain)
            }
            .searchable(text: $search, prompt: Text(loc.t("recipes_search")))
            .navigationTitle(loc.t("calendar_pick_recipe"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(loc.t("cancel")) {
                        onCancel()
                    }
                }
            }
        }
    }
}
