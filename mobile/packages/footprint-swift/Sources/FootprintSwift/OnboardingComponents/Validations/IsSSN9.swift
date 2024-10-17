import Foundation

struct IsSSN9 {
    // Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
    // Numbers with 666 or 900–999 in the first digit group are not allowed.
    // Also validates length & formatting.
    static let pattern = "^(?!(000|666|9))(\\d{3}-(?!(00))\\d{2}-(?!(0000))\\d{4})$"
    static let flexiblePattern = "^(?!(000|666|9))(\\d{3}-?(?!(00))\\d{2}-?(?!(0000))\\d{4})$"
    
    /** Matches `123-45-6789` */
    static func isSSN9(_ value: String) -> Bool {
        return NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: value)
    }
    
    /** Matches `123-45-6789` and `123456789` */
    static func isSSN9Flexible(_ value: String) -> Bool {
        return NSPredicate(format: "SELF MATCHES %@", flexiblePattern).evaluate(with: value)
    }
}
