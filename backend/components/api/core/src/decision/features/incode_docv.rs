use chrono::{NaiveDateTime, Utc};
use idv::incode::doc::response::{FetchScoresResponse, FetchOCRResponse, IncodeOcrFixtureResponseFields};
use newtypes::{
    incode::{IncodeRCH, IncodeStatus, IncodeTest},
    FootprintReasonCode, VendorAPI, PiiString, VerificationResultId, DataIdentifier, IdentityDataKind,
};
use crate::{
    decision::{
        onboarding::FeatureSet,
        features::incode_utils::*
    }, 
    enclave_client::EnclaveClient, 
    utils::vault_wrapper::{VaultWrapper, Person, DecryptUncheckedResult}, 
    errors::ApiResult
};

#[derive(Default, Clone, PartialEq, Eq)]
pub struct IncodeOcrAddress {
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
    pub street: Option<PiiString>,
}

#[derive(Default, Clone)]
pub struct IncodeOcrComparisonDataFields {
    pub first_name: Option<PiiString>,
    pub middle_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub dob: Option<PiiString>,
    pub address: IncodeOcrAddress
}

impl From<IncodeOcrComparisonDataFields> for IncodeOcrFixtureResponseFields {
    fn from(value: IncodeOcrComparisonDataFields) -> Self {
        let IncodeOcrComparisonDataFields { first_name, middle_name:_ , last_name, dob, address: _ } = value;
        Self { first_name, last_name, dob}
    }
}

impl IncodeOcrComparisonDataFields {
    pub async fn compose(enclave_client: &EnclaveClient, vw: &VaultWrapper<Person>) -> ApiResult<Self> {
        let fields = &[
            DataIdentifier::Id(IdentityDataKind::FirstName),
            DataIdentifier::Id(IdentityDataKind::LastName),
            DataIdentifier::Id(IdentityDataKind::Dob),
            DataIdentifier::Id(IdentityDataKind::City),
            DataIdentifier::Id(IdentityDataKind::State),
            DataIdentifier::Id(IdentityDataKind::Zip),
            DataIdentifier::Id(IdentityDataKind::AddressLine1),
            
        ];
        let vd = vw.decrypt_unchecked(enclave_client, fields).await?;
        let result = Self::from_decrypted_values(&vd);
        Ok(result)
    }

