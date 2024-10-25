import Foundation

struct IsTokenFormat {
    /**
     * Validates if a given string matches a specific token format.
     *
     * Note: This validation does not mandate that the string must start with 'tok_'.
     * It allows for flexibility in token prefixes, acknowledging that tokens can have various prefixes.
     *
     * - Parameter str: The string to validate.
     * - Returns: True if the string matches the token format, false otherwise.
     */
    static func isTokenFormat(_ str: String?) -> Bool {
        guard let str = str else { return false }
        return str.range(of: "tok_", options: .regularExpression) != nil
    }
}
