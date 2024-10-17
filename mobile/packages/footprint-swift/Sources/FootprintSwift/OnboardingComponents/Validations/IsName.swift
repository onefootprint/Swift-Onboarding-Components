import Foundation

func isName(_ value: String) -> Bool {
    let trimmedName = value.trimmingCharacters(in: .whitespacesAndNewlines)
    let allowedChars = "^([^@#$%^*()_+=~/\\\\<>~`\\[\\]{}!?;:]+)$"
    return NSPredicate(format: "SELF MATCHES %@", allowedChars).evaluate(with: trimmedName)
}
