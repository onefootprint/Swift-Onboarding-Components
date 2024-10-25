func isSupportedCountryCode(_ countryCode: String) -> String? {
    if countryCode.isEmpty { return "Country is required" }
    let isValid = FootprintSupportedCountryCodes.isSupportedCountryCode(countryCode)
    if !isValid { return "Please use 2-letter country code e.g. \"US\", \"MX\", \"CA\"" }
    return nil
}
