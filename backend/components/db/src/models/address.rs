use std::collections::HashMap;

use crate::schema::address;
use chrono::{DateTime, Utc};
use diesel::prelude::*;
use diesel::{PgConnection, Queryable};
use newtypes::{
    AddressId, DataKind, Fingerprint as FingerprintData, FingerprintId, NewSealedData, SealedVaultBytes,
    UserVaultId,
};
use serde::{Deserialize, Serialize};

use crate::DbError;

use super::fingerprint::Fingerprint;

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = address)]
pub struct Address {
    pub id: AddressId,
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_line1: Option<SealedVaultBytes>,
    pub e_line2: Option<SealedVaultBytes>,
    pub e_city: Option<SealedVaultBytes>,
    pub e_state: Option<SealedVaultBytes>,
    pub e_zip: Option<SealedVaultBytes>,
    pub e_country: Option<SealedVaultBytes>,
    pub deactivated_at: Option<DateTime<Utc>>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NewAddressReq {
    pub fingerprints: Vec<FingerprintData>,
    pub e_line1: Option<SealedVaultBytes>,
    pub e_line2: Option<SealedVaultBytes>,
    pub e_city: Option<SealedVaultBytes>,
    pub e_state: Option<SealedVaultBytes>,
    pub e_zip: Option<SealedVaultBytes>,
    pub e_country: Option<SealedVaultBytes>,
}

impl NewAddressReq {
    pub fn build(new_data: &HashMap<DataKind, NewSealedData>, old_data: Option<&Address>) -> Self {
        let get_field = |data_kind, default: Option<Option<SealedVaultBytes>>| {
            new_data
                .get(&data_kind)
                .map(|x| x.e_data.clone())
                .or_else(|| default.flatten())
        };
        let fingerprints = new_data
            .iter()
            .filter(|(k, _)| Address::contains(k))
            .filter_map(|(_, v)| v.sh_data.clone())
            .collect();
        Self {
            fingerprints,
            e_line1: get_field(DataKind::StreetAddress, old_data.map(|d| d.e_line1.clone())),
            e_line2: get_field(DataKind::StreetAddress2, old_data.map(|d| d.e_line2.clone())),
            e_city: get_field(DataKind::City, old_data.map(|d| d.e_city.clone())),
            e_state: get_field(DataKind::State, old_data.map(|d| d.e_state.clone())),
            e_zip: get_field(DataKind::Zip, old_data.map(|d| d.e_zip.clone())),
            e_country: get_field(DataKind::Country, old_data.map(|d| d.e_country.clone())),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize, Insertable)]
#[diesel(table_name = address)]
pub struct NewAddress {
    pub user_vault_id: UserVaultId,
    pub fingerprint_ids: Vec<FingerprintId>,
    pub e_line1: Option<SealedVaultBytes>,
    pub e_line2: Option<SealedVaultBytes>,
    pub e_city: Option<SealedVaultBytes>,
    pub e_state: Option<SealedVaultBytes>,
    pub e_zip: Option<SealedVaultBytes>,
    pub e_country: Option<SealedVaultBytes>,
}

impl From<(NewAddressReq, UserVaultId, Vec<FingerprintId>)> for NewAddress {
    fn from(s: (NewAddressReq, UserVaultId, Vec<FingerprintId>)) -> Self {
        let NewAddressReq {
            e_line1,
            e_line2,
            e_city,
            e_state,
            e_zip,
            e_country,
            ..
        } = s.0;
        Self {
            user_vault_id: s.1,
            fingerprint_ids: s.2,
            e_line1,
            e_line2,
            e_city,
            e_state,
            e_zip,
            e_country,
        }
    }
}

impl Address {
    pub fn list(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Vec<Self>, DbError> {
        let results = address::table
            .filter(address::user_vault_id.eq(user_vault_id))
            .filter(address::deactivated_at.is_null())
            .load(conn)?;
        Ok(results)
    }

    pub fn contains(data_kind: &DataKind) -> bool {
        matches!(
            data_kind,
            DataKind::StreetAddress
                | DataKind::StreetAddress2
                | DataKind::City
                | DataKind::State
                | DataKind::Zip
                | DataKind::Country
        )
    }

    pub fn deactivate(&self, conn: &mut PgConnection) -> Result<(), DbError> {
        Fingerprint::deactivate(conn, &self.fingerprint_ids)?;
        diesel::update(address::table)
            .filter(address::id.eq(&self.id))
            .set(address::deactivated_at.eq(Utc::now()))
            .execute(conn)?;
        Ok(())
    }

    pub fn create(
        conn: &mut PgConnection,
        user_vault_id: UserVaultId,
        new_data: NewAddressReq,
    ) -> Result<Self, DbError> {
        let fingerprint_ids = Fingerprint::bulk_create(conn, new_data.fingerprints.clone(), &user_vault_id)?;
        let new_row = NewAddress::from((new_data, user_vault_id, fingerprint_ids));
        let result = diesel::insert_into(address::table)
            .values(&new_row)
            .get_result::<Self>(conn)?;
        Ok(result)
    }

    pub fn data_items(self) -> Vec<(DataKind, SealedVaultBytes)> {
        vec![
            self.e_line1.map(|x| (DataKind::StreetAddress, x)),
            self.e_line2.map(|x| (DataKind::StreetAddress2, x)),
            self.e_city.map(|x| (DataKind::City, x)),
            self.e_state.map(|x| (DataKind::State, x)),
            self.e_zip.map(|x| (DataKind::Zip, x)),
            self.e_country.map(|x| (DataKind::Country, x)),
        ]
        .into_iter()
        .flatten()
        .collect()
    }
}
