use std::collections::HashSet;

use crate::{schema::identity_data, DbError};
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{DataAttribute, FingerprintId, IdentityDataId, SealedVaultBytes, UserVaultId};
use serde::{Deserialize, Serialize};

use super::fingerprint::Fingerprint;
use crate::HasDataAttributeFields;

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
    pub fn get_active(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Option<Self>, DbError> {
        tracing::info!("fetching identity data for user_vault_id");
        let result: Option<Self> = identity_data::table
            .filter(identity_data::user_vault_id.eq(user_vault_id))
            .filter(identity_data::deactivated_at.is_null())
            .first(conn)
            .optional()?;

        Ok(result)
    }

    pub fn bulk_get_active(
        conn: &mut PgConnection,
        user_vault_ids: &Vec<UserVaultId>,
    ) -> Result<Vec<Self>, DbError> {
        tracing::info!("bulk fetching identity data for user_vault_ids");
        let result: Vec<Self> = identity_data::table
            .filter(identity_data::user_vault_id.eq_any(user_vault_ids))
            .filter(identity_data::deactivated_at.is_null())
            .load::<Self>(conn)?;

        Ok(result)
    }

    pub fn get(
        conn: &mut PgConnection,
        id: &IdentityDataId,
        user_vault_id: &UserVaultId,
    ) -> Result<Self, DbError> {
        let result = identity_data::table
            .filter(identity_data::id.eq(id))
            .filter(identity_data::user_vault_id.eq(user_vault_id))
            .first(conn)?;

        Ok(result)
    }

    pub fn deactivate(
        &self,
        conn: &mut PgConnection,
        remove_fingerprint_kinds: &[DataAttribute],
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

impl HasDataAttributeFields for IdentityData {
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        match data_attribute {
            DataAttribute::FirstName => self.e_first_name.as_ref(),
            DataAttribute::LastName => self.e_last_name.as_ref(),
            DataAttribute::Dob => self.e_dob.as_ref(),
            DataAttribute::Ssn9 => self.e_ssn9.as_ref(),
            DataAttribute::Ssn4 => self.e_ssn4.as_ref(),
            DataAttribute::AddressLine1 => self.e_address_line1.as_ref(),
            DataAttribute::AddressLine2 => self.e_address_line2.as_ref(),
            DataAttribute::City => self.e_address_city.as_ref(),
            DataAttribute::State => self.e_address_state.as_ref(),
            DataAttribute::Zip => self.e_address_zip.as_ref(),
            DataAttribute::Country => self.e_address_country.as_ref(),
            _ => None,
        }
    }
}

impl<T> HasDataAttributeFields for Option<T>
where
    T: HasDataAttributeFields,
{
    fn get_e_field(&self, data_attribute: DataAttribute) -> Option<&SealedVaultBytes> {
        self.as_ref()?.get_e_field(data_attribute)
    }
}
