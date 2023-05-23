use super::{
    map_to_api_err, save_incode_verification_result, AddFront, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::state_machines::incode_state_machine::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::ApiResult;
use crate::ApiError;
use async_trait::async_trait;
use db::models::incode_verification_session::{IncodeVerificationSession, UpdateIncodeVerificationSession};
use db::DbPool;
use db::{models::user_consent::UserConsent, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::{IncodeAddMLConsentRequest, IncodeAddPrivacyConsentRequest};
use newtypes::{IncodeVerificationSessionState, VendorAPI};

/// Add Consent
pub struct AddConsent {
    pub session: VerificationSession,
    pub user_consent_text: String,
}

impl AddConsent {
    pub fn enter(conn: &mut TxnPgConn, ctx: &IncodeContext, session: VerificationSession) -> ApiResult<Self> {
        // we need consent in order to proceed, so we error
        let consent = UserConsent::latest_for_scoped_vault(conn, &ctx.sv_id)?
            .ok_or(ApiError::AssertionError("User consent not found".into()))?;

        Ok(Self {
            session,
            user_consent_text: consent.consent_language_text,
        })
    }
}

#[async_trait]
impl IncodeStateTransition for AddConsent {
    async fn run(
        self,
        db_pool: &DbPool,
        footprint_http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
    ) -> Result<IncodeState, ApiError> {
        let privacy_request = IncodeAddPrivacyConsentRequest {
            credentials: self.session.credentials.clone(),
            title: "Service Consent".into(),
            content: self.user_consent_text,
        };
        // TODO this should be separated out from privacy in bifrost
        let ml_request = IncodeAddMLConsentRequest {
            credentials: self.session.credentials.clone(),
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
        let next_state = db_pool
            .db_transaction(move |conn| -> ApiResult<IncodeState> {
                let update =
                    UpdateIncodeVerificationSession::set_state(IncodeVerificationSessionState::AddFront);

                IncodeVerificationSession::update(conn, &self.session.id, update)?;

                let next = AddFront {
                    session: self.session,
                }
                .into();

                Ok(next)
            })
            .await?;
        Ok(next_state)
    }
}
