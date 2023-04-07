use db::models::{business_owner::BusinessOwner, onboarding::Onboarding, scoped_vault::ScopedVault};
use newtypes::BusinessOwnerKind;

use crate::utils::db2api::DbToApi;

pub type BusinessOwnerInfo = (Option<u32>, Option<(BusinessOwner, (ScopedVault, Onboarding))>);

/// Serialize an api_wire_types::BusinessOwner from non-KYCed BOs
impl DbToApi<BusinessOwnerInfo> for api_wire_types::BusinessOwner {
    fn from_db((ownership_stake, bo): BusinessOwnerInfo) -> Self {
        let (status, id, kind) = if let Some((bo, (su, ob))) = bo {
            (Some(ob.status), Some(su.fp_id), bo.kind)
        } else {
            (None, None, BusinessOwnerKind::Secondary)
        };
        Self {
            status,
            id,
            ownership_stake,
            kind,
        }
    }
}
