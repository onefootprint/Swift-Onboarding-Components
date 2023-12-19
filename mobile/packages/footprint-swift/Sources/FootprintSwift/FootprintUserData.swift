import Foundation

public struct FootprintUserData: Encodable {
    public var email: String?
    public var phoneNumber: String?
    public var firstName: String?
    public var lastName: String?
    public var dob: String?
    public var addressLine1: String?
    public var addressLine2: String?
    public var city: String?
    public var state: String?
    public var country: String? // 2 letter country code
    public var zip: String?
    public var ssn9: String?
    public var ssn4: String?
    public var nationality: String? // 2 letter country code
    public var usLegalStatus: String?
    public var citizenships: [String]? // array of 2 letter country codes
    public var visaKind: String?
    public var visaExpirationDate: String?
    
    public init(email: String? = nil,
                phoneNumber: String? = nil,
                firstName: String? = nil,
                lastName: String? = nil,
                dob: String? = nil,
                addressLine1: String? = nil,
                addressLine2: String? = nil,
                city: String? = nil,
                state: String?=nil,
                country: String? = nil,
                zip: String? = nil,
                ssn9: String? = nil,
                ssn4: String? = nil,
                nationality: String? = nil,
                usLegalStatus: String? = nil,
                citizenships: [String]? = nil,
                visaKind: String? = nil,
                visaExpirationDate: String? = nil) {
        self.email = email
        self.phoneNumber = phoneNumber
        self.firstName = firstName
        self.lastName = lastName
        self.dob = dob
        self.addressLine1 = addressLine1
        self.addressLine2 = addressLine2
        self.city = city
        self.state = state
        self.country = country
        self.zip = zip
        self.ssn9 = ssn9
        self.ssn4 = ssn4
        self.nationality = nationality
        self.usLegalStatus = usLegalStatus
        self.citizenships = citizenships
        self.visaKind = visaKind
        self.visaExpirationDate = visaExpirationDate
    }
    
    private enum CodingKeys: String, CodingKey {
        case email = "id.email"
        case phoneNumber = "id.phone_number"
        case firstName = "id.first_name"
        case lastName = "id.last_name"
        case dob = "id.dob"
        case addressLine1 = "id.address_line1"
        case addressLine2 = "id.address_line2"
        case city = "id.city"
        case state = "id.state"
        case country = "id.country"
        case zip = "id.zip"
        case ssn9 = "id.ssn9"
        case ssn4 = "id.ssn4"
        case nationality = "id.nationality"
        case usLegalStatus = "id.us_legal_status"
        case citizenships = "id.citizenships"
        case visaKind = "id.visa_kind"
        case visaExpirationDate = "id.visa_expiration_date"
    }
    
    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encodeIfPresent(self.email, forKey: .email)
        try container.encodeIfPresent(self.phoneNumber, forKey: .phoneNumber)
        try container.encodeIfPresent(self.firstName, forKey: .firstName)
        try container.encodeIfPresent(self.lastName, forKey: .lastName)
        try container.encodeIfPresent(self.dob, forKey: .dob)
        try container.encodeIfPresent(self.addressLine1, forKey: .addressLine1)
        try container.encodeIfPresent(self.addressLine2, forKey: .addressLine2)
        try container.encodeIfPresent(self.city, forKey: .city)
        try container.encodeIfPresent(self.state, forKey: .state)
        try container.encodeIfPresent(self.country, forKey: .country)
        try container.encodeIfPresent(self.zip, forKey: .zip)
        try container.encodeIfPresent(self.ssn9, forKey: .ssn9)
        try container.encodeIfPresent(self.ssn4, forKey: .ssn4)
        try container.encodeIfPresent(self.nationality, forKey: .nationality)
        try container.encodeIfPresent(self.usLegalStatus, forKey: .usLegalStatus)
        try container.encodeIfPresent(self.citizenships, forKey: .citizenships)
        try container.encodeIfPresent(self.visaKind, forKey: .visaKind)
        try container.encodeIfPresent(self.visaExpirationDate, forKey: .visaExpirationDate)
    }
}
