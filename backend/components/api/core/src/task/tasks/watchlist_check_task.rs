use std::sync::Arc;

use crate::config::Config;
use crate::decision::vendor;
use crate::decision::vendor::tenant_vendor_control::TenantVendorControl;
use crate::decision::vendor::vendor_trait::VendorAPIResponse;
use crate::errors::ApiResult;
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use crate::utils::webhook_app::IntoWebhookApp;
use crate::vendor_clients::VendorClient;
use crate::{
    decision::{self},
    enclave_client::EnclaveClient,
    task::{ExecuteTask, TaskError},
};
use async_trait::async_trait;
use chrono::Utc;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;
use db::models::tenant::Tenant;
use db::models::user_timeline::UserTimeline;
use db::models::vault::Vault;
use db::models::verification_request::RequestAndMaybeResult;
use db::{
    models::{
        decision_intent::DecisionIntent, task::Task, verification_request::VerificationRequest,
        verification_result::VerificationResult, watchlist_check::WatchlistCheck,
    },
    DbError, DbPool, PgConn,
};
use db::{DbResult, TxnPgConn};
use idv::idology::expectid::response::PaWatchlistHit;
use idv::idology::pa::response::PaResponse;
use idv::{
    idology::pa::{IdologyPaAPIResponse, IdologyPaRequest},
    VendorResponse,
};
use newtypes::{
    DecisionIntentKind, EncryptedVaultPrivateKey, FootprintReasonCode, OnboardingStatus, ScopedVaultId,
    TaskId, TenantId, VendorAPI, WatchlistCheckArgs, WatchlistCheckError, WatchlistCheckInfo,
    WatchlistCheckNotNeededReason, WatchlistCheckStatus, WatchlistCheckStatusKind,
};
use webhooks::events::WebhookEvent;
use webhooks::WebhookClient;

pub(crate) struct WatchlistCheckTask {
    db_pool: DbPool,
    task_id: TaskId,
    enclave_client: EnclaveClient,
    idology_client: VendorClient<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>,
    webhook_client: Arc<dyn WebhookClient>,
    config: Config,
}

impl WatchlistCheckTask {
    pub fn new(
        db_pool: DbPool,
        task_id: TaskId,
        enclave_client: EnclaveClient,
        idology_client: VendorClient<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>,
        webhook_client: Arc<dyn WebhookClient>,
        config: Config,
    ) -> Self {
        Self {
            db_pool,
            task_id,
            enclave_client,
            idology_client,
            webhook_client,
            config,
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
        //  - Create it with state Pending and a decision_intent and verification_request at the same time
        //  - Create it with state NotNeeded or Error and no decision_intent/verification_request, meaning no vendor call is to be made
        let (tenant, sv, uvw, (wc, vr)) = self
            .db_pool
            .db_transaction(move |conn| -> Result<_, TaskError> {
                // not strictly needed since we ever only execute a single task 1 at a time, but nice to be extra safe
                let _task = Task::lock(conn, &task_id)?;
                let sv = ScopedVault::get(conn, &sv_id)?;
                let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv_id))?;
                let existing_wc = WatchlistCheckTask::get_existing_watchlist_check(conn, &task_id)?;
                let tenant = Tenant::get(conn, &sv.tenant_id)?;

                let wc = if let Some(wc) = existing_wc {
                    wc
                } else {
                    let sv = ScopedVault::get(conn, &sv_id)?;
                    let ob = if sv.ob_configuration_id.is_some() {
                        let (ob, _, _, _) = Onboarding::get(conn, (&sv_id, &sv.vault_id))?;
                        Some(ob)
                    } else {
                        // vault-only vaults do not have an onboarding
                        None
                    };

                    WatchlistCheckTask::create_new_watchlist_check(conn, &sv_id, &task_id, &sv, &ob, &uvw)?
                };

                Ok((tenant, sv, uvw, wc))
            })
            .await?;

        // We have a watchlist_check that is Pending and either needs a vendor call made or decisioning
        let wc = if let Some((vreq, vres)) = vr {
            let svid = args.scoped_vault_id.clone();
            let vendor_response = if let Some(vres) = vres {
                Self::decrypt_existing_vendor_response(
                    &uvw.vault().e_private_key,
                    &self.enclave_client,
                    &vreq,
                    &vres,
                )
                .await?
            } else {
                let tenant_id = sv.tenant_id.clone();
                Self::make_vendor_call(
                    &self.db_pool,
                    &self.enclave_client,
                    &self.idology_client,
                    &vreq,
                    &svid,
                    &tenant_id,
                    &self.config,
                )
                .await?
            };

            let pa_res = PaResponse::try_from(vendor_response.response)?;
            let (status, reason_codes) = Self::calculate_decision(pa_res)?;
            let version = Some(crate::GIT_HASH.to_string());
            self.db_pool
                .db_transaction(move |conn| wc.update(conn, status, version, reason_codes, Some(Utc::now())))
                .await?
        } else {
            // else we have a watchlist_check that doesn't need a vendor call because it is NotNeed or Error
            wc
        };

        // If either we did not attempt a vendor call due to a validation error (ie insufficient data in vault) or we did get a vendor result,
        // then write a timeline event + a fire webhook
        if matches!(
            wc.status,
            WatchlistCheckStatusKind::Pass | WatchlistCheckStatusKind::Fail | WatchlistCheckStatusKind::Error
        ) {
            let vault_id = uvw.vault().id.clone();
            let svid = args.scoped_vault_id.clone();
            self.db_pool
                .db_transaction(move |conn| -> DbResult<()> {
                    let ut = UserTimeline::get_by_event_data_id(conn, &svid, wc.id.to_string())?;
                    if ut.is_none() {
                        UserTimeline::create(conn, WatchlistCheckInfo { id: wc.id }, vault_id, svid)?;
                    }
                    Ok(())
                })
                .await?;

            let error = match wc.status_details {
                WatchlistCheckStatus::Error(e) => Some(e),
                _ => None,
            };

            let wh_event =
                WebhookEvent::WatchlistCheckCompleted(webhooks::events::WatchlistCheckCompletedPayload {
                    fp_id: sv.fp_id.clone(),
                    footprint_user_id: tenant.uses_legacy_serialization().then(|| sv.fp_id.clone()),
                    timestamp: Utc::now(),
                    status: wc.status,
                    error,
                });
            self.webhook_client
                .send_event_to_tenant_non_blocking(sv.webhook_app(), wh_event, None);
        }
        Ok(())
    }
}

type WatchlistCheckVreq = (WatchlistCheck, Option<RequestAndMaybeResult>);

impl WatchlistCheckTask {
    pub fn get_existing_watchlist_check(
        conn: &mut PgConn,
        task_id: &TaskId,
    ) -> Result<Option<WatchlistCheckVreq>, TaskError> {
        let existing_watchlist_check = WatchlistCheck::get_by_task_id(conn, task_id)?;
        let wc = if let Some(wc) = existing_watchlist_check {
            let req = if let Some(di) = wc.decision_intent_id.as_ref() {
                VerificationRequest::list(conn, di)?.pop()
            } else {
                None
            };

            if let Some((vreq, vres)) = req {
                Some((wc, Some((vreq, vres))))
            } else {
                Some((wc, None))
            }
        } else {
            None
        };

        Ok(wc)
    }

