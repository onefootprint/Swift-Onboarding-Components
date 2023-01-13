use db::{
    models::{
        data_lifetime::DataLifetime, ob_configuration::ObConfiguration, onboarding::Onboarding,
        user_vault::UserVault, verification_request::VerificationRequest,
    },
    PgConnection,
};
use newtypes::{DataLifetimeKind, DataLifetimeSeqno, ScopedUserId, UserVaultId};

use crate::errors::ApiResult;

/// There are a lot of places we build UVWs, under varying circumstances. Things to consider:
///   - Committed and Speculative data:
///       Does the flow need access to both committed AND speculative data?
///   - If the flow needs access to committed data, has the requester been granted access to see the committed data?
///     For example, a tenant shouldn't see committed data they didn't ask to collect (via an authorized OB config)
///
/// The UvwArgs variants below are used to construct a UserVaultWrapper specific to the use case.
pub enum UvwArgs<'a> {
    /// Used to build a UVW that sees ALL committed data and speculative data
    /// Allows reconstructing a UserVaultWrapper at the time a VerificationRequest was made
    /// This is only used during the onboarding process
    Idv(VerificationRequest),
    /// Used to build a UVW for a user that sees ALL committed data, or if it's non-portable, just speculative.
    /// This is generally used in user-authed APIs for my1fp
    User(&'a UserVaultId),
    /// Used to build a UVW that sees ALL committed data and speculative data
    /// Generally used during APIs on the bifrost onboarding path when WRITING data to the vault.
    Onboarding(&'a ScopedUserId),
    /// Used to build a UVW that sees REQUESTED committed data and all speculative data.
    /// This is generally used in tenant-authed APIs when READING data from the vault.
    /// TODO should we have this include the list of fields to be decrypted so we can selectively choose what to load?
    Tenant(&'a ScopedUserId),
}

type LoadObConfigPerms = bool;
type Args = (
    UserVault,
    Option<ScopedUserId>,
    Option<DataLifetimeSeqno>,
    LoadObConfigPerms,
);

impl<'a> UvwArgs<'a> {
    pub(super) fn build(self, conn: &mut PgConnection) -> ApiResult<(Args, Vec<DataLifetime>)> {
        let args = self.args(conn)?;
        let active_lifetimes = Self::get_active_lifetimes(conn, &args)?;
        tracing::info!(
            user_vault_id=%args.0.id, scoped_user_id=%format!("{:?}", args.1), seqno=%format!("{:?}", args.2.as_ref()),
            "Building UserVaultWrapper"
        );
        Ok((args, active_lifetimes))
    }

    fn args(self, conn: &mut PgConnection) -> ApiResult<Args> {
        let args = match self {
            Self::Idv(req) => {
                let (_, su, _, _) = Onboarding::get(conn, &req.onboarding_id)?;
                let uv = UserVault::get(conn, &su.user_vault_id)?;
                (uv, Some(su.id), Some(req.uvw_snapshot_seqno), false)
            }
            Self::User(uv_id) => {
                let user_vault = UserVault::get(conn, uv_id)?;
                (user_vault, None, None, false)
            }
            Self::Onboarding(su_id) => {
                let user_vault = UserVault::get(conn, su_id)?;
                (user_vault, Some(su_id.clone()), None, false)
            }
            Self::Tenant(su_id) => {
                let uv = UserVault::get(conn, su_id)?;
                // Just to be explicit, if user vault is portable, we need to check OBs have granted tenant access to the fields
                // otherwise, they get everything (everything in non-portable vaults is speculative as of this writing)
                // TODO what happens if we want to add an ssn to a vault via API but no ob config exists
                // to allow us to read SSN? With the way this is written, we'll never be able to see it
                // Can this same effect be achieved by only filtering for data collected by this tenant?
                let check_ob_access = uv.is_portable;
                (uv, Some(su_id.clone()), None, check_ob_access)
            }
        };
        Ok(args)
    }

    fn get_active_lifetimes(conn: &mut PgConnection, args: &Args) -> ApiResult<Vec<DataLifetime>> {
        let (uv, su_id, seqno, check_ob_access) = args;
        let uv_id = &uv.id;
        let su_id = su_id.as_ref();
        // Since UserVaults contain data from multiple Tenant onboardings, not all committed data should be available to
        // all Tenants that onboarded a User. Here, we filter DataLifetimes to only the `kind`s that the given tenant has requested
        // access to
        //
        // TODO: if we are getting active_at DLs, do we need to also figure out if they had requested access at that point?
        // or is okay to retroactively give tenants info? Probably the latter?
        let filter_scoped_user_id = check_ob_access.then_some(su_id).flatten();
        let accessible_lifetime_kinds = if let Some(su_id) = filter_scoped_user_id {
            let authorized_obcs = ObConfiguration::list_authorized_for_user(conn, su_id.clone())?;

            let accessible_kinds: Vec<_> = authorized_obcs
                .into_iter()
                .flat_map(|x| x.must_collect())
                .map(DataLifetimeKind::from)
                // Since we have a scoped_user, we should be able to see custom data for the tenant
                .chain([DataLifetimeKind::Custom])
                .collect();
            Some(accessible_kinds)
        } else {
            None
        };

        let active_lifetimes = if let Some(seqno) = seqno {
            // We are reconstructing the UVW as it appeared at a given seqno
            DataLifetime::get_active_at(conn, uv_id, su_id, *seqno, accessible_lifetime_kinds)?
        } else {
            // We are constructing the UVW as it appears right now
            DataLifetime::get_active(conn, uv_id, su_id, accessible_lifetime_kinds)?
        };

        Ok(active_lifetimes)
    }
}
