import SwiftUI

struct CalendarView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var weekOffset = 0
    @State private var showRecipePicker = false
    @State private var selectedDate = ""
    @State private var selectedMealType: MealType = .dinner

    private var weekDates: [Date] {
        let cal = Calendar.current
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

    private let dayFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "EEE"
        return f
    }()

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
            .navigationTitle(NSLocalizedString("tab_calendar", comment: ""))
            .sheet(isPresented: $showRecipePicker) {
                recipePickerSheet
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
                Text(dayFormatter.string(from: date))
                    .font(Theme.ui(11))
                    .foregroundColor(Theme.inkMuted)
                Text("\(dayNum)")
                    .font(Theme.ui(14, weight: isToday ? .bold : .regular))
                    .foregroundColor(isToday ? Theme.accent : Theme.ink)
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
                NavigationLink(destination: recipeDetailForEntry(entry)) {
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

    @ViewBuilder
    private func recipeDetailForEntry(_ entry: CalendarEntry) -> some View {
        if let recipe = appVM.recipes.first(where: { $0.id == entry.recipeId }) {
            RecipeDetailView(recipe: recipe)
        } else {
            Text(entry.recipeTitle)
                .padding()
        }
    }

    // MARK: - Recipe Picker Sheet

    private var recipePickerSheet: some View {
        NavigationStack {
            List {
                ForEach(appVM.recipes) { recipe in
                    Button(action: {
                        Task {
                            await appVM.addToCalendar(
                                recipeId: recipe.id,
                                recipeTitle: recipe.title,
                                date: selectedDate,
                                mealType: selectedMealType
                            )
                            showRecipePicker = false
                        }
                    }) {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(recipe.title)
                                .font(Theme.ui(15, weight: .medium))
                                .foregroundColor(Theme.ink)
                            Text(recipe.description)
                                .font(Theme.ui(13))
                                .foregroundColor(Theme.inkMuted)
                                .lineLimit(1)
                        }
                    }
                }
            }
            .listStyle(.plain)
            .navigationTitle(NSLocalizedString("calendar_pick_recipe", comment: ""))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button(NSLocalizedString("cancel", comment: "")) {
                        showRecipePicker = false
                    }
                }
            }
        }
    }
}
