use idv::incode::doc::response::{FetchScoresResponse, FetchOCRResponse, IncodeOcrFixtureResponseFields};
use itertools::Itertools;
use newtypes::{
    incode::{IncodeRCH, IncodeStatus, IncodeTest},
    FootprintReasonCode, VendorAPI, PiiString, VerificationResultId, DataIdentifier, IdentityDataKind,
};
use regex::Regex;
use crate::{decision::onboarding::FeatureSet, enclave_client::EnclaveClient, utils::vault_wrapper::{VaultWrapper, Person, DecryptUncheckedResult}, errors::ApiResult};


#[derive(Default, Clone)]
pub struct IncodeOcrComparisonDataFields {
    pub first_name: Option<PiiString>,
    pub middle_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub dob: Option<PiiString>,
}

impl From<IncodeOcrComparisonDataFields> for IncodeOcrFixtureResponseFields {
    fn from(value: IncodeOcrComparisonDataFields) -> Self {
        let IncodeOcrComparisonDataFields { first_name, middle_name:_ , last_name, dob } = value;
        Self { first_name, last_name, dob }
    }
}

impl IncodeOcrComparisonDataFields {
    pub async fn compose(enclave_client: &EnclaveClient, vw: &VaultWrapper<Person>) -> ApiResult<Self> {
        let fields = &[
            DataIdentifier::Id(IdentityDataKind::FirstName),
            DataIdentifier::Id(IdentityDataKind::LastName),
            DataIdentifier::Id(IdentityDataKind::Dob),
            // TODO: address
        ];
        let vd = vw.decrypt_unchecked(enclave_client, fields).await?;
        let result = Self::from_decrypted_values(&vd);
        Ok(result)
    }

    pub fn from_decrypted_values(vd: &DecryptUncheckedResult) -> Self {
        IncodeOcrComparisonDataFields {
            first_name: vd.get_di(IdentityDataKind::FirstName).ok(),
            middle_name: vd.get_di(IdentityDataKind::MiddleName).ok(),
            last_name: vd.get_di(IdentityDataKind::LastName).ok(),
            dob: vd.get_di(IdentityDataKind::Dob).ok(),
        }
    }
}

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IncodeDocumentFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

impl FeatureSet for IncodeDocumentFeatures {
    fn footprint_reason_codes(&self) -> Vec<FootprintReasonCode> {
        self.footprint_reason_codes.clone()
    }
    fn vendor_apis(&self) -> Vec<newtypes::VendorAPI> {
        // TODO: Not quite right, but that's fine since this won't be used. 
        // eventually should move this to some sort of vendor api struct
        vec![VendorAPI::IncodeFetchScores, VendorAPI::IncodeFetchOcr]
    }
}

// Once we move RiskSignals to being computed at the time are handling the VRes, we can use this method.
pub fn footprint_reason_codes(
    ocr: FetchOCRResponse,
    scores: FetchScoresResponse,
    vault_data: IncodeOcrComparisonDataFields,
    // not all documents collect will have selfie
    expect_selfie: bool
) -> Result<Vec<FootprintReasonCode>, idv::Error> {
    let score_reason_codes = reason_codes_from_score_response(&scores, expect_selfie);
    let ocr_reason_codes = reason_codes_from_ocr_response(&ocr, vault_data);

    Ok(score_reason_codes.into_iter().chain(ocr_reason_codes.into_iter()).collect())
}

