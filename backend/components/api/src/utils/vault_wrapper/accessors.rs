use super::{Person, VaultWrapper};
use db::models::document_data::DocumentData;
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::vault::Vault;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DocumentKind;
use newtypes::IsDataIdentifierDiscriminant;
use newtypes::{CollectedDataOption, SealedVaultBytes};

impl VaultWrapper<Person> {
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

impl<Type> VaultWrapper<Type> {
    /// helper to expose a reference/deref coercion to the underlying vault (normally from a LockedVaultWrapper)
    pub fn vault(&self) -> &Vault {
        &self.vault
    }

    pub(super) fn populated_dis(&self) -> Vec<DataIdentifier> {
        self.speculative
            .populated_dis()
            .into_iter()
            .chain(self.portable.populated_dis())
            .unique()
            .collect()
    }

    pub fn populated<T>(&self) -> Vec<T>
    where
        T: IsDataIdentifierDiscriminant,
    {
        self.populated_dis()
            .into_iter()
            .filter_map(|di| di.try_into().ok())
            .collect()
    }

    pub fn has_field<T>(&self, id: T) -> bool
    where
        T: Into<DataIdentifier>,
    {
        self.populated_dis().contains(&id.into())
    }

    pub fn get_e_data<T>(&self, id: T) -> Option<&SealedVaultBytes>
    where
        T: Into<DataIdentifier> + Clone,
    {
        // Show portable data if visible
        self.speculative
            .get_e_data(id.clone())
            .or_else(|| self.portable.get_e_data(id))
    }

    pub fn missing_fields<T>(&self, ob_config: &ObConfiguration) -> Vec<CollectedDataOption>
    where
        T: IsDataIdentifierDiscriminant,
    {
        // can we generify this to share with missing_id_fields?
        // can we instead use populated_dis?
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| {
                cdo.required_attributes::<T>()
                    .iter()
                    .any(|d| !self.populated::<T>().contains(d))
            })
            .cloned()
            .collect()
    }

    pub fn get_document(&self, kind: DocumentKind) -> Option<&DocumentData> {
        self.speculative
            .get_document(kind)
            .or_else(|| self.portable.get_document(kind))
    }
}
