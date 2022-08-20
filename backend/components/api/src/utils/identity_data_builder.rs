use db::{
    models::{
        fingerprint::IsUnique,
        identity_data::{HasIdentityDataFields, IdentityData, NewIdentityDataArgs},
    },
    PgConnection,
};
use newtypes::{
    address::{Address, Country, FullAddressOrZip, Zip},
    dob::DateOfBirth,
    name::FullName,
    ssn::{Ssn, Ssn4, Ssn9},
    DataKind, Fingerprint, PiiString, SealedVaultBytes, UserVaultId, VaultPublicKey,
};

use crate::errors::{user::UserError, ApiResult};

/// Helper for updating identity data
pub struct IdentityDataBuilder {
    is_portable: bool,
    existing_data: Option<IdentityData>,
    new_data: NewIdentityDataArgs,
    fingerprint_kinds_to_clear: Vec<DataKind>,
    vault_public_key: VaultPublicKey,
    fingerprints: Vec<(DataKind, Fingerprint, IsUnique)>,
}

impl IdentityDataBuilder {
    pub fn new(
        is_portable: bool,
        user_vault_id: UserVaultId,
        existing_data: Option<IdentityData>,
        vault_public_key: VaultPublicKey,
        fingerprints: Vec<(DataKind, Fingerprint, IsUnique)>,
    ) -> Self {
        let new_identity_data = if let Some(id_data) = existing_data.clone() {
            NewIdentityDataArgs::from(id_data)
        } else {
            NewIdentityDataArgs::empty(user_vault_id)
        };

        Self {
            is_portable,
            existing_data,
            new_data: new_identity_data,
            fingerprint_kinds_to_clear: vec![],
            vault_public_key,
            fingerprints,
        }
    }

    pub fn seal(&mut self, pii: PiiString, kind: DataKind) -> ApiResult<Option<SealedVaultBytes>> {
        let sealed = self.vault_public_key.seal_pii(&pii)?;
        self.fingerprint_kinds_to_clear.push(kind);
        Ok(Some(sealed))
    }

    pub fn add_full_name(&mut self, name: FullName) -> ApiResult<()> {
        // require empty state for adding name
        if self.is_portable && !self.existing_data.get_populated_fields().is_empty() {
            return Err(UserError::DataUpdateNotAllowed)?;
        }

        let FullName {
            first_name,
            last_name,
        } = name;
        self.new_data.e_first_name = self.seal(first_name.into(), DataKind::FirstName)?;
        self.new_data.e_last_name = self.seal(last_name.into(), DataKind::LastName)?;
        Ok(())
    }

    pub fn add_dob(&mut self, dob: DateOfBirth) -> ApiResult<()> {
        if self.is_portable && self.existing_data.has_field(DataKind::Dob) {
            return Err(UserError::DataUpdateNotAllowed)?;
        }

        self.new_data.e_dob = self.seal(dob.into(), DataKind::Dob)?;
        Ok(())
    }

    pub fn add_ssn9(&mut self, ssn9: Ssn9) -> ApiResult<()> {
        // verify the update is allowed
        if self.is_portable && self.existing_data.has_field(DataKind::Ssn9) {
            return Err(UserError::DataUpdateNotAllowed)?;
        }

        if self.new_data.e_ssn4.is_none() {
            let ssn4 = Ssn4::from(&ssn9);
            self.new_data.e_ssn4 = self.seal(ssn4.into(), DataKind::Ssn4)?;
        }

        self.new_data.e_ssn9 = self.seal(ssn9.into(), DataKind::Ssn9)?;

        Ok(())
    }

    pub fn add_ssn4(&mut self, ssn4: Ssn4) -> ApiResult<()> {
        // verify the update is allowed
        if self.is_portable && self.existing_data.has_field(DataKind::Ssn4)
            || self.existing_data.has_field(DataKind::Ssn9)
        {
            return Err(UserError::DataUpdateNotAllowed)?;
        }

        self.new_data.e_ssn4 = self.seal(ssn4.into(), DataKind::Ssn4)?;
        Ok(())
    }

    pub fn add_ssn(&mut self, ssn: Ssn) -> ApiResult<()> {
        match ssn {
            Ssn::Ssn9(ssn) => {
                self.add_ssn9(ssn)?;
            }
            Ssn::Ssn4(ssn) => {
                self.add_ssn4(ssn)?;
            }
        }
        Ok(())
    }

    pub fn add_address(&mut self, address: Address) -> ApiResult<()> {
        let Address {
            line1: line_1,
            line2: line_2,
            city,
            state,
            zip,
            country,
        } = address;

        self.new_data.e_address_line1 = self.seal(line_1.into(), DataKind::AddressLine1)?;
        self.new_data.e_address_line2 = if let Some(line_2) = line_2 {
            self.seal(line_2.into(), DataKind::AddressLine2)?
        } else {
            None
        };
        self.new_data.e_address_city = self.seal(city.into(), DataKind::City)?;
        self.new_data.e_address_state = self.seal(state.into(), DataKind::State)?;
        self.new_data.e_address_zip = self.seal(zip.into(), DataKind::Zip)?;
        self.new_data.e_address_country = self.seal(country.into(), DataKind::Country)?;

        Ok(())
    }

    pub fn add_zip_and_country_only(&mut self, zip: Zip, country: Country) -> ApiResult<()> {
        if self.is_portable
            && [
                DataKind::AddressLine1,
                DataKind::AddressLine2,
                DataKind::City,
                DataKind::State,
                DataKind::Zip,
                DataKind::Country,
            ]
            .iter()
            .any(|d| self.existing_data.has_field(*d))
        {
            return Err(UserError::DataUpdateNotAllowed)?;
        }

        self.new_data.e_address_zip = self.seal(zip.into(), DataKind::Zip)?;
        self.new_data.e_address_country = self.seal(country.into(), DataKind::Country)?;
        Ok(())
    }

    pub fn add_full_address_or_zip(&mut self, address: FullAddressOrZip) -> ApiResult<()> {
        match address {
            FullAddressOrZip::Address(address) => {
                self.add_address(address)?;
            }
            FullAddressOrZip::ZipAndCountry { zip, country } => {
                self.add_zip_and_country_only(zip, country)?;
            }
        }

        Ok(())
    }

    pub fn finish(mut self, conn: &mut PgConnection) -> ApiResult<NewIdentityDataArgs> {
        // sunset the old identity data and remove fingerprints
        if let Some(existing) = self.existing_data {
            let fp_to_remove = existing.deactivate(conn, &self.fingerprint_kinds_to_clear)?;
            self.new_data.remove_fingerprint_ids(fp_to_remove);
        }

        let new_fingerprint_ids = db::models::fingerprint::Fingerprint::bulk_create(
            conn,
            &self.new_data.user_vault_id,
            self.fingerprints,
        )?;
        self.new_data.add_fingerprint_ids(new_fingerprint_ids);

        Ok(self.new_data)
    }
}
