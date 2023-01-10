use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocument;
use db::models::phone_number::PhoneNumber;
use db::models::user_vault_data::UserVaultData;
use db::HasDataAttributeFields;
use db::HasLifetime;
use newtypes::{DataLifetimeId, DataLifetimeKind, SealedVaultBytes};
use std::collections::{HashMap, HashSet};
use std::convert::Into;

#[derive(Clone, Debug)]
pub(super) struct UvwData {
    pub(super) uvd: Vec<UserVaultData>,
    pub(super) phone_numbers: Vec<PhoneNumber>,
    pub(super) emails: Vec<Email>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    pub(super) identity_documents: Vec<IdentityDocument>,

    // A map of all of the DataLifetimes for this data.
    lifetimes: HashMap<DataLifetimeId, DataLifetime>,
}

impl UvwData {
    pub(super) fn partition(
        uvd: Vec<UserVaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocument>,
        all_lifetimes: Vec<DataLifetime>,
    ) -> (Self, Self) {
        let speculative_lifetime_ids: HashSet<_> = all_lifetimes
            .iter()
            .filter(|l| l.committed_seqno.is_some())
            .map(|l| l.id.clone())
            .collect();

        // Partition each piece of data by committed / speculative
        fn partition<T: HasLifetime>(
            data: Vec<T>,
            speculative_lifetime_ids: &HashSet<DataLifetimeId>,
        ) -> (Vec<T>, Vec<T>) {
            data.into_iter()
                .partition(|d| speculative_lifetime_ids.contains(d.lifetime_id()))
        }
        let (committed_uvd, speculative_uvd) = partition(uvd, &speculative_lifetime_ids);
        let (committed_phone_numbers, speculative_phone_numbers) =
            partition(phone_numbers, &speculative_lifetime_ids);
        let (committed_emails, speculative_emails) = partition(emails, &speculative_lifetime_ids);
        let (committed_identity_documents, speculative_identity_documents) =
            partition(identity_documents, &speculative_lifetime_ids);

        let committed = Self::build(
            committed_uvd,
            committed_phone_numbers,
            committed_emails,
            committed_identity_documents,
            &all_lifetimes,
        );
        let speculative = Self::build(
            speculative_uvd,
            speculative_phone_numbers,
            speculative_emails,
            speculative_identity_documents,
            &all_lifetimes,
        );
        (committed, speculative)
    }

    fn build(
        uvd: Vec<UserVaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocument>,
        all_lifetimes: &[DataLifetime],
    ) -> Self {
        let lifetime_ids: Vec<Vec<_>> = vec![
            uvd.iter().map(|d| d.lifetime_id()).collect(),
            phone_numbers.iter().map(|d| d.lifetime_id()).collect(),
            emails.iter().map(|d| d.lifetime_id()).collect(),
            identity_documents.iter().map(|d| d.lifetime_id()).collect(),
        ];
        let lifetime_ids: HashSet<_> = lifetime_ids.into_iter().flatten().collect();
        // Since all_lifetimes contains a superset of lifetimes represented by the data in this
        // UvwData, we filter for only the lifetimes whose data are stored in this UvwData
        let lifetimes: HashMap<_, _> = all_lifetimes
            .iter()
            .filter(|l| lifetime_ids.contains(&l.id))
            .cloned()
            .map(|l| (l.id.clone(), l))
            .collect();

        Self {
            uvd,
            phone_numbers,
            emails,
            identity_documents,
            lifetimes,
        }
    }

    fn uvd(&self, kind: DataLifetimeKind) -> Option<&UserVaultData> {
        self.uvd
            .iter()
            .find(|d| Into::<DataLifetimeKind>::into(d.kind) == kind)
    }

    /// Dispatch queries for a piece of data with a given DataAttribute kind to the underlying data
    /// model that actually stores this data.
    /// If exists, returns a trait object that allows reading the underlying data
    pub(super) fn get(&self, kind: &DataLifetimeKind) -> Option<&dyn HasLifetime> {
        let email = self.emails.first();
        let phone = self.phone_numbers.first();
        match kind {
            // uvd
            DataLifetimeKind::FirstName
            | DataLifetimeKind::LastName
            | DataLifetimeKind::Dob
            | DataLifetimeKind::Ssn9
            | DataLifetimeKind::AddressLine1
            | DataLifetimeKind::AddressLine2
            | DataLifetimeKind::City
            | DataLifetimeKind::State
            | DataLifetimeKind::Zip
            | DataLifetimeKind::Country
            | DataLifetimeKind::Ssn4 => self.uvd(*kind).map(|uvd| uvd as &dyn HasLifetime),
            // email
            DataLifetimeKind::Email => email.map(|email| email as &dyn HasLifetime),
            // phone
            DataLifetimeKind::PhoneNumber => phone.map(|phone| phone as &dyn HasLifetime),
            // We need to handle identity document/custom data separately since users can have multiple identity documents (for now, there's an open item https://linear.app/footprint/issue/FP-1968/de-chonk-the-identitydocument-dataattribute)
            DataLifetimeKind::IdentityDocument => None,
            DataLifetimeKind::Custom => None,
        }
    }

    pub(super) fn get_lifetime(&self, kind: &DataLifetimeKind) -> Option<&DataLifetime> {
        self.get(kind).and_then(|d| {
            let lifetime_id = d.lifetime_id();
            self.lifetimes.get(lifetime_id)
        })
    }

    pub(super) fn get_lifetimes<'a, T>(&self, kinds: T) -> Vec<&DataLifetime>
    where
        T: IntoIterator<Item = &'a DataLifetimeKind>,
    {
        kinds.into_iter().flat_map(|k| self.get_lifetime(k)).collect()
    }
}

impl HasDataAttributeFields for UvwData {
    fn get_e_field(&self, data_attribute: DataLifetimeKind) -> Option<&SealedVaultBytes> {
        // NOTE: this prevents us from ever committing IdentityDocuments
        if data_attribute.disallows_e_data() {
            return None;
        }

        let value = self.get(&data_attribute);
        value.map(|v| v.e_data())
    }

    fn has_field(&self, data_attribute: DataLifetimeKind) -> bool {
        match data_attribute {
            // UVData is stored differently than IdentityDocuments
            DataLifetimeKind::IdentityDocument => !self.identity_documents.is_empty(),
            _ => self.get_e_field(data_attribute).is_some(),
        }
    }
}
