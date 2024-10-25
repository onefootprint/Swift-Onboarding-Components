import Foundation

struct IsSandboxFixtureNumber {
    static func isSandboxFixtureNumber(_ phoneNumber: String) -> Bool {
        let SANDBOX_NUMBER = "+15555550100"
        let normalizedPhoneNumber = phoneNumber.replacingOccurrences(of: "[^+\\d]", with: "", options: .regularExpression)
        return normalizedPhoneNumber == SANDBOX_NUMBER
    }
}
