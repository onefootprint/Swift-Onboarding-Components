use crate::schema::requirement;

use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    OnboardingId, RequirementId, RequirementInitiator, RequirementKind, RequirementStatus2, UserVaultId,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = requirement)]
pub struct Requirement {
    pub id: RequirementId,
    pub kind: RequirementKind,
    pub status: RequirementStatus2,
    pub initiator: RequirementInitiator,
    pub user_vault_id: UserVaultId,

    pub fulfilled_at: Option<DateTime<Utc>>,
    pub fulfilled_by_requirement_id: Option<RequirementId>,
    pub onboarding_id: Option<OnboardingId>,

    pub created_at: Option<DateTime<Utc>>,
    pub deactivated_at: Option<DateTime<Utc>>,

    pub error_message: Option<String>,

    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
