use actix_web::web;
use api_core::auth::user::CheckUserWfAuthContext;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserWfAuthContext;
use api_core::auth::AuthError;
use api_core::errors::AssertionError;
use api_core::errors::ValidationError;
use api_core::types::ApiListResponse;
use api_core::utils::db2api::DbToApi;
use api_core::utils::vault_wrapper::Business;
use api_core::utils::vault_wrapper::DataRequestSource;
use api_core::utils::vault_wrapper::FingerprintedDataRequest;
use api_core::utils::vault_wrapper::VaultWrapper;
use api_core::FpResult;
use api_core::State;
use api_wire_types::BatchHostedBusinessOwnerRequest;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::NewSecondaryBo;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::put_data_request::PatchDataRequest;
use newtypes::put_data_request::RawUserDataRequest;
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use newtypes::ValidateArgs;
use newtypes::WorkflowGuard;
use paperclip::actix::api_v2_operation;
use paperclip::actix::patch;
use std::collections::HashMap;

#[api_v2_operation(
    description = "Applies multiple operations in batch to update or create business owners. NOTE: the open API documentation for the request is extremely incorrect for this API.",
    tags(Businesses, Hosted)
)]
#[patch("/hosted/business/owners")]
pub async fn patch(
    state: web::Data<State>,
    user_auth: UserWfAuthContext,
    request: web::Json<Vec<BatchHostedBusinessOwnerRequest>>,
) -> ApiListResponse<api_wire_types::HostedBusinessOwner> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;

    let mut reqs = vec![];
    for r in request.into_inner() {
        let req = match r {
            BatchHostedBusinessOwnerRequest::Update(r) => BatchRequest::Update {
                data: create_bo_fingerprinted_data_req(&state, r.data, &r.id, &user_auth).await?,
                link_id: r.id,
                ownership_stake: r.ownership_stake,
            },
            BatchHostedBusinessOwnerRequest::Create(r) => {
                let link_id = BoLinkId::generate(BusinessOwnerKind::Secondary);
                BatchRequest::Create {
                    data: create_bo_fingerprinted_data_req(&state, r.data, &link_id, &user_auth).await?,
                    link_id,
                    ownership_stake: r.ownership_stake,
                }
            }
        };
        reqs.push(req);
    }


    let (bvw, link_ids, user_auth) = state
        .db_pool
        .db_transaction(move |conn| -> FpResult<_> {
            let link_ids = reqs
                .into_iter()
                .map(|req| req.process(conn, &user_auth))
                .collect::<FpResult<Vec<_>>>()?;
            // Reload the VW to get the updated BOs
            let bvw = VaultWrapper::build_for_tenant(conn, &sb_id)?;
            Ok((bvw, link_ids, user_auth))
        })
        .await?;

    let dbos = bvw.decrypt_business_owners(&state).await?;
    let mut dbos: HashMap<_, _> = dbos.into_iter().map(|bo| (bo.bo.link_id.clone(), bo)).collect();
    let results = link_ids
        .into_iter()
        .map(|id| dbos.remove(&id).ok_or(AssertionError("Cannot find updated BO")))
        .map_ok(|bo| api_wire_types::HostedBusinessOwner::from_db((bo, &user_auth)))
        .collect::<Result<_, _>>()?;
    Ok(results)
}

/// Given the RawUserDataRequest, transforms the user-specific DIs to instead be business-owner DIs
/// that will be vaulted under the business owner
async fn create_bo_fingerprinted_data_req(
    state: &State,
    data: RawUserDataRequest,
    link_id: &BoLinkId,
    user_auth: &CheckUserWfAuthContext,
) -> FpResult<FingerprintedDataRequest> {
    // Add the business owner's link_id to every DI
    let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
    let is_live = user_auth.scoped_user.is_live;
    let data: HashMap<_, _> = data
        .into_iter()
        .map(|(k, v)| (BDK::bo_data(link_id.clone(), k).into(), v))
        .collect();
    let PatchDataRequest { updates, .. } =
        PatchDataRequest::clean_and_validate(data, ValidateArgs::for_bifrost(is_live))?;
    let updates = FingerprintedDataRequest::build(state, updates, &sb_id).await?;
    Ok(updates)
}

pub enum BatchRequest {
    Update {
        link_id: BoLinkId,
        ownership_stake: Option<u32>,
        data: FingerprintedDataRequest,
    },
    Create {
        link_id: BoLinkId,
        ownership_stake: u32,
        data: FingerprintedDataRequest,
    },
}

impl BatchRequest {
    fn process(self, conn: &mut TxnPgConn, user_auth: &CheckUserWfAuthContext) -> FpResult<BoLinkId> {
        let sb_id = user_auth.scoped_business_id().ok_or(AuthError::MissingBusiness)?;
        let uv_id = &user_auth.user().id;
        let source = user_auth.user_session.dl_source();

        let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
        match self {
            Self::Update {
                link_id,
                ownership_stake,
                data,
            } => {
                let bo = BusinessOwner::get(conn, (&bvw.vault.id, &link_id))?;
                let can_update_bo =
                    bo.user_vault_id.is_none() || bo.user_vault_id.as_ref().is_some_and(|uv| uv == uv_id);
                if !can_update_bo {
                    return ValidationError(
                        "This business owner is already linked to a user and cannot be updated",
                    )
                    .into();
                }

                if let Some(stake) = ownership_stake {
                    BusinessOwner::update_ownership_stake(conn, &bvw.vault.id, &link_id, stake as i32)?;
                }

                if !data.is_empty() {
                    if bo.user_vault_id.is_some() {
                        // TODO at some point we could load the user's vault and update it here
                        return ValidationError("Cannot yet update data for a BO that is linked to a user")
                            .into();
                    }
                    bvw.patch_data(conn, data, DataRequestSource::HostedPatchVault(source.into()))?;
                }
                Ok(link_id)
            }
            Self::Create {
                link_id,
                ownership_stake,
                data,
            } => {
                let bo = NewSecondaryBo {
                    link_id: link_id.clone(),
                    ownership_stake: ownership_stake as i32,
                };
                BusinessOwner::bulk_create_secondary(conn, vec![bo], &bvw.vault.id)?;
                bvw.patch_data(conn, data, DataRequestSource::HostedPatchVault(source.into()))?;
                Ok(link_id)
            }
        }
    }
}