pub fn reason_codes_from_score_response(res: &FetchScoresResponse, expect_selfie: bool) -> Vec<FootprintReasonCode> {
    // Overall score
    // 
    // We check for the existence of this at the vendor call layer, but our decisioning relies most heavily on the score (for now)
    // and we should not proceed if we don't have it
    let document_score_code = if res
        .document_score().1.unwrap_or(IncodeStatus::Fail) == IncodeStatus::Fail
    {
        vec![FootprintReasonCode::DocumentNotVerified]
    } else {
        vec![FootprintReasonCode::DocumentVerified]
    };

    // OCR
    // TODO: if this happens, would we not be able to retrieve OCR from incode?
    //  should we just not vault it if OCR confidence isn't high?
    //  would overall score always be failure then?
    let ocr_code = if res
        .id_ocr_confidence().1.unwrap_or(IncodeStatus::Fail) == IncodeStatus::Fail
    {
        vec![FootprintReasonCode::DocumentOcrNotSuccessful]
    } else {
        vec![FootprintReasonCode::DocumentOcrSuccessful]
    };
    
    // only populate reason code if we collected a selfie
    let selfie_code = if expect_selfie {
        if res.selfie_match().1.unwrap_or(IncodeStatus::Fail)  == IncodeStatus::Fail
        {
            vec![FootprintReasonCode::DocumentSelfieDoesNotMatch]
        } else {
            vec![FootprintReasonCode::DocumentSelfieMatches]
        }
    } else {
        vec![]
    };
    
    // ID Tests => FRC
    let (id_test_frcs, barcode_crosscheck_results): (Vec<FootprintReasonCode>, Vec<(bool, bool)>) = res
        .get_id_tests()
        .iter()
        .filter_map(get_frc_from_test)
        .unzip();
    let barcode_check_failed = barcode_crosscheck_results.iter().any(|(fail,_)| *fail);
    let barcode_check_passed = barcode_crosscheck_results.iter().any(|(_, pass)| *pass);
    let barcode_decoded = id_test_frcs.contains(&FootprintReasonCode::DocumentBarcodeCouldBeRead);
    let barcode_checks_ran = (barcode_check_passed || barcode_check_failed) && barcode_decoded;

    let barcode_frc = if barcode_checks_ran {
        if barcode_check_failed {
            vec![FootprintReasonCode::DocumentBarcodeContentDoesNotMatch]
        } else {
            vec![FootprintReasonCode::DocumentBarcodeContentMatches]
        }
    } else {
        vec![]
    };

    // Face tests => FRC
    let (glasses_check, mask_check) = res.get_face_test_results();
    let face_codes: Vec<FootprintReasonCode> = [
        glasses_check.and_then(|has_glasses| has_glasses.then_some(FootprintReasonCode::DocumentSelfieGlasses)),
        mask_check.and_then(|has_glasses| has_glasses.then_some(FootprintReasonCode::DocumentSelfieMask))
    ].into_iter().flatten().collect();

    document_score_code.into_iter()
        .chain(ocr_code.into_iter())
        .chain(selfie_code.into_iter())
        .chain(id_test_frcs.into_iter())
        .chain(face_codes.into_iter())
        .chain(barcode_frc.into_iter())
        .collect()
}

fn merge<'a>(a: Option<&'a PiiString>, b: Option<&'a PiiString>) -> Option<(&'a PiiString, &'a PiiString)> {
    a.and_then(|a| b.map(|b| (a, b)))
}

    
pub fn reason_codes_from_ocr_response(res: &FetchOCRResponse, vault_data: IncodeOcrComparisonDataFields) -> Vec<FootprintReasonCode> {
    let parsed_names = ParsedIncodeNames::from_fetch_ocr_res(res);
    
    let first_name_matches = first_name_matches(&parsed_names, &vault_data);
    let last_name_matches = last_name_matches(&parsed_names, &vault_data);
    let dob_matches = dob_matches(res, &vault_data);
    let name_matches = first_name_matches.and_then(|x| last_name_matches.map(|y| x && y));
    
    reason_codes_from_matching(first_name_matches,last_name_matches,name_matches, dob_matches)
}

fn first_name_matches(parsed: &ParsedIncodeNames, vault: &IncodeOcrComparisonDataFields) -> Option<bool> {
    let parsed_first_middle: Option<PiiString> = merge(parsed.first_name.as_ref(), parsed.middle_name.as_ref()).map(|(f,m)| format!("{} {}", f.leak(), m.leak()).into());
    let vault_first_middle: Option<PiiString> = merge(vault.first_name.as_ref(), vault.middle_name.as_ref()).map(|(f,m)| format!("{} {}", f.leak(), m.leak()).into());

    let first_matches_first = merge(parsed.first_name.as_ref(), vault.first_name.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));
    let first_matches_first_middle = merge(parsed.first_name.as_ref(), vault_first_middle.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));
    // for eg: if a MEX user entered both their given names into first_name and left middle_name blank
    let first_middle_matches_first = merge(parsed_first_middle.as_ref(), vault.first_name.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));
    // for eg: if you have many given names and split them across first_name/middle_name differently than our/Incode's parsing logic
    let first_middle_matches_first_middle = merge(parsed_first_middle.as_ref(), vault_first_middle.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b));

    [first_matches_first, first_matches_first_middle, first_middle_matches_first, first_middle_matches_first_middle].into_iter().flatten().max()
}

