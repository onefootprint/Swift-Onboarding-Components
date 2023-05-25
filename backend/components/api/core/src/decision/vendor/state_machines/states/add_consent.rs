use super::{
    map_to_api_err, save_incode_verification_result, AddFront, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::{IncodeContext, IsReady};
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::{ApiResult, AssertionError};
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::models::user_consent::UserConsent;
use db::DbPool;
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::{IncodeAddMLConsentRequest, IncodeAddPrivacyConsentRequest};
use newtypes::{IncodeVerificationSessionState, VendorAPI};

/// Add Consent
pub struct AddConsent {}

#[async_trait]
impl IncodeStateTransition for AddConsent {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<(IncodeState, IsReady)> {
        let sv_id = ctx.sv_id.clone();
        let consent = db_pool
            .db_query(move |conn| UserConsent::latest_for_scoped_vault(conn, &sv_id))
            .await??
            .ok_or(AssertionError("User consent not found"))?;
        let privacy_request = IncodeAddPrivacyConsentRequest {
            credentials: session.credentials.clone(),
            title: "Service Consent".into(),
            content: consent.consent_language_text,
        };
        // TODO this should be separated out from privacy in bifrost
        let ml_request = IncodeAddMLConsentRequest {
            credentials: session.credentials.clone(),
            status: true,
        };

        let privacy_res = footprint_http_client.make_request(privacy_request).await;
        let ml_res = footprint_http_client.make_request(ml_request).await;

        //
        // Save our result
        //
        let privacy_args =
            SaveVerificationResultArgs::from(&privacy_res, VendorAPI::IncodeAddPrivacyConsent, ctx);
        let ml_args = SaveVerificationResultArgs::from(&ml_res, VendorAPI::IncodeAddMLConsent, ctx);

        save_incode_verification_result(db_pool, privacy_args).await?;
        save_incode_verification_result(db_pool, ml_args).await?;

        // Now ensure we don't have an error
        privacy_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        ml_res
            .map_err(map_to_api_err)?
            .result
            .into_success()
            .map_err(map_to_api_err)?;

        //
        // Set up the next state transition
        //
        // Save the next stage's Vreq
        let session_id = session.id.clone();
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<_> {
                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddFront);
                IncodeVerificationSession::update(conn, &session_id, update)?;

                let next = AddFront {};
                Ok(next.into())
            })
            .await?;
        Ok((next_state, true))
    }

    fn is_ready(&self, _: &IncodeContext) -> bool {
        true
    }
}
