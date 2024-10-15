use crate::auth::user::CheckUserWfAuthContext;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::BusinessOwnerInfo;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::UserData;
use db::models::scoped_vault::ScopedVault;
use newtypes::DataIdentifier as DI;
use newtypes::IdentityDataKind as IDK;

impl DbToApi<BusinessOwnerInfo> for api_wire_types::PrivateBusinessOwner {
    fn from_db(bo: BusinessOwnerInfo) -> Self {
        Self {
            status: bo.su.as_ref().map(|su| su.status),
            id: bo.su.map(|su| su.fp_id),
            ownership_stake: bo.bo.ownership_stake.map(|i| i as u32),
            kind: bo.bo.kind,
            source: bo.bo.source,
        }
    }
}

impl<'a> DbToApi<(BusinessOwnerInfo, &'a CheckUserWfAuthContext)> for api_wire_types::HostedBusinessOwner {
    fn from_db((bo, user_auth): (BusinessOwnerInfo, &'a CheckUserWfAuthContext)) -> Self {
        let BusinessOwnerInfo { bo, su, data } = bo;
        let has_linked_user = su.is_some();
        let is_authed_user = su.is_some_and(|su| su.id == user_auth.scoped_user.id);
        let populated_data = data.keys().cloned().collect();
        let decrypted_data = data
            .into_iter()
            .filter(|(di, _)| {
                if matches!(di, DI::Id(IDK::FirstName) | DI::Id(IDK::LastName)) {
                    // Always show the first name and last name, regardless of whether this BO is editable
                    return true;
                }
                // For other properties (like phone and email), only render them if they are owned by the biz
                // OR if the currently logged in user is this beneficial owner
                !has_linked_user || is_authed_user
            })
            .collect();
        Self {
            id: bo.link_id,
            has_linked_user,
            is_authed_user,
            populated_data,
            decrypted_data,
            ownership_stake: bo.ownership_stake.map(|s| s as u32),
        }
    }
}

impl DbToApi<(BusinessOwner, ScopedVault)> for api_wire_types::PrivateOwnedBusiness {
    fn from_db((_, sb): (BusinessOwner, ScopedVault)) -> Self {
        let ScopedVault {
            fp_id: id, status, ..
        } = sb;
        Self { id, status }
    }
}

impl DbToApi<(BusinessOwner, UserData)> for api_wire_types::BusinessOwner {
    fn from_db((_, (sv, _)): (BusinessOwner, UserData)) -> Self {
        let ScopedVault { fp_id, .. } = sv;
        Self { fp_id }
    }
}
