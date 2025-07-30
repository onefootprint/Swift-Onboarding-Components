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

public struct FootprintAuthRequirement: Sendable {
    public let requiresAuth: Bool
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
    
    internal func getSesstionId() -> String? {
        SwiftOnboardingComponentsShared._Footprint.shared.getSessionId()
    }
    
    internal func getMoneyKitLinkSessionToken(redirectUri: String) async throws -> String {
        try await SwiftOnboardingComponentsShared._Footprint.shared.getMoneyKitLinkSessionToken(redirectUri: redirectUri)
    }
    
    internal func postUserBankLinkingLinkSessionExchangeData (exchangeableToken: String) async throws {
        try await SwiftOnboardingComponentsShared._Footprint.shared.postUserBankLinkingLinkSessionExchangeData(exchangeableToken: exchangeableToken)
    }
    
    internal func getOnboardingConfig(
        authToken: String? = nil,
        publicKey: String? = nil
    ) async throws -> OnboardingSessionConfig {
        return try await SwiftOnboardingComponentsShared._Footprint.shared.getOnboardingConfig(publicKey: publicKey, authToken: authToken)
    }
    
    internal func postHostedOnboardingSilent(
        authToken: String,
        fingerprintVisitRequest: FingerprintVisitRequest? = nil
    ) async throws -> OnboardingExpressResponse {
        return try await SwiftOnboardingComponentsShared._Footprint.shared.postHostedOnboardingSilent(
            authToken: authToken,
            fingerprintVisitRequest: fingerprintVisitRequest
        )
    }
}

public struct FootprintBootstrapData {
    public var data: BootstrapDataV1
    
    public init(
        businessAddressLine1: String? = nil,
        businessAddressLine2: String? = nil,
        businessCity: String? = nil,
        businessCorporationType: BusinessCorporationType? = nil,
        businessCountry: String? = nil,
        businessDba: String? = nil,
        businessFormationDate: String? = nil,
        businessFormationState: String? = nil,
        businessName: String? = nil,
        businessPhoneNumber: String? = nil,
        businessPrimaryOwnerStake: KotlinLong? = nil,
        businessSecondaryOwners: [String]? = nil,
        businessState: String? = nil,
        businessTin: String? = nil,
        businessWebsite: String? = nil,
        businessZip: String? = nil,
        idAddressLine1: String? = nil,
        idAddressLine2: String? = nil,
        idCitizenships: [Iso3166TwoDigitCountryCode]? = nil,
        idCity: String? = nil,
        idCountry: String? = nil,
        idDob: String? = nil,
        idDriversLicenseNumber: String? = nil,
        idDriversLicenseState: String? = nil,
        idEmail: String? = nil,
        idFirstName: String? = nil,
        idItin: String? = nil,
        idLastName: String? = nil,
        idMiddleName: String? = nil,
        idNationality: String? = nil,
        idPhoneNumber: String? = nil,
        idSsn4: String? = nil,
        idSsn9: String? = nil,
        idState: String? = nil,
        idUsLegalStatus: String? = nil,
        idUsTaxId: String? = nil,
        idVisaExpirationDate: String? = nil,
        idVisaKind: String? = nil,
        idZip: String? = nil
    ) {
        self.data = BootstrapDataV1(
            businessAddressLine1: businessAddressLine1,
            businessAddressLine2: businessAddressLine2,
            businessCity: businessCity,
            businessCorporationType: businessCorporationType,
            businessCountry: businessCountry,
            businessDba: businessDba,
            businessFormationDate: businessFormationDate,
            businessFormationState: businessFormationState,
            businessName: businessName,
            businessPhoneNumber: businessPhoneNumber,
            businessPrimaryOwnerStake: businessPrimaryOwnerStake,
            businessSecondaryOwners: businessSecondaryOwners,
            businessState: businessState,
            businessTin: businessTin,
            businessWebsite: businessWebsite,
            businessZip: businessZip,
            idAddressLine1: idAddressLine1,
            idAddressLine2: idAddressLine2,
            idCitizenships: idCitizenships,
            idCity: idCity,
            idCountry: idCountry,
            idDob: idDob,
            idDriversLicenseNumber: idDriversLicenseNumber,
            idDriversLicenseState: idDriversLicenseState,
            idEmail: idEmail,
            idFirstName: idFirstName,
            idItin: idItin,
            idLastName: idLastName,
            idMiddleName: idMiddleName,
            idNationality: idNationality,
            idPhoneNumber: idPhoneNumber,
            idSsn4: idSsn4,
            idSsn9: idSsn9,
            idState: idState,
            idUsLegalStatus: idUsLegalStatus,
            idUsTaxId: idUsTaxId,
            idVisaExpirationDate: idVisaExpirationDate,
            idVisaKind: idVisaKind,
            idZip: idZip
        )
    }
}

