use idv::incode::doc::response::{FetchScoresResponse, FetchOCRResponse};
use newtypes::{
    incode::{IncodeRCH, IncodeStatus, IncodeTest},
    FootprintReasonCode, VendorAPI, PiiString, VerificationResultId,
};

use crate::decision::onboarding::FeatureSet;


#[derive(Default, Clone)]
pub struct IncodeOcrComparisonDataFields {
    pub first_name: PiiString,
    pub last_name: PiiString,
    pub dob: PiiString,
}

/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IncodeDocumentFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
    pub verification_result_id: VerificationResultId,
}

impl FeatureSet for IncodeDocumentFeatures {
    fn footprint_reason_codes(&self) -> &Vec<FootprintReasonCode> {
        &self.footprint_reason_codes
    }
    fn vendor_api(&self) -> newtypes::VendorAPI {
        // TODO: Not quite right, but that's fine since this won't be used. 
        // eventually should move this to some sort of vendor api struct
        VendorAPI::IncodeFetchScores
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
    let score_reason_codes = reason_codes_from_score_response(scores, expect_selfie)?;
    let ocr_reason_codes = reason_codes_from_ocr_response(ocr, vault_data)?;

    Ok(score_reason_codes.into_iter().chain(ocr_reason_codes.into_iter()).collect())
}

pub fn reason_codes_from_score_response(scores: FetchScoresResponse, expect_selfie: bool) -> Result<Vec<FootprintReasonCode>, idv::Error> {
    let mut reason_codes = vec![];
    // Overall score
    // 
    // We check for the existence of this at the vendor call layer, but our decisioning relies most heavily on the score (for now)
    // and we should not proceed if we don't have it
    if scores
        .document_score()
        .map(|s| s.1 == IncodeStatus::Fail)
        .map_err(idv::Error::from)?
    {
        reason_codes.push(FootprintReasonCode::DocumentNotVerified);
    } else {
        reason_codes.push(FootprintReasonCode::DocumentVerified)
    };

    // OCR
    // TODO: if this happens, would we not be able to retrieve OCR from incode?
    //  should we just not vault it if OCR confidence isn't high?
    //  would overall score always be failure then?
    if scores
        .id_ocr_confidence()
        .map(|s| s.1 == IncodeStatus::Fail)
        .map_err(idv::Error::from)?
    {
        reason_codes.push(FootprintReasonCode::DocumentOcrNotSuccessful);
    } else {
        reason_codes.push(FootprintReasonCode::DocumentOcrSuccessful);
    };
    
    // only populate reason code if we collected a selfie
    if expect_selfie {
        if scores.selfie_match()
        .map(|s| s.1 == IncodeStatus::Fail)
        .map_err(idv::Error::from)?
        {
            reason_codes.push(FootprintReasonCode::DocumentSelfieDoesNotMatch);
        } else {
            reason_codes.push(FootprintReasonCode::DocumentSelfieMatches);
        }
    }
    

    scores
        .get_id_tests()
        .iter()
        .filter_map(get_frc_from_test)
        .for_each(|frc| reason_codes.push(frc));


    Ok(reason_codes)
}

pub fn reason_codes_from_ocr_response( ocr: FetchOCRResponse, vault_data: IncodeOcrComparisonDataFields) -> Result<Vec<FootprintReasonCode>, idv::Error>  {
        let first_name_ocr: PiiString = ocr.name.as_ref().and_then(|n| n.first_name.clone().map(|f| f.into())).ok_or(idv::Error::from(idv::incode::error::Error::OcrError("missing first name".into())))?;
        let paternal_last_name_ocr: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.paternal_last_name.clone().map(|f| f.into()));
        let maternal_last_name_ocr: Option<PiiString> = ocr.name.as_ref().and_then(|n| n.maternal_last_name.clone().map(|f| f.into()));
        // TODO: 
        //   switch MM-DD and DD-MM
        let dob_ocr: PiiString = ocr.dob()?.into();

        // matches, eventually should do levinstein or something else to determine "partial" matches
        let first_name_matches = pii_strings_match(&first_name_ocr, &vault_data.first_name);
        // incode doesn't give us a single last name field, except from the MRZ. But we don't always get the MRZ if the barcode was too blurry to 
        // be decoded. ¯\_(ツ)_/¯
        let pat_ln_matches = paternal_last_name_ocr.map(|p_ln| pii_strings_match(&p_ln, &vault_data.last_name)).unwrap_or(false);
        let mat_ln_matches = maternal_last_name_ocr.map(|m_ln| pii_strings_match(&m_ln, &vault_data.last_name)).unwrap_or(false);
        let last_name_matches = pat_ln_matches || mat_ln_matches;
        
