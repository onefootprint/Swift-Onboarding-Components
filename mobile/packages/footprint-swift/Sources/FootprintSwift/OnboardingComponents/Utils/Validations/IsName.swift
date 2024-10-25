import Foundation

enum NameTypes: String {
    case firstName = "First name"
    case lastName = "Last name"
    case middleName = "Middle name"

    // You can add a method to return the raw value
    var displayName: String {
        return self.rawValue
    }
}

func isName(_ value: String, type: NameTypes) -> String? {
    let displayName = type.displayName
    if type != .middleName && value.isEmpty { return "\(displayName) cannot be empty" }
    if type == .middleName && value.isEmpty { return nil }
    let trimmedName = value.trimmingCharacters(in: .whitespacesAndNewlines)
    let allowedChars = "^([^@#$%^*()_+=~/\\\\<>~`\\[\\]{}!?;:]+)$"
    let isValid = NSPredicate(format: "SELF MATCHES %@", allowedChars).evaluate(with: trimmedName)
    if !isValid { return "Invalid \(displayName.lowercased())" }
    return nil
}
