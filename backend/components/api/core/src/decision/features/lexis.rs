use idv::lexis::response::{
    FlexIdResponse,
    ValidElementSummary,
};
use itertools::Itertools;
use newtypes::{
    FootprintReasonCode as FRC,
    LexisNAP,
    LexisNAS,
    RiskIndicatorCode,
};
use std::convert::Into;

// 0 Nothing verified
// 10 Critical ID elements not verified, are associated with different
//    person(s), or indications such as OFAC matches, deceased/invalid SSN,
//    SSN issued prior to DOB, etc. exist
// 20 Minimal verification, critical ID elements not verified or associated
//    with different person(s)
// 30 Several ID elements verified
// 40 Last name, address and SSN or phone verified; first name, phone or SSN
//    verification failures
// 50 Full name, address, phone, SSN verified
const COMPREHENSIVE_VERIFICATION_INDEX_THRESHOLD: i32 = 20;

pub fn footprint_reason_codes(res: FlexIdResponse, ssn_submitted: bool, phone_submitted: bool) -> Vec<FRC> {
    let risk_indicator_codes = res.risk_indicator_codes();
    let nas = res.name_address_ssn_summary().name_address_ssn_matches();
    let nap = res.name_address_phone_summary().name_address_phone_matches();

    let mut match_frcs = vec![];
    match_frcs.append(&mut name_match_codes(&nas, &risk_indicator_codes));
    match_frcs.push(address_match_code(&nas, &risk_indicator_codes));

    if ssn_submitted {
        match_frcs.push(ssn_match_code(&nas, &risk_indicator_codes));
    }

    if phone_submitted {
        match_frcs.push(phone_match_code(&nap, &risk_indicator_codes));
    }

    let dob_codes = Into::<Vec<FRC>>::into(&res.dob_match_level());

    let valid_element_summary_codes = if let Some(ves) = res.valid_element_summary() {
        let mut codes = vec![];

        let ValidElementSummary {
            ssn_valid,
            ssn_deceased,
            dl_valid,
            // we dont send passport to lexis
            passport_valid: _,
            address_po_box,
            address_cmra,
            // TODO: do we need to use this? Need to clarify with Lexis what exactly this means
            // potentially we should produce SsnNotAvailable here?
            ssn_found_for_lex_id: _,
        } = ves;

        if ssn_submitted && ssn_valid.map(|s| !s).unwrap_or(false) {
            codes.push(FRC::SsnInputIsInvalid);
        }
        if ssn_deceased.unwrap_or(false) {
            codes.push(FRC::SubjectDeceased);
        }

        // (maybe) we only get this if we send `include_dl_verification` in the flex options (and send DL)
        if let Some(dlvalid) = dl_valid {
            if dlvalid {
                codes.push(FRC::DriversLicenseNumberIsValid)
            } else {
                codes.push(FRC::DriversLicenseNumberNotValid)
            }
        }

        if address_po_box.unwrap_or(false) || address_cmra.unwrap_or(false) {
            // CRMA is technically different from a PO Box but I think it's fine to keep the same single risk
            // signal here?
            codes.push(FRC::AddressInputIsPoBox);
            codes.push(FRC::AddressInputIsNonResidential);
        }

        codes
    } else {
        vec![]
    };

    let mut misc_codes = vec![];
    // TODO: ask lexis what address_secondary_range_mismatch is and if we should use

    if res.bureau_deleted().unwrap_or(false) {
        // TODO: Ask Lexis to give more deets on what situations this would happens
        misc_codes.push(FRC::BureauDeletedRecord);
    }

    if res.itin_expired().unwrap_or(false) {
        misc_codes.push(FRC::ItinIsExpired);
    }

    if let Some(pl_frc) = Into::<Option<FRC>>::into(&res.phone_line_description()) {
        misc_codes.push(pl_frc);
    }

    if res
        .comprehensive_verification_index()
        .map(|s| s <= COMPREHENSIVE_VERIFICATION_INDEX_THRESHOLD)
        .unwrap_or(false)
    {
        misc_codes.push(FRC::IdFlagged);
    }

    let risk_indicator_codes = risk_indicator_codes
        .into_iter()
        .filter_map(|ric| Into::<Option<FRC>>::into(&ric))
        .collect_vec();

    match_frcs
        .into_iter()
        .chain(dob_codes)
        .chain(valid_element_summary_codes)
        .chain(misc_codes)
        .chain(risk_indicator_codes)
        .unique()
        .collect()
}

