use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_api::vendor_api_response::{
    VendorAPIResponseIdentifiersMap, VendorAPIResponseMap,
};
use crate::decision::vendor::vendor_api::vendor_api_struct::IdologyPa;
use crate::decision::vendor::vendor_result::VendorResult;
use crate::decision::vendor::vendor_trait::VendorAPIResponse;
use crate::decision::vendor::{self, verification_result, VendorAPIError};
use crate::errors::{ApiResult, AssertionError};
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use crate::{
    decision::{self},
    task::{ExecuteTask, TaskError},
};
use crate::{task, ApiError, State};
use async_trait::async_trait;
use chrono::Utc;
use db::models::risk_signal::{NewRiskSignalInfo, RiskSignal};
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::verification_result::VerificationResult;
use db::models::{
    decision_intent::DecisionIntent, task::Task, verification_request::VerificationRequest,
    watchlist_check::WatchlistCheck,
};
use db::{DbResult, TxnPgConn};
use idv::idology::expectid::response::PaWatchlistHit;
use idv::idology::pa::response::PaResponse;
use idv::{idology::pa::IdologyPaAPIResponse, VendorResponse};
use newtypes::{
    DecisionIntentId, DecisionIntentKind, FireWebhookArgs, FootprintReasonCode, OnboardingStatus,
    RiskSignalGroupKind, ScopedVaultId, TaskData, TaskId, TenantId, VendorAPI, WatchlistCheckArgs,
    WatchlistCheckCompletedPayload, WatchlistCheckError, WatchlistCheckInfo, WatchlistCheckNotNeededReason,
    WatchlistCheckStatus, WatchlistCheckStatusKind, WebhookEvent,
};

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
        let (tenant, sv, uvw, wc, existing_vendor_results) = self
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

                let existing_vendor_results = if let Some(di_id) = wc.decision_intent_id.as_ref() {
                    VerificationRequest::get_latest_by_vendor_api_for_decision_intent(conn, di_id)?
                } else {
                    vec![]
                };

                Ok((tenant, sv, uvw, wc, existing_vendor_results))
            })
            .await?;

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

        // WC is initialized to either Pending or NotNeeded.
        // Pass/Fail/Error indicate this Task already completed and we wrote that final state in the final txn in this Task. (Theoretically should never hit this case unless there was some system error right between the last txn of this Task and the txn that sets the Task's status to completed)
        // Hence, if the status here is not Pending, we can just immediatly return
        if !matches!(wc.status, WatchlistCheckStatusKind::Pending) {
            return Ok(());
        }
        let di_id = wc.decision_intent_id.ok_or(ApiError::from(AssertionError(
            "Expected watchlist_check.decision_intent_id to be non-null",
        )))?;

        // TODO: later branch here to Idology or Incode based on obc
        let has_sufficient_data_for_vendor = idv::requirements::vendor_api_requirements_are_satisfied(
            &VendorAPI::IdologyPa,
            uvw.populated().as_slice(),
        );
        let watchlist_result = if has_sufficient_data_for_vendor {
            let reason_codes = Self::complete_vendor_call_idology(
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
            uvw.vault.is_portable && sv.status != Some(OnboardingStatus::Pass);
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

    async fn complete_vendor_call_idology(
        state: &State,
        sv_id: &ScopedVaultId,
        di_id: &DecisionIntentId,
        tenant_id: &TenantId,
        existing_vendor_results: (VendorAPIResponseMap, VendorAPIResponseIdentifiersMap),
    ) -> ApiResult<Vec<NewRiskSignalInfo>> {
        let (res_map, ids_map) = existing_vendor_results;
        let (reason_codes, vres_id) =
            if let (Some(res), Some(ids)) = (res_map.get(&IdologyPa), ids_map.get(&IdologyPa)) {
                // we already successfully completed a IdologyPa call for this watchlist task, so just return reason codes from it
                (
                    Self::parse_reason_codes(res.clone())?,
                    ids.verification_result_id.clone(),
                )
            } else {
                let (res, vres) = Self::make_vendor_call(state, sv_id, di_id, tenant_id).await?;
                let pa_res = PaResponse::try_from(res.response)?;
                (Self::parse_reason_codes(pa_res)?, vres.id)
            };

        Ok(reason_codes
            .into_iter()
            .map(|r| (r, VendorAPI::IdologyPa, vres_id.clone()))
            .collect())
    }

    async fn make_vendor_call(
        state: &State,
        sv_id: &ScopedVaultId,
        di_id: &DecisionIntentId,
        tenant_id: &TenantId,
    ) -> ApiResult<(VendorResponse, VerificationResult)> {
        // TODO: consolidate this with make_idv_vendor_call_save_vreq_vres
        let vendor_api = VendorAPI::IdologyPa;
        let svid = sv_id.clone();
        let diid = di_id.clone();
        let vreq = state
            .db_pool
            .db_query(move |conn| VerificationRequest::create(conn, &svid, &diid, vendor_api))
            .await??;
        let idv_data = decision::vendor::build_request::build_idv_data_from_verification_request(
            &state.db_pool,
            &state.enclave_client,
            vreq.clone(),
        )
        .await?;

        let tvc = TenantVendorControl::new(
            tenant_id.clone(),
            &state.db_pool,
            &state.config,
            &state.enclave_client,
        )
        .await?;

        let res: Result<IdologyPaAPIResponse, idv::idology::error::Error> = state
            .vendor_clients
            .idology_pa
            .make_request(tvc.build_idology_pa_request(idv_data))
            .await;

        let res = res
            .map(|r| {
                let parsed_response = r.parsed_response();
                let raw_response = r.raw_response();
                VendorResponse {
                    response: parsed_response,
                    raw_response,
                }
            })
            .map_err(|e| e.into())
            .map_err(|e| VendorAPIError { vendor_api, error: e });

        let svid = sv_id.clone();
        let (res, vres) = state
            .db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let uv = Vault::get(conn, &svid)?;
                let vres = verification_result::save_vres(conn, &uv.public_key, &res, &vreq)?;
                Ok((res, vres))
            })
            .await??;

        Ok((res?, vres))
    }

    fn parse_reason_codes(res: PaResponse) -> ApiResult<Vec<FootprintReasonCode>> {
        if let Some(restriction) = res.response.restriction {
            Ok(PaWatchlistHit::to_footprint_reason_codes(
                restriction.watchlists(),
            ))
        } else {
            // TODO: we really should have .validate() on the raw response validate stuff like this and transform it into a struct without Option's
            Err(ApiError::from(idv::Error::from(
                idv::idology::error::Error::MissingRestrictionField,
            )))
        }
    }
}
