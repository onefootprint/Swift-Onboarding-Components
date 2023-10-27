use analyze_id::AnalyzeIdResult;
use aws_sdk_rekognition::{
    client::Client as RekClient,
    error::SdkError as RekSdkError,
    operation::{
        compare_faces::CompareFacesError, detect_faces::DetectFacesError, detect_text::DetectTextError,
    },
    primitives::Blob,
    types::{Attribute, Image},
};
use aws_sdk_textract::{
    error::SdkError as TextSdkError, operation::analyze_id::AnalyzeIDError, types::Document,
    Client as TexClient,
};
use aws_types::SdkConfig;
use compare::{CompareResult, FaceCompareDetails};
use newtypes::{PiiBytes, PiiString};

use crate::face::FaceResult;

pub mod analyze_id;
pub mod compare;
pub mod face;

#[derive(Clone)]
pub struct AwsSelfieDocClient {
    rek_client: RekClient,
    tex_client: TexClient,
}

#[derive(Debug, thiserror::Error)]
pub enum AwsSelfieDocError {
    #[error("Detect faces error: {0}")]
    DetectFaces(#[from] RekSdkError<DetectFacesError>),
    #[error("Compare faces error: {0}")]
    CompareFaces(#[from] RekSdkError<CompareFacesError>),
    #[error("Extract text error: {0}")]
    ExtractText(#[from] RekSdkError<DetectTextError>),
    #[error("Extract document data")]
    TextractData(#[from] TextSdkError<AnalyzeIDError>),
}

pub type SResult<T> = Result<T, AwsSelfieDocError>;

impl AwsSelfieDocClient {
    pub fn new(config: &SdkConfig) -> Self {
        Self {
            rek_client: RekClient::new(config),
            tex_client: TexClient::new(config),
        }
    }

    #[tracing::instrument(skip_all)]
    /// finds a face in the image
    pub async fn detect_face(&self, selfie_bytes: &PiiBytes) -> SResult<FaceResult> {
        let res = self
            .rek_client
            .detect_faces()
            .set_image(Some(
                Image::builder()
                    .bytes(Blob::new(selfie_bytes.leak_slice()))
                    .build(),
            ))
            .set_attributes(Some(vec![Attribute::All]))
            .send()
            .await?;

        let faces = res.face_details.unwrap_or_default();
        if faces.len() > 1 {
            return Ok(FaceResult::MultipleFacesFound);
        }
        let face = if let Some(face) = faces.into_iter().next() {
            face
        } else {
            return Ok(FaceResult::NoFaceFound);
        };

        Ok(FaceResult::FoundSingleFace(face.into()))
    }

    #[tracing::instrument(skip_all)]
    /// finds a face in the image
    pub async fn compare_doc_to_selfie(
        &self,
        doc_bytes: &PiiBytes,
        selfie_bytes: &PiiBytes,
        similarity_threshold: Option<f32>,
    ) -> SResult<CompareResult> {
        let res = self
            .rek_client
            .compare_faces()
            .set_similarity_threshold(similarity_threshold)
            // .set_quality_filter(Some(aws_sdk_rekognition::types::QualityFilter::Auto))
            .set_source_image(Some(
                Image::builder().bytes(Blob::new(doc_bytes.leak_slice())).build(),
            ))
            .set_target_image(Some(
                Image::builder()
                    .bytes(Blob::new(selfie_bytes.leak_slice()))
                    .build(),
            ))
            .send()
            .await?;

        let Some(source_face) = res.source_image_face() else {
            return Ok(CompareResult::NoSourceFace);
        };

        let Some(target_face) = res
            .face_matches()
            .unwrap_or_default()
            .iter()
            .max_by(|f1, f2| max_f32(f1.similarity(), f2.similarity()))
        else {
            return Ok(CompareResult::NoMatchingFace);
        };

        if res.face_matches().unwrap_or_default().len() + res.unmatched_faces().unwrap_or_default().len() > 1
        {
            return Ok(CompareResult::MultipleTargetFaces);
        }

        Ok(CompareResult::FoundSingleFace(FaceCompareDetails::new(
            source_face,
            target_face,
        )))
    }

    #[tracing::instrument(skip_all)]
    /// extract text from the image
    pub async fn extract_text(&self, doc_bytes: &PiiBytes) -> SResult<Vec<PiiString>> {
        let res = self
            .rek_client
            .detect_text()
            .set_image(Some(
                Image::builder().bytes(Blob::new(doc_bytes.leak_slice())).build(),
            ))
            .send()
            .await?;

        let results = res
            .text_detections
            .unwrap_or_default()
            .into_iter()
            .flat_map(|t| t.detected_text)
            .map(PiiString::from)
            .collect();

        Ok(results)
    }

    #[tracing::instrument(skip_all)]
    /// finds a face in the image
    pub async fn extract_document_data(&self, doc_bytes: &PiiBytes) -> SResult<AnalyzeIdResult> {
        let res = self
            .tex_client
            .analyze_id()
            .set_document_pages(Some(vec![Document::builder()
                .bytes(Blob::new(doc_bytes.leak_slice()))
                .build()]))
            .send()
            .await?;

        let res = res.identity_documents().unwrap_or_default();
        if res.len() > 1 {
            return Ok(AnalyzeIdResult::FoundMultipleDocuments);
        }

        let Some(res) = res.iter().next() else {
            return Ok(AnalyzeIdResult::NoIdentityDocument);
        };

        Ok(AnalyzeIdResult::FoundIdentityDocumentMetadata(res.into()))
    }
}

fn max_f32(f1: Option<f32>, f2: Option<f32>) -> std::cmp::Ordering {
    match (f1, f2) {
        (Some(s1), Some(s2)) => {
            if s1 > s2 {
                std::cmp::Ordering::Greater
            } else if s1 == s2 {
                std::cmp::Ordering::Equal
            } else {
                std::cmp::Ordering::Less
            }
        }
        (None, Some(_)) => std::cmp::Ordering::Less,
        (Some(_), None) => std::cmp::Ordering::Greater,
        (None, None) => std::cmp::Ordering::Equal,
    }
}

#[cfg(test)]
mod tests {

    use super::*;

    async fn run_test(doc: PiiBytes, selfie: PiiBytes) {
        let _dotenv = dotenv::dotenv().unwrap();
        let conf = aws_config::from_env().load().await;
        let client = AwsSelfieDocClient::new(&conf);

        let res = client.detect_face(&selfie).await.expect("failed to compare");
        println!("Detect Face: {}", serde_json::to_string_pretty(&res).unwrap());

        let res = client
            .compare_doc_to_selfie(&doc, &selfie, None)
            .await
            .expect("failed to compare");

        println!(
            "Compare Face to License: {}",
            serde_json::to_string_pretty(&res).unwrap()
        );

        let res = client.extract_text(&doc).await.expect("failed to extract text");

        println!(
            "Text extractions: {}",
            serde_json::to_string_pretty(&res).unwrap()
        );
    }

    #[ignore]
    #[tokio::test]
    async fn test_a() {
        let doc = PiiBytes::new(include_bytes!("../test_vectors/front_a.png").to_vec());
        let selfie = PiiBytes::new(include_bytes!("../test_vectors/selfie_a_alt.png").to_vec());
        run_test(doc, selfie).await;
    }

    #[ignore]
    #[tokio::test]
    async fn test_b() {
        let doc = PiiBytes::new(include_bytes!("../test_vectors/front_b.png").to_vec());
        let selfie = PiiBytes::new(include_bytes!("../test_vectors/selfie_b.png").to_vec());
        run_test(doc, selfie).await;
    }

    #[ignore]
    #[tokio::test]
    async fn test_wrong() {
        let doc = PiiBytes::new(include_bytes!("../test_vectors/front_a.png").to_vec());
        let selfie = PiiBytes::new(include_bytes!("../test_vectors/selfie_b.png").to_vec());
        run_test(doc, selfie).await;
    }

    #[ignore]
    #[tokio::test]
    async fn test_doc_extract() {
        let _dotenv = dotenv::dotenv().unwrap();
        let conf = aws_config::from_env().load().await;
        let client = AwsSelfieDocClient::new(&conf);

        let doc = PiiBytes::new(include_bytes!("../test_vectors/front_a.png").to_vec());
        let res = client.extract_document_data(&doc).await.expect("failed to run");

        println!("Analyze ID: {}", serde_json::to_string_pretty(&res).unwrap());
    }
}
