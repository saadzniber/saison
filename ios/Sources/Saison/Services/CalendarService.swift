import Foundation
import FirebaseFirestore

class CalendarService: FirebaseService, ObservableObject {

    private func calendarCol(_ familyId: String) -> CollectionReference {
        db.collection("families").document(familyId).collection("calendar")
    }

    func getWeekCalendar(familyId: String, dates: [String]) async throws -> [CalendarEntry] {
        guard !dates.isEmpty else { return [] }
        let snapshot = try await calendarCol(familyId)
            .whereField("date", in: dates)
            .getDocuments()
        return snapshot.documents.compactMap { decodeEntry(id: $0.documentID, data: $0.data()) }
    }

    func addToCalendar(familyId: String, entry: CalendarEntry) async throws {
        let docId = "\(entry.date)_\(entry.mealType.rawValue)"
        let data: [String: Any] = [
            "date": entry.date,
            "mealType": entry.mealType.rawValue,
            "recipeId": entry.recipeId,
            "recipeTitle": entry.recipeTitle,
            "familyId": familyId,
            "addedBy": entry.addedBy,
            "createdAt": Timestamp(date: entry.createdAt)
        ]
        try await calendarCol(familyId).document(docId).setData(data)
    }

    func removeFromCalendar(familyId: String, date: String, mealType: String) async throws {
        let docId = "\(date)_\(mealType)"
        try await calendarCol(familyId).document(docId).delete()
    }

    // MARK: - Decode

    private func decodeEntry(id: String, data: [String: Any]) -> CalendarEntry? {
        guard let mealType = MealType(rawValue: data["mealType"] as? String ?? "") else { return nil }
        return CalendarEntry(
            id: id,
            date: data["date"] as? String ?? "",
            mealType: mealType,
            recipeId: data["recipeId"] as? String ?? "",
            recipeTitle: data["recipeTitle"] as? String ?? "",
            familyId: data["familyId"] as? String ?? "",
            addedBy: data["addedBy"] as? String ?? "",
            createdAt: (data["createdAt"] as? Timestamp)?.dateValue() ?? Date()
        )
    }
}
