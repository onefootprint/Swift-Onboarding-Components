//
// BusinessDecryptResponse.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation

/** A key-value map with the corresponding decrypted values */
public struct BusinessDecryptResponse: Codable, JSONEncodable, Hashable {

    public enum Key: String, Codable, CaseIterable {
        case businessPeriodName = "business.name"
        case businessPeriodDba = "business.dba"
        case businessPeriodWebsite = "business.website"
        case businessPeriodPhoneNumber = "business.phone_number"
        case businessPeriodTin = "business.tin"
        case businessPeriodAddressLine1 = "business.address_line1"
        case businessPeriodAddressLine2 = "business.address_line2"
        case businessPeriodCity = "business.city"
        case businessPeriodState = "business.state"
        case businessPeriodZip = "business.zip"
        case businessPeriodCountry = "business.country"
        case businessPeriodBeneficialOwners = "business.beneficial_owners"
        case businessPeriodKycedBeneficialOwners = "business.kyced_beneficial_owners"
        case businessPeriodCorporationType = "business.corporation_type"
        case businessPeriodFormationState = "business.formation_state"
        case businessPeriodFormationDate = "business.formation_date"
        case customPeriodStar = "custom.*"
    }
    public var key: Key
    public var value: JSONValue

    public init(key: Key, value: JSONValue) {
        self.key = key
        self.value = value
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case key = "<key>"
        case value = "<value>"
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(key, forKey: .key)
        try container.encode(value, forKey: .value)
    }
}

