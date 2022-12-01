use db::models::identity_data::IdentityData;
use db::models::identity_document::IdentityDocument;
use db::models::onboarding::Onboarding;
use db::models::scoped_user::ScopedUser;

use db::models::verification_request::VerificationRequest;
use db::TxnPgConnection;

use db::models::email::Email;

use paperclip::actix::Apiv2Schema;

use std::collections::{HashMap, HashSet};
use std::marker::PhantomData;

use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;

use db::models::user_vault::UserVault;
use db::{errors::DbError, PgConnection};
use newtypes::{DataAttribute, UserVaultId};

use crate::errors::{ApiError, ApiResult};

/// UserVaultWrapper represents the current "state" of the UserVault - the most up to date and complete information we have
/// about a particular user.
///
/// In other words, the UserVault is a major dividing line in Footprint's product.
///    1. the API routes and backend logic determine `OnboardingRequirements` that the frontend knows how to collect.
///    2. The information collected is stashed in various tables (see the impls below for the actual locations)
///    3. The decision engine and verification logic _only knows about what's in the UserVault_
///         * it is the information we send to vendors (a UVW gets "serialized" in a `VerificationRequest` in the decision engine)
///         * it is the source of truth to know what we datums we have collected from a User
///
/// See the individual `user_vault_wrapper_*` files for methods related to working with documents and identity data
#[derive(Debug, Clone)]
pub struct UserVaultWrapper {
    pub user_vault: UserVault,
    pub identity_data: Option<IdentityData>,
    pub phone_number: Option<PhoneNumber>,
    pub email: Option<Email>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    pub identity_documents: Vec<IdentityDocument>,
    is_locked: bool,
    // Represents whether we have fetched the appropriate data
    is_hydrated: PhantomData<()>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Serialize, serde::Deserialize, Apiv2Schema)]
pub struct DecryptRequest {
    pub reason: String,
}

impl UserVaultWrapper {
    fn build_internal(
        conn: &mut PgConnection,
        user_vault: UserVault,
        is_locked: bool,
    ) -> Result<Self, DbError> {
        let identity_data = IdentityData::get_active(conn, &user_vault.id)?;
        let phone_number = PhoneNumber::get_primary(conn, &user_vault.id)?;
        let email = Email::get_primary(conn, &user_vault.id)?;
        let identity_documents = IdentityDocument::get_for_user_vault_id(conn, &user_vault.id)?;

        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            identity_documents,
            is_locked,
            is_hydrated: PhantomData,
        })
    }

    // In order to minimize database queries, we would like to be able to bulk fetch
    // various data elements for a set of Users.
    fn multi_build_internal(
        conn: &mut PgConnection,
        user_vaults: Vec<UserVault>,
        is_locked: bool,
    ) -> Result<Vec<Self>, DbError> {
        let uv_ids: Vec<UserVaultId> = user_vaults.iter().map(|uv| uv.id.clone()).collect();

        // For each data source, fetch data _for all users_ in the `user_vaults` list in a single DB transaction.
        // We then build a HashMap of UserVaultId -> Data object in order to build our final
        // UserVaultWrapper for each User
        let mut identity_data: HashMap<UserVaultId, IdentityData> =
            IdentityData::bulk_get_active(conn, &uv_ids)?
                .into_iter()
                .map(|id| (id.user_vault_id.clone(), id))
                .collect();
        let mut phone_number: HashMap<UserVaultId, PhoneNumber> =
            PhoneNumber::bulk_get_primary(conn, &uv_ids)?
                .into_iter()
                .map(|phone| (phone.user_vault_id.clone(), phone))
                .collect();
        let mut email: HashMap<UserVaultId, Email> = Email::bulk_get_primary(conn, &uv_ids)?
            .into_iter()
            .map(|email| (email.user_vault_id.clone(), email))
            .collect();

        // Fetch all the identity documents for the user vault ids
        let mut identity_document_map = IdentityDocument::multi_get_for_user_vault_ids(conn, &uv_ids)?;

        // Map over our UserVaults, assembling the UserVaultWrappers from the data we fetched above
        Ok(user_vaults
            .into_iter()
            .map(move |uv| {
                let uv_id = uv.id.clone();
                Self {
                    identity_data: identity_data.remove(&uv_id),
                    user_vault: uv,
                    phone_number: phone_number.remove(&uv_id),
                    email: email.remove(&uv_id),
                    identity_documents: identity_document_map.remove(&uv_id).unwrap_or_default(),
                    is_locked,
                    is_hydrated: PhantomData,
                }
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
        let email = request
            .email_id
            .map(|id| Email::get(conn, &id, &user_vault.id))
            .transpose()?
            .map(|(email, _)| email);
        let phone_number = request
            .phone_number_id
            .map(|id| PhoneNumber::get(conn, &id, &user_vault.id))
            .transpose()?;
        let identity_data = request
            .identity_data_id
            .map(|id| IdentityData::get(conn, &id, &user_vault.id))
            .transpose()?;

        let identity_document = request
            .identity_document_id
            .map(|id| IdentityDocument::get(conn, &id))
            .transpose()?;

        Ok(Self {
            identity_data,
            user_vault,
            phone_number,
            email,
            identity_documents: vec![identity_document].into_iter().flatten().collect(),
            is_locked: false,
            is_hydrated: PhantomData,
        })
    }

    pub fn build(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        Self::build_internal(conn, user_vault, false)
    }

    pub fn lock(conn: &mut TxnPgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::lock(conn, id)?;
        let uvw = Self::build_internal(conn, user_vault, true)?;
        Ok(uvw)
    }

    pub fn get(conn: &mut PgConnection, id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, id)?;
        let uvw = Self::build_internal(conn, user_vault, false)?;
        Ok(uvw)
    }

    pub fn multi_get(conn: &mut PgConnection, ids: Vec<&UserVaultId>) -> Result<Vec<Self>, DbError> {
        let user_vaults = UserVault::multi_get(conn, ids)?;
        let uvw = Self::multi_build_internal(conn, user_vaults, false)?;
        Ok(uvw)
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

impl UserVaultWrapper {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn ensure_scope_allows_access(
        &self,
        conn: &mut PgConnection,
        scoped_user: &ScopedUser,
        fields: HashSet<DataAttribute>,
    ) -> ApiResult<()> {
        // tenant's can do what they wish with NON-portable vaults they own
        if !self.user_vault.is_portable {
            return Ok(());
        }

        let ob_configs = ObConfiguration::list_authorized_for_user(conn, scoped_user.id.clone())?;
        let can_access_attributes: HashSet<_> = ob_configs
            .into_iter()
            .flat_map(|x| x.can_access_fields())
            .collect();
        if !can_access_attributes.is_superset(&fields) {
            return Err(crate::auth::AuthError::ObConfigMissingDecryptPermission.into());
        }

        Ok(())
    }
}