    pub fn from_decrypted_values(vd: &DecryptUncheckedResult) -> Self {
        let address = IncodeOcrAddress {
            city: vd.get_di(IdentityDataKind::City).ok(),
            state: vd.get_di(IdentityDataKind::State).ok(),
            zip: vd.get_di(IdentityDataKind::Zip).ok(),
            street: vd.get_di(IdentityDataKind::AddressLine1).ok(), // TODO: handle line 2
        };
        IncodeOcrComparisonDataFields {
            first_name: vd.get_di(IdentityDataKind::FirstName).ok(),
            middle_name: vd.get_di(IdentityDataKind::MiddleName).ok(),
            last_name: vd.get_di(IdentityDataKind::LastName).ok(),
            dob: vd.get_di(IdentityDataKind::Dob).ok(),
            address
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

    Ok(score_reason_codes.into_iter().chain(ocr_reason_codes).collect())
}

pub fn reason_codes_from_score_response(res: &FetchScoresResponse, expect_selfie: bool) -> Vec<FootprintReasonCode> {
    // Overall score
    // 
    // We check for the existence of this at the vendor call layer, but our decisioning relies most heavily on the score (for now)
    // and we should not proceed if we don't have it
    let document_score_code = match res
        .document_score().1 {
            Some(s) => if s == IncodeStatus::Fail {
                vec![FootprintReasonCode::DocumentNotVerified]
            } else {
                vec![FootprintReasonCode::DocumentVerified]
            },
            None => {
                tracing::error!("missing incode score");
                vec![FootprintReasonCode::DocumentNotVerified]
            }

        };
    

    // OCR
    // TODO: if this happens, would we not be able to retrieve OCR from incode?
    //  should we just not vault it if OCR confidence isn't high?
    //  would overall score always be failure then?
    let ocr_code = match res
        .id_ocr_confidence().1 {
           Some(s) => if s == IncodeStatus::Fail {
            vec![FootprintReasonCode::DocumentOcrNotSuccessful]
        } else {
            vec![FootprintReasonCode::DocumentOcrSuccessful]
        },
        None => {
            tracing::warn!("missing incode ocr score");
            vec![FootprintReasonCode::DocumentOcrNotSuccessful]
        }
    };
   
    
    // only populate reason code if we collected a selfie
    let selfie_code = if expect_selfie {
        match res.selfie_match().1 {
            Some(s) => if s == IncodeStatus::Fail {
                vec![FootprintReasonCode::DocumentSelfieDoesNotMatch]
            } else {
                vec![FootprintReasonCode::DocumentSelfieMatches]
            },
            None => {
                tracing::error!("missing incode selfie score");
                vec![FootprintReasonCode::DocumentSelfieDoesNotMatch]
            }
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
        .chain(ocr_code)
        .chain(selfie_code)
        .chain(id_test_frcs)
        .chain(face_codes)
        .chain(barcode_frc)
        .collect()
}

    
pub fn reason_codes_from_ocr_response(res: &FetchOCRResponse, vault_data: IncodeOcrComparisonDataFields) -> Vec<FootprintReasonCode> {
    let parsed_names = ParsedIncodeNames::from_fetch_ocr_res(res);
    let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(res);
    
    let first_name_matches = first_name_matches(&parsed_names, &vault_data);
    let last_name_matches = last_name_matches(&parsed_names, &vault_data);
    let dob_matches = dob_matches(res, &vault_data);
    let name_matches = first_name_matches.and_then(|x| last_name_matches.map(|y| x && y));
    let address_matches = address_matches(&parsed_address, &vault_data.address).matched();

    
    let mut reason_codes = reason_codes_from_matching(first_name_matches,last_name_matches,name_matches, dob_matches, address_matches);
    if let Some(expired_frc) = doc_expired_reason_code(res) {
        reason_codes.push(expired_frc);
    }
    reason_codes
}

fn doc_expired_reason_code(res: &FetchOCRResponse) -> Option<FootprintReasonCode> {
    res.expire_at.as_ref().and_then(|e| e.leak().parse::<i64>().ok()).and_then(|d| NaiveDateTime::from_timestamp_opt(d/1000,0)).map(|d| if Utc::now().naive_utc() > d {
        FootprintReasonCode::DocumentExpired
    } else {
        FootprintReasonCode::DocumentNotExpired
    })
}

fn reason_codes_from_matching(first_name_matches: Option<bool>, last_name_matches: Option<bool>, name_matches: Option<bool>, dob_matches: Option<bool>, address_matches: Option<bool>) -> Vec<FootprintReasonCode> {
    [
        (first_name_matches, FootprintReasonCode::DocumentOcrFirstNameMatches, FootprintReasonCode::DocumentOcrFirstNameDoesNotMatch),
        (last_name_matches, FootprintReasonCode::DocumentOcrLastNameMatches, FootprintReasonCode::DocumentOcrLastNameDoesNotMatch),
        (name_matches, FootprintReasonCode::DocumentOcrNameMatches, FootprintReasonCode::DocumentOcrNameDoesNotMatch),
        (dob_matches, FootprintReasonCode::DocumentOcrDobMatches, FootprintReasonCode::DocumentOcrDobDoesNotMatch),
        (address_matches, FootprintReasonCode::DocumentOcrAddressMatches, FootprintReasonCode::DocumentOcrAddressDoesNotMatch)
    ]
    .into_iter()
    .filter_map(|(is_match, match_signal, mismatch_signal)| is_match.map(|is_match| if is_match {
        match_signal
    } else {
        mismatch_signal
    }))
    .collect()
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


#[cfg(test)]
mod tests {
    use std::collections::HashMap;
    use newtypes::ScrubbedPiiString;
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
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]
    ; "name and dob match")]
    #[test_case(
        ("ROB", "    roBERTo", "1990-01-01"), 
        (Some("rob".into()), Some("roberto".into()), Some("       1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]
    ; "whitespace/mixed case matches name")]
    #[test_case(
        ("Robby", "Roberto", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()), Some("1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameMatches, DocumentOcrDobDoesNotMatch, DocumentNotExpired]; "first name doesn't match and DOBs don't match"
    )]
    #[test_case(
        ("Bob", "Roberti", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()),Some("  1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameMatches, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch, DocumentNotExpired]; "last name doesn't match and DOBs don't match"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (Some("Crob".into()),Some("Croberto".into()),Some("1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch, DocumentNotExpired]; "all doesn't match"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()),None),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentNotExpired]; "dob missing"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (None, Some("Roberto".into()), Some("1990-01-01".into())),
        vec![DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "first name missing"
    )]
    #[test_case(
        ("Rob", "Robèrto", "1990-01-01"), 
        (Some("Rob".into()),Some("Roberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "unicode"
    )]
    #[test_case(
        ("RöbÀÑ", "RÓbèrtõ", "1990-01-01"), 
        (Some("Roban".into()),Some("ROBERTO".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "more unicode"
    )]
    #[test_case(
        ("B'ob", "Bo'berto", "1990-01-01"), 
        (Some("B'ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "apostraphies in both names"
    )]
    #[test_case(
        ("B'ob", "Bo'berto", "1990-01-01"), 
        (Some("Bob".into()),Some("Boberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "apostraphies in OCR names"
    )]
    #[test_case(
        ("Bob", "Boberto", "1990-01-01"), 
        (Some("B'ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "apostraphies in keyed in names"
    )]
    #[test_case(
        ("Bob", "Bo'  berto", "1990-01-01"), 
        (Some("B' ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "apostraphies and spaces"
    )]
    #[test_case(
        ("Bob", "Boberto-Jones", "1990-01-01"), 
        (Some("Bob".into()),Some("Boberto Jones".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentNotExpired]; "hyphen"
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
            dob,
            address: IncodeOcrAddress::default()
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
            DocumentVerified,
            DocumentBarcodeCouldBeRead,
            DocumentBarcodeDetected,
            DocumentNotFakeImage,
            DocumentOcrSuccessful,
            DocumentSelfieMatches,
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
                DocumentNotVerified,
                DocumentBarcodeCouldNotBeRead,
                DocumentBarcodeCouldNotBeDetected,
                DocumentPossibleFakeImage,
                DocumentOcrNotSuccessful,
                DocumentSelfieDoesNotMatch,
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
                DocumentNotVerified,
                DocumentNoImageTampering,
                DocumentVisiblePhotoFeaturesVerified,
                DocumentBarcodeCouldNotBeRead,
                DocumentBarcodeCouldNotBeDetected,
                DocumentNotFakeImage,
                DocumentOcrSuccessful,
                DocumentSelfieDoesNotMatch,
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
                    DocumentVerified,
                    DocumentBarcodeCouldBeRead,
                    DocumentBarcodeDetected,
                    DocumentNotFakeImage,
                    DocumentOcrSuccessful,
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
    

    #[test_case(FetchOCRResponse { ..Default::default()} => None)]
    #[test_case(FetchOCRResponse { expire_at: Some(ScrubbedPiiString::from("1663459200000")), ..Default::default()} => Some(FootprintReasonCode::DocumentExpired))]
    #[test_case(FetchOCRResponse { expire_at: Some(ScrubbedPiiString::from("2663459200000")), ..Default::default()} => Some(FootprintReasonCode::DocumentNotExpired))]
    fn test_doc_expired_reason_code(res: FetchOCRResponse) -> Option<FootprintReasonCode> {
        doc_expired_reason_code(&res) 
    }
}