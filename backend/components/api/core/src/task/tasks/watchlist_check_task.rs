use crate::decision::vendor;
use crate::decision::vendor::vendor_trait::VendorAPIResponse;
use crate::utils::vault_wrapper::{Person, VaultWrapper, VwArgs};
use crate::{
    decision::{self, vendor::vendor_trait::VendorAPICall},
    enclave_client::EnclaveClient,
    task::{ExecuteTask, TaskError},
};
use async_trait::async_trait;
use chrono::Utc;
use db::models::onboarding::Onboarding;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use db::models::verification_request::RequestAndMaybeResult;
use db::models::watchlist_check::UpdateWatchlistCheck;
use db::{
    models::{
        decision_intent::DecisionIntent, task::Task, verification_request::VerificationRequest,
        verification_result::VerificationResult, watchlist_check::WatchlistCheck,
    },
    DbError, DbPool, PgConn,
};
use idv::idology::expectid::response::PaWatchlistHit;
use idv::idology::pa::response::PaResponse;
use idv::{
    idology::pa::{IdologyPaAPIResponse, IdologyPaRequest},
    VendorResponse,
};
use newtypes::{
    DecisionIntentKind, EncryptedVaultPrivateKey, FootprintReasonCode, OnboardingStatus, ScopedVaultId,
    TaskId, VaultPublicKey, VendorAPI, WatchlistCheckArgs, WatchlistCheckStatus,
};

pub(crate) struct WatchlistCheckTask {
    db_pool: DbPool,
    task_id: TaskId,
    enclave_client: EnclaveClient,
    idology_client: Box<
        dyn VendorAPICall<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error> + Send + Sync,
    >,
}

impl WatchlistCheckTask {
    pub fn new(
        db_pool: DbPool,
        task_id: TaskId,
        enclave_client: EnclaveClient,
        idology_client: Box<
            dyn VendorAPICall<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>
                + Send
                + Sync,
        >,
    ) -> Self {
        Self {
            db_pool,
            task_id,
            enclave_client,
            idology_client,
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
        let (uvw, (wc, vr)) = self
            .db_pool
            .db_transaction(move |conn| -> Result<_, TaskError> {
                // not strictly needed since we ever only execute a single task 1 at a time, but nice to be extra safe
                let _task = Task::lock(conn, &task_id)?;
                let uvw = VaultWrapper::<Person>::build(conn, VwArgs::Tenant(&sv_id))?;
                let existing_wc = WatchlistCheckTask::get_existing_watchlist_check(conn, &task_id)?;

                let wc = if let Some(wc) = existing_wc {
                    wc
                } else {
                    let sv = ScopedVault::get(conn, &sv_id)?;
                    let ob = if sv.ob_configuration_id.is_some() {
                        let (ob, _, _, _) = Onboarding::get(conn, (&sv_id, &sv.user_vault_id))?;
                        Some(ob)
                    } else {
                        // vault-only vaults do not have an onboarding
                        None
                    };

                    WatchlistCheckTask::create_new_watchlist_check(conn, &sv_id, &task_id, &sv, &ob, &uvw)?
                };

                Ok((uvw, wc))
            })
            .await?;

        // We have a watchlist_check that is Pending and either needs a vendor call made or decisioning
        if let Some((vreq, vres)) = vr {
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
                Self::make_vendor_call(
                    &self.db_pool,
                    &self.enclave_client,
                    &self.idology_client,
                    &vreq,
                    &svid,
                )
                .await?
            };

            let pa_res = PaResponse::try_from(vendor_response.response)?;
            let (status, reason_codes) = Self::calculate_decision(pa_res);
            let _updated_wc = self
                .db_pool
                .db_query(move |conn| {
                    let update = UpdateWatchlistCheck {
                        status,
                        logic_git_hash: Some(crate::GIT_HASH.to_string()),
                        reason_codes,
                        completed_at: Some(Utc::now()),
                    };
                    WatchlistCheck::update(conn, &wc.id, update)
                })
                .await??;
        } // else we have a watchlist_check that doesn't need a vendor call because it is NotNeed or Error

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
            let req = VerificationRequest::list_by_decision_intent_id(conn, &wc.decision_intent_id)?.pop();

            if let Some((vreq, vres, _)) = req {
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
        conn: &mut PgConn,
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

        let status = if has_non_pass_onboarding_status || !sv.is_live {
            WatchlistCheckStatus::NotNeeded
        } else if !requirements_satisfied {
            WatchlistCheckStatus::Error
        } else {
            WatchlistCheckStatus::Pending
        };

        // TODO: make DI optional on watchlist_check and only create if creating a vreq
        let decision_intent = DecisionIntent::create(conn, DecisionIntentKind::WatchlistCheck, sv_id)?;
        let wc = WatchlistCheck::create(conn, sv_id.clone(), task_id.clone(), decision_intent.id, status)?;

        if matches!(
            status,
            WatchlistCheckStatus::NotNeeded | WatchlistCheckStatus::Error
        ) {
            Ok((wc, None))
        } else {
            let vreq =
                VerificationRequest::create(conn, sv_id, &wc.decision_intent_id, VendorAPI::IdologyPa)?;
            Ok((wc, Some((vreq, None))))
        }
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
        idology_client: &Box<
            dyn VendorAPICall<IdologyPaRequest, IdologyPaAPIResponse, idv::idology::error::Error>
                + Send
                + Sync,
        >,
        vreq: &VerificationRequest,
        sv_id: &ScopedVaultId,
    ) -> Result<VendorResponse, TaskError> {
        let idv_data = decision::vendor::build_request::build_idv_data_from_verification_request(
            db_pool,
            enclave_client,
            vreq.clone(),
        )
        .await?;

        let res = idology_client.make_request(IdologyPaRequest { idv_data }).await?;

        let vendor_response = VendorResponse {
            response: res.clone().parsed_response(),
            raw_response: res.raw_response(),
        };

        let svid = sv_id.clone();
        let vault_public_key = db_pool
            .db_query(move |conn| -> Result<VaultPublicKey, DbError> {
                let vault = Vault::get(conn, &svid)?;
                Ok(vault.public_key)
            })
            .await??;

        let _vres = decision::vendor::verification_result::save_verification_result(
            db_pool,
            &vec![(vreq.clone(), vendor_response.clone())],
            &vault_public_key,
        )
        .await?
        .pop()
        .ok_or(DbError::RelatedObjectNotFound)?;

        Ok(vendor_response)
    }

    fn calculate_decision(res: PaResponse) -> (WatchlistCheckStatus, Option<Vec<FootprintReasonCode>>) {
        if let Some(restriction) = res.response.restriction {
            let reason_codes = PaWatchlistHit::to_footprint_reason_codes(restriction.watchlists());
            let status = if reason_codes.is_empty() {
                WatchlistCheckStatus::Pass
            } else {
                WatchlistCheckStatus::Fail
            };
            (status, Some(reason_codes))
        } else {
            (WatchlistCheckStatus::Error, None)
        }
    }
}
