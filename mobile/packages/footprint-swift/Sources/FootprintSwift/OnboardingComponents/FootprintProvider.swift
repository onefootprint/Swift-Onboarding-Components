//
//  File.swift
//  
//
//  Created by Rodrigo on 11/09/24.
//

import Foundation
import OpenAPIRuntime
import OpenAPIURLSession



public final class FootprintProvider {
    var client: Client  = Client(serverURL: try!Servers.server1(), transport: URLSessionTransport())
    var configKey: String = ""
    
    
    public static let shared: FootprintProvider = {
            let instance = FootprintProvider()
            // setup code
            return instance
        }()
    
    
    private init() {}
    
    
    public func initialize(configKey: String){
        self.configKey = configKey
     
    }
    
    // TODO: make function private as it should not be visible to customers
    public func getOnboardingConfig() async -> Components.Schemas.PublicOnboardingConfiguration {
        
        let response =   try? await client.getOnboardingConfig(
                Operations.getOnboardingConfig.Input(
                    headers: Operations.getOnboardingConfig.Input.Headers(X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey)
            ))
            
        return try! (response?.ok.body.json)!
    }
    
}
