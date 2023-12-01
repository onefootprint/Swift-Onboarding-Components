use crate::errors::ApiResult;
use db::{models::vault::Vault, PgConn};
use newtypes::{DataLifetimeSeqno, ScopedVaultId, VaultId};

/// There are a lot of places we build VWs, under varying circumstances. Things to consider:
///   - Portable and Speculative data:
///       Does the flow need access to both portable AND speculative data?
///   - If the flow needs access to portable data, has the requester been granted access to see the portable data?
///     For example, a tenant shouldn't see portable data they didn't ask to collect (via an authorized OB config)
///
/// The VwArgs variants below are used to construct a VaultWrapper specific to the use case.
pub enum VwArgs<'a> {
    /// Used to build a VW for a user that sees ALL portable data.
    /// This is generally used to autofill portable data into tenants during one-click and for
    /// user-authed APIs for my1fp
    Vault(&'a VaultId),
    /// Used to build a VW that sees ALL portable data and speculative data
    /// Generally used during APIs on the tenant-specific bifrost onboarding path or
    /// in tenant-authed APIs.
    Tenant(&'a ScopedVaultId),
    /// Used to build a VW that sees ALL portable data and speculative data.
    /// Allows reconstructing a VaultWrapper from the view of a given tenant at a historical point
    /// in time.
    Historical(&'a ScopedVaultId, DataLifetimeSeqno),
}

type Args = (Vault, Option<ScopedVaultId>, Option<DataLifetimeSeqno>);

impl<'a> VwArgs<'a> {
    pub(super) fn build(self, conn: &mut PgConn) -> ApiResult<Args> {
        let args = match self {
            Self::Vault(uv_id) => {
                let user_vault = Vault::get(conn, uv_id)?;
                (user_vault, None, None)
            }
            Self::Tenant(sv_id) => {
                let uv = Vault::get(conn, sv_id)?;
                (uv, Some(sv_id.clone()), None)
            }
            Self::Historical(sv_id, seqno) => {
                let uv = Vault::get(conn, sv_id)?;
                (uv, Some(sv_id.clone()), Some(seqno))
            }
        };
        tracing::info!(
            user_vault_id=%args.0.id, scoped_user_id=%format!("{:?}", args.1), seqno=%format!("{:?}", args.2.as_ref()),
            "Building VaultWrapper"
        );
        Ok(args)
    }
}
