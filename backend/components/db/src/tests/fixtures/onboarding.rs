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
    scoped_vault_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
) -> Onboarding {
    let ob_args = OnboardingCreateArgs {
        scoped_vault_id,
        ob_configuration_id,
        insight_event: Some(CreateInsightEvent { ..Default::default() }),
    };

    Onboarding::get_or_create(conn, ob_args, true).unwrap().0
}
