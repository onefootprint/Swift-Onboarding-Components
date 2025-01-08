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
        return .idfirstname
    case .idMiddleName:
        return .idmiddlename
    case .idLastName:
        return .idlastname
    case .idDob:
        return .iddob
    case .idSsn4:
        return .idssn4
    case .idSsn9:
        return .idssn9
    case .idAddressLine1:
        return .idaddressline1
    case .idAddressLine2:
        return .idaddressline2
    case .idCity:
        return .idcity
    case .idState:
        return .idstate
    case .idZip:
        return .idzip
    case .idCountry:
        return .idcountry
    case .idEmail:
        return .idemail
    case .idPhoneNumber:
        return .idphonenumber
    case .idUsLegalStatus:
        return .iduslegalstatus
    case .idVisaKind:
        return .idvisakind
    case .idVisaExpirationDate:
        return .idvisaexpirationdate
    case .idNationality:
        return .idnationality
    case .idCitizenships:
        return .idcitizenships
    case .idDriversLicenseNumber:
        return .iddriverslicensenumber
    case .idDriversLicenseState:
        return .iddriverslicensestate
    case .idItin:
        return .iditin
    case .idUsTaxId:
        return .idustaxid
    }
}

