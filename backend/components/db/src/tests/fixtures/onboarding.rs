use newtypes::{ObConfigurationId, ScopedVaultId};

use crate::{
    models::{
        insight_event::CreateInsightEvent,
        onboarding::{Onboarding, OnboardingCreateArgs},
    },
    tests::prelude::*,
    TxnPgConn,
};

pub fn create(
    conn: &mut TestPgConn,
    scoped_user_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
) -> Onboarding {
    let ob_args = OnboardingCreateArgs {
        scoped_user_id,
        ob_configuration_id,
        insight_event: CreateInsightEvent { ..Default::default() },
        should_create_document_request: false,
        should_collect_selfie: false,
    };

    Onboarding::get_or_create(conn, ob_args).unwrap()
}

pub fn create_with_txn(
    conn: &mut TxnPgConn,
    scoped_user_id: ScopedVaultId,
    ob_configuration_id: ObConfigurationId,
) -> Onboarding {
    let ob_args = OnboardingCreateArgs {
        scoped_user_id,
        ob_configuration_id,
        insight_event: CreateInsightEvent { ..Default::default() },
        should_create_document_request: false,
        should_collect_selfie: false,
    };

    Onboarding::get_or_create(conn, ob_args).unwrap()
}
