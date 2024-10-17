import Foundation

func isEmail(_ input: String) -> Bool {
    let emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    let domainParts = input.split(separator: "@")
    
    if domainParts.count > 1, domainParts[1].contains("..") {
        return false
    }
    
    return NSPredicate(format: "SELF MATCHES %@", emailRegex).evaluate(with: input)
}
