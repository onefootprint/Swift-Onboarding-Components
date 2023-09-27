use idv::incode::doc::response::{FetchScoresResponse, FetchOCRResponse, IncodeOcrFixtureResponseFields};
use newtypes::{
    incode::{IncodeRCH, IncodeStatus, IncodeTest},
    FootprintReasonCode, VendorAPI, PiiString, VerificationResultId, DataIdentifier, IdentityDataKind,
};

use crate::{decision::onboarding::FeatureSet, enclave_client::EnclaveClient, utils::vault_wrapper::{VaultWrapper, Person, DecryptUncheckedResult}, errors::ApiResult};


#[derive(Default, Clone)]
pub struct IncodeOcrComparisonDataFields {
    pub first_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub dob: Option<PiiString>,
}

impl From<IncodeOcrComparisonDataFields> for IncodeOcrFixtureResponseFields {
    fn from(value: IncodeOcrComparisonDataFields) -> Self {
        let IncodeOcrComparisonDataFields { first_name, last_name, dob } = value;
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
        vec![VendorAPI::IncodeFetchScores, VendorAPI::IncodeFetchOCR]
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
    let score_reason_codes = reason_codes_from_score_response(scores, expect_selfie);
    let ocr_reason_codes = reason_codes_from_ocr_response(ocr, vault_data);

    Ok(score_reason_codes.into_iter().chain(ocr_reason_codes.into_iter()).collect())
}

pub fn reason_codes_from_score_response(scores: FetchScoresResponse, expect_selfie: bool) -> Vec<FootprintReasonCode> {
    // Overall score
    // 
    // We check for the existence of this at the vendor call layer, but our decisioning relies most heavily on the score (for now)
    // and we should not proceed if we don't have it
    let document_score_code = if scores
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
    let ocr_code = if scores
        .id_ocr_confidence().1.unwrap_or(IncodeStatus::Fail) == IncodeStatus::Fail
    {
        vec![FootprintReasonCode::DocumentOcrNotSuccessful]
    } else {
        vec![FootprintReasonCode::DocumentOcrSuccessful]
    };
    
    // only populate reason code if we collected a selfie
    let selfie_code = if expect_selfie {
        if scores.selfie_match().1.unwrap_or(IncodeStatus::Fail)  == IncodeStatus::Fail
        {
            vec![FootprintReasonCode::DocumentSelfieDoesNotMatch]
        } else {
            vec![FootprintReasonCode::DocumentSelfieMatches]
        }
    } else {
        vec![]
    };
    
    // ID Tests => FRC
    let (id_test_frcs, barcode_crosscheck_results): (Vec<FootprintReasonCode>, Vec<(bool, bool)>) = scores
        .get_id_tests()
        .iter()
        .filter_map(get_frc_from_test)
        .unzip();
    let barcode_check_failed = barcode_crosscheck_results.iter().any(|(fail,_)| *fail);
    let barcode_check_passed = barcode_crosscheck_results.iter().any(|(_, pass)| *pass);
    let barcode_checks_ran = barcode_check_passed || barcode_check_failed;

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
    let (glasses_check, mask_check) = scores.get_face_test_results();
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

pub fn reason_codes_from_ocr_response(ocr: FetchOCRResponse, vault_data: IncodeOcrComparisonDataFields) -> Vec<FootprintReasonCode> {
    let first_name_matches = first_name_matches(&ocr, &vault_data);
    let last_name_matches = last_name_matches(&ocr, &vault_data);
    let dob_matches = dob_matches(&ocr, &vault_data);
    let name_matches = first_name_matches.and_then(|x| last_name_matches.map(|y| x && y));
    
    reason_codes_from_matching(first_name_matches,last_name_matches,name_matches, dob_matches)
}

fn first_name_matches(ocr: &FetchOCRResponse, vault_data: &IncodeOcrComparisonDataFields) -> Option<bool> {
    let first_name_ocr: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.first_name.clone().map(|f| f.into()));
    let given_name_ocr: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.given_name.clone().map(|f| f.into()));
    let given_name_mrz: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.given_name_mrz.clone().map(|f| f.into()));

    // matches, eventually should do levinstein or something else to determine "partial" matches
    let first_name_matches = merge(first_name_ocr.as_ref(), vault_data.first_name.as_ref()).map(|(a, b)| pii_strings_match(a, b));
    let given_name_matches = merge(given_name_ocr.as_ref(), vault_data.first_name.as_ref()).map(|(a, b)| pii_strings_match(a, b));
    let given_name_mrz_matches = merge(given_name_mrz.as_ref(), vault_data.first_name.as_ref()).map(|(a, b)| pii_strings_match(a, b));

    [first_name_matches, given_name_matches, given_name_mrz_matches].into_iter().flatten().max()
}

fn last_name_matches(ocr: &FetchOCRResponse, vault_data: &IncodeOcrComparisonDataFields) -> Option<bool> {
    let paternal_last_name_ocr: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.paternal_last_name.clone().map(|s| s.into()));
    let maternal_last_name_ocr: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.maternal_last_name.clone().map(|s| s.into()));

    let pat_ln_matches = merge(paternal_last_name_ocr.as_ref(), vault_data.last_name.as_ref()).map(|(a, b)| pii_strings_match(a, b));
    let mat_ln_matches = merge(maternal_last_name_ocr.as_ref(), vault_data.last_name.as_ref()).map(|(a, b)| pii_strings_match(a, b));
    [pat_ln_matches, mat_ln_matches].into_iter().flatten().max()
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
    frc_helper.map(|f| {
        if s == &IncodeStatus::Fail {
            (f.fail_code, (t.is_crosscheck(), false))
        } else {
            (f.ok_code,  (false, t.is_crosscheck()))
        }
    })
}

#[cfg(test)]
mod tests {
    use std::collections::HashMap;

    use db::test_helpers::assert_have_same_elements;
    use idv::{incode::doc::response::FetchScoresResponse, test_fixtures::{DocTestOpts, OcrTestOpts, self}};
    use newtypes::{
        incode::IncodeStatus::*,
        FootprintReasonCode::{self, *},
    };
    use test_case::test_case;
    use super::*;
    
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
            last_name: last,
            dob
        };
        let raw = test_fixtures::incode_fetch_ocr_response(Some(ocr_opts));
        let parsed: FetchOCRResponse = serde_json::from_value(raw).unwrap();

        assert_have_same_elements(reason_codes_from_ocr_response(parsed, vault_data), expected)
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
                DocumentNumberCrosscheckDoesNotMatch,
                DocumentBarcodeContentDoesNotMatch,
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
                DocumentBarcodeContentDoesNotMatch
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

        assert_have_same_elements(super::reason_codes_from_score_response(parsed, expect_selfie), expected)
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
        let frcs = super::reason_codes_from_score_response(parsed, false);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));

        // partial fail
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {barcode: Fail, cross_checks: Ok, ..Default::default()});
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs = super::reason_codes_from_score_response(parsed, false);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));

        // full fail
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {barcode: Fail, cross_checks: Fail, ..Default::default()});
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs = super::reason_codes_from_score_response(parsed, false);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));
    }

    fn only_id_tests_for_ones_that_have_frcs_from_parsed(parsed: FetchScoresResponse) -> HashMap<IncodeTest, IncodeStatus> {
        parsed.get_id_tests().into_iter().filter(|(t, _)| {
            let frc_helper: Option<IncodeRCH> = t.into(); // filter to only
            frc_helper.is_some()
        }).collect()
    }
    
}