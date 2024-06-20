use crate::face::BoundingBox;
use aws_sdk_rekognition::operation::compare_faces::CompareFacesOutput;
use aws_sdk_rekognition::types::CompareFacesMatch;
use aws_sdk_rekognition::types::ComparedSourceImageFace;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum CompareResult {
    FoundSingleFace(FaceCompareDetails),
    NoMatchingFace,
    NoSourceFace,
    MultipleTargetFaces,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FaceCompareDetails {
    pub source_bounding_box: Option<BoundingBox>,
    /// confidence that source bounding box is a face
    pub source_face_confidence: Option<f32>,

    pub similarity: Option<f32>,

    pub target_bounding_box: Option<BoundingBox>,
    pub target_face_confidence: Option<f32>,
    /// from 0 to 100
    pub target_brightness: Option<f32>,
    /// from 0 to 100
    pub target_sharpness: Option<f32>,
}

impl FaceCompareDetails {
    pub fn new(source: &ComparedSourceImageFace, target: &CompareFacesMatch) -> Self {
        Self {
            source_bounding_box: source.bounding_box().map(BoundingBox::from),
            source_face_confidence: source.confidence(),
            similarity: target.similarity(),
            target_bounding_box: target
                .face()
                .and_then(|f| f.bounding_box().map(BoundingBox::from)),
            target_face_confidence: target.face().and_then(|f| f.confidence()),
            target_brightness: target
                .face()
                .and_then(|f| f.quality().and_then(|q| q.brightness())),
            target_sharpness: target
                .face()
                .and_then(|f| f.quality().and_then(|q| q.sharpness())),
        }
    }
}

/// Struct that represents our internal schema of the response from AWS Rekognition CompareFaces
/// action
///
/// We need this struct because:
/// 1) aws gives us back the images detected, so we don't want to store those since these could be
///    big objects
/// 2) aws types are not Ser/Deser :(
///
/// IMPORTANT NOTE: please only _add_ optional fields to this struct
#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default, PartialEq)]
pub struct CompareFacesResponse {
    pub source_bounding_box: Option<BoundingBox>,
    /// confidence that source bounding box is a face
    pub source_face_confidence: Option<f32>,
    pub similarity: Option<f32>,
    pub target_bounding_box: Option<BoundingBox>,
    pub target_face_confidence: Option<f32>,
    /// from 0 to 100
    pub target_brightness: Option<f32>,
    /// from 0 to 100
    pub target_sharpness: Option<f32>,
    // IMPORTANT NOTE: please only _add_ optional fields to this struct, don't remove existing ones
}

impl From<CompareFacesOutput> for CompareFacesResponse {
    fn from(compare_face_response: CompareFacesOutput) -> Self {
        let source_face = compare_face_response.source_image_face();
        let target_face = compare_face_response
            .face_matches()
            .iter()
            .max_by(|f1, f2| super::max_f32(f1.similarity(), f2.similarity()));

        let target_compared_face = target_face.and_then(|f| f.face());
        Self {
            source_bounding_box: source_face.and_then(|f| f.bounding_box().map(BoundingBox::from)),
            source_face_confidence: source_face.and_then(|f| f.confidence()),
            similarity: target_face.and_then(|fm| fm.similarity()),
            target_bounding_box: target_compared_face.and_then(|f| f.bounding_box().map(BoundingBox::from)),
            target_face_confidence: target_compared_face.and_then(|f| f.confidence()),
            target_brightness: target_compared_face.and_then(|f| f.quality().and_then(|q| q.brightness())),
            target_sharpness: target_compared_face.and_then(|f| f.quality().and_then(|q| q.sharpness())),
        }
    }
}
