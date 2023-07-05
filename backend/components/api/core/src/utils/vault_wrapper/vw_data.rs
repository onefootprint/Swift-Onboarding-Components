use crate::errors::ApiResult;
use crate::errors::AssertionError;
use db::models::data_lifetime::DataLifetime;
use db::models::document_data::DocumentData;
use db::models::vault_data::VaultData;
use db::HasLifetime;
use itertools::Itertools;
use newtypes::DataIdentifier;
use newtypes::DataLifetimeId;
use std::collections::{HashMap, HashSet};
use std::marker::PhantomData;

#[derive(Clone, Debug)]
pub(super) struct VwData<Type> {
    pub(super) vd: Vec<VaultData>,
    pub(super) documents: Vec<DocumentData>,
    // A map of all of the DataLifetimes for this data.
    lifetimes: HashMap<DataLifetimeId, DataLifetime>,
    phantom: PhantomData<Type>,
}

impl<Type> VwData<Type> {
    pub(super) fn partition(
        vd: Vec<VaultData>,
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
        let (portable_documents, speculative_documents) = partition(documents, &speculative_lifetime_ids);

        // TODO some runtime checks that business vaults don't have id data and vice versa
        if portable_vd
            .iter()
            .any(|vd| matches!(vd.kind, DataIdentifier::Custom(_)))
        {
            // We don't commit custom data yet because we don't want it to be portable. Error if we
            // find any
            return Err(AssertionError("Found portable custom data").into());
        }

        let portable = Self::build(portable_vd, portable_documents, &all_lifetimes);
        let speculative = Self::build(speculative_vd, speculative_documents, &all_lifetimes);
        Ok((portable, speculative))
    }

    fn build(vd: Vec<VaultData>, documents: Vec<DocumentData>, all_lifetimes: &[DataLifetime]) -> Self {
        let lifetime_ids: Vec<Vec<_>> = vec![
            vd.iter().map(|d| d.lifetime_id()).collect(),
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
            documents,
            lifetimes,
            phantom: PhantomData,
        }
    }

    pub fn populated_dis(&self) -> Vec<DataIdentifier> {
        let vds = self.vd.iter().map(|vd| vd.kind.clone()).collect_vec();
        let docs = self.documents.iter().map(|d| d.kind.clone()).collect_vec();
        [vds, docs].into_iter().flatten().unique().collect()
    }

    /// Dispatch queries for a piece of data with a given identifier to the underlying data
    /// model that actually stores this data.
    /// If exists, returns a trait object that allows reading the underlying data
    pub fn get<T>(&self, di: T) -> Option<&VaultData>
    where
        T: Into<DataIdentifier>,
    {
        let di = di.into();
        self.vd.iter().find(|d| d.kind == di)
    }

    pub(super) fn get_lifetimes<VecT, T>(&self, kinds: VecT) -> Vec<&DataLifetime>
    where
        VecT: IntoIterator<Item = T>,
        T: Into<DataIdentifier>,
    {
        kinds
            .into_iter()
            .flat_map(|k| self.get(k))
            .flat_map(|d| self.lifetimes.get(d.lifetime_id()))
            .collect()
    }

    // Todo maybe combine with get
    pub fn get_document(&self, kind: &DataIdentifier) -> Option<&DocumentData> {
        self.documents.iter().find(|d| &d.kind == kind)
    }
}
