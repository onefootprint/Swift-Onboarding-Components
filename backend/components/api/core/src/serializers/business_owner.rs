use crate::utils::db2api::DbToApi;
use db::models::business_owner::{
    BusinessOwner,
    UserData,
};
use newtypes::BusinessOwnerKind;

pub type BusinessOwnerInfo = (Option<u32>, Option<BusinessOwner>, Option<UserData>);

/// Serialize an api_wire_types::BusinessOwner from non-KYCed BOs
impl DbToApi<BusinessOwnerInfo> for api_wire_types::BusinessOwner {
    fn from_db((ownership_stake, bo, ud): BusinessOwnerInfo) -> Self {
        // if BusinessOwner is None, that means we have a secondary BO from the Single KYC flow
        let kind = bo.map(|b| b.kind).unwrap_or(BusinessOwnerKind::Secondary);
        let (status, id) = if let Some((sv, _)) = ud {
            (sv.status, Some(sv.fp_id))
        } else {
            (None, None)
        };
        Self {
            status,
            id,
            ownership_stake,
            kind,
        }
    }
}
