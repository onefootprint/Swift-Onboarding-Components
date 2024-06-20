use idv::socure::response::SocureIDPlusResponse;
use newtypes::DecisionStatus;
use newtypes::FootprintReasonCode;
use newtypes::SocureReasonCode;
use newtypes::VerificationResultId;
use serde::Deserialize;
use serde::Serialize;
use strum::Display;

#[derive(Clone, Debug)]
pub struct SocureFeatures {
    pub idplus_response: SocureIDPlusResponse,
    pub baseline_id_plus_logic_v6_result: SocureBaselineIdPlusLogicV6Result,
    pub decision_status: DecisionStatus,
    pub create_manual_review: bool,
    pub reason_codes: Vec<SocureReasonCode>,
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

impl SocureFeatures {
    pub fn from(
        idplus_response: &SocureIDPlusResponse,
        verification_result_id: VerificationResultId,
    ) -> Self {
        let baseline_id_plus_logic_v6_result = SocureBaselineIdPlusLogicV6Result::from(idplus_response);
        let (decision_status, create_manual_review) = match baseline_id_plus_logic_v6_result {
            SocureBaselineIdPlusLogicV6Result::Reject => (DecisionStatus::Fail, false),
            SocureBaselineIdPlusLogicV6Result::ReferToDocVerification => (DecisionStatus::Fail, true),
            SocureBaselineIdPlusLogicV6Result::ResubmitWithResidentialAddress => (DecisionStatus::Fail, true),
            SocureBaselineIdPlusLogicV6Result::Review => (DecisionStatus::Fail, true),
            SocureBaselineIdPlusLogicV6Result::Accept => (DecisionStatus::Pass, false),
        };

        let reason_codes = idplus_response.all_unique_reason_codes();
        let footprint_reason_codes = reason_codes
            .iter()
            .flat_map(Into::<Option<FootprintReasonCode>>::into)
            .collect();
        Self {
            idplus_response: idplus_response.clone(),
            baseline_id_plus_logic_v6_result,
            decision_status,
            create_manual_review,
            reason_codes,
            footprint_reason_codes,
            verification_result_id,
        }
    }
}

#[derive(Debug, Display, Clone, Copy, Eq, PartialEq, Serialize, Deserialize)]
pub enum SocureBaselineIdPlusLogicV6Result {
    Reject,
    ReferToDocVerification,
    ResubmitWithResidentialAddress,
    Review,
    Accept,
}

fn contains_any_reason_code(reason_codes: &[String], expected_reason_codes: Vec<SocureReasonCode>) -> bool {
    reason_codes
        .iter()
        .flat_map(|s| SocureReasonCode::try_from(s.as_str()))
        .any(|ref rc| expected_reason_codes.contains(rc))
}

impl From<&SocureIDPlusResponse> for SocureBaselineIdPlusLogicV6Result {
    // Implementation of Socure's Baseline ID+ V6 Logic: https://developer.socure.com/docs/idplus/baseline-logic/baseline-idplus-logic-v6
    fn from(response: &SocureIDPlusResponse) -> Self {
        // REJECT
        let reject_kyc = response
            .kyc
            .as_ref()
            .map(|m| {
                contains_any_reason_code(
                    &m.reason_codes,
                    vec![
                        SocureReasonCode::I903,
                        SocureReasonCode::I904,
                        SocureReasonCode::I906,
                        SocureReasonCode::R901,
                        SocureReasonCode::R907,
                        SocureReasonCode::R909,
                        SocureReasonCode::R911,
                        SocureReasonCode::R913,
                        SocureReasonCode::R932,
                        SocureReasonCode::R947,
                    ],
                )
            })
            .unwrap_or(false);

        let reject_address_risk = response
            .address_risk
            .as_ref()
            .map(|m| contains_any_reason_code(&m.reason_codes, vec![SocureReasonCode::R704]))
            .unwrap_or(false);

        let reject_fraud = response.sigma_fraud_score().map(|s| s >= 0.99).unwrap_or(false);

        if reject_kyc || reject_address_risk || reject_fraud {
            return SocureBaselineIdPlusLogicV6Result::Reject;
        }

        // REFER
        let refer_kyc = response
            .kyc
            .as_ref()
            .map(|m| {
                contains_any_reason_code(
                    &m.reason_codes,
                    vec![
                        SocureReasonCode::I909,
                        SocureReasonCode::R922,
                        SocureReasonCode::R933,
                        SocureReasonCode::R940,
                        SocureReasonCode::R953,
                        SocureReasonCode::R954,
                    ],
                )
            })
            .unwrap_or(false)
            || response
                .kyc
                .as_ref()
                .and_then(|m| m.field_validations.state.map(|s| s <= 0.01))
                .unwrap_or(false);

        let refer_fraud = response.sigma_fraud_score().map(|s| s >= 0.98).unwrap_or(false)
            || response
                .sigma_synthetic_score()
                .map(|s| s >= 0.99)
                .unwrap_or(false)
            || response.email_risk_score().map(|s| s >= 0.99).unwrap_or(false)
            || response.phone_risk_score().map(|s| s >= 0.99).unwrap_or(false);

        let refer_alert_list = response
            .alert_list
            .as_ref()
            .map(|m| {
                contains_any_reason_code(
                    &m.reason_codes,
                    vec![
                        SocureReasonCode::R110,
                        SocureReasonCode::R111,
                        SocureReasonCode::R113,
                    ],
                )
            })
            .unwrap_or(false);

        #[allow(clippy::if_same_then_else)]
        #[allow(clippy::needless_bool)]
        let refer_device = if response.sigma_fraud_score().map(|s| s >= 0.8).unwrap_or(false)
            && contains_any_reason_code(
                &response.all_device_reason_codes(),
                vec![
                    SocureReasonCode::I410,
                    SocureReasonCode::I411,
                    SocureReasonCode::I412,
                    SocureReasonCode::I413,
                ],
            ) {
            true
        } else if contains_any_reason_code(&response.all_device_reason_codes(), vec![SocureReasonCode::I403])
            && contains_any_reason_code(
                &response.all_device_reason_codes(),
                vec![
                    SocureReasonCode::R619,
                    SocureReasonCode::R622,
                    SocureReasonCode::R631,
                ],
            )
        {
            true
        } else if contains_any_reason_code(&response.all_device_reason_codes(), vec![SocureReasonCode::R403])
            && contains_any_reason_code(
                &response.all_device_reason_codes(),
                vec![SocureReasonCode::R622, SocureReasonCode::R631],
            )
        {
            true
        } else {
            false
        };

        if refer_kyc || refer_fraud || refer_alert_list || refer_device {
            return SocureBaselineIdPlusLogicV6Result::ReferToDocVerification;
        }

        // RESUBMIT
        let resubmit_kyc = response
            .kyc
            .as_ref()
            .map(|m| {
                contains_any_reason_code(
                    &m.reason_codes,
                    vec![
                        SocureReasonCode::I911,
                        SocureReasonCode::R916,
                        SocureReasonCode::R964,
                        SocureReasonCode::R972,
                    ],
                )
            })
            .unwrap_or(false);

        let resubmit_address_risk = response
            .address_risk
            .as_ref()
            .map(|m| {
                contains_any_reason_code(
                    &m.reason_codes,
                    vec![
                        SocureReasonCode::R703,
                        SocureReasonCode::R707,
                        SocureReasonCode::R708,
                    ],
                )
            })
            .unwrap_or(false);

        if resubmit_kyc || resubmit_address_risk {
            return SocureBaselineIdPlusLogicV6Result::ResubmitWithResidentialAddress;
        }

        // REVIEW
        let review_watchlist = response
            .global_watchlist
            .as_ref()
            .map(|m| contains_any_reason_code(&m.reason_codes, vec![SocureReasonCode::R186]))
            .unwrap_or(false);

        if review_watchlist {
            return SocureBaselineIdPlusLogicV6Result::Review;
        }

        // ACCEPT
        SocureBaselineIdPlusLogicV6Result::Accept
    }
}

#[cfg(test)]
mod tests {
    use super::SocureBaselineIdPlusLogicV6Result;
    use idv::socure::response::DeviceRisk;
    use idv::socure::response::FieldValidation;
    use idv::socure::response::Fraud;
    use idv::socure::response::Kyc;
    use idv::socure::response::Score;
    use idv::socure::response::SocureIDPlusResponse;

