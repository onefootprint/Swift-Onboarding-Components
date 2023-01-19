use super::UserVaultWrapper;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::kv_data::KeyValueData;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::user_vault::UserVault;
use newtypes::IdentityDataKind;
use newtypes::KvDataKey;
use newtypes::{CollectedDataOption, SealedVaultBytes};
use std::collections::HashMap;
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

    /// Return speculative phone numbers if exist, otherwise portable. There should only be one
    pub fn phone_numbers(&self) -> &[PhoneNumber] {
        if !self.speculative.phone_numbers.is_empty() {
            &self.speculative.phone_numbers
        } else {
            &self.portable.phone_numbers
        }
    }

    /// Return speculative emails if exist, otherwise portable. There should only be one
    pub fn emails(&self) -> &[Email] {
        if !self.speculative.emails.is_empty() {
            &self.speculative.emails
        } else {
            &self.portable.emails
        }
    }

    /// Return speculative identity_documents if exist, otherwise portable. There should only be one
    pub fn identity_documents(&self) -> &[IdentityDocument] {
        // TODO but do we support portable ID docs?
        if !self.speculative.identity_documents.is_empty() {
            &self.speculative.identity_documents
        } else {
            &self.portable.identity_documents
        }
    }

    pub fn kv_data(&self) -> &HashMap<KvDataKey, KeyValueData> {
        // We don't currently support portable kv data
        &self.speculative.kv_data
    }
}

impl UserVaultWrapper {
    pub fn get_identity_e_field(&self, kind: IdentityDataKind) -> Option<&SealedVaultBytes> {
        self.speculative
            .get_identity_e_field(kind)
            .or_else(|| self.portable.get_identity_e_field(kind))
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

impl UserVaultWrapper {
    /// helper to expose a reference/deref coercion to the underlying UV (normally from a LockedUserVaultWrapper)
    pub fn user_vault(&self) -> &UserVault {
        &self.user_vault
    }
}
