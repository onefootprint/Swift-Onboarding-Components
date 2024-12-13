import Foundation

func isPhoneCountryCode(_ value: String) -> Bool {
    let countryCodeRegex = "^[0-9]{1,3}$"
    return NSPredicate(format: "SELF MATCHES %@", countryCodeRegex).evaluate(with: value)
}
