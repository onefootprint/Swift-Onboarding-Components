import Foundation

func isEmail(_ input: String, translation: Translation?) -> String? {
    if input.isEmpty {
        return translation?.email?.required ?? "Email is required"
    }
    
    let emailRegex = "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
    let domainParts = input.split(separator: "@")
    
    if domainParts.count > 1, domainParts[1].contains("..") {
        return "Invalid email format"
    }
    
    let isValidEmail = NSPredicate(format: "SELF MATCHES %@", emailRegex).evaluate(with: input)
    if !isValidEmail {
        return translation?.email?.invalid ?? "Invalid email format"
    }
    
    return nil
}
