func formatBeforeSave(_ data: VaultData, locale: FootprintLocale) throws -> VaultData {
    let dob = data.idDob
    let visaExpirationDate = data.idVisaExpirationDate
    var formattedVaultData = data
    
    if let dob {
        let usDobString = strInputToUSDate(locale: locale, str: dob)
        formattedVaultData.idDob = fromUSDateToISO8601Format(usDobString)
        guard let dobDate = formattedVaultData.idDob else {
            throw FootprintError(kind: .vaultingError(context: ["idDob": "Invalid format"]), message: "Invalid format for idDob")
        }
    }
    
    if let visaExpirationDate {
        let usVisaExpirationDate = strInputToUSDate(locale: locale, str: visaExpirationDate)
        formattedVaultData.idVisaExpirationDate = fromUSDateToISO8601Format(usVisaExpirationDate)
        guard let visaExpDate = formattedVaultData.idVisaExpirationDate else {
            throw FootprintError(kind: .vaultingError(context: ["idVisaExpirationDate": "Invalid format"]), message: "Invalid format for idVisaExpirationDate")
        }
    }
    
    return formattedVaultData
}


func formatAfterDecryption(_ data: VaultData, locale: FootprintLocale) throws -> VaultData {
    let dob = data.idDob
    let visaExpirationDate = data.idVisaExpirationDate
    var formattedData = data
    
    if let dob {
        let usDobString = fromISO8601ToUSDate(dob)
        formattedData.idDob = fromUsDateToStringInput(locale: locale, str: usDobString ?? "")
        guard let dobDate = formattedData.idDob else {
            throw FootprintError(kind: .decryptionError, message: "Invalid date format for idDob field \(dob)")
        }
    }
    
    if let visaExpirationDate {
        let usVisaExpirationDate = fromISO8601ToUSDate(visaExpirationDate)
        formattedData.idVisaExpirationDate = fromUsDateToStringInput(locale: locale, str: usVisaExpirationDate ?? "")
        guard let visaExpDate = formattedData.idVisaExpirationDate else {
            throw FootprintError(kind: .decryptionError, message: "Invalid date format for idVisa \(visaExpirationDate)")
        }
    }
    
    return formattedData
}
