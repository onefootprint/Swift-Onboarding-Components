use super::vw_data::VwData;
use super::VaultWrapper;
use super::VwArgs;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::HasLifetime;
use db::PgConn;
use newtypes::DataLifetimeSeqno;
use std::marker::PhantomData;

impl<Type> VaultWrapper<Type> {
    #[allow(clippy::too_many_arguments)]
    pub(super) fn build_internal(
        user_vault: Vault,
        seqno: Option<DataLifetimeSeqno>,
        vd: Vec<VaultData>,
        documents: Vec<DocumentData>,
        lifetimes: Vec<DataLifetime>,
    ) -> ApiResult<Self> {
        let (portable, speculative) = VwData::partition(vd, documents, lifetimes)?;
        let result = Self {
            vault: user_vault,
            portable,
            speculative,
            _seqno: seqno,
            is_hydrated: PhantomData,
        };
        Ok(result)
    }

    #[tracing::instrument("VaultWrapper:build", skip_all)]
    pub fn build(conn: &mut PgConn, args: VwArgs) -> ApiResult<Self> {
        let (uv, sv_id, seqno) = args.build(conn)?;
        let active_lifetimes = if let Some(seqno) = seqno {
            // We are reconstructing the UVW as it appeared at a given seqno
            DataLifetime::get_active_at(conn, &uv.id, sv_id.as_ref(), seqno)?
        } else {
            // We are constructing the UVW as it appears right now
            DataLifetime::get_active(conn, &uv.id, sv_id.as_ref())?
        };
        let active_lifetime_ids: Vec<_> = active_lifetimes.iter().map(|l| l.id.clone()).collect();

        // Fetch all the data related to the active lifetimes
        // Split into portable + speculative data
        let data = VaultData::get_for(conn, &active_lifetime_ids)?;
        let documents = DocumentData::get_for(conn, &active_lifetime_ids)?;

        let result = Self::build_internal(uv, seqno, data, documents, active_lifetimes)?;
        Ok(result)
    }
}
