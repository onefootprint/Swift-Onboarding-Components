use crate::utils::db2api::DbToApi;
use crate::utils::vault_wrapper::BusinessOwnerInfo;
use db::models::business_owner::{
    BusinessOwner,
    UserData,
};
use db::models::scoped_vault::ScopedVault;

impl DbToApi<BusinessOwnerInfo> for api_wire_types::PrivateBusinessOwner {
    fn from_db(bo: BusinessOwnerInfo) -> Self {
        Self {
            status: bo.scoped_user.as_ref().map(|su| su.status),
            id: bo.scoped_user.map(|su| su.fp_id),
            ownership_stake: bo.ownership_stake,
            kind: bo.kind,
            source: bo.linked_bo.map(|bo| bo.source),
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
