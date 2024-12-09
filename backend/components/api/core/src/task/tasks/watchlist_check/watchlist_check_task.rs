use super::idology;
use super::incode;
use crate::decision::vendor::vendor_api::loaders::load_response_for_vendor_api;
use crate::task::ExecuteTask;
use crate::task::{
    self,
};
use crate::utils::vault_wrapper::Person;
use crate::utils::vault_wrapper::VaultWrapper;
use crate::utils::vault_wrapper::VwArgs;
use crate::State;
use api_errors::FpResult;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use async_trait::async_trait;
use chrono::Utc;
use db::models::data_lifetime::DataLifetime;
use db::models::decision_intent::DecisionIntent;
use db::models::ob_configuration::ObConfiguration;
use db::models::risk_signal::NewRiskSignalInfo;
use db::models::risk_signal::RiskSignal;
use db::models::risk_signal_group::RiskSignalGroupScope;
use db::models::scoped_vault::ScopedVault;
use db::models::task::Task;
use db::models::tenant::Tenant;
use db::models::user_timeline::UserTimeline;
use db::models::verification_request::VReqIdentifier;
use db::models::watchlist_check::WatchlistCheck;
use db::TxnPgConn;
use idv::requirements::HasIdentityDataRequirements;
use newtypes::vendor_api_struct::IdologyPa;
use newtypes::vendor_api_struct::IncodeWatchlistCheck;
use newtypes::DecisionIntentKind;
use newtypes::EnhancedAmlOption;
use newtypes::OnboardingStatus;
use newtypes::RiskSignalGroupKind;
use newtypes::ScopedVaultId;
use newtypes::TaskId;
use newtypes::WatchlistCheckArgs;
use newtypes::WatchlistCheckCompletedPayload;
use newtypes::WatchlistCheckError;
use newtypes::WatchlistCheckInfo;
use newtypes::WatchlistCheckNotNeededReason;
use newtypes::WatchlistCheckStatus;
use newtypes::WatchlistCheckStatusKind;
use newtypes::WebhookEvent;

#[derive(derive_more::Constructor)]
pub(crate) struct WatchlistCheckTask {
    state: State,
    task_id: TaskId,
}

enum WatchlistVendorResult {
    Completed(Vec<NewRiskSignalInfo>),
    InsufficientData,
}

impl WatchlistVendorResult {
    pub fn status(&self) -> WatchlistCheckStatus {
        match self {
            WatchlistVendorResult::Completed(rs) => {
                if rs.is_empty() {
                    WatchlistCheckStatus::Pass
                } else {
                    WatchlistCheckStatus::Fail
                }
            }
            WatchlistVendorResult::InsufficientData => {
                WatchlistCheckStatus::Error(WatchlistCheckError::RequiredDataNotPresent)
            }
        }
    }

    pub fn reason_codes(&self) -> Option<Vec<NewRiskSignalInfo>> {
        match self {
            WatchlistVendorResult::Completed(rs) => Some(rs.clone()),
            WatchlistVendorResult::InsufficientData => None,
        }
    }
}

