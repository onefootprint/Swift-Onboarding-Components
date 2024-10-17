import Foundation

func isAlphanumeric(_ sandboxId: String) -> Bool {
    return sandboxId.range(of: "^[A-Za-z0-9]+$", options: .regularExpression) != nil
}
