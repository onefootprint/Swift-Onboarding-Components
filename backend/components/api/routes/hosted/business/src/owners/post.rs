use crate::State;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::AuthError;
use api_core::errors::AssertionError;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::ApiResponse;
use api_core::FpResult;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::NewSecondaryBo;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use newtypes::UserAuthScope;
use newtypes::ValidateArgs;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::web;
use paperclip::actix::{
    self,
};
use std::collections::HashMap;

#[api_v2_operation(
    description = "Add a new business owner with the provided data and ownership stake",
    tags(Businesses, Hosted)
)]
#[actix::post("/hosted/business/owners")]
pub async fn post(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: web::Json<api_wire_types::CreateHostedBusinessOwnerRequest>,
) -> ApiResponse<api_wire_types::HostedBusinessOwner> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
    let is_live = user_auth.scoped_user.is_live;
    let source = user_auth.user_session.dl_source();
    let api_wire_types::CreateHostedBusinessOwnerRequest {
        data,
        ownership_stake,
    } = request.into_inner();
    let link_id = BoLinkId::generate(BusinessOwnerKind::Secondary);

    // Add the new business owner's link_id to every DI
    let data: HashMap<_, _> = data
        .into_iter()
        .map(|(k, v)| (BDK::bo_data(link_id.clone(), k).into(), v))
        .collect();
    let PatchDataRequest { updates, .. } =
        PatchDataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(is_live))?;
    let updates = FingerprintedDataRequest::build(&state, updates, &sb_id).await?;

    let (bvw, link_id) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;

            let bo = NewSecondaryBo {
                link_id: link_id.clone(),
                ownership_stake: ownership_stake as i32,
            };
            BusinessOwner::bulk_create_secondary(conn, vec![bo], &bvw.vault.id)?;

            bvw.patch_data(conn, updates, DataRequestSource::HostedPatchVault(source.into()))?;

            // Reload the VW to get the new BO
            let bvw = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            Ok((bvw, link_id))
        })
        .await?;

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let new_bo = dbos
        .into_iter()
        .find(|bo| bo.bo.link_id == link_id)
        .ok_or(AssertionError("Cannot find new BO"))?;
    let result = api_wire_types::HostedBusinessOwner::from_db((new_bo, &user_auth));
    Ok(result)
}
