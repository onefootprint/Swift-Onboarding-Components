use crate::FpResult;
use crate::State;
use db::models::fingerprint::Fingerprint;
use db::models::scoped_vault::ScopedVault;
use db::models::scoped_vault_label::ScopedVaultLabel;
use db::models::scoped_vault_tag::ScopedVaultTag;
use db::OffsetPagination;
use db::PgConn;
use itertools::Itertools;
use newtypes::DupeKind;
use newtypes::FpId;
use newtypes::LabelKind;
use newtypes::ScopedVaultId;
use newtypes::TagKind;
use newtypes::TenantId;
use std::collections::HashMap;

pub type DuplicateInputData = (
    Vec<Fingerprint>,
    Vec<ScopedVault>,
    Vec<ScopedVaultLabel>,
    Vec<ScopedVaultTag>,
    Option<usize>,
);

#[derive(Debug, Clone)]
pub struct DuplicateData {
    pub fp_id: FpId,
    pub sv_id: ScopedVaultId,
    pub label: Option<LabelKind>,
    pub tags: Vec<TagKind>,
    pub kind: DupeKind,
}
#[tracing::instrument(skip(state, pagination))]
pub async fn fetch_duplicate_data(
    state: &State,
    fp_id: FpId,
    tenant_id: TenantId,
    is_live: bool,
    pagination: OffsetPagination,
) -> FpResult<DuplicateInputData> {
    state
        .db_query(move |conn| {
            let scoped_vault = ScopedVault::get(conn, (&fp_id, &tenant_id, is_live))?;
            let res = fetch_duplicate_data_unchecked(conn, scoped_vault, pagination)?;
            Ok(res)
        })
        .await
}

/// Fetch duplicate data without checking ownership of the ScopedVault (used for internal APIs)
#[tracing::instrument(skip_all)]
pub fn fetch_duplicate_data_unchecked(
    conn: &mut PgConn,
    scoped_vault: ScopedVault,
    pagination: OffsetPagination,
) -> FpResult<DuplicateInputData> {
    // TODO: add neuro dupes
    let (fingerprints, next_page) = Fingerprint::get_internal_dupes(conn, &scoped_vault, pagination)?;
    let sv_ids = fingerprints.iter().map(|fp| &fp.scoped_vault_id).collect_vec();
    let labels = ScopedVaultLabel::bulk_get_active(conn, sv_ids.clone())?;
    let tags = ScopedVaultTag::bulk_get_active(conn, sv_ids.clone())?;
    let scoped_vaults = ScopedVault::bulk_get(conn, sv_ids, &scoped_vault.tenant_id, scoped_vault.is_live)?
        .iter()
        .map(|(scoped_vault, _)| scoped_vault.clone())
        .collect_vec();
    Ok((fingerprints, scoped_vaults, labels, tags, next_page))
}


#[tracing::instrument(skip_all)]
pub fn build_duplicate_responses(
    fingerprints: Vec<Fingerprint>,
    scoped_vaults: Vec<ScopedVault>,
    labels: Vec<ScopedVaultLabel>,
    tags: Vec<ScopedVaultTag>,
) -> Vec<DuplicateData> {
    let sv_id_to_fp_id: HashMap<ScopedVaultId, FpId> = scoped_vaults
        .into_iter()
        .map(|scoped_vault| (scoped_vault.id.clone(), scoped_vault.fp_id.clone()))
        .collect();

    let sv_id_to_label: HashMap<ScopedVaultId, LabelKind> = labels
        .into_iter()
        .map(|label| (label.scoped_vault_id.clone(), label.kind))
        .collect();

    let sv_id_to_tag: HashMap<ScopedVaultId, Vec<TagKind>> = tags
        .into_iter()
        .map(|tag| (tag.scoped_vault_id.clone(), tag.kind))
        .into_group_map();

    fingerprints
        .into_iter()
        .filter_map(|fingerprint| {
            let tags = sv_id_to_tag
                .get(&fingerprint.scoped_vault_id)
                .cloned()
                .unwrap_or_default();

            let label = sv_id_to_label.get(&fingerprint.scoped_vault_id).cloned();

            let fp_id = sv_id_to_fp_id
                .get(&fingerprint.scoped_vault_id)
                .cloned()
                .unwrap_or_default();

            match DupeKind::try_from(fingerprint.kind) {
                Ok(kind) => Some(DuplicateData {
                    fp_id: fp_id.clone(),
                    sv_id: fingerprint.scoped_vault_id.clone(),
                    label,
                    tags,
                    kind,
                }),
                Err(err) => {
                    tracing::error!(?err, "Unable to parse fingerprint kind");
                    None
                }
            }
        })
        .collect_vec()
}
