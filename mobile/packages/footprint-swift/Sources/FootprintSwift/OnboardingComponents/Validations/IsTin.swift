import Foundation

struct IsTin {
    static let pattern = "^\\d{9}$"
    
    /** Matches a string of exactly 9 digits without other characters */
    static func isTin(_ value: String) -> Bool {
        return NSPredicate(format: "SELF MATCHES %@", pattern).evaluate(with: value)
    }
}
