use crate::schema::user_timeline;
use chrono::{DateTime, Utc};
use diesel::{Insertable, Queryable};
use newtypes::{OnboardingId, UserTimelineEvent, UserTimelineId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = user_timeline)]
pub struct UserTimeline {
    pub id: UserTimelineId,
    pub onboarding_id: OnboardingId,
    pub event: UserTimelineEvent,
    pub timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}
