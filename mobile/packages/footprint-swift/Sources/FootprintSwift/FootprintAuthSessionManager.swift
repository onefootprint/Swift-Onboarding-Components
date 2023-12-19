import Foundation
import AuthenticationServices

@available(iOS 13.0, *)
class FootprintAuthSessionManager: NSObject, ASWebAuthenticationPresentationContextProviding {
    public var authSession: ASWebAuthenticationSession?
    private var configuration: FootprintConfiguration
    private var errorManager: FootprintErrorManager?
    
    init(configuration: FootprintConfiguration, errorManager: FootprintErrorManager?) {
        self.configuration = configuration
        self.errorManager = errorManager
        self.authSession = nil
    }
    
    private func getURL(token: String) throws -> URL {
        let bifrostBaseUrl = "https://id.onefootprint.com"
        var urlComponents = URLComponents(string: bifrostBaseUrl)!
        var queryItems: [URLQueryItem] = []
        queryItems.append(URLQueryItem(name: "redirect_url", value: self.getDeepLink()))
        
        if let appearance = try self.configuration.appearance?.toJSON() {
            if let fontSrc = appearance["fontSrc"] {
                queryItems.append(URLQueryItem(name: "fontSrc", value: fontSrc))
            }
            if let variant = appearance["variant"] {
                queryItems.append(URLQueryItem(name: "variant", value: variant))
            }
            if let variables = appearance["variables"] {
                queryItems.append(URLQueryItem(name: "variables", value: variables))
            }
            if let rules = appearance["rules"] {
                queryItems.append(URLQueryItem(name: "rules", value: rules))
            }
        }
        
        urlComponents.queryItems = queryItems
        urlComponents.fragment = token
        return urlComponents.url!
    }
    
    private func getDeepLink() -> String {
        return "\(self.configuration.scheme)://"
    }
    
    public func startSession(token: String, onComplete: @escaping () -> Void) throws {
        if self.authSession != nil {
            return
        }

        let url = try self.getURL(token: token)
        self.authSession = ASWebAuthenticationSession(
            url: url,
            callbackURLScheme: self.configuration.scheme
        ) { [weak self] callbackURL, error in
            onComplete()
            self?.authSession = nil
            
            if let error = error {
                if let error = error as? ASWebAuthenticationSessionError {
                    switch error.code {
                    case .canceledLogin: // User dismissed the browser using the native UI
                        self?.configuration.onCancel?()
                        return
                    case .presentationContextNotProvided:
                        self?.errorManager?.log(error: "Presentation context not provided.", shouldCancel: true)
                        return
                    case .presentationContextInvalid:
                        self?.errorManager?.log(error: "Invalid presentation context.", shouldCancel: true)
                        return
                    default:
                        self?.errorManager?.log(error:"Authentication session failed: \(error.localizedDescription)", shouldCancel: true)
                        return
                    }
                } else {
                    self?.errorManager?.log(error: "An unexpected error occurred during auth: \(error.localizedDescription)", shouldCancel: true)
                }
                return
            }
            
            guard let callbackURL = callbackURL else {
                self?.errorManager?.log(error: "Missing callbackURL from auth session", shouldCancel: true)
                return
            }
            
            do {
                let urlComponents = URLComponents(url: callbackURL, resolvingAgainstBaseURL: true)
                let queryItems = urlComponents!.queryItems
                
                if let canceledValue = queryItems!.first(where: { $0.name == "canceled" })?.value,
                   canceledValue == "true" {
                    self?.configuration.onCancel?()
                } else if let validationToken = queryItems!.first(where: { $0.name == "validation_token" })?.value {
                    self?.configuration.onComplete?(validationToken)
                }
            } catch {
                self?.errorManager?.log(error: "Encountered error when redirecting after verification is complete.", shouldCancel: true)
            }
        }
        
        self.authSession!.presentationContextProvider = self
        self.authSession!.prefersEphemeralWebBrowserSession = true // Skips the confirmation popup before auth browser opens
        self.authSession!.start()
    }
    
    // Presentation context provider for the web authentication session
    func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
        return DispatchQueue.main.sync {
            guard let window = UIApplication.shared.windows.first(where: { $0.isKeyWindow }) else {
                fatalError("@onefootprint/footprint-swift: no key window available.")
            }
            return window
        }
    }
}
