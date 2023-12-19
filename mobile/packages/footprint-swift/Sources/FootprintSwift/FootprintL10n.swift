import Foundation

public enum FootprintLocale: String, Encodable {
    case esMX = "es-MX"
    case enUS = "en-US"
}

public struct FootprintL10n: Encodable {
    public var locale: FootprintLocale
    
    public init(locale: FootprintLocale?) {
        self.locale = locale ?? .enUS
    }
    
    private enum CodingKeys: String, CodingKey {
        case locale
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.locale, forKey: .locale)
    }
}
