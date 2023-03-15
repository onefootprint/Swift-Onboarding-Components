use newtypes::{ObConfigurationId, ScopedVaultId};

use crate::{
    models::{
        insight_event::CreateInsightEvent,
        onboarding::{Onboarding, OnboardingCreateArgs},
    },
    TxnPgConn,
};

pub fn create(
    conn: &mut TxnPgConn,
    scoped_user_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
) -> Onboarding {
    let ob_args = OnboardingCreateArgs {
        scoped_user_id,
        ob_configuration_id,
        insight_event: CreateInsightEvent { ..Default::default() },
    };

    Onboarding::get_or_create(conn, ob_args).unwrap().0
}
