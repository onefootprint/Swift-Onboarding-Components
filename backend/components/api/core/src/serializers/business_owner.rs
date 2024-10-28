use crate::auth::tenant::TenantAuth;
use crate::auth::user::CheckUserBizWfAuthContext;
use crate::auth::CanDecrypt;
use crate::auth::IsGuardMet;
use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::BusinessOwnerInfo;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::UserData;
use db::models::scoped_vault::ScopedVault;
use db::models::vault::Vault;
use newtypes::DataIdentifier as DI;
use newtypes::IdentityDataKind as IDK;
use newtypes::PiiString;

impl<'a> DbToApi<(BusinessOwnerInfo, &'a Box<dyn TenantAuth>)> for api_wire_types::PrivateBusinessOwner {
    fn from_db((bo, auth): (BusinessOwnerInfo, &'a Box<dyn TenantAuth>)) -> Self {
        let can_see_name = CanDecrypt::new(vec![IDK::FirstName, IDK::LastName]).is_met(&auth.scopes());
        let name = can_see_name.then_some(bo.clone().name()).flatten();
        let name = name.map(|(first_name, last_name)| {
            PiiString::from(format!(
                "{} {}.",
                first_name.leak(),
                last_name.leak().chars().take(1).collect::<String>()
            ))
        });
        Self {
            status: bo.su.as_ref().map(|su| su.status),
            fp_id: bo.su.map(|su| su.fp_id),
            ownership_stake: bo.bo.ownership_stake.map(|i| i as u32),
            kind: bo.bo.kind,
            source: bo.bo.source,
            name,
        }
    }
}

impl<'a> DbToApi<(BusinessOwnerInfo, &'a CheckUserBizWfAuthContext)> for api_wire_types::HostedBusinessOwner {
    fn from_db((bo, user_auth): (BusinessOwnerInfo, &'a CheckUserBizWfAuthContext)) -> Self {
        let has_linked_user = bo.has_linked_user();
        let BusinessOwnerInfo { bo, su, data } = bo;
        let is_authed_user = su.is_some_and(|su| su.id == user_auth.scoped_user.id);
        let is_mutable = !has_linked_user || is_authed_user;
        let populated_data = data.keys().cloned().collect();
        let decrypted_data = data
            .into_iter()
            .filter(|(di, _)| {
                if matches!(di, DI::Id(IDK::FirstName) | DI::Id(IDK::LastName)) {
                    // Always show the first name and last name, regardless of whether this BO is editable
                    return true;
                }
                // For other properties (like phone and email), only render them if they are owned by the biz
                // OR if the currently logged in user is this beneficial owner.
                // This minimizes the amount of data that BOs can see about each other
                is_mutable
            })
            .collect();
        Self {
            link_id: bo.link_id,
            uuid: bo.uuid,
            has_linked_user,
            is_authed_user,
            is_mutable,
            populated_data,
            decrypted_data,
            ownership_stake: bo.ownership_stake.map(|s| s as u32),
            created_at: bo.created_at,
        }
    }
}

impl DbToApi<(BusinessOwner, ScopedVault, Vault)> for api_wire_types::PrivateOwnedBusiness {
    fn from_db((_, sb, _): (BusinessOwner, ScopedVault, Vault)) -> Self {
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
