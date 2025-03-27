import SwiftUI

internal struct FootprintInputProps{
    var keyboardType: UIKeyboardType? = nil
    var maxLength: Int? = nil
    var textContentType: UITextContentType? = nil
    var autocapitalization: UITextAutocapitalizationType? = nil
    var format: ((_ value: String)-> String)? = nil
}

internal func getValidations(fieldName: FpFieldName) -> (String) -> String?{
    let translation = Footprint.shared.getL10n().translation
    
    switch fieldName {
    case .idEmail:
        return { (value: String) -> String? in
            return Validations.shared.isEmail(value: value, translation: translation)
        }
    case .idPhoneNumber:
        return { (value: String) -> String? in
            return Validations.shared.isPhoneNumberGeneric(value: value, translation: translation)
        }
    case .idDob:
        return { (value: String) -> String? in
            return Validations.shared.isDob(dob: value, locale: Footprint.shared.getL10n().locale!, translation: translation)
        }
    case .idSsn4:
        return { (value: String) -> String? in
            Validations.shared.isSSN4(value:value, translation: translation)
        }
    case .idSsn9:
        return { (value: String) -> String? in
            return Validations.shared.isSSN9(value: value, isFlexible: false, translation: translation)
        }
    case .idFirstName:
        return { (value: String) -> String? in
            return  Validations.shared.isName(value: value, type: .firstName, translation: translation)
        }
    case .idLastName:
        return { (value: String) -> String? in
            return Validations.shared.isName(value: value, type: .lastName, translation: translation)
        }
    case .idMiddleName:
        return { (value: String) -> String? in
            return Validations.shared.isName(value: value, type: .middleName, translation: translation)
        }
    case .idCountry:
        return { (value: String) -> String? in
            Validations.shared.isSupportedCountryCode(countryCode: value, translation: translation)
        }
    case .idCity:
        return { (value: String) -> String? in
            if value.isEmpty { return translation?.city?.required ?? "City is required" }
            return nil
        }
    case .idAddressLine1:
        return { (value: String) -> String? in
            if value.isEmpty { return translation?.addressLine1?.required ?? "Address is required" }
            return nil
        }
    case .idAddressLine2:
        return { _ in nil }
    case .idZip:
        return { (value: String) -> String? in
            if value.isEmpty { return translation?.zipCode?.required ?? "Zip code is required" }
            return nil
        }
    case .idState:
        return { (value: String) -> String? in
            if value.isEmpty { return translation?.state?.required ?? "State is required" }
            return nil
        }
    default:
        return { _ in nil }
    }
}

internal func getInputProps(fieldName: FpFieldName) -> FootprintInputProps {
    var inputProps: FootprintInputProps = .init()
    switch fieldName {
    case .idEmail:
        inputProps.keyboardType = .emailAddress
        inputProps.textContentType = .emailAddress
        inputProps.autocapitalization = .none
    case .idPhoneNumber:
        inputProps.keyboardType = .phonePad
        inputProps.textContentType = .telephoneNumber
        inputProps.format = Formatters.shared.formatPhoneNumber
    case .idDob:
        inputProps.keyboardType = .numberPad
        inputProps.maxLength = 10
        inputProps.format = Formatters.shared.formatDate
    case .idSsn4:
        inputProps.keyboardType = .numberPad
        inputProps.maxLength = 4
    case .idSsn9:
        inputProps.maxLength = 11
        inputProps.keyboardType = .numberPad
        inputProps.format = Formatters.shared.formatSsn9
    case .idFirstName:
        inputProps.textContentType = .name
        inputProps.keyboardType = .default
    case .idLastName:
        inputProps.textContentType = .name
        inputProps.keyboardType = .default
    case .idMiddleName:
        inputProps.textContentType = .name
        inputProps.keyboardType = .default
    case .idCountry:
        inputProps.keyboardType = .default
        inputProps.textContentType = .countryName
    case .idCity:
        inputProps.keyboardType = .default
        inputProps.textContentType = .addressCity
    case .idAddressLine1:
        inputProps.keyboardType = .default
        inputProps.textContentType = .streetAddressLine1
    case .idAddressLine2:
        inputProps.keyboardType = .default
        inputProps.textContentType = .streetAddressLine2
    case .idZip:
        inputProps.keyboardType = .numberPad
        inputProps.textContentType = .postalCode
    case .idState:
        inputProps.keyboardType = .default
        inputProps.textContentType = .addressState
    default :
        break
    }
    return inputProps
}