fn name_match_codes(nas: &LexisNAS, risk_indicator_codes: &[RiskIndicatorCode]) -> Vec<FRC> {
    // supposedly R76 only applies to last name and there is no way to know if first name was partial..
    // might have to require exact match on first name if we think distinguishing partial is critical
    // here
    let first_name_frc = match nas.first_name_match {
        true => FRC::NameFirstMatches,
        false => FRC::NameFirstDoesNotMatch,
    };

    let name_was_partial_match = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R76);
    let last_name_frc = match (nas.last_name_match, name_was_partial_match) {
        (true, true) => FRC::NameLastPartiallyMatches,
        (true, false) => FRC::NameLastMatches,
        _ => FRC::NameLastDoesNotMatch,
    };

    let overall_name_frc =
        if matches!(first_name_frc, FRC::NameFirstMatches) && matches!(last_name_frc, FRC::NameLastMatches) {
            FRC::NameMatches
        } else if matches!(first_name_frc, FRC::NameFirstDoesNotMatch)
            && matches!(last_name_frc, FRC::NameLastDoesNotMatch)
        {
            FRC::NameDoesNotMatch
        } else {
            FRC::NamePartiallyMatches
        };

    vec![first_name_frc, last_name_frc, overall_name_frc]
}

fn address_match_code(nas: &LexisNAS, risk_indicator_codes: &[RiskIndicatorCode]) -> FRC {
    let address_was_partial_match = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R30);
    match (nas.address_match, address_was_partial_match) {
        (true, true) => FRC::AddressPartiallyMatches,
        (true, false) => FRC::AddressMatches,
        (false, true) => {
            tracing::error!("Unexpected Lexis response address match combination: address_match = false, address_was_partial_match = true");
            FRC::AddressDoesNotMatch
        }
        (false, false) => FRC::AddressDoesNotMatch,
    }
}

fn ssn_match_code(nas: &LexisNAS, risk_indicator_codes: &[RiskIndicatorCode]) -> FRC {
    let ssn_was_partial_match = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R29);
    match (nas.ssn_match, ssn_was_partial_match) {
        (true, true) => FRC::SsnPartiallyMatches,
        (true, false) => FRC::SsnMatches,
        (false, true) => {
            tracing::error!("Unexpected Lexis response ssn match combination: ssn_match = false, ssn_was_partial_match = true");
            FRC::SsnDoesNotMatch
        }
        (false, false) => FRC::SsnDoesNotMatch,
    }
}

