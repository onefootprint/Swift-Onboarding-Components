use db::models::scoped_vault::ScopedVault;
use newtypes::BusinessOwnerData;

use crate::utils::db2api::DbToApi;

pub type BusinessOwnerInfo = (BusinessOwnerData, Option<ScopedVault>);

impl DbToApi<BusinessOwnerInfo> for api_wire_types::BusinessOwner {
    fn from_db((bo_data, sv): BusinessOwnerInfo) -> Self {
        let BusinessOwnerData { ownership_stake, .. } = bo_data;
        Self {
            id: sv.map(|sv| sv.fp_id),
            ownership_stake,
        }
    }
}
