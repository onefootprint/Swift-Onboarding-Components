use super::VaultWrapper;
use db::models::vault::Vault;
use db::models::vault_data::VaultData;
use db::HasLifetime;
use db::VaultedData;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DocumentKind;
use newtypes::IsDataIdentifierDiscriminant;
use newtypes::PiiString;
use newtypes::SealedVaultBytes;

impl<Type> VaultWrapper<Type> {
    /// helper to expose a reference/deref coercion to the underlying vault (normally from a LockedVaultWrapper)
    pub fn vault(&self) -> &Vault {
        &self.vault
    }

    pub fn populated_dis(&self) -> Vec<DataIdentifier> {
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

    /// Get the VaultData row for the provided id, if exists
    pub fn get<T>(&self, id: T) -> Option<&VaultData>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.speculative.get(id.clone()).or_else(|| self.portable.get(id))
    }

    /// Get the VaultedData (encrypted or plaintext) for the provided id, if exists
    pub fn get_data<T>(&self, id: T) -> Option<VaultedData>
    where
        T: Into<DataIdentifier> + Clone,
    {
        // TODO we should do this in VaultWrapperData, not here
        let id = id.into();
        // First see if we can the DI is stored in the document table
        if let DataIdentifier::Document(ref d) = id {
            let lookup_di = match d {
                // Get mime_type from the parent DocumentData
                DocumentKind::MimeType(doc_kind, side) => {
                    DocumentKind::from_id_doc_kind(*doc_kind, *side).into()
                }
                _ => id.clone(),
            };
            let document = self
                .speculative
                .get_document(&lookup_di)
                .or_else(|| self.portable.get_document(&lookup_di));
            if let Some(document) = document {
                let data = match d {
                    // This is weird - get the mime type from the document row
                    DocumentKind::MimeType(_, _) => VaultedData::NonPrivate(&document.mime_type),
                    _ => document.data(),
                };
                return Some(data);
            }
        }
        // Otherwise surface from the VaultData table. OCR data lives here too.
        self.get(id).map(|v| v.data())
    }

    /// Get the encrypted data for the provided data identifier.
    /// Returns None if the id doesn't exist in the vault
    pub fn get_e_data<T>(&self, id: T) -> Option<&SealedVaultBytes>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.get(id).map(|v| &v.e_data)
    }

    /// Get the plaintext data for the provided data identifier.
    /// Returns None if the id doesn't exist in the vault or the id is encrypted
    pub fn get_p_data<T>(&self, id: T) -> Option<&PiiString>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.get(id).and_then(|v| v.p_data.as_ref())
    }
}
