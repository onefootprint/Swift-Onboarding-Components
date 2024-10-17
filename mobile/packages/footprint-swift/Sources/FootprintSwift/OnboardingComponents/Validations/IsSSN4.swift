import Foundation

struct IsSSN4 {
    // 0000 is not allowed, has to be 4 digits long
    static let pattern = "^((?!(0000))\\d{4})$"
    
    static func isSSN4(_ value: String) -> Bool {
        return NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: value)
    }
}
