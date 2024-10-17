use std::str::FromStr;
use strum::Display;
use strum::EnumIter;
use strum::EnumString;

#[derive(EnumString, Display, Debug, Clone, PartialEq, Eq, EnumIter)]
pub enum SentilinkHumanReadableScoreReasonCode {
    #[strum(serialize = "R000")]
    #[strum(to_string = "name_or_ssn_is_nonsense")]
    SuppliedNameOrSsnIsNonsense,

    #[strum(serialize = "R001")]
    #[strum(to_string = "ssn_is_randomly_issued")]
    SuppliedSsnIsRandomlyIssued,

    #[strum(serialize = "R002")]
    #[strum(to_string = "ssn_might_belong_to_inactive_person")]
    SuppliedSsnMightBelongToAnotherPersonNotYetCreditActive,

    #[strum(serialize = "R003")]
    #[strum(to_string = "ssn_aligns_with_address_history")]
    SuppliedSsnAlignsWithConsumersAddressHistory,

    #[strum(serialize = "R004")]
    #[strum(to_string = "ssn_aligns_with_dob")]
    SuppliedSsnAlignsWithConsumersDob,

    #[strum(serialize = "R005")]
    #[strum(to_string = "phone_aligns_with_history")]
    PhoneAlignsWithConsumersHistory,

    #[strum(serialize = "R006")]
    #[strum(to_string = "consumer_tied_to_itin")]
    ConsumerIsTiedToItin,

    #[strum(serialize = "R007")]
    #[strum(to_string = "info_matches_deceased_individual")]
    SuppliedInformationCorrespondsToDeceasedIndividual,

    #[strum(serialize = "R008")]
    #[strum(to_string = "ssn_tied_to_fraud_clump")]
    SsnTiedToClumpOfSsnsUsedForFraud,

    #[strum(serialize = "R009")]
    #[strum(to_string = "addresses_linked_to_synthetic_fraud")]
    ConsumerTiedToAddressesLinkedToSyntheticFraud,

    #[strum(serialize = "R010")]
    #[strum(to_string = "depth_of_consumer_history")]
    DepthOfConsumersHistoryWithThisInformation,

    #[strum(serialize = "R011")]
    #[strum(to_string = "history_start_time_aligns")]
    StartTimeOfConsumersHistoryAlignsWithExpectedStartTime,

    #[strum(serialize = "R012")]
    #[strum(to_string = "tied_to_fraud_code_records")]
    ConsumerTiedToFraudCodeRecords,

    #[strum(serialize = "R013")]
    #[strum(to_string = "better_ssn_owner_exists")]
    BetterOwnerForSsnExists,

    #[strum(serialize = "R014")]
    #[strum(to_string = "consumer_has_better_ssn")]
    ConsumerAppearsToHaveBetterSsn,

    #[strum(serialize = "R015")]
    #[strum(to_string = "info_matches_manifest_records")]
    SuppliedInformationMatchesManifestRecords,

    #[strum(serialize = "R016")]
    #[strum(to_string = "app_cluster_in_consortium_data")]
    ApplicationClusterActivityInSentilinkConsortiumData,

    #[strum(serialize = "R017")]
    #[strum(to_string = "attributes_of_tied_addresses")]
    AttributesOfAddressesConsumerIsTiedTo,

    #[strum(serialize = "R018")]
    #[strum(to_string = "pii_corresponds_to_bankruptcies")]
    AspectsOfSuppliedPiiCorrespondToBankruptcies,

    #[strum(serialize = "R019")]
    #[strum(to_string = "tied_to_security_freezes")]
    ConsumerTiedToSecurityFreezes,

    #[strum(serialize = "R020")]
    #[strum(to_string = "ssn_might_belong_to_associate")]
    SsnMightBelongToAssociate,

    #[strum(serialize = "R021")]
    #[strum(to_string = "risky_phone_carrier_or_line_type")]
    SuppliedPhoneNumberCorrespondsToRiskyCarrierOrLineType,

    #[strum(serialize = "R022")]
    #[strum(to_string = "suspicious_email_structure")]
    EmailDomainOrHandleStructureSuspicious,

    #[strum(serialize = "R023")]
    #[strum(to_string = "address_consistent_with_history")]
    AddressConsistentWithConsumersHistory,

    #[strum(serialize = "R024")]
    #[strum(to_string = "high_velocity_address")]
    AddressHasHighVelocityOfApplications,

    #[strum(serialize = "R025")]
    #[strum(to_string = "suspicious_email_activity")]
    EmailHasSuspiciousApplicationActivity,

    #[strum(serialize = "R026")]
    #[strum(to_string = "applicant_is_best_email_owner")]
    ApplicantAppearsToBeBestOwnerOfEmail,

    #[strum(serialize = "R027")]
    #[strum(to_string = "mixed_consumer_info")]
    ApplicationInformationContainsMixFromDifferentConsumers,

    #[strum(serialize = "R028")]
    #[strum(to_string = "unusual_phone_geo_activity")]
    UnusualGeographicActivityAssociatedWithPhoneNumber,

    #[strum(serialize = "R029")]
    #[strum(to_string = "applicant_is_best_phone_owner")]
    ApplicantAppearsToBeBestOwnerOfPhone,

    #[strum(serialize = "R030")]
    #[strum(to_string = "phone_cluster_in_consortium_data")]
    PhoneClusterActivityInSentilinkConsortiumData,

    #[strum(serialize = "R031")]
    #[strum(to_string = "ip_from_risky_vpn")]
    ApplicationIpAddressFromRiskyVpn,

    #[strum(serialize = "R032")]
    #[strum(to_string = "ip_aligns_with_address_history")]
    IpAddressAlignsWithApplicantsPhysicalAddressHistory,

    #[strum(serialize = "R033")]
    #[strum(to_string = "suspicious_history_gap")]
    ApplicantHasSuspiciousGapInHistory,

    #[strum(serialize = "R034")]
    #[strum(to_string = "email_history_length")]
    LengthOfEmailHistory,

    #[strum(serialize = "R035")]
    #[strum(to_string = "suspicious_ip_activity")]
    IpAddressHasSuspiciousApplicationActivity,

    #[strum(serialize = "R036")]
    #[strum(to_string = "info_tied_to_associate")]
    ApplicationInformationTiedToAssociate,

    #[strum(serialize = "R037")]
    #[strum(to_string = "ip_from_risky_isp_or_carrier")]
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
    use strum::IntoEnumIterator;
    use test_case::test_case;
    #[test_case(
        "R036",
        SentilinkHumanReadableScoreReasonCode::ApplicationInformationTiedToAssociate,
        "info_tied_to_associate"
    )]
    #[test_case(
        "R001",
        SentilinkHumanReadableScoreReasonCode::SuppliedSsnIsRandomlyIssued,
        "ssn_is_randomly_issued"
    )]
    #[test_case(
        "R027",
        SentilinkHumanReadableScoreReasonCode::ApplicationInformationContainsMixFromDifferentConsumers,
        "mixed_consumer_info"
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

    #[test]
    fn test_human_readable_length() {
        SentilinkHumanReadableScoreReasonCode::iter().for_each(|c| {
            let readable = c.to_string();
            if readable.len() > 35 {
                panic!("{} is longer than 35 characters, which will cause display issues in the sentilink details page in dashboard", readable)
            }
        })
    }
}
