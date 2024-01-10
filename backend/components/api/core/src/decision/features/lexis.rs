use idv::lexis::response::{FlexIdResponse, ValidElementSummary};
use itertools::Itertools;
use newtypes::FootprintReasonCode as FRC;
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
const COMPREHENSIVE_VERIFICATION_INDEX_THRESHOLD: i32 = 30;

pub fn footprint_reason_codes(res: FlexIdResponse) -> Vec<FRC> {
    let phone_codes = Into::<Vec<FRC>>::into(&res.name_address_phone_summary());
    let name_address_ssn_codes = Into::<Vec<FRC>>::into(&res.name_address_ssn_summary());
    let dob_codes = Into::<Vec<FRC>>::into(&res.dob_match_level());

    let valid_element_summary_codes = if let Some(ves) = res.valid_element_summary() {
        let mut codes = vec![];

        let ValidElementSummary {
            ssn_valid,
            ssn_deceased,
            // we dont send dl to lexis
            dl_valid: _,
            // we dont send passport to lexis
            passport_valid: _,
            address_po_box,
            address_cmra,
            // TODO: do we need to use this? Need to clarify with Lexis what exactly this means
            // potentially we should produce SsnNotAvailable here?
            ssn_found_for_lex_id: _,
        } = ves;

        if ssn_valid.map(|s| !s).unwrap_or(false) {
            codes.push(FRC::SsnInputIsInvalid);
        }
        if ssn_deceased.unwrap_or(false) {
            codes.push(FRC::SubjectDeceased);
        }
        if address_po_box.unwrap_or(false) || address_cmra.unwrap_or(false) {
            // CRMA is technically different from a PO Box but I think it's fine to keep the same single risk signal here?
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

    let risk_indicator_codes = res
        .risk_indicator_codes()
        .into_iter()
        .filter_map(|ric| Into::<Option<FRC>>::into(&ric))
        .collect_vec();

    // TODO: Don't produce SSN reason codes if SSN not submitted!
    phone_codes
        .into_iter()
        .chain(name_address_ssn_codes)
        .chain(dob_codes)
        .chain(valid_element_summary_codes)
        .chain(misc_codes)
        .chain(risk_indicator_codes)
        .unique()
        .collect()
}

#[cfg(test)]
mod tests {
    use db::test_helpers::assert_have_same_elements;
    use newtypes::FootprintReasonCode::{self, *};
    use test_case::test_case;

    #[test_case(
        idv::test_fixtures::passing_lexis_flex_id_response(),
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
            PhoneNumberInputInvalid
        ])
    ]
    #[test_case(
        example2(),
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
            PhoneNumberInputInvalid
        ])
    ]
    #[test_case(
        example3(),
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
    fn test_reason_codes(json: serde_json::Value, expected_frc: Vec<FootprintReasonCode>) {
        let res = idv::lexis::parse_response(json).unwrap();
        assert_have_same_elements(expected_frc, super::footprint_reason_codes(res));
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
                  "SSNValid": false
                },
                "VerifiedElementSummary": {
                  "DOB": false,
                  "DOBMatchLevel": "4",
                  "Email": false
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
                  "SSNValid": false
                },
                "VerifiedElementSummary": {
                  "DOB": false,
                  "DOBMatchLevel": "0",
                  "Email": false
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