public struct Appearance {
    public let data: FootprintAppearance
    
    public init(
        fontSrc: String? = nil,
        rules: AppearanceRules? = nil,
        variables: AppearanceVariables? = nil
    ) {
        self.data = FootprintAppearance(
            fontSrc: fontSrc,
            rules: rules?.data,
            variables: variables?.data
        )
    }
}

public struct AppearanceRules {
    public let data: FootprintAppearanceRules
    
    public init(
        button: [String: String]? = nil,
        buttonHover: [String: String]? = nil,
        buttonFocus: [String: String]? = nil,
        buttonActive: [String: String]? = nil,
        input: [String: String]? = nil,
        inputHover: [String: String]? = nil,
        inputFocus: [String: String]? = nil,
        inputActive: [String: String]? = nil,
        pinInput: [String: String]? = nil,
        pinInputHover: [String: String]? = nil,
        pinInputFocus: [String: String]? = nil,
        pinInputActive: [String: String]? = nil,
        label: [String: String]? = nil,
        hint: [String: String]? = nil,
        link: [String: String]? = nil,
        linkButton: [String: String]? = nil,
        linkHover: [String: String]? = nil,
        linkActive: [String: String]? = nil,
        linkButtonHover: [String: String]? = nil,
        linkButtonFocus: [String: String]? = nil,
        linkButtonActive: [String: String]? = nil
    ) {
        self.data = FootprintAppearanceRules(
            button: button,
            buttonHover: buttonHover,
            buttonFocus: buttonFocus,
            buttonActive: buttonActive,
            input: input,
            inputHover: inputHover,
            inputFocus: inputFocus,
            inputActive: inputActive,
            pinInput: pinInput,
            pinInputHover: pinInputHover,
            pinInputFocus: pinInputFocus,
            pinInputActive: pinInputActive,
            label: label,
            hint: hint,
            link: link,
            linkButton: linkButton,
            linkHover: linkHover,
            linkActive: linkActive,
            linkButtonHover: linkButtonHover,
            linkButtonFocus: linkButtonFocus,
            linkButtonActive: linkButtonActive
        )
    }
}

public struct AppearanceVariables {
    public let data: FootprintAppearanceVariables
    
