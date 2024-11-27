//
// IdentifyResponseUser.swift
//
// Generated by openapi-generator
// https://openapi-generator.tech
//

import Foundation

/** All of the context on the identified user, if found */
public struct IdentifyResponseUser: Codable, JSONEncodable, Hashable {

    public enum AvailableChallengeKinds: String, Codable, CaseIterable {
        case sms = "sms"
        case biometric = "biometric"
        case email = "email"
        case smsLink = "sms_link"
    }
    public enum MatchingFps: String, Codable, CaseIterable {
        case idPeriodFirstName = "id.first_name"
        case idPeriodMiddleName = "id.middle_name"
        case idPeriodLastName = "id.last_name"
        case idPeriodDob = "id.dob"
        case idPeriodSsn4 = "id.ssn4"
        case idPeriodSsn9 = "id.ssn9"
        case idPeriodAddressLine1 = "id.address_line1"
        case idPeriodAddressLine2 = "id.address_line2"
        case idPeriodCity = "id.city"
        case idPeriodState = "id.state"
        case idPeriodZip = "id.zip"
        case idPeriodCountry = "id.country"
        case idPeriodEmail = "id.email"
        case idPeriodPhoneNumber = "id.phone_number"
        case idPeriodUsLegalStatus = "id.us_legal_status"
        case idPeriodVisaKind = "id.visa_kind"
        case idPeriodVisaExpirationDate = "id.visa_expiration_date"
        case idPeriodNationality = "id.nationality"
        case idPeriodCitizenships = "id.citizenships"
        case idPeriodDriversLicenseNumber = "id.drivers_license_number"
        case idPeriodDriversLicenseState = "id.drivers_license_state"
        case idPeriodItin = "id.itin"
        case idPeriodUsTaxId = "id.us_tax_id"
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
        case investorProfilePeriodEmploymentStatus = "investor_profile.employment_status"
        case investorProfilePeriodOccupation = "investor_profile.occupation"
        case investorProfilePeriodEmployer = "investor_profile.employer"
        case investorProfilePeriodAnnualIncome = "investor_profile.annual_income"
        case investorProfilePeriodNetWorth = "investor_profile.net_worth"
        case investorProfilePeriodInvestmentGoals = "investor_profile.investment_goals"
        case investorProfilePeriodRiskTolerance = "investor_profile.risk_tolerance"
        case investorProfilePeriodDeclarations = "investor_profile.declarations"
        case investorProfilePeriodBrokerageFirmEmployer = "investor_profile.brokerage_firm_employer"
        case investorProfilePeriodSeniorExecutiveSymbols = "investor_profile.senior_executive_symbols"
        case investorProfilePeriodFamilyMemberNames = "investor_profile.family_member_names"
        case investorProfilePeriodPoliticalOrganization = "investor_profile.political_organization"
        case investorProfilePeriodFundingSources = "investor_profile.funding_sources"
        case documentPeriodIdCardPeriodFrontPeriodImage = "document.id_card.front.image"
        case documentPeriodIdCardPeriodFrontPeriodMimeType = "document.id_card.front.mime_type"
        case documentPeriodIdCardPeriodBackPeriodImage = "document.id_card.back.image"
        case documentPeriodIdCardPeriodBackPeriodMimeType = "document.id_card.back.mime_type"
        case documentPeriodIdCardPeriodSelfiePeriodImage = "document.id_card.selfie.image"
        case documentPeriodIdCardPeriodSelfiePeriodMimeType = "document.id_card.selfie.mime_type"
        case documentPeriodIdCardPeriodFullName = "document.id_card.full_name"
        case documentPeriodIdCardPeriodDob = "document.id_card.dob"
        case documentPeriodIdCardPeriodGender = "document.id_card.gender"
        case documentPeriodIdCardPeriodFullAddress = "document.id_card.full_address"
        case documentPeriodIdCardPeriodDocumentNumber = "document.id_card.document_number"
        case documentPeriodIdCardPeriodExpiresAt = "document.id_card.expires_at"
        case documentPeriodIdCardPeriodIssuedAt = "document.id_card.issued_at"
        case documentPeriodIdCardPeriodIssuingState = "document.id_card.issuing_state"
        case documentPeriodIdCardPeriodIssuingCountry = "document.id_card.issuing_country"
        case documentPeriodIdCardPeriodRefNumber = "document.id_card.ref_number"
        case documentPeriodIdCardPeriodNationality = "document.id_card.nationality"
        case documentPeriodIdCardPeriodCurp = "document.id_card.curp"
        case documentPeriodIdCardPeriodClassifiedDocumentType = "document.id_card.classified_document_type"
        case documentPeriodIdCardPeriodCurpValidationResponse = "document.id_card.curp_validation_response"
        case documentPeriodDriversLicensePeriodFrontPeriodImage = "document.drivers_license.front.image"
        case documentPeriodDriversLicensePeriodFrontPeriodMimeType = "document.drivers_license.front.mime_type"
        case documentPeriodDriversLicensePeriodBackPeriodImage = "document.drivers_license.back.image"
        case documentPeriodDriversLicensePeriodBackPeriodMimeType = "document.drivers_license.back.mime_type"
        case documentPeriodDriversLicensePeriodSelfiePeriodImage = "document.drivers_license.selfie.image"
        case documentPeriodDriversLicensePeriodSelfiePeriodMimeType = "document.drivers_license.selfie.mime_type"
        case documentPeriodDriversLicensePeriodFullName = "document.drivers_license.full_name"
        case documentPeriodDriversLicensePeriodDob = "document.drivers_license.dob"
        case documentPeriodDriversLicensePeriodGender = "document.drivers_license.gender"
        case documentPeriodDriversLicensePeriodFullAddress = "document.drivers_license.full_address"
        case documentPeriodDriversLicensePeriodDocumentNumber = "document.drivers_license.document_number"
        case documentPeriodDriversLicensePeriodExpiresAt = "document.drivers_license.expires_at"
        case documentPeriodDriversLicensePeriodIssuedAt = "document.drivers_license.issued_at"
        case documentPeriodDriversLicensePeriodIssuingState = "document.drivers_license.issuing_state"
        case documentPeriodDriversLicensePeriodIssuingCountry = "document.drivers_license.issuing_country"
        case documentPeriodDriversLicensePeriodRefNumber = "document.drivers_license.ref_number"
        case documentPeriodDriversLicensePeriodNationality = "document.drivers_license.nationality"
        case documentPeriodDriversLicensePeriodCurp = "document.drivers_license.curp"
        case documentPeriodDriversLicensePeriodClassifiedDocumentType = "document.drivers_license.classified_document_type"
        case documentPeriodDriversLicensePeriodCurpValidationResponse = "document.drivers_license.curp_validation_response"
        case documentPeriodPassportPeriodFrontPeriodImage = "document.passport.front.image"
        case documentPeriodPassportPeriodFrontPeriodMimeType = "document.passport.front.mime_type"
        case documentPeriodPassportPeriodBackPeriodImage = "document.passport.back.image"
        case documentPeriodPassportPeriodBackPeriodMimeType = "document.passport.back.mime_type"
        case documentPeriodPassportPeriodSelfiePeriodImage = "document.passport.selfie.image"
        case documentPeriodPassportPeriodSelfiePeriodMimeType = "document.passport.selfie.mime_type"
        case documentPeriodPassportPeriodFullName = "document.passport.full_name"
        case documentPeriodPassportPeriodDob = "document.passport.dob"
        case documentPeriodPassportPeriodGender = "document.passport.gender"
        case documentPeriodPassportPeriodFullAddress = "document.passport.full_address"
        case documentPeriodPassportPeriodDocumentNumber = "document.passport.document_number"
        case documentPeriodPassportPeriodExpiresAt = "document.passport.expires_at"
        case documentPeriodPassportPeriodIssuedAt = "document.passport.issued_at"
        case documentPeriodPassportPeriodIssuingState = "document.passport.issuing_state"
        case documentPeriodPassportPeriodIssuingCountry = "document.passport.issuing_country"
        case documentPeriodPassportPeriodRefNumber = "document.passport.ref_number"
        case documentPeriodPassportPeriodNationality = "document.passport.nationality"
        case documentPeriodPassportPeriodCurp = "document.passport.curp"
        case documentPeriodPassportPeriodClassifiedDocumentType = "document.passport.classified_document_type"
        case documentPeriodPassportPeriodCurpValidationResponse = "document.passport.curp_validation_response"
        case documentPeriodPassportCardPeriodFrontPeriodImage = "document.passport_card.front.image"
        case documentPeriodPassportCardPeriodFrontPeriodMimeType = "document.passport_card.front.mime_type"
        case documentPeriodPassportCardPeriodBackPeriodImage = "document.passport_card.back.image"
        case documentPeriodPassportCardPeriodBackPeriodMimeType = "document.passport_card.back.mime_type"
        case documentPeriodPassportCardPeriodSelfiePeriodImage = "document.passport_card.selfie.image"
        case documentPeriodPassportCardPeriodSelfiePeriodMimeType = "document.passport_card.selfie.mime_type"
        case documentPeriodPassportCardPeriodFullName = "document.passport_card.full_name"
        case documentPeriodPassportCardPeriodDob = "document.passport_card.dob"
        case documentPeriodPassportCardPeriodGender = "document.passport_card.gender"
        case documentPeriodPassportCardPeriodFullAddress = "document.passport_card.full_address"
        case documentPeriodPassportCardPeriodDocumentNumber = "document.passport_card.document_number"
        case documentPeriodPassportCardPeriodExpiresAt = "document.passport_card.expires_at"
        case documentPeriodPassportCardPeriodIssuedAt = "document.passport_card.issued_at"
        case documentPeriodPassportCardPeriodIssuingState = "document.passport_card.issuing_state"
        case documentPeriodPassportCardPeriodIssuingCountry = "document.passport_card.issuing_country"
        case documentPeriodPassportCardPeriodRefNumber = "document.passport_card.ref_number"
        case documentPeriodPassportCardPeriodNationality = "document.passport_card.nationality"
        case documentPeriodPassportCardPeriodCurp = "document.passport_card.curp"
        case documentPeriodPassportCardPeriodClassifiedDocumentType = "document.passport_card.classified_document_type"
        case documentPeriodPassportCardPeriodCurpValidationResponse = "document.passport_card.curp_validation_response"
        case documentPeriodPermitPeriodFrontPeriodImage = "document.permit.front.image"
        case documentPeriodPermitPeriodFrontPeriodMimeType = "document.permit.front.mime_type"
        case documentPeriodPermitPeriodBackPeriodImage = "document.permit.back.image"
        case documentPeriodPermitPeriodBackPeriodMimeType = "document.permit.back.mime_type"
        case documentPeriodPermitPeriodSelfiePeriodImage = "document.permit.selfie.image"
        case documentPeriodPermitPeriodSelfiePeriodMimeType = "document.permit.selfie.mime_type"
        case documentPeriodPermitPeriodFullName = "document.permit.full_name"
        case documentPeriodPermitPeriodDob = "document.permit.dob"
        case documentPeriodPermitPeriodGender = "document.permit.gender"
        case documentPeriodPermitPeriodFullAddress = "document.permit.full_address"
        case documentPeriodPermitPeriodDocumentNumber = "document.permit.document_number"
        case documentPeriodPermitPeriodExpiresAt = "document.permit.expires_at"
        case documentPeriodPermitPeriodIssuedAt = "document.permit.issued_at"
        case documentPeriodPermitPeriodIssuingState = "document.permit.issuing_state"
        case documentPeriodPermitPeriodIssuingCountry = "document.permit.issuing_country"
        case documentPeriodPermitPeriodRefNumber = "document.permit.ref_number"
        case documentPeriodPermitPeriodNationality = "document.permit.nationality"
        case documentPeriodPermitPeriodCurp = "document.permit.curp"
        case documentPeriodPermitPeriodClassifiedDocumentType = "document.permit.classified_document_type"
        case documentPeriodPermitPeriodCurpValidationResponse = "document.permit.curp_validation_response"
        case documentPeriodVisaPeriodFrontPeriodImage = "document.visa.front.image"
        case documentPeriodVisaPeriodFrontPeriodMimeType = "document.visa.front.mime_type"
        case documentPeriodVisaPeriodBackPeriodImage = "document.visa.back.image"
        case documentPeriodVisaPeriodBackPeriodMimeType = "document.visa.back.mime_type"
        case documentPeriodVisaPeriodSelfiePeriodImage = "document.visa.selfie.image"
        case documentPeriodVisaPeriodSelfiePeriodMimeType = "document.visa.selfie.mime_type"
        case documentPeriodVisaPeriodFullName = "document.visa.full_name"
        case documentPeriodVisaPeriodDob = "document.visa.dob"
        case documentPeriodVisaPeriodGender = "document.visa.gender"
        case documentPeriodVisaPeriodFullAddress = "document.visa.full_address"
        case documentPeriodVisaPeriodDocumentNumber = "document.visa.document_number"
        case documentPeriodVisaPeriodExpiresAt = "document.visa.expires_at"
        case documentPeriodVisaPeriodIssuedAt = "document.visa.issued_at"
        case documentPeriodVisaPeriodIssuingState = "document.visa.issuing_state"
        case documentPeriodVisaPeriodIssuingCountry = "document.visa.issuing_country"
        case documentPeriodVisaPeriodRefNumber = "document.visa.ref_number"
        case documentPeriodVisaPeriodNationality = "document.visa.nationality"
        case documentPeriodVisaPeriodCurp = "document.visa.curp"
        case documentPeriodVisaPeriodClassifiedDocumentType = "document.visa.classified_document_type"
        case documentPeriodVisaPeriodCurpValidationResponse = "document.visa.curp_validation_response"
        case documentPeriodResidenceDocumentPeriodFrontPeriodImage = "document.residence_document.front.image"
        case documentPeriodResidenceDocumentPeriodFrontPeriodMimeType = "document.residence_document.front.mime_type"
        case documentPeriodResidenceDocumentPeriodBackPeriodImage = "document.residence_document.back.image"
        case documentPeriodResidenceDocumentPeriodBackPeriodMimeType = "document.residence_document.back.mime_type"
        case documentPeriodResidenceDocumentPeriodSelfiePeriodImage = "document.residence_document.selfie.image"
        case documentPeriodResidenceDocumentPeriodSelfiePeriodMimeType = "document.residence_document.selfie.mime_type"
        case documentPeriodResidenceDocumentPeriodFullName = "document.residence_document.full_name"
        case documentPeriodResidenceDocumentPeriodDob = "document.residence_document.dob"
        case documentPeriodResidenceDocumentPeriodGender = "document.residence_document.gender"
        case documentPeriodResidenceDocumentPeriodFullAddress = "document.residence_document.full_address"
        case documentPeriodResidenceDocumentPeriodDocumentNumber = "document.residence_document.document_number"
        case documentPeriodResidenceDocumentPeriodExpiresAt = "document.residence_document.expires_at"
        case documentPeriodResidenceDocumentPeriodIssuedAt = "document.residence_document.issued_at"
        case documentPeriodResidenceDocumentPeriodIssuingState = "document.residence_document.issuing_state"
        case documentPeriodResidenceDocumentPeriodIssuingCountry = "document.residence_document.issuing_country"
        case documentPeriodResidenceDocumentPeriodRefNumber = "document.residence_document.ref_number"
        case documentPeriodResidenceDocumentPeriodNationality = "document.residence_document.nationality"
        case documentPeriodResidenceDocumentPeriodCurp = "document.residence_document.curp"
        case documentPeriodResidenceDocumentPeriodClassifiedDocumentType = "document.residence_document.classified_document_type"
        case documentPeriodResidenceDocumentPeriodCurpValidationResponse = "document.residence_document.curp_validation_response"
        case documentPeriodVoterIdentificationPeriodFrontPeriodImage = "document.voter_identification.front.image"
        case documentPeriodVoterIdentificationPeriodFrontPeriodMimeType = "document.voter_identification.front.mime_type"
        case documentPeriodVoterIdentificationPeriodBackPeriodImage = "document.voter_identification.back.image"
        case documentPeriodVoterIdentificationPeriodBackPeriodMimeType = "document.voter_identification.back.mime_type"
        case documentPeriodVoterIdentificationPeriodSelfiePeriodImage = "document.voter_identification.selfie.image"
        case documentPeriodVoterIdentificationPeriodSelfiePeriodMimeType = "document.voter_identification.selfie.mime_type"
        case documentPeriodVoterIdentificationPeriodFullName = "document.voter_identification.full_name"
        case documentPeriodVoterIdentificationPeriodDob = "document.voter_identification.dob"
        case documentPeriodVoterIdentificationPeriodGender = "document.voter_identification.gender"
        case documentPeriodVoterIdentificationPeriodFullAddress = "document.voter_identification.full_address"
        case documentPeriodVoterIdentificationPeriodDocumentNumber = "document.voter_identification.document_number"
        case documentPeriodVoterIdentificationPeriodExpiresAt = "document.voter_identification.expires_at"
        case documentPeriodVoterIdentificationPeriodIssuedAt = "document.voter_identification.issued_at"
        case documentPeriodVoterIdentificationPeriodIssuingState = "document.voter_identification.issuing_state"
        case documentPeriodVoterIdentificationPeriodIssuingCountry = "document.voter_identification.issuing_country"
        case documentPeriodVoterIdentificationPeriodRefNumber = "document.voter_identification.ref_number"
        case documentPeriodVoterIdentificationPeriodNationality = "document.voter_identification.nationality"
        case documentPeriodVoterIdentificationPeriodCurp = "document.voter_identification.curp"
        case documentPeriodVoterIdentificationPeriodClassifiedDocumentType = "document.voter_identification.classified_document_type"
        case documentPeriodVoterIdentificationPeriodCurpValidationResponse = "document.voter_identification.curp_validation_response"
        case documentPeriodFinraComplianceLetter = "document.finra_compliance_letter"
        case documentPeriodProofOfAddressPeriodImage = "document.proof_of_address.image"
        case documentPeriodSsnCardPeriodImage = "document.ssn_card.image"
        case documentPeriodCustomPeriodStar = "document.custom.*"
        case cardPeriodStarPeriodNumber = "card.*.number"
        case cardPeriodStarPeriodExpiration = "card.*.expiration"
        case cardPeriodStarPeriodCvc = "card.*.cvc"
        case cardPeriodStarPeriodName = "card.*.name"
        case cardPeriodStarPeriodBillingAddressPeriodZip = "card.*.billing_address.zip"
        case cardPeriodStarPeriodBillingAddressPeriodCountry = "card.*.billing_address.country"
        case cardPeriodStarPeriodExpirationMonth = "card.*.expiration_month"
        case cardPeriodStarPeriodExpirationYear = "card.*.expiration_year"
        case cardPeriodStarPeriodNumberLast4 = "card.*.number_last4"
        case cardPeriodStarPeriodIssuer = "card.*.issuer"
        case bankPeriodStarPeriodName = "bank.*.name"
        case bankPeriodStarPeriodAchRoutingNumber = "bank.*.ach_routing_number"
        case bankPeriodStarPeriodAchAccountNumber = "bank.*.ach_account_number"
        case bankPeriodStarPeriodAchAccountId = "bank.*.ach_account_id"
        case bankPeriodStarPeriodAccountType = "bank.*.account_type"
    }
    public enum TokenScopes: String, Codable, CaseIterable {
        case signUp = "sign_up"
        case auth = "auth"
        case basicProfile = "basic_profile"
        case sensitiveProfile = "sensitive_profile"
        case handoff = "handoff"
        case vaultData = "vault_data"
        case explicitAuth = "explicit_auth"
    }
    public var authMethods: [IdentifyResponseUserAuthMethodsInner]
    public var availableChallengeKinds: [AvailableChallengeKinds]
    /** When true, allowed to create a new user via a signup challenge even when there's already an  existing user with this contact info. Generally, a user can make a new vault IF they're not  in a context logging into a tenant that they've already onboarded onto */
    public var canInitiateSignupChallenge: Bool
    /** Signals that one or more biometric credentials support syncing and may be available to use  on desktop/other devices */
    public var hasSyncablePasskey: Bool
    public var isUnverified: Bool
    /** The list of DataIdentifiers whose fingerprints matched on the vault */
    public var matchingFps: [MatchingFps]
    /** Populated only when identifying a user via auth token that was created by the tenant */
    public var scrubbedEmail: String?
    public var scrubbedPhone: String?
    /** An cryptographically generated auth token to authenticate a session */
    public var token: String
    /** The scopes of the returned token */
    public var tokenScopes: [TokenScopes]

