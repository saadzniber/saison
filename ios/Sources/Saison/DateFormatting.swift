import Foundation

enum DateFormatting {

    // MARK: - Relative time ("2 hours ago", "Yesterday")

    static func relativeTime(from date: Date) -> String {
        let now = Date()
        let diff = now.timeIntervalSince(date)
        let minutes = Int(diff / 60)
        let hours = Int(diff / 3600)
        let days = Int(diff / 86400)

        if minutes < 1 {
            return LocalizationManager.shared.t("time_just_now")
        } else if minutes < 60 {
            return String(format: LocalizationManager.shared.t("time_minutes_ago"), minutes)
        } else if hours < 24 {
            return String(format: LocalizationManager.shared.t("time_hours_ago"), hours)
        } else if days < 2 {
            return LocalizationManager.shared.t("time_yesterday")
        } else {
            return String(format: LocalizationManager.shared.t("time_days_ago"), days)
        }
    }

    // MARK: - Human-readable date from "YYYY-MM-DD" string

    /// Returns "Today", "Tomorrow", "Yesterday", or "Mon, Mar 4"
    static func readableDate(from dateString: String) -> String {
        let fmt = DateFormatter()
        fmt.dateFormat = "yyyy-MM-dd"
        guard let date = fmt.date(from: dateString) else { return dateString }
        return readableDate(from: date)
    }

    /// Returns "Today", "Tomorrow", "Yesterday", or "Mon, Mar 4"
    static func readableDate(from date: Date) -> String {
        let cal = Calendar.current
        if cal.isDateInToday(date) {
            return LocalizationManager.shared.t("date_today")
        } else if cal.isDateInTomorrow(date) {
            return LocalizationManager.shared.t("date_tomorrow")
        } else if cal.isDateInYesterday(date) {
            return LocalizationManager.shared.t("date_yesterday")
        } else {
            let fmt = DateFormatter()
            fmt.locale = Locale(identifier: LocalizationManager.shared.language)
            fmt.dateFormat = "EEE, MMM d"
            return fmt.string(from: date)
        }
    }

    // MARK: - Calendar day header: "Mon 4" or "Today"

    static func calendarDayLabel(from date: Date) -> String {
        let cal = Calendar.current
        if cal.isDateInToday(date) {
            return LocalizationManager.shared.t("date_today")
        }
        let fmt = DateFormatter()
        fmt.locale = Locale(identifier: LocalizationManager.shared.language)
        fmt.dateFormat = "EEE"
        return fmt.string(from: date)
    }

    // MARK: - Full readable date for recipe detail

    static func fullDate(from date: Date) -> String {
        let fmt = DateFormatter()
        fmt.dateStyle = .medium
        fmt.timeStyle = .none
        return fmt.string(from: date)
    }
}
