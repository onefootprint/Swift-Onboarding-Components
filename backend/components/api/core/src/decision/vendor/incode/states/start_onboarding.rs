use super::AddFront;
use super::IncodeStateTransition;
use crate::decision::vendor::incode::IncodeContext;
use crate::decision::vendor::into_fp_error;
use crate::decision::vendor::verification_result::SaveVerificationResultArgs;
use crate::FpResult;
use crate::State;
use db::models::incode_verification_session::IncodeVerificationSession;
use db::models::incode_verification_session::UpdateIncodeVerificationSession;
use idv::incode::request::OnboardingStartCustomNameFields;
use idv::incode::IncodeStartOnboardingRequest;
use newtypes::vendor_credentials::IncodeCredentials;
use newtypes::IncodeAuthorizationToken;
use newtypes::IncodeConfigurationId;
use newtypes::IncodeSessionId;
use newtypes::VendorAPI;

/// This is weird - it's not a real state like all of the others. Just groups together some logic
/// to initialize the state machine
pub struct StartOnboarding {}

impl StartOnboarding {
    pub async fn run(
        state: &State,
        ctx: &IncodeContext,
        incode_session: IncodeVerificationSession,
        incode_credentials: IncodeCredentials,
        configuration_id: IncodeConfigurationId,
    ) -> FpResult<()> {
        //
        // make the request to incode
        //
        // TODO: we need to be able to error if the fn/ln is missing and we need it
        let custom_name_fields = OnboardingStartCustomNameFields {
            first_name: ctx.docv_data.first_name.clone(),
            last_name: ctx.docv_data.last_name.clone(),
        };
        let request = IncodeStartOnboardingRequest {
            credentials: incode_credentials.clone(),
            configuration_id: configuration_id.clone(),
            session_id: None,
            custom_name_fields: Some(custom_name_fields),
        };
        let res = state
            .vendor_clients
            .incode
            .incode_start_onboarding
            .make_request(request)
            .await;

        //
        // Save our result
        //
        let args = SaveVerificationResultArgs::from(&res, VendorAPI::IncodeStartOnboarding, ctx);
        args.save(&state.db_pool).await?;

        // Now ensure we don't have an error
        // If we get an error here, the response does not include interviewId or anything else, so we just
        // error here and will restart
        let successful_response = res
            .map_err(into_fp_error)?
            .result
            .into_success()
            .map_err(into_fp_error)?;

        state
            .db_pool
            .db_transaction(move |conn| -> FpResult<_> {
                let ivs = IncodeVerificationSession::lock(conn, &incode_session.id)?;
                let next_state = AddFront::new();

                // Update our state to the next stage, saving the auth token needed for all other
                // states
                let update = UpdateIncodeVerificationSession::set_state_and_incode_session_and_token(
                    next_state.name(),
                    IncodeSessionId::from(successful_response.interview_id),
                    IncodeAuthorizationToken::from(successful_response.token.leak_to_string()),
                );
                IncodeVerificationSession::update(ivs, conn, update)?;

                Ok(())
            })
            .await?;

        Ok(())
    }
}
