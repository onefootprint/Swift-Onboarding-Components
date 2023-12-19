import SwiftUI

@available(iOS 13.0, *)
public class Footprint: NSObject {
    private var configuration: FootprintConfiguration?
    private static var instance: Footprint?
    // Hold a strong reference to managers so that the auth session & api call state don't get garbage cleaned
    private var sdkArgsManager: FootprintSdkArgsManager?
    private var authSessionManager: FootprintAuthSessionManager?
    private var errorManager: FootprintErrorManager?
    
    private override init() {}
    
    public static func initialize(with configuration: FootprintConfiguration) {
        Task {
            let errorManager = FootprintErrorManager(configuration: configuration)
            if let existingInstance = instance {
                existingInstance.configuration = configuration
                existingInstance.errorManager = errorManager
                await existingInstance.render()
            } else {
                let footprint = Footprint()
                footprint.configuration = configuration
                footprint.errorManager = errorManager
                await footprint.render()
                instance = footprint
            }
        }
    }
    
    private func render() async {
        guard let configuration = self.configuration else {
            self.errorManager?.log(error: "No configuration found.")
            return
        }
        
        var token = ""
        do {
            self.sdkArgsManager = FootprintSdkArgsManager(configuration: configuration, errorManager: self.errorManager)
            token = try! await self.sdkArgsManager!.sendArgs()
        } catch {
            self.errorManager?.log(error: "Could not generate an SDK args token.")
            return
        }
        
        do {
            self.authSessionManager = FootprintAuthSessionManager(configuration: configuration, token: token, errorManager: self.errorManager)
            try! self.authSessionManager!.startSession()
        } catch {
            self.errorManager?.log(error: "Could not initialize auth session.")
            return
        }
    }
    
    
}

