use db::models::{onboarding::Onboarding, scoped_vault::ScopedVault};
use newtypes::{BusinessOwnerData, BusinessOwnerKind};

use crate::utils::db2api::DbToApi;

pub type BusinessOwnerInfo = (
    BusinessOwnerData,
    BusinessOwnerKind,
    Option<(ScopedVault, Onboarding)>,
);

impl DbToApi<BusinessOwnerInfo> for api_wire_types::BusinessOwner {
    fn from_db((bo_data, kind, sv): BusinessOwnerInfo) -> Self {
        let BusinessOwnerData { ownership_stake, .. } = bo_data;
        Self {
            status: sv.as_ref().map(|(_, ob)| ob.status),
            id: sv.map(|(sv, _)| sv.fp_id),
            ownership_stake,
            kind,
        }
    }
}