fn last_name_matches(parsed: &ParsedIncodeNames, vault_data: &IncodeOcrComparisonDataFields) -> Option<bool> {
    // surnames seem to be less ambiguous so let's just directly compare for now
    merge(parsed.last_name.as_ref(), vault_data.last_name.as_ref()).map(|(a, b)| pii_strings_match_name_normalized(a, b))
}

fn dob_matches(ocr: &FetchOCRResponse, vault_data: &IncodeOcrComparisonDataFields) -> Option<bool> {
    let dob_ocr: Option<PiiString> = ocr.dob().ok().map(|s| s.into());
    vault_data.dob.clone().and_then(|dob| dob_ocr.as_ref().map(|ocr_dob| pii_strings_match(ocr_dob, &dob)))
}

fn reason_codes_from_matching(first_name_matches: Option<bool>, last_name_matches: Option<bool>, name_matches: Option<bool>, dob_matches: Option<bool>) -> Vec<FootprintReasonCode> {
    [
        (first_name_matches, FootprintReasonCode::DocumentOcrFirstNameMatches, FootprintReasonCode::DocumentOcrFirstNameDoesNotMatch),
        (last_name_matches, FootprintReasonCode::DocumentOcrLastNameMatches, FootprintReasonCode::DocumentOcrLastNameDoesNotMatch),
        (name_matches, FootprintReasonCode::DocumentOcrNameMatches, FootprintReasonCode::DocumentOcrNameDoesNotMatch),
        (dob_matches, FootprintReasonCode::DocumentOcrDobMatches, FootprintReasonCode::DocumentOcrDobDoesNotMatch),
    ]
    .into_iter()
    .filter_map(|(is_match, match_signal, mismatch_signal)| is_match.map(|is_match| if is_match {
        match_signal
    } else {
        mismatch_signal
    }))
    .collect()
}


pub fn pii_strings_match_name_normalized(name1: &PiiString, name2: &PiiString) -> bool {
    // deunicode is guaranteed to only produce 0-127 ascii chars
    let normalized_name1 = convert_unicode_and_remove_non_alphabetic_chars(&deunicode::deunicode(name1.leak()).into());
    let normalized_name2 = convert_unicode_and_remove_non_alphabetic_chars(&deunicode::deunicode(name2.leak()).into());

    pii_strings_match(name1, name2) || pii_strings_match(&normalized_name1, &normalized_name2)
}


fn non_alphabetic_regex() -> Regex {
    #[allow(clippy::unwrap_used)]
    Regex::new(r"[^a-zA-Z]+").unwrap()
}


fn convert_unicode_and_remove_non_alphabetic_chars(s: &PiiString) -> PiiString {
    non_alphabetic_regex().replace_all(s.leak(), "").to_string().into()
}

fn pii_strings_match(p1: &PiiString, p2: &PiiString) -> bool {
    let normalized_p1 = normalize_pii(p1);
    let normalized_p2 = normalize_pii(p2);
    (normalized_p1.leak() == normalized_p2.leak()) && !(normalized_p1.leak().is_empty() || normalized_p2.leak().is_empty())
}


fn normalize_pii(p: &PiiString) -> PiiString {
    p.leak().trim().to_lowercase().into()
}

fn get_frc_from_test(value: (&IncodeTest, &IncodeStatus)) -> Option<(FootprintReasonCode, (bool, bool))> {
    let (t, s) = value;
    let frc_helper: Option<IncodeRCH> = t.into();
    frc_helper.and_then(|f| {
        if s == &IncodeStatus::Fail {
            f.fail_code.map(|c| (c, (t.is_crosscheck(), false)))
        } else {
            f.ok_code.map(|c| (c,  (false, t.is_crosscheck())))
        }
    })
}


#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ParsedIncodeNames {
    pub first_name: Option<PiiString>,
    pub middle_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub full_name: Option<PiiString>
}

impl ParsedIncodeNames {
    fn new(first_name: Option<PiiString>, middle_name: Option<PiiString>, last_name: Option<PiiString>) -> Self {
            let full_name = vec![first_name.clone(), middle_name.clone(), last_name.clone()].into_iter().flatten().map(|s| s.leak_to_string()).join(" ");
            let full_name = if full_name.is_empty() {
                None
            } else {
                Some(full_name.into())
            };

            Self {
                first_name,
                middle_name,
                last_name,
                full_name
            }
        }

