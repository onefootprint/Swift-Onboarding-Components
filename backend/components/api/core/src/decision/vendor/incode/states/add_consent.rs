use super::{
    map_to_api_err, save_incode_verification_result, AddSelfie, IncodeState, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::vendor_trait::VendorAPICall;
use crate::errors::{ApiResult, AssertionError};
use async_trait::async_trait;
use db::models::user_consent::UserConsent;
use db::{DbPool, TxnPgConn};
use idv::footprint_http_client::FootprintVendorHttpClient;
use idv::incode::doc::{IncodeAddMLConsentRequest, IncodeAddPrivacyConsentRequest};
use newtypes::{IncodeFailureReason, VendorAPI};

/// Add Consent
pub struct AddConsent {}

#[async_trait]
impl IncodeStateTransition for AddConsent {
    async fn run(
        db_pool: &DbPool,
        http_client: &FootprintVendorHttpClient,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
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

        // Make requests to incode
        let privacy_res = http_client.make_request(privacy_request).await;
        let ml_res = http_client.make_request(ml_request).await;

        // Save our result
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
        Ok(Some(Self {}))
    }

    fn transition(
        self,
        _: &mut TxnPgConn,
        _: &IncodeContext,
        _: &VerificationSession,
    ) -> ApiResult<(IncodeState, Option<IncodeFailureReason>)> {
        let next = AddSelfie::new();
        Ok((next, None))
    }
}
