import Foundation

func isValidIsoDate(_ dateStr: String) -> Bool {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withFullDate]
    return formatter.date(from: dateStr) != nil
}

func getIsoDate(dateStr: String, locale: String) -> String? {
    guard !dateStr.isEmpty else { return nil }
    
    if isValidIsoDate(dateStr) { return dateStr }
    
    let dateFormatter = DateFormatter()
    dateFormatter.locale = Locale(identifier: locale)
    dateFormatter.dateFormat = locale == "es-MX" ? "dd/MM/yyyy" : "MM/dd/yyyy"
    
    guard let date = dateFormatter.date(from: dateStr) else { return nil }
    
    let isoFormatter = ISO8601DateFormatter()
    isoFormatter.formatOptions = [.withFullDate]
    return isoFormatter.string(from: date)
}
