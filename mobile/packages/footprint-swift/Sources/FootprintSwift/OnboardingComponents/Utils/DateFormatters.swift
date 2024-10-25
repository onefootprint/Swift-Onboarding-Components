import Foundation

/// Checks if the given value is a string.
func isString(_ value: Any) -> Bool {
    return value is String
}

/// Converts a date string to US date format (MM/DD/YYYY or DD/MM/YYYY) based on the locale.
///
/// - Parameters:
///   - locale: Locale specifying the date format, either `enUS` or `esMX`.
///   - str: A date string in the format 'DD/MM/YYYY' or 'MM/DD/YYYY'.
/// - Returns: The date string in the format 'MM/DD/YYYY'.
func strInputToUSDate(locale: FootprintLocale, str: String) -> String {
    // Return empty string if input is invalid.
    guard !str.isEmpty, isString(str) else { return "" }

    // Split date string by "/".
    let parts = str.trimmingCharacters(in: .whitespaces).split(separator: "/").map { String($0) }

    // Retrieve day, month, and year components with zero-padding as needed.
    let day = parts.indices.contains(0) ? parts[0].padding(toLength: 2, withPad: "0", startingAt: 0) : ""
    let month = parts.indices.contains(1) ? parts[1].padding(toLength: 2, withPad: "0", startingAt: 0) : ""
    let year = parts.indices.contains(2) ? parts[2] : ""

    // Ensure all components are non-empty.
    guard !day.isEmpty, !month.isEmpty, !year.isEmpty else { return "" }

    // Return formatted date based on the locale.
    return locale == .enUS ? "\(day)/\(month)/\(year)" : "\(month)/\(day)/\(year)"
}

/// Converts a US date string to a date string based on the locale format.
///
/// - Parameters:
///   - locale: Locale specifying the output format, either `enUS` or `esMX`.
///   - str: A date string in the format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
/// - Returns: The date string formatted as 'MM/DD/YYYY' or 'DD/MM/YYYY' based on the locale.
func fromUsDateToStringInput(locale: FootprintLocale, str: String) -> String {
    guard !str.isEmpty, isString(str) else { return "" }

    let parts = str.trimmingCharacters(in: .whitespaces).split(separator: "/").map { String($0) }

    let day = parts.indices.contains(0) ? parts[0].padding(toLength: 2, withPad: "0", startingAt: 0) : ""
    let month = parts.indices.contains(1) ? parts[1].padding(toLength: 2, withPad: "0", startingAt: 0) : ""
    let year = parts.indices.contains(2) ? parts[2] : ""

    guard !day.isEmpty, !month.isEmpty, !year.isEmpty else { return "" }

    return locale == .enUS ? "\(month)/\(day)/\(year)" : "\(day)/\(month)/\(year)"
}

/// Converts a US date string (MM/DD/YYYY or DD/MM/YYYY) to ISO 8601 format (YYYY-MM-DD).
///
/// - Parameter date: A date string in the format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
/// - Returns: A date string in ISO 8601 format 'YYYY-MM-DD' or nil if the input is invalid.
func fromUSDateToISO8601Format(_ date: String?) -> String? {
    guard let date = date, isString(date), !date.isEmpty else { return nil }

    let parts = date.trimmingCharacters(in: .whitespaces).split(separator: "/").map { String($0) }
    guard parts.count == 3 else { return nil }

    let month = parts[0]
    let day = parts[1]
    let year = parts[2]

    return !day.isEmpty && !month.isEmpty && !year.isEmpty ? "\(year)-\(month.padding(toLength: 2, withPad: "0", startingAt: 0))-\(day.padding(toLength: 2, withPad: "0", startingAt: 0))" : nil
}

/// Converts an ISO 8601 date string (YYYY-MM-DD) to US date format (MM/DD/YYYY).
///
/// - Parameter date: A date string in the format 'YYYY-MM-DD'.
/// - Returns: A date string in US format 'MM/DD/YYYY' or nil if the input is invalid.
func fromISO8601ToUSDate(_ date: String?) -> String? {
    guard let date = date, isString(date), !date.isEmpty else { return nil }

    let parts = date.trimmingCharacters(in: .whitespaces).split(separator: "-").map { String($0) }
    guard parts.count == 3 else { return nil }

    let year = parts[0]
    let month = parts[1]
    let day = parts[2]

    return !day.isEmpty && !month.isEmpty && !year.isEmpty ? "\(month)/\(day)/\(year)" : nil
}

