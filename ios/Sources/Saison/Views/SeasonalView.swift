import SwiftUI

struct SeasonalView: View {
    @State private var selectedSeason: Season = .current

    private let produceService = ProduceService()

    private var filteredProduce: [Produce] {
        ProduceService.catalogue.filter { $0.seasons.contains(selectedSeason) }
    }

    private let columns = [
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
        GridItem(.flexible(), spacing: 12),
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
                    LazyVGrid(columns: columns, spacing: 12) {
                        ForEach(filteredProduce) { produce in
                            VStack(spacing: 6) {
                                Text(produce.emoji)
                                    .font(.system(size: 32))
                                Text(produce.name.localized())
                                    .font(Theme.ui(13, weight: .medium))
                                    .foregroundColor(Theme.ink)
                                    .multilineTextAlignment(.center)
                                    .lineLimit(2)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background(Theme.surface)
                            .cornerRadius(Theme.radiusMD)
                            .overlay(
                                RoundedRectangle(cornerRadius: Theme.radiusMD)
                                    .stroke(Theme.border, lineWidth: 1)
                            )
                        }
                    }
                    .padding(.horizontal, Theme.pagePadding)
                    .padding(.bottom, 100)
                }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(NSLocalizedString("tab_seasonal", comment: ""))
        }
    }
}
