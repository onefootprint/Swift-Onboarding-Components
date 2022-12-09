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

    // A map of all of the DataLifetimes for this data
    pub(super) lifetimes: HashMap<DataLifetimeId, DataLifetime>,
}

impl UvwData {
    pub(super) fn partition(
        uvd: Vec<UserVaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocument>,
        lifetimes: Vec<DataLifetime>,
    ) -> (Self, Self) {
        // Partition lifetimes by committed / speculative
        let (committed_lifetimes, speculative_lifetimes): (Vec<_>, Vec<_>) =
            // should we also double check if this speculative data belongs to the scoped user?
            // or do we just assume
            lifetimes.into_iter().partition(|l| l.committed_seqno.is_some());
        let speculative_lifetime_ids = HashSet::from_iter(speculative_lifetimes.iter().map(|l| l.id.clone()));

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

        fn map(v: Vec<DataLifetime>) -> HashMap<DataLifetimeId, DataLifetime> {
            HashMap::from_iter(v.into_iter().map(|v| (v.id.clone(), v)))
        }

        // Construct the UvwData structs
        let committed = Self {
            uvd: committed_uvd,
            phone_numbers: committed_phone_numbers,
            emails: committed_emails,
            // TODO migrate once identity documents support lifetimes
            identity_documents,
            lifetimes: map(committed_lifetimes),
        };
        let speculative = Self {
            uvd: speculative_uvd,
            phone_numbers: speculative_phone_numbers,
            emails: speculative_emails,
            identity_documents: vec![],
            lifetimes: map(speculative_lifetimes),
        };
        (committed, speculative)
    }

    fn uvd(&self, kind: DataLifetimeKind) -> Option<&UserVaultData> {
        self.uvd
            .iter()
            .find(|d| Into::<DataLifetimeKind>::into(d.kind) == kind)
    }

    /// Dispatch queries for a piece of data with a given DataAttribute kind to the underlying data
    /// model that actually stores this data.
    /// If exists, returns a trait object that allows reading the underlying data
    pub(super) fn get(&self, kind: DataLifetimeKind) -> Option<&dyn HasLifetime> {
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
            | DataLifetimeKind::Ssn4 => self.uvd(kind).map(|uvd| uvd as &dyn HasLifetime),
            // email
            DataLifetimeKind::Email => email.map(|email| email as &dyn HasLifetime),
            // phone
            DataLifetimeKind::PhoneNumber => phone.map(|phone| phone as &dyn HasLifetime),
            // We need to handle identity document separately since users can have multiple identity documents (for now, there's an open item https://linear.app/footprint/issue/FP-1968/de-chonk-the-identitydocument-dataattribute)
            DataLifetimeKind::IdentityDocument => None,
        }
    }
}

impl HasDataAttributeFields for UvwData {
    fn get_e_field(&self, data_attribute: DataLifetimeKind) -> Option<&SealedVaultBytes> {
        if data_attribute.disallows_e_data() {
            return None;
        }

        let value = self.get(data_attribute);
        value.map(|v| v.e_data())
    }
}
