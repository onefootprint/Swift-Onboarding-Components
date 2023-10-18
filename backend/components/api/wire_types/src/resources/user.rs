use crate::*;

#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct UserId {
    pub id: FpId,
}

/// Basic information about a user
#[derive(Debug, Clone, Serialize, Apiv2Schema)]
pub struct User {
    pub id: FpId,
    pub requires_manual_review: bool,
    pub status: Option<OnboardingStatus>,
}
