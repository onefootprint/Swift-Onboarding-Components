use std::str::FromStr;

use idv::idology::{
    common::response::{IDologyQualifiers, WarmAddressType},
    expectid::response::{ExpectIDResponse, PaWatchlistHit},
};
use itertools::Itertools;
use newtypes::{idology_match_codes, FootprintReasonCode, IDologyReasonCode};

pub fn footprint_reason_codes(
    resp: ExpectIDResponse,
    dob_submitted: bool,
    ssn_submitted: bool,
) -> Vec<FootprintReasonCode> {
    let id_located = resp.response.id_located();

    //
    // first we compute all reason codes directly from the response
    //
    let mut reason_codes: Vec<FootprintReasonCode> =
        qualifier_reason_codes(resp.response.qualifiers.as_ref());

    // watchlist
    let restriction_reason_codes = resp
        .response
        .restriction
        .as_ref()
        .map(|r| PaWatchlistHit::to_footprint_reason_codes(r.watchlists()))
        .unwrap_or_default();

    reason_codes = reason_codes.into_iter().chain(restriction_reason_codes).collect();
    //
    // Construct final set of codes
    //
    // Idology considers this a "restricted match" and doesn't return additional qualifiers so
    // we shouldn't infer anything about other codes here
    let out = if reason_codes.contains(&FootprintReasonCode::DobLocatedCoppaAlert) {
        reason_codes
    } else if !id_located {
        // Important Note: When Idology does not locate an id, they do not provide additional match related signals specifying how identity attributes match.
        reason_codes
            .into_iter()
            .chain(vec![FootprintReasonCode::IdNotLocated])
            .collect()
    } else {
        // If ID was located, continue with the logic to add in match codes
        add_top_level_match_reason_codes(reason_codes, dob_submitted, ssn_submitted)
    };

    out.into_iter().unique().collect()
}

fn add_top_level_match_reason_codes(
    mut footprint_reason_codes: Vec<FootprintReasonCode>,
    dob_submitted: bool,
    ssn_submitted: bool,
) -> Vec<FootprintReasonCode> {
    // construct helpers
    let address_does_not_match = idology_match_codes::ADDRESS_DOES_NOT_MATCH_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));
    let address_partially_matches = idology_match_codes::ADDRESS_PARTIALLY_MATCHES_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));

    let yob_does_not_match = idology_match_codes::DOB_YOB_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));
    let mob_does_not_match = idology_match_codes::DOB_MOB_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));
    let dob_does_not_match = yob_does_not_match && mob_does_not_match;
    let dob_partially_matches = (yob_does_not_match || mob_does_not_match) && !dob_does_not_match;
    let dob_could_not_match = footprint_reason_codes.contains(&FootprintReasonCode::DobCouldNotMatch);

    let ssn_does_not_match = idology_match_codes::SSN_DOES_NOT_MATCH_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));
    let ssn_partially_matches = idology_match_codes::SSN_PARTIALLY_MATCHES_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));
    let name_does_not_match = idology_match_codes::NAME_DOES_NOT_MATCH_CODES
        .iter()
        .all(|r| footprint_reason_codes.contains(r));
    let name_partially_matches = idology_match_codes::NAME_DOES_NOT_MATCH_CODES
        .iter()
        .any(|r| footprint_reason_codes.contains(r));

    //
    // add in summary reason codes. Some of these may be duplicates, but we .unique() later
    //
    if address_does_not_match {
        footprint_reason_codes.push(FootprintReasonCode::AddressDoesNotMatch);
    } else if address_partially_matches {
        footprint_reason_codes.push(FootprintReasonCode::AddressPartiallyMatches);
    } else {
        // address is always sent to Idology
        footprint_reason_codes.push(FootprintReasonCode::AddressMatches);
    };

    if !dob_could_not_match {
        if dob_does_not_match {
            footprint_reason_codes.push(FootprintReasonCode::DobDoesNotMatch);
        } else if dob_partially_matches {
            footprint_reason_codes.push(FootprintReasonCode::DobPartialMatch);
        } else if dob_submitted {
            footprint_reason_codes.push(FootprintReasonCode::DobMatches);
        };
    }

    if ssn_does_not_match {
        footprint_reason_codes.push(FootprintReasonCode::SsnDoesNotMatch);
    } else if ssn_partially_matches {
        footprint_reason_codes.push(FootprintReasonCode::SsnPartiallyMatches);
    } else if ssn_submitted {
        footprint_reason_codes.push(FootprintReasonCode::SsnMatches);
    };

    if name_does_not_match {
        footprint_reason_codes.push(FootprintReasonCode::NameDoesNotMatch);
    } else if name_partially_matches {
        footprint_reason_codes.push(FootprintReasonCode::NamePartiallyMatches);
    } else {
        // name is always sent to Idology
        footprint_reason_codes.push(FootprintReasonCode::NameMatches);
    };

    footprint_reason_codes.into_iter().unique().collect()
}

