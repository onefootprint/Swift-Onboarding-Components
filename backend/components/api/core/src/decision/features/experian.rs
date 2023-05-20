use idv::experian::{cross_core::response::CrossCoreAPIResponse, precise_id::response::PreciseIDParsedScore};
use itertools::Itertools;
use newtypes::{FootprintReasonCode, VerificationResultId};

const SCORE_THRESHOLD: i32 = 580;

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ExperianFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

impl ExperianFeatures {
    pub fn from(resp: CrossCoreAPIResponse, verification_result_id: VerificationResultId) -> Self {
        Self {
            footprint_reason_codes: footprint_reason_codes(resp),
            verification_result_id,
        }
    }
}

fn score_to_reason_code(score: PreciseIDParsedScore) -> Option<FootprintReasonCode> {
    match score {
        PreciseIDParsedScore::ConsumerNotFound => Some(FootprintReasonCode::IdNotLocated),
        PreciseIDParsedScore::Deceased => Some(FootprintReasonCode::SubjectDeceased),
        PreciseIDParsedScore::BlockedFile => Some(FootprintReasonCode::IdNotLocated),
        PreciseIDParsedScore::Score(s) => {
            if s >= SCORE_THRESHOLD {
                None
            } else {
                Some(FootprintReasonCode::IdNotLocated)
            }
        }
    }
}

fn footprint_reason_codes(resp: CrossCoreAPIResponse) -> Vec<FootprintReasonCode> {
    // TODO: these aren't appearing in the response where the docs say they should be
    let model_reason_codes: Vec<FootprintReasonCode> = vec![];

    // TODO: matching

    let fraud_shield_reason_codes: Vec<FootprintReasonCode> = resp
        .fraud_shield_reason_codes()
        .ok()
        .map(|codes| {
            codes
                .into_iter()
                .flat_map(|rs| std::convert::Into::<Option<FootprintReasonCode>>::into(&rs))
                .collect()
        })
        .unwrap_or_default();

    // TODO: should error here
    let dob_reason_codes = if let Ok(code) = resp.dob_match_reason_codes() {
        let dob_frc = std::convert::Into::<Option<FootprintReasonCode>>::into(&code);
        vec![dob_frc]
    } else {
        vec![]
    }
    .into_iter()
    .flatten();

    let name_and_address_reason_codes = if let Ok(code) = resp.name_and_address_match_reason_codes() {
        std::convert::Into::<Vec<FootprintReasonCode>>::into(&code)
    } else {
        vec![]
    };

    let mut reason_codes: Vec<FootprintReasonCode> = model_reason_codes
        .into_iter()
        .chain(fraud_shield_reason_codes.into_iter())
        .chain(dob_reason_codes)
        .chain(name_and_address_reason_codes.into_iter())
        .unique()
        .collect();

    if let Some(s) = resp
        .precise_id_response()
        .ok()
        .and_then(|p| p.score().ok().and_then(score_to_reason_code))
    {
        reason_codes.push(s)
    };

    reason_codes
}

#[cfg(test)]
mod tests {
    use idv::{
        experian::{cross_core::response::CrossCoreAPIResponse, precise_id::response::PreciseIDParsedScore},
        tests::assert_have_same_elements,
    };
    use newtypes::FootprintReasonCode;

    #[test]
    fn test_reason_codes() {
        let r: CrossCoreAPIResponse = serde_json::from_value(
            idv::test_fixtures::cross_core_response_with_fraud_shield_codes(true),
        )
        .expect("could not parse");

        assert_eq!(
            r.precise_id_response().unwrap().score().unwrap(),
            PreciseIDParsedScore::Score(269)
        );

        assert_have_same_elements(
            super::footprint_reason_codes(r),
            vec![
                // from fraud shield
                FootprintReasonCode::SubjectDeceased,
                // dob match
                FootprintReasonCode::DobMobDoesNotMatch,
                // from address + name
                FootprintReasonCode::NameFirstMatches,
                FootprintReasonCode::NameLastMatches,
                FootprintReasonCode::AddressStreetNameMatches,
                FootprintReasonCode::AddressStreetNumberMatches,
                FootprintReasonCode::AddressCityMatches,
                FootprintReasonCode::AddressStateMatches,
                FootprintReasonCode::AddressZipCodeMatches,
                // from score
                FootprintReasonCode::IdNotLocated,
            ],
        );
    }

    #[test]
    fn test_reason_codes_with_not_parsable_address() {
        // can't parse address codes
        let r: CrossCoreAPIResponse = serde_json::from_value(
            idv::test_fixtures::cross_core_response_with_fraud_shield_codes(false),
        )
        .expect("could not parse");

        assert_eq!(
            r.precise_id_response().unwrap().score().unwrap(),
            PreciseIDParsedScore::Score(269)
        );

        assert_have_same_elements(
            super::footprint_reason_codes(r),
            vec![
                // from fraud shield
                FootprintReasonCode::SubjectDeceased,
                // dob match
                FootprintReasonCode::DobMobDoesNotMatch,
                // from address + name
                FootprintReasonCode::NameFirstDoesNotMatch,
                FootprintReasonCode::NameLastDoesNotMatch,
                FootprintReasonCode::AddressStreetNameDoesNotMatch,
                FootprintReasonCode::AddressStreetNumberDoesNotMatch,
                FootprintReasonCode::AddressCityDoesNotMatch,
                FootprintReasonCode::AddressStateDoesNotMatch,
                FootprintReasonCode::AddressZipCodeDoesNotMatch,
                // from score
                FootprintReasonCode::IdNotLocated,
            ],
        )
    }
}