    #[test]
    fn empty_response() {
        assert_eq!(
            SocureBaselineIdPlusLogicV6Result::Accept,
            SocureBaselineIdPlusLogicV6Result::from(&SocureIDPlusResponse {
                reference_id: String::from("abc123"),
                name_address_correlation: None,
                name_phone_correlation: None,
                fraud: None,
                kyc: None,
                synthetic: None,
                address_risk: None,
                email_risk: None,
                phone_risk: None,
                alert_list: None,
                global_watchlist: None,
                device_risk: None,
                device_identity_correlation: None,
                device_data: None,
            })
        );
    }

    #[test]
    fn reject_kyc() {
        assert_eq!(
            SocureBaselineIdPlusLogicV6Result::Reject,
            SocureBaselineIdPlusLogicV6Result::from(&SocureIDPlusResponse {
                reference_id: String::from("abc123"),
                name_address_correlation: None,
                name_phone_correlation: None,
                fraud: None,
                kyc: Some(Kyc {
                    reason_codes: vec!["R907".to_owned()],
                    field_validations: FieldValidation {
                        first_name: None,
                        sur_name: None,
                        street_address: None,
                        city: None,
                        state: None,
                        zip: None,
                        mobile_number: None,
                        dob: None,
                        ssn: None
                    }
                }),
                synthetic: None,
                address_risk: None,
                email_risk: None,
                phone_risk: None,
                alert_list: None,
                global_watchlist: None,
                device_risk: None,
                device_identity_correlation: None,
                device_data: None,
            })
        );
    }

    #[test]
    fn refer_device() {
        assert_eq!(
            SocureBaselineIdPlusLogicV6Result::ReferToDocVerification,
            SocureBaselineIdPlusLogicV6Result::from(&SocureIDPlusResponse {
                reference_id: String::from("abc123"),
                name_address_correlation: None,
                name_phone_correlation: None,
                fraud: Some(Fraud {
                    reason_codes: vec![],
                    scores: vec![Score {
                        name: "sigma".to_owned(),
                        version: "1.0".to_owned(),
                        score: Some(0.81)
                    }]
                }),
                kyc: None,
                synthetic: None,
                address_risk: None,
                email_risk: None,
                phone_risk: None,
                alert_list: None,
                global_watchlist: None,
                device_risk: Some(DeviceRisk {
                    reason_codes: vec!["I412".to_owned()],
                    score: Some(0.0)
                }),
                device_identity_correlation: None,
                device_data: None,
            })
        );
    }
}
