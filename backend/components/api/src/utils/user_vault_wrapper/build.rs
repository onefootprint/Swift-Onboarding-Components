use super::uvw_data::UvwData;
use super::UserVaultWrapper;
use crate::errors::ApiError;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::onboarding::Onboarding;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use db::models::user_vault_data::UserVaultData;
use db::models::verification_request::VerificationRequest;
use db::HasLifetime;
use db::TxnPgConnection;
use db::{errors::DbError, PgConnection};
use newtypes::{DataLifetimeSeqno, ScopedUserId, TenantId};
use std::marker::PhantomData;

impl UserVaultWrapper {
    #[allow(clippy::too_many_arguments)]
    fn build(
        user_vault: UserVault,
        seqno: Option<DataLifetimeSeqno>,
        scoped_user_id: Option<ScopedUserId>,
        is_locked: bool,
        uvd: Vec<UserVaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocument>,
        lifetimes: Vec<DataLifetime>,
    ) -> Self {
        let (committed, speculative) =
            UvwData::partition(uvd, phone_numbers, emails, identity_documents, lifetimes);
        Self {
            user_vault,
            committed,
            speculative,
            _seqno: seqno,
            scoped_user_id,
            is_locked,
            is_hydrated: PhantomData,
        }
    }

    fn build_single(
        conn: &mut PgConnection,
        user_vault: UserVault,
        scoped_user_id: Option<&ScopedUserId>,
        is_locked: bool,
        seqno: Option<DataLifetimeSeqno>,
    ) -> Result<Self, DbError> {
        let active_lifetimes = if let Some(seqno) = seqno {
            // We are reconstructing the UVW as it appeared at a given seqno
            DataLifetime::get_active_at(conn, &user_vault.id, scoped_user_id, seqno)?
        } else {
            // We are constructing the UVW as it appears right now
            DataLifetime::get_active(conn, &user_vault.id, scoped_user_id)?
        };
        let active_lifetime_ids: Vec<_> = active_lifetimes.iter().map(|l| l.id.clone()).collect();

        // Fetch all the data related to the active lifetimes
        // Split into committed + uncommitted data
        let data = UserVaultData::get_for(conn, &active_lifetime_ids)?;
        let phone_numbers = PhoneNumber::get_for(conn, &active_lifetime_ids)?;
        let emails = Email::get_for(conn, &active_lifetime_ids)?;

        // TODO migrate this to DataLifetimes
        let identity_documents = IdentityDocument::get_for_user_vault_id(conn, &user_vault.id)?;

        let result = Self::build(
            user_vault,
            seqno,
            scoped_user_id.cloned(),
            is_locked,
            data,
            phone_numbers,
            emails,
            identity_documents,
            active_lifetimes,
        );
        Ok(result)
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    pub fn multi_get_for_tenant(
        conn: &mut PgConnection,
        users: Vec<(ScopedUser, UserVault)>,
        tenant_id: &TenantId,
    ) -> Result<Vec<Self>, DbError> {
        let uv_ids: Vec<_> = users.iter().map(|su| &su.1.id).collect();
        let mut uv_id_to_active_lifetimes =
            DataLifetime::get_bulk_active_for_tenant(conn, uv_ids.clone(), tenant_id)?;
        let active_lifetime_list: Vec<_> = uv_id_to_active_lifetimes.values().flatten().collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // UserVaultWrapper for each User
        let mut uvds = UserVaultData::bulk_get(conn, &active_lifetime_list)?;
        let mut phone_numbers = PhoneNumber::bulk_get(conn, &active_lifetime_list)?;
        let mut emails = Email::bulk_get(conn, &active_lifetime_list)?;

        // Fetch all the identity documents for the user vault ids
        let mut identity_document_map = IdentityDocument::multi_get_for_user_vault_ids(conn, uv_ids)?;

        // Map over our UserVaults, assembling the UserVaultWrappers from the data we fetched above
        Ok(users
            .into_iter()
            .map(move |(su, uv)| {
                let uv_id = uv.id.clone();
                Self::build(
                    uv,
                    None,
                    Some(su.id),
                    false,
                    uvds.remove(&uv_id).unwrap_or_default(),
                    phone_numbers.remove(&uv_id).unwrap_or_default(),
                    emails.remove(&uv_id).unwrap_or_default(),
                    identity_document_map.remove(&uv_id).unwrap_or_default(),
                    uv_id_to_active_lifetimes.remove(&uv_id).unwrap_or_default(),
                )
            })
            .collect())
    }

    // Allows reconstructing a UserVaultWrapper at the time a VerificationRequest was made
    pub fn from_verification_request(
        conn: &mut PgConnection,
        request: VerificationRequest,
    ) -> Result<Self, DbError> {
        let (_, scoped_user, _, _) = Onboarding::get(conn, &request.onboarding_id)?;
        let user_vault = UserVault::get(conn, &scoped_user.user_vault_id)?;
        Self::build_single(
            conn,
            user_vault,
            Some(&scoped_user.id),
            false,
            Some(request.uvw_snapshot_seqno),
        )
    }

    /// Builds a UVW that only sees committed data.
    pub fn get_committed(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        Self::build_single(conn, user_vault, None, false, None)
    }

    /// Builds a UVW that sees committed data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// uncommitted data that has been added by previous operations
    pub fn get_for_tenant(conn: &mut PgConnection, scoped_user_id: &ScopedUserId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, scoped_user_id)?;
        Self::build_single(conn, user_vault, Some(scoped_user_id), false, None)
    }

    /// Builds a locked UVW that sees committed data AND speculative data for the tenant.
    /// This should be used during onboarding operations in order to allow the tenant to see
    /// uncommitted data that has been added by previous operations
    pub fn lock_for_tenant(
        conn: &mut TxnPgConnection,
        scoped_user_id: &ScopedUserId,
    ) -> Result<Self, DbError> {
        let user_vault = UserVault::lock(conn, scoped_user_id)?;
        Self::build_single(conn, user_vault, Some(scoped_user_id), true, None)
    }

    pub fn assert_is_locked(&self, _conn: &mut TxnPgConnection) -> Result<(), ApiError> {
        // Accept _conn to make sure we pass in a TxnPgConnection, not PgConnection
        if !self.is_locked {
            Err(ApiError::UserNotLocked)
        } else {
            Ok(())
        }
    }
}
