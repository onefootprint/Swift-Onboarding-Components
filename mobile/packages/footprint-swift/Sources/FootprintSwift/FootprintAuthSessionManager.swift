import Foundation
import AuthenticationServices

func handleAuthError(error: Error, configuration: FootprintConfiguration, errorManager: FootprintErrorManager?) {
    if let error = error as? ASWebAuthenticationSessionError {
        switch error.code {
            case .canceledLogin: // User dismissed the browser using the native UI
                configuration.onCancel?()
                return
            case .presentationContextNotProvided:
                errorManager?.log(error: "Presentation context not provided.", shouldCancel: true)
                return
            case .presentationContextInvalid:
                errorManager?.log(error: "Invalid presentation context.", shouldCancel: true)
                return
            default:
                errorManager?.log(error:"Authentication session failed: \(error.localizedDescription)", shouldCancel: true)
                return
        }
    } else {
        errorManager?.log(error: "An unexpected error occurred during auth: \(error.localizedDescription)", shouldCancel: true)
    }
}

@available(iOS 13.0, *)
class FootprintAuthSessionManager: NSObject, ASWebAuthenticationPresentationContextProviding {
    private var authSession: ASWebAuthenticationSession?
    private var configuration: FootprintConfiguration
    private var token: String
    private var errorManager: FootprintErrorManager?
    
    init(configuration: FootprintConfiguration, token: String, errorManager: FootprintErrorManager?) {
        self.configuration = configuration
        self.token = token
        self.errorManager = errorManager
    }
    
    private func getURL() throws -> URL {
        let bifrostBaseUrl = "https://id.onefootprint.com"
        var urlComponents = URLComponents(string: bifrostBaseUrl)!
        var queryItems: [URLQueryItem] = []
        queryItems.append(URLQueryItem(name: "redirect_url", value: self.getDeepLink()))
        
        if let appearance = try! self.configuration.appearance?.toJSON() {
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
        urlComponents.fragment = self.token
        return urlComponents.url!
    }
    
    private func getDeepLink() -> String {
        return "\(self.configuration.scheme)://"
    }
    
    public func startSession() throws {
        let url = try! self.getURL()
        
        self.authSession = ASWebAuthenticationSession(
            url: url,
            callbackURLScheme: self.configuration.scheme
        ) { [weak self] callbackURL, error in
            guard let weakSelf = self else {
                // Handle the case where self is no longer in memory
                print("@onefootprint/footprint-swift: Auth session has no self reference.")
                return
            }
            weakSelf.authSession = nil
            
            if let error = error {
                handleAuthError(error: error, configuration: weakSelf.configuration, errorManager: weakSelf.errorManager)
                return
            }
            
            guard let callbackURL = callbackURL else {
                weakSelf.errorManager?.log(error: "Missing callbackURL from auth session", shouldCancel: true)
                return
            }
            
            do {
                let urlComponents = URLComponents(url: callbackURL, resolvingAgainstBaseURL: true)
                let queryItems = urlComponents!.queryItems
                
                if let canceledValue = queryItems!.first(where: { $0.name == "canceled" })?.value,
                   canceledValue == "true" {
                    weakSelf.configuration.onCancel?()
                } else if let validationToken = queryItems!.first(where: { $0.name == "validation_token" })?.value {
                    weakSelf.configuration.onComplete?(validationToken)
                }
            } catch {
                weakSelf.errorManager?.log(error: "Encountered error when redirecting after verification is complete.", shouldCancel: true)
            }
            
        }
        
        self.authSession!.presentationContextProvider = self
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
