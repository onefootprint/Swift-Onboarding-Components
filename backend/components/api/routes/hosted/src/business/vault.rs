use std::collections::HashMap;

use crate::auth::user::{UserAuthContext, UserAuthScopeDiscriminant};
use crate::errors::user::UserError;
use crate::errors::ApiResult;
use crate::types::{EmptyResponse, JsonApiResponse};
use crate::utils::vault_wrapper::checks::pre_add_data_checks;
use crate::utils::vault_wrapper::{Business, VaultWrapper};
use crate::State;
use api_core::auth::ob_config::BoSession;
use api_core::types::ResponseData;
use api_core::utils::session::AuthSession;
use db::models::scoped_vault::ScopedVault;
use db::DbResult;
use newtypes::put_data_request::RawDataRequest;
use newtypes::{BusinessOwnerKind, ParseOptions, SessionAuthToken};
use paperclip::actix::Apiv2Schema;
use paperclip::actix::{self, api_v2_operation, web, web::Json};

#[api_v2_operation(
    description = "Checks if provided vault data is valid before adding it to the business vault",
    tags(Hosted, Vault, Businesses)
)]
#[actix::post("/hosted/business/vault/validate")]
pub async fn post_validate(
    state: web::Data<State>,
    user_auth: UserAuthContext,
    request: Json<RawDataRequest>,
) -> JsonApiResponse<EmptyResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    request.assert_no_id_data()?;
    let request = request.manual_fingerprints(HashMap::new()); // No fingerprints to check speculatively
    let bvw = state
        .db_pool
        .db_query(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let sb_id = user_auth
                .scoped_business_id()
                .ok_or(UserError::NotAllowedWithoutBusiness)?;
            let bvw = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            Ok(bvw)
        })
        .await??;
    bvw.validate_request(request)?;

    EmptyResponse::ok().json()
}

#[derive(Debug, Clone, Apiv2Schema, serde::Serialize)]
pub struct TemporaryResponse {
    tokens: Vec<SessionAuthToken>,
}

#[api_v2_operation(
    description = "Updates data in a business vault. Can be used to update `business.` data",
    tags(Hosted, Vault, Businesses)
)]
#[actix::put("/hosted/business/vault")]
pub async fn put(
    state: web::Data<State>,
    request: Json<RawDataRequest>,
    user_auth: UserAuthContext,
) -> JsonApiResponse<TemporaryResponse> {
    let user_auth = user_auth.check_permissions(vec![UserAuthScopeDiscriminant::Business])?;
    let request = request
        .into_inner()
        .clean_and_validate(ParseOptions::for_bifrost())?;
    let request = request.build_fingerprints(&state.hmac_client).await?;
    let scoped_business_id = user_auth
        .scoped_business_id()
        .ok_or(UserError::NotAllowedWithoutBusiness)?;

    let (secondary_bos, sv) = state
        .db_pool
        .db_transaction(move |conn| -> ApiResult<_> {
            pre_add_data_checks(&user_auth, conn)?;
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &scoped_business_id)?;
            let secondary_bos = bvw.put_business_data(conn, request)?;
            let sv = ScopedVault::get(conn, &scoped_business_id)?;
            Ok((secondary_bos, sv))
        })
        .await?;

    // If we created any BOs in the DB, create an auth session for each of the BOs - we will send
    // this token in a link to each BO
    use chrono::Duration;
    let ob_config_id = sv
        .ob_configuration_id
        .clone()
        .ok_or(UserError::NotAllowedWithoutTenant)?;
    // TODO what happens when the session expires? similar to email link
    let duration = Duration::days(30);
    let auth_token_futs = secondary_bos
        .into_iter()
        .filter(|bo| bo.kind == BusinessOwnerKind::Secondary)
        .map(|bo| BoSession {
            bo_id: bo.id,
            ob_config_id: ob_config_id.clone(),
        })
        .map(|d| AuthSession::create(&state, d.into(), duration));
    // TODO batch this
    let tokens = futures::future::join_all(auth_token_futs)
        .await
        .into_iter()
        .collect::<DbResult<Vec<_>>>()?;

    // TODO don't return these via API
    ResponseData::ok(TemporaryResponse { tokens }).json()
}
