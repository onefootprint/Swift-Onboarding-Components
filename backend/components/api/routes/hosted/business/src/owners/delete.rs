use actix_web::web;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::AuthError;
use api_core::types::ApiResponse;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_wire_types::Empty;
use db::models::business_owner::BusinessOwner;
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::DataIdentifier as DI;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::delete;

#[api_v2_operation(
    description = "Delete a business owner. Only works for owners that haven't already started onboarding.",
    tags(Businesses, Hosted)
)]
#[delete("/hosted/business/owners/{id}")]
pub async fn delete(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    link_id: web::Path<BoLinkId>,
) -> ApiResponse<Empty> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
    let link_id = link_id.into_inner();

    state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
            let bo = BusinessOwner::get(conn, (&bvw.vault.id, &link_id))?;
            let bo = BusinessOwner::lock(conn, &bo.id)?;

            // Delete all the vault data for this BO
            let dis = (bvw.populated_dis())
                .into_iter()
                .filter(|di| {
                    matches!(di,
                        DI::Business(BDK::BeneficialOwnerData(id, _)) if id == &bo.link_id
                    )
                })
                .collect();
            bvw.soft_delete_vault_data(conn, dis)?;

            // And mark the BO as deactivated in the DB
            BusinessOwner::deactivate(conn, bo)?;

            Ok(())
        })
        .await?;

    Ok(Empty {})
}
