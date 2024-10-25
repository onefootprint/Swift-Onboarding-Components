import SwiftUI

internal struct FootprintInputProps{
    var keyboardType: UIKeyboardType? = nil
    var maxLength: Int? = nil
    var textContentType: UITextContentType? = nil
    var format: ((_ value: String)-> String)? = nil
}



internal func getValidations(fieldName: VaultDI) -> (String) -> String?{
    switch fieldName {
    case .idPeriodEmail:
        return isEmail
    case .idPeriodPhoneNumber:
        return PhoneNumberValidator.isPhoneNumberGeneric
    case .idPeriodDob:
        return { (value: String) -> String? in
            return isDob(value, locale: FootprintProvider.shared.l10n.locale)
        }
    case .idPeriodSsn4:
        return isSSN4
    case .idPeriodSsn9:
        return { (value: String) -> String? in
            return isSSN9(value, isFlexible: false)
        }
    case .idPeriodFirstName:
        return { (value: String) -> String? in
            return isName(value, type: .firstName)
        }
    case .idPeriodLastName:
        return { (value: String) -> String? in
            return isName(value, type: .lastName)
        }
    case .idPeriodMiddleName:
        return { (value: String) -> String? in
            return isName(value, type: .middleName)
        }
    case .idPeriodCountry:
        return isSupportedCountryCode
    case .idPeriodCity:
        return { (value: String) -> String? in
            if value.isEmpty { return "City is required" }
            return nil
        }
    case .idPeriodAddressLine1:
        return { (value: String) -> String? in
            if value.isEmpty { return "Address is required" }
            return nil
        }
    case .idPeriodAddressLine2:
        return { _ in nil }
    case .idPeriodZip:
        return { (value: String) -> String? in
            if value.isEmpty { return "Zip code is required" }
            return nil
        }
    case .idPeriodState:
        return { (value: String) -> String? in
            if value.isEmpty { return "State is required" }
            return nil
        }
    default:
        return { _ in nil }
    }
}

internal func getInputProps(fieldName: VaultDI) -> FootprintInputProps {
    var inputProps: FootprintInputProps = .init()
    switch fieldName {
    case .idPeriodEmail:
        inputProps.keyboardType = .emailAddress
        inputProps.textContentType = .emailAddress
    case .idPeriodPhoneNumber:
        inputProps.keyboardType = .phonePad
        inputProps.textContentType = .telephoneNumber
        inputProps.format = formatPhoneNumber
    case .idPeriodDob:
        inputProps.keyboardType = .numberPad
        inputProps.maxLength = 10
        inputProps.format = formatDate
    case .idPeriodSsn4:
        inputProps.keyboardType = .numberPad
        inputProps.maxLength = 4
    case .idPeriodSsn9:
        inputProps.maxLength = 11
        inputProps.keyboardType = .numberPad
        inputProps.format = formatSsn9
    case .idPeriodFirstName:
        inputProps.textContentType = .name
        inputProps.keyboardType = .default
    case .idPeriodLastName:
        inputProps.textContentType = .name
        inputProps.keyboardType = .default
    case .idPeriodMiddleName:
        inputProps.textContentType = .name
        inputProps.keyboardType = .default
    case .idPeriodCountry:
        inputProps.keyboardType = .default
        inputProps.textContentType = .countryName
    case .idPeriodCity:
        inputProps.keyboardType = .default
        inputProps.textContentType = .addressCity
    case .idPeriodAddressLine1:
        inputProps.keyboardType = .default
        inputProps.textContentType = .streetAddressLine1
    case .idPeriodAddressLine2:
        inputProps.keyboardType = .default
        inputProps.textContentType = .streetAddressLine2
    case .idPeriodZip:
        inputProps.keyboardType = .numberPad
        inputProps.textContentType = .postalCode
    case .idPeriodState:
        inputProps.keyboardType = .default
        inputProps.textContentType = .addressState
    default :
        break
    }
    return inputProps
}



