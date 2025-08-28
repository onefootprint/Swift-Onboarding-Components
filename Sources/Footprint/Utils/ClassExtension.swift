// extension required due to limitations of KMM not able to generate default values in obj-c

import Foundation

public extension DataIdentifier {
    static func custom(fieldName: String) -> DataIdentifier {
        return DataIdentifier.companion.custom(fieldName: fieldName)
    }
}

public extension VaultData {
    
    // MARK: - Native Swift Custom Fields Type
    
    /// Swift-friendly custom fields type - just a simple [String: String] dictionary
    typealias CustomFields = [String: String]
    
    // MARK: - Computed Property for Swift-Friendly Access
    
    /// Gets custom fields as a clean Swift dictionary (without "custom." prefix)
    private var swiftCustomFields: CustomFields {
        var result: [String: String] = [:]
        for (key, value) in customFields {
            if key.hasPrefix("custom.") {
                let cleanKey = String(key.dropFirst("custom.".count))
                // Handle the Kotlin-Swift bridge JsonElement
                if let primitive = value as? Kotlinx_serialization_jsonJsonPrimitive {
                    result[cleanKey] = primitive.content
                } else {
                    // Fallback: use string representation and clean quotes
                    let stringValue = String(describing: value)
                    let cleaned = stringValue.trimmingCharacters(in: CharacterSet(charactersIn: "\""))
                    result[cleanKey] = cleaned
                }
            }
        }
        
        return result
    }
    
    // MARK: - Convenience Initializers (Main API)
    
    /// Swift-friendly convenience initializer for basic user data
    /// Usage: VaultData(firstName: "John", customFields: ["company": "Acme"])
    ///
    static func createVault( idAddressLine1: String? = nil,
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
                             idZip: String? = nil,
                             investorProfileAnnualIncome: String? = nil,
                             investorProfileBrokerageFirmEmployer: String? = nil,
                             investorProfileDeclarations: [InvestorProfileDeclaration]? = nil,
                             investorProfileEmployer: String? = nil,
                             investorProfileEmploymentStatus: String? = nil,
                             investorProfileFamilyMemberNames: [String]? = nil,
                             investorProfileFundingSources: [InvestorProfileFundingSource]? = nil,
                             investorProfileInvestmentGoals: [InvestorProfileInvestmentGoal]? = nil,
                             investorProfileNetWorth: String? = nil,
                             investorProfileOccupation: String? = nil,
                             investorProfilePoliticalOrganization: String? = nil,
                             investorProfileRiskTolerance: String? = nil,
                             investorProfileSeniorExecutiveSymbols: [String]? = nil,
                             customFields: CustomFields = [:]) -> VaultData {
        
        // Convert Swift custom fields to Kotlin format with "custom." prefix
        let kotlinCustomFields = customFields.reduce(into: [String: Kotlinx_serialization_jsonJsonElement]()) { result, pair in
            let fullKey = pair.key.hasPrefix("custom.") ? pair.key : "custom.\(pair.key)"
            
            do {
                let jsonData = try JSONEncoder().encode(pair.value)
                guard let jsonString = String(data: jsonData, encoding: .utf8) else {
                    return
                }
                
                let jsonElement = try Kotlinx_serialization_jsonJson.companion.parseToJsonElement(string: jsonString)
                result[fullKey] = jsonElement
            } catch {
                print("✗ Failed to convert field: \(fullKey), error: \(error.localizedDescription)")
            }
        }
        return VaultData( idAddressLine1: idAddressLine1,
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
                          idZip: idZip,
                          investorProfileAnnualIncome: investorProfileAnnualIncome,
                          investorProfileBrokerageFirmEmployer: investorProfileBrokerageFirmEmployer,
                          investorProfileDeclarations: investorProfileDeclarations,
                          investorProfileEmployer: investorProfileEmployer,
                          investorProfileEmploymentStatus: investorProfileEmploymentStatus,
                          investorProfileFamilyMemberNames: investorProfileFamilyMemberNames,
                          investorProfileFundingSources: investorProfileFundingSources,
                          investorProfileInvestmentGoals: investorProfileInvestmentGoals,
                          investorProfileNetWorth: investorProfileNetWorth,
                          investorProfileOccupation: investorProfileOccupation,
                          investorProfilePoliticalOrganization: investorProfilePoliticalOrganization,
                          investorProfileRiskTolerance: investorProfileRiskTolerance,
                          investorProfileSeniorExecutiveSymbols: investorProfileSeniorExecutiveSymbols,
                          customFields: kotlinCustomFields
        )
    }
}

