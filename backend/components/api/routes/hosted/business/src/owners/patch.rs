use actix_web::web;
use api_core::auth::user::CheckUserBizWfAuthContext;
use api_core::auth::user::UserAuthScope;
use api_core::auth::user::UserBizWfAuthContext;
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
use newtypes::BoLinkId;
use newtypes::BusinessDataKind as BDK;
use newtypes::BusinessOwnerKind;
use newtypes::DataIdentifier as DI;
use newtypes::DataRequest;
use newtypes::IdentityDataKind as IDK;
use newtypes::Uuid;
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
    user_auth: UserBizWfAuthContext,
    request: web::Json<Vec<BatchHostedBusinessOwnerRequest>>,
) -> ApiListResponse<api_wire_types::HostedBusinessOwner> {
    let user_auth = user_auth.check_guard(UserAuthScope::VaultData)?;
    user_auth.check_biz_workflow_guard(WorkflowGuard::AddData)?;
    let sb_id = user_auth.sb_id.clone();
    let is_live = user_auth.scoped_user.is_live;
    let request = request.into_inner();

    // Create the FingerprintedDataRequests for each request
    let mut ops = vec![];
    for r in request {
        let args = ValidateArgs::for_bifrost(is_live);
        let op = match r {
            BatchHostedBusinessOwnerRequest::Update(r) => BatchRequest::Update {
                data: PatchDataRequest::clean_and_validate(r.data, args)?.updates,
                uuid: r.uuid,
                ownership_stake: r.ownership_stake,
            },
            BatchHostedBusinessOwnerRequest::Create(r) => BatchRequest::Create {
                data: PatchDataRequest::clean_and_validate(r.data, args)?.updates,
                uuid: r.uuid,
                ownership_stake: r.ownership_stake,
            },
            BatchHostedBusinessOwnerRequest::Delete(r) => BatchRequest::Delete { uuid: r.uuid },
        };
        ops.push(op);
    }

    // Then, validate that this won't create multiple BOs with the same phone / email in prod
    let bvw = state
        .db_query(move |conn| VaultWrapper::build_for_tenant(conn, &sb_id))
        .await?;
    let dbos = bvw.decrypt_business_owners(&state).await?;
    validate_collective_bos(dbos, &ops, is_live)?;

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
        .flatten()
        .map(|id| dbos.remove(&id).ok_or(AssertionError("Cannot find updated BO")))
        .map_ok(|bo| api_wire_types::HostedBusinessOwner::from_db((bo, &user_auth)))
        .collect::<Result<_, _>>()?;
    Ok(results)
}

/// Given the current BOs and the list of operations to apply, make sure that the end state of
/// applying the operations does not leave any BOs with duplicate phone numbers or emails and that
/// the cumulative ownership stake does not exceed 100%
pub(super) fn validate_collective_bos(
    dbos: Vec<BusinessOwnerInfo>,
    ops: &[BatchRequest],
    is_live: bool,
) -> FpResult<()> {
    // TODO: I think this would be a little more invasive, but it might be nice to have this uniqueness
    // checking built into FingerprintedDataRequest - it could fingerprint the existing phone/email of
    // existing BOs and make sure there's no conflict. But hard for BOs that are already linked to a
    // user...
    let mut bo_phones: HashMap<_, _> = dbos.iter().map(|b| (&b.bo.uuid, b.phone_number())).collect();
    let mut bo_emails: HashMap<_, _> = dbos.iter().map(|b| (&b.bo.uuid, b.email())).collect();
    let mut ownerships: HashMap<_, _> = dbos
        .iter()
        .flat_map(|b| b.bo.ownership_stake.as_ref().map(|s| (&b.bo.uuid, *s as u32)))
        .collect();
    for op in ops {
        let (uuid, data, ownership_stake) = match &op {
            BatchRequest::Update {
                uuid,
                data,
                ownership_stake,
            } => (uuid, data, ownership_stake.as_ref()),
            BatchRequest::Create {
                uuid,
                data,
                ownership_stake,
            } => (uuid, data, ownership_stake.as_ref()),
            BatchRequest::Delete { uuid } => {
                bo_phones.remove(&uuid);
                bo_emails.remove(&uuid);
                ownerships.remove(&uuid);
                continue;
            }
        };
        // Overlay each of the requests on top of the existing BOs to get the final list of phones/emails
        if let Some(phone) = data.get(&IDK::PhoneNumber.into()) {
            bo_phones.insert(uuid, Some(phone));
        }
        if let Some(email) = data.get(&IDK::Email.into()) {
            bo_emails.insert(uuid, Some(email));
        }
        if let Some(ownership_stake) = ownership_stake {
            ownerships.insert(uuid, *ownership_stake);
        }
    }
    // Assert validations on the end state of all BOs after applying the operations
    if is_live && !bo_phones.values().all_unique() {
        return ValidationError("Phone numbers of beneficial owners must be unique").into();
    }
    if is_live && !bo_emails.values().all_unique() {
        return ValidationError("Emails of beneficial owners must be unique").into();
    }
    if ownerships.values().sum::<u32>() > 100 {
        return ValidationError("Cumulative ownership stake for all beneficial owners cannot exceed 100%")
            .into();
    }
    Ok(())
}

