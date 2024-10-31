import Foundation

func isSSN4(_ value: String, translation: Translation?) -> String? {
    if value.isEmpty { return translation?.ssn4?.required ?? "Last 4 digits of SSN is required" }
    
    let pattern = "^((?!(0000))\\d{4})$"
    let isValid = NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: value)
    
    return isValid ? nil : translation?.ssn4?.invalid ?? "Please enter valid last 4 digits of SSN"
}
