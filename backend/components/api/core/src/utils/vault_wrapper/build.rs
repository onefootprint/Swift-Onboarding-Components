use super::portable_view::filter_dls_for_portable_view;
use super::PieceOfData;
use super::VaultData;
use super::VaultWrapper;
use super::VwArgs;
use crate::FpResult;
use api_errors::ServerErr;
use api_errors::ServerErrInto;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::vault::Vault;
use db::models::vault_data::VaultData as DbVaultData;
use db::HasLifetime;
use db::PgConn;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeSeqno;
use newtypes::ScopedVaultId;
use newtypes::VaultId;
use std::collections::HashMap;
use std::marker::PhantomData;

/// Sort data by:
/// - created_seqno if added by this tenant
/// - portablized_seqno if added by another tenant
/// And for now, give preference to data added by other tenants over data added by this tenants.
fn sort_key(l: &DataLifetime, sv_id: Option<&ScopedVaultId>) -> FpResult<(DataLifetimeSeqno, bool)> {
    if let Some(sv_id) = sv_id {
        // Building VW for tenant view
        if &l.scoped_vault_id == sv_id {
            // Data was added by this tenant. Order by created_seqno
            Ok((l.created_seqno, false))
        } else {
            // Data was added by another tenant and is portable. Order by portablized_seqno
            let seqno = l.portablized_seqno.ok_or(ServerErr(
                "Found data added by other tenant without portablized_seqno",
            ))?;
            Ok((seqno, true))
        }
    } else {
        // Building VW for my1fp view
        let seqno = l
            .portablized_seqno
            .ok_or(ServerErr("Found data in user view without portablized_seqno"))?;
        Ok((seqno, true))
    }
}

impl<Type> VaultWrapper<Type> {
    #[allow(clippy::too_many_arguments)]
    pub(super) fn build_internal(
        user_vault: Vault,
        seqno: DataLifetimeSeqno,
        vd: Vec<DbVaultData>,
        documents: Vec<DocumentData>,
        lifetimes: Vec<DataLifetime>,
        sv_id: Option<&ScopedVaultId>,
    ) -> FpResult<Self> {
        let mut documents: HashMap<_, _> = documents
            .into_iter()
            .map(|d| (d.lifetime_id.clone(), d))
            .collect();
        let mut vd: HashMap<_, _> = vd.into_iter().map(|d| (d.lifetime_id.clone(), d)).collect();

        // Join lifetimes with their underlying piece of data
        let data = lifetimes
            .into_iter()
            .map(|l| -> FpResult<_> {
                let data = if let Some(d) = documents.remove(&l.id) {
                    PieceOfData::Document(d)
                } else if let Some(vd) = vd.remove(&l.id) {
                    PieceOfData::Vd(vd)
                } else {
                    return ServerErrInto("Found lifetime without corresponding data");
                };
                let data = VaultData { lifetime: l, data };
                Ok(data)
            })
            .collect::<FpResult<Vec<_>>>()?;

        // TODO some runtime checks that business vaults don't have id data and vice versa
        if data
            .iter()
            .any(|d| matches!(d.lifetime.kind, DataIdentifier::Custom(_)) && d.is_portable())
        {
            // We don't commit custom data yet because we don't want it to be portable. Error if we
            // find any
            return ServerErrInto("Found portable custom data");
        }

        // Group data by DI and order pieces of data with the same DI by most recent
        let ordered_data = data
            .into_iter()
            .into_group_map_by(|d| d.lifetime.kind.clone())
            .into_iter()
            .map(|(k, v)| -> FpResult<_> {
                // Sort the data in the chronological order in which they became visible to the
                // vault with most up-to-date data first
                let v = v
                    .into_iter()
                    .map(|d| Ok((sort_key(&d.lifetime, sv_id)?, d)))
                    .collect::<FpResult<Vec<_>>>()?
                    .into_iter()
                    .sorted_by_key(|(key, _)| *key)
                    .rev()
                    .map(|(_, d)| d)
                    .collect_vec();
                Ok((k, v))
            })
            .collect::<FpResult<_>>()?;

        let result = Self {
            vault: user_vault,
            all_data: ordered_data,
            seqno,
            is_hydrated: PhantomData,
        };
        Ok(result)
    }

    pub fn build_portable(conn: &mut PgConn, v_id: &VaultId) -> FpResult<Self> {
        let args = VwArgs::Vault(v_id);
        Self::build(conn, args)
    }

    #[tracing::instrument("VaultWrapper::build", skip_all, fields(?args))]
    pub fn build(conn: &mut PgConn, args: VwArgs) -> FpResult<Self> {
        let (uv, sv_id, seqno) = args.build(conn)?;
        let active_lifetimes = if let Some(sv_id) = sv_id.as_ref() {
            // Get all DLs that belong to this tenant
            DataLifetime::bulk_get_active_at(conn, vec![sv_id], seqno)?
        } else {
            // Get all DLs marked as portable by any tenant
            let dls = DataLifetime::get_portable_at(conn, &uv.id, seqno)?;
            filter_dls_for_portable_view(dls)
        };
        let active_lifetime_ids: Vec<_> = active_lifetimes.iter().map(|l| l.id.clone()).collect();

        // Fetch all the data related to the active lifetimes
        let data = DbVaultData::get_for(conn, &active_lifetime_ids)?;
        let documents = DocumentData::get_for(conn, &active_lifetime_ids)?;

        let result = Self::build_internal(uv, seqno, data, documents, active_lifetimes, sv_id.as_ref())?;
        Ok(result)
    }
}