fn qualifier_reason_codes(qualifiers: Option<&IDologyQualifiers>) -> Vec<FootprintReasonCode> {
    if let Some(qualifiers) = qualifiers {
        qualifiers
            .parse_qualifiers()
            .into_iter()
            .flat_map(|q| match q.1 {
                IDologyReasonCode::WarmInputAddressAlert => {
                    q.0.warm_address_list
                        .and_then(|s| WarmAddressType::from_str(s.as_str()).ok())
                        .map(|t| t.to_input_address_footprint_reason_code())
                }
                IDologyReasonCode::WarmAddressAlert => {
                    q.0.warm_address_list
                        .and_then(|s| WarmAddressType::from_str(s.as_str()).ok())
                        .map(|t| t.to_located_address_footprint_reason_code())
                }
                _ => Into::<Option<FootprintReasonCode>>::into(&q.1),
            })
            .collect()
    } else {
        vec![]
    }
}

#[cfg(test)]
mod test {
    use idv::idology::expectid::response::ExpectIDResponse;
    use newtypes::{
        FootprintReasonCode::{self, *},
        MatchLevel::{self, *},
    };
    use serde_json::json;
    use test_case::test_case;

    use super::*;

    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "hospital"}) => vec![AddressLocatedIsNotStandardHospital])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "hotel"}) => vec![AddressLocatedIsNotStandardHotel])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "prison"}) => vec![AddressLocatedIsNotStandardPrison])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "campground"}) => vec![AddressLocatedIsNotStandardCampground])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "college"}) => vec![AddressLocatedIsNotStandardCollege])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "university"}) => vec![AddressLocatedIsNotStandardUniversity])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "USPO"}) => vec![AddressLocatedIsNotStandardUspo])]
    #[test_case(json!({"key": "resultcode.warm.address.alert","warm-address-list": "General Delivery"}) => vec![AddressLocatedIsNotStandardGeneralDelivery])]
    #[test_case(json!([
    {
      "key": "resultcode.warm.input.address.alert",
      "warm-address-list": "General Delivery"
    },
    {
      "key": "resultcode.address.velocity.alert",
    },
    {
        "key": "resultcode.warm.input.address.alert",
        "warm-address-list": "hotel"
    },
  ]) => vec![AddressInputIsNotStandardGeneralDelivery, AddressAlertVelocity, AddressInputIsNotStandardHotel])]
    fn test_parse_footprint_reason_codes_from_qualifier(
        qualifier: serde_json::Value,
    ) -> Vec<FootprintReasonCode> {
        let resp = test_idology_response("result.does_not_matter", false, qualifier);

        qualifier_reason_codes(resp.response.qualifiers.as_ref())
    }

    #[test_case("result.no.match", false, json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop, IdNotLocated])]
    #[test_case("result.match", false, json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop, AddressMatches, DobMatches, SsnMatches, NameMatches])]
    #[test_case("result.match", true, json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop, WatchlistHitOfac, AddressMatches,DobMatches, SsnMatches, NameMatches])]
    #[test_case("result.match", false, construct_matching_qualifier(MatchLevel::Exact) => vec![AddressMatches, DobMatches, SsnMatches, NameMatches])]
    #[test_case("result.match", false, construct_matching_qualifier(MatchLevel::Partial) => vec![AddressStreetNameDoesNotMatch, NameFirstDoesNotMatch, SsnDoesNotMatchWithin1Digit, DobMobDoesNotMatch, AddressPartiallyMatches, DobPartialMatch, SsnPartiallyMatches, NamePartiallyMatches])]
    #[test_case("result.match", false, construct_matching_qualifier(MatchLevel::NoMatch) => vec![AddressDoesNotMatch, NameFirstDoesNotMatch, NameLastDoesNotMatch, SsnDoesNotMatch, DobMobDoesNotMatch, DobYobDoesNotMatch, DobDoesNotMatch, NameDoesNotMatch])]
    #[test_case("result.match", false, json!({"key": "resultcode.coppa.alert"}) => vec![DobLocatedCoppaAlert])]

    fn test_footprint_reason_codes(
        result_key: &str,
        include_watchlist: bool,
        qualifier: serde_json::Value,
    ) -> Vec<FootprintReasonCode> {
        let resp = test_idology_response(result_key, include_watchlist, qualifier);

        footprint_reason_codes(resp, true, true)
    }

    #[test_case("result.match", construct_matching_qualifier(MatchLevel::Exact), true, true => vec![AddressMatches, DobMatches, SsnMatches, NameMatches])]
    #[test_case("result.match", construct_matching_qualifier(MatchLevel::Exact), true, false => vec![AddressMatches, DobMatches, NameMatches])]
    #[test_case("result.match", construct_matching_qualifier(MatchLevel::Exact), false, true => vec![AddressMatches, SsnMatches, NameMatches])]
    #[test_case("result.match", construct_matching_qualifier(MatchLevel::Exact), false, false => vec![AddressMatches, NameMatches])]
    #[test_case("result.no.match", json!({}), false, false => vec![ IdNotLocated])] // qualif not used
    fn test_dob_ssn_filtering(
        result_key: &str,
        qualifier: serde_json::Value,
        dob_submitted: bool,
        ssn_submitted: bool,
    ) -> Vec<FootprintReasonCode> {
        let resp = test_idology_response(result_key, false, qualifier);

        footprint_reason_codes(resp, dob_submitted, ssn_submitted)
    }

    fn test_idology_response(
        result_key: &str,
        include_watchlist: bool,
        qualifier: serde_json::Value,
    ) -> ExpectIDResponse {
        let wl = if include_watchlist {
            json!({
              "key": "global.watch.list",
              "message": "you are bad",
              "pa": [
                  {
                  "list": "Office of Foreign Asset Control",
                  "score": "97",
                  "dob": "02121978"
                },
                {
                "list": "Office of Foreign Asset Control",
                  "score": "43",
                  "dob": "02121978"
                },
              ]
            })
        } else {
            json!({})
        };

        let raw = json!({"response": {
          "id-number": 3010453,
          "results": {
            "key": result_key,
            "message": "ID Located"
          },
          "restriction": wl,
          "qualifiers": {
            "qualifier": qualifier
          }
        }});

        let parsed_response: ExpectIDResponse =
            idv::idology::expectid::response::parse_response(raw).unwrap();

        parsed_response
    }

    fn construct_matching_qualifier(ml: MatchLevel) -> serde_json::Value {
        match ml {
            NoMatch => json!([
                // address
                {"key": "resultcode.address.does.not.match"},
                // name (no top level name does not match code)
                {"key": "resultcode.first.name.does.not.match"}, {"key": "resultcode.last.name.does.not.match"},

                // ssn
                {"key": "resultcode.ssn.does.not.match"},

                // dob
                {"key": "resultcode.mob.does.not.match"}, {"key": "resultcode.yob.does.not.match"}
            ]),
            Partial => json!([
                  // address
                  {"key": "resultcode.street.name.does.not.match"},
                  // name
                  {"key": "resultcode.first.name.does.not.match"},

                  // ssn
                  {"key": "resultcode.ssn.within.one.digit"},

                  // dob
                  {"key": "resultcode.mob.does.not.match"},


            ]),
            Exact => json!({}),
            _ => json!({}),
        }
    }
}
