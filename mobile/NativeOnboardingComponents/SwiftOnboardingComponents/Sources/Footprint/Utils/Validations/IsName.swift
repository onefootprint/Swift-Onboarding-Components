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

func isName(_ value: String, type: NameTypes, translation: Translation?) -> String? {
    let displayName = type.displayName
    let firstNameTranslation = translation?.firstName
    let lastNameTranslation = translation?.lastName
    let middleNameTranslation = translation?.middleName
    
    var requiredTranslation: String?
    var invalidTranslation: String?
    switch type {
    case .firstName:
        requiredTranslation = firstNameTranslation?.required
        invalidTranslation = firstNameTranslation?.invalid
    case .lastName:
        requiredTranslation = lastNameTranslation?.required
        invalidTranslation = lastNameTranslation?.invalid
    case .middleName:
        invalidTranslation = middleNameTranslation?.invalid
    }
    
    if type != .middleName && value.isEmpty { return requiredTranslation ?? "\(displayName) cannot be empty" }
    if type == .middleName && value.isEmpty { return nil }
    let trimmedName = value.trimmingCharacters(in: .whitespacesAndNewlines)
    let allowedChars = "^([^@#$%^*()_+=~/\\\\<>~`\\[\\]{}!?;:]+)$"
    let isValid = NSPredicate(format: "SELF MATCHES %@", allowedChars).evaluate(with: trimmedName)
    if !isValid { return invalidTranslation ?? "Invalid \(displayName.lowercased())" }
    return nil
}
