use crate::errors::ApiError;
use crate::errors::ApiResult;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::identity_document::IdentityDocumentAndRequest;
use db::models::vault_data::VaultData;
use db::{HasLifetime, HasSealedIdentityData};
use itertools::Itertools;
use newtypes::DocumentKind;
use newtypes::{DataIdentifier, IsDataIdentifierDiscriminant};
use newtypes::{DataLifetimeId, VdKind};
use std::collections::{HashMap, HashSet};
use std::marker::PhantomData;

#[derive(Clone, Debug)]
pub(super) struct VwData<Type> {
    pub(super) vd: Vec<VaultData>,
    // It's very possible we will collect multiple documents for a single UserVault. Retries, different ID types, different country etc
    pub(super) identity_documents: Vec<IdentityDocumentAndRequest>,
    pub(super) documents: Vec<DocumentData>,
    // A map of all of the DataLifetimes for this data.
    lifetimes: HashMap<DataLifetimeId, DataLifetime>,
    phantom: PhantomData<Type>,
}

impl<Type> VwData<Type> {
    pub(super) fn partition(
        vd: Vec<VaultData>,
        identity_documents: Vec<IdentityDocumentAndRequest>,
        documents: Vec<DocumentData>,
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
        let (portable_identity_documents, speculative_identity_documents) =
            partition(identity_documents, &speculative_lifetime_ids);
        let (portable_documents, speculative_documents) = partition(documents, &speculative_lifetime_ids);

        // TODO some runtime checks that business vaults don't have id data and vice versa
        if portable_vd.iter().any(|vd| matches!(vd.kind, VdKind::Custom(_))) {
            // We don't commit custom data yet because we don't want it to be portable. Error if we
            // find any
            return Err(ApiError::AssertionError("Found portable custom data".to_owned()));
        }

        let portable = Self::build(
            portable_vd,
            portable_identity_documents,
            portable_documents,
            &all_lifetimes,
        );
        let speculative = Self::build(
            speculative_vd,
            speculative_identity_documents,
            speculative_documents,
            &all_lifetimes,
        );
        Ok((portable, speculative))
    }

    fn build(
        vd: Vec<VaultData>,
        identity_documents: Vec<IdentityDocumentAndRequest>,
        documents: Vec<DocumentData>,
        all_lifetimes: &[DataLifetime],
    ) -> Self {
        let lifetime_ids: Vec<Vec<_>> = vec![
            vd.iter().map(|d| d.lifetime_id()).collect(),
            identity_documents.iter().map(|d| d.lifetime_id()).collect(),
            documents.iter().map(|d| d.lifetime_id()).collect(),
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
            identity_documents,
            documents,
            lifetimes,
            phantom: PhantomData,
        }
    }

    pub fn populated_dis(&self) -> Vec<DataIdentifier> {
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
        let docs = self.documents.iter().map(|d| d.kind.into()).collect_vec();
        [vds, id_docs, docs].into_iter().flatten().unique().collect()
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
        let vdk = di.try_into().ok()?;
        self.vd
            .iter()
            .find(|d| d.kind == vdk)
            .map(|vd| vd as &dyn HasSealedIdentityData)
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

    pub fn get_document(&self, kind: DocumentKind) -> Option<&DocumentData> {
        self.documents.iter().find(|d| d.kind == kind)
    }
}
