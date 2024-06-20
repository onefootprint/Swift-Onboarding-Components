use crate::face::FaceResult;
use analyze_id::AnalyzeIdResult;
use aws_sdk_rekognition::client::Client as RekClient;
use aws_sdk_rekognition::error::SdkError as RekSdkError;
use aws_sdk_rekognition::operation::compare_faces::CompareFacesError;
use aws_sdk_rekognition::operation::detect_faces::DetectFacesError;
use aws_sdk_rekognition::operation::detect_text::DetectTextError;
use aws_sdk_rekognition::primitives::Blob;
use aws_sdk_rekognition::types::Attribute;
use aws_sdk_rekognition::types::Image;
use aws_sdk_textract::error::SdkError as TextSdkError;
use aws_sdk_textract::operation::analyze_id::AnalyzeIDError;
use aws_sdk_textract::types::Document;
use aws_sdk_textract::Client as TexClient;
use aws_types::SdkConfig;
use compare::CompareFacesResponse;
use compare::CompareResult;
use compare::FaceCompareDetails;
use newtypes::PiiBytes;
use newtypes::PiiString;

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
            .iter()
            .max_by(|f1, f2| max_f32(f1.similarity(), f2.similarity()))
        else {
            return Ok(CompareResult::NoMatchingFace);
        };

        if res.face_matches().len() + res.unmatched_faces().len() > 1 {
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

        let res = res.identity_documents();
        if res.len() > 1 {
            return Ok(AnalyzeIdResult::FoundMultipleDocuments);
        }

        let Some(res) = res.iter().next() else {
            return Ok(AnalyzeIdResult::NoIdentityDocument);
        };

        Ok(AnalyzeIdResult::FoundDocumentMetadata(res.into()))
    }
}
impl AwsSelfieDocClient {
    #[tracing::instrument(skip_all)]
    /// finds a face in the image
    pub async fn doc_to_selfie(
        &self,
        doc_bytes: &PiiBytes,
        selfie_bytes: &PiiBytes,
        similarity_threshold: Option<f32>,
    ) -> SResult<CompareFacesResponse> {
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

        Ok(CompareFacesResponse::from(res))
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
    use crate::face::BoundingBox;

    async fn run_test(doc: PiiBytes, selfie: PiiBytes) {
        let _dotenv = dotenv::dotenv().unwrap();
        let conf = aws_config::defaults(aws_config::BehaviorVersion::v2023_11_09())
            .load()
            .await;
        let client = AwsSelfieDocClient::new(&conf);

        let res = client.detect_face(&selfie).await.expect("failed to compare");
        println!("Detect Face: {}", serde_json::to_string_pretty(&res).unwrap());

        let res = client
            .doc_to_selfie(&doc, &selfie, None)
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
        let conf = aws_config::defaults(aws_config::BehaviorVersion::v2023_11_09())
            .load()
            .await;
        let client = AwsSelfieDocClient::new(&conf);

        let doc = PiiBytes::new(include_bytes!("../test_vectors/front_a.png").to_vec());
        let res = client.extract_document_data(&doc).await.expect("failed to run");

        println!("Analyze ID: {}", serde_json::to_string_pretty(&res).unwrap());
    }

    // DO NOT REMOVE THIS TEST, OR IGNORE IT.
    #[test]
    fn test_compare_faces_struct_serialization_do_not_remove_this_test() {
        // deserialize from raw Value
        let compare_face_schema_v1_deserialized: CompareFacesResponse =
            serde_json::from_value(compare_face_schema()).unwrap();
        // construct struct
        let compare_face_struct_v1 = CompareFacesResponse {
            source_bounding_box: Some(BoundingBox {
                width: Some(0.16606712),
                height: Some(0.3187712),
                left: Some(0.17314644),
                top: Some(0.40029877),
            }),
            source_face_confidence: Some(99.999725),
            similarity: Some(99.97052),
            target_bounding_box: Some(BoundingBox {
                width: Some(0.4916357),
                height: Some(0.41334277),
                left: Some(0.37403238),
                top: Some(0.15058655),
            }),
            target_face_confidence: Some(99.999954),
            target_brightness: Some(86.964264),
            target_sharpness: Some(95.51619),
        };
        // serialized raw json == manually constructed Struct
        assert_eq!(compare_face_schema_v1_deserialized, compare_face_struct_v1);

        // serialize the struct
        let compare_face_struct_v1_serialized = serde_json::to_value(compare_face_struct_v1.clone()).unwrap();
        // deser the serialize struct
        let compare_face_struct_v1_serialized_then_deserialized: CompareFacesResponse =
            serde_json::from_value(compare_face_struct_v1_serialized).unwrap();
        assert_eq!(
            compare_face_struct_v1_serialized_then_deserialized,
            compare_face_struct_v1
        )
    }

    fn compare_face_schema() -> serde_json::Value {
        serde_json::json!({
          "source_bounding_box": {
            "width": 0.16606712,
            "height": 0.3187712,
            "left": 0.17314644,
            "top": 0.40029877
          },
          "source_face_confidence": 99.999725,
          "similarity": 99.97052,
          "target_bounding_box": {
            "width": 0.4916357,
            "height": 0.41334277,
            "left": 0.37403238,
            "top": 0.15058655
          },
          "target_face_confidence": 99.999954,
          "target_brightness": 86.964264,
          "target_sharpness": 95.51619
        })
    }
}
