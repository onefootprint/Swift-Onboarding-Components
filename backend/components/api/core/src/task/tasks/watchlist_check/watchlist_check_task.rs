use crate::decision::vendor;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::errors::AssertionError;
use crate::task::{ExecuteTask, TaskError};
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use crate::{task, ApiError, State};
use async_trait::async_trait;
use chrono::Utc;
use db::models::risk_signal::{NewRiskSignalInfo, RiskSignal};
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::user_timeline::UserTimeline;
use db::models::workflow::Workflow;
use db::models::{
    decision_intent::DecisionIntent, task::Task, verification_request::VerificationRequest,
    watchlist_check::WatchlistCheck,
};
use db::{DbResult, TxnPgConn};
use newtypes::{
    DecisionIntentKind, EnhancedAmlOption, FireWebhookArgs, OnboardingStatus, RiskSignalGroupKind,
    ScopedVaultId, TaskData, TaskId, VendorAPI, WatchlistCheckArgs, WatchlistCheckCompletedPayload,
    WatchlistCheckError, WatchlistCheckInfo, WatchlistCheckNotNeededReason, WatchlistCheckStatus,
    WatchlistCheckStatusKind, WebhookEvent,
};

use super::{idology, incode};

pub(crate) struct WatchlistCheckTask {
    state: State,
    task_id: TaskId,
}

impl WatchlistCheckTask {
    pub fn new(state: State, task_id: TaskId) -> Self {
        Self { state, task_id }
    }
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
    async fn execute(&self, args: &WatchlistCheckArgs) -> Result<(), TaskError> {
        let sv_id = args.scoped_vault_id.clone();
        let task_id = self.task_id.clone();

        // First we either create a new watchlist_check or we retrieve an existing one (ie if this is an idempotent re-run of a failed execution)
        // If we create a new watchlist_check, we either:
        //  - Create it with state Pending and a decision_intent is created at the same time
        //  - Create it with state NotNeeded and no decision_intent is written, meaning no vendor call is to be made
        let (tenant, sv, obc, uvw, wc, existing_vendor_results) = self
            .state
            .db_pool
            .db_transaction(move |conn| -> Result<_, TaskError> {
                // not strictly needed since we ever only execute a single task 1 at a time, but nice to be extra safe
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

                // Get OBC for this scoped vault. This is a little funky now because you can theoretically onboard only multiple Workflow's and each could have a different OBC
                // For now, we take the first completed WF by completed_at where enhanced_aml = Yes. If none of the WF's have enhanced AML, then we just take the first OBC (which should only happen for Fractional)
                let wfs = Workflow::list_by_completed_at(conn, &sv.id)?;
                let obc = if let Some((_, obc)) = wfs.iter().find(|(_, obc)| {
                    obc.as_ref()
                        .map(|o| {
                            matches!(
                                &o.enhanced_aml,
                                EnhancedAmlOption::Yes {
                                    ofac: _,
                                    pep: _,
                                    adverse_media: _,
                                    continuous_monitoring: _,
                                    adverse_media_lists: _
                                }
                            )
                        })
                        .unwrap_or(false)
                }) {
                    obc.clone()
                } else {
                    wfs.first().and_then(|(_, obc)| obc.clone())
                };

                let existing_vendor_results = if let Some(di_id) = wc.decision_intent_id.as_ref() {
                    VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, di_id)?
                } else {
                    vec![]
                };

                Ok((tenant, sv, obc, uvw, wc, existing_vendor_results))
            })
            .await?;

        // WC is initialized to either Pending or NotNeeded.
        // Pass/Fail/Error indicate this Task already completed and we wrote that final state in the final txn in this Task. (Theoretically should never hit this case unless there was some system error right between the last txn of this Task and the txn that sets the Task's status to completed)
        // Hence, if the status here is not Pending, we can just immediatly return
        if !matches!(wc.status, WatchlistCheckStatusKind::Pending) {
            return Ok(());
        }
        let di_id = wc.decision_intent_id.ok_or(ApiError::from(AssertionError(
            "Expected watchlist_check.decision_intent_id to be non-null",
        )))?;

