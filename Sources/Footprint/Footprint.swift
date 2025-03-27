// The Swift Programming Language
// https://docs.swift.org/swift-book

@_exported import SwiftOnboardingComponentsShared

typealias _Footprint = Never

import Foundation

internal actor FingerprintPropsManager {
    private var fingerprintApiKey: String? = nil
    private var sessionId: String?
    
    func setFingerprintAPIKey(_ key: String?) {
        fingerprintApiKey = key
    }
    
    func getFingerprintAPIKey() -> String? {
        return fingerprintApiKey
    }
    
    func setSessionId(_ sessionId: String?) {
        self.sessionId = sessionId
    }
    
    func getSessionId() -> String? {
        return sessionId
    }
}


public final class Footprint: Sendable {
    public static let shared = Footprint()
    private static let propManager = FingerprintPropsManager()
    
    
    private init() {}
    
    private func sendFingerprintData() async {
        do {
            if let apiKey = await Self.propManager.getFingerprintAPIKey(){
                let fingerprintCredentials = try await getFingerprintCredentials(apiKey: apiKey)
                try await SwiftOnboardingComponentsShared._Footprint.shared.postFingerprintData(
                    visitorId: fingerprintCredentials.visitorId,
                    requestId: fingerprintCredentials.requestId
                )
            }
        }catch {
            await logError(error: FootprintException(
                kind: .fingerprintError,
                message: error.localizedDescription,
                supportId: nil,
                sessionId: Self.propManager.getSessionId(),
                context: nil)
            )
        }
    }
    
    public func initializeWithPublicKey(
        publicKey: String,
        sandboxOutcome: SandboxOutcome? = nil,
        l10n: FootprintL10n? = nil,
        sessionId: String? = nil
    ) async throws {
        let response = try await SwiftOnboardingComponentsShared._Footprint.shared.initializeWithPublicKey(
            publicKey: publicKey,
            sandboxOutcome: sandboxOutcome,
            l10n: l10n,
            sessionId: sessionId
        )
        // Use actor to set API key safely
        await Self.propManager.setFingerprintAPIKey(response.fingerprintApiKey)
        await Self.propManager.setSessionId(sessionId)
        if(response.requiresAuth){
            await sendFingerprintData()
        }
    }
    
    public func initializeWithAuthToken(
        authToken: String,
        sandboxOutcome: SandboxOutcome? = nil,
        l10n: FootprintL10n? = nil,
        sessionId: String? = nil
    ) async throws -> FootprintAuthRequirement {
        let response = try await SwiftOnboardingComponentsShared._Footprint.shared.initializeWithAuthToken(
            authToken: authToken,
            sandboxOutcome: sandboxOutcome,
            l10n: l10n,
            sessionId: sessionId
        )
        
        // Use actor to set API key safely
        await Self.propManager.setFingerprintAPIKey(response.fingerprintApiKey)
        await Self.propManager.setSessionId(sessionId)
        let requiresAuth = response.requiresAuth
        if(!requiresAuth){
            await sendFingerprintData()
        }
        return FootprintAuthRequirement(requiresAuth: requiresAuth)
    }
    
    // Rest of the methods remain unchanged
    public func createChallenge(email: String? = nil, phoneNumber: String? = nil) async throws -> String {
        try await SwiftOnboardingComponentsShared._Footprint.shared.createChallenge(email: email, phoneNumber: phoneNumber)
    }
    
    public func verify(verificationCode: String) async throws -> VerificationResponse {
        let response = try await SwiftOnboardingComponentsShared._Footprint.shared.verify(verificationCode: verificationCode)
        await sendFingerprintData()
        return response
    }
    
    public func getRequirements() async throws -> Requirements {
        try await SwiftOnboardingComponentsShared._Footprint.shared.getRequirements()
    }
    
    public func vault(data: VaultData) async throws {
        try await SwiftOnboardingComponentsShared._Footprint.shared.vault(data: data)
    }
    
    public func getVaultData(fields: [DataIdentifier]) async throws -> VaultData {
        try await SwiftOnboardingComponentsShared._Footprint.shared.getVaultData(fields: fields)
    }
    
    public func process() async throws -> String {
        try await SwiftOnboardingComponentsShared._Footprint.shared.process()
    }
    
    public func getL10n() -> FootprintL10n {
        SwiftOnboardingComponentsShared._Footprint.shared.getL10n()
    }
    
    internal func logError(error: FootprintException) async {
        do{
            try await SwiftOnboardingComponentsShared._Footprint.shared.logError(error: error)
        }catch{
            // ...
        }
    }
}

