import SwiftUI

struct GroceryView: View {
    @EnvironmentObject var appVM: AppViewModel
    @EnvironmentObject var loc: LocalizationManager
    @State private var newItemName = ""
    @State private var newItemQuantity = ""
    @State private var newItemUnit = ""
    @State private var showAddForm = false

    private var uncheckedItems: [GroceryItem] {
        appVM.groceryItems.filter { !$0.isChecked }
    }

    private var checkedItems: [GroceryItem] {
        appVM.groceryItems.filter { $0.isChecked }
    }

    var body: some View {
        NavigationStack {
            Group {
                if appVM.groceryItems.isEmpty && !showAddForm {
                    emptyState
                } else {
                    ScrollView {
                        VStack(spacing: 16) {
                            if showAddForm {
                                addForm
                            }

                            if !uncheckedItems.isEmpty {
                                VStack(spacing: 8) {
                                    ForEach(uncheckedItems) { item in
                                        groceryRow(item: item)
                                    }
                                }
                            }

                            if !checkedItems.isEmpty {
                                VStack(alignment: .leading, spacing: 8) {
                                    HStack {
                                        Text(loc.t("grocery_checked"))
                                            .font(Theme.ui(13, weight: .medium))
                                            .foregroundColor(Theme.inkMuted)
                                        Spacer()
                                        Button(action: {
                                            Task { await appVM.clearCheckedGrocery() }
                                        }) {
                                            Text(loc.t("grocery_clear_checked"))
                                                .font(Theme.ui(13))
                                                .foregroundColor(Theme.error)
                                        }
                                    }
                                    ForEach(checkedItems) { item in
                                        groceryRow(item: item)
                                    }
                                }
                            }
                        }
                        .padding(.horizontal, Theme.pagePadding)
                        .padding(.top, 8)
                        .padding(.bottom, 100)
                    }
                }
            }
            .background(Theme.bg.ignoresSafeArea())
            .navigationTitle(loc.t("tab_grocery"))
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: { withAnimation { showAddForm.toggle() } }) {
                        Image(systemName: showAddForm ? "xmark" : "plus")
                            .foregroundColor(Theme.ink)
                    }
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 48))
                .foregroundColor(Theme.inkFaint)
            Text(loc.t("grocery_empty"))
                .font(Theme.ui(16))
                .foregroundColor(Theme.inkMuted)
            Button(action: { withAnimation { showAddForm = true } }) {
                Text(loc.t("grocery_add_first"))
                    .font(Theme.ui(15, weight: .medium))
                    .foregroundColor(Theme.accent)
            }
        }
    }

    // MARK: - Add Form

    private var addForm: some View {
        VStack(spacing: 12) {
            HStack(spacing: 8) {
                TextField(loc.t("grocery_item_name"), text: $newItemName)
                    .font(Theme.ui(15))
                TextField(loc.t("grocery_qty"), text: $newItemQuantity)
                    .font(Theme.ui(15))
                    .frame(width: 50)
                    .keyboardType(.decimalPad)
                TextField(loc.t("grocery_unit"), text: $newItemUnit)
                    .font(Theme.ui(15))
                    .frame(width: 50)
            }
            .padding(12)
            .background(Theme.surface)
            .cornerRadius(Theme.radiusMD)
            .overlay(
                RoundedRectangle(cornerRadius: Theme.radiusMD)
                    .stroke(Theme.border, lineWidth: 1)
            )

            Button(action: handleAdd) {
                Text(loc.t("grocery_add"))
                    .font(Theme.ui(15, weight: .medium))
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(newItemName.trimmingCharacters(in: .whitespaces).isEmpty ? Theme.inkFaint : Theme.accent)
                    .foregroundColor(.white)
                    .cornerRadius(Theme.radiusMD)
            }
            .disabled(newItemName.trimmingCharacters(in: .whitespaces).isEmpty)
        }
        .padding(Theme.pagePadding)
        .background(Theme.surfaceRaised)
        .cornerRadius(Theme.radiusLG)
    }

    // MARK: - Grocery Row

    private func groceryRow(item: GroceryItem) -> some View {
        Button(action: {
            Task { await appVM.toggleGroceryItem(item) }
        }) {
            HStack(spacing: 12) {
                Image(systemName: item.isChecked ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(item.isChecked ? Theme.accent : Theme.inkFaint)

                VStack(alignment: .leading, spacing: 2) {
                    Text(item.name)
                        .font(Theme.ui(15, weight: .medium))
                        .foregroundColor(item.isChecked ? Theme.inkFaint : Theme.ink)
                        .strikethrough(item.isChecked)
                    HStack(spacing: 4) {
                        if !item.quantity.isEmpty || !item.unit.isEmpty {
                            Text("\(item.quantity) \(item.unit)".trimmingCharacters(in: .whitespaces))
                                .font(Theme.ui(13))
                                .foregroundColor(Theme.inkMuted)
                        }
                        if !item.addedByName.isEmpty {
                            if !item.quantity.isEmpty || !item.unit.isEmpty {
                                Text("·")
                                    .font(Theme.ui(13))
                                    .foregroundColor(Theme.inkFaint)
                            }
                            Text(item.addedBy == appVM.user?.id
                                ? loc.t("grocery_you")
                                : item.addedByName.components(separatedBy: " ").first ?? item.addedByName)
                                .font(Theme.ui(12))
                                .foregroundColor(Theme.inkFaint)
                        }
                    }
                }

                Spacer()
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

    private func handleAdd() {
        let name = newItemName.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        Task {
            await appVM.addGroceryItem(name: name, quantity: newItemQuantity, unit: newItemUnit)
            newItemName = ""
            newItemQuantity = ""
            newItemUnit = ""
        }
    }
}