        let name_matches = first_name_matches && last_name_matches;

        let dob_matches = pii_strings_match(&dob_ocr, &vault_data.dob);
        // TODO: address w/ CDOs are a little harder here. also incode OCR includes a bunch of \n and random crap so will do this in followup
        // incode also theoretically provides `addressFields` which is address broken out, but it hasn't been filled in for any of the test 
        // requests i've done. ex. `test_fixtures::incode_fetch_ocr_response()` 
        // So maybe we just default the alpaca cip stuff to `consider` for now


        let mut reason_codes = vec![];
        if first_name_matches {
            reason_codes.push(FootprintReasonCode::DocumentOcrFirstNameMatches)
        } else {
            reason_codes.push(FootprintReasonCode::DocumentOcrFirstNameDoesNotMatch)
        };

        if last_name_matches {
            reason_codes.push(FootprintReasonCode::DocumentOcrLastNameMatches)
        } else {
            reason_codes.push(FootprintReasonCode::DocumentOcrLastNameDoesNotMatch)
        };

        if name_matches {
            reason_codes.push(FootprintReasonCode::DocumentOcrNameMatches)
        } else {
            reason_codes.push(FootprintReasonCode::DocumentOcrNameDoesNotMatch)
        };

        if dob_matches {
            reason_codes.push(FootprintReasonCode::DocumentOcrDobMatches)
        } else {
            reason_codes.push(FootprintReasonCode::DocumentOcrDobDoesNotMatch)
        };

        Ok(reason_codes)
    }

fn pii_strings_match(p1: &PiiString, p2: &PiiString) -> bool {
    let normalized_p1 = normalize_pii(p1);
    let normalized_p2 = normalize_pii(p2);
    (normalized_p1.leak() == normalized_p2.leak()) && !(normalized_p1.leak().is_empty() || normalized_p2.leak().is_empty())
}

fn normalize_pii(p: &PiiString) -> PiiString {
    p.leak().trim().to_lowercase().into()
}

fn get_frc_from_test(value: (&IncodeTest, &IncodeStatus)) -> Option<FootprintReasonCode> {
    let (t, s) = value;
    let frc_helper: Option<IncodeRCH> = t.into();
    frc_helper.map(|f| {
        if s == &IncodeStatus::Fail {
            f.fail_code
        } else {
            f.ok_code
        }
    })
}

#[cfg(test)]
mod tests {
    use db::test_helpers::assert_have_same_elements;
    use idv::{incode::doc::response::FetchScoresResponse, test_fixtures::{DocTestOpts, OcrTestOpts, self}};
    use newtypes::{
        incode::IncodeStatus::*,
        FootprintReasonCode::{self, *},
    };
    use test_case::test_case;
    use super::*;
    
    #[test_case(OcrTestOpts {
        first_name: "Rob".into(),
        paternal_last_name: "Roberto".into(),
        dob: "1990-01-01".into(),
    },
    IncodeOcrComparisonDataFields {
        first_name: "Rob".into(),
        last_name: "Roberto".into(),
        dob: "1990-01-01".into(),
    },
    vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]
