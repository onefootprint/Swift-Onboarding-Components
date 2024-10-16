use actix_web::web;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::AuthError;
use api_core::errors::AssertionError;
use api_core::errors::ValidationError;
use api_core::types::ApiResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use db::models::business_owner::BusinessOwner;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::ValidateArgs;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use std::collections::HashMap;

#[api_v2_operation(
    description = "Update a business owner's information",
    tags(Businesses, Hosted)
)]
#[patch("/hosted/business/owners/{id}")]
pub async fn patch(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    link_id: web::Path<BoLinkId>,
    request: web::Json<api_wire_types::UpdateHostedBusinessOwnerRequest>,
) -> ApiResponse<api_wire_types::HostedBusinessOwner> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
    let is_live = user_auth.scoped_user.is_live;
    let source = user_auth.user_session.dl_source();
    let link_id = link_id.into_inner();
    let api_wire_types::UpdateHostedBusinessOwnerRequest {
        data,
        ownership_stake,
    } = request.into_inner();

    // Add the business owner's link_id to every DI
    let data: HashMap<_, _> = data
        .into_iter()
        .map(|(k, v)| (BDK::bo_data(link_id.clone(), k).into(), v))
        .collect();
    let PatchDataRequest { updates, .. } =
        PatchDataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(is_live))?;
    let updates = FingerprintedDataRequest::build(&state, updates, &sb_id).await?;
    let uv_id = user_auth.user().id.clone();

    let (bvw, link_id) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            // Check ownership of the provided BO
            let bo = BusinessOwner::get(conn, (&bvw.vault.id, &link_id))?;

            let can_update_bo =
                bo.user_vault_id.is_none() || bo.user_vault_id.as_ref().is_some_and(|uv| uv == &uv_id);
            if !can_update_bo {
                return ValidationError(
                    "This business owner is already linked to a user and cannot be updated",
                )
                .into();
            }

            if let Some(stake) = ownership_stake {
                BusinessOwner::update_ownership_stake(conn, &bvw.vault.id, &link_id, stake as i32)?;
            }

            if !updates.is_empty() {
                if bo.user_vault_id.is_some() {
                    // TODO at some point we could load the user's vault and update it here
                    return ValidationError("Cannot yet update data for a BO that is linked to a user")
                        .into();
                }
                bvw.patch_data(conn, updates, DataRequestSource::HostedPatchVault(source.into()))?;
            }

            // Reload the VW to get the updated BO
            let bvw = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            Ok((bvw, link_id))
        })
        .await?;

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let updated_bo = dbos
        .into_iter()
        .find(|bo| bo.bo.link_id == link_id)
        .ok_or(AssertionError("Cannot find updated BO"))?;
    let result = api_wire_types::HostedBusinessOwner::from_db((updated_bo, &user_auth));
    Ok(result)
}
