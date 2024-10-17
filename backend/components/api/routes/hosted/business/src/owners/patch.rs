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
use api_core::utils::vault_wrapper::BusinessOwnerInfo;
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
use newtypes::IdentityDataKind as IDK;
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
    let is_live = user_auth.scoped_user.is_live;
    let request = request.into_inner();

    // Create the FingerprintedDataRequests for each request
    let mut ops = vec![];
    for r in request {
        let op = match r {
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
        ops.push(op);
    }

    // Then, validate that this won't create multiple BOs with the same phone / email in prod
    let bvw = state
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sb_id))
        .await?;
    let dbos = bvw.decrypt_business_owners(&state).await?;
    verify_unique_phones_and_emails(dbos, &ops, is_live)?;

    // Handle each request atomically
    let (bvw, link_ids, user_auth) = state
        .db_transaction(move |conn| -> FpResult<_> {
            let link_ids = ops
                .into_iter()
                .map(|req| req.process(conn, &user_auth))
                .collect::<FpResult<Vec<_>>>()?;
            // Reload the VW to get the updated BOs
            let bvw = VaultWrapper::build_for_tenant(conn, &bvw.scoped_vault.id)?;
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

/// Given the current BOs and the list of operations to apply, make sure that the end state of
/// applying the operations does not leave any BOs with duplicate phone numbers or emails
pub(super) fn verify_unique_phones_and_emails(
    dbos: Vec<BusinessOwnerInfo>,
    ops: &[BatchRequest],
    is_live: bool,
) -> FpResult<()> {
    // TODO: I think this would be a little more invasive, but it might be nice to have this uniqueness
    // checking built into FingerprintedDataRequest - it could fingerprint the existing phone/email of
    // existing BOs and make sure there's no conflict. But hard for BOs that are already linked to a
    // user...
    let mut bo_phones: HashMap<_, _> = dbos.iter().map(|b| (&b.bo.link_id, b.phone_number())).collect();
    let mut bo_emails: HashMap<_, _> = dbos.iter().map(|b| (&b.bo.link_id, b.email())).collect();
    for op in ops {
        let (l_id, data) = match &op {
            BatchRequest::Update { link_id, data, .. } => (link_id, data),
            BatchRequest::Create { link_id, data, .. } => (link_id, data),
        };
        // Overlay each of the requests on top of the existing BOs to get the final list of phones/emails
        if let Some(phone) = data.get(&BDK::bo_data(l_id.clone(), IDK::PhoneNumber).into()) {
            bo_phones.insert(l_id, Some(phone));
        }
        if let Some(email) = data.get(&BDK::bo_data(l_id.clone(), IDK::Email).into()) {
            bo_emails.insert(l_id, Some(email));
        }
    }
    if is_live && !bo_phones.values().all_unique() {
        return ValidationError("Phone numbers of beneficial owners must be unique").into();
    }
    if is_live && !bo_emails.values().all_unique() {
        return ValidationError("Emails of beneficial owners must be unique").into();
    }
    Ok(())
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

pub(super) enum BatchRequest {
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
