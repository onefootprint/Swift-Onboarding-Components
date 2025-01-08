package com.onefootprint.native_onboarding_components.utils

import com.onefootprint.native_onboarding_components.FootprintQueries
import com.onefootprint.native_onboarding_components.models.FootprintException
import com.onefootprint.native_onboarding_components.models.RequirementFields
import com.onefootprint.native_onboarding_components.models.Requirements
import com.onefootprint.native_onboarding_components.models.RequirementsState
import org.openapitools.client.models.CollectedDataOption
import org.openapitools.client.models.DataIdentifier
import org.openapitools.client.models.OnboardingRequirementCollectData
import org.openapitools.client.models.OnboardingRequirementProcess

internal object RequirementUtil {
    private fun getDisFromCdo(cdo: CollectedDataOption): Array<DataIdentifier> {
        return when (cdo) {
            // id
            CollectedDataOption.person_name -> arrayOf(
                DataIdentifier.idFirstName,
                DataIdentifier.idLastName,
                DataIdentifier.idMiddleName
            )

            CollectedDataOption.dob -> arrayOf(DataIdentifier.idDob)
            CollectedDataOption.ssn4 -> arrayOf(DataIdentifier.idSsn4)
            CollectedDataOption.ssn9 -> arrayOf(DataIdentifier.idSsn9)
            CollectedDataOption.us_tax_id -> arrayOf(DataIdentifier.idUsTaxId)
            CollectedDataOption.full_address -> arrayOf(
                DataIdentifier.idAddressLine1,
                DataIdentifier.idAddressLine2,
                DataIdentifier.idCity,
                DataIdentifier.idState,
                DataIdentifier.idZip,
                DataIdentifier.idCountry
            )

            CollectedDataOption.email -> arrayOf(DataIdentifier.idEmail)
            CollectedDataOption.phone_number -> arrayOf(DataIdentifier.idPhoneNumber)
            CollectedDataOption.nationality -> arrayOf(DataIdentifier.idNationality)
            CollectedDataOption.us_legal_status -> arrayOf(
                DataIdentifier.idUsLegalStatus,
                DataIdentifier.idVisaKind,
                DataIdentifier.idVisaExpirationDate,
                DataIdentifier.idCitizenships,
                DataIdentifier.idNationality
            )
            
            // Investor Profile
            CollectedDataOption.investor_profile -> arrayOf(
                DataIdentifier.investorProfileEmploymentStatus,
                DataIdentifier.investorProfileOccupation,
                DataIdentifier.investorProfileEmployer,
                DataIdentifier.investorProfileAnnualIncome,
                DataIdentifier.investorProfileNetWorth,
                DataIdentifier.investorProfileInvestmentGoals,
                DataIdentifier.investorProfileRiskTolerance,
                DataIdentifier.investorProfileDeclarations,
                DataIdentifier.investorProfileBrokerageFirmEmployer,
                DataIdentifier.investorProfileSeniorExecutiveSymbols,
                DataIdentifier.investorProfileFamilyMemberNames,
                DataIdentifier.investorProfilePoliticalOrganization,
                DataIdentifier.investorProfileFundingSources
            )

            else -> arrayOf()
        }
    }

    suspend fun getRequirements(authToken: String?): Requirements {
        if(authToken == null){
            throw FootprintException(
                kind = FootprintException.ErrorKind.AUTH_ERROR,
                message = "Could not find a verified auth token while getting requirement"
            )
        }
        val onboardingStatus = FootprintQueries.getOnboardingStatus(authToken = authToken)
        val missing: MutableList<DataIdentifier> = mutableListOf()
        val optional: MutableList<DataIdentifier> = mutableListOf()
        val collected: MutableList<DataIdentifier> = mutableListOf()
        var isCompleted = true
        var isCompletedWithoutProcess = true
        onboardingStatus.allRequirements.forEach { requirementResponse ->
            val requirement = requirementResponse.requirement
            if(!requirementResponse.isMet) {
                isCompleted = false
                if (requirement !is OnboardingRequirementProcess){
                    isCompletedWithoutProcess = false
                }
            }
            when (requirement){
                is OnboardingRequirementCollectData -> {
                    requirement.optionalAttributes.forEach { cdo ->
                        optional.addAll(getDisFromCdo(cdo))
                    }
                    requirement.populatedAttributes.map { cdo ->
                        collected.addAll(getDisFromCdo(cdo))
                    }
                    requirement.missingAttributes.forEach { cdo ->
                        val dis = getDisFromCdo(cdo).filter { di ->
                            if (di == DataIdentifier.idAddressLine2 || di == DataIdentifier.idMiddleName) {
                                optional.add(di)
                                false
                            } else {
                                true  // Include this element in the result
                            }
                        }
                        missing.addAll(dis)
                    }

                }
                else -> {
                    // do nothing since we only support KYC Inline now and we won't worry about othe requirements
                }
            }
        }

        return Requirements(
            requirements = RequirementsState(
                isCompleted = isCompleted,
                isMissing = !isCompleted,
            ),
            fields = RequirementFields(
                optional = optional,
                missing = missing,
                collected = collected
            ),
            canUpdateUserData = onboardingStatus.canUpdateUserData,
            // Ideally if process is the first unmet requirement, they should be able to process
            // But we don't want them to call process if there are other remaining requirements that should be done in handoff
            canProcessInline = isCompletedWithoutProcess
        )
    }
}