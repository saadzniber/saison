import Foundation
import FirebaseFirestore

class GroceryService: FirebaseService, ObservableObject {

    private func groceryCol(_ familyId: String) -> CollectionReference {
        db.collection("families").document(familyId).collection("grocery")
    }

    func fetchGroceryList(familyId: String) async throws -> [GroceryItem] {
        let snapshot = try await groceryCol(familyId)
            .order(by: "createdAt", descending: true)
            .getDocuments()
        return snapshot.documents.map { decodeItem(id: $0.documentID, data: $0.data()) }
    }

    func addItems(_ items: [GroceryItem], familyId: String) async throws {
        let batch = db.batch()
        for item in items {
            let ref = groceryCol(familyId).document()
            let data: [String: Any] = [
                "name": item.name,
                "quantity": item.quantity,
                "unit": item.unit,
                "isChecked": item.isChecked,
                "familyId": familyId,
                "addedBy": item.addedBy,
                "createdAt": Timestamp(date: item.createdAt)
            ]
            batch.setData(data, forDocument: ref)
        }
        try await batch.commit()
    }

    func toggleItem(id: String, familyId: String, checked: Bool) async throws {
        try await groceryCol(familyId).document(id).updateData(["isChecked": checked])
    }

    func deleteItem(id: String, familyId: String) async throws {
        try await groceryCol(familyId).document(id).delete()
    }

    func clearCheckedItems(familyId: String) async throws {
        let snapshot = try await groceryCol(familyId)
            .whereField("isChecked", isEqualTo: true)
            .getDocuments()
        let batch = db.batch()
        for doc in snapshot.documents {
            batch.deleteDocument(doc.reference)
        }
        try await batch.commit()
    }

    // MARK: - Decode

    private func decodeItem(id: String, data: [String: Any]) -> GroceryItem {
        GroceryItem(
            id: id,
            name: data["name"] as? String ?? "",
            quantity: data["quantity"] as? String ?? "",
            unit: data["unit"] as? String ?? "",
            isChecked: data["isChecked"] as? Bool ?? false,
            familyId: data["familyId"] as? String ?? "",
            addedBy: data["addedBy"] as? String ?? "",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }
}
