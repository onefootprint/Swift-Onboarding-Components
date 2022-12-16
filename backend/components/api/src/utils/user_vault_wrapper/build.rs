use super::uvw_data::UvwData;
use super::LockedUserVaultWrapper;
use super::UserVaultWrapper;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::ob_configuration::ObConfiguration;
use db::models::onboarding::Onboarding;
use db::models::phone_number::NewPhoneNumberArgs;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::NewUserInfo;
use db::models::user_vault::UserVault;
use db::models::user_vault_data::UserVaultData;
use db::models::verification_request::VerificationRequest;
use db::HasLifetime;
use db::TxnPgConnection;
use db::{errors::DbError, PgConnection};
use newtypes::DataLifetimeKind;
use newtypes::UserVaultId;
use newtypes::{DataLifetimeSeqno, ScopedUserId, TenantId};
use std::marker::PhantomData;

impl UserVaultWrapper {
    #[allow(clippy::too_many_arguments)]
    fn build(
        user_vault: UserVault,
        seqno: Option<DataLifetimeSeqno>,
        scoped_user_id: Option<ScopedUserId>,
        uvd: Vec<UserVaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocument>,
        lifetimes: Vec<DataLifetime>,
    ) -> Self {
        let (committed, speculative) =
            UvwData::partition(uvd, phone_numbers, emails, identity_documents, lifetimes);
        tracing::info!(
            user_vault_id=%user_vault.id, scoped_user_id=%format!("{:?}", scoped_user_id), seqno=%format!("{:?}", seqno.as_ref()),
            "Built UserVaultWrapper"
        );
        Self {
            user_vault,
            committed,
            speculative,
            _seqno: seqno,
            scoped_user_id,
            is_hydrated: PhantomData,
        }
    }

    fn build_single(
        conn: &mut PgConnection,
        user_vault: UserVault,
        scoped_user_id: Option<&ScopedUserId>,
        seqno: Option<DataLifetimeSeqno>,
        check_access_to_datalifetime_kind: bool,
    ) -> Result<Self, DbError> {
        // Since UserVaults contain data from multiple Tenant onboardings, not all committed data should be available to
        // all Tenants that onboarded a User. Here, we filter DataLifetimes to only the `kind`s that the given tenant has requested
        // access to
        //
        // TODO: if we are getting active_at DLs, do we need to also figure out if they had requested access at that point?
        // or is okay to retroactively give tenants info? Probably the latter?
        let filter_scoped_user_id = check_access_to_datalifetime_kind
            .then_some(scoped_user_id)
            .flatten();
        let accessible_lifetime_kinds: Option<Vec<DataLifetimeKind>> =
            if let Some(su_id) = filter_scoped_user_id {
                let authorized_obcs = ObConfiguration::list_authorized_for_user(conn, su_id.clone())?;

                let accessible_kinds = authorized_obcs
                    .into_iter()
                    .flat_map(|x| x.intent_to_collect_fields())
                    .collect();

                Some(accessible_kinds)
            } else {
                None
            };

        let active_lifetimes = if let Some(seqno) = seqno {
            // We are reconstructing the UVW as it appeared at a given seqno
            DataLifetime::get_active_at(
                conn,
                &user_vault.id,
                scoped_user_id,
                seqno,
                accessible_lifetime_kinds,
            )?
        } else {
            // We are constructing the UVW as it appears right now
            DataLifetime::get_active(conn, &user_vault.id, scoped_user_id, accessible_lifetime_kinds)?
        };

        let active_lifetime_ids: Vec<_> = active_lifetimes.iter().map(|l| l.id.clone()).collect();

        // Fetch all the data related to the active lifetimes
        // Split into committed + uncommitted data
        let data = UserVaultData::get_for(conn, &active_lifetime_ids)?;
        let phone_numbers = PhoneNumber::get_for(conn, &active_lifetime_ids)?;
        let emails = Email::get_for(conn, &active_lifetime_ids)?;
        let identity_documents = IdentityDocument::get_for(conn, &active_lifetime_ids)?;

        let result = Self::build(
            user_vault,
            seqno,
            scoped_user_id.cloned(),
            data,
            phone_numbers,
            emails,
            identity_documents,
            active_lifetimes,
        );
        Ok(result)
    }

    // TODO: TENANT ACCESS
    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    pub fn multi_get_for_tenant(
        conn: &mut PgConnection,
        users: Vec<(ScopedUser, UserVault)>,
        tenant_id: &TenantId,
    ) -> Result<Vec<Self>, DbError> {
        let uv_ids: Vec<_> = users.iter().map(|(_, uv)| &uv.id).collect();
        let mut uv_id_to_active_lifetimes =
            DataLifetime::get_bulk_active_for_tenant(conn, uv_ids.clone(), tenant_id)?;
        let active_lifetime_list: Vec<_> = uv_id_to_active_lifetimes.values().flatten().collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // UserVaultWrapper for each User
        let mut uvds = UserVaultData::bulk_get(conn, &active_lifetime_list)?;
        let mut phone_numbers = PhoneNumber::bulk_get(conn, &active_lifetime_list)?;
        let mut emails = Email::bulk_get(conn, &active_lifetime_list)?;
        let mut identity_document_map = IdentityDocument::bulk_get(conn, &active_lifetime_list)?;

        // Map over our UserVaults, assembling the UserVaultWrappers from the data we fetched above
        Ok(users
            .into_iter()
            .map(move |(su, uv)| {
                let uv_id = uv.id.clone();
                Self::build(
                    uv,
                    None,
                    Some(su.id),
                    uvds.remove(&uv_id).unwrap_or_default(),
                    phone_numbers.remove(&uv_id).unwrap_or_default(),
                    emails.remove(&uv_id).unwrap_or_default(),
                    identity_document_map.remove(&uv_id).unwrap_or_default(),
                    uv_id_to_active_lifetimes.remove(&uv_id).unwrap_or_default(),
                )
            })
            .collect())
    }
}

