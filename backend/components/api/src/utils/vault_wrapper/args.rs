use crate::errors::ApiResult;
use db::{
    models::{onboarding::Onboarding, vault::Vault, verification_request::VerificationRequest},
    PgConn,
};
use newtypes::{DataLifetimeSeqno, ScopedUserId, VaultId};

/// There are a lot of places we build UVWs, under varying circumstances. Things to consider:
///   - Portable and Speculative data:
///       Does the flow need access to both portable AND speculative data?
///   - If the flow needs access to portable data, has the requester been granted access to see the portable data?
///     For example, a tenant shouldn't see portable data they didn't ask to collect (via an authorized OB config)
///
/// The VwArgs variants below are used to construct a VaultWrapper specific to the use case.
pub enum VwArgs<'a> {
    /// Used to build a UVW that sees ALL portable data and speculative data
    /// Allows reconstructing a VaultWrapper at the time a VerificationRequest was made
    /// This is only used during the onboarding process
    Idv(VerificationRequest),
    /// Used to build a UVW for a user that sees ALL portable data, or if it's non-portable, just speculative.
    /// This is generally used in user-authed APIs for my1fp
    User(&'a VaultId),
    /// Used to build a UVW that sees ALL portable data and speculative data
    /// Generally used during APIs on the bifrost onboarding path when WRITING data to the vault or
    /// in tenant-authed APIs when READING data from the vault.
    /// TODO should we have this include the list of fields to be decrypted so we can selectively choose what to load?
    Tenant(&'a ScopedUserId),
}

type Args = (Vault, Option<ScopedUserId>, Option<DataLifetimeSeqno>);

impl<'a> VwArgs<'a> {
    pub(super) fn build(self, conn: &mut PgConn) -> ApiResult<Args> {
        let args = match self {
            Self::Idv(req) => {
                let (_, su, _, _) = Onboarding::get(conn, &req.onboarding_id)?;
                let uv = Vault::get(conn, &su.user_vault_id)?;
                (uv, Some(su.id), Some(req.uvw_snapshot_seqno))
            }
            Self::User(uv_id) => {
                let user_vault = Vault::get(conn, uv_id)?;
                (user_vault, None, None)
            }
            Self::Tenant(su_id) => {
                let uv = Vault::get(conn, su_id)?;
                (uv, Some(su_id.clone()), None)
            }
        };
        tracing::info!(
            user_vault_id=%args.0.id, scoped_user_id=%format!("{:?}", args.1), seqno=%format!("{:?}", args.2.as_ref()),
            "Building VaultWrapper"
        );
        Ok(args)
    }
}
