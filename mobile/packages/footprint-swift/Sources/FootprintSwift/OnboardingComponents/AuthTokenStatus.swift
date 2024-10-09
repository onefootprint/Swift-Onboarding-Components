import Foundation

public enum AuthTokenStatus {
    case validWithSufficientScope
    case validWithInsufficientScope
    case invalid
}