    pub fn from_fetch_ocr_res(ocr: &FetchOCRResponse) -> ParsedIncodeNames {
        let Some(name) = ocr.name.clone() else {
            return ParsedIncodeNames::new(None, None, None);
        };

        // If we have both given_name_mrz and last_name_mrz, then we can populate fn/mn/ln entirely from these
        // this seems to only be the case for MEX style documents where there are "given names" + "surnames" rather than fn/ln
        if let (Some(given_name_mrz), Some(last_name_mrz)) = (name.given_name_mrz, name.last_name_mrz) {
            let last_name = last_name_mrz.leak_to_string().trim().into();

            // there is some ambiguity here in differentiating "first" vs "middle" names. In particular if this is indeed a MEX style case, there is no concept really of a middle name and we can't be totally sure how these folks will enter their names in across first_name vs middle_name. So for now, we just take the first token as first_name and the rest as middle_name and then when we produce match reason codes, we need to be careful to be robust to users entering in given names across first_name + middle_name in different ways
            let (first_name, middle_name) = Self::parse_into_first_middle(given_name_mrz.leak_to_string().trim().into());

            return ParsedIncodeNames::new(
                first_name,
                middle_name,
                Some(last_name)
            )
        }

        let last_name: Option<PiiString> = match (name.paternal_last_name, name.maternal_last_name)  {
            (None, None) => None,
            (None, Some(m)) => Some(m.leak_to_string().trim().to_owned().into()),
            (Some(p), None) => Some(p.leak_to_string().trim().to_owned().into()),
            (Some(p), Some(m)) => {
                let p = p.leak().trim();
                let m = m.leak().trim();
                if p == m {
                    // we aren't quite sure if this is possible and if it is what it means. for eg: in MEX if your parents have the same last name, do have duplicate last names or do you consolidate into one? and would incode ever erronesouly populate both of these when the person in fact only has a singular "last name"? Some mysteries of the universe remain so, but if you ctrl+F'd this error string then today is your lucky day friend
                    tracing::error!("Incode response seen with paternal_last_name = maternal_last_name");
                }
                Some(format!("{} {}", p, m).into())
            }
        };
        let first_name_from_first_name_field: Option<PiiString> = name.first_name.map(|f| f.leak_to_string().trim().to_owned().into());
        let middle_name_from_middle_name_field: Option<PiiString> = name.middle_name.map(|m| m.leak_to_string().trim().to_owned().into());

        // the alternative mrz format is full_name_mrz, so we parse this into first + middle + last
        if let Some(mrz_full_name) = name.machine_readable_full_name {
            let mrz_full_name: PiiString = mrz_full_name.leak_to_string().trim().to_owned().into();
            // if the mrz full name matches the Incode given first/middle/last breakdown, then we can just use Incode's name parsing here (which may be better if they use context of the doc or something more intelligent than splitting on strings?)
            let all = vec![first_name_from_first_name_field.clone(), middle_name_from_middle_name_field.clone(), last_name.clone()].iter().flatten().map(|s| s.leak()).join(" ");
            let (first_name, middle_name, last_name) = if all.to_lowercase() == mrz_full_name.leak_to_string().to_lowercase() {
                (first_name_from_first_name_field, middle_name_from_middle_name_field, last_name)
            } else {
                // we need to parse into first/middle/last components ourself
                Self::parse_into_first_middle_last(mrz_full_name)
            };

            return ParsedIncodeNames::new(
                first_name,
                middle_name,
                last_name,
            );
        }

        // we (probably) don't have a MRZ name, so we fall back to the (probably) OCR fields
        let (first_name, middle_name) = if let (Some(first_name), Some(middle_name)) = (first_name_from_first_name_field, middle_name_from_middle_name_field) {
            // if we have first + middle, then just use those
            (Some(first_name), Some(middle_name))
        } else if let Some(given_name) = name.given_name {
            // else we parse from given_name
            Self::parse_into_first_middle(given_name.into())
        } else {
            (None, None)
        };
        

        ParsedIncodeNames::new(
            first_name,
            middle_name,
            last_name
        )
    }

    // take first token as first name and remaining (if present) as middle name
    fn parse_into_first_middle(s: PiiString) -> (Option<PiiString>, Option<PiiString>) {
        let s = s.leak_to_string();
        let mut comps = s.trim().split(' ').collect::<Vec<_>>();
        let first_name = if comps.is_empty() {
            // not really possible but extra safe
            None
        } else {
            Some(comps.remove(0).into())
        };

        let middle_name = if comps.is_empty() {
            None
        } else {
            Some(comps.join(" ").into())
        };

        (first_name, middle_name)
    }

