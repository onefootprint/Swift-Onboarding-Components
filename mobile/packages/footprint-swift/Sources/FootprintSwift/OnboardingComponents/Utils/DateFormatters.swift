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
    let dateFormatter = DateFormatter()
    
    // Set input date format based on locale
    switch locale {
    case .enUS:
        dateFormatter.dateFormat = "MM/dd/yyyy" // Assuming input is already in US format
    case .esMX:
        dateFormatter.dateFormat = "dd/MM/yyyy" // Input is in Mexican Spanish format
    }
    
    // Parse the input string into a Date object
    guard let date = dateFormatter.date(from: str) else {
        return "Invalid date"
    }
    
    // Set output format to US style (MM/DD/YYYY)
    dateFormatter.dateFormat = "MM/dd/yyyy"
    
    // Convert the Date object to the desired string format
    return dateFormatter.string(from: date)
}

/// Converts a US date string to a date string based on the locale format.
///
/// - Parameters:
///   - locale: Locale specifying the output format, either `enUS` or `esMX`.
///   - str: A date string in the format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
/// - Returns: The date string formatted as 'MM/DD/YYYY' or 'DD/MM/YYYY' based on the locale.
func fromUsDateToStringInput(locale: FootprintLocale, str: String) -> String {
    let dateFormatter = DateFormatter()
    
    // Set the input format as US style (MM/DD/YYYY)
    dateFormatter.dateFormat = "MM/dd/yyyy"
    
    // Parse the input string into a Date object
    guard let date = dateFormatter.date(from: str) else {
        return "Invalid date"
    }
    
    // Set output format based on locale
    switch locale {
    case .enUS:
        dateFormatter.dateFormat = "MM/dd/yyyy" // US format
    case .esMX:
        dateFormatter.dateFormat = "dd/MM/yyyy" // Mexican Spanish format
    }
    
    // Convert the Date object to the desired string format
    return dateFormatter.string(from: date)
}

/// Converts a US date string (MM/DD/YYYY or DD/MM/YYYY) to ISO 8601 format (YYYY-MM-DD).
///
/// - Parameter date: A date string in the format 'MM/DD/YYYY' or 'DD/MM/YYYY'.
/// - Returns: A date string in ISO 8601 format 'YYYY-MM-DD' or nil if the input is invalid.
func fromUSDateToISO8601Format(_ date: String?) -> String? {
    guard let date = date else { return nil }
    
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Ensure consistent date parsing
    
    // Try parsing the date assuming MM/DD/YYYY format first
    dateFormatter.dateFormat = "MM/dd/yyyy"
    if let parsedDate = dateFormatter.date(from: date) {
        // Format to ISO 8601
        dateFormatter.dateFormat = "yyyy-MM-dd"
        return dateFormatter.string(from: parsedDate)
    }
    
    // Try parsing the date assuming DD/MM/YYYY format
    dateFormatter.dateFormat = "dd/MM/yyyy"
    if let parsedDate = dateFormatter.date(from: date) {
        // Format to ISO 8601
        dateFormatter.dateFormat = "yyyy-MM-dd"
        return dateFormatter.string(from: parsedDate)
    }
    
    // If neither format works, return nil
    return nil
}

/// Converts an ISO 8601 date string (YYYY-MM-DD) to US date format (MM/DD/YYYY).
///
/// - Parameter date: A date string in the format 'YYYY-MM-DD'.
/// - Returns: A date string in US format 'MM/DD/YYYY' or nil if the input is invalid.
func fromISO8601ToUSDate(_ date: String?) -> String? {
    guard let date = date else { return nil }
    
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: "en_US_POSIX") // Ensure consistent date parsing
    
    // Input format is ISO 8601 (YYYY-MM-DD)
    dateFormatter.dateFormat = "yyyy-MM-dd"
    guard let parsedDate = dateFormatter.date(from: date) else {
        return nil
    }
    
    // Output format is US style (MM/DD/YYYY)
    dateFormatter.dateFormat = "MM/dd/yyyy"
    return dateFormatter.string(from: parsedDate)
}
