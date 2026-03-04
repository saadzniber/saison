import Foundation
import FirebaseFirestore

class FirebaseService {
    let db = Firestore.firestore()

    func timestamp() -> Timestamp {
        Timestamp(date: Date())
    }

    func dateString(_ date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        return fmt.string(from: date)
    }

    func weekDates(from weekStart: Date) -> [String] {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        return (0..<7).compactMap { offset in
            Calendar.current.date(byAdding: .day, value: offset, to: weekStart).map { fmt.string(from: $0) }
        }
    }
}
