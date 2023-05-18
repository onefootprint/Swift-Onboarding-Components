#[derive(Eq, PartialEq, Hash, Copy, Clone, strum_macros::EnumString, strum_macros::Display)]
#[strum(serialize_all = "snake_case")]
pub enum DocumentSide {
    Front,
    Back,
    Selfie,
}
