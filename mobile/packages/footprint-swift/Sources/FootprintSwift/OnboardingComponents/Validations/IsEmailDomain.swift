import Foundation

func isEmailDomain(_ value: String) -> Bool {
    let domainRegex = "^[a-z0-9-]+(\\.[a-z0-9-]+)*\\.[a-z]{2,}$"
    return NSPredicate(format: "SELF MATCHES %@", domainRegex).evaluate(with: value)
}
