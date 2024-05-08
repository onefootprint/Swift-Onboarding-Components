use crate::{
    decision::features::incode_utils::*,
    enclave_client::EnclaveClient,
    errors::ApiResult,
    utils::vault_wrapper::{DecryptUncheckedResult, VaultWrapper},
};
use chrono::{NaiveDateTime, Utc};
use idv::incode::doc::response::{FetchOCRResponse, FetchScoresResponse, IncodeOcrFixtureResponseFields};
use newtypes::{
    incode::{IncodeRCH, IncodeStatus, IncodeTest},
    DataIdentifier, FootprintReasonCode, IdDocKind, IdentityDataKind, PiiString, VerificationResultId,
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
    pub address: IncodeOcrAddress,
}

impl From<IncodeOcrComparisonDataFields> for IncodeOcrFixtureResponseFields {
    fn from(value: IncodeOcrComparisonDataFields) -> Self {
        let IncodeOcrComparisonDataFields {
            first_name,
            middle_name: _,
            last_name,
            dob,
            address: _,
        } = value;
        
        Self {
            first_name,
            last_name,
            dob,
            ..Default::default()
        }
    }
}

impl IncodeOcrComparisonDataFields {
    pub async fn compose(enclave_client: &EnclaveClient, vw: &VaultWrapper) -> ApiResult<Self> {
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
            address,
        }
    }
}

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IncodeDocumentFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

// Once we move RiskSignals to being computed at the time are handling the VRes, we can use this method.
pub fn footprint_reason_codes(
    ocr: FetchOCRResponse,
    scores: FetchScoresResponse,
    vault_data: IncodeOcrComparisonDataFields,
    // not all documents collect will have selfie
    expect_selfie: bool,
    dk: IdDocKind,
) -> Result<Vec<FootprintReasonCode>, idv::Error> {
    let score_reason_codes = reason_codes_from_score_response(&scores, &ocr, expect_selfie, dk);
    let ocr_reason_codes = pii_matching_reason_codes_from_ocr_response(&ocr, vault_data);

    Ok(score_reason_codes.into_iter().chain(ocr_reason_codes).collect())
}

pub fn reason_codes_from_score_response(
    scores_res: &FetchScoresResponse,
    ocr_res: &FetchOCRResponse,
    expect_selfie: bool,
    dk: IdDocKind,
) -> Vec<FootprintReasonCode> {
    // Overall score
    //
    // We check for the existence of this at the vendor call layer, but our decisioning relies most heavily on the score (for now)
    // and we should not proceed if we don't have it
    let document_score_code = match scores_res.document_score().1 {
        Some(s) => {
            if s == IncodeStatus::Fail {
                vec![FootprintReasonCode::DocumentNotVerified]
            } else {
                vec![FootprintReasonCode::DocumentVerified]
            }
        }
        None => {
            tracing::error!("missing incode score");
            vec![FootprintReasonCode::DocumentNotVerified]
        }
    };

    let liveness_score_code = if expect_selfie {
        match scores_res.liveness_score().1 {
            Some(s) => {
                if s == IncodeStatus::Fail {
                    vec![FootprintReasonCode::DocumentSelfieNotLiveImage]
                } else {
                    vec![]
                }
            }
            None => {
                tracing::error!("missing incode liveness score");
                vec![]
            }
        }
    } else {
        vec![]
    };

    // only populate reason code if we collected a selfie
    let selfie_code = if expect_selfie {
        match scores_res.selfie_match().1 {
            Some(s) => {
                if s == IncodeStatus::Fail {
                    vec![FootprintReasonCode::DocumentSelfieDoesNotMatch]
                } else {
                    vec![FootprintReasonCode::DocumentSelfieMatches]
                }
            }
            None => {
                tracing::warn!("missing incode selfie score");
                vec![FootprintReasonCode::DocumentSelfieDoesNotMatch]
            }
        }
    } else {
        vec![]
    };

    let doc_expired_code = if let Some(expired_frc) = doc_expired_reason_code(ocr_res) {
        vec![expired_frc]
    } else {
        vec![]
    };

    let ocr_successful_code = if ocr_was_successful(scores_res, ocr_res, dk) {
        vec![FootprintReasonCode::DocumentOcrSuccessful]
    } else {
        vec![FootprintReasonCode::DocumentOcrNotSuccessful]
    };

    // ID Tests => FRC
    let (id_test_frcs, barcode_crosscheck_results): (Vec<FootprintReasonCode>, Vec<(bool, bool)>) =
        scores_res
            .get_id_tests()
            .iter()
            .filter_map(get_frc_from_test)
            .unzip();
    let barcode_check_failed = barcode_crosscheck_results.iter().any(|(fail, _)| *fail);
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
    let (glasses_check, mask_check) = scores_res.get_face_test_results();
    let face_codes: Vec<FootprintReasonCode> = [
        glasses_check
            .and_then(|has_glasses| has_glasses.then_some(FootprintReasonCode::DocumentSelfieGlasses)),
        mask_check.and_then(|has_glasses| has_glasses.then_some(FootprintReasonCode::DocumentSelfieMask)),
    ]
    .into_iter()
    .flatten()
    .collect();

    document_score_code
        .into_iter()
        .chain(selfie_code)
        .chain(doc_expired_code)
        .chain(ocr_successful_code)
        .chain(id_test_frcs)
        .chain(face_codes)
        .chain(barcode_frc)
        .chain(liveness_score_code)
        .collect()
}

