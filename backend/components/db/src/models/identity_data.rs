use std::collections::HashSet;

use crate::{schema::identity_data, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{DataKind, FingerprintId, IdentityDataId, SealedVaultBytes, UserVaultId};
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;

use super::fingerprint::Fingerprint;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = identity_data)]
pub struct IdentityData {
    pub id: IdentityDataId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,

    pub e_first_name: Option<SealedVaultBytes>,
    pub e_last_name: Option<SealedVaultBytes>,
    pub e_dob: Option<SealedVaultBytes>,
    pub e_ssn9: Option<SealedVaultBytes>,
    pub e_ssn4: Option<SealedVaultBytes>,
    pub e_address_line1: Option<SealedVaultBytes>,
    pub e_address_line2: Option<SealedVaultBytes>,
    pub e_address_city: Option<SealedVaultBytes>,
    pub e_address_state: Option<SealedVaultBytes>,
    pub e_address_zip: Option<SealedVaultBytes>,
    pub e_address_country: Option<SealedVaultBytes>,

    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable, Default)]
#[diesel(table_name = identity_data)]
pub struct NewIdentityDataArgs {
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_first_name: Option<SealedVaultBytes>,
    pub e_last_name: Option<SealedVaultBytes>,
    pub e_dob: Option<SealedVaultBytes>,
    pub e_ssn9: Option<SealedVaultBytes>,
    pub e_ssn4: Option<SealedVaultBytes>,
    pub e_address_line1: Option<SealedVaultBytes>,
    pub e_address_line2: Option<SealedVaultBytes>,
    pub e_address_city: Option<SealedVaultBytes>,
    pub e_address_state: Option<SealedVaultBytes>,
    pub e_address_zip: Option<SealedVaultBytes>,
    pub e_address_country: Option<SealedVaultBytes>,
}
impl NewIdentityDataArgs {
    pub fn empty(user_vault_id: UserVaultId) -> Self {
        Self {
            user_vault_id,
            ..Default::default()
        }
    }

    pub fn remove_fingerprint_ids(&mut self, ids: Vec<FingerprintId>) {
        let current: HashSet<FingerprintId> = HashSet::from_iter(self.fingerprint_ids.clone());
        let delete = HashSet::from_iter(ids);

        self.fingerprint_ids = current.difference(&delete).into_iter().cloned().collect();
    }

    pub fn add_fingerprint_ids(&mut self, ids: Vec<FingerprintId>) {
        let current: HashSet<FingerprintId> = HashSet::from_iter(self.fingerprint_ids.clone());
        let add = HashSet::from_iter(ids);

        self.fingerprint_ids = current.union(&add).into_iter().cloned().collect();
    }
}
impl From<IdentityData> for NewIdentityDataArgs {
    fn from(data: IdentityData) -> Self {
        let IdentityData {
            user_vault_id,
            fingerprint_ids,
            e_first_name,
            e_last_name,
            e_dob,
            e_ssn9,
            e_ssn4,
            e_address_line1,
            e_address_line2,
            e_address_city,
            e_address_state,
            e_address_zip,
            e_address_country,
            ..
        } = data;

        Self {
            user_vault_id,
            fingerprint_ids,
            e_first_name,
            e_last_name,
            e_dob,
            e_ssn9,
            e_ssn4,
            e_address_line1,
            e_address_line2,
            e_address_city,
            e_address_state,
            e_address_zip,
            e_address_country,
        }
    }
}

impl IdentityData {
    pub fn get(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Option<Self>, DbError> {
        let result: Option<Self> = identity_data::table
            .filter(identity_data::user_vault_id.eq(user_vault_id))
            .filter(identity_data::deactivated_at.is_null())
            .first(conn)
            .optional()?;

        Ok(result)
    }

    pub fn deactivate(
        &self,
        conn: &mut PgConnection,
        remove_fingerprint_kinds: &[DataKind],
    ) -> Result<Vec<FingerprintId>, DbError> {
        let removed = Fingerprint::deactivate(conn, &self.fingerprint_ids, remove_fingerprint_kinds)?;
        diesel::update(identity_data::table)
            .filter(identity_data::id.eq(&self.id))
            .set(identity_data::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(removed.into_iter().map(|fp| fp.id).collect())
    }

    pub fn create(conn: &mut PgConnection, new_data: NewIdentityDataArgs) -> Result<Self, DbError> {
        let result = diesel::insert_into(identity_data::table)
            .values(&new_data)
            .get_result::<Self>(conn)?;
        Ok(result)
    }
}

/// helper trait to access e_fields and metadata
pub trait HasIdentityDataFields {
    fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes>;

    fn has_field(&self, data_kind: DataKind) -> bool {
        self.get_e_field(data_kind).is_some()
    }

    fn get_populated_fields(&self) -> Vec<DataKind> {
        DataKind::iter().filter(|k| self.has_field(*k)).collect()
    }
}

impl HasIdentityDataFields for IdentityData {
    fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes> {
        match data_kind {
            DataKind::FirstName => self.e_first_name.as_ref(),
            DataKind::LastName => self.e_last_name.as_ref(),
            DataKind::Dob => self.e_dob.as_ref(),
            DataKind::Ssn9 => self.e_ssn9.as_ref(),
            DataKind::Ssn4 => self.e_ssn4.as_ref(),
            DataKind::AddressLine1 => self.e_address_line1.as_ref(),
            DataKind::AddressLine2 => self.e_address_line2.as_ref(),
            DataKind::City => self.e_address_city.as_ref(),
            DataKind::State => self.e_address_state.as_ref(),
            DataKind::Zip => self.e_address_zip.as_ref(),
            DataKind::Country => self.e_address_country.as_ref(),
            DataKind::Email => None,
            DataKind::PhoneNumber => None,
        }
    }
}

impl<T> HasIdentityDataFields for Option<T>
where
    T: HasIdentityDataFields,
{
    fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes> {
        self.as_ref()?.get_e_field(data_kind)
    }
}
