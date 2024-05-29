use super::{
    IncodeStateTransition,
    ProcessId,
    VerificationSession,
};
use crate::decision::vendor::incode::state::{
    IncodeState,
    TransitionResult,
};
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::map_to_api_error;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::errors::{
    ApiResult,
    AssertionError,
};
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::models::document::{
    Document,
    DocumentUpdate,
};
use db::models::user_consent::UserConsent;
use db::{
    DbPool,
    TxnPgConn,
};
use idv::incode::doc::{
    IncodeAddMLConsentRequest,
    IncodeAddPrivacyConsentRequest,
};
use newtypes::{
    DocumentId,
    DocumentReviewStatus,
    DocumentStatus,
    VendorAPI,
};

/// Add Consent
pub struct AddConsent {}

impl AddConsent {
    pub fn enter(conn: &mut TxnPgConn, id_doc_id: &DocumentId) -> ApiResult<()> {
        // Update Document to status = complete so we clear the Bifrost req
        // TODO: we are setting status to complete here but set completed_seqno later- is that gunna cause
        // any problems?? It would actually be nice to write the timeline event, vault the docs, etc
        // here but it sounds like the problem is our DI data model requires us to know the doc type and we
        // can't confirm that until the processing part of the flow is complete
        let update = DocumentUpdate {
            status: Some(DocumentStatus::Complete),
            review_status: Some(DocumentReviewStatus::PendingMachineReview),
            ..Default::default()
        };
        Document::update(conn, id_doc_id, update)?;
        Ok(())
    }
}

#[async_trait]
impl IncodeStateTransition for AddConsent {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        let wf_id = ctx.wf_id.clone();
        let consent = db_pool
            .db_query(move |conn| UserConsent::get_for_workflow(conn, &wf_id))
            .await?
            .ok_or(AssertionError("User consent not found"))?;
        let privacy_request = IncodeAddPrivacyConsentRequest {
            credentials: session.credentials.clone(),
            title: "Service Consent".into(),
            content: consent.consent_language_text,
        };

        let ml_request = IncodeAddMLConsentRequest {
            credentials: session.credentials.clone(),
            status: consent.ml_consent,
        };

        // Make requests to incode
        let privacy_res = clients
            .incode_add_privacy_consent
            .make_request(privacy_request)
            .await;
        let ml_res = clients.incode_add_ml_consent.make_request(ml_request).await;

        // Save our result
        let privacy_args =
            SaveVerificationResultArgs::from(&privacy_res, VendorAPI::IncodeAddPrivacyConsent, ctx);
        let ml_args = SaveVerificationResultArgs::from(&ml_res, VendorAPI::IncodeAddMlConsent, ctx);

        privacy_args.save(db_pool).await?;
        ml_args.save(db_pool).await?;

        // Now ensure we don't have an error
        privacy_res
            .map_err(map_to_api_error)?
            .result
            .into_success()
            .map_err(map_to_api_error)?;

        ml_res
            .map_err(map_to_api_error)?
            .result
            .into_success()
            .map_err(map_to_api_error)?;
        Ok(Some(Self {}))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<TransitionResult> {
        let next = Self::next_state(session);
        Ok(next.into())
    }

    // We always add consent, so if this is a selfie, continue, or poll
    fn next_state(_: &VerificationSession) -> IncodeState {
        ProcessId::new()
    }
}