    fn parse_into_first_middle_last(s: PiiString) -> (Option<PiiString>, Option<PiiString>, Option<PiiString>) {
        let s = s.leak_to_string();
        let mut comps = s.trim().split(' ').collect::<Vec<_>>();
        let first_name = if comps.is_empty() {
            // not really possible but extra safe
            None
        } else {
            Some(comps.remove(0).into())
        };

        let last_name = if comps.is_empty() {
            None
        } else {
            Some(comps.remove(comps.len()-1).into())
        };

        let middle_name = if comps.is_empty() {
            None
        } else {
            Some(comps.join(" ").into())
        };

        (first_name, middle_name, last_name)
    }
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use db::test_helpers::assert_have_same_elements;
    use idv::{incode::doc::response::{FetchScoresResponse, OCRName}, test_fixtures::{DocTestOpts, OcrTestOpts, self}};
    use newtypes::{
        incode::IncodeStatus::*,
        FootprintReasonCode::{self, *},
    };
    use test_case::test_case;
    use super::*;


    #[test_case(
        OCRName {

            full_name: Some("JIM BOB COLLINS".into()),
            first_name: Some("JIM".into()),
            paternal_last_name: Some("COLLINS".into()),
            given_name: Some("JIM BOB".into()),
            middle_name: Some("BOB".into()),
            machine_readable_full_name: Some("JIM BOB COLLINS".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("JIM".into()),
            middle_name: Some("BOB".into()),
            last_name: Some("COLLINS".into()),
            full_name: Some("JIM BOB COLLINS".into())
        } ; "US style DL"
    )]
    #[test_case(
        OCRName {

            full_name: Some("SALLY TERRENCE LONG CARMACK".into()),
            first_name: Some("SALLY".into()),
            paternal_last_name: Some("CARMACK".into()),
            given_name: Some("SALLY TERRENCE LONG".into()),
            middle_name: Some("TERRENCE LONG".into()),
            machine_readable_full_name: Some("SALLY TERRENCE LONG CARMACK".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("SALLY".into()),
            middle_name: Some("TERRENCE LONG".into()),
            last_name: Some("CARMACK".into()),
            full_name: Some("SALLY TERRENCE LONG CARMACK".into())
        } ; "US style DL, multiple middle names"
    )]
    #[test_case(
        OCRName {
            full_name: Some("ALLEN YU CARMACK".into()),
            first_name: Some("ALLEN".into()),
            paternal_last_name: Some("YU".into()),
            maternal_last_name: Some("CARMACK".into()),
            given_name: Some("ALLEN".into()),
            machine_readable_full_name: Some("ALLEN YU CARMACK".into()),
            given_name_mrz: Some("ALLEN".into()),
            last_name_mrz: Some("YU CARMACK".into()),
            ..Default::default()               
        } => ParsedIncodeNames {
            first_name: Some("ALLEN".into()),
            middle_name: None,
            last_name: Some("YU CARMACK".into()),
            full_name: Some("ALLEN YU CARMACK".into())
        } ; "MEX style, 3 parts"
    )]
    #[test_case(
        OCRName {
            full_name: Some("DAVID ALLEN POTTER HENRY BILL".into()),
            first_name: Some("DAVID ALLEN".into()),
            paternal_last_name: Some("POTTER HENRY".into()),
            maternal_last_name: Some("BILL".into()),
            given_name: Some("DAVID ALLEN".into()),
            machine_readable_full_name: Some("DAVID ALLEN POTTER HENRY BILL".into()),
            given_name_mrz: Some("DAVID ALLEN".into()),
            last_name_mrz: Some("POTTER HENRY BILL".into()),
            ..Default::default()               
        } => ParsedIncodeNames {
            first_name: Some("DAVID".into()),
            middle_name: Some("ALLEN".into()),
            last_name: Some("POTTER HENRY BILL".into()),
            full_name: Some("DAVID ALLEN POTTER HENRY BILL".into())
        } ; "MEX style, 5 parts"
    )]
    #[test_case(
        // text on doc = SALLY BART JONES
        // barcode = DAN SMITH
        OCRName {
            full_name: Some("DAN SMITH".into()),
            first_name: Some("DAN".into()),
            middle_name: Some("BART".into()), // OCR'd from front, but not part of the barcode name!!!
            paternal_last_name: Some("SMITH".into()),
            given_name: Some("DAN".into()),
            machine_readable_full_name: Some("DAN SMITH".into()),
            ..Default::default()               
        } => ParsedIncodeNames {
            first_name: Some("DAN".into()),
            middle_name: None,
            last_name: Some("SMITH".into()),
            full_name: Some("DAN SMITH".into())
        } ; "spoofed doc"
    )]
    #[test_case(
        //text on doc = ANDRE JONES
        //spoofed barcode = JOHN SMITH
        OCRName {
            full_name: Some("JOHN SMITH".into()),
            first_name: Some("ANDRE".into()),
            paternal_last_name: Some("JONES".into()),
            given_name: Some("JOHN".into()),
            machine_readable_full_name: Some("JOHN SMITH".into()),
            ..Default::default()               
        } => ParsedIncodeNames {
            first_name: Some("JOHN".into()),
            middle_name: None,
            last_name: Some("SMITH".into()),
            full_name: Some("JOHN SMITH".into())
        } ; "spoofed doc, no middle name"
    )]
    #[test_case(
        OCRName {
            full_name: Some("DANIEL SMITH".into()),
            first_name: Some("DANIEL".into()),
            paternal_last_name: Some("SMITH".into()),
            given_name: Some("DANIEL".into()),
            machine_readable_full_name: Some("DANIEL SMITH".into()),
            given_name_mrz: Some("DANIEL".into()),
            last_name_mrz: Some("SMITH".into()),
            ..Default::default()
        } => ParsedIncodeNames {
            first_name: Some("DANIEL".into()),
            middle_name: None,
            last_name: Some("SMITH".into()),
            full_name: Some("DANIEL SMITH".into())
        } ; "foreign passport"
    )]
    #[test_case(
        OCRName {
            full_name: Some("JOHN RAY NEWTON".into()),
            first_name: Some("JOHN".into()),
            middle_name: Some("RAY".into()),
            given_name: Some("JOHN RAY".into()),
            paternal_last_name: Some("NEWTON".into()),
            ..Default::default()               
        } => ParsedIncodeNames {
            first_name: Some("JOHN".into()),
            middle_name: Some("RAY".into()),
            last_name: Some("NEWTON".into()),
            full_name: Some("JOHN RAY NEWTON".into())
        } ; "MRZ failure"
    )]
    #[test_case(
        OCRName {
            full_name: Some("CHRIS JR LEMON".into()),
            first_name: Some("CHRIS".into()),
            given_name: Some("CHRIS".into()),
            name_suffix: Some("JR".into()),
            paternal_last_name: Some("LEMON".into()),
            ..Default::default()               
        } => ParsedIncodeNames {
            first_name: Some("CHRIS".into()),
            middle_name: None,
            last_name: Some("LEMON".into()),
            full_name: Some("CHRIS LEMON".into())
        } ; "MRZ failure + generational suffix"
    )]
    fn test_parse_names_from_incode(name: OCRName) ->  ParsedIncodeNames{
        ParsedIncodeNames::from_fetch_ocr_res(&FetchOCRResponse {
            name: Some(name),
            ..Default::default()
        })
    }



    #[test_case(
        ("Rob", "Roberto", "1990-01-01"), 
        (Some("Rob".into()),Some("Roberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]
    ; "name and dob match")]
    #[test_case(
        ("ROB", "    roBERTo", "1990-01-01"), 
        (Some("rob".into()), Some("roberto".into()), Some("       1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]
    ; "whitespace/mixed case matches name")]
    #[test_case(
        ("Robby", "Roberto", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()), Some("1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameMatches, DocumentOcrDobDoesNotMatch]; "first name doesn't match and DOBs don't match"
    )]
    #[test_case(
        ("Bob", "Roberti", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()),Some("  1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameMatches, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch]; "last name doesn't match and DOBs don't match"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (Some("Crob".into()),Some("Croberto".into()),Some("1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch]; "all doesn't match"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()),None),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches]; "dob missing"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (None, Some("Roberto".into()), Some("1990-01-01".into())),
        vec![DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "first name missing"
    )]
    #[test_case(
        ("Rob", "Robèrto", "1990-01-01"), 
        (Some("Rob".into()),Some("Roberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "unicode"
    )]
    #[test_case(
        ("RöbÀÑ", "RÓbèrtõ", "1990-01-01"), 
        (Some("Roban".into()),Some("ROBERTO".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "more unicode"
    )]
    #[test_case(
        ("B'ob", "Bo'berto", "1990-01-01"), 
        (Some("B'ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "apostraphies in both names"
    )]
    #[test_case(
        ("B'ob", "Bo'berto", "1990-01-01"), 
        (Some("Bob".into()),Some("Boberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "apostraphies in OCR names"
    )]
    #[test_case(
        ("Bob", "Boberto", "1990-01-01"), 
        (Some("B'ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "apostraphies in keyed in names"
    )]
    #[test_case(
        ("Bob", "Bo'  berto", "1990-01-01"), 
        (Some("B' ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "apostraphies and spaces"
    )]
    #[test_case(
        ("Bob", "Boberto-Jones", "1990-01-01"), 
        (Some("Bob".into()),Some("Boberto Jones".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]; "hyphen"
    )]
    fn test_reason_codes_from_ocr_response(raw_ocr: (&str, &str, &str), raw_vault_data: (Option<PiiString>, Option<PiiString>, Option<PiiString>), expected: Vec<FootprintReasonCode>) {
        let (first_ocr, last_ocr, dob_ocr) = raw_ocr;
        let ocr_opts = OcrTestOpts {
            first_name: first_ocr.into(),
            paternal_last_name: last_ocr.into(),
            dob: dob_ocr.into(),
        };
        
        let (first, last, dob) = raw_vault_data;
        
        let vault_data = IncodeOcrComparisonDataFields {
            first_name: first,
            middle_name: None,
            last_name: last,
            dob
        };
        let raw = test_fixtures::incode_fetch_ocr_response(Some(ocr_opts));
        let parsed: FetchOCRResponse = serde_json::from_value(raw).unwrap();

        assert_have_same_elements(reason_codes_from_ocr_response(&parsed, vault_data), expected)
    }

    #[test_case(
        DocTestOpts::default(),
        vec![
            DocumentPhotoIsNotScreenCapture,
            DocumentVisiblePhotoFeaturesVerified,
            DocumentPhotoIsNotPaperCapture,
            DocumentNoImageTampering,
            DocumentNotExpired,
            DocumentVerified,
            DocumentBarcodeCouldBeRead,
            DocumentBarcodeDetected,
            DocumentNotFakeImage,
            DocumentOcrSuccessful,
            DocumentSelfieMatches,
            DocumentSelfieNotUsedWithDifferentInformation,
            DocumentNoImageAlterationFront,
            DocumentNoImageAlterationBack,
            DocumentFullNameCrosscheckMatches,
            DocumentDobCrosscheckMatches, 
            DocumentNumberCheckDigitMatches,
            DocumentDobCheckDigitMatches,
            DocumentSexCrosscheckMatches, 
            DocumentExpirationCheckDigitMatches, 
            DocumentNumberCrosscheckMatches,
            DocumentBarcodeContentMatches,
        ], true; "everything passes")]
        #[test_case(
            DocTestOpts {
                screen: Fail,
                paper: Fail,
                expiration: Fail,
                overall: Fail,
                tamper: Fail,
                visible_photo_features: Fail,
                barcode: Fail,
                barcode_content: Fail,
                fake: Fail,
                ocr_confidence: Fail,
                selfie_match: Fail,
                lenses_and_mask_check: Fail,
                cross_checks: Fail,
            }, 
            vec![
                DocumentPhotoIsScreenCapture,
                DocumentVisiblePhotoFeaturesNotVerified,
                DocumentPhotoIsPaperCapture,
                DocumentPossibleImageTampering,
                DocumentExpired,
                DocumentNotVerified,
                DocumentBarcodeCouldNotBeRead,
                DocumentBarcodeCouldNotBeDetected,
                DocumentPossibleFakeImage,
                DocumentOcrNotSuccessful,
                DocumentSelfieDoesNotMatch,
                DocumentSelfieNotUsedWithDifferentInformation,
                DocumentNoImageAlterationFront,
                DocumentNoImageAlterationBack,
                DocumentSelfieGlasses,
                DocumentSelfieMask,
                DocumentFullNameCrosscheckDoesNotMatch,
                DocumentDobCrosscheckDoesNotMatch, 
                DocumentNumberCheckDigitDoesNotMatch,
                DocumentDobCheckDigitDoesNotMatch,
                DocumentSexCrosscheckDoesNotMatch, 
                DocumentExpirationCheckDigitDoesNotMatch, 
                DocumentNumberCrosscheckDoesNotMatch, // barcode stuff is weird here
            ], true; "everything fails")]
        #[test_case(
            DocTestOpts {
                screen: Ok,
                paper: Ok,
                expiration: Ok,
                overall: Fail,
                tamper: Ok,
                visible_photo_features: Ok,
                barcode: Fail,
                barcode_content: Fail,
                fake: Ok,
                ocr_confidence: Ok,
                selfie_match: Fail,
                lenses_and_mask_check: Ok,
                cross_checks: Ok,
            }, 
            vec![
                DocumentPhotoIsNotScreenCapture,
                DocumentPhotoIsNotPaperCapture,
                DocumentNotExpired,
                DocumentNotVerified,
                DocumentNoImageTampering,
                DocumentVisiblePhotoFeaturesVerified,
                DocumentBarcodeCouldNotBeRead,
                DocumentBarcodeCouldNotBeDetected,
                DocumentNotFakeImage,
                DocumentOcrSuccessful,
                DocumentSelfieDoesNotMatch,
                DocumentSelfieNotUsedWithDifferentInformation,
                DocumentNoImageAlterationFront,
                DocumentNoImageAlterationBack,
                DocumentFullNameCrosscheckMatches,
                DocumentDobCrosscheckMatches, 
                DocumentNumberCheckDigitMatches,
                DocumentDobCheckDigitMatches,
                DocumentSexCrosscheckMatches, 
                DocumentExpirationCheckDigitMatches, 
                DocumentNumberCrosscheckMatches,
            ], true; "mix of things")]
            #[test_case(
                DocTestOpts::default(),
                vec![
                    DocumentPhotoIsNotScreenCapture,
                    DocumentVisiblePhotoFeaturesVerified,
                    DocumentPhotoIsNotPaperCapture,
                    DocumentNoImageTampering,
                    DocumentNotExpired,
                    DocumentVerified,
                    DocumentBarcodeCouldBeRead,
                    DocumentBarcodeDetected,
                    DocumentNotFakeImage,
                    DocumentOcrSuccessful,
                    DocumentSelfieNotUsedWithDifferentInformation, // not quite correct, but this just won't appear in ID tests if we don't send selfie so we won't get any id test
                    DocumentNoImageAlterationFront,
                    DocumentNoImageAlterationBack,
                    DocumentFullNameCrosscheckMatches,
                    DocumentDobCrosscheckMatches, 
                    DocumentNumberCheckDigitMatches,
                    DocumentDobCheckDigitMatches,
                    DocumentSexCrosscheckMatches, 
                    DocumentExpirationCheckDigitMatches, 
                    DocumentNumberCrosscheckMatches,
                    DocumentBarcodeContentMatches
                    // no selfie code
                ], false; "everything passes, but selfie isn't collected")]  
    fn test_reason_codes_from_score_response(doc_opts: DocTestOpts, expected: Vec<FootprintReasonCode>, expect_selfie: bool) {
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(doc_opts);
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();

        assert_have_same_elements(super::reason_codes_from_score_response(&parsed, expect_selfie), expected)
    }

    #[test]
    fn test_summary_barcode_reason_code() {
        // everything passes
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts::default());
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let id_test_results = only_id_tests_for_ones_that_have_frcs_from_parsed(parsed.clone());
        id_test_results.iter().for_each(|(test, status)| if test.is_crosscheck() {
            assert_eq!(status, &IncodeStatus::Ok)
        });
        let frcs = super::reason_codes_from_score_response(&parsed, false);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));

        // partial fail
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {barcode_content: Fail, barcode: Ok, cross_checks: Ok, ..Default::default()});
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs = super::reason_codes_from_score_response(&parsed, false);
        assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));
        assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));

        // read ok, but cross checks fail
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {barcode_content: Ok, barcode: Ok, cross_checks: Fail, ..Default::default()});
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs = super::reason_codes_from_score_response(&parsed, false);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));

         // wasn't read
         let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {barcode_content: Fail, barcode: Fail, cross_checks: Fail, ..Default::default()});
         let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
         let frcs = super::reason_codes_from_score_response(&parsed, false);
         assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));
         assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));
    }

    fn only_id_tests_for_ones_that_have_frcs_from_parsed(parsed: FetchScoresResponse) -> HashMap<IncodeTest, IncodeStatus> {
        parsed.get_id_tests().into_iter().filter(|(t, _)| {
            let frc_helper: Option<IncodeRCH> = t.into(); // filter to only
            frc_helper.is_some()
        }).collect()
    }
    
}