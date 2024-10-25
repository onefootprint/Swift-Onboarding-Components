import Foundation

func isSSN4(_ value: String) -> String? {
    if value.isEmpty { return "Last 4 digits of SSN is required" }
    
    let pattern = "^((?!(0000))\\d{4})$"
    let isValid = NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: value)
    
    return isValid ? nil : "Please enter valid last 4 digits of SSN"
}
