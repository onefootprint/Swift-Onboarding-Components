use aws_sdk_rekognition::types::{CompareFacesMatch, ComparedSourceImageFace};
use serde::{Deserialize, Serialize};

use crate::face::BoundingBox;

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
