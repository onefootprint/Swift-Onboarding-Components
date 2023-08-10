use super::{
    map_to_api_err, save_incode_verification_result, AddSelfie, IncodeStateTransition,
    SaveVerificationResultArgs, VerificationSession,
};
use crate::decision::vendor::incode::state::StateResult;
use crate::decision::vendor::incode::IncodeContext;
use crate::errors::{ApiResult, AssertionError};
use crate::vendor_clients::IncodeClients;
use async_trait::async_trait;
use db::models::user_consent::UserConsent;
use db::{DbPool, TxnPgConn};
use idv::incode::doc::{IncodeAddMLConsentRequest, IncodeAddPrivacyConsentRequest};
use newtypes::VendorAPI;

/// Add Consent
pub struct AddConsent {}

#[async_trait]
impl IncodeStateTransition for AddConsent {
    async fn run(
        db_pool: &DbPool,
        clients: &IncodeClients,
        ctx: &IncodeContext,
        session: &VerificationSession,
    ) -> ApiResult<Option<Self>> {
        if ctx.docv_data.selfie_image.is_none() {
            // Since consent is collected at the same time as the selfie image, don't run if it
            // isn't provided
            return Ok(None);
        };
        let sv_id = ctx.sv_id.clone();
        let consent = db_pool
            .db_query(move |conn| UserConsent::latest(conn, &sv_id))
            .await??
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
    ) -> ApiResult<StateResult> {
        let next = AddSelfie::new();
        Ok(next.into())
    }
}
