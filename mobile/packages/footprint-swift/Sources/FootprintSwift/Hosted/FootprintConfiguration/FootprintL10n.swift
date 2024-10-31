import Foundation

public enum FootprintLocale: String, Encodable {
    case esMX = "es-MX"
    case enUS = "en-US"
}

public enum FootprintLanguage: String, Encodable {
    case spanish = "es"
    case english = "en"
}

public struct EmailTranslation {
    var required: String? = nil
    var invalid: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil) {
        self.required = required
        self.invalid = invalid
    }
}

public struct PhoneTranslation {
    var required: String? = nil
    var invalid: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil) {
        self.required = required
        self.invalid = invalid
    }
}

public struct DobTranslation {
    var required: String? = nil
    var invalid: String? = nil
    var tooOld: String? = nil
    var tooYoung: String? = nil
    var inTheFuture: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil, tooOld: String? = nil, tooYoung: String? = nil, inTheFuture: String? = nil) {
        self.required = required
        self.invalid = invalid
        self.tooOld = tooOld
        self.tooYoung = tooYoung
        self.inTheFuture = inTheFuture
    }
}

public struct SsnTranslation {
    var required: String? = nil
    var invalid: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil) {
        self.required = required
        self.invalid = invalid
    }
}

public struct FirstNameTranslation {
    var required: String? = nil
    var invalid: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil) {
        self.required = required
        self.invalid = invalid
    }
}

public struct LastNameTranslation {
    var required: String? = nil
    var invalid: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil) {
        self.required = required
        self.invalid = invalid
    }
}

public struct MiddleNameTranslation {
    var invalid: String? = nil
    
    public init(invalid: String? = nil) {
        self.invalid = invalid
    }
}

public struct CountryTranslation {
    var required: String? = nil
    var invalid: String? = nil
    
    public init(required: String? = nil, invalid: String? = nil) {
        self.required = required
        self.invalid = invalid
    }
}

public struct StateTranslation {
    var required: String? = nil
    
    public init(required: String? = nil) {
        self.required = required
    }
}

public struct CityTranslation {
    var required: String? = nil
    
    public init(required: String? = nil) {
        self.required = required
    }
}

public struct ZipCodeTranslation {
    var required: String? = nil
    
    public init(required: String? = nil) {
        self.required = required
    }
}

public struct AddressTranslation {
    var required: String? = nil
    
    public init(required: String? = nil) {
        self.required = required
    }
}

public struct Translation {
    public var email: EmailTranslation? = nil
    public var phone: PhoneTranslation? = nil
    public var dob: DobTranslation? = nil
    public var ssn4: SsnTranslation? = nil
    public var ssn9: SsnTranslation? = nil
    public var firstName: FirstNameTranslation? = nil
    public var lastName: LastNameTranslation? = nil
    public var middleName: MiddleNameTranslation? = nil
    public var country: CountryTranslation? = nil
    public var state: StateTranslation? = nil
    public var city: CityTranslation? = nil
    public var zipCode: ZipCodeTranslation? = nil
    public var addressLine1: AddressTranslation? = nil
    
    public init(email: EmailTranslation? = nil, phone: PhoneTranslation? = nil, dob: DobTranslation? = nil, ssn4: SsnTranslation? = nil, ssn9: SsnTranslation? = nil, firstName: FirstNameTranslation? = nil, lastName: LastNameTranslation? = nil, middleName: MiddleNameTranslation? = nil, country: CountryTranslation? = nil, state: StateTranslation? = nil, city: CityTranslation? = nil, zipCode: ZipCodeTranslation? = nil, addressLine1: AddressTranslation? = nil) {
        self.email = email
        self.phone = phone
        self.dob = dob
        self.ssn4 = ssn4
        self.ssn9 = ssn9
        self.firstName = firstName
        self.lastName = lastName
        self.middleName = middleName
        self.country = country
        self.state = state
        self.city = city
        self.zipCode = zipCode
        self.addressLine1 = addressLine1
    }
}
    

public struct FootprintL10n: Encodable {
    public var locale: FootprintLocale
    public var language: FootprintLanguage
    public var translation: Translation? = nil
    
    public init(locale: FootprintLocale? = nil, language: FootprintLanguage? = nil, translation: Translation? = nil) {
        self.locale = locale ?? .enUS
        self.language = language ?? .english
        self.translation = translation
    }
    
    private enum CodingKeys: String, CodingKey {
        case locale
        case language
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(self.locale, forKey: .locale)
        try container.encode(self.language, forKey: .language)
    }
}