    public init(
        borderRadius: String? = nil,
        colorError: String? = nil,
        colorWarning: String? = nil,
        colorSuccess: String? = nil,
        colorAccent: String? = nil,
        borderColorError: String? = nil,
        containerBg: String? = nil,
        containerElevation: String? = nil,
        containerBorder: String? = nil,
        containerBorderRadius: String? = nil,
        linkColor: String? = nil,
        fontFamily: String? = nil,
        labelColor: String? = nil,
        labelFont: String? = nil,
        inputBorderRadius: String? = nil,
        inputBorderWidth: String? = nil,
        inputFont: String? = nil,
        inputHeight: String? = nil,
        inputPlaceholderColor: String? = nil,
        inputColor: String? = nil,
        inputBg: String? = nil,
        inputBorderColor: String? = nil,
        inputElevation: String? = nil,
        inputHoverBg: String? = nil,
        inputHoverBorderColor: String? = nil,
        inputHoverElevation: String? = nil,
        inputFocusBg: String? = nil,
        inputFocusBorderColor: String? = nil,
        inputFocusElevation: String? = nil,
        inputErrorBg: String? = nil,
        inputErrorBorderColor: String? = nil,
        inputErrorElevation: String? = nil,
        inputErrorHoverBg: String? = nil,
        inputErrorHoverBorderColor: String? = nil,
        inputErrorHoverElevation: String? = nil,
        inputErrorFocusBg: String? = nil,
        inputErrorFocusBorderColor: String? = nil,
        inputErrorFocusElevation: String? = nil,
        hintColor: String? = nil,
        hintErrorColor: String? = nil,
        hintFont: String? = nil,
        linkButtonColor: String? = nil,
        linkButtonHoverColor: String? = nil,
        linkButtonActiveColor: String? = nil,
        linkButtonDestructiveColor: String? = nil,
        linkButtonDestructiveHoverColor: String? = nil,
        linkButtonDestructiveActiveColor: String? = nil,
        buttonBorderRadius: String? = nil,
        buttonBorderWidth: String? = nil,
        buttonElevation: String? = nil,
        buttonElevationHover: String? = nil,
        buttonElevationActive: String? = nil,
        buttonOutlineOffset: String? = nil,
        buttonPrimaryBg: String? = nil,
        buttonPrimaryColor: String? = nil,
        buttonPrimaryBorderColor: String? = nil,
        buttonPrimaryHoverBg: String? = nil,
        buttonPrimaryHoverColor: String? = nil,
        buttonPrimaryHoverBorderColor: String? = nil,
        buttonPrimaryActiveBg: String? = nil,
        buttonPrimaryActiveColor: String? = nil,
        buttonPrimaryActiveBorderColor: String? = nil,
        buttonPrimaryDisabledBg: String? = nil,
        buttonPrimaryDisabledColor: String? = nil,
        buttonPrimaryDisabledBorderColor: String? = nil,
        buttonPrimaryLoadingBg: String? = nil,
        buttonPrimaryLoadingColor: String? = nil,
        buttonsPrimaryLoadingBorderColor: String? = nil,
        buttonSecondaryBg: String? = nil,
        buttonSecondaryColor: String? = nil,
        buttonSecondaryBorderColor: String? = nil,
        buttonSecondaryHoverBg: String? = nil,
        buttonSecondaryHoverColor: String? = nil,
        buttonSecondaryHoverBorderColor: String? = nil,
        buttonSecondaryActiveBg: String? = nil,
        buttonSecondaryActiveColor: String? = nil,
        buttonSecondaryActiveBorderColor: String? = nil,
        buttonSecondaryDisabledBg: String? = nil,
        buttonSecondaryDisabledColor: String? = nil,
        buttonSecondaryDisabledBorderColor: String? = nil,
        buttonSecondaryLoadingBg: String? = nil,
        buttonSecondaryLoadingColor: String? = nil,
        dropdownBg: String? = nil,
        dropdownHoverBg: String? = nil,
        dropdownBorderColor: String? = nil,
        dropdownBorderWidth: String? = nil,
        dropdownBorderRadius: String? = nil,
        dropdownElevation: String? = nil,
        dropdownColorPrimary: String? = nil,
        dropdownColorSecondary: String? = nil,
        dropdownFooterBg: String? = nil,
        radioSelectBg: String? = nil,
        radioSelectColor: String? = nil,
        radioSelectHoverColor: String? = nil,
        radioSelectSelectedColor: String? = nil,
        radioSelectBorderRadius: String? = nil,
        radioSelectBorderWidth: String? = nil,
        radioSelectBorderColor: String? = nil,
        radioSelectHoverBg: String? = nil,
        radioSelectHoverBorderColor: String? = nil,
        radioSelectSelectedBg: String? = nil,
        radioSelectSelectedBorderColor: String? = nil,
        radioSelectComponentsIconBg: String? = nil,
        radioSelectComponentsIconHoverBg: String? = nil,
        radioSelectComponentsIconSelectedBg: String? = nil
    ) {
        self.data = FootprintAppearanceVariables(
            borderRadius: borderRadius,
            colorError: colorError,
            colorWarning: colorWarning,
            colorSuccess: colorSuccess,
            colorAccent: colorAccent,
            borderColorError: borderColorError,
            containerBg: containerBg,
            containerElevation: containerElevation,
            containerBorder: containerBorder,
            containerBorderRadius: containerBorderRadius,
            linkColor: linkColor,
            fontFamily: fontFamily,
            labelColor: labelColor,
            labelFont: labelFont,
            inputBorderRadius: inputBorderRadius,
            inputBorderWidth: inputBorderWidth,
            inputFont: inputFont,
            inputHeight: inputHeight,
            inputPlaceholderColor: inputPlaceholderColor,
            inputColor: inputColor,
            inputBg: inputBg,
            inputBorderColor: inputBorderColor,
            inputElevation: inputElevation,
            inputHoverBg: inputHoverBg,
            inputHoverBorderColor: inputHoverBorderColor,
            inputHoverElevation: inputHoverElevation,
            inputFocusBg: inputFocusBg,
            inputFocusBorderColor: inputFocusBorderColor,
            inputFocusElevation: inputFocusElevation,
            inputErrorBg: inputErrorBg,
            inputErrorBorderColor: inputErrorBorderColor,
            inputErrorElevation: inputErrorElevation,
            inputErrorHoverBg: inputErrorHoverBg,
            inputErrorHoverBorderColor: inputErrorHoverBorderColor,
            inputErrorHoverElevation: inputErrorHoverElevation,
            inputErrorFocusBg: inputErrorFocusBg,
            inputErrorFocusBorderColor: inputErrorFocusBorderColor,
            inputErrorFocusElevation: inputErrorFocusElevation,
            hintColor: hintColor,
            hintErrorColor: hintErrorColor,
            hintFont: hintFont,
            linkButtonColor: linkButtonColor,
            linkButtonHoverColor: linkButtonHoverColor,
            linkButtonActiveColor: linkButtonActiveColor,
            linkButtonDestructiveColor: linkButtonDestructiveColor,
            linkButtonDestructiveHoverColor: linkButtonDestructiveHoverColor,
            linkButtonDestructiveActiveColor: linkButtonDestructiveActiveColor,
            buttonBorderRadius: buttonBorderRadius,
            buttonBorderWidth: buttonBorderWidth,
            buttonElevation: buttonElevation,
            buttonElevationHover: buttonElevationHover,
            buttonElevationActive: buttonElevationActive,
            buttonOutlineOffset: buttonOutlineOffset,
            buttonPrimaryBg: buttonPrimaryBg,
            buttonPrimaryColor: buttonPrimaryColor,
            buttonPrimaryBorderColor: buttonPrimaryBorderColor,
            buttonPrimaryHoverBg: buttonPrimaryHoverBg,
            buttonPrimaryHoverColor: buttonPrimaryHoverColor,
            buttonPrimaryHoverBorderColor: buttonPrimaryHoverBorderColor,
            buttonPrimaryActiveBg: buttonPrimaryActiveBg,
            buttonPrimaryActiveColor: buttonPrimaryActiveColor,
            buttonPrimaryActiveBorderColor: buttonPrimaryActiveBorderColor,
            buttonPrimaryDisabledBg: buttonPrimaryDisabledBg,
            buttonPrimaryDisabledColor: buttonPrimaryDisabledColor,
            buttonPrimaryDisabledBorderColor: buttonPrimaryDisabledBorderColor,
            buttonPrimaryLoadingBg: buttonPrimaryLoadingBg,
            buttonPrimaryLoadingColor: buttonPrimaryLoadingColor,
            buttonsPrimaryLoadingBorderColor: buttonsPrimaryLoadingBorderColor,
            buttonSecondaryBg: buttonSecondaryBg,
            buttonSecondaryColor: buttonSecondaryColor,
            buttonSecondaryBorderColor: buttonSecondaryBorderColor,
            buttonSecondaryHoverBg: buttonSecondaryHoverBg,
            buttonSecondaryHoverColor: buttonSecondaryHoverColor,
            buttonSecondaryHoverBorderColor: buttonSecondaryHoverBorderColor,
            buttonSecondaryActiveBg: buttonSecondaryActiveBg,
            buttonSecondaryActiveColor: buttonSecondaryActiveColor,
            buttonSecondaryActiveBorderColor: buttonSecondaryActiveBorderColor,
            buttonSecondaryDisabledBg: buttonSecondaryDisabledBg,
            buttonSecondaryDisabledColor: buttonSecondaryDisabledColor,
            buttonSecondaryDisabledBorderColor: buttonSecondaryDisabledBorderColor,
            buttonSecondaryLoadingBg: buttonSecondaryLoadingBg,
            buttonSecondaryLoadingColor: buttonSecondaryLoadingColor,
            dropdownBg: dropdownBg,
            dropdownHoverBg: dropdownHoverBg,
            dropdownBorderColor: dropdownBorderColor,
            dropdownBorderWidth: dropdownBorderWidth,
            dropdownBorderRadius: dropdownBorderRadius,
            dropdownElevation: dropdownElevation,
            dropdownColorPrimary: dropdownColorPrimary,
            dropdownColorSecondary: dropdownColorSecondary,
            dropdownFooterBg: dropdownFooterBg,
            radioSelectBg: radioSelectBg,
            radioSelectColor: radioSelectColor,
            radioSelectHoverColor: radioSelectHoverColor,
            radioSelectSelectedColor: radioSelectSelectedColor,
            radioSelectBorderRadius: radioSelectBorderRadius,
            radioSelectBorderWidth: radioSelectBorderWidth,
            radioSelectBorderColor: radioSelectBorderColor,
            radioSelectHoverBg: radioSelectHoverBg,
            radioSelectHoverBorderColor: radioSelectHoverBorderColor,
            radioSelectSelectedBg: radioSelectSelectedBg,
            radioSelectSelectedBorderColor: radioSelectSelectedBorderColor,
            radioSelectComponentsIconBg: radioSelectComponentsIconBg,
            radioSelectComponentsIconHoverBg: radioSelectComponentsIconHoverBg,
            radioSelectComponentsIconSelectedBg: radioSelectComponentsIconSelectedBg
        )
    }
}
