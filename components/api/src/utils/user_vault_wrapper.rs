use std::collections::HashMap;
use std::marker::PhantomData;
use strum::IntoEnumIterator;

use db::models::address::{Address, NewAddressReq};
use db::models::email::Email;
use db::models::ob_configurations::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::user_basic_info::{NewUserBasicInfoReq, UserBasicInfo};
use db::models::user_vaults::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{DataKind, DataPriority, NewSealedData, PiiString, SealedVaultBytes, UserVaultId};
use paperclip::actix::web;

use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::State;

pub struct UserVaultWrapper {
    pub user_vault: UserVault,
    pub addresses: Vec<Address>,
    pub phone_numbers: Vec<PhoneNumber>,
    pub emails: Vec<Email>,
    pub basic_info: Option<UserBasicInfo>,
    phantom: PhantomData<()>,
}

impl UserVaultWrapper {
    pub async fn from(pool: &DbPool, user_vault: UserVault) -> Result<UserVaultWrapper, DbError> {
        pool.db_transaction(move |conn| -> Result<UserVaultWrapper, DbError> {
            Self::from_conn(conn, user_vault)
        })
        .await
    }

    pub fn from_conn(conn: &mut PgConnection, user_vault: UserVault) -> Result<UserVaultWrapper, DbError> {
        Ok(Self {
            addresses: Address::list(conn, &user_vault.id)?,
            phone_numbers: PhoneNumber::list(conn, &user_vault.id)?,
            emails: Email::list(conn, &user_vault.id)?,
            basic_info: UserBasicInfo::get(conn, &user_vault.id)?,
            user_vault,
            phantom: PhantomData,
        })
    }

    pub fn from_id(
        conn: &mut PgConnection,
        user_vault_id: &UserVaultId,
    ) -> Result<UserVaultWrapper, DbError> {
        let user_vault = UserVault::get(conn, user_vault_id)?;
        let uvw = Self::from_conn(conn, user_vault)?;
        Ok(uvw)
    }

    pub fn get_e_field(&self, data_kind: DataKind) -> Option<&SealedVaultBytes> {
        // TODO handle multiple values for the same field
        match data_kind {
            // Address
            DataKind::StreetAddress => self.addresses.iter().filter_map(|x| x.e_line1.as_ref()).next(),
            DataKind::StreetAddress2 => self.addresses.iter().filter_map(|x| x.e_line2.as_ref()).next(),
            DataKind::City => self.addresses.iter().filter_map(|x| x.e_city.as_ref()).next(),
            DataKind::State => self.addresses.iter().filter_map(|x| x.e_state.as_ref()).next(),
            DataKind::Zip => self.addresses.iter().filter_map(|x| x.e_zip.as_ref()).next(),
            DataKind::Country => self.addresses.iter().filter_map(|x| x.e_country.as_ref()).next(),

            // Phone
            DataKind::PhoneNumber => self.phone_numbers.iter().map(|x| &x.e_e164).next(),
            DataKind::PhoneCountry => self.phone_numbers.iter().map(|x| &x.e_country).next(),

            // Email
            DataKind::Email => self.emails.iter().map(|x| &x.e_data).next(),

            // Basic info
            DataKind::FirstName => self.basic_info.as_ref().and_then(|x| x.e_first_name.as_ref()),
            DataKind::LastName => self.basic_info.as_ref().and_then(|x| x.e_last_name.as_ref()),
            DataKind::Dob => self.basic_info.as_ref().and_then(|x| x.e_dob.as_ref()),
            DataKind::Ssn9 => self.basic_info.as_ref().and_then(|x| x.e_ssn9.as_ref()),
            DataKind::Ssn4 => self.basic_info.as_ref().and_then(|x| x.e_ssn4.as_ref()),
        }
    }

    pub fn get_populated_fields(&self) -> Vec<DataKind> {
        DataKind::iter()
            .filter_map(|k| self.get_e_field(k).map(|_| k))
            .collect()
    }

    pub async fn get_decrypted_field(
        &self,
        state: &web::Data<State>,
        data_kind: DataKind,
    ) -> Result<Option<PiiString>, ApiError> {
        // TODO standardize this to use one decrypt util
        let e_data = if let Some(e_field) = self.get_e_field(data_kind) {
            e_field
        } else {
            return Ok(None);
        };

        let decrypted_data = crate::enclave::decrypt_bytes(
            state,
            e_data,
            &self.user_vault.e_private_key,
            enclave_proxy::DataTransform::Identity,
        )
        .await?;

        Ok(Some(decrypted_data))
    }

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<DataKind> {
        ob_config
            .must_collect_data_kinds
            .iter()
            .cloned()
            .filter(|data_kind| data_kind.is_required())
            .filter(|data_kind| self.get_e_field(*data_kind).is_none())
            .collect()
    }

    pub fn process_updates(
        &mut self,
        conn: &mut PgConnection,
        new_data: HashMap<DataKind, NewSealedData>,
    ) -> Result<(), ApiError> {
        // Don't allow updating any data that is already set
        // Right now, this also only allows setting new data and doesn't allow updating data
        if let Some(kind) = new_data.keys().find(|k| self.get_e_field(**k).is_some()) {
            return Err(UserError::DataAlreadyPopulated(*kind).into());
        }

        // Add a new email address if provided
        if let Some(update) = new_data.get(&DataKind::Email) {
            let fingerprints = if let Some(fingerprint) = update.sh_data.clone() {
                vec![fingerprint]
            } else {
                vec![]
            };
            self.emails.push(Email::create(
                conn,
                self.user_vault.id.clone(),
                update.e_data.clone(),
                fingerprints,
                false,
                DataPriority::Primary,
            )?);
        }

        // Update any new basic info if provided
        if new_data.keys().any(UserBasicInfo::contains) {
            if let Some(ref basic_info) = self.basic_info {
                basic_info.deactivate(conn)?;
            }
            let new_basic_info = NewUserBasicInfoReq::build(&new_data, self.basic_info.as_ref());
            let new_basic_info = UserBasicInfo::create(conn, self.user_vault.id.clone(), new_basic_info)?;
            self.basic_info = Some(new_basic_info)
        }

        // Add new address fields if provided
        if new_data.keys().any(Address::contains) {
            let current_address = self.addresses.get(0);
            if let Some(current_address) = current_address {
                current_address.deactivate(conn)?;
            }
            let new_address = NewAddressReq::build(&new_data, current_address);
            let new_address = Address::create(conn, self.user_vault.id.clone(), new_address)?;
            self.addresses = vec![new_address];
        }

        Ok(())
    }
}
