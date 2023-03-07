use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::kv_data::KeyValueData;
use db::models::phone_number::PhoneNumber;
use db::models::vault_data::VaultData;
use db::{HasLifetime, HasSealedIdentityData};
use newtypes::{BusinessDataKind, DataLifetimeId, SealedVaultBytes, VdKind};
use newtypes::{IdentityDataKind, KvDataKey};
use std::collections::{HashMap, HashSet};
use std::marker::PhantomData;
use strum::IntoEnumIterator;

use crate::errors::ApiError;
use crate::errors::ApiResult;

use super::{Business, Person};

#[derive(Clone, Debug)]
pub(super) struct VwData<Type> {
    pub(super) vd: Vec<VaultData>,
    pub(super) phone_numbers: Vec<PhoneNumber>,
    pub(super) emails: Vec<Email>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    pub(super) identity_documents: Vec<IdentityDocumentAndRequest>,
    pub(super) kv_data: HashMap<KvDataKey, KeyValueData>,

    // A map of all of the DataLifetimes for this data.
    lifetimes: HashMap<DataLifetimeId, DataLifetime>,
    phantom: PhantomData<Type>,
}

impl<Type> VwData<Type> {
    pub(super) fn partition(
        vd: Vec<VaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocumentAndRequest>,
        kv_data: Vec<KeyValueData>,
        all_lifetimes: Vec<DataLifetime>,
    ) -> ApiResult<(Self, Self)> {
        let speculative_lifetime_ids: HashSet<_> = all_lifetimes
            .iter()
            .filter(|l| l.portablized_seqno.is_some())
            .map(|l| l.id.clone())
            .collect();

        // Partition each piece of data by portable / speculative
        fn partition<T: HasLifetime>(
            data: Vec<T>,
            speculative_lifetime_ids: &HashSet<DataLifetimeId>,
        ) -> (Vec<T>, Vec<T>) {
            data.into_iter()
                .partition(|d| speculative_lifetime_ids.contains(d.lifetime_id()))
        }
        let (portable_vd, speculative_vd) = partition(vd, &speculative_lifetime_ids);
        let (portable_phone_numbers, speculative_phone_numbers) =
            partition(phone_numbers, &speculative_lifetime_ids);
        let (portable_emails, speculative_emails) = partition(emails, &speculative_lifetime_ids);
        let (portable_identity_documents, speculative_identity_documents) =
            partition(identity_documents, &speculative_lifetime_ids);
        let (portable_kv_data, speculative_kv_data) = partition(kv_data, &speculative_lifetime_ids);

        if !portable_kv_data.is_empty() {
            // We don't commit kv_data yet because we don't want it to be portable. Error if we find
            // any
            return Err(ApiError::AssertionError("Found portable kv_data".to_owned()));
        }

        let portable = Self::build(
            portable_vd,
            portable_phone_numbers,
            portable_emails,
            portable_identity_documents,
            portable_kv_data,
            &all_lifetimes,
        );
        let speculative = Self::build(
            speculative_vd,
            speculative_phone_numbers,
            speculative_emails,
            speculative_identity_documents,
            speculative_kv_data,
            &all_lifetimes,
        );
        Ok((portable, speculative))
    }

    fn build(
        vd: Vec<VaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocumentAndRequest>,
        kv_data: Vec<KeyValueData>,
        all_lifetimes: &[DataLifetime],
    ) -> Self {
        let lifetime_ids: Vec<Vec<_>> = vec![
            vd.iter().map(|d| d.lifetime_id()).collect(),
            phone_numbers.iter().map(|d| d.lifetime_id()).collect(),
            emails.iter().map(|d| d.lifetime_id()).collect(),
            identity_documents.iter().map(|d| d.lifetime_id()).collect(),
            kv_data.iter().map(|d| d.lifetime_id()).collect(),
        ];
        let lifetime_ids: HashSet<_> = lifetime_ids.into_iter().flatten().collect();
        // Since all_lifetimes contains a superset of lifetimes represented by the data in this
        // VwData, we filter for only the lifetimes whose data are stored in this VwData
        let lifetimes: HashMap<_, _> = all_lifetimes
            .iter()
            .filter(|l| lifetime_ids.contains(&l.id))
            .cloned()
            .map(|l| (l.id.clone(), l))
            .collect();

        Self {
            vd,
            phone_numbers,
            emails,
            identity_documents,
            kv_data: kv_data.into_iter().map(|d| (d.data_key.clone(), d)).collect(),
            lifetimes,
            phantom: PhantomData,
        }
    }
}

impl VwData<Person> {
    fn vd(&self, kind: IdentityDataKind) -> Option<&VaultData> {
        self.vd.iter().find(|d| match d.kind {
            VdKind::Id(p) => IdentityDataKind::from(p) == kind,
            VdKind::Business(_) => false,
        })
    }

    /// Dispatch queries for a piece of data with a given DataAttribute kind to the underlying data
    /// model that actually stores this data.
    /// If exists, returns a trait object that allows reading the underlying data
    pub(super) fn get(&self, kind: &IdentityDataKind) -> Option<&dyn HasSealedIdentityData> {
        let email = self.emails.first();
        let phone = self.phone_numbers.first();
        match kind {
            // vd
            IdentityDataKind::FirstName
            | IdentityDataKind::LastName
            | IdentityDataKind::Dob
            | IdentityDataKind::Ssn4
            | IdentityDataKind::Ssn9
            | IdentityDataKind::AddressLine1
            | IdentityDataKind::AddressLine2
            | IdentityDataKind::City
            | IdentityDataKind::State
            | IdentityDataKind::Zip
            | IdentityDataKind::Country => self.vd(*kind).map(|vd| vd as &dyn HasSealedIdentityData),
            // email
            IdentityDataKind::Email => email.map(|email| email as &dyn HasSealedIdentityData),
            // phone
            IdentityDataKind::PhoneNumber => phone.map(|phone| phone as &dyn HasSealedIdentityData),
        }
    }

    fn get_id_lifetime(&self, kind: &IdentityDataKind) -> Option<&DataLifetime> {
        self.get(kind).and_then(|d| {
            let lifetime_id = d.lifetime_id();
            self.lifetimes.get(lifetime_id)
        })
    }

    pub(super) fn get_id_lifetimes<'a, T>(&self, kinds: T) -> Vec<&DataLifetime>
    where
        T: IntoIterator<Item = &'a IdentityDataKind>,
    {
        kinds.into_iter().flat_map(|k| self.get_id_lifetime(k)).collect()
    }

    pub fn get_identity_e_field(&self, kind: IdentityDataKind) -> Option<&SealedVaultBytes> {
        let value = self.get(&kind);
        value.map(|v| v.e_data())
    }

    pub fn get_populated_identity_fields(&self) -> Vec<IdentityDataKind> {
        IdentityDataKind::iter()
            .filter(|k| self.get_identity_e_field(*k).is_some())
            .collect()
    }
}

impl VwData<Business> {
    fn bdk(&self, kind: BusinessDataKind) -> Option<&VaultData> {
        self.vd.iter().find(|d| match d.kind {
            VdKind::Business(b) => b == kind,
            VdKind::Id(_) => false,
        })
    }

    pub fn get_business_data_e_field(&self, kind: BusinessDataKind) -> Option<&SealedVaultBytes> {
        let value = self.bdk(kind).map(|vd| vd as &dyn HasSealedIdentityData);
        value.map(|v| v.e_data())
    }
}
