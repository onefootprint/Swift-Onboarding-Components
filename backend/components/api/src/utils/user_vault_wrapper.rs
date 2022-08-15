use enclave_proxy::DataTransform;
use std::collections::HashMap;
use std::marker::PhantomData;
use strum::IntoEnumIterator;

use db::models::address::{Address, NewAddressReq};
use db::models::email::Email;
use db::models::ob_configurations::ObConfiguration;
use db::models::phone_number::PhoneNumber;
use db::models::user_profile::{NewUserProfileReq, UserProfile};
use db::models::user_vaults::UserVault;
use db::DbPool;
use db::{errors::DbError, PgConnection};
use newtypes::{DataKind, DataPriority, NewSealedData, SealedVaultBytes, UserVaultId, ValidatedPhoneNumber};
use paperclip::actix::web;

use crate::errors::user::UserError;
use crate::errors::ApiError;
use crate::State;

pub struct UserVaultWrapper {
    pub user_vault: UserVault,
    pub addresses: Vec<Address>,
    pub phone_numbers: Vec<PhoneNumber>,
    pub emails: Vec<Email>,
    pub profile: Option<UserProfile>,
    data_kind_to_e_data: HashMap<DataKind, SealedVaultBytes>,
    phantom: PhantomData<()>,
}

impl UserVaultWrapper {
    pub async fn from(pool: &DbPool, user_vault: UserVault) -> Result<Self, DbError> {
        pool.db_transaction(move |conn| -> Result<UserVaultWrapper, DbError> {
            Self::from_conn(conn, user_vault)
        })
        .await
    }

    pub fn from_conn(conn: &mut PgConnection, user_vault: UserVault) -> Result<Self, DbError> {
        let addresses = Address::list(conn, &user_vault.id)?;
        let phone_numbers = PhoneNumber::list(conn, &user_vault.id)?;
        let emails = Email::list(conn, &user_vault.id)?;
        let profile = UserProfile::get(conn, &user_vault.id)?;

        let profile_items = if let Some(ref profile) = profile {
            profile.clone().data_items()
        } else {
            vec![]
        };
        let data_kind_to_e_data = profile_items
            .into_iter()
            .chain(phone_numbers.iter().cloned().flat_map(|x| x.data_items()))
            .chain(emails.iter().cloned().flat_map(|x| x.data_items()))
            .chain(addresses.iter().cloned().flat_map(|x| x.data_items()))
            .collect();
        Ok(Self {
            addresses,
            phone_numbers,
            emails,
            profile,
            user_vault,
            data_kind_to_e_data,
            phantom: PhantomData,
        })
    }

    pub fn from_id(conn: &mut PgConnection, user_vault_id: &UserVaultId) -> Result<Self, DbError> {
        let user_vault = UserVault::get(conn, user_vault_id)?;
        let uvw = Self::from_conn(conn, user_vault)?;
        Ok(uvw)
    }

    pub fn get_e_field(&self, data_kind: &DataKind) -> Option<&SealedVaultBytes> {
        // TODO handle multiple values for the same field
        self.data_kind_to_e_data.get(data_kind)
    }

    pub fn has_field(&self, data_kind: &DataKind) -> bool {
        self.get_e_field(data_kind).is_some()
    }

    pub fn get_populated_fields(&self) -> Vec<DataKind> {
        DataKind::iter().filter(|k| self.has_field(k)).collect()
    }

    pub async fn get_decrypted_primary_phone(
        &self,
        state: &web::Data<State>,
    ) -> Result<ValidatedPhoneNumber, ApiError> {
        let number = self
            .phone_numbers
            .iter()
            .find(|x| x.priority == DataPriority::Primary)
            .ok_or(ApiError::NoPhoneNumberForVault)?;

        let decrypt_response = crate::enclave::decrypt_bytes_batch(
            state,
            vec![&number.e_e164, &number.e_country],
            &self.user_vault.e_private_key,
            DataTransform::Identity,
        )
        .await?;
        let e164 = decrypt_response.get(0).ok_or(ApiError::NotImplemented)?.clone();
        let country = decrypt_response.get(1).ok_or(ApiError::NotImplemented)?.clone();

        let validated_phone_number = ValidatedPhoneNumber::__build_from_vault(e164, country)?;
        Ok(validated_phone_number)
    }

    pub fn missing_fields(&self, ob_config: &ObConfiguration) -> Vec<DataKind> {
        ob_config
            .must_collect_data_kinds
            .iter()
            .cloned()
            .filter(|data_kind| data_kind.is_required())
            .filter(|data_kind| !self.has_field(data_kind))
            .collect()
    }

    pub fn process_updates(
        &mut self,
        conn: &mut PgConnection,
        new_data: HashMap<DataKind, NewSealedData>,
    ) -> Result<(), ApiError> {
        // Don't allow updating any data that is already set
        // Right now, this also only allows setting new data and doesn't allow updating data
        if let Some(kind) = new_data.keys().find(|k| self.has_field(*k)) {
            return Err(UserError::DataAlreadyPopulated(*kind).into());
        }

        // Add a new email address if provided
        if let Some(update) = new_data.get(&DataKind::Email) {
            let fingerprints = if let Some(fingerprint) = update.sh_data.clone() {
                vec![fingerprint]
            } else {
                vec![]
            };
            let new_email = Email::create(
                conn,
                self.user_vault.id.clone(),
                update.e_data.clone(),
                fingerprints,
                false,
                DataPriority::Primary,
            )?;
            self.data_kind_to_e_data.extend(new_email.clone().data_items());
            self.emails.push(new_email);
        }

        // Update any new basic info if provided
        if new_data.keys().any(UserProfile::contains) {
            if let Some(ref profile) = self.profile {
                profile.deactivate(conn)?;
            }
            let new_profile = NewUserProfileReq::build(&new_data, self.profile.as_ref());
            let new_profile = UserProfile::create(conn, self.user_vault.id.clone(), new_profile)?;
            self.data_kind_to_e_data
                .extend(new_profile.clone().data_items());
            self.profile = Some(new_profile)
        }

        // Add new address fields if provided
        if new_data.keys().any(Address::contains) {
            let current_address = self.addresses.get(0);
            if let Some(current_address) = current_address {
                current_address.deactivate(conn)?;
            }
            let new_address = NewAddressReq::build(&new_data, current_address);
            let new_address = Address::create(conn, self.user_vault.id.clone(), new_address)?;
            self.data_kind_to_e_data.extend(new_address.clone().data_items());
            self.addresses = vec![new_address];
        }

        Ok(())
    }
}
