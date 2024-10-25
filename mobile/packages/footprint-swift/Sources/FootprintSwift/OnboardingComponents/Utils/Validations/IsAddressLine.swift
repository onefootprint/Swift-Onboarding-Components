import Foundation

func isAddressLine(_ str: String) -> Bool {
    let trimmedStr = str.trimmingCharacters(in: .whitespacesAndNewlines)
    let addressLine1Regex = try! NSRegularExpression(pattern: "^(?!p\\.?o\\.?\\s*?(?:box)?\\s*?[0-9]+?).*$", options: [.caseInsensitive])
    let range = NSRange(location: 0, length: trimmedStr.utf16.count)
    return !trimmedStr.isEmpty && addressLine1Regex.firstMatch(in: trimmedStr, options: [], range: range) != nil
}
