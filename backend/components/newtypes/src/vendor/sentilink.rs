use serde::Serialize;


#[derive(Clone, Copy, Serialize)]
pub enum SentilinkProduct {
    #[serde(rename = "sentilink_synthetic_score")]
    SyntheticScore,
    #[serde(rename = "sentilink_id_theft_score")]
    IdTheftScore,
}