public extension FootprintAppearance {
    static func createAppearance(
        fontSrc: String? = nil,
        rules: FootprintAppearanceRules? = nil,
        variables: FootprintAppearanceVariables? = nil
    ) -> FootprintAppearance {
        return FootprintAppearance(fontSrc: fontSrc, rules: rules, variables: variables)
    }
}
public extension FootprintAppearanceRules {
    
    static func createAppearanceRules(
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
    ) -> FootprintAppearanceRules {
        return FootprintAppearanceRules(
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
public extension FootprintAppearanceVariables {
    
    static func createAppearanceVariables(
        // globals
        borderRadius: String? = nil,
        colorError: String? = nil,
        colorWarning: String? = nil,
        colorSuccess: String? = nil,
        colorAccent: String? = nil,
        borderColorError: String? = nil,
        
        // container
        containerBg: String? = nil,
        containerElevation: String? = nil,
        containerBorder: String? = nil,
        containerBorderRadius: String? = nil,
        
        // link
        linkColor: String? = nil,
        
        // typography
        fontFamily: String? = nil,
        
        // label
        labelColor: String? = nil,
        labelFont: String? = nil,
        
        // input
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
        
        // hint
        hintColor: String? = nil,
        hintErrorColor: String? = nil,
        hintFont: String? = nil,
        
        // link button
        linkButtonColor: String? = nil,
        linkButtonHoverColor: String? = nil,
        linkButtonActiveColor: String? = nil,
        linkButtonDestructiveColor: String? = nil,
        linkButtonDestructiveHoverColor: String? = nil,
        linkButtonDestructiveActiveColor: String? = nil,
        
        // button
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
        
        // Dropdown
        dropdownBg: String? = nil,
        dropdownHoverBg: String? = nil,
        dropdownBorderColor: String? = nil,
        dropdownBorderWidth: String? = nil,
        dropdownBorderRadius: String? = nil,
        dropdownElevation: String? = nil,
        dropdownColorPrimary: String? = nil,
        dropdownColorSecondary: String? = nil,
        dropdownFooterBg: String? = nil,
        
        // Radio select
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
        radioSelectComponentsIconSelectedBg: String? = nil) -> FootprintAppearanceVariables {
            return FootprintAppearanceVariables(
                // globals
                borderRadius: borderRadius,
                colorError: colorError,
                colorWarning: colorWarning,
                colorSuccess: colorSuccess,
                colorAccent: colorAccent,
                borderColorError: borderColorError,
                
                // container
                containerBg: containerBg,
                containerElevation: containerElevation,
                containerBorder: containerBorder,
                containerBorderRadius: containerBorderRadius,
                
                // link
                linkColor: linkColor,
                
                // typography
                fontFamily: fontFamily,
                
                // label
                labelColor: labelColor,
                labelFont: labelFont,
                
                // input
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
                
                // hint
                hintColor: hintColor,
                hintErrorColor: hintErrorColor,
                hintFont: hintFont,
                
                // link button
                linkButtonColor: linkButtonColor,
                linkButtonHoverColor: linkButtonHoverColor,
                linkButtonActiveColor: linkButtonActiveColor,
                linkButtonDestructiveColor: linkButtonDestructiveColor,
                linkButtonDestructiveHoverColor: linkButtonDestructiveHoverColor,
                linkButtonDestructiveActiveColor: linkButtonDestructiveActiveColor,
                
                // button
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
                
                // Dropdown
                dropdownBg: dropdownBg,
                dropdownHoverBg: dropdownHoverBg,
                dropdownBorderColor: dropdownBorderColor,
                dropdownBorderWidth: dropdownBorderWidth,
                dropdownBorderRadius: dropdownBorderRadius,
                dropdownElevation: dropdownElevation,
                dropdownColorPrimary: dropdownColorPrimary,
                dropdownColorSecondary: dropdownColorSecondary,
                dropdownFooterBg: dropdownFooterBg,
                
                // Radio select
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
