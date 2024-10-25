import Foundation

struct IsURL {
    static let patternWithProtocol = "^(https?:\\/\\/)(?!-)(?:[A-Za-z0-9-]{1,63}\\.)+(?!-)[A-Za-z0-9]{2,}(?::\\d{2,5})?(?:\\/[^\\s?#]*)?(?:\\?[^\\s#]*)?(?:#[^\\s]*)?$"
    
    static let pattern = "^(?:(https?:\\/\\/)?(?!-)(?:[A-Za-z0-9-]{1,63}\\.)+(?!-)[A-Za-z0-9]{2,}(?::\\d{2,5})?)?(?:\\/[^\\s?#]*)?(?:\\?[^\\s#]*)?(?:#[^\\s]*)?$"
    
    static func isURL(_ value: String) -> Bool {
        let predicate = NSPredicate(format: "SELF MATCHES %@", pattern)
        return predicate.evaluate(with: value)
    }
    
    static func isURLWithProtocol(_ value: String) -> Bool {
        let predicate = NSPredicate(format: "SELF MATCHES %@", patternWithProtocol)
        return predicate.evaluate(with: value)
    }
}
