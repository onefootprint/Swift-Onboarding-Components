use super::UserVaultWrapper;
use crate::errors::ApiResult;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::scoped_user::ScopedUser;
use db::models::user_vault::UserVault;
use db::HasDataAttributeFields;
use db::PgConnection;
use newtypes::ScopedUserId;
use newtypes::{CollectedDataOption, DataLifetimeKind, SealedVaultBytes};
use std::collections::HashSet;
use std::convert::Into;

impl UserVaultWrapper {
    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption> {
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| cdo.required_attributes().iter().any(|d| !self.has_field(*d)))
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
        if !self.speculative.identity_documents.is_empty() {
            &self.speculative.identity_documents
        } else {
            &self.committed.identity_documents
        }
    }
}

impl HasDataAttributeFields for UserVaultWrapper {
    fn get_e_field(&self, data_attribute: DataLifetimeKind) -> Option<&SealedVaultBytes> {
        self.speculative
            .get_e_field(data_attribute)
            .or_else(|| self.committed.get_e_field(data_attribute))
    }

    fn has_field(&self, data_attribute: DataLifetimeKind) -> bool {
        self.speculative.has_field(data_attribute) || self.committed.has_field(data_attribute)
    }
}

impl UserVaultWrapper {
    /// if the vault is PORTABLE: check permissions on the scoped user onboarding configuration
    /// don't allow the tenant to know if data is set without having permission for the the value
    pub fn ensure_scope_allows_access(
        &self,
        conn: &mut PgConnection,
        scoped_user: &ScopedUser,
        fields: HashSet<DataLifetimeKind>,
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

    /// We don't allow a tenant to know if data is in the Vault without having an authorized OBConfig that wanted to collect those fields
    pub fn data_fields_tenant_requested_to_collect(
        &self,
        // Ideally we'd take a scoped user and calculate this here,
        // but /users does some bulk fetching and this makes it easier
        ob_configs: Vec<ObConfiguration>,
    ) -> Vec<DataLifetimeKind> {
        // As of 2022-11, ob<>scoped user is 1-1
        let intent_to_collect_attributes: HashSet<DataLifetimeKind> = ob_configs
            .into_iter()
            .flat_map(|x| x.intent_to_collect_fields())
            .collect();
        let fields_present_in_vault: HashSet<DataLifetimeKind> =
            HashSet::from_iter(self.get_populated_fields().into_iter());

        (intent_to_collect_attributes.intersection(&fields_present_in_vault))
            .into_iter()
            .cloned()
            .collect::<Vec<_>>()
    }
    /// Retrieve the fields that the tenant has requested/gotten authorized access to collect
    ///
    /// Note: This is not checking `READ` permissions of data, e.g. fields that the tenant can actually decrypt.
    ///    For that, use `ensure_scope_allows_access`. This is just for displaying what data the tenant _collected_.
    ///    This is what we display in /users, and it would be a little weird to collect, but then not display the info we collected anywhere.
    pub fn get_accessible_populated_fields(
        &self,
        ob_configs: Vec<ObConfiguration>,
    ) -> (Vec<DataLifetimeKind>, Vec<String>) {
        let accessible_fields: HashSet<DataLifetimeKind> = HashSet::from_iter(
            self.data_fields_tenant_requested_to_collect(ob_configs)
                .into_iter(),
        );
        let document_types = if accessible_fields.contains(&DataLifetimeKind::IdentityDocument) {
            self.get_identity_document_types()
        } else {
            vec![]
        };
        let data_attributes: Vec<DataLifetimeKind> =
            HashSet::from_iter(self.get_populated_fields().iter().cloned())
                .intersection(&accessible_fields)
                .into_iter()
                .cloned()
                .collect::<Vec<_>>();

        (data_attributes, document_types)
    }
}

impl UserVaultWrapper {
    /// helper to expose a reference/deref coercion to the underlying UV (normally from a LockedUserVaultWrapper)
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }

    /// helper to expose a reference/deref coercion to the underlying UV (normally from a LockedUserVaultWrapper)
    pub fn scoped_user_id(&self) -> Option<&ScopedUserId> {
        self.scoped_user_id.as_ref()
    }
}
