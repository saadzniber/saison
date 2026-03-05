import SwiftUI

struct SeasonalView: View {
    @EnvironmentObject var loc: LocalizationManager
    @State private var selectedSeason: Season = .current

    private var filteredProduce: [Produce] {
        ProduceService.catalogue.filter { $0.seasons.contains(selectedSeason) }
    }

    private var groupedProduce: [(type: ProduceType, items: [Produce])] {
        ProduceType.allCases.compactMap { type in
            let items = filteredProduce.filter { $0.type == type }
            return items.isEmpty ? nil : (type: type, items: items)
        }
    }

    private let columns = [
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 16) {
                Picker("", selection: $selectedSeason) {
                    ForEach(Season.allCases) { season in
                        Text("\(season.emoji) \(season.label)").tag(season)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, Theme.pagePadding)

                ScrollView {
                    VStack(alignment: .leading, spacing: 24) {
                        ForEach(groupedProduce, id: \.type) { group in
                            VStack(alignment: .leading, spacing: 10) {
                                HStack(spacing: 8) {
                                    Text(group.type.label.uppercased())
                                        .font(Theme.ui(11, weight: .semibold))
                                        .foregroundColor(Theme.accent)
                                        .padding(.horizontal, 10)
                                        .padding(.vertical, 3)
                                        .background(Theme.accentBg)
                                        .cornerRadius(Theme.radiusFull)

                                    Text("\(group.items.count)")
                                        .font(Theme.ui(12))
                                        .foregroundColor(Theme.inkFaint)
                                }

                                LazyVGrid(columns: columns, spacing: 8) {
                                    ForEach(group.items) { produce in
                                        VStack(spacing: 6) {
                                            Text(produce.emoji)
                                                .font(.system(size: 26))
                                            Text(produce.name.localized())
                                                .font(Theme.ui(12, weight: .medium))
                                                .foregroundColor(Theme.ink)
                                                .multilineTextAlignment(.center)
                                                .lineLimit(2)
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 14)
                                        .padding(.horizontal, 8)
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
                    }
                    .padding(.horizontal, Theme.pagePadding)
                    .padding(.bottom, 100)
                }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(loc.t("tab_seasonal"))
        }
    }
}
