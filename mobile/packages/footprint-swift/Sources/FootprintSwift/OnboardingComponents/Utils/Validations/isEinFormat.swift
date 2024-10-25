import Foundation

func isEinFormat(_ ein: String) -> Bool {
    guard !ein.isEmpty else { return false }
    
    let cleanedEIN = ein.replacingOccurrences(of: "-", with: "")
    return cleanedEIN.range(of: "^[0-9]{9}$", options: .regularExpression) != nil
}
