use super::{Person, VaultWrapper};
use db::models::document_data::DocumentData;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::ob_configuration::ObConfiguration;
use db::models::vault::Vault;
use db::HasSealedIdentityData;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataIdentifierDiscriminant;
use newtypes::DocumentKind;
use newtypes::IsDataIdentifierDiscriminant;
use newtypes::{CollectedDataOption, SealedVaultBytes};

impl VaultWrapper<Person> {
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

    pub fn get<T>(&self, id: T) -> Option<&dyn HasSealedIdentityData>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.speculative.get(id.clone()).or_else(|| self.portable.get(id))
    }

    pub fn get_e_data<T>(&self, id: T) -> Option<&SealedVaultBytes>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.get(id).map(|v| v.e_data())
    }

    pub fn missing_fields(
        &self,
        ob_config: &ObConfiguration,
        di_kind: DataIdentifierDiscriminant,
    ) -> Vec<CollectedDataOption> {
        ob_config
            .must_collect_data
            .iter()
            .filter(|cdo| cdo.parent().data_identifier_kind() == di_kind)
            .filter(|cdo| {
                cdo.required_data_identifiers()
                    .into_iter()
                    .any(|d| !self.populated_dis().contains(&d))
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