pub fn pii_matching_reason_codes_from_ocr_response(
    res: &FetchOCRResponse,
    vault_data: IncodeOcrComparisonDataFields,
) -> Vec<FootprintReasonCode> {
    let parsed_names = ParsedIncodeNames::from_fetch_ocr_res(res);
    let parsed_address = ParsedIncodeAddress::from_fetch_ocr_res(res);

    let fn_matches = first_name_matches(&parsed_names, &vault_data);
    let ln_matches = last_name_matches(&parsed_names, &vault_data);
    let reason_codes: Vec<FootprintReasonCode> = [
        reason_codes_from_match_field(IncodeMatchField::FirstName, fn_matches),
        reason_codes_from_match_field(IncodeMatchField::LastName, ln_matches),
        reason_codes_from_match_field(IncodeMatchField::Dob, dob_matches(res, &vault_data)),
        reason_codes_from_match_field(
            IncodeMatchField::Name,
            fn_matches.and_then(|x| ln_matches.map(|y| x && y)),
        ),
        reason_codes_from_match_field(
            IncodeMatchField::Address,
            address_matches(&parsed_address, &vault_data.address).matched(),
        ),
    ]
    .into_iter()
    .flatten()
    .collect();

    reason_codes
}

// TODO: rm ff for this in the other place in follow up PR since we have rules now
pub fn drivers_license_features_from_ocr_response(res: &FetchOCRResponse) -> Vec<FootprintReasonCode> {
    let mut frc = vec![];
    if res.is_permit_or_provisional_license().unwrap_or(false) {
        frc.push(FootprintReasonCode::DocumentIsPermitOrProvisionalLicense)
    }

    frc
}

const OCR_CONFIDENCE_SCORE_THRESHOLD: f32 = 0.70;

fn ocr_was_successful(scores_res: &FetchScoresResponse, ocr_res: &FetchOCRResponse, dk: IdDocKind) -> bool {
    let parsed_odks: Vec<ParsedIncodeField> = ParsedIncodeFields::from_fetch_ocr_res(ocr_res).0;
    let all_expected_fields_present_and_high_confidence =
        dk.expected_critical_ocr_data_kinds().into_iter().all(|odk| {
            let pif = parsed_odks.iter().find(|p| p.odk == odk);
            if let Some(pif) = pif {
                // we don't have a lot of confidence (no pun intended) on Incode's consistency with producing these scores and for some fields its a little ambiguous which of several
                // possible options should/could be used as the correct measure of confidence. So given this, if the confidence score is None, we treat this as passing OCR. (for now anyway)
                pif.confidence
                    .map(|c| c > OCR_CONFIDENCE_SCORE_THRESHOLD)
                    .unwrap_or(true)
            } else {
                // if the data was not parsed, then ocr was not successful
                false
            }
        });

    let ocr_overall_confidence_passed = match scores_res.id_ocr_confidence().1 {
        Some(s) => s != IncodeStatus::Fail,
        None => {
            tracing::warn!("missing incode ocr score");
            false
        }
    };

    // call OCR unsuccessful if either the overall confidence check in the scores response is FAIL or if any critical fields are missing or low confidence in the OCR response
    all_expected_fields_present_and_high_confidence && ocr_overall_confidence_passed
}

fn doc_expired_reason_code(res: &FetchOCRResponse) -> Option<FootprintReasonCode> {
    res.expire_at
        .as_ref()
        .and_then(|e| e.leak().parse::<i64>().ok())
        .and_then(|d| NaiveDateTime::from_timestamp_opt(d / 1000, 0))
        .map(|d| {
            if Utc::now().naive_utc() > d {
                FootprintReasonCode::DocumentExpired
            } else {
                FootprintReasonCode::DocumentNotExpired
            }
        })
}

