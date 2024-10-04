//
//  File.swift
//  
//
//  Created by Rodrigo on 11/09/24.
//

import Foundation
import OpenAPIRuntime
import OpenAPIURLSession
import CustomDump



public final class FootprintProvider {
    var client: Client  = Client(serverURL: try!Servers.server1(), transport: URLSessionTransport())
    var configKey: String = ""
    var onboardingConfig: Components.Schemas.PublicOnboardingConfiguration?
    
    
    public static let shared: FootprintProvider = {
            let instance = FootprintProvider()

            return instance
        }()
    
    
    private init() {}
    
    
    public func initialize(configKey: String) async throws {
        self.configKey = configKey
        
       let response =  try await self.getOnboardingConfig()
        
        customDump(response)
        
       self.onboardingConfig = response
    }

    public func identify(email: String, phoneNumber: String) async throws -> Components.Schemas.IdentifyResponse {
              
        let input = Operations.identify.Input(
            headers: Operations.identify.Input.Headers(
                X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey
            ),
            body: .json(Components.Schemas.IdentifyRequest(
                email: email, phone_number: phoneNumber, scope: Components.Schemas.IdentifyRequest.scopePayload.onboarding
                
            ))
        )
        
        let response = try await client.identify(input)
                
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw NSError(domain: "IdentifyError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
        }
    }
        
    private func getOnboardingConfig() async throws -> Components.Schemas.PublicOnboardingConfiguration {
    
        let input = Operations.getOnboardingConfig.Input(
            headers: Operations.getOnboardingConfig.Input.Headers(X_hyphen_Onboarding_hyphen_Config_hyphen_Key: self.configKey)
    )
        
        let response =  try await client.getOnboardingConfig(input)
            
        switch response {
        case .ok(let okResponse):
            return try okResponse.body.json
        default:
            throw NSError(domain: "IdentifyError", code: 0, userInfo: [NSLocalizedDescriptionKey: "Unexpected error occurred"])
        }
    }
    
}
