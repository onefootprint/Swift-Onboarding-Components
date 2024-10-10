use std::str::FromStr;
use strum::Display;
use strum::EnumString;

#[derive(EnumString, Display, Debug, Clone, PartialEq, Eq)]
pub enum SentilinkHumanReadableScoreReasonCode {
    #[strum(serialize = "R000")]
    #[strum(to_string = "supplied_name_or_ssn_is_nonsense")]
    SuppliedNameOrSsnIsNonsense,

    #[strum(serialize = "R001")]
    #[strum(to_string = "supplied_ssn_is_randomly_issued")]
    SuppliedSsnIsRandomlyIssued,

    #[strum(serialize = "R002")]
    #[strum(to_string = "supplied_ssn_might_belong_to_another_person_not_yet_credit_active")]
    SuppliedSsnMightBelongToAnotherPersonNotYetCreditActive,

    #[strum(serialize = "R003")]
    #[strum(to_string = "supplied_ssn_aligns_with_consumers_address_history")]
    SuppliedSsnAlignsWithConsumersAddressHistory,

    #[strum(serialize = "R004")]
    #[strum(to_string = "supplied_ssn_aligns_with_consumers_dob")]
    SuppliedSsnAlignsWithConsumersDob,

    #[strum(serialize = "R005")]
    #[strum(to_string = "phone_aligns_with_consumers_history")]
    PhoneAlignsWithConsumersHistory,

    #[strum(serialize = "R006")]
    #[strum(to_string = "consumer_is_tied_to_itin")]
    ConsumerIsTiedToItin,

    #[strum(serialize = "R007")]
    #[strum(to_string = "supplied_information_corresponds_to_deceased_individual")]
    SuppliedInformationCorrespondsToDeceasedIndividual,

    #[strum(serialize = "R008")]
    #[strum(to_string = "ssn_tied_to_clump_of_ssns_used_for_fraud")]
    SsnTiedToClumpOfSsnsUsedForFraud,

    #[strum(serialize = "R009")]
    #[strum(to_string = "consumer_tied_to_addresses_linked_to_synthetic_fraud")]
    ConsumerTiedToAddressesLinkedToSyntheticFraud,

    #[strum(serialize = "R010")]
    #[strum(to_string = "depth_of_consumers_history_with_this_information")]
    DepthOfConsumersHistoryWithThisInformation,

    #[strum(serialize = "R011")]
    #[strum(to_string = "start_time_of_consumers_history_aligns_with_expected_start_time")]
    StartTimeOfConsumersHistoryAlignsWithExpectedStartTime,

    #[strum(serialize = "R012")]
    #[strum(to_string = "consumer_tied_to_fraud_code_records")]
    ConsumerTiedToFraudCodeRecords,

    #[strum(serialize = "R013")]
    #[strum(to_string = "better_owner_for_ssn_exists")]
    BetterOwnerForSsnExists,

    #[strum(serialize = "R014")]
    #[strum(to_string = "consumer_appears_to_have_better_ssn")]
    ConsumerAppearsToHaveBetterSsn,

    #[strum(serialize = "R015")]
    #[strum(to_string = "supplied_information_matches_manifest_records")]
    SuppliedInformationMatchesManifestRecords,

    #[strum(serialize = "R016")]
    #[strum(to_string = "application_cluster_activity_in_sentilink_consortium_data")]
    ApplicationClusterActivityInSentilinkConsortiumData,

    #[strum(serialize = "R017")]
    #[strum(to_string = "attributes_of_addresses_consumer_is_tied_to")]
    AttributesOfAddressesConsumerIsTiedTo,

    #[strum(serialize = "R018")]
    #[strum(to_string = "aspects_of_supplied_pii_correspond_to_bankruptcies")]
    AspectsOfSuppliedPiiCorrespondToBankruptcies,

    #[strum(serialize = "R019")]
    #[strum(to_string = "consumer_tied_to_security_freezes")]
    ConsumerTiedToSecurityFreezes,

    #[strum(serialize = "R020")]
    #[strum(to_string = "ssn_might_belong_to_associate")]
    SsnMightBelongToAssociate,

