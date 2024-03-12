use api_core::{
    auth::{
        user::{UserAuthContext, UserAuthGuard},
        IsGuardMet,
    },
    errors::ValidationError,
    types::{response::ResponseData, JsonApiResponse},
    State,
};
use api_route_hosted_core::validation_token::create_validation_token;
use api_wire_types::hosted::validate::HostedValidateResponse;
use newtypes::ObConfigurationKind;
use paperclip::actix::{self, api_v2_operation, web};

#[api_v2_operation(
    tags(User, Hosted),
    description = "Generate a validation token after the user finishes the identify flow."
)]
#[actix::post("/hosted/identify/validation_token")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<HostedValidateResponse> {
    let user_auth = user_auth.check_guard(UserAuthGuard::Auth.or(UserAuthGuard::SignUp))?;

    if let Some(obc) = user_auth.ob_config() {
        if obc.kind == ObConfigurationKind::Auth {
            // The auth component doesn't need to fetch an identify validation token - it should
            // just fetch the normal validation token from /hosted/onboarding/validate
            return ValidationError("Cannot invoke this endpoint for an auth playbook").into();
        }
    }

    let validation_token = create_validation_token(&state, user_auth.data, None).await?;
    ResponseData::ok(HostedValidateResponse { validation_token }).json()
}
