use crate::decision::vendor;
use crate::decision::vendor::vendor_trait::VendorAPIResponse;
use crate::{
    decision::{self, vendor::vendor_trait::VendorAPICall},
    enclave_client::EnclaveClient,
    task::{ExecuteTask, TaskError},
};
use async_trait::async_trait;
use db::models::vault::Vault;
use db::{
    models::{
        decision_intent::DecisionIntent, task::Task, verification_request::VerificationRequest,
        verification_result::VerificationResult, watchlist_check::WatchlistCheck,
    },
    DbError, DbPool, DbResult, PgConn,
};
use idv::idology::pa::response::PaResponse;
use idv::{
    idology::pa::{IdologyPaAPIResponse, IdologyPaRequest},
    VendorResponse,
};
use newtypes::{
    DecisionIntentKind, EncryptedVaultPrivateKey, ScopedVaultId, TaskId, VaultPublicKey, VendorAPI,
    WatchlistCheckArgs,
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
        let scoped_vault_id = args.scoped_vault_id.clone();
        let task_id = self.task_id.clone();

        let (_watchlist_check, vreq, vres) = self
            .db_pool
            .db_transaction(move |conn| -> DbResult<_> {
                // not strictly needed since we ever only execute a single task 1 at a time, but nice to be extra safe
                let _task = Task::lock(conn, &task_id)?;

                match Self::get_existing_watchlist_check(conn, &task_id)? {
                    Some((wc, vreq, vres)) => Ok((wc, vreq, vres)),
                    None => {
                        let (wc, vreq) = Self::create_new_watchlist_check(conn, &task_id, &scoped_vault_id)?;
                        Ok((wc, vreq, None))
                    }
                }
            })
            .await?;

        let scoped_vault_id = args.scoped_vault_id.clone();
        let vendor_response = if let Some(vres) = vres {
            Self::get_existing_vendor_response(
                &self.db_pool,
                &self.enclave_client,
                &vreq,
                &vres,
                &scoped_vault_id,
            )
            .await
        } else {
            Self::make_vendor_call(
                &self.db_pool,
                &self.enclave_client,
                &self.idology_client,
                &vreq,
                &scoped_vault_id,
            )
            .await
        }?;

        // TODO: for now, assuming we have a non-error response. In future, need to validate the response and handle errors
        let pa_res = PaResponse::try_from(vendor_response.response)?;
        log::info!("WatchlistCheckTask PaResponse: {:?}", pa_res);
        Ok(())
    }
}

impl WatchlistCheckTask {
    fn get_existing_watchlist_check(
        conn: &mut PgConn,
        task_id: &TaskId,
    ) -> Result<Option<(WatchlistCheck, VerificationRequest, Option<VerificationResult>)>, DbError> {
        let existing_watchlist_check = WatchlistCheck::get_by_task_id(conn, task_id)?;
        if let Some(wc) = existing_watchlist_check {
            let (vreq, vres, _) =
                VerificationRequest::list_by_decision_intent_id(conn, &wc.decision_intent_id)?
                    .pop()
                    .ok_or(DbError::RelatedObjectNotFound)?;

            Ok(Some((wc, vreq, vres)))
        } else {
            Ok(None)
        }
    }

    fn create_new_watchlist_check(
        conn: &mut PgConn,
        task_id: &TaskId,
        scoped_vault_id: &ScopedVaultId,
    ) -> Result<(WatchlistCheck, VerificationRequest), DbError> {
        let decision_intent =
            DecisionIntent::create(conn, DecisionIntentKind::WatchlistCheck, scoped_vault_id)?;

        let verification_request =
            VerificationRequest::create(conn, scoped_vault_id, &decision_intent.id, VendorAPI::IdologyPa)?;

        let watchlist_check = WatchlistCheck::create(
            conn,
            scoped_vault_id.clone(),
            task_id.clone(),
            decision_intent.id.clone(),
        )?;
        Ok((watchlist_check, verification_request))
    }

    async fn get_existing_vendor_response(
        db_pool: &DbPool,
        enclave_client: &EnclaveClient,
        vreq: &VerificationRequest,
        vres: &VerificationResult,
        scoped_vault_id: &ScopedVaultId,
    ) -> Result<VendorResponse, TaskError> {
        let svid = scoped_vault_id.clone();
        let vault_private_key = db_pool
            .db_query(move |conn| -> Result<EncryptedVaultPrivateKey, DbError> {
                let vault = Vault::get(conn, &svid)?;
                Ok(vault.e_private_key)
            })
            .await??;

        let vendor_result = vendor::vendor_result::VendorResult::from_verification_results_for_onboarding(
            vec![(vreq.clone(), Some(vres.clone()))],
            enclave_client,
            &vault_private_key,
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
        verification_request: &VerificationRequest,
        scoped_vault_id: &ScopedVaultId,
    ) -> Result<VendorResponse, TaskError> {
        let idv_data = decision::vendor::build_request::build_idv_data_from_verification_request(
            db_pool,
            enclave_client,
            verification_request.clone(),
        )
        .await?;

        let res = idology_client.make_request(IdologyPaRequest { idv_data }).await?;

        let vendor_response = VendorResponse {
            response: res.clone().parsed_response(),
            raw_response: res.raw_response(),
        };

        let scoped_vault_id = scoped_vault_id.clone();
        let vault_public_key = db_pool
            .db_query(move |conn| -> Result<VaultPublicKey, DbError> {
                let vault = Vault::get(conn, &scoped_vault_id)?;
                Ok(vault.public_key)
            })
            .await??;

        let _vres = decision::vendor::verification_result::save_verification_result(
            db_pool,
            &vec![(verification_request.clone(), vendor_response.clone())],
            &vault_public_key,
        )
        .await?
        .pop()
        .ok_or(DbError::RelatedObjectNotFound)?;

        Ok(vendor_response)
    }
}
