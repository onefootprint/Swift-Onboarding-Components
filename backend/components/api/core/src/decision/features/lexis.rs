use super::risk_signals::UserSubmittedInfoForFRC;
use idv::lexis::response::FlexIdResponse;
use idv::lexis::response::ValidElementSummary;
use itertools::Itertools;
use newtypes::FootprintReasonCode as FRC;
use newtypes::LexisNAP;
use newtypes::LexisNAS;
use newtypes::NameAddress;
use newtypes::NameAddressSsnSummary;
use newtypes::RiskIndicatorCode;
use serde::Serialize;
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

pub fn footprint_reason_codes(res: FlexIdResponse, user_info: UserSubmittedInfoForFRC) -> Vec<FRC> {
    let risk_indicator_codes = res.risk_indicator_codes();
    let nas = res.name_address_ssn_summary();
    let match_logic = MatchLogicRiskIndicatorsOnly {};
    let match_frcs = IdentityAttributeMatch::new(match_logic, &res, user_info);

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

        if user_info.ssn {
            let ssn_valid = ssn_valid.unwrap_or(true);
            let nas_nothing_found = matches!(nas, NameAddressSsnSummary::NothingFound);
            match (ssn_valid, nas_nothing_found) {
                // Lexis apparently defaults ssn_valid to false if NAS = 0
                (_, true) => codes.push(FRC::SsnNotOnFile),
                (false, _) => codes.push(FRC::SsnInputIsInvalid),
                _ => (),
            }
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

    let email_codes = res
        .verified_element_summary()
        .and_then(|ves| ves.email)
        .map(|email_verified| {
            if email_verified {
                vec![FRC::EmailFoundOnFile]
            } else {
                vec![FRC::EmailNotFoundOnFile]
            }
        })
        .unwrap_or_default();

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
        .into_reason_codes()
        .into_iter()
        .chain(valid_element_summary_codes)
        .chain(misc_codes)
        .chain(risk_indicator_codes)
        .chain(email_codes)
        .unique()
        .collect()
}

#[derive(Clone, Serialize)]
struct IdentityAttributeMatch {
    name: Vec<FRC>,
    address: FRC,
    ssn: Option<FRC>,
    dob: Vec<FRC>,
    phone: Option<FRC>,
}
impl IdentityAttributeMatch {
    pub fn new<T>(
        match_logic: T,
        res: &FlexIdResponse,
        user_info: UserSubmittedInfoForFRC,
    ) -> IdentityAttributeMatch
    where
        T: LexisMatchLogic,
    {
        let name = match_logic.name_match_codes(res);
        let address = match_logic.address_match_code(res);
        let ssn = user_info.ssn.then_some(match_logic.ssn_match_code(res));
        let phone = user_info.phone.then_some(match_logic.phone_match_code(res));
        let dob = match_logic.dob_match_codes(res);

        Self {
            name,
            address,
            ssn,
            dob,
            phone,
        }
    }

    pub fn into_reason_codes(self) -> Vec<FRC> {
        let ssn = vec![self.ssn].into_iter().flatten();
        let phone = vec![self.phone].into_iter().flatten();

        self.name
            .into_iter()
            .chain(vec![self.address])
            .chain(ssn)
            .chain(self.dob)
            .chain(phone)
            .unique()
            .collect()
    }
}

trait LexisMatchLogic {
    fn name_match_codes(&self, res: &FlexIdResponse) -> Vec<FRC>;
    fn address_match_code(&self, res: &FlexIdResponse) -> FRC;
    fn ssn_match_code(&self, res: &FlexIdResponse) -> FRC;
    fn phone_match_code(&self, res: &FlexIdResponse) -> FRC;
    fn dob_match_codes(&self, res: &FlexIdResponse) -> Vec<FRC>;
}

// Previous logic, deprecated 2024-10-17
#[allow(unused)]
struct CurrentMatchLogic;

impl CurrentMatchLogic {
    fn name_match_codes(name_address: &NameAddress, risk_indicator_codes: &[RiskIndicatorCode]) -> Vec<FRC> {
        // supposedly R76 only applies to last name and there is no way to know if first name was partial..
        // might have to require exact match on first name if we think distinguishing partial is critical
        // here
        let first_name_frc = match name_address.first_name_match {
            true => FRC::NameFirstMatches,
            false => FRC::NameFirstDoesNotMatch,
        };

        let name_was_partial_match = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R76);
        let last_name_frc = match (name_address.last_name_match, name_was_partial_match) {
            (true, true) => FRC::NameLastPartiallyMatches,
            (true, false) => FRC::NameLastMatches,
            _ => FRC::NameLastDoesNotMatch,
        };

        let overall_name_frc = if matches!(first_name_frc, FRC::NameFirstMatches)
            && matches!(last_name_frc, FRC::NameLastMatches)
        {
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

    // LexisNAS - The InstantID NAS summary is an index from 0 through 12 that indicates the level of
    // the match of the submitted name, address, and SSN.
    // Risk Indicator code 30 - Input address may have been miskeyed
    // - e.g Considered miskeyed if it has a match score of 80% or better. (460 Whisper Lake matches to
    //   4660 Whisper Lake Dr **Apt 4**). Unsure if we can configure this 80%.
    fn address_match_code(name_address: &NameAddress, risk_indicator_codes: &[RiskIndicatorCode]) -> FRC {
        // check if Lexis is saying this might be a close/miskey match (e.g. it matched >= 80%)
        let address_was_partial_match = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R30);
        // Note: We can control whether the NAS only return match if exact match (via `RequireExactMatch` in
        // the flex ID request). We do not currently require exact matches.
        //
        // So we interpret:
        //  - NAS Address matched (it may be non-exact per the flexid request setting)
        //  - was it miskeyed (it was a partial match via the Risk indicator)
        // in order to determine if it's an exact match
        match (name_address.address_match, address_was_partial_match) {
            (true, true) => FRC::AddressPartiallyMatches,
            (true, false) => FRC::AddressMatches,
            (false, true) => {
                // it's unclear if there's 2 thresholds here for computing the NAS and the risk indicator, so
                // we just log
                tracing::info!("Unexpected Lexis response address match combination: address_match = false, address_was_partial_match = true");
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
}

impl LexisMatchLogic for CurrentMatchLogic {
    fn name_match_codes(&self, res: &FlexIdResponse) -> Vec<FRC> {
        let risk_indicator_codes = res.risk_indicator_codes();
        let nas = res.name_address_ssn_summary().name_address_ssn_matches();
        let name_address = (&nas).into();
        Self::name_match_codes(&name_address, &risk_indicator_codes)
    }

    fn address_match_code(&self, res: &FlexIdResponse) -> FRC {
        let risk_indicator_codes = res.risk_indicator_codes();
        let nas = res.name_address_ssn_summary().name_address_ssn_matches();
        let name_address = (&nas).into();
        Self::address_match_code(&name_address, &risk_indicator_codes)
    }

    fn ssn_match_code(&self, res: &FlexIdResponse) -> FRC {
        let nas = res.name_address_ssn_summary().name_address_ssn_matches();
        let risk_indicator_codes = res.risk_indicator_codes();
        Self::ssn_match_code(&nas, &risk_indicator_codes)
    }

    fn phone_match_code(&self, res: &FlexIdResponse) -> FRC {
        let risk_indicator_codes = res.risk_indicator_codes();
        let nap = res.name_address_phone_summary().name_address_phone_matches();
        Self::phone_match_code(&nap, &risk_indicator_codes)
    }

    fn dob_match_codes(&self, res: &FlexIdResponse) -> Vec<FRC> {
        Into::<Vec<FRC>>::into(&res.dob_match_level())
    }
}

// Production match logic, 2024-10-17
struct MatchLogicRiskIndicatorsOnly;
impl MatchLogicRiskIndicatorsOnly {
    fn name_match(risk_indicator_codes: &[RiskIndicatorCode]) -> Vec<FRC> {
        // Need this for corner cases. see response for vreq_0J2FA6IuntOkqlpRJfKSyI
        if risk_indicator_codes.contains(&RiskIndicatorCode::R19) {
            return vec![
                FRC::NameFirstDoesNotMatch,
                FRC::NameLastDoesNotMatch,
                FRC::NameDoesNotMatch,
            ];
        }

        // Otherwise, parse individual codes
        let first_name_frc = if risk_indicator_codes.contains(&RiskIndicatorCode::R48) {
            FRC::NameFirstDoesNotMatch
        } else {
            FRC::NameFirstMatches
        };

        // Apparently this only applies to Last name
        let last_name_matches = !risk_indicator_codes.contains(&RiskIndicatorCode::R37);
        // Apparently this only applies to Last name
        // TODO: introduce closely matches?  From Lexis:
        // We will return this risk code when we did successfully verify
        // the input last name to the LN last name.  Risk code 76 indicates it was a close-enough match but
        // there was a minimal miskey on the input last name.  With this scenario, last name is a match.
        let last_name_partially_matches = risk_indicator_codes.contains(&newtypes::RiskIndicatorCode::R76);

        let last_name_frc = match (last_name_matches, last_name_partially_matches) {
            (true, true) => FRC::NameLastPartiallyMatches,
            (true, false) => FRC::NameLastMatches,
            _ => FRC::NameLastDoesNotMatch,
        };

        let overall_name_frc = if matches!(first_name_frc, FRC::NameFirstMatches)
            && matches!(last_name_frc, FRC::NameLastMatches)
        {
            FRC::NameMatches
        } else if matches!(first_name_frc, FRC::NameFirstDoesNotMatch)
            && matches!(last_name_frc, FRC::NameLastDoesNotMatch)
        {
            FRC::NameDoesNotMatch
        } else {
            FRC::NamePartiallyMatches
        };


        // TODO: handle flipped name?
        vec![first_name_frc, last_name_frc, overall_name_frc]
    }

    fn address_match(risk_indicator_codes: &[RiskIndicatorCode]) -> FRC {
        if risk_indicator_codes.contains(&RiskIndicatorCode::R25)
        // Need this for corner cases. see response for vreq_0J2FA6IuntOkqlpRJfKSyI
            || risk_indicator_codes.contains(&RiskIndicatorCode::R19)
        {
            FRC::AddressDoesNotMatch
            // TODO: introduce address closely matches? From Lexis
            // We will return this risk code when we did successfully verify the input address to
            // the LN address.  Risk code 30 indicates it was a close-enough match but there was a
            // minimal miskey on the input address.
        } else if risk_indicator_codes.contains(&RiskIndicatorCode::R30) {
            FRC::AddressPartiallyMatches
        } else {
            FRC::AddressMatches
        }
    }
}
impl LexisMatchLogic for MatchLogicRiskIndicatorsOnly {
    fn name_match_codes(&self, res: &FlexIdResponse) -> Vec<FRC> {
        let risk_indicator_codes = res.risk_indicator_codes();
        Self::name_match(&risk_indicator_codes)
    }

    fn address_match_code(&self, res: &FlexIdResponse) -> FRC {
        let risk_indicator_codes = res.risk_indicator_codes();
        Self::address_match(&risk_indicator_codes)
    }

    fn ssn_match_code(&self, res: &FlexIdResponse) -> FRC {
        let nas = res.name_address_ssn_summary().name_address_ssn_matches();
        let risk_indicator_codes = res.risk_indicator_codes();
        CurrentMatchLogic::ssn_match_code(&nas, &risk_indicator_codes)
    }

    fn phone_match_code(&self, res: &FlexIdResponse) -> FRC {
        let risk_indicator_codes = res.risk_indicator_codes();
        let nap = res.name_address_phone_summary().name_address_phone_matches();
        CurrentMatchLogic::phone_match_code(&nap, &risk_indicator_codes)
    }

    fn dob_match_codes(&self, res: &FlexIdResponse) -> Vec<FRC> {
        Into::<Vec<FRC>>::into(&res.dob_match_level())
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use db::test_helpers::assert_have_same_elements;
    use newtypes::FootprintReasonCode::*;
    use newtypes::FootprintReasonCode::{
        self,
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
        let nas = LexisNAS {
            ssn_match: false,
            first_name_match,
            last_name_match,
            address_match: false,
        };
        let name_address = (&nas).into();

        CurrentMatchLogic::name_match_codes(&name_address, &ric)
    }

    #[test_case(true, vec![] => FRC::AddressMatches)]
    #[test_case(true, vec![RIC::R37] => FRC::AddressMatches)]
    #[test_case(true, vec![RIC::R30] => FRC::AddressPartiallyMatches)]
    #[test_case(false, vec![RIC::R30] => FRC::AddressDoesNotMatch)]
    #[test_case(false, vec![] => FRC::AddressDoesNotMatch)]
    fn test_address_match_code(address_match: bool, ric: Vec<RIC>) -> FRC {
        let nas = LexisNAS {
            ssn_match: false,
            first_name_match: false,
            last_name_match: false,
            address_match,
        };
        let name_address = (&nas).into();
        CurrentMatchLogic::address_match_code(&name_address, &ric)
    }

    #[test_case(true, vec![] => FRC::SsnMatches)]
    #[test_case(true, vec![RIC::R39] => FRC::SsnMatches)]
    #[test_case(true, vec![RIC::R29] => FRC::SsnPartiallyMatches)]
    #[test_case(false, vec![RIC::R29] => FRC::SsnDoesNotMatch)]
    #[test_case(false, vec![] => FRC::SsnDoesNotMatch)]
    fn test_ssn_match_code(ssn_match: bool, ric: Vec<RIC>) -> FRC {
        CurrentMatchLogic::ssn_match_code(
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
        CurrentMatchLogic::phone_match_code(
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
            EmailFoundOnFile
        ])
    ]
    #[test_case(
        example1(),
        true,
        true,
        vec![
            NameFirstMatches,
            NameLastMatches,
            NameMatches,
            AddressMatches,
            SsnDoesNotMatch,
            PhoneLocatedDoesNotMatch,
            DobPartialMatch,
            DobYobDoesNotMatch,
            SsnInputIsInvalid,
            DriversLicenseNumberNotValid,
            IdFlagged,
            PhoneNumberInputInvalid,
            EmailNotFoundOnFile
        ])
    ]
    #[test_case(
        example1(),
        false,
        true,
        vec![
            NameFirstMatches,
            NameLastMatches,
            NameMatches,
            AddressMatches,
            PhoneLocatedDoesNotMatch,
            DobPartialMatch,
            DobYobDoesNotMatch,
            DriversLicenseNumberNotValid,
            IdFlagged,
            PhoneNumberInputInvalid,
            EmailNotFoundOnFile
        ])
  ]
    #[test_case(
        example2(),
        true,
        true,
        vec![
            NameFirstDoesNotMatch,
            NameLastDoesNotMatch,
            NameDoesNotMatch,
            AddressDoesNotMatch,
            SsnDoesNotMatch,
            PhoneLocatedDoesNotMatch,
            DobCouldNotMatch,
            DriversLicenseNumberIsValid,
            IdFlagged,
            DobNotOnFile,
            PhoneNumberInputInvalid,
            PhoneLocatedAddressDoesNotMatch,
            EmailNotFoundOnFile,
            SsnNotOnFile
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
            PhoneLocatedMatches,
            EmailFoundOnFile
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
          EmailFoundOnFile,
      ])
  ]
    fn test_reason_codes(
        json: serde_json::Value,
        ssn_submitted: bool,
        phone_submitted: bool,
        expected_frc: Vec<FootprintReasonCode>,
    ) {
        let res = idv::lexis::parse_response(json).unwrap();
        let user_info = UserSubmittedInfoForFRC {
            ssn: ssn_submitted,
            phone: phone_submitted,
            dob: false,
        };
        assert_have_same_elements(expected_frc, super::footprint_reason_codes(res, user_info));
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
                  "Email": true
                }
              }
            }
          }
        })
    }
}
