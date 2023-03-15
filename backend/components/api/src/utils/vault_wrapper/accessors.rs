use super::Business;
use super::{Person, VaultWrapper};
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use newtypes::IdentityDataKind as IDK;
use newtypes::KvDataKey;
use newtypes::{BusinessDataKind as BDK, VdKind};
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

impl VaultWrapper<Business> {
    pub fn get_business_e_field(&self, kind: BDK) -> Option<&SealedVaultBytes> {
        self.speculative
            .get_business_data_e_field(kind)
            .or_else(|| self.portable.get_business_data_e_field(kind))
    }

    pub fn has_business_field(&self, kind: BDK) -> bool {
        self.get_business_e_field(kind).is_some()
    }

    pub fn get_populated_business_fields(&self) -> Vec<BDK> {
        BDK::iter()
            .filter(|k| self.get_business_e_field(*k).is_some())
            .collect()
    }

    pub fn missing_business_fields(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption> {
        // can we generify this to share with missing_id_fields?
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| {
                cdo.required_attributes::<BDK>()
                    .iter()
                    .any(|d| !self.has_business_field(*d))
            })
            .cloned()
            .collect()
    }
}

impl<Type> VaultWrapper<Type> {
    /// helper to expose a reference/deref coercion to the underlying vault (normally from a LockedVaultWrapper)
    pub fn vault(&self) -> &Vault {
        &self.vault
    }

    pub fn kv_data(&self) -> HashMap<KvDataKey, &VaultData> {
        // We don't currently support portable kv data
        self.speculative
            .vd
            .iter()
            .filter_map(|vd| match vd.kind {
                VdKind::Custom(ref kv_key) => Some((kv_key.clone(), vd)),
                _ => None,
            })
            .collect()
    }
}
