use super::{Person, VaultWrapper};
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::kv_data::KeyValueData;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::vault::Vault;
use newtypes::IdentityDataKind as IDK;
use newtypes::KvDataKey;
use newtypes::{CollectedDataOption, SealedVaultBytes};
use std::collections::HashMap;
use strum::IntoEnumIterator;

impl VaultWrapper<Person> {
    pub fn missing_identity_fields(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption> {
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| {
                cdo.required_attributes::<IDK>()
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
    pub fn identity_documents(&self) -> &[IdentityDocumentAndRequest] {
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

impl VaultWrapper<Person> {
    pub fn get_identity_e_field(&self, kind: IDK) -> Option<&SealedVaultBytes> {
        self.speculative
            .get_identity_e_field(kind)
            .or_else(|| self.portable.get_identity_e_field(kind))
    }

    pub fn has_identity_field(&self, kind: IDK) -> bool {
        self.get_identity_e_field(kind).is_some()
    }

    pub fn get_populated_identity_fields(&self) -> Vec<IDK> {
        IDK::iter().filter(|k| self.has_identity_field(*k)).collect()
    }

    pub fn get_populated_custom_data(&self) -> Vec<KvDataKey> {
        self.kv_data().keys().cloned().collect()
    }
}

impl VaultWrapper<Person> {
    /// helper to expose a reference/deref coercion to the underlying UV (normally from a LockedVaultWrapper)
    pub fn user_vault(&self) -> &Vault {
        &self.user_vault
    }
}
