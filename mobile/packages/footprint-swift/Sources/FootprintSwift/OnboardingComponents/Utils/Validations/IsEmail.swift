import Foundation

func isEmail(_ input: String) -> String? {
    if input.isEmpty {
        return "Email is required"
    }
    
    let emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    let domainParts = input.split(separator: "@")
    
    if domainParts.count > 1, domainParts[1].contains("..") {
        return "Invalid email format"
    }
    
    let isValidEmail = NSPredicate(format: "SELF MATCHES %@", emailRegex).evaluate(with: input)
    if !isValidEmail {
        return "Invalid email format"
    }
    
    return nil
}
