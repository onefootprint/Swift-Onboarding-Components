use crate::errors::{ApiError, ApiResult};
use db::models::contact_info::{ContactInfo, NewContactInfoArgs};
use db::models::vault_data::VaultData;
use db::TxnPgConn;
use itertools::Itertools;
use newtypes::{ContactInfoPriority, DataIdentifier, IdentityDataKind as IDK, VdKind};

type NewContactInfo = (DataIdentifier, ContactInfo);

/// Given a list of new VDs that were created, also creates ContactInfo in the DB
pub(in super::super) fn create_contact_info_if_needed(
    conn: &mut TxnPgConn,
    new_vds: Vec<VaultData>,
) -> ApiResult<Vec<NewContactInfo>> {
    // Create ContactInfo rows for new phone numbers/emails
    let new_contact_info = new_vds
        .iter()
        .filter(|vd| matches!(vd.kind, VdKind::Id(IDK::PhoneNumber) | VdKind::Id(IDK::Email)))
        .map(|vd| NewContactInfoArgs {
            is_verified: false, // TODO: phone starts as verified
            priority: ContactInfoPriority::Primary,
            lifetime_id: vd.lifetime_id.clone(),
        })
        .collect_vec();
    let cis = ContactInfo::bulk_create(conn, new_contact_info)?;
    // Zip CI with corresponding DI
    let cis = cis
        .into_iter()
        .map(|ci| -> ApiResult<_> {
            let di = new_vds
                .iter()
                .find(|vd| vd.lifetime_id == ci.lifetime_id)
                .map(|vd| DataIdentifier::from(vd.kind.clone()))
                .ok_or_else(|| ApiError::AssertionError("No lifetime ID".to_owned()))?;
            Ok((di, ci))
        })
        .collect::<ApiResult<Vec<_>>>()?;
    Ok(cis)
}
