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

internal func getVaultDiFromFieldNames(_ fieldName: FpFieldName) -> DataIdentifier {
    // Using a switch here is better than using a dictionary
    // since switch makes sure that the cases are exhaustive
    switch fieldName {
    case .idFirstName:
        return .idFirstName
    case .idMiddleName:
        return .idMiddleName
    case .idLastName:
        return .idLastName
    case .idDob:
        return .idDob
    case .idSsn4:
        return .idSsn4
    case .idSsn9:
        return .idSsn9
    case .idAddressLine1:
        return .idAddressLine1
    case .idAddressLine2:
        return .idAddressLine2
    case .idCity:
        return .idCity
    case .idState:
        return .idState
    case .idZip:
        return .idZip
    case .idCountry:
        return .idCountry
    case .idEmail:
        return .idEmail
    case .idPhoneNumber:
        return .idPhoneNumber
    case .idUsLegalStatus:
        return .idUsLegalStatus
    case .idVisaKind:
        return .idVisaKind
    case .idVisaExpirationDate:
        return .idVisaExpirationDate
    case .idNationality:
        return .idNationality
    case .idCitizenships:
        return .idCitizenships
    case .idDriversLicenseNumber:
        return .idDriversLicenseNumber
    case .idDriversLicenseState:
        return .idDriversLicenseState
    case .idItin:
        return .idItin
    case .idUsTaxId:
        return .idUsTaxId
    }
}