#[derive(Debug)]
pub(super) enum BatchRequest {
    Update {
        uuid: Uuid,
        ownership_stake: Option<u32>,
        data: DataRequest,
    },
    Create {
        uuid: Uuid,
        ownership_stake: Option<u32>,
        data: DataRequest,
    },
    Delete {
        uuid: Uuid,
    },
}

fn create_fingerprinted_data_request(
    link_id: &BoLinkId,
    data: DataRequest,
    ownership_stake: Option<u32>,
) -> FpResult<FingerprintedDataRequest> {
    let data = data.into_beneficial_owner_data(link_id, ownership_stake)?;

    // Never any fingerprints for beneficial owner data
    let data = FingerprintedDataRequest::manual_fingerprints(data, vec![]);
    Ok(data)
}


impl BatchRequest {
    fn process(
        self,
        conn: &mut TxnPgConn,
        user_auth: &CheckUserBizWfAuthContext,
    ) -> FpResult<Option<BoLinkId>> {
        let sb_id = user_auth.sb_id.clone();
        let source = user_auth.user_session.dl_source();

        let bvw = VaultWrapper::<Business>::lock_for_onboarding(conn, &sb_id)?;
        let bv_id = &bvw.vault.id;

        match self {
            Self::Update {
                uuid,
                ownership_stake,
                data,
            } => {
                let bo = BusinessOwner::get(conn, (bv_id, &uuid))?;

                if !data.is_empty() && bo.has_linked_user() {
                    return ValidationError("This owner is already linked to a user and cannot be updated")
                        .into();
                }

                let data = create_fingerprinted_data_request(&bo.link_id, data, ownership_stake)?;
                bvw.patch_data(conn, data, DataRequestSource::HostedPatchVault(source.into()))?;
                Ok(Some(bo.link_id))
            }
            Self::Create {
                uuid,
                ownership_stake,
                data,
            } => {
                // Create a new BO
                let link_id = BoLinkId::generate(BusinessOwnerKind::Secondary);
                let bo = NewSecondaryBo {
                    link_id: link_id.clone(),
                    uuid,
                };
                BusinessOwner::bulk_create_secondary(conn, vec![bo], &bvw.vault.id)?;
                let data = create_fingerprinted_data_request(&link_id, data, ownership_stake)?;
                bvw.patch_data(conn, data, DataRequestSource::HostedPatchVault(source.into()))?;
                Ok(Some(link_id))
            }
            Self::Delete { uuid } => {
                let bo = BusinessOwner::get(conn, (&bvw.vault.id, &uuid))?;
                let bo = BusinessOwner::lock(conn, &bo.id)?;

                // Delete all the vault data for this BO
                let dis = (bvw.populated_dis())
                    .into_iter()
                    .filter(|di| match di {
                        DI::Business(bdk) => match bdk {
                            BDK::BeneficialOwnerStake(id) | BDK::BeneficialOwnerData(id, _) => {
                                id == &bo.link_id
                            }
                            _ => false,
                        },
                        _ => false,
                    })
                    .collect();
                bvw.soft_delete_vault_data(conn, dis)?;

                // And mark the BO as deactivated in the DB
                BusinessOwner::deactivate(conn, bo)?;

                Ok(None)
            }
        }
    }
}
