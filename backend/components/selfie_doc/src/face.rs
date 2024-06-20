use aws_sdk_rekognition::types::FaceDetail as AwsFaceDetails;
use serde::Deserialize;
use serde::Serialize;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum FaceResult {
    FoundSingleFace(FaceDetails),
    NoFaceFound,
    MultipleFacesFound,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FaceDetails {
    /// overall confidence that it's a face
    pub confidence: Option<f32>,
    /// from 0 to 100
    pub brightness: Option<f32>,
    /// from 0 to 100
    pub sharpness: Option<f32>,
    pub face_occluded: Option<bool>,
    pub face_occluded_confidence: Option<f32>,
    pub bounding_box: Option<BoundingBox>,
    pub age_range: Option<AgeRange>,
    pub eyeglasses: Option<Eyeglasses>,
    pub sunglasses: Option<Sunglasses>,
    pub gender: Option<Gender>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub struct BoundingBox {
    pub width: Option<f32>,
    pub height: Option<f32>,
    pub left: Option<f32>,
    pub top: Option<f32>,
}

impl From<&aws_sdk_rekognition::types::BoundingBox> for BoundingBox {
    fn from(b: &aws_sdk_rekognition::types::BoundingBox) -> Self {
        BoundingBox {
            width: b.width,
            height: b.height(),
            left: b.left(),
            top: b.top,
        }
    }
}
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgeRange {
    pub low: Option<i32>,
    pub high: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Eyeglasses {
    pub is_detected: bool,
    /// from 0 to 100
    pub confidence: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Sunglasses {
    pub is_detected: bool,
    /// from 0 to 100
    pub confidence: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Gender {
    pub value: Option<GenderType>,
    pub confidence: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum GenderType {
    Female,
    Male,
    Other,
}

impl From<AwsFaceDetails> for FaceDetails {
    fn from(value: AwsFaceDetails) -> Self {
        let AwsFaceDetails {
            bounding_box,
            age_range,
            eyeglasses,
            sunglasses,
            gender,
            quality,
            confidence,
            face_occluded,
            ..
        } = value;

        Self {
            confidence,
            brightness: quality.as_ref().and_then(|q| q.brightness()),
            sharpness: quality.and_then(|q: aws_sdk_rekognition::types::ImageQuality| q.sharpness()),
            face_occluded: face_occluded.as_ref().map(|f| f.value()),
            face_occluded_confidence: face_occluded.and_then(|f| f.confidence()),
            bounding_box: bounding_box.as_ref().map(BoundingBox::from),
            age_range: age_range.map(|a| AgeRange {
                low: a.low(),
                high: a.high(),
            }),
            eyeglasses: eyeglasses.map(|e| Eyeglasses {
                is_detected: e.value(),
                confidence: e.confidence(),
            }),
            sunglasses: sunglasses.map(|s| Sunglasses {
                is_detected: s.value(),
                confidence: s.confidence(),
            }),
            gender: gender.map(|g| Gender {
                value: g.value().map(|gt| match gt {
                    aws_sdk_rekognition::types::GenderType::Female => GenderType::Female,
                    aws_sdk_rekognition::types::GenderType::Male => GenderType::Male,
                    _ => GenderType::Other,
                }),
                confidence: g.confidence(),
            }),
        }
    }
}
