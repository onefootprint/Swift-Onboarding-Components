import Foundation

// Exactly one of publicKey or authToken should be provided
public struct FootprintConfiguration: Encodable {
    public var userData: FootprintUserData?
    public var publicKey: String?
    public var authToken: String?
    public var scheme: String
    public var onCancel: (() -> Void)?
    public var onComplete: ((_ validationToken: String) -> Void)?
    public var onError: ((_ errorMessage: String) -> Void)?
    public var options: FootprintOptions?
    public var l10n: FootprintL10n?
    public var appearance: FootprintAppearance?
    
    public init(authToken: String,
                scheme: String,
                userData: FootprintUserData? = nil,
                options: FootprintOptions? = nil,
                l10n: FootprintL10n? = nil,
                appearance: FootprintAppearance? = nil,
                onCancel: (() -> Void)? = nil,
                onComplete: ((_ validationToken: String) -> Void)? = nil,
                onError: ((_ errorMessage: String) -> Void)? = nil
    ) {
        self.publicKey = nil
        self.authToken = authToken
        self.scheme = scheme
        self.userData = userData
        self.onCancel = onCancel
        self.onComplete = onComplete
        self.onError = onError
        self.options = options
        self.l10n = l10n
        self.appearance = appearance
    }
    
    public init(publicKey: String,
                scheme: String,
                userData: FootprintUserData? = nil,
                options: FootprintOptions? = nil,
                l10n: FootprintL10n? = nil,
                appearance: FootprintAppearance? = nil,
                onCancel: (() -> Void)? = nil,
                onComplete: ((_ validationToken: String) -> Void)? = nil,
                onError: ((_ errorMessage: String) -> Void)? = nil
    ) {
        self.publicKey = publicKey
        self.authToken = nil
        self.scheme = scheme
        self.userData = userData
        self.onCancel = onCancel
        self.onComplete = onComplete
        self.onError = onError
        self.options = options
        self.l10n = l10n
        self.appearance = appearance
    }
    
    // Callbacks and redirectUrl should not be serialized
    private enum CodingKeys: String, CodingKey {
        case publicKey = "public_key"
        case authToken = "auth_token"
        case userData = "user_data"
        case options = "options"
        case l10n = "l10n"
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(self.publicKey, forKey: .publicKey)
        try container.encodeIfPresent(self.authToken, forKey: .authToken)
        try container.encodeIfPresent(self.userData, forKey: .userData)
        try container.encodeIfPresent(self.options, forKey: .options)
        try container.encodeIfPresent(self.l10n, forKey: .l10n)
    }
}
