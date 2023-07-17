use std::str::FromStr;

use idv::idology::{
    common::response::{IDologyQualifiers, WarmAddressType},
    expectid::response::{ExpectIDResponse, PaWatchlistHit},
};
use itertools::Itertools;
use newtypes::{
    idology_match_codes, FootprintReasonCode, IDologyReasonCode, VendorAPI, VerificationResultId,
};
use strum::IntoEnumIterator;

use crate::decision::{
    onboarding::FeatureSet,
    vendor::vendor_api::{
        vendor_api_response::{VendorAPIResponseIdentifiersMap, VendorAPIResponseMap},
        vendor_api_struct::{IdologyExpectID, WrappedVendorAPI},
    },
};

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IDologyFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

impl FeatureSet for IDologyFeatures {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode> {
        &self.footprint_reason_codes
    }
    fn vendor_api(&self) -> newtypes::VendorAPI {
        VendorAPI::IdologyExpectID
    }
}

impl IDologyFeatures {
    pub fn from(resp: ExpectIDResponse, verification_result_id: VerificationResultId) -> Self {
        let footprint_reason_codes: Vec<FootprintReasonCode> = Self::footprint_reason_codes(resp);

        Self {
            footprint_reason_codes,
            verification_result_id,
        }
    }

    pub fn footprint_reason_codes(resp: ExpectIDResponse) -> Vec<FootprintReasonCode> {
        //
        // first we compute all reason codes directly from the response
        //
        let mut reason_codes: Vec<FootprintReasonCode> =
            Self::qualifier_reason_codes(resp.response.qualifiers.as_ref());

        // watchlist
        let restriction_reason_codes = resp
            .response
            .restriction
            .as_ref()
            .map(|r| PaWatchlistHit::to_footprint_reason_codes(r.watchlists()))
            .unwrap_or_default();

        // Add reason code for not locating
        let id_located = resp.response.id_located();
        if !id_located {
            reason_codes.push(FootprintReasonCode::IdNotLocated);

            return reason_codes;
        }

        reason_codes = reason_codes
            .into_iter()
            .chain(restriction_reason_codes.into_iter())
            .collect();

        //
        // Add derived reason codes, derived from the existing response codes
        //
        // Important Note: idology does _not_ provide match related codes if identity attributes match.
        // so, we cannot conclude anything about matching if the identity was not located
        if reason_codes.contains(&FootprintReasonCode::IdNotLocated)
        // Idology considers this a "restricted match" and doesn't return additional qualifiers so 
        // we shouldn't infer anything about "info" codes here
        || reason_codes.contains(&FootprintReasonCode::DobLocatedCoppaAlert)
        {
            return reason_codes;
        };
        reason_codes = Self::add_top_level_match_reason_codes(reason_codes);

        reason_codes
    }

    fn add_top_level_match_reason_codes(
        mut footprint_reason_codes: Vec<FootprintReasonCode>,
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
            footprint_reason_codes.push(FootprintReasonCode::AddressMatches);
        };

        if dob_does_not_match {
            footprint_reason_codes.push(FootprintReasonCode::DobDoesNotMatch);
        } else if dob_partially_matches {
            footprint_reason_codes.push(FootprintReasonCode::DobPartialMatch);
        } else {
            footprint_reason_codes.push(FootprintReasonCode::DobMatches);
        };

        if ssn_does_not_match {
            footprint_reason_codes.push(FootprintReasonCode::SsnDoesNotMatch);
        } else if ssn_partially_matches {
            footprint_reason_codes.push(FootprintReasonCode::SsnPartiallyMatches);
        } else {
            footprint_reason_codes.push(FootprintReasonCode::SsnMatches);
        };

        if name_does_not_match {
            footprint_reason_codes.push(FootprintReasonCode::NameDoesNotMatch);
        } else if name_partially_matches {
            footprint_reason_codes.push(FootprintReasonCode::NamePartiallyMatches);
        } else {
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

    /// Based on the set of computed reason codes, add in `Info` codes for idology.
    // TODO: add this back in later, not needed for now. We just need the high level codes
    // IMO it's okay for now to have the contract be:
    //    - we will always provide you "top level" matching codes for name/dob/ssn/address
    //    - different vendors produce different subcodes, so there may be variations in the sub-codes, and we're working on standardizing the set of reason codes you'd receive across vendors
    //    - this is non-ideal because we expose a lot of risk signals in our API docs, but we can punt this for a little while. This is super hard to test
    #[allow(dead_code)]
    fn enrich_reason_codes_with_info_codes(
        mut reason_codes: Vec<FootprintReasonCode>,
    ) -> Vec<FootprintReasonCode> {
        FootprintReasonCode::iter().for_each(|r| {
            if let Some(info_code) = r.to_info_code() {
                if !reason_codes.contains(&r) {
                    reason_codes.push(info_code)
                }
            }
        });

        reason_codes
    }
}

impl TryFrom<(&VendorAPIResponseMap, &VendorAPIResponseIdentifiersMap)> for IDologyFeatures {
    type Error = crate::decision::Error;

    fn try_from(
        maps: (&VendorAPIResponseMap, &VendorAPIResponseIdentifiersMap),
    ) -> Result<Self, Self::Error> {
        let (response_map, ids_map) = maps;
        let v = IdologyExpectID;
        let f = response_map
            .get(&v)
            .ok_or(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::from(WrappedVendorAPI::from(v.clone())),
            ))?;
        let ids = ids_map
            .get(&v)
            .ok_or(crate::decision::Error::FeatureVectorConversionError(
                VendorAPI::from(WrappedVendorAPI::from(v)),
            ))?;

        Ok(IDologyFeatures::from(
            f.clone(),
            ids.verification_result_id.clone(),
        ))
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

    use super::IDologyFeatures;

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

        IDologyFeatures::qualifier_reason_codes(resp.response.qualifiers.as_ref())
    }

    #[test_case("result.no.match", false, json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop, IdNotLocated])]
    #[test_case("result.match", false, json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop, AddressMatches, DobMatches, SsnMatches, NameMatches])]
    #[test_case("result.match", true, json!({"key": "resultcode.warm.address.alert","warm-address-list": "mail drop"}) => vec![AddressLocatedIsNotStandardMailDrop, WatchlistHitOfac, AddressMatches,DobMatches,  SsnMatches, NameMatches])]
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

        IDologyFeatures::footprint_reason_codes(resp)
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
