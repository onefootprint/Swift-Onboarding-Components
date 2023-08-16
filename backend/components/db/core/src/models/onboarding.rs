use super::insight_event::CreateInsightEvent;
use super::scoped_vault::ScopedVault;
use super::vault::Vault;
use super::workflow::Workflow;
use crate::models::ob_configuration::ObConfiguration;
use crate::{DbResult, TxnPgConn};
use chrono::{DateTime, Utc};
use db_schema::schema::onboarding;
use diesel::prelude::*;
use diesel::{Insertable, Queryable};
use newtypes::{
    AlpacaKycConfig, CipKind, KybConfig, KycConfig, ObConfigurationId, OnboardingId, ScopedVaultId,
    WorkflowFixtureResult,
};
use newtypes::{OnboardingStatus, VaultKind};
use serde::{Deserialize, Serialize};

pub type IsNew = bool;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
pub struct Onboarding {
    pub id: OnboardingId,
    pub scoped_vault_id: ScopedVaultId,
    pub start_timestamp: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Queryable, Insertable)]
#[diesel(table_name = onboarding)]
struct NewOnboarding {
    scoped_vault_id: ScopedVaultId,
    start_timestamp: DateTime<Utc>,
}

#[derive(Debug)]
pub struct OnboardingCreateArgs {
    pub scoped_vault_id: ScopedVaultId,
    pub ob_configuration_id: ObConfigurationId,
    pub insight_event: Option<CreateInsightEvent>,
}

impl Onboarding {
    #[tracing::instrument("Onboarding::get_or_create", skip_all)]
    pub fn get_or_create(
        conn: &mut TxnPgConn,
        args: OnboardingCreateArgs,
        fixture_result: Option<WorkflowFixtureResult>,
    ) -> DbResult<(Onboarding, Workflow, IsNew)> {
        let sv = ScopedVault::lock(conn, &args.scoped_vault_id)?;
        let insight_event_id = if let Some(insight_event) = args.insight_event {
            Some(insight_event.insert_with_conn(conn)?.id)
        } else {
            None
        };
        let v = Vault::get(conn.conn(), &args.scoped_vault_id)?;
        let (obc, _) = ObConfiguration::get(conn.conn(), &args.ob_configuration_id)?;

        let config = match v.kind {
            VaultKind::Person => {
                if matches!(obc.cip_kind, Some(CipKind::Alpaca)) {
                    AlpacaKycConfig { is_redo: false }.into()
                } else {
                    KycConfig { is_redo: false }.into()
                }
            }
            VaultKind::Business => KybConfig {}.into(),
        };

        let (wf, is_new) = Workflow::get_or_create(
            conn,
            args.scoped_vault_id.clone(),
            config,
            fixture_result,
            obc.id,
            insight_event_id,
        )?;

        // Eventually, we'll get rid of onboarding and we'll just get_or_create the workflow here
        let ob = onboarding::table
            .filter(onboarding::scoped_vault_id.eq(&args.scoped_vault_id))
            .first(conn.conn())
            .optional()?;

        let ob = if let Some(ob) = ob {
            ob
        } else {
            let new_ob = NewOnboarding {
                scoped_vault_id: args.scoped_vault_id.clone(),
                start_timestamp: Utc::now(),
            };
            diesel::insert_into(onboarding::table)
                .values(new_ob)
                .get_result::<Onboarding>(conn.conn())?
        };

        // In locked transaction, update scoped vault status to Incomplete if it's null
        if sv.status.is_none() {
            ScopedVault::update_status(conn, &sv.id, OnboardingStatus::Incomplete)?;
        }

        Ok((ob, wf, is_new))
    }
}