    public init(authMethods: [IdentifyResponseUserAuthMethodsInner], availableChallengeKinds: [AvailableChallengeKinds], canInitiateSignupChallenge: Bool, hasSyncablePasskey: Bool, isUnverified: Bool, matchingFps: [MatchingFps], scrubbedEmail: String? = nil, scrubbedPhone: String? = nil, token: String, tokenScopes: [TokenScopes]) {
        self.authMethods = authMethods
        self.availableChallengeKinds = availableChallengeKinds
        self.canInitiateSignupChallenge = canInitiateSignupChallenge
        self.hasSyncablePasskey = hasSyncablePasskey
        self.isUnverified = isUnverified
        self.matchingFps = matchingFps
        self.scrubbedEmail = scrubbedEmail
        self.scrubbedPhone = scrubbedPhone
        self.token = token
        self.tokenScopes = tokenScopes
    }

    public enum CodingKeys: String, CodingKey, CaseIterable {
        case authMethods = "auth_methods"
        case availableChallengeKinds = "available_challenge_kinds"
        case canInitiateSignupChallenge = "can_initiate_signup_challenge"
        case hasSyncablePasskey = "has_syncable_passkey"
        case isUnverified = "is_unverified"
        case matchingFps = "matching_fps"
        case scrubbedEmail = "scrubbed_email"
        case scrubbedPhone = "scrubbed_phone"
        case token
        case tokenScopes = "token_scopes"
    }

    // Encodable protocol methods

    public func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(authMethods, forKey: .authMethods)
        try container.encode(availableChallengeKinds, forKey: .availableChallengeKinds)
        try container.encode(canInitiateSignupChallenge, forKey: .canInitiateSignupChallenge)
        try container.encode(hasSyncablePasskey, forKey: .hasSyncablePasskey)
        try container.encode(isUnverified, forKey: .isUnverified)
        try container.encode(matchingFps, forKey: .matchingFps)
        try container.encodeIfPresent(scrubbedEmail, forKey: .scrubbedEmail)
        try container.encodeIfPresent(scrubbedPhone, forKey: .scrubbedPhone)
        try container.encode(token, forKey: .token)
        try container.encode(tokenScopes, forKey: .tokenScopes)
    }
}

