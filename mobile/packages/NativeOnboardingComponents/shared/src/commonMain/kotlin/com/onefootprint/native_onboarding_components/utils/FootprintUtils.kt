package com.onefootprint.native_onboarding_components.utils

import com.onefootprint.native_onboarding_components.models.FootprintSupportedCountryCodes
import com.onefootprint.native_onboarding_components.models.FootprintSupportedUsStatesAndTerritories
import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.VaultData

/**
 * Publicly exposed utilities for working that tenants can use.
 */
object FootprintUtils {
    fun isSupportedCountryCode(countryCode: String): Boolean {
        return FootprintSupportedCountryCodes.entries.any { it.code == countryCode }
    }

    fun isSupportedUsStateOrTerritoryCode(usStateOrTerritoryCode: String): Boolean {
        return FootprintSupportedUsStatesAndTerritories.entries.any { it.code == usStateOrTerritoryCode }
    }

    fun dataIdentifiersFromVaultData(vaultData: VaultData): Map<DataIdentifier, Any?> = mapOf(
        DataIdentifier.idFirstName to vaultData.idFirstName,
        DataIdentifier.idMiddleName to vaultData.idMiddleName,
        DataIdentifier.idLastName to vaultData.idLastName,
        DataIdentifier.idDob to vaultData.idDob,
        DataIdentifier.idSsn4 to vaultData.idSsn4,
        DataIdentifier.idSsn9 to vaultData.idSsn9,
        DataIdentifier.idUsTaxId to vaultData.idUsTaxId,
        DataIdentifier.idAddressLine1 to vaultData.idAddressLine1,
        DataIdentifier.idAddressLine2 to vaultData.idAddressLine2,
        DataIdentifier.idCity to vaultData.idCity,
        DataIdentifier.idState to vaultData.idState,
        DataIdentifier.idZip to vaultData.idZip,
        DataIdentifier.idCountry to vaultData.idCountry,
        DataIdentifier.idEmail to vaultData.idEmail,
        DataIdentifier.idPhoneNumber to vaultData.idPhoneNumber,
        DataIdentifier.idUsLegalStatus to vaultData.idUsLegalStatus,
        DataIdentifier.idVisaKind to vaultData.idVisaKind,
        DataIdentifier.idVisaExpirationDate to vaultData.idVisaExpirationDate,
        DataIdentifier.idCitizenships to vaultData.idCitizenships,
        DataIdentifier.idNationality to vaultData.idNationality,
        DataIdentifier.idDriversLicenseNumber to vaultData.idDriversLicenseNumber,
        DataIdentifier.idDriversLicenseState to vaultData.idDriversLicenseState,
        DataIdentifier.idItin to vaultData.idItin,
        DataIdentifier.investorProfileEmploymentStatus to vaultData.investorProfileEmploymentStatus,
        DataIdentifier.investorProfileOccupation to vaultData.investorProfileOccupation,
        DataIdentifier.investorProfileEmployer to vaultData.investorProfileEmployer,
        DataIdentifier.investorProfileAnnualIncome to vaultData.investorProfileAnnualIncome,
        DataIdentifier.investorProfileNetWorth to vaultData.investorProfileNetWorth,
        DataIdentifier.investorProfileInvestmentGoals to vaultData.investorProfileInvestmentGoals,
        DataIdentifier.investorProfileRiskTolerance to vaultData.investorProfileRiskTolerance,
        DataIdentifier.investorProfileDeclarations to vaultData.investorProfileDeclarations,
        DataIdentifier.investorProfileBrokerageFirmEmployer to vaultData.investorProfileBrokerageFirmEmployer,
        DataIdentifier.investorProfileSeniorExecutiveSymbols to vaultData.investorProfileSeniorExecutiveSymbols,
        DataIdentifier.investorProfileFamilyMemberNames to vaultData.investorProfileFamilyMemberNames,
        DataIdentifier.investorProfilePoliticalOrganization to vaultData.investorProfilePoliticalOrganization,
        DataIdentifier.investorProfileFundingSources to vaultData.investorProfileFundingSources
    )
}