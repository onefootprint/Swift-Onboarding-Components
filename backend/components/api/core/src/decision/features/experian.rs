use idv::experian::cross_core::response::CrossCoreAPIResponse;
use idv::experian::precise_id::response::PreciseIDParsedScore;
use itertools::Itertools;
use newtypes::FootprintReasonCode;

const SCORE_THRESHOLD: i32 = 500;

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a
/// decision
fn score_to_reason_code(score: PreciseIDParsedScore) -> Option<FootprintReasonCode> {
    match score {
        PreciseIDParsedScore::Deceased => Some(FootprintReasonCode::SubjectDeceased),
        PreciseIDParsedScore::BlockedFile => Some(FootprintReasonCode::IdNotLocated),
        PreciseIDParsedScore::Score(s) => {
            if s >= SCORE_THRESHOLD {
                None
            } else {
                Some(FootprintReasonCode::IdFlagged)
            }
        }
    }
}

pub fn footprint_reason_codes(resp: CrossCoreAPIResponse) -> Vec<FootprintReasonCode> {
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

    // As of 2023-05-23, our rough understanding of how experian matches information we provided to them
    // is as follows:
    //
    // experian_consumer_id = blackbox_experian_search(Name,DOB,Address,SSN,Phone);
    //
    // ssn_result_codes = SsnSearch(experian_consumer_id)
    // address_result_codes = AddressSearch(experian_consumer_id)
    // dob_result_codes = DOBSearch(experian_consumer_id)
    //
    // So they first locate a consumer_id row, then pull information from various databases that
    // correspond to the matching codes below
    let dob_reason_codes = if let Ok(code) = resp.dob_match_reason_codes() {
        let dob_frc = std::convert::Into::<Option<FootprintReasonCode>>::into(&code);
        vec![dob_frc]
    } else {
        vec![]
    }
    .into_iter()
    .flatten();

    let (input_missing_ssn, ssn_reason_codes) = if let Ok(code) = resp.ssn_match_reason_codes() {
        // if we don't send SSN, we don't return any codes here
        if code.input_missing_ssn() {
            (true, vec![])
        } else {
            (false, std::convert::Into::<Vec<FootprintReasonCode>>::into(&code))
        }
    } else {
        (true, vec![])
    };

    // Since ssn codes include address and name information, and it's still unclear if they agree with
    // one another, we only show the address codes if ssn wasn't provided (and as of 2023-05, we
    // always get ssn)
    let mut name_and_address_reason_codes = vec![];
    if input_missing_ssn {
        name_and_address_reason_codes = if let Ok(code) = resp.name_and_address_match_reason_codes() {
            std::convert::Into::<Vec<FootprintReasonCode>>::into(&code)
        } else {
            vec![]
        };
    }

    let watchlist_codes = if let Ok(code) = resp.watchlist_match_reason_codes() {
        vec![std::convert::Into::<Option<FootprintReasonCode>>::into(&code)]
    } else {
        vec![]
    }
    .into_iter()
    .flatten();

    let phone_codes = if let Ok(code) = resp.phone_match_reason_codes() {
        std::convert::Into::<Vec<FootprintReasonCode>>::into(&code)
    } else {
        vec![]
    };

    let score_code = resp
        .precise_id_response()
        .ok()
        .and_then(|p| p.score().ok().and_then(score_to_reason_code).map(|frc| vec![frc]))
        .unwrap_or_default();

    fraud_shield_reason_codes
        .into_iter()
        .chain(dob_reason_codes)
        .chain(name_and_address_reason_codes)
        .chain(ssn_reason_codes)
        .chain(watchlist_codes)
        .chain(phone_codes)
        .chain(score_code)
        .unique()
        .collect()
}

#[cfg(test)]
mod tests {
    use db::test_helpers::assert_have_same_elements;
    use idv::experian::cross_core::response::CrossCoreAPIResponse;
    use idv::experian::precise_id::response::PreciseIDParsedScore;
    use newtypes::ExperianAddressAndNameMatchReasonCodes;
    use newtypes::ExperianSSNReasonCodes;
    use newtypes::ExperianWatchlistReasonCodes;
    use newtypes::FootprintReasonCode;
    use test_case::test_case;

    #[test_case(ExperianAddressAndNameMatchReasonCodes::DefaultNoMatch, ExperianSSNReasonCodes::EA, ExperianWatchlistReasonCodes::R1, vec![
        // from fraud shield
        FootprintReasonCode::SubjectDeceased,
        // dob match
        FootprintReasonCode::DobMobDoesNotMatch,
        // from SSN
        FootprintReasonCode::NameMatches,
        FootprintReasonCode::AddressMatches,
        FootprintReasonCode::SsnMatches,
        // from score
        FootprintReasonCode::IdFlagged,
        // from phone
        FootprintReasonCode::PhoneLocatedMatches,
    ] => (); "address code says no match, but we opt for ssn codes since it's present")]
    #[test_case(ExperianAddressAndNameMatchReasonCodes::DefaultNoMatch, ExperianSSNReasonCodes::MX, ExperianWatchlistReasonCodes::R7, vec![
        // from fraud shield
        FootprintReasonCode::SubjectDeceased,
        // dob match
        FootprintReasonCode::DobMobDoesNotMatch,
        // from address + name
        FootprintReasonCode::NameFirstDoesNotMatch,
        FootprintReasonCode::NameLastDoesNotMatch,
        FootprintReasonCode::NameDoesNotMatch,
        FootprintReasonCode::AddressStreetNameDoesNotMatch,
        FootprintReasonCode::AddressStreetNumberDoesNotMatch,
        FootprintReasonCode::AddressCityDoesNotMatch,
        FootprintReasonCode::AddressStateDoesNotMatch,
        FootprintReasonCode::AddressZipCodeDoesNotMatch,
        FootprintReasonCode::AddressDoesNotMatch,
        // from watchlist
        FootprintReasonCode::WatchlistHitOfac,
        // from score
        FootprintReasonCode::IdFlagged,
        // from phone
        FootprintReasonCode::PhoneLocatedMatches,
    ] => (); "no ssn is provided, so we take address codes")]
    fn test_reason_codes(
        address_code: ExperianAddressAndNameMatchReasonCodes,
        ssn_code: ExperianSSNReasonCodes,
        watchlist_code: ExperianWatchlistReasonCodes,
        expected_reason_codes: Vec<FootprintReasonCode>,
    ) {
        let r: CrossCoreAPIResponse =
            serde_json::from_value(idv::test_fixtures::cross_core_response_with_fraud_shield_codes(
                address_code,
                ssn_code,
                watchlist_code,
            ))
            .expect("could not parse");

        assert_eq!(
            r.precise_id_response().unwrap().score().unwrap(),
            PreciseIDParsedScore::Score(269)
        );

        assert_have_same_elements(super::footprint_reason_codes(r), expected_reason_codes);
    }
}
