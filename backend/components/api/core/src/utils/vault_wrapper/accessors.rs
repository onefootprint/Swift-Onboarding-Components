use super::VaultWrapper;
use db::models::data_lifetime::DataLifetime;
use db::models::vault::Vault;
use db::HasLifetime;
use db::VaultedData;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::IsDataIdentifierDiscriminant;
use newtypes::PiiString;

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

    /// Dispatch queries for a piece of data with a given identifier to the underlying data
    /// model that actually stores this data.
    /// If exists, returns a trait object that allows reading the underlying data.
    pub fn get<T>(&self, id: T) -> Option<&dyn HasLifetime>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.speculative.get(id.clone()).or_else(|| self.portable.get(id))
    }

    /// Returns the visible liftime for the given DI, if exists
    pub fn get_lifetime<T: Into<DataIdentifier> + Clone>(&self, id: T) -> Option<&DataLifetime> {
        self.speculative
            .get_lifetime(id.clone())
            .or_else(|| self.portable.get_lifetime(id))
    }

    /// If the provided DI is a document, return the mime type
    pub fn get_mime_type<T>(&self, id: T) -> Option<&str>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.speculative
            .get_mime_type(id.clone())
            .or_else(|| self.portable.get_mime_type(id))
    }

    /// Get the plaintext data for the provided data identifier.
    /// Returns None if the id doesn't exist in the vault or the id is encrypted
    pub fn get_p_data<T>(&self, id: T) -> Option<&PiiString>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.get(id).and_then(|v| match v.data() {
            VaultedData::NonPrivate(s, _) => Some(s),
            _ => None,
        })
    }
}

#[cfg(test)]
impl<Type> VaultWrapper<Type> {
    /// Get the encrypted data for the provided data identifier.
    /// Returns None if the id doesn't exist in the vault
    pub fn get_e_data<T>(&self, id: T) -> Option<&newtypes::SealedVaultBytes>
    where
        T: Into<DataIdentifier> + Clone,
    {
        self.get(id).and_then(|v| match v.data() {
            VaultedData::Sealed(s, _) => Some(s),
            _ => None,
        })
    }
}
