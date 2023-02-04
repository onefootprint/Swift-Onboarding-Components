use crate::{
    models::{
        insight_event::CreateInsightEvent,
        onboarding::{Onboarding, OnboardingCreateArgs},
    },
    TxnPgConn,
};
use chrono::Utc;
use newtypes::{ObConfigurationId, ScopedUserId};

pub fn create(
    conn: &mut TxnPgConn,
    ob_config_id: &ObConfigurationId,
    scoped_user_id: &ScopedUserId,
) -> Onboarding {
    Onboarding::get_or_create(
        conn,
        OnboardingCreateArgs {
            scoped_user_id: scoped_user_id.clone(),
            ob_configuration_id: ob_config_id.clone(),
            insight_event: CreateInsightEvent {
                timestamp: Utc::now(),
                ..Default::default()
            },
            should_create_document_request: false,
            should_collect_selfie: false,
        },
    )
    .unwrap()
}
