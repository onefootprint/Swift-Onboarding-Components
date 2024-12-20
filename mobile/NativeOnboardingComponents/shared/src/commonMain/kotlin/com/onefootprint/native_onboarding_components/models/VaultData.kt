package com.onefootprint.native_onboarding_components.models

import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.InvestorProfileDeclaration
import org.openapitools.client.models.InvestorProfileFundingSource
import org.openapitools.client.models.InvestorProfileInvestmentGoal
import org.openapitools.client.models.Iso3166TwoDigitCountryCode
import org.openapitools.client.models.ModernRawUserDataRequest
import org.openapitools.client.models.ModernUserDecryptResponse

class VaultData(
    val idFirstName: String? = null,
    val idMiddleName: String? = null,
    val idLastName: String? = null,
    val idDob: String? = null,
    val idSsn4: String? = null,
    val idSsn9: String? = null,
    val idUsTaxId: String? = null,
    val idAddressLine1: String? = null,
    val idAddressLine2: String? = null,
    val idCity: String? = null,
    val idState: String? = null,
    val idZip: String? = null,
    val idCountry: String? = null,
    val idEmail: String? = null,
    val idPhoneNumber: String? = null,
    val idUsLegalStatus: String? = null,
    val idVisaKind: String? = null,
    val idVisaExpirationDate: String? = null,
    val idCitizenships: List<Iso3166TwoDigitCountryCode>? = null,
    val idNationality: String? = null,
    val idDriversLicenseNumber: String? = null,
    val idDriversLicenseState: String? = null,
    val idItin: String? = null,
    val investorProfileEmploymentStatus: String? = null,
    val investorProfileOccupation: String? = null,
    val investorProfileEmployer: String? = null,
    val investorProfileAnnualIncome: String? = null,
    val investorProfileNetWorth: String? = null,
    val investorProfileInvestmentGoals: List<InvestorProfileInvestmentGoal>? = null,
    val investorProfileRiskTolerance: String? = null,
    val investorProfileDeclarations: List<InvestorProfileDeclaration>? = null,
    val investorProfileBrokerageFirmEmployer: String? = null,
    val investorProfileSeniorExecutiveSymbols: List<String>? = null,
    val investorProfileFamilyMemberNames: List<String>? = null,
    val investorProfilePoliticalOrganization: String? = null,
    val investorProfileFundingSources: List<InvestorProfileFundingSource>? = null
) {
    companion object {
        internal fun fromModernUserDecryptResponse(from: ModernUserDecryptResponse): VaultData {
            return VaultData(
                idFirstName = from.idFirstName,
                idMiddleName = from.idMiddleName,
                idLastName = from.idLastName,
                idDob = from.idDob,
                idSsn4 = from.idSsn4,
                idSsn9 = from.idSsn9,
                idUsTaxId = from.idUsTaxId,
                idAddressLine1 = from.idAddressLine1,
                idAddressLine2 = from.idAddressLine2,
                idCity = from.idCity,
                idState = from.idState,
                idZip = from.idZip,
                idCountry = from.idCountry,
                idEmail = from.idEmail,
                idPhoneNumber = from.idPhoneNumber,
                idUsLegalStatus = from.idUsLegalStatus,
                idVisaKind = from.idVisaKind,
                idVisaExpirationDate = from.idVisaExpirationDate,
                idCitizenships = from.idCitizenships,
                idNationality = from.idNationality,
                idDriversLicenseNumber = from.idDriversLicenseNumber,
                idDriversLicenseState = from.idDriversLicenseState,
                idItin = from.idItin,
                investorProfileEmploymentStatus = from.investorProfileEmploymentStatus,
                investorProfileOccupation = from.investorProfileOccupation,
                investorProfileEmployer = from.investorProfileEmployer,
                investorProfileAnnualIncome = from.investorProfileAnnualIncome,
                investorProfileNetWorth = from.investorProfileNetWorth,
                investorProfileInvestmentGoals = from.investorProfileInvestmentGoals,
                investorProfileRiskTolerance = from.investorProfileRiskTolerance,
                investorProfileDeclarations = from.investorProfileDeclarations,
                investorProfileBrokerageFirmEmployer = from.investorProfileBrokerageFirmEmployer,
                investorProfileSeniorExecutiveSymbols = from.investorProfileSeniorExecutiveSymbols,
                investorProfileFamilyMemberNames = from.investorProfileFamilyMemberNames,
                investorProfilePoliticalOrganization = from.investorProfilePoliticalOrganization,
                investorProfileFundingSources = from.investorProfileFundingSources
            )
        }
    }

    // Expose as map
    fun asMap(): Map<DataIdentifier, Any?> = mapOf(
        DataIdentifier.idFirstName to idFirstName,
        DataIdentifier.idMiddleName to idMiddleName,
        DataIdentifier.idLastName to idLastName,
        DataIdentifier.idDob to idDob,
        DataIdentifier.idSsn4 to idSsn4,
        DataIdentifier.idSsn9 to idSsn9,
        DataIdentifier.idUsTaxId to idUsTaxId,
        DataIdentifier.idAddressLine1 to idAddressLine1,
        DataIdentifier.idAddressLine2 to idAddressLine2,
        DataIdentifier.idCity to idCity,
        DataIdentifier.idState to idState,
        DataIdentifier.idZip to idZip,
        DataIdentifier.idCountry to idCountry,
        DataIdentifier.idEmail to idEmail,
        DataIdentifier.idPhoneNumber to idPhoneNumber,
        DataIdentifier.idUsLegalStatus to idUsLegalStatus,
        DataIdentifier.idVisaKind to idVisaKind,
        DataIdentifier.idVisaExpirationDate to idVisaExpirationDate,
        DataIdentifier.idCitizenships to idCitizenships,
        DataIdentifier.idNationality to idNationality,
        DataIdentifier.idDriversLicenseNumber to idDriversLicenseNumber,
        DataIdentifier.idDriversLicenseState to idDriversLicenseState,
        DataIdentifier.idItin to idItin,
        DataIdentifier.investorProfileEmploymentStatus to investorProfileEmploymentStatus,
        DataIdentifier.investorProfileOccupation to investorProfileOccupation,
        DataIdentifier.investorProfileEmployer to investorProfileEmployer,
        DataIdentifier.investorProfileAnnualIncome to investorProfileAnnualIncome,
        DataIdentifier.investorProfileNetWorth to investorProfileNetWorth,
        DataIdentifier.investorProfileInvestmentGoals to investorProfileInvestmentGoals,
        DataIdentifier.investorProfileRiskTolerance to investorProfileRiskTolerance,
        DataIdentifier.investorProfileDeclarations to investorProfileDeclarations,
        DataIdentifier.investorProfileBrokerageFirmEmployer to investorProfileBrokerageFirmEmployer,
        DataIdentifier.investorProfileSeniorExecutiveSymbols to investorProfileSeniorExecutiveSymbols,
        DataIdentifier.investorProfileFamilyMemberNames to investorProfileFamilyMemberNames,
        DataIdentifier.investorProfilePoliticalOrganization to investorProfilePoliticalOrganization,
        DataIdentifier.investorProfileFundingSources to investorProfileFundingSources
    )

    internal fun toModernRawUserDataRequest(): ModernRawUserDataRequest {
        val modernRawUserDataRequest = ModernRawUserDataRequest(
            idFirstName = idFirstName,
            idMiddleName = idMiddleName,
            idLastName = idLastName,
            idDob = idDob,
            idSsn4 = idSsn4,
            idSsn9 = idSsn9,
            idUsTaxId = idUsTaxId,
            idAddressLine1 = idAddressLine1,
            idAddressLine2 = idAddressLine2,
            idCity = idCity,
            idState = idState,
            idZip = idZip,
            idCountry = idCountry,
            idEmail = idEmail,
            idPhoneNumber = idPhoneNumber,
            idUsLegalStatus = idUsLegalStatus,
            idVisaKind = idVisaKind,
            idVisaExpirationDate = idVisaExpirationDate,
            idCitizenships = idCitizenships,
            idNationality = idNationality,
            idDriversLicenseNumber = idDriversLicenseNumber,
            idDriversLicenseState = idDriversLicenseState,
            idItin = idItin,
            investorProfileEmploymentStatus = investorProfileEmploymentStatus,
            investorProfileOccupation = investorProfileOccupation,
            investorProfileEmployer = investorProfileEmployer,
            investorProfileAnnualIncome = investorProfileAnnualIncome,
            investorProfileNetWorth = investorProfileNetWorth,
            investorProfileInvestmentGoals = investorProfileInvestmentGoals,
            investorProfileRiskTolerance = investorProfileRiskTolerance,
            investorProfileDeclarations = investorProfileDeclarations,
            investorProfileBrokerageFirmEmployer = investorProfileBrokerageFirmEmployer,
            investorProfileSeniorExecutiveSymbols = investorProfileSeniorExecutiveSymbols,
            investorProfileFamilyMemberNames = investorProfileFamilyMemberNames,
            investorProfilePoliticalOrganization = investorProfilePoliticalOrganization,
            investorProfileFundingSources = investorProfileFundingSources
        )
        return modernRawUserDataRequest
    }

    // to avoid unintentional modification of the original object, we return a new object with the updated values
    // this way tenants can't accidentally modify vault data
    internal fun getUpdatedVaultData(
        idFirstName: String? = this.idFirstName,
        idMiddleName: String? = this.idMiddleName,
        idLastName: String? = this.idLastName,
        idDob: String? = this.idDob,
        idSsn4: String? = this.idSsn4,
        idSsn9: String? = this.idSsn9,
        idUsTaxId: String? = this.idUsTaxId,
        idAddressLine1: String? = this.idAddressLine1,
        idAddressLine2: String? = this.idAddressLine2,
        idCity: String? = this.idCity,
        idState: String? = this.idState,
        idZip: String? = this.idZip,
        idCountry: String? = this.idCountry,
        idEmail: String? = this.idEmail,
        idPhoneNumber: String? = this.idPhoneNumber,
        idUsLegalStatus: String? = this.idUsLegalStatus,
        idVisaKind: String? = this.idVisaKind,
        idVisaExpirationDate: String? = this.idVisaExpirationDate,
        idCitizenships: List<Iso3166TwoDigitCountryCode>? = this.idCitizenships,
        idNationality: String? = this.idNationality,
        idDriversLicenseNumber: String? = this.idDriversLicenseNumber,
        idDriversLicenseState: String? = this.idDriversLicenseState,
        idItin: String? = this.idItin,
        investorProfileEmploymentStatus: String? = this.investorProfileEmploymentStatus,
        investorProfileOccupation: String? = this.investorProfileOccupation,
        investorProfileEmployer: String? = this.investorProfileEmployer,
        investorProfileAnnualIncome: String? = this.investorProfileAnnualIncome,
        investorProfileNetWorth: String? = this.investorProfileNetWorth,
        investorProfileInvestmentGoals: List<InvestorProfileInvestmentGoal>? = this.investorProfileInvestmentGoals,
        investorProfileRiskTolerance: String? = this.investorProfileRiskTolerance,
        investorProfileDeclarations: List<InvestorProfileDeclaration>? = this.investorProfileDeclarations,
        investorProfileBrokerageFirmEmployer: String? = this.investorProfileBrokerageFirmEmployer,
        investorProfileSeniorExecutiveSymbols: List<String>? = this.investorProfileSeniorExecutiveSymbols,
        investorProfileFamilyMemberNames: List<String>? = this.investorProfileFamilyMemberNames,
        investorProfilePoliticalOrganization: String? = this.investorProfilePoliticalOrganization,
        investorProfileFundingSources: List<InvestorProfileFundingSource>? = this.investorProfileFundingSources
    ): VaultData {
        return VaultData(
            idFirstName = idFirstName,
            idMiddleName = idMiddleName,
            idLastName = idLastName,
            idDob = idDob,
            idSsn4 = idSsn4,
            idSsn9 = idSsn9,
            idUsTaxId = idUsTaxId,
            idAddressLine1 = idAddressLine1,
            idAddressLine2 = idAddressLine2,
            idCity = idCity,
            idState = idState,
            idZip = idZip,
            idCountry = idCountry,
            idEmail = idEmail,
            idPhoneNumber = idPhoneNumber,
            idUsLegalStatus = idUsLegalStatus,
            idVisaKind = idVisaKind,
            idVisaExpirationDate = idVisaExpirationDate,
            idCitizenships = idCitizenships,
            idNationality = idNationality,
            idDriversLicenseNumber = idDriversLicenseNumber,
            idDriversLicenseState = idDriversLicenseState,
            idItin = idItin,
            investorProfileEmploymentStatus = investorProfileEmploymentStatus,
            investorProfileOccupation = investorProfileOccupation,
            investorProfileEmployer = investorProfileEmployer,
            investorProfileAnnualIncome = investorProfileAnnualIncome,
            investorProfileNetWorth = investorProfileNetWorth,
            investorProfileInvestmentGoals = investorProfileInvestmentGoals,
            investorProfileRiskTolerance = investorProfileRiskTolerance,
            investorProfileDeclarations = investorProfileDeclarations,
            investorProfileBrokerageFirmEmployer = investorProfileBrokerageFirmEmployer,
            investorProfileSeniorExecutiveSymbols = investorProfileSeniorExecutiveSymbols,
            investorProfileFamilyMemberNames = investorProfileFamilyMemberNames,
            investorProfilePoliticalOrganization = investorProfilePoliticalOrganization,
            investorProfileFundingSources = investorProfileFundingSources
        )
    }

    override fun toString(): String {
        // show the value if not null, otherwise omit the key
        return "VaultData(" +
                (if (idFirstName != null) "idFirstName=$idFirstName, " else "") +
                (if (idMiddleName != null) "idMiddleName=$idMiddleName, " else "") +
                (if (idLastName != null) "idLastName=$idLastName, " else "") +
                (if (idDob != null) "idDob=$idDob, " else "") +
                (if (idSsn4 != null) "idSsn4=$idSsn4, " else "") +
                (if (idSsn9 != null) "idSsn9=$idSsn9, " else "") +
                (if (idUsTaxId != null) "idUsTaxId=$idUsTaxId, " else "") +
                (if (idAddressLine1 != null) "idAddressLine1=$idAddressLine1, " else "") +
                (if (idAddressLine2 != null) "idAddressLine2=$idAddressLine2, " else "") +
                (if (idCity != null) "idCity=$idCity, " else "") +
                (if (idState != null) "idState=$idState, " else "") +
                (if (idZip != null) "idZip=$idZip, " else "") +
                (if (idCountry != null) "idCountry=$idCountry, " else "") +
                (if (idEmail != null) "idEmail=$idEmail, " else "") +
                (if (idPhoneNumber != null) "idPhoneNumber=$idPhoneNumber, " else "") +
                (if (idUsLegalStatus != null) "idUsLegalStatus=$idUsLegalStatus, " else "") +
                (if (idVisaKind != null) "idVisaKind=$idVisaKind, " else "") +
                (if (idVisaExpirationDate != null) "idVisaExpirationDate=$idVisaExpirationDate, " else "") +
                (if (idCitizenships != null) "idCitizenships=$idCitizenships, " else "") +
                (if (idNationality != null) "idNationality=$idNationality, " else "") +
                (if (idDriversLicenseNumber != null) "idDriversLicenseNumber=$idDriversLicenseNumber, " else "") +
                (if (idDriversLicenseState != null) "idDriversLicenseState=$idDriversLicenseState, " else "") +
                (if (idItin != null) "idItin=$idItin, " else "") +
                (if (investorProfileEmploymentStatus != null) "investorProfileEmploymentStatus=$investorProfileEmploymentStatus, " else "") +
                (if (investorProfileOccupation != null) "investorProfileOccupation=$investorProfileOccupation, " else "") +
                (if (investorProfileEmployer != null) "investorProfileEmployer=$investorProfileEmployer, " else "") +
                (if (investorProfileAnnualIncome != null) "investorProfileAnnualIncome=$investorProfileAnnualIncome, " else "") +
                (if (investorProfileNetWorth != null) "investorProfileNetWorth=$investorProfileNetWorth, " else "") +
                (if (investorProfileInvestmentGoals != null) "investorProfileInvestmentGoals=$investorProfileInvestmentGoals, " else "") +
                (if (investorProfileRiskTolerance != null) "investorProfileRiskTolerance=$investorProfileRiskTolerance, " else "") +
                (if (investorProfileDeclarations != null) "investorProfileDeclarations=$investorProfileDeclarations, " else "") +
                (if (investorProfileBrokerageFirmEmployer != null) "investorProfileBrokerageFirmEmployer=$investorProfileBrokerageFirmEmployer, " else "") +
                (if (investorProfileSeniorExecutiveSymbols != null) "investorProfileSeniorExecutiveSymbols=$investorProfileSeniorExecutiveSymbols, " else "") +
                (if (investorProfileFamilyMemberNames != null) "investorProfileFamilyMemberNames=$investorProfileFamilyMemberNames, " else "") +
                (if (investorProfilePoliticalOrganization != null
                ) "investorProfilePoliticalOrganization=$investorProfilePoliticalOrganization, " else "") +
                (if (investorProfileFundingSources != null) "investorProfileFundingSources=$investorProfileFundingSources, " else "") +
                ")"
    }
}