    pub fn create_new_watchlist_check(
        conn: &mut TxnPgConn,
        sv_id: &ScopedVaultId,
        task_id: &TaskId,
        sv: &ScopedVault,
        ob: &Option<Onboarding>,
        uvw: &VaultWrapper<Person>,
    ) -> Result<WatchlistCheckVreq, TaskError> {
        let requirements_satisfied = idv::requirements::vendor_api_requirements_are_satisfied(
            &VendorAPI::IdologyPa,
            uvw.populated().as_slice(),
        );

        let has_non_pass_onboarding_status = ob
            .as_ref()
            .map(|o| !matches!(o.status, OnboardingStatus::Pass))
            .unwrap_or(false);

        let status = if has_non_pass_onboarding_status {
            WatchlistCheckStatus::NotNeeded(WatchlistCheckNotNeededReason::VaultOffboarded)
        } else if !sv.is_live {
            WatchlistCheckStatus::NotNeeded(WatchlistCheckNotNeededReason::VaultNotLive)
        } else if !requirements_satisfied {
            WatchlistCheckStatus::Error(WatchlistCheckError::RequiredDataNotPresent)
        } else {
            WatchlistCheckStatus::Pending
        };

        let (di_id, vreq) = if matches!(
            status,
            WatchlistCheckStatus::NotNeeded(_) | WatchlistCheckStatus::Error(_)
        ) {
            (None, None)
        } else {
            let di = DecisionIntent::create(conn, DecisionIntentKind::WatchlistCheck, sv_id, None)?;
            let vreq = VerificationRequest::create(conn, sv_id, &di.id, VendorAPI::IdologyPa)?;
            (Some(di.id), Some(vreq))
        };

        let wc = WatchlistCheck::create(conn, sv_id.clone(), task_id.clone(), di_id, status)?;
        Ok((wc, vreq.map(|req| (req, None))))
    }

    async fn decrypt_existing_vendor_response(
        vault_private_key: &EncryptedVaultPrivateKey,
        enclave_client: &EnclaveClient,
        vreq: &VerificationRequest,
        vres: &VerificationResult,
    ) -> Result<VendorResponse, TaskError> {
        let vendor_result = vendor::vendor_result::VendorResult::from_verification_results_for_onboarding(
            vec![(vreq.clone(), Some(vres.clone()))],
            enclave_client,
            vault_private_key,
        )
        .await?
        .pop()
        .ok_or(DbError::RelatedObjectNotFound)?;

        Ok(vendor_result.response)
    }

    #[allow(clippy::borrowed_box)]
    async fn make_vendor_call(
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        idology_client: &VendorClient<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>,
        vreq: &VerificationRequest,
        sv_id: &ScopedVaultId,
        tenant_id: &TenantId,
        config: &Config,
    ) -> Result<VendorResponse, TaskError> {
        let idv_data = decision::vendor::build_request::build_idv_data_from_verification_request(
            db_pool,
            enclave_client,
            vreq.clone(),
        )
        .await?;

        let tenant_vendor_control = TenantVendorControl::new(tenant_id.clone(), db_pool, config).await?;

        let res = idology_client
            .make_request(tenant_vendor_control.build_idology_pa_request(idv_data))
            .await?;

        let vendor_response = VendorResponse {
            response: res.clone().parsed_response(),
            raw_response: res.raw_response(),
        };

        let svid = sv_id.clone();

        let vr = (vreq.clone(), vendor_response.clone());
        let _vres = db_pool
            .db_query(move |conn| -> ApiResult<_> {
                let uv = Vault::get(conn, &svid)?;
                decision::vendor::verification_result::save_verification_result(conn, &vr, &uv.public_key)
            })
            .await??;

        Ok(vendor_response)
    }

    fn calculate_decision(
        res: PaResponse,
    ) -> Result<(WatchlistCheckStatus, Option<Vec<FootprintReasonCode>>), idv::idology::error::Error> {
        if let Some(restriction) = res.response.restriction {
            let reason_codes = PaWatchlistHit::to_footprint_reason_codes(restriction.watchlists());
            let status = if reason_codes.is_empty() {
                WatchlistCheckStatus::Pass
            } else {
                WatchlistCheckStatus::Fail
            };
            Ok((status, Some(reason_codes)))
        } else {
            // TODO: we really should have .validate() on the raw response validate stuff like this and transform it into a struct without Option's
            Err(idv::idology::error::Error::MissingRestrictionField)
        }
    }
}
