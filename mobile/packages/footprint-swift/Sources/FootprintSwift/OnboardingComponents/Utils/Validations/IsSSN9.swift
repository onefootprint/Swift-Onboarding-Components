import Foundation

func isSSN9(_ value: String, isFlexible: Bool = false) -> String? {
    if value.isEmpty { return "SSN is required" }
    
    let strictPattern = "^(?!(000|666|9))(\\d{3}-(?!(00))\\d{2}-(?!(0000))\\d{4})$"
    let flexiblePattern = "^(?!(000|666|9))(\\d{3}-?(?!(00))\\d{2}-?(?!(0000))\\d{4})$"
    
    let pattern = isFlexible ? flexiblePattern : strictPattern
    let isValid = NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: value)
    
    if !isValid { return "SSN is invalid" }
    return nil
}