fn get_frc_from_test(value: (&IncodeTest, &IncodeStatus)) -> Option<(FootprintReasonCode, (bool, bool))> {
    let (t, s) = value;
    let frc_helper: Option<IncodeRCH> = t.into();
    frc_helper.and_then(|f| {
        if s == &IncodeStatus::Fail {
            f.fail_code.map(|c| (c, (t.is_crosscheck(), false)))
        } else {
            f.ok_code.map(|c| (c, (false, t.is_crosscheck())))
        }
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::test_helpers::assert_have_same_elements;
    use idv::{
        incode::doc::response::{FetchScoresResponse, OCRName, OcrDataConfidence},
        test_fixtures::{self, DocTestOpts, OcrTestOpts},
    };
    use newtypes::{
        incode::IncodeStatus::*,
        FootprintReasonCode::{self, *},
        PiiLong, ScrubbedPiiLong, ScrubbedPiiString,
    };
    use std::collections::HashMap;
    use test_case::test_case;

    #[test_case(
        ("Rob", "Roberto", "1990-01-01"), 
        (Some("Rob".into()),Some("Roberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]
    ; "name and dob match")]
    #[test_case(
        ("ROB", "    roBERTo", "1990-01-01"), 
        (Some("rob".into()), Some("roberto".into()), Some("       1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]
    ; "whitespace/mixed case matches name")]
    #[test_case(
        ("Robby", "Roberto", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()), Some("1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameMatches, DocumentOcrDobDoesNotMatch, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "first name doesn't match and DOBs don't match"
    )]
    #[test_case(
        ("Bob", "Roberti", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()),Some("  1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameMatches, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "last name doesn't match and DOBs don't match"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (Some("Crob".into()),Some("Croberto".into()),Some("1980-01-01".into())),
        vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "all doesn't match"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (Some("Bob".into()),Some("Roberto".into()),None),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobCouldNotMatch, DocumentOcrDobDoesNotMatch, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "dob missing"
    )]
    #[test_case(
        ("Bob", "Roberto", "1990-01-01"), 
        (None, Some("Roberto".into()), Some("1990-01-01".into())),
        vec![DocumentOcrNameCouldNotMatch, DocumentOcrNameDoesNotMatch, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "first name missing"
    )]
    #[test_case(
        ("Rob", "Robèrto", "1990-01-01"), 
        (Some("Rob".into()),Some("Roberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "unicode"
    )]
    #[test_case(
        ("RöbÀÑ", "RÓbèrtõ", "1990-01-01"), 
        (Some("Roban".into()),Some("ROBERTO".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "more unicode"
    )]
    #[test_case(
        ("B'ob", "Bo'berto", "1990-01-01"), 
        (Some("B'ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "apostraphies in both names"
    )]
    #[test_case(
        ("B'ob", "Bo'berto", "1990-01-01"), 
        (Some("Bob".into()),Some("Boberto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "apostraphies in OCR names"
    )]
    #[test_case(
        ("Bob", "Boberto", "1990-01-01"), 
        (Some("B'ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "apostraphies in keyed in names"
    )]
    #[test_case(
        ("Bob", "Bo'  berto", "1990-01-01"), 
        (Some("B' ob".into()),Some("Bo'berto".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch]; "apostraphies and spaces"
    )]
    #[test_case(
        ("Bob", "Boberto-Jones", "1990-01-01"), 
        (Some("Bob".into()),Some("Boberto Jones".into()),Some("1990-01-01".into())),
        vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches, DocumentOcrAddressCouldNotMatch, DocumentOcrAddressDoesNotMatch,]; "hyphen"
    )]
    fn test_reason_codes_from_ocr_response(
        raw_ocr: (&str, &str, &str),
        raw_vault_data: (Option<PiiString>, Option<PiiString>, Option<PiiString>),
        expected: Vec<FootprintReasonCode>,
    ) {
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
            address: IncodeOcrAddress::default(),
        };
        let raw = test_fixtures::incode_fetch_ocr_response(Some(ocr_opts));
        let parsed: FetchOCRResponse = serde_json::from_value(raw).unwrap();

        assert_have_same_elements(
            pii_matching_reason_codes_from_ocr_response(&parsed, vault_data),
            expected,
        )
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
            DocumentPdf417DataIsValid,
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
            DocumentNotExpired
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
                liveness: Fail
            }, 
            vec![
                DocumentPhotoIsScreenCapture,
                DocumentVisiblePhotoFeaturesNotVerified,
                DocumentPhotoIsPaperCapture,
                DocumentPossibleImageTampering,
                DocumentNotVerified,
                DocumentBarcodeCouldNotBeRead,
                DocumentBarcodeCouldNotBeDetected,
                DocumentPdf417DataIsNotValid,
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
                DocumentSelfieNotLiveImage,
                DocumentNumberCrosscheckDoesNotMatch, // barcode stuff is weird here
                DocumentNotExpired
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
                liveness: Ok
            }, 
            vec![
                DocumentPhotoIsNotScreenCapture,
                DocumentPhotoIsNotPaperCapture,
                DocumentNotVerified,
                DocumentNoImageTampering,
                DocumentVisiblePhotoFeaturesVerified,
                DocumentBarcodeCouldNotBeRead,
                DocumentBarcodeCouldNotBeDetected,
                DocumentPdf417DataIsValid,
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
                DocumentNotExpired
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
                    DocumentPdf417DataIsValid,
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
                    DocumentBarcodeContentMatches,
                    DocumentNotExpired
                    // no selfie code
                ], false; "everything passes, but selfie isn't collected")]
    fn test_reason_codes_from_score_response(
        doc_opts: DocTestOpts,
        expected: Vec<FootprintReasonCode>,
        expect_selfie: bool,
    ) {
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(doc_opts);
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();

        let ocr_raw_response = idv::test_fixtures::incode_fetch_ocr_response(None);
        let ocr_parsed: FetchOCRResponse = serde_json::from_value(ocr_raw_response).unwrap();

        assert_have_same_elements(
            super::reason_codes_from_score_response(
                &parsed,
                &ocr_parsed,
                expect_selfie,
                IdDocKind::DriversLicense,
            ),
            expected,
        )
    }

    #[test]
    fn test_summary_barcode_reason_code() {
        let ocr_raw_response = idv::test_fixtures::incode_fetch_ocr_response(None);
        let ocr_parsed: FetchOCRResponse = serde_json::from_value(ocr_raw_response).unwrap();
        // everything passes
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts::default());
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let id_test_results = only_id_tests_for_ones_that_have_frcs_from_parsed(parsed.clone());
        id_test_results.iter().for_each(|(test, status)| {
            if test.is_crosscheck() {
                assert_eq!(status, &IncodeStatus::Ok)
            }
        });
        let frcs =
            super::reason_codes_from_score_response(&parsed, &ocr_parsed, false, IdDocKind::DriversLicense);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));

        // partial fail
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {
            barcode_content: Fail,
            barcode: Ok,
            cross_checks: Ok,
            ..Default::default()
        });
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs =
            super::reason_codes_from_score_response(&parsed, &ocr_parsed, false, IdDocKind::DriversLicense);
        assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));
        assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));

        // read ok, but cross checks fail
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {
            barcode_content: Ok,
            barcode: Ok,
            cross_checks: Fail,
            ..Default::default()
        });
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs =
            super::reason_codes_from_score_response(&parsed, &ocr_parsed, false, IdDocKind::DriversLicense);
        assert!(frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));

        // wasn't read
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(DocTestOpts {
            barcode_content: Fail,
            barcode: Fail,
            cross_checks: Fail,
            ..Default::default()
        });
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();
        let frcs =
            super::reason_codes_from_score_response(&parsed, &ocr_parsed, false, IdDocKind::DriversLicense);
        assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentDoesNotMatch));
        assert!(!frcs.contains(&FootprintReasonCode::DocumentBarcodeContentMatches));
    }

    fn only_id_tests_for_ones_that_have_frcs_from_parsed(
        parsed: FetchScoresResponse,
    ) -> HashMap<IncodeTest, IncodeStatus> {
        parsed
            .get_id_tests()
            .into_iter()
            .filter(|(t, _)| {
                let frc_helper: Option<IncodeRCH> = t.into(); // filter to only
                frc_helper.is_some()
            })
            .collect()
    }

    #[test_case(FetchOCRResponse { ..Default::default()} => None)]
    #[test_case(FetchOCRResponse { expire_at: Some(ScrubbedPiiString::from("1663459200000")), ..Default::default()} => Some(FootprintReasonCode::DocumentExpired))]
    #[test_case(FetchOCRResponse { expire_at: Some(ScrubbedPiiString::from("2663459200000")), ..Default::default()} => Some(FootprintReasonCode::DocumentNotExpired))]
    fn test_doc_expired_reason_code(res: FetchOCRResponse) -> Option<FootprintReasonCode> {
        doc_expired_reason_code(&res)
    }

    #[test_case(
        IdDocKind::DriversLicense, 
        DocTestOpts::default(), 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            address: Some("123 bob st".into()),
            birth_date: Some(ScrubbedPiiLong::new(PiiLong::new(529873860000))),
            document_number: Some("12354".into()),
            expire_at: Some("423123251".into()),
            issued_at: Some("3231234521".into()),         
            ocr_data_confidence: Some(OcrDataConfidence{
                name_confidence: Some(1.0),
                address_confidence: Some(1.0),
                birth_date_confidence: Some(1.0),
                expire_at_confidence: Some(1.0),
                document_number_confidence: Some(1.0),
                ..Default::default()
            }),
            ..Default::default()
        } 
        => true)]
    #[test_case(
        IdDocKind::DriversLicense, 
        DocTestOpts::default(), 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            address: Some("123 bob st".into()),
            birth_date: Some(ScrubbedPiiLong::new(PiiLong::new(529873860000))),
            document_number: Some("12354".into()),
            expire_at: Some("423123251".into()),
            issued_at: Some("3231234521".into()),         
            ocr_data_confidence: Some(OcrDataConfidence{
                name_confidence: Some(1.0),
                address_confidence: Some(1.0),
                birth_date_confidence: Some(1.0),
                expire_at_confidence: Some(1.0),
                document_number_confidence: Some(0.5),
                ..Default::default()
            }),
            ..Default::default()
        } 
        => false)]
    #[test_case(
        IdDocKind::DriversLicense, 
        DocTestOpts::default(), 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            address: Some("123 bob st".into()),
            birth_date: Some(ScrubbedPiiLong::new(PiiLong::new(529873860000))),
            document_number: Some("12354".into()),
            expire_at: Some("423123251".into()),
            issued_at: Some("3231234521".into()),
            ..Default::default()
        } 
        => true)]
    #[test_case(
        IdDocKind::DriversLicense, 
        DocTestOpts::default(), 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            address: Some("123 bob st".into()),
            birth_date: Some(ScrubbedPiiLong::new(PiiLong::new(529873860000))),
            document_number: Some("12354".into()),
            expire_at: None,
            issued_at: Some("3231234521".into()),
            ..Default::default()
        } 
        => false)]
    #[test_case(
        IdDocKind::IdCard, 
        DocTestOpts::default(), 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            ..Default::default()
        } 
        => true)]
    #[test_case(
        IdDocKind::Passport, 
        DocTestOpts::default(), 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            ..Default::default()
        } 
        => false)]
    #[test_case(
        IdDocKind::IdCard, 
        DocTestOpts {
            ocr_confidence: Fail,
           ..Default::default() 
        }, 
        FetchOCRResponse {
            name: Some(OCRName {
                given_name: Some("bob".into()),
                ..Default::default()
            }),
            ..Default::default()
        } 
        => false)]
    fn test_ocr_was_successful(dk: IdDocKind, score_opts: DocTestOpts, ocr_res: FetchOCRResponse) -> bool {
        let scores_res: FetchScoresResponse =
            serde_json::from_value(idv::test_fixtures::incode_fetch_scores_response(score_opts)).unwrap();
        ocr_was_successful(&scores_res, &ocr_res, dk)
    }

    #[test_case("CP", "GEORGIA", "DriversLicense", vec![FootprintReasonCode::DocumentIsPermitOrProvisionalLicense])]
    #[test_case("EP", "GEORGIA", "DriversLicense", vec![FootprintReasonCode::DocumentIsPermitOrProvisionalLicense])]
    #[test_case("cp   ", "GEorgIA", "DriversLicense", vec![FootprintReasonCode::DocumentIsPermitOrProvisionalLicense]; "with normalization")]
    #[test_case("CP", "GEORGIA", "IdentificationCard", vec![]; "not a DL")]
    #[test_case("C", "GEORGIA", "DriversLicense", vec![]; "full driver class passes")]
    #[test_case("A", "GEORGIA", "DriversLicense", vec![]; "full commercial driver class passes")]
    #[test_case("D", "NEW YORK", "DriversLicense", vec![])]
    fn test_drivers_license_features(
        class: &str,
        issuing_state: &str,
        type_of_id: &str,
        expected: Vec<FootprintReasonCode>,
    ) {
        let raw =
            test_fixtures::incode_fetch_ocr_response_for_drivers_license(class, issuing_state, type_of_id);
        let parsed: FetchOCRResponse = serde_json::from_value(raw).unwrap();

        assert_have_same_elements(
            super::drivers_license_features_from_ocr_response(&parsed),
            expected,
        )
    }
}
