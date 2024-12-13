func isSupportedCountryCode(_ countryCode: String, translation: Translation?) -> String? {
    if countryCode.isEmpty { return translation?.country?.required ?? "Country is required" }
    let isValid = FootprintSupportedCountryCodes.isSupportedCountryCode(countryCode)
    if !isValid { return translation?.country?.invalid ?? "Please use 2-letter country code e.g. \"US\", \"MX\", \"CA\"" }
    return nil
}
