use idv::incode::doc::response::{FetchScoresResponse};
use newtypes::{
    incode::{IncodeRCH, IncodeStatus, IncodeTest},
    FootprintReasonCode, VendorAPI,
};

use crate::decision::onboarding::FeatureSet;


/// Struct to represent the elements (derived or pass through) that we use from IDology to make a decision
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct IncodeDocumentFeatures {
    pub footprint_reason_codes: Vec<FootprintReasonCode>,
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
    // _ocr: FetchOCRResponse,
    scores: FetchScoresResponse,
    // _vault_data: IncodeOcrComparisonDataFields, // TODO
) -> Result<Vec<FootprintReasonCode>, idv::Error> {
    
    // TODO Compare OCR to vault_data

    reason_codes_from_score_response(scores)
}

fn reason_codes_from_score_response( scores: FetchScoresResponse,) -> Result<Vec<FootprintReasonCode>, idv::Error> {
    let mut reason_codes = vec![];
    // Overall score
    // 
    // We check for the existence of this at the vendor call layer, but our decisioning relies most heavily on the score (for now)
    // and we should not proceed if we don't have it
    if scores
        .overall_score()
        .map(|s| s == IncodeStatus::Fail)
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
        .ok()
        .map(|s| s == IncodeStatus::Fail)
        .unwrap_or(false)
    {
        reason_codes.push(FootprintReasonCode::DocumentOcrNotSuccessful);
    } else {
        reason_codes.push(FootprintReasonCode::DocumentOcrSuccessful);
    };

    scores
        .get_id_tests()
        .iter()
        .filter_map(get_frc_from_test)
        .for_each(|frc| reason_codes.push(frc));


    Ok(reason_codes)
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
    use idv::{incode::doc::response::FetchScoresResponse, test_fixtures::DocTestOpts};
    use newtypes::{
        incode::IncodeStatus::*,
        FootprintReasonCode::{self, *},
    };
    use test_case::test_case;

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
        ]; "everything passes")]
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
                DocumentOcrNotSuccessful
            ]; "everything fails")]
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
                DocumentOcrSuccessful
            ]; "mix of things")]
    fn test_reason_codes_from_score_response(doc_opts: DocTestOpts, expected: Vec<FootprintReasonCode>) {
        let raw_response = idv::test_fixtures::incode_fetch_scores_response(doc_opts);
        let parsed: FetchScoresResponse = serde_json::from_value(raw_response).unwrap();

        assert_have_same_elements(super::reason_codes_from_score_response(parsed).unwrap(), expected)
    }
}