    #[strum(serialize = "R021")]
    #[strum(to_string = "supplied_phone_number_corresponds_to_risky_carrier_or_line_type")]
    SuppliedPhoneNumberCorrespondsToRiskyCarrierOrLineType,

    #[strum(serialize = "R022")]
    #[strum(to_string = "email_domain_or_handle_structure_suspicious")]
    EmailDomainOrHandleStructureSuspicious,

    #[strum(serialize = "R023")]
    #[strum(to_string = "address_consistent_with_consumers_history")]
    AddressConsistentWithConsumersHistory,

    #[strum(serialize = "R024")]
    #[strum(to_string = "address_has_high_velocity_of_applications")]
    AddressHasHighVelocityOfApplications,

    #[strum(serialize = "R025")]
    #[strum(to_string = "email_has_suspicious_application_activity")]
    EmailHasSuspiciousApplicationActivity,

    #[strum(serialize = "R026")]
    #[strum(to_string = "applicant_appears_to_be_best_owner_of_email")]
    ApplicantAppearsToBeBestOwnerOfEmail,

    #[strum(serialize = "R027")]
    #[strum(to_string = "application_information_contains_mix_from_different_consumers")]
    ApplicationInformationContainsMixFromDifferentConsumers,

    #[strum(serialize = "R028")]
    #[strum(to_string = "unusual_geographic_activity_associated_with_phone_number")]
    UnusualGeographicActivityAssociatedWithPhoneNumber,

    #[strum(serialize = "R029")]
    #[strum(to_string = "applicant_appears_to_be_best_owner_of_phone")]
    ApplicantAppearsToBeBestOwnerOfPhone,

    #[strum(serialize = "R030")]
    #[strum(to_string = "phone_cluster_activity_in_sentilink_consortium_data")]
    PhoneClusterActivityInSentilinkConsortiumData,

    #[strum(serialize = "R031")]
    #[strum(to_string = "application_ip_address_from_risky_vpn")]
    ApplicationIpAddressFromRiskyVpn,

    #[strum(serialize = "R032")]
    #[strum(to_string = "ip_address_aligns_with_applicants_physical_address_history")]
    IpAddressAlignsWithApplicantsPhysicalAddressHistory,

    #[strum(serialize = "R033")]
    #[strum(to_string = "applicant_has_suspicious_gap_in_history")]
    ApplicantHasSuspiciousGapInHistory,

    #[strum(serialize = "R034")]
    #[strum(to_string = "length_of_email_history")]
    LengthOfEmailHistory,

    #[strum(serialize = "R035")]
    #[strum(to_string = "ip_address_has_suspicious_application_activity")]
    IpAddressHasSuspiciousApplicationActivity,

    #[strum(serialize = "R036")]
    #[strum(to_string = "application_information_tied_to_associate")]
    ApplicationInformationTiedToAssociate,

    #[strum(serialize = "R037")]
    #[strum(to_string = "ip_address_belongs_to_risky_isp_mobile_carrier")]
    IpAddressBelongsToRiskyIspMobileCarrier,

    Other(String),
}

impl From<String> for SentilinkHumanReadableScoreReasonCode {
    fn from(value: String) -> Self {
        SentilinkHumanReadableScoreReasonCode::from_str(value.as_str()).unwrap_or(Self::Other(value))
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    #[test_case(
        "R036",
        SentilinkHumanReadableScoreReasonCode::ApplicationInformationTiedToAssociate,
        "application_information_tied_to_associate"
    )]
    #[test_case(
        "R001",
        SentilinkHumanReadableScoreReasonCode::SuppliedSsnIsRandomlyIssued,
        "supplied_ssn_is_randomly_issued"
    )]
    #[test_case(
        "R027",
        SentilinkHumanReadableScoreReasonCode::ApplicationInformationContainsMixFromDifferentConsumers,
        "application_information_contains_mix_from_different_consumers"
    )]
    fn test_deser(
        input_str: &str,
        expected_variant: SentilinkHumanReadableScoreReasonCode,
        expected_display: &str,
    ) {
        let deser: SentilinkHumanReadableScoreReasonCode = input_str.to_string().into();
        assert_eq!(deser, expected_variant);
        let display_string = deser.to_string();
        assert_eq!(display_string, expected_display.to_string());
    }
}
