use crate::auth::ob_config::ObConfigAuth;
use crate::auth::Either;
use crate::utils::db2api::DbToApi;
use crate::State;
use api_core::auth::user::UserAuthContext;
use api_core::auth::Any;
use api_core::errors::onboarding::OnboardingError;
use api_core::types::ModernApiResult;
use db::models::appearance::Appearance;
use db::models::tenant_client_config::TenantClientConfig;
use db::DbResult;
use macros::route_alias;
use paperclip::actix::{
    api_v2_operation,
    get,
    web,
};

#[route_alias(get(
    "/org/onboarding_config",
    tags(Onboarding, Deprecated),
    description = "Fetch an onboarding configuration",
))] // TODO: remove alias once we migrate the endpoints
#[api_v2_operation(
    tags(Onboarding, Organization, Hosted),
    description = "Get the details of an onboarding configuration."
)]
#[get("/hosted/onboarding/config")]
pub fn get(
    state: web::Data<State>,
    auth: Either<ObConfigAuth, UserAuthContext>,
) -> ModernApiResult<api_wire_types::PublicOnboardingConfiguration> {
    let (tenant, ob_config) = match auth {
        Either::Left(ob_pk_auth) => {
            // Support auth that identifies an ob config
            let tenant = ob_pk_auth.tenant().clone();
            let ob_config = ob_pk_auth.ob_config().clone();
            (tenant, ob_config)
        }
        Either::Right(user_auth) => {
            // Also take in a user auth token that has the onboarding scope that identifies an ob
            // config
            let user_auth = user_auth.check_guard(Any)?;
            let ob_config = user_auth.ob_config().ok_or(OnboardingError::NoObConfig)?.clone();
            let tenant = user_auth.tenant().ok_or(OnboardingError::NoObConfig)?.clone();
            (tenant, ob_config)
        }
    };

    let tenant_id = tenant.id.clone();
    let appearance_id = ob_config.appearance_id.clone();
    let is_live = ob_config.is_live;

    // get other properties of our configuration relevant to rendering it
    let (appearance, client_config) = state
        .db_pool
        .db_query(move |conn| -> DbResult<_> {
            let appearance = if let Some(appearance_id) = appearance_id {
                Some(Appearance::get(conn, &appearance_id, &tenant_id)?)
            } else {
                None
            };
            let client_config = TenantClientConfig::get(conn, &tenant_id, is_live)?;

            Ok((appearance, client_config))
        })
        .await?;

    let ff_client = state.ff_client.clone();

    Ok(api_wire_types::PublicOnboardingConfiguration::from_db((
        ob_config,
        tenant,
        client_config,
        appearance,
        ff_client,
    )))
}