impl UserVaultWrapper {
    pub fn create_user_vault(
        conn: &mut TxnPgConnection,
        user_info: NewUserInfo,
        tenant_info: Option<(TenantId, ObConfiguration)>,
        phone_args: NewPhoneNumberArgs,
    ) -> ApiResult<UserVault> {
        let new_user_vault = db::models::user_vault::NewUserVaultArgs {
            e_private_key: user_info.e_private_key,
            public_key: user_info.public_key,
            is_live: user_info.is_live,
            is_portable: true,
        };
        let uv = UserVault::create(conn, new_user_vault)?;
        let su = if let Some((tenant_id, ob_config)) = tenant_info {
            let is_live = ob_config.is_live;
            let su = ScopedUser::get_or_create(conn, uv.id.clone(), tenant_id, is_live, Some(ob_config.id))?;
            Some(su)
        } else {
            None
        };
        // Create a wrapper around this new UserVault that has no data associated with it
        let wrapper = Self::build(
            uv.clone(),
            None,
            su.map(|su| su.id),
            vec![],
            vec![],
            vec![],
            vec![],
            vec![],
        );
        // Safe to make a LockedUVW here because no other transaction can see this UserVault
        let wrapper = LockedUserVaultWrapper::new(wrapper);
        wrapper.add_verified_phone_number(conn, phone_args)?;
        Ok(uv)
    }
}

/// There are a lot of places we build UVWs, under varying circumstances. Things to consider:
///   - Committed and Speculative data:
///       Does the flow need access to both committed AND speculative data?
///   - If the flow needs access to committed data, has the requester been granted access to see the committed data?
///     For example, a tenant shouldn't see committed data they didn't ask to collect (via an authorized OB config)
///
/// Utilities are listed below:
///
/// +--------------------------------+----------------------+------------------------+-----------------------+--------------------------------------+
/// |         Place in Code          | Needs Committed Data | Needs Speculative Data | Check Field Requested |                Method                |
/// +--------------------------------+----------------------+------------------------+-----------------------+--------------------------------------+
/// | Onboarding (incl Requirements) | Y                    | Y                      | N                     | build_for_onboarding(scoped_user_id) |
/// | Decision Engine                | Y                    | Y                      | N                     | build_for_onboarding(scoped_user_id) |
/// | KYC                            | Y                    | Y                      | N                     | build_for_idv(verification_request)  |
/// | my1fp                          | Y                    | N                      | N                     | build_for_user(user_vault_id)        |
/// | Tenant Operations GET/decrypt  | Y                    | Y                      | Y                     | build_for_tenant(scoped_user_id)     |
/// +--------------------------------+----------------------+------------------------+-----------------------+--------------------------------------+
impl UserVaultWrapper {
    /// Builds a UVW that sees ALL committed data and speculative data
    pub fn build_for_onboarding(
        conn: &mut PgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, scoped_user_id)?;
        Self::build_single(conn, user_vault, Some(scoped_user_id), None, false)
    }

    /// Builds a UVW that sees ALL committed data and speculative data
    /// Allows reconstructing a UserVaultWrapper at the time a VerificationRequest was made
    pub fn build_for_idv(conn: &mut PgConnection, request: VerificationRequest) -> Result<Self, DbError> {
        let (_, scoped_user, _, _) = Onboarding::get(conn, &request.onboarding_id)?;
        let user_vault = UserVault::get(conn, &scoped_user.user_vault_id)?;
        Self::build_single(
            conn,
            user_vault,
            Some(&scoped_user.id),
            Some(request.uvw_snapshot_seqno),
            false,
        )
    }
    /// Builds a UVW for a user that sees ALL committed data, or if it's non-portable, just speculative
    pub fn build_for_user(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, user_vault_id)?;
        Self::build_single(conn, user_vault, None, None, false)
    }

    /// Builds a UVW that sees REQUESTED committed data and all speculative data
    pub fn build_for_tenant(conn: &mut PgConnection, scoped_user_id: &ScopedUserId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, scoped_user_id)?;
        // Just to be explicit, if user vault is portable, we need to check OBs have granted tenant access to the fields
        // otherwise, they get everything (everything in non-portable vaults is speculative as of this writing)
        let check_ob_access = user_vault.is_portable;

        Self::build_single(conn, user_vault, Some(scoped_user_id), None, check_ob_access)
    }

    /// Builds a locked UVW that sees committed data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// uncommitted data that has been added by previous operations
    pub fn lock_for_tenant(
        conn: &mut TxnPgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> Result<LockedUserVaultWrapper, DbError> {
        let user_vault = UserVault::lock_by_scoped_user(conn, scoped_user_id)?;
        let uvw = Self::build_single(conn, user_vault, Some(scoped_user_id), None, false)?;

        Ok(LockedUserVaultWrapper::new(uvw))
    }
}
