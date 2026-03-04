import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appVM: AppViewModel
    @State private var showDiversityInfo = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    greetingSection
                    diversitySection
                    upcomingSection
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
        VStack(alignment: .leading, spacing: 4) {
            Text(greeting)
                .font(Theme.display(28, weight: .semibold))
                .foregroundColor(Theme.ink)
            Text(appVM.user?.displayName ?? "")
                .font(Theme.ui(17))
                .foregroundColor(Theme.inkMuted)
        }
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:
            return NSLocalizedString("greeting_morning", comment: "")
        case 12..<17:
            return NSLocalizedString("greeting_afternoon", comment: "")
        default:
            return NSLocalizedString("greeting_evening", comment: "")
        }
    }

    // MARK: - Diversity Ring

    private var diversitySection: some View {
        VStack(spacing: 12) {
            HStack {
                Text(NSLocalizedString("home_diversity_title", comment: ""))
                    .font(Theme.ui(15, weight: .medium))
                    .foregroundColor(Theme.ink)
                Spacer()
                Button(action: { showDiversityInfo = true }) {
                    Image(systemName: "info.circle")
                        .foregroundColor(Theme.inkMuted)
                }
            }

            DiversityRingView(
                count: appVM.weeklyDiversity?.count ?? 0,
                goal: appVM.weeklyDiversity?.goal ?? 30
            )
        }
        .padding(Theme.pagePadding)
        .background(Theme.surface)
        .cornerRadius(Theme.radiusLG)
        .overlay(
            RoundedRectangle(cornerRadius: Theme.radiusLG)
                .stroke(Theme.border, lineWidth: 1)
        )
    }

    private var diversityInfoSheet: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(NSLocalizedString("diversity_info_title", comment: ""))
                        .font(Theme.display(24, weight: .semibold))
                        .foregroundColor(Theme.ink)

                    Text(NSLocalizedString("diversity_info_body", comment: ""))
                        .font(Theme.ui(15))
                        .foregroundColor(Theme.inkMuted)
                }
                .padding(Theme.pagePadding)
            }
            .background(Theme.bg.ignoresSafeArea())
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(NSLocalizedString("done", comment: "")) {
                        showDiversityInfo = false
                    }
                }
            }
        }
        .presentationDetents([.medium])
    }

    // MARK: - Upcoming

    private var upcomingSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(NSLocalizedString("home_upcoming", comment: ""))
                .font(Theme.ui(15, weight: .medium))
                .foregroundColor(Theme.ink)

            let upcoming = upcomingEntries
            if upcoming.isEmpty {
                Text(NSLocalizedString("home_no_upcoming", comment: ""))
                    .font(Theme.ui(14))
                    .foregroundColor(Theme.inkFaint)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 20)
            } else {
                ForEach(upcoming) { entry in
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text(entry.recipeTitle)
                                .font(Theme.ui(15, weight: .medium))
                                .foregroundColor(Theme.ink)
                            Text("\(entry.date) - \(entry.mealType.label)")
                                .font(Theme.ui(13))
                                .foregroundColor(Theme.inkMuted)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12))
                            .foregroundColor(Theme.inkFaint)
                    }
                    .padding(12)
                    .background(Theme.surface)
                    .cornerRadius(Theme.radiusMD)
                    .overlay(
                        RoundedRectangle(cornerRadius: Theme.radiusMD)
                            .stroke(Theme.border, lineWidth: 1)
                    )
                }
            }
        }
    }

    private var upcomingEntries: [CalendarEntry] {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        let today = fmt.string(from: Date())
        let twoDays = fmt.string(from: Calendar.current.date(byAdding: .day, value: 2, to: Date()) ?? Date())

        return appVM.calendarEntries.filter { entry in
            entry.date >= today && entry.date <= twoDays
        }
    }

    // MARK: - Activity

    private var activitySection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(NSLocalizedString("home_activity", comment: ""))
                .font(Theme.ui(15, weight: .medium))
                .foregroundColor(Theme.ink)

            if appVM.activity.isEmpty {
                Text(NSLocalizedString("home_no_activity", comment: ""))
                    .font(Theme.ui(14))
                    .foregroundColor(Theme.inkFaint)
                    .frame(maxWidth: .infinity, alignment: .center)
                    .padding(.vertical, 20)
            } else {
                ForEach(appVM.activity.prefix(5)) { item in
                    HStack(spacing: 12) {
                        Circle()
                            .fill(Theme.accentBg)
                            .frame(width: 32, height: 32)
                            .overlay(
                                Image(systemName: activityIcon(item.type))
                                    .font(.system(size: 14))
                                    .foregroundColor(Theme.accent)
                            )

                        VStack(alignment: .leading, spacing: 2) {
                            Text(item.message)
                                .font(Theme.ui(14))
                                .foregroundColor(Theme.ink)
                            Text(item.userName)
                                .font(Theme.ui(12))
                                .foregroundColor(Theme.inkFaint)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
    }

    private func activityIcon(_ type: String) -> String {
        switch type {
        case "recipe_added": return "book.fill"
        case "calendar_update": return "calendar"
        case "grocery_added": return "cart.fill"
        default: return "star.fill"
        }
    }
}

// MARK: - Diversity Ring

struct DiversityRingView: View {
    let count: Int
    let goal: Int

    private var progress: Double {
        guard goal > 0 else { return 0 }
        return min(Double(count) / Double(goal), 1.0)
    }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(Theme.border, lineWidth: 8)
                    .frame(width: 100, height: 100)

                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(
                        Theme.accent,
                        style: StrokeStyle(lineWidth: 8, lineCap: .round)
                    )
                    .frame(width: 100, height: 100)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 0) {
                    Text("\(count)")
                        .font(Theme.display(28, weight: .semibold))
                        .foregroundColor(Theme.ink)
                    Text("/\(goal)")
                        .font(Theme.ui(13))
                        .foregroundColor(Theme.inkMuted)
                }
            }

            Text(NSLocalizedString("home_plants_this_week", comment: ""))
                .font(Theme.ui(13))
                .foregroundColor(Theme.inkMuted)
        }
    }
}