        let watchlist_result = match (&obc, obc.as_ref().map(|o| o.enhanced_aml.clone())) {
            // Idology
            (None, _) | (Some(_), None) | (_, Some(EnhancedAmlOption::No)) => {
                // logic that enqeues this Task should prevent this, but extra precaution
                if !tenant.id.is_fractional() {
                    tracing::error!(%tenant.id, obc_id=obc.map(|o| o.id.to_string()).unwrap_or_default(),"WatchlistCheckTask run with an obc with enhanced_aml=No on a non-Fractional tenant");
                }
                // TODO: make a util for this common Vec<RequestAndMaybeResult> -> maps logic
                let existing_vendor_results = VendorResult::hydrate_vendor_results(
                    existing_vendor_results,
                    &self.state.enclave_client,
                    &uvw.vault.e_private_key,
                )
                .await?;
                let vendor_results: Vec<VendorResult> = existing_vendor_results
                    .into_iter()
                    .flat_map(|r| r.into_vendor_result())
                    .collect();

                let existing_vres_map =
                    vendor::vendor_api::vendor_api_response::build_vendor_response_map_from_vendor_results(
                        &vendor_results,
                    )?;
                if idv::requirements::vendor_api_requirements_are_satisfied(
                    &VendorAPI::IdologyPa,
                    uvw.populated().as_slice(),
                ) {
                    let reason_codes = idology::complete_vendor_call(
                        &self.state,
                        &sv.id,
                        &di_id,
                        &tenant.id,
                        existing_vres_map,
                    )
                    .await?;
                    WatchlistVendorResult::Completed(reason_codes)
                } else {
                    WatchlistVendorResult::InsufficientData
                }
            }
            // Incode
            (
                Some(obc),
                Some(EnhancedAmlOption::Yes {
                    ofac: _,
                    pep: _,
                    adverse_media: _,
                    continuous_monitoring,
                    adverse_media_lists: _,
                }),
            ) => {
                // logic that enqeues this Task should prevent this, but extra precaution
                if !continuous_monitoring {
                    return Err(ApiError::from(AssertionError(format!("WatchlistCheckTask run with an obc enhanced_aml.continuous_monitoring = false: {}, {}",tenant.id, obc.id).as_str())).into());
                }
                if idv::requirements::vendor_api_requirements_are_satisfied(
                    &VendorAPI::IncodeWatchlistCheck,
                    uvw.populated().as_slice(),
                ) {
                    let reason_codes =
                        incode::complete_vendor_call(&self.state, &sv.id, &di_id, obc, &uvw).await?;
                    WatchlistVendorResult::Completed(reason_codes)
                } else {
                    WatchlistVendorResult::InsufficientData
                }
            }
        };

        // Save final status, write timeline event, and enqueue webhook task
        let vault_id = uvw.vault().id.clone();
        let wc_id = wc.id.clone();
        self.state
            .db_pool
            .db_transaction(move |conn| -> DbResult<()> {
                // not strictly necessarily since we aren't currently running multiple instances of a single Task concurrently, but doesnt hurt
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

                RiskSignal::bulk_create(
                    conn,
                    &sv.id,
                    watchlist_result.reason_codes().unwrap_or(vec![]),
                    RiskSignalGroupKind::Aml,
                    false,
                )?;

                UserTimeline::create(conn, WatchlistCheckInfo { id: wc.id }, vault_id, sv.id.clone())?;

                let error = match wc.status_details {
                    WatchlistCheckStatus::Error(e) => Some(e),
                    _ => None,
                };
                let webhook_event = WebhookEvent::WatchlistCheckCompleted(WatchlistCheckCompletedPayload {
                    fp_id: sv.fp_id.clone(),
                    footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                    timestamp: Utc::now(),
                    status: wc.status,
                    error,
                });
                let task_data = TaskData::FireWebhook(FireWebhookArgs {
                    scoped_vault_id: sv.id.clone(),
                    tenant_id: tenant.id.clone(),
                    is_live: sv.is_live,
                    webhook_event,
                });
                Task::create(conn, Utc::now(), task_data)?;

                Ok(())
            })
            .await?;

        task::execute_webhook_tasks(self.state.clone());

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
    ) -> DbResult<WatchlistCheck> {
        let has_onboarding_in_non_pass_status =
            !uvw.vault.is_created_via_api && sv.status != Some(OnboardingStatus::Pass);
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