#[async_trait]
impl ExecuteTask<WatchlistCheckArgs> for WatchlistCheckTask {
    async fn execute(self, args: WatchlistCheckArgs) -> FpResult<()> {
        let Self { state, task_id } = self;
        let WatchlistCheckArgs {
            scoped_vault_id: sv_id,
        } = args;

        // First we either create a new watchlist_check or we retrieve an existing one (ie if this is an
        // idempotent re-run of a failed execution) If we create a new watchlist_check, we either:
        //  - Create it with state Pending and a decision_intent is created at the same time
        //  - Create it with state NotNeeded and no decision_intent is written, meaning no vendor call is to
        //    be made
        let (tenant, sv, playbook_obc, uvw, wc) = state
            .db_transaction(move |conn| {
                // not strictly needed since we ever only execute a single task 1 at a time, but nice to be
                // extra safe
                let _task = Task::lock(conn, &task_id)?;
                let sv = ScopedVault::get(conn, &sv_id)?;
                let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv_id))?;

                let wc = if let Some(wc) = WatchlistCheck::get_by_task_id(conn, &task_id)? {
                    wc
                } else {
                    WatchlistCheckTask::create_new_watchlist_check(conn, &sv_id, &task_id, &sv, &uvw)?
                };

                let tenant = Tenant::get(conn, &sv.tenant_id)?;
                let sv = ScopedVault::get(conn, &sv_id)?;
                let playbook_obc = ObConfiguration::get_enhanced_aml_obc_for_sv(conn, &sv.id)?;

                Ok((tenant, sv, playbook_obc, uvw, wc))
            })
            .await?;

        // WC is initialized to either Pending or NotNeeded.
        // Pass/Fail/Error indicate this Task already completed and we wrote that final state in the final
        // txn in this Task. (Theoretically should never hit this case unless there was some system error
        // right between the last txn of this Task and the txn that sets the Task's status to completed)
        // Hence, if the status here is not Pending, we can just immediatly return
        if !matches!(wc.status, WatchlistCheckStatusKind::Pending) {
            return Ok(());
        }
        let di_id = wc.decision_intent_id.ok_or(ServerErr(
            "Expected watchlist_check.decision_intent_id to be non-null",
        ))?;

        let watchlist_result = match (
            &playbook_obc,
            playbook_obc
                .as_ref()
                .map(|(_, obc)| obc.verification_checks().enhanced_aml()),
        ) {
            // Idology
            (None, _) | (Some(_), None) | (_, Some(EnhancedAmlOption::No)) => {
                // logic that enqeues this Task should prevent this, but extra precaution
                if !tenant.id.is_fractional() {
                    tracing::error!(%tenant.id, obc_id=playbook_obc.map(|(_, obc)| obc.id.to_string()).unwrap_or_default(),"WatchlistCheckTask run with an obc with enhanced_aml=No on a non-Fractional tenant");
                }

                let existing_response = load_response_for_vendor_api(
                    &state,
                    VReqIdentifier::DiId(di_id.clone()),
                    &uvw.vault.e_private_key,
                    IdologyPa,
                )
                .await?
                .ok();

                if IdologyPa.requirements_are_satisfied(uvw.populated().as_slice()) {
                    let reason_codes =
                        idology::complete_vendor_call(&state, &sv.id, &di_id, &tenant.id, existing_response)
                            .await?;
                    WatchlistVendorResult::Completed(reason_codes)
                } else {
                    WatchlistVendorResult::InsufficientData
                }
            }
            // Incode
            (
                Some((playbook, obc)),
                Some(EnhancedAmlOption::Yes {
                    ofac: _,
                    pep: _,
                    adverse_media: _,
                    continuous_monitoring,
                    adverse_media_lists: _,
                    match_kind: _,
                }),
            ) => {
                // logic that enqeues this Task should prevent this, but extra precaution
                if !continuous_monitoring {
                    return ServerErrInto!("WatchlistCheckTask run with an obc enhanced_aml.continuous_monitoring = false: {}, {}",tenant.id, obc.id);
                }
                if IncodeWatchlistCheck.requirements_are_satisfied(uvw.populated().as_slice()) {
                    let reason_codes =
                        incode::complete_vendor_call(&state, &sv.id, &di_id, playbook, obc, &uvw).await?;
                    WatchlistVendorResult::Completed(reason_codes)
                } else {
                    WatchlistVendorResult::InsufficientData
                }
            }
        };

        // Save final status, write timeline event, and enqueue webhook task
        let wc_id = wc.id.clone();
        state
            .db_transaction(move |conn| {
                // not strictly necessarily since we aren't currently running multiple instances of a single
                // Task concurrently, but doesnt hurt
                let wc = WatchlistCheck::lock(conn, &wc_id)?;
                if !matches!(wc.status, WatchlistCheckStatusKind::Pending) {
                    return Ok(()); //ie if we had somehow concurrently already run this txn
                }

                let wc = WatchlistCheck::update(
                    wc,
                    conn,
                    watchlist_result.status(),
                    watchlist_result
                        .reason_codes()
                        .map(|rs| rs.iter().map(|(r, _, _)| r.clone()).collect()),
                    Some(Utc::now()),
                    Some(crate::GIT_HASH.to_string()),
                )?;

                let rsg_scope = RiskSignalGroupScope::ScopedVaultId { id: &sv.id };
                RiskSignal::bulk_save_for_scope(
                    conn,
                    rsg_scope,
                    watchlist_result.reason_codes().unwrap_or(vec![]),
                    RiskSignalGroupKind::Aml,
                    false,
                )?;

                let sv = ScopedVault::lock(conn, &sv.id)?;
                let sv_txn = DataLifetime::new_sv_txn(conn, &sv)?;
                UserTimeline::create(conn, &sv_txn, WatchlistCheckInfo { id: wc.id })?;

                let error = match wc.status_details {
                    WatchlistCheckStatus::Error(e) => Some(e),
                    _ => None,
                };
                let webhook_event = WebhookEvent::WatchlistCheckCompleted(WatchlistCheckCompletedPayload {
                    fp_id: sv.fp_id.clone(),
                    timestamp: Utc::now(),
                    status: wc.status,
                    error,
                    is_live: sv.is_live,
                });
                let task_data = sv.webhook_event(webhook_event);
                Task::create(conn, Utc::now(), task_data)?;

                Ok(())
            })
            .await?;

        task::execute_webhook_tasks(state.clone());

        Ok(())
    }
}

impl WatchlistCheckTask {
    pub fn create_new_watchlist_check(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        task_id: &TaskId,
        sv: &ScopedVault,
        uvw: &VaultWrapper<Person>,
    ) -> FpResult<WatchlistCheck> {
        let has_onboarding_in_non_pass_status =
            !uvw.vault.is_created_via_api && sv.status != OnboardingStatus::Pass;
        let status = if !sv.is_live {
            WatchlistCheckStatus::NotNeeded(WatchlistCheckNotNeededReason::VaultNotLive)
        } else if has_onboarding_in_non_pass_status {
            WatchlistCheckStatus::NotNeeded(WatchlistCheckNotNeededReason::VaultOffboarded)
        } else {
            WatchlistCheckStatus::Pending
        };

        // If we are not NotNeeded, then we create a DI for the impending vendor call(s)
        let di_id = if matches!(status, WatchlistCheckStatus::Pending) {
            let di = DecisionIntent::create(conn, DecisionIntentKind::WatchlistCheck, sv_id, None)?;
            Some(di.id)
        } else {
            None
        };
        WatchlistCheck::create(conn, sv_id.clone(), task_id.clone(), di_id, status)
    }
}
