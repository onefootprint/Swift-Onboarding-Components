import SwiftUI
import AuthenticationServices

public struct FootprintOptions {
    var showCompletionPage: Bool
}

public struct FootprintLocalization {
    var locale: String
}

public struct FootprintUserData {
    var email: String?
    var phoneNumber: String?
    var firstName: String?
    var lastName: String?
    var dob: String?
    var addressLine1: String?
    var addressLine2: String?
    var city: String?
    var state: String?
    var country: String? // 2 letter country code
    var zip: String?
    var ssn9: String?
    var ssn4: String?
    var nationality: String? // 2 letter country code
    var usLegalStatus: String?
    var citizenships: [String]? // array of 2 letter country codes
    var visaKind: String?
    var visaExpirationDate: String?
}

public struct FootprintConfiguration {
    public var userData: FootprintUserData?
    public var publicKey: String
    public var scheme: String
    public var onCancel: (() -> Void)?
    public var onClose: (() -> Void)?
    public var onComplete: ((_ validationToken: String) -> Void)?
    public var options: FootprintOptions?
    public var l10n: FootprintLocalization?

    public init(publicKey: String,
                scheme: String,
                userData: FootprintUserData? = nil,
                onCancel: (() -> Void)? = nil,
                onClose: (() -> Void)? = nil,
                onComplete: ((_ validationToken: String) -> Void)? = nil,
                options: FootprintOptions? = nil,
                l10n: FootprintLocalization? = nil) {
        self.publicKey = publicKey
        self.scheme = scheme
        self.userData = userData
        self.onCancel = onCancel
        self.onClose = onClose
        self.onComplete = onComplete
        self.options = options
        self.l10n = l10n
    }
}

func getDeepLink(scheme: String) -> String {
    return "\(scheme)://"
}

func getURL(publicKey key: String?, redirectUrl: String?) -> URL {
    let baseUrl = "https://id.onefootprint.com"
    var components = URLComponents(string: baseUrl)
    var queryItems: [URLQueryItem] = []
    if let publicKey = key {
        queryItems.append(URLQueryItem(name: "public_key", value: publicKey))
    }
    if let redirectUrl = redirectUrl {
        queryItems.append(URLQueryItem(name: "redirect_url", value: getDeepLink(scheme: redirectUrl)))
    }
    components?.queryItems = queryItems
    return components?.url ?? URL(string: baseUrl)!
}

@available(iOS 13.0, *)
public class Footprint: NSObject, ASWebAuthenticationPresentationContextProviding {
    private var authSession: ASWebAuthenticationSession?
    private var configuration: FootprintConfiguration?

    private static var instance: Footprint?

    private override init() {}

    public static func initialize(with configuration: FootprintConfiguration) {
        if let existingInstance = instance {
            existingInstance.configuration = configuration
            existingInstance.render()
        } else {
            let footprint = Footprint()
            footprint.configuration = configuration
            footprint.render()
            instance = footprint
        }
    }

    private func render() {
        guard let configuration = self.configuration else {
            return
        }
        let authURL = getURL(publicKey: configuration.publicKey, redirectUrl: configuration.scheme)
        self.authSession = ASWebAuthenticationSession(url: authURL, callbackURLScheme: configuration.scheme) { [weak self] callbackURL, error in
            self?.authSession = nil
            if let error = error {
                configuration.onClose?()
                return
            }
            if let callbackURL = callbackURL {
                let components = URLComponents(url: callbackURL, resolvingAgainstBaseURL: true)
                let queryItems = components?.queryItems

                if let canceledValue = queryItems?.first(where: { $0.name == "canceled" })?.value,
                   canceledValue == "true" {
                    configuration.onClose?()
                } else if let validationToken = queryItems?.first(where: { $0.name == "validation_token" })?.value {
                    configuration.onComplete?(validationToken)
                }
            }
        }
        self.authSession?.presentationContextProvider = self
        self.authSession?.start()
    }
    
    // Presentation context provider for the web authentication session
    public func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        guard let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) else {
            fatalError("No key window available!")
        }
        return window
    }
}