; "name and dob match")]
    #[test_case(OcrTestOpts {
        first_name: "ROB".into(),
        paternal_last_name: "    roBERTo".into(),
        dob: "1990-01-01".into(),
    },
    IncodeOcrComparisonDataFields {
        first_name: "rob".into(),
        last_name: "roberto".into(),
        dob: "       1990-01-01".into(),
    },
    vec![DocumentOcrNameMatches, DocumentOcrFirstNameMatches, DocumentOcrLastNameMatches, DocumentOcrDobMatches]
    ; "whitespace/mixed case matches name")]
    #[test_case(OcrTestOpts {
        first_name: "Robby".into(),
        paternal_last_name: "Roberto".into(),
        dob: "1990-01-01".into(),
    },
    IncodeOcrComparisonDataFields {
        first_name: "Bob".into(),
        last_name: "Roberto".into(),
        dob: "1980-01-01".into(),
    },
    vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameMatches, DocumentOcrDobDoesNotMatch]; "first name doesn't match and DOBs don't match"
    )]
    #[test_case(OcrTestOpts {
        first_name: "Bob".into(),
        paternal_last_name: "Roberti".into(),
        dob: "1990-01-01".into(),
    },
    IncodeOcrComparisonDataFields {
        first_name: "Bob".into(),
        last_name: "Roberto".into(),
        dob: "  1980-01-01".into(),
    },
    vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameMatches, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch]; "last name doesn't match and DOBs don't match"
    )]
    #[test_case(OcrTestOpts {
        first_name: "Bob".into(),
        paternal_last_name: "Roberto".into(),
        dob: "1990-01-01".into(),
    },
    IncodeOcrComparisonDataFields {
        first_name: "Crob".into(),
        last_name: "Croberto".into(),
        dob: "1980-01-01".into(),
    },
    vec![DocumentOcrNameDoesNotMatch, DocumentOcrFirstNameDoesNotMatch, DocumentOcrLastNameDoesNotMatch, DocumentOcrDobDoesNotMatch]; "all doesn't match"
    )]
    
    fn test_reason_codes_from_ocr_response(ocr_opts: OcrTestOpts, vault_data: IncodeOcrComparisonDataFields, expected: Vec<FootprintReasonCode>) {
        let raw = test_fixtures::incode_fetch_ocr_response(Some(ocr_opts));
        let parsed: FetchOCRResponse = serde_json::from_value(raw).unwrap();

        assert_have_same_elements(reason_codes_from_ocr_response(parsed, vault_data).unwrap(), expected)
    }

    #[test_case(
        DocTestOpts {
            screen: Ok,
            paper: Ok,
            expiration: Ok,
            overall: Ok,
            tamper: Ok,
            visible_photo_features: Ok,
            barcode: Ok,
            barcode_content: Ok,
            fake: Ok,
            ocr_confidence: Ok,
            selfie_match: Ok
        }, 
        vec![
            DocumentPhotoIsNotScreenCapture,
            DocumentVisiblePhotoFeaturesVerified,
            DocumentPhotoIsNotPaperCapture,
            DocumentNoImageTampering,
            DocumentNotExpired,
            DocumentVerified,
            DocumentBarcodeContentMatches,
            DocumentBarcodeCouldBeRead,
            DocumentNotFakeImage,
            DocumentOcrSuccessful,
            DocumentSelfieMatches,
            DocumentSelfieNotUsedWithDifferentInformation
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
                selfie_match: Fail
            }, 
            vec![
                DocumentPhotoIsScreenCapture,
                DocumentVisiblePhotoFeaturesNotVerified,
                DocumentPhotoIsPaperCapture,
                DocumentPossibleImageTampering,
                DocumentExpired,
                DocumentNotVerified,
                DocumentBarcodeContentDoesNotMatch,
                DocumentBarcodeCouldNotBeRead,
                DocumentPossibleFakeImage,
                DocumentOcrNotSuccessful,
                DocumentSelfieDoesNotMatch,
                DocumentSelfieNotUsedWithDifferentInformation
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
            }, 
            vec![
                DocumentPhotoIsNotScreenCapture,
                DocumentPhotoIsNotPaperCapture,
                DocumentNotExpired,
                DocumentNotVerified,
                DocumentNoImageTampering,
                DocumentVisiblePhotoFeaturesVerified,
                DocumentBarcodeContentDoesNotMatch,
                DocumentBarcodeCouldNotBeRead,
                DocumentNotFakeImage,
                DocumentOcrSuccessful,
                DocumentSelfieDoesNotMatch,
                DocumentSelfieNotUsedWithDifferentInformation
            ], true; "mix of things")]
            #[test_case(
                DocTestOpts {
                    screen: Ok,
                    paper: Ok,
                    expiration: Ok,
                    overall: Ok,
                    tamper: Ok,
                    visible_photo_features: Ok,
                    barcode: Ok,
                    barcode_content: Ok,
                    fake: Ok,
                    ocr_confidence: Ok,
                    selfie_match: Ok
                }, 
                vec![
                    DocumentPhotoIsNotScreenCapture,
                    DocumentVisiblePhotoFeaturesVerified,
                    DocumentPhotoIsNotPaperCapture,
                    DocumentNoImageTampering,
                    DocumentNotExpired,
                    DocumentVerified,
                    DocumentBarcodeContentMatches,
                    DocumentBarcodeCouldBeRead,
                    DocumentNotFakeImage,
                    DocumentOcrSuccessful,
                    DocumentSelfieNotUsedWithDifferentInformation // not quite correct, but this just won't appear in ID tests if we don't send selfie so we won't get any id test
                    // no selfie code
                ], false; "everything passes, but selfie isn't collected")]  
    fn test_reason_codes_from_score_response(doc_opts: DocTestOpts, expected: Vec<FootprintReasonCode>, expect_selfie: bool) {
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(doc_opts);
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();

        assert_have_same_elements(super::reason_codes_from_score_response(parsed, expect_selfie).unwrap(), expected)
    }

    
}