fn phone_match_code(nap: &LexisNAP, risk_indicator_codes: &[RiskIndicatorCode]) -> FRC {
    let phone_was_partial_match = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R31);
    match (nap.phone_match, phone_was_partial_match) {
        (true, true) => FRC::PhoneLocatedPartiallyMatches,
        (true, false) => FRC::PhoneLocatedMatches,
        (false, true) => {
            tracing::error!("Unexpected Lexis response phone match combination: phone_match = false, phone_was_partial_match = true");
            FRC::PhoneLocatedDoesNotMatch
        }
        (false, false) => FRC::PhoneLocatedDoesNotMatch,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::test_helpers::assert_have_same_elements;
    use newtypes::FootprintReasonCode::{
        self,
        *,
    };
    use newtypes::RiskIndicatorCode as RIC;
    use test_case::test_case;

    #[test_case(true, true, vec![] => vec![FRC::NameFirstMatches, FRC::NameLastMatches, FRC::NameMatches])]
    #[test_case(false, true, vec![] => vec![FRC::NameFirstDoesNotMatch, FRC::NameLastMatches, FRC::NamePartiallyMatches])]
    #[test_case(true, false, vec![] => vec![FRC::NameFirstMatches, FRC::NameLastDoesNotMatch, FRC::NamePartiallyMatches])]
    #[test_case(false, false, vec![] => vec![FRC::NameFirstDoesNotMatch, FRC::NameLastDoesNotMatch, FRC::NameDoesNotMatch])]
    #[test_case(false, false, vec![RIC::R46] => vec![FRC::NameFirstDoesNotMatch, FRC::NameLastDoesNotMatch, FRC::NameDoesNotMatch])]
    #[test_case(true, true, vec![RIC::R46] => vec![FRC::NameFirstMatches, FRC::NameLastMatches, FRC::NameMatches])]
    #[test_case(false, false, vec![RIC::R76] => vec![FRC::NameFirstDoesNotMatch, FRC::NameLastDoesNotMatch, FRC::NameDoesNotMatch])]
    #[test_case(true, true, vec![RIC::R76] => vec![FRC::NameFirstMatches, FRC::NameLastPartiallyMatches, FRC::NamePartiallyMatches])]
    #[test_case(false, true, vec![RIC::R76] => vec![FRC::NameFirstDoesNotMatch, FRC::NameLastPartiallyMatches, FRC::NamePartiallyMatches])]
    #[test_case(true, false, vec![RIC::R76] => vec![FRC::NameFirstMatches, FRC::NameLastDoesNotMatch, FRC::NamePartiallyMatches])]
    fn test_name_match_code(first_name_match: bool, last_name_match: bool, ric: Vec<RIC>) -> Vec<FRC> {
        name_match_codes(
            &LexisNAS {
                ssn_match: false,
                first_name_match,
                last_name_match,
                address_match: false,
            },
            &ric,
        )
    }

    #[test_case(true, vec![] => FRC::AddressMatches)]
    #[test_case(true, vec![RIC::R73] => FRC::AddressMatches)]
    #[test_case(true, vec![RIC::R30] => FRC::AddressPartiallyMatches)]
    #[test_case(false, vec![RIC::R30] => FRC::AddressDoesNotMatch)]
    #[test_case(false, vec![] => FRC::AddressDoesNotMatch)]
    fn test_address_match_code(address_match: bool, ric: Vec<RIC>) -> FRC {
        address_match_code(
            &LexisNAS {
                ssn_match: false,
                first_name_match: false,
                last_name_match: false,
                address_match,
            },
            &ric,
        )
    }

    #[test_case(true, vec![] => FRC::SsnMatches)]
    #[test_case(true, vec![RIC::R39] => FRC::SsnMatches)]
    #[test_case(true, vec![RIC::R29] => FRC::SsnPartiallyMatches)]
    #[test_case(false, vec![RIC::R29] => FRC::SsnDoesNotMatch)]
    #[test_case(false, vec![] => FRC::SsnDoesNotMatch)]
    fn test_ssn_match_code(ssn_match: bool, ric: Vec<RIC>) -> FRC {
        ssn_match_code(
            &LexisNAS {
                ssn_match,
                first_name_match: false,
                last_name_match: false,
                address_match: false,
            },
            &ric,
        )
    }

    #[test_case(true, vec![] => FRC::PhoneLocatedMatches)]
    #[test_case(true, vec![RIC::R77] => FRC::PhoneLocatedMatches)]
    #[test_case(true, vec![RIC::R31] => FRC::PhoneLocatedPartiallyMatches)]
    #[test_case(false, vec![RIC::R31] => FRC::PhoneLocatedDoesNotMatch)]
    #[test_case(false, vec![] => FRC::PhoneLocatedDoesNotMatch)]
    fn test_phone_match_code(phone_match: bool, ric: Vec<RIC>) -> FRC {
        phone_match_code(
            &LexisNAP {
                phone_match,
                first_name_match: false,
                last_name_match: false,
                address_match: false,
            },
            &ric,
        )
    }

    #[test_case(
        idv::test_fixtures::passing_lexis_flex_id_response(),
        true,
        true,
        vec![
            PhoneLocatedMatches,
            NameMatches,
            NameFirstMatches,
            NameLastMatches,
            AddressMatches,
            SsnMatches,
            DobMatches,
        ])
    ]
    #[test_case(
        example1(),
        true,
        true,
        vec![
            PhoneLocatedDoesNotMatch,
            NameFirstMatches,
            NameLastMatches,
            NameMatches,
            AddressMatches,
            SsnDoesNotMatch,
            DobPartialMatch,
            DobYobDoesNotMatch,
            SsnInputIsInvalid,
            IdFlagged,
            PhoneNumberInputInvalid,
            DriversLicenseNumberNotValid,
        ])
    ]
    #[test_case(
      example1(),
      false,
      true,
      vec![
          PhoneLocatedDoesNotMatch,
          NameFirstMatches,
          NameLastMatches,
          NameMatches,
          AddressMatches,
          DobPartialMatch,
          DobYobDoesNotMatch,
          IdFlagged,
          PhoneNumberInputInvalid,
          DriversLicenseNumberNotValid,
      ])
  ]
    #[test_case(
        example2(),
        true,
        true,
        vec![
            PhoneLocatedDoesNotMatch,
            NameFirstDoesNotMatch,
            NameLastDoesNotMatch,
            NameDoesNotMatch,
            AddressDoesNotMatch,
            SsnDoesNotMatch,
            DobCouldNotMatch,
            SsnInputIsInvalid,
            IdFlagged,
            PhoneNumberInputInvalid,
            DriversLicenseNumberIsValid,
        ])
    ]
    #[test_case(
        example3(),
        true,
        true,
        vec![
            NameFirstMatches,
            NameLastMatches,
            NameMatches,
            AddressMatches,
            DobMatches,
            SsnMatches,
            PhoneLocatedMatches
        ])
    ]
    #[test_case(
      example3(),
      true,
      false,
      vec![
          NameFirstMatches,
          NameLastMatches,
          NameMatches,
          AddressMatches,
          DobMatches,
          SsnMatches,
      ])
  ]
    fn test_reason_codes(
        json: serde_json::Value,
        ssn_submitted: bool,
        phone_submitted: bool,
        expected_frc: Vec<FootprintReasonCode>,
    ) {
        let res = idv::lexis::parse_response(json).unwrap();
        assert_have_same_elements(
            expected_frc,
            super::footprint_reason_codes(res, ssn_submitted, phone_submitted),
        );
    }

    fn example1() -> serde_json::Value {
        serde_json::json!({
          "FlexIDResponseEx": {
            "@xmlns": "http://webservices.seisint.com/WsIdentity",
            "response": {
              "Header": {
                "QueryId": "30682eec-3740-4711-9437-3ede48f5fc45",
                "Status": 0,
                "TransactionId": "173740661R566943"
              },
              "Result": {
                "BureauDeleted": false,
                "ComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 20,
                  "RiskIndicators": {
                    "RiskIndicator": [
                      {
                        "Description": "Unable to verify phone number",
                        "RiskCode": "27",
                        "Sequence": 1
                      },
                      {
                        "Description": "The input SSN/TIN was missing or incomplete",
                        "RiskCode": "79",
                        "Sequence": 2
                      },
                      {
                        "Description": "Address mismatch on secondary address range",
                        "RiskCode": "SR",
                        "Sequence": 3
                      },
                      {
                        "Description": "Unable to verify date-of-birth",
                        "RiskCode": "28",
                        "Sequence": 4
                      },
                      {
                        "Description": "The input phone number is potentially invalid",
                        "RiskCode": "08",
                        "Sequence": 5
                      },
                      {
                        "Description": "The input name and address return a different phone number",
                        "RiskCode": "82",
                        "Sequence": 6
                      }
                    ]
                  }
                },
                "CustomComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 0
                },
                "EmergingId": false,
                "ITINExpired": false,
                "InputEcho": {
                  "Address": {
                    "City": "San Francisco",
                    "State": "CA",
                    "StreetAddress1": "123 Market St",
                    "Zip5": "94114"
                  },
                  "Age": 0,
                  "DOB": {
                    "Day": 1,
                    "Month": 1,
                    "Year": 1988
                  },
                  "HomePhone": "1085551212",
                  "Name": {
                    "First": "Bob",
                    "Last": "Boberto"
                  }
                },
                "InstantIDVersion": "1",
                "IsPhoneCurrent": true,
                "NameAddressPhone": {
                  "Summary": "2",
                  "Type": "S"
                },
                "NameAddressSSNSummary": 8,
                "PhoneLineDescription": "U",
                "UniqueId": "190433587765",
                "ValidElementSummary": {
                  "AddressCMRA": false,
                  "AddressPOBox": false,
                  "PassportValid": false,
                  "SSNDeceased": false,
                  "SSNFoundForLexID": true,
                  "SSNValid": false,
                  "DLValid": false,
                },
                "VerifiedElementSummary": {
                  "DOB": false,
                  "DOBMatchLevel": "4",
                  "Email": false,
                }
              }
            }
          }
        })
    }

    fn example2() -> serde_json::Value {
        serde_json::json!({
          "FlexIDResponseEx": {
            "@xmlns": "http://webservices.seisint.com/WsIdentity",
            "response": {
              "Header": {
                "QueryId": "464663c3-8b53-459e-8cc6-47db5fe47a29",
                "Status": 0,
                "TransactionId": "173740741R554729"
              },
              "Result": {
                "BureauDeleted": false,
                "ComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 0,
                  "RiskIndicators": {
                    "RiskIndicator": [
                      {
                        "Description": "Unable to verify name, address, SSN/TIN and phone",
                        "RiskCode": "19",
                        "Sequence": 1
                      },
                      {
                        "Description": "The input SSN/TIN was missing or incomplete",
                        "RiskCode": "79",
                        "Sequence": 2
                      },
                      {
                        "Description": "Address mismatch between city/state and zip code",
                        "RiskCode": "CZ",
                        "Sequence": 3
                      },
                      {
                        "Description": "Unable to verify date-of-birth",
                        "RiskCode": "28",
                        "Sequence": 4
                      },
                      {
                        "Description": "No date-of-birth reported for the input identity",
                        "RiskCode": "NB",
                        "Sequence": 5
                      },
                      {
                        "Description": "The input phone number is potentially invalid",
                        "RiskCode": "08",
                        "Sequence": 6
                      },
                      {
                        "Description": "The input name and address return a different phone number",
                        "RiskCode": "82",
                        "Sequence": 7
                      },
                      {
                        "Description": "The input address returns a different phone number",
                        "RiskCode": "64",
                        "Sequence": 8
                      }
                    ]
                  }
                },
                "CustomComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 0
                },
                "EmergingId": false,
                "ITINExpired": false,
                "InputEcho": {
                  "Address": {
                    "City": "Anytown",
                    "State": "CA",
                    "StreetAddress1": "123 Main St",
                    "Zip5": "94114"
                  },
                  "Age": 0,
                  "DOB": {
                    "Day": 1,
                    "Month": 1,
                    "Year": 1975
                  },
                  "HomePhone": "1085551212",
                  "Name": {
                    "First": "Bob",
                    "Last": "Boberto"
                  }
                },
                "InstantIDVersion": "1",
                "IsPhoneCurrent": true,
                "NameAddressPhone": {
                  "Summary": "0"
                },
                "NameAddressSSNSummary": 0,
                "PhoneLineDescription": "U",
                "UniqueId": "0",
                "ValidElementSummary": {
                  "AddressCMRA": false,
                  "AddressPOBox": false,
                  "PassportValid": false,
                  "SSNDeceased": false,
                  "SSNFoundForLexID": false,
                  "SSNValid": false,
                  "DLValid": true
                },
                "VerifiedElementSummary": {
                  "DOB": false,
                  "DOBMatchLevel": "0",
                  "Email": false,
                }
              }
            }
          }
        })
    }

    fn example3() -> serde_json::Value {
        serde_json::json!({
          "FlexIDResponseEx": {
            "@xmlns": "http://webservices.seisint.com/WsIdentity",
            "response": {
              "Header": {
                "QueryId": "041ddab8-0f48-4558-8283-364908669f3f",
                "Status": 0,
                "TransactionId": "173740681R563168"
              },
              "Result": {
                "BureauDeleted": false,
                "ComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 40,
                  "RiskIndicators": {
                    "RiskIndicator": [
                      {
                        "Description": "Address mismatch on secondary address range",
                        "RiskCode": "SR",
                        "Sequence": 1
                      },
                    ]
                  }
                },
                "CustomComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 0
                },
                "EmergingId": false,
                "ITINExpired": false,
                "InputEcho": {
                  "Address": {
                    "City": "San Francisco",
                    "State": "CA",
                    "StreetAddress1": "123 Market St",
                    "Zip5": "94114"
                  },
                  "Age": 0,
                  "DOB": {
                    "Day": 1,
                    "Month": 1,
                    "Year": 1988
                  },
                  "HomePhone": "1085551212",
                  "Name": {
                    "First": "Bob",
                    "Last": "Boberto"
                  }
                },
                "InstantIDVersion": "1",
                "IsPhoneCurrent": true,
                "NameAddressPhone": {
                  "Summary": "12",
                  "Type": "S"
                },
                "NameAddressSSNSummary": 12,
                "PhoneLineDescription": "U",
                "UniqueId": "190433587765",
                "ValidElementSummary": {
                  "AddressCMRA": false,
                  "AddressPOBox": false,
                  "PassportValid": false,
                  "SSNDeceased": false,
                  "SSNFoundForLexID": true,
                  "SSNValid": true
                },
                "VerifiedElementSummary": {
                  "DOB": true,
                  "DOBMatchLevel": "8",
                  "Email": false
                }
              }
            }
          }
        })
    }
}
