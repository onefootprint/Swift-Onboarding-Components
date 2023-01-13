use super::UserVaultWrapper;
use crate::auth::AuthError;
use crate::errors::ApiResult;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::kv_data::KeyValueData;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use db::PgConnection;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::IdentityDataKind;
use newtypes::KvDataKey;
use newtypes::{CollectedDataOption, SealedVaultBytes};
use std::collections::HashMap;
use std::collections::HashSet;
use std::convert::Into;
use strum::IntoEnumIterator;

impl UserVaultWrapper {
    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption> {
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| {
                cdo.required_attributes()
                    .iter()
                    .any(|d| !self.has_identity_field(*d))
            })
            .cloned()
            .collect()
    }

    /// Return speculative phone numbers if exist, otherwise committed. There should only be one
    pub fn phone_numbers(&self) -> &[PhoneNumber] {
        if !self.speculative.phone_numbers.is_empty() {
            &self.speculative.phone_numbers
        } else {
            &self.committed.phone_numbers
        }
    }

    /// Return speculative emails if exist, otherwise committed. There should only be one
    pub fn emails(&self) -> &[Email] {
        if !self.speculative.emails.is_empty() {
            &self.speculative.emails
        } else {
            &self.committed.emails
        }
    }

    /// Return speculative identity_documents if exist, otherwise committed. There should only be one
    pub fn identity_documents(&self) -> &[IdentityDocument] {
        // TODO but do we support committed ID docs?
        if !self.speculative.identity_documents.is_empty() {
            &self.speculative.identity_documents
        } else {
            &self.committed.identity_documents
        }
    }

    pub fn kv_data(&self) -> &HashMap<KvDataKey, KeyValueData> {
        // We don't currently support committed kv data
        &self.speculative.kv_data
    }
}

impl UserVaultWrapper {
    pub fn get_identity_e_field(&self, kind: IdentityDataKind) -> Option<&SealedVaultBytes> {
        self.speculative
            .get_identity_e_field(kind)
            .or_else(|| self.committed.get_identity_e_field(kind))
    }

    pub fn has_identity_field(&self, kind: IdentityDataKind) -> bool {
        self.get_identity_e_field(kind).is_some()
    }

    pub fn get_populated_identity_fields(&self) -> Vec<IdentityDataKind> {
        IdentityDataKind::iter()
            .filter(|k| self.has_identity_field(*k))
            .collect()
    }
}

// TODO: confusing when to use these. Do we need them after new decrypt utils?
impl UserVaultWrapper {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn ensure_scope_allows_access<T>(
        &self,
        conn: &mut PgConnection,
        scoped_user: &ScopedUser,
        fields: Vec<T>,
    ) -> ApiResult<()>
    where
        T: Into<DataIdentifier>,
    {
        // tenants can do what they wish with NON-portable vaults they own
        if !self.user_vault.is_portable {
            return Ok(());
        }

        let ob_configs = ObConfiguration::list_authorized_for_user(conn, scoped_user.id.clone())?;
        let can_access: HashSet<_> = ob_configs.into_iter().flat_map(|x| x.can_access()).collect();
        let cannot_access_fields = fields
            .into_iter()
            .map(|x| x.into())
            .filter(|x| !can_access.contains(x))
            .collect_vec();
        if !cannot_access_fields.is_empty() {
            return Err(AuthError::ObConfigMissingDecryptPermission(cannot_access_fields).into());
        }

        Ok(())
    }

    /// Retrieve the fields that the tenant has requested/gotten authorized access to collect
    ///
    /// Note: This is not checking `READ` permissions of data, e.g. fields that the tenant can actually decrypt.
    ///    For that, use `ensure_scope_allows_access`. This is just for displaying what data the tenant _collected_.
    ///    This is what we display in /users, and it would be a little weird to collect, but then not display the info we collected anywhere.
    pub fn get_accessible_populated_fields(
        &self,
        ob_configs: &[ObConfiguration],
    ) -> (Vec<IdentityDataKind>, Vec<String>) {
        // TODO maybe put this on ObUserVaultWrapper and pre-load ob configs
        let must_collect: HashSet<_> = ob_configs.iter().flat_map(|x| x.must_collect()).collect();

        let accessible_id_data = self
            .get_populated_identity_fields()
            .into_iter()
            .filter(|x| must_collect.contains(&DataIdentifier::Id(*x)))
            .collect();
        let accessible_document_types = if must_collect.contains(&DataIdentifier::IdDocument) {
            self.identity_documents()
                .iter()
                .map(|i| i.document_type.clone())
                .unique()
                .collect()
        } else {
            vec![]
        };
        (accessible_id_data, accessible_document_types)
    }
}

impl UserVaultWrapper {
    /// helper to expose a reference/deref coercion to the underlying UV (normally from a LockedUserVaultWrapper)
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }
}
