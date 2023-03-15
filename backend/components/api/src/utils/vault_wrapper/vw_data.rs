use crate::errors::ApiError;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::models::email::Email;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::phone_number::PhoneNumber;
use db::models::vault_data::VaultData;
use db::{HasLifetime, HasSealedIdentityData};
use itertools::Itertools;
use newtypes::{DataIdentifier, IdentityDataKind as IDK, IsDataIdentifierDiscriminant};
use newtypes::{DataLifetimeId, SealedVaultBytes, VdKind};
use std::collections::{HashMap, HashSet};
use std::marker::PhantomData;

#[derive(Clone, Debug)]
pub(super) struct VwData<Type> {
    pub(super) vd: Vec<VaultData>,
    pub(super) phone_numbers: Vec<PhoneNumber>,
    pub(super) emails: Vec<Email>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    pub(super) identity_documents: Vec<IdentityDocumentAndRequest>,

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

        // TODO some runtime checks that business vaults don't have id data and vice versa
        if portable_vd.iter().any(|vd| matches!(vd.kind, VdKind::Custom(_))) {
            // We don't commit custom data yet because we don't want it to be portable. Error if we
            // find any
            return Err(ApiError::AssertionError("Found portable custom data".to_owned()));
        }

        let portable = Self::build(
            portable_vd,
            portable_phone_numbers,
            portable_emails,
            portable_identity_documents,
            &all_lifetimes,
        );
        let speculative = Self::build(
            speculative_vd,
            speculative_phone_numbers,
            speculative_emails,
            speculative_identity_documents,
            &all_lifetimes,
        );
        Ok((portable, speculative))
    }

    fn build(
        vd: Vec<VaultData>,
        phone_numbers: Vec<PhoneNumber>,
        emails: Vec<Email>,
        identity_documents: Vec<IdentityDocumentAndRequest>,
        all_lifetimes: &[DataLifetime],
    ) -> Self {
        let lifetime_ids: Vec<Vec<_>> = vec![
            vd.iter().map(|d| d.lifetime_id()).collect(),
            phone_numbers.iter().map(|d| d.lifetime_id()).collect(),
            emails.iter().map(|d| d.lifetime_id()).collect(),
            identity_documents.iter().map(|d| d.lifetime_id()).collect(),
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
            lifetimes,
            phantom: PhantomData,
        }
    }

    pub fn populated_dis(&self) -> Vec<DataIdentifier> {
        let emails = self
            .emails
            .iter()
            .map(|_| DataIdentifier::from(IDK::Email))
            .collect_vec();
        let phone_numbers = self
            .phone_numbers
            .iter()
            .map(|_| DataIdentifier::from(IDK::PhoneNumber))
            .collect_vec();
        let vds = self.vd.iter().map(|vd| vd.kind.clone().into()).collect_vec();
        let id_docs = self
            .identity_documents
            .iter()
            .flat_map(|i| {
                if i.selfie_image_s3_url.is_some() {
                    vec![
                        DataIdentifier::IdDocument(i.document_type),
                        DataIdentifier::Selfie(i.document_type),
                    ]
                } else {
                    vec![DataIdentifier::IdDocument(i.document_type)]
                }
            })
            .collect_vec();
        [emails, phone_numbers, vds, id_docs]
            .into_iter()
            .flatten()
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

    /// Dispatch queries for a piece of data with a given identifier to the underlying data
    /// model that actually stores this data.
    /// If exists, returns a trait object that allows reading the underlying data
    pub fn get<T>(&self, id: T) -> Option<&dyn HasSealedIdentityData>
    where
        T: Into<DataIdentifier>,
    {
        let di = id.into();
        if matches!(di, DataIdentifier::Id(IDK::PhoneNumber)) {
            let phone = self.phone_numbers.first();
            return phone.map(|p| p as &dyn HasSealedIdentityData);
        }
        if matches!(di, DataIdentifier::Id(IDK::Email)) {
            return self.emails.first().map(|e| e as &dyn HasSealedIdentityData);
        }
        if let Ok(vdk) = di.try_into() {
            self.vd
                .iter()
                .find(|d| d.kind == vdk)
                .map(|vd| vd as &dyn HasSealedIdentityData)
        } else {
            None
        }
    }

    fn get_lifetime<T>(&self, id: T) -> Option<&DataLifetime>
    where
        T: Into<DataIdentifier>,
    {
        self.get(id).and_then(|d| {
            let lifetime_id = d.lifetime_id();
            self.lifetimes.get(lifetime_id)
        })
    }

    pub(super) fn get_lifetimes<VecT, T>(&self, kinds: VecT) -> Vec<&DataLifetime>
    where
        VecT: IntoIterator<Item = T>,
        T: Into<DataIdentifier>,
    {
        kinds.into_iter().flat_map(|k| self.get_lifetime(k)).collect()
    }

    pub fn get_e_data<T>(&self, id: T) -> Option<&SealedVaultBytes>
    where
        T: Into<DataIdentifier>,
    {
        let value = self.get(id);
        value.map(|v| v.e_data())
    }
}
