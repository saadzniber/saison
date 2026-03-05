import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    @State private var showDiversityInfo = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    greetingSection
                    todaysMealsSection
                    diversitySection
                    tomorrowSection
                    activitySection
                }
                .padding(.horizontal, Theme.pagePadding)
                .padding(.top, 8)
                .padding(.bottom, 100)
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle("")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    NavigationLink(destination: SettingsView()) {
                        Image(systemName: "gearshape")
                            .foregroundColor(Theme.inkMuted)
                    }
                }
            }
            .refreshable {
                await appVM.refreshAll()
            }
            .sheet(isPresented: $showDiversityInfo) {
                diversityInfoSheet
            }
        }
    }

    // MARK: - Greeting

    private var greetingSection: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("\(greeting), \(firstName)")
                .font(Theme.display(28, weight: .regular))
                .foregroundColor(Theme.ink)

            HStack(spacing: 8) {
                Text(formattedDate)
                    .font(Theme.ui(14))
                    .foregroundColor(Theme.inkMuted)

                Text("\(currentSeason.emoji) \(currentSeason.label)")
                    .font(Theme.ui(11, weight: .medium))
                    .foregroundColor(Theme.accent)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 2)
                    .background(Theme.accentBg)
                    .cornerRadius(999)
            }
        }
    }

    private var firstName: String {
        appVM.user?.displayName.components(separatedBy: " ").first ?? ""
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:
            return loc.t("greeting_morning")
        case 12..<17:
            return loc.t("greeting_afternoon")
        default:
            return loc.t("greeting_evening")
        }
    }

    private var formattedDate: String {
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: loc.language == "fr" ? "fr_FR" : "en_US")
        fmt.dateFormat = "EEEE, MMMM d"
        return fmt.string(from: Date())
    }

    private var currentSeason: (emoji: String, label: String) {
        let month = Calendar.current.component(.month, from: Date())
        switch month {
        case 3...5: return ("\u{1F331}", loc.t("season_spring"))
        case 6...8: return ("\u{2600}\u{FE0F}", loc.t("season_summer"))
        case 9...11: return ("\u{1F342}", loc.t("season_autumn"))
        default: return ("\u{2744}\u{FE0F}", loc.t("season_winter"))
        }
    }

    // MARK: - Today's Meals

    private var todaysMealsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(loc.t("home_todays_meals"))
                .font(Theme.display(18, weight: .regular))
                .foregroundColor(Theme.ink)

            VStack(spacing: 0) {
                ForEach(Array(MealType.allCases.enumerated()), id: \.element) { index, mealType in
                    let entry = todayEntry(for: mealType)
                    let isCurrent = mealType == currentMealType
                    let isLast = index == MealType.allCases.count - 1

                    mealSlotRow(
                        mealType: mealType,
                        entry: entry,
                        isCurrent: isCurrent,
                        isLast: isLast
                    )
                }
            }
            .background(Theme.surface)
            .cornerRadius(Theme.radiusLG)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radiusLG)
                    .stroke(Theme.border, lineWidth: 1)
            )
        }
    }

    private func mealSlotRow(mealType: MealType, entry: CalendarEntry?, isCurrent: Bool, isLast: Bool) -> some View {
        VStack(spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                // Meal dot
                Circle()
                    .fill(mealDotColor(mealType))
                    .frame(width: 10, height: 10)
                    .shadow(color: isCurrent ? mealDotColor(mealType).opacity(0.4) : .clear, radius: 4)
                    .padding(.top, 5)

                VStack(alignment: .leading, spacing: 2) {
                    // Meal type label
                    Text(mealType.label.uppercased())
                        .font(Theme.ui(11, weight: .semibold))
                        .foregroundColor(Theme.inkFaint)
                        .tracking(0.5)

                    // Recipe name or plan CTA
                    if let entry {
                        NavigationLink(destination: RecipeDetailView(
                            recipe: appVM.recipes.first(where: { $0.id == entry.recipeId })
                                ?? appVM.communityRecipes.first(where: { $0.id == entry.recipeId })
                                ?? placeholderRecipe(entry)
                        )) {
                            Text(entry.recipeTitle)
                                .font(Theme.display(16, weight: .regular))
                                .foregroundColor(Theme.ink)
                                .lineLimit(1)
                        }
                    } else {
                        Button {
                            appVM.selectedTab = 2
                        } label: {
                            HStack(spacing: 4) {
                                Image(systemName: "plus")
                                    .font(.system(size: 12))
                                Text(loc.t("home_plan_meal"))
                                    .font(Theme.ui(14))
                            }
                            .foregroundColor(Theme.inkFaint)
                        }
                    }
                }

                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 14)
            .background(isCurrent ? Theme.surfaceRaised : Color.clear)

            if !isLast {
                Divider()
                    .background(Theme.border)
                    .padding(.leading, 38)
            }
        }
    }

    private func todayEntry(for mealType: MealType) -> CalendarEntry? {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        let today = fmt.string(from: Date())
        return appVM.calendarEntries.first { $0.date == today && $0.mealType == mealType }
    }

    private var currentMealType: MealType {
        let hour = Calendar.current.component(.hour, from: Date())
        if hour < 11 { return .breakfast }
        if hour < 16 { return .lunch }
        return .dinner
    }

    private func mealDotColor(_ mealType: MealType) -> Color {
        switch mealType {
        case .breakfast: return Theme.warm
        case .lunch: return Theme.accent
        case .dinner: return Theme.accentLight
        }
    }

    private func placeholderRecipe(_ entry: CalendarEntry) -> Recipe {
        Recipe(
            id: entry.recipeId,
            title: entry.recipeTitle,
            description: "",
            ingredients: [],
            instructions: [],
            servings: 4,
            prepMinutes: 0,
            cookMinutes: 0,
            cuisineId: "",
            seasons: [],
            produce: [],
            mealTypes: [],
            creatorId: "",
            familyId: "",
            isPublic: false,
            starredBy: [],
            ratings: [:],
            createdAt: Date()
        )
    }

    // MARK: - Diversity

    private var diversitySection: some View {
        let count = appVM.weeklyDiversity?.count ?? 0
        let goal = appVM.weeklyDiversity?.goal ?? 30
        let progress = goal > 0 ? min(Double(count) / Double(goal), 1.0) : 0
        let plants = appVM.weeklyDiversity?.uniquePlants ?? []

        return Button(action: { showDiversityInfo = true }) {
            VStack(alignment: .leading, spacing: 10) {
                // Header row
                HStack {
                    HStack(spacing: 8) {
                        Text("\u{1F331}")
                            .font(.system(size: 16))
                        Text(loc.t("home_plants_this_week"))
                            .font(Theme.ui(13, weight: .medium))
                            .foregroundColor(Theme.inkMuted)
                    }

                    Spacer()

                    HStack(alignment: .firstTextBaseline, spacing: 2) {
                        Text("\(count)")
                            .font(Theme.display(22, weight: .regular))
                            .foregroundColor(Theme.accent)
                        Text("/ \(goal)")
                            .font(Theme.ui(13))
                            .foregroundColor(Theme.inkFaint)
                    }
                }

                // Progress bar
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(Theme.accentBg)
                            .frame(height: 6)

                        RoundedRectangle(cornerRadius: 3)
                            .fill(Theme.accent)
                            .frame(width: geo.size.width * progress, height: 6)
                            .animation(.easeOut(duration: 0.6), value: progress)
                    }
                }
                .frame(height: 6)

                // Plant name pills
                if !plants.isEmpty {
                    FlowLayout(spacing: 4) {
                        ForEach(plants.prefix(8), id: \.self) { name in
                            Text(name)
                                .font(Theme.ui(11))
                                .foregroundColor(Theme.accent)
                                .padding(.horizontal, 8)
                                .padding(.vertical, 2)
                                .background(Theme.accentBg)
                                .cornerRadius(999)
                        }
                        if plants.count > 8 {
                            Text("+\(plants.count - 8)")
                                .font(Theme.ui(11))
                                .foregroundColor(Theme.inkFaint)
                                .padding(.horizontal, 4)
                                .padding(.vertical, 2)
                        }
                    }
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.surface)
            .cornerRadius(Theme.radiusLG)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radiusLG)
                    .stroke(Theme.border, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var diversityInfoSheet: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Icon
                    ZStack {
                        RoundedRectangle(cornerRadius: 16)
                            .fill(Theme.accentBg)
                            .frame(width: 64, height: 64)
                        Text("\u{1F331}")
                            .font(.system(size: 28))
                    }
                    .padding(.top, 8)

                    Text(loc.t("diversity_info_title"))
                        .font(Theme.display(24, weight: .semibold))
                        .foregroundColor(Theme.ink)
                        .multilineTextAlignment(.center)

                    Text(loc.t("diversity_info_body"))
                        .font(Theme.ui(15))
                        .foregroundColor(Theme.inkMuted)
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)

                    // Current progress card
                    VStack(spacing: 4) {
                        Text("\(appVM.weeklyDiversity?.count ?? 0) / \(appVM.weeklyDiversity?.goal ?? 30)")
                            .font(Theme.display(28, weight: .semibold))
                            .foregroundColor(Theme.accent)
                        Text(loc.t("home_plants_this_week"))
                            .font(Theme.ui(13))
                            .foregroundColor(Theme.accent)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(16)
                    .background(Theme.accentBg)
                    .cornerRadius(Theme.radiusMD)

                    // All plant names
                    let plants = appVM.weeklyDiversity?.uniquePlants ?? []
                    if !plants.isEmpty {
                        FlowLayout(spacing: 6) {
                            ForEach(plants, id: \.self) { name in
                                Text(name)
                                    .font(Theme.ui(13))
                                    .foregroundColor(Theme.accent)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 4)
                                    .background(Theme.accentBg)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 999)
                                            .stroke(Theme.border, lineWidth: 1)
                                    )
                                    .cornerRadius(999)
                            }
                        }
                    }
                }
                .padding(Theme.pagePadding)
            }
            .background(Theme.bg.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(loc.t("done")) {
                        showDiversityInfo = false
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    // MARK: - Tomorrow

    @ViewBuilder
    private var tomorrowSection: some View {
        let entries = tomorrowEntries
        if !entries.isEmpty {
            VStack(alignment: .leading, spacing: 8) {
                Text(loc.t("home_tomorrow_preview").uppercased())
                    .font(Theme.ui(11, weight: .semibold))
                    .foregroundColor(Theme.inkFaint)
                    .tracking(0.5)
                    .padding(.horizontal, 16)

                VStack(alignment: .leading, spacing: 6) {
                    ForEach(entries) { entry in
                        HStack(spacing: 8) {
                            Circle()
                                .fill(mealDotColor(entry.mealType))
                                .frame(width: 6, height: 6)

                            Group {
                                Text(entry.mealType.label + ": ")
                                    .foregroundColor(Theme.inkMuted) +
                                Text(entry.recipeTitle)
                                    .foregroundColor(Theme.ink)
                            }
                            .font(Theme.ui(14))
                            .lineLimit(1)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Theme.surface)
                .cornerRadius(Theme.radiusMD)
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.radiusMD)
                        .stroke(Theme.border, lineWidth: 1)
                )
            }
        }
    }

    private var tomorrowEntries: [CalendarEntry] {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        let tomorrow = fmt.string(from: Calendar.current.date(byAdding: .day, value: 1, to: Date()) ?? Date())
        return appVM.calendarEntries.filter { $0.date == tomorrow }
    }

    // MARK: - Activity

    @ViewBuilder
    private var activitySection: some View {
        if !appVM.activity.isEmpty {
            VStack(alignment: .leading, spacing: 14) {
                Text(loc.t("home_family_activity"))
                    .font(Theme.display(18, weight: .regular))
                    .foregroundColor(Theme.ink)

                VStack(alignment: .leading, spacing: 0) {
                    ForEach(Array(appVM.activity.prefix(5).enumerated()), id: \.element.id) { index, item in
                        HStack(alignment: .top, spacing: 0) {
                            // Timeline track
                            VStack(spacing: 0) {
                                Circle()
                                    .fill(Theme.surface)
                                    .frame(width: 8, height: 8)
                                    .overlay(
                                        Circle()
                                            .stroke(Theme.border, lineWidth: 2)
                                    )
                                    .padding(.top, 4)

                                if index < min(appVM.activity.count - 1, 4) {
                                    Rectangle()
                                        .fill(Theme.border)
                                        .frame(width: 2)
                                        .frame(maxHeight: .infinity)
                                }
                            }
                            .frame(width: 8)

                            // Content
                            VStack(alignment: .leading, spacing: 2) {
                                Text(activityDescription(item))
                                    .font(Theme.ui(14))
                                    .foregroundColor(Theme.ink)
                                Text(DateFormatting.relativeTime(from: item.timestamp))
                                    .font(Theme.ui(12))
                                    .foregroundColor(Theme.inkFaint)
                            }
                            .padding(.leading, 14)
                            .padding(.bottom, index < min(appVM.activity.count - 1, 4) ? 16 : 0)

                            Spacer()
                        }
                    }
                }
                .padding(.leading, 6)
            }
        }
    }

    private func activityDescription(_ item: ActivityItem) -> AttributedString {
        let name = item.userName.components(separatedBy: " ").first ?? item.userName
        var result = AttributedString("\(name) \(item.message)")
        if let nameRange = result.range(of: name) {
            result[nameRange].font = Theme.ui(14, weight: .bold)
        }
        return result
    }
}

// FlowLayout is defined in CreateRecipeView.swift and shared across the module
