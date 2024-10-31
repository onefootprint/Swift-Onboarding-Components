import Foundation

public enum FpFieldName {
    case idFirstName
    case idMiddleName
    case idLastName
    case idDob
    case idSsn4
    case idSsn9
    case idAddressLine1
    case idAddressLine2
    case idCity
    case idState
    case idZip
    case idCountry
    case idEmail
    case idPhoneNumber
    case idUsLegalStatus
    case idVisaKind
    case idVisaExpirationDate
    case idNationality
    case idCitizenships
    case idDriversLicenseNumber
    case idDriversLicenseState
    case idItin
    case idUsTaxId
}

internal func getVaultDiFromFieldNames(_ fieldName: FpFieldName) -> VaultDI {
    // Using a switch here is better than using a dictionary
    // since switch makes sure that the cases are exhaustive
    switch fieldName {
    case .idFirstName:
        return .idPeriodFirstName
    case .idMiddleName:
        return .idPeriodMiddleName
    case .idLastName:
        return .idPeriodLastName
    case .idDob:
        return .idPeriodDob
    case .idSsn4:
        return .idPeriodSsn4
    case .idSsn9:
        return .idPeriodSsn9
    case .idAddressLine1:
        return .idPeriodAddressLine1
    case .idAddressLine2:
        return .idPeriodAddressLine2
    case .idCity:
        return .idPeriodCity
    case .idState:
        return .idPeriodState
    case .idZip:
        return .idPeriodZip
    case .idCountry:
        return .idPeriodCountry
    case .idEmail:
        return .idPeriodEmail
    case .idPhoneNumber:
        return .idPeriodPhoneNumber
    case .idUsLegalStatus:
        return .idPeriodUsLegalStatus
    case .idVisaKind:
        return .idPeriodVisaKind
    case .idVisaExpirationDate:
        return .idPeriodVisaExpirationDate
    case .idNationality:
        return .idPeriodNationality
    case .idCitizenships:
        return .idPeriodCitizenships
    case .idDriversLicenseNumber:
        return .idPeriodDriversLicenseNumber
    case .idDriversLicenseState:
        return .idPeriodDriversLicenseState
    case .idItin:
        return .idPeriodItin
    case .idUsTaxId:
        return .idPeriodUsTaxId
    }
}

