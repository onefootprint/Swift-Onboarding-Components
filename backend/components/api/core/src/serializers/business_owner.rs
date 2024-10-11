use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::BusinessOwnerInfo;
use db::models::business_owner::BusinessOwner;
use db::models::business_owner::UserData;
use db::models::scoped_vault::ScopedVault;

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
