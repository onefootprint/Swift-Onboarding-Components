use std::collections::HashMap;

use db::{
    models::{
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        user_vault_data::{NewUserVaultData, UserVaultData},
    },
    TxnPgConnection,
};
use newtypes::{
    address::{Address, Country, FullAddressOrZip, Zip, ZipAndCountry},
    dob::DateOfBirth,
    name::FullName,
    ssn::{Ssn, Ssn4, Ssn9},
    CollectedDataOption, Fingerprint as FingerprintBytes, PiiString, ScopedUserId, UserVaultId, UvdKind,
    VaultPublicKey,
};

use crate::{
    errors::{ApiError, ApiResult},
    types::identity_data_request::IdentityDataUpdate,
};

/// Helps to process updates for data in an IdentityDataUpdate request.
pub struct UvdBuilder {
    vault_public_key: VaultPublicKey,
    data: Vec<NewUserVaultData>,
    // We will deactivate the old UserVaultData rows and their fingerprints if they are replaced
    kinds_to_deactivate: Vec<UvdKind>,
    // Keeps track of which pieces of data were added during this request
    collected_data: Vec<CollectedDataOption>,
}

impl UvdBuilder {
    pub fn build(update: IdentityDataUpdate, vault_public_key: VaultPublicKey) -> ApiResult<Self> {
        let mut builder = Self {
            vault_public_key,
            data: vec![],
            kinds_to_deactivate: vec![],
            collected_data: vec![],
        };

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = update;
        if let Some(name) = name {
            builder.add_full_name(name)?;
        }
        if let Some(dob) = dob {
            builder.add_dob(dob)?;
        }
        if let Some(ssn) = ssn {
            builder.add_ssn(ssn)?;
        }
        if let Some(address) = address {
            builder.add_full_address_or_zip(address)?;
        }

        Ok(builder)
    }

    fn add_sealed(&mut self, pii: PiiString, kind: UvdKind) -> ApiResult<()> {
        let sealed = self.vault_public_key.seal_pii(&pii)?;
        self.data.push(NewUserVaultData { kind, e_data: sealed });
        self.kinds_to_deactivate.push(kind);
        Ok(())
    }

    fn add_full_name(&mut self, name: FullName) -> ApiResult<()> {
        let FullName {
            first_name,
            last_name,
        } = name;
        self.add_sealed(first_name.into(), UvdKind::FirstName)?;
        self.add_sealed(last_name.into(), UvdKind::LastName)?;
        self.collected_data.push(CollectedDataOption::Name);
        Ok(())
    }

    fn add_dob(&mut self, dob: DateOfBirth) -> ApiResult<()> {
        self.add_sealed(dob.into(), UvdKind::Dob)?;
        self.collected_data.push(CollectedDataOption::Dob);
        Ok(())
    }

    fn add_ssn9(&mut self, ssn9: Ssn9) -> ApiResult<()> {
        let ssn4 = Ssn4::from(&ssn9);
        self.add_sealed(ssn9.into(), UvdKind::Ssn9)?;

        // TODO What happens if the ssn4 is already set?
        self.add_sealed(ssn4.into(), UvdKind::Ssn4)?;

        self.collected_data.push(CollectedDataOption::Ssn9);
        self.collected_data.push(CollectedDataOption::Ssn4);
        Ok(())
    }

    fn add_ssn4(&mut self, ssn4: Ssn4) -> ApiResult<()> {
        // verify the update is allowed
        self.add_sealed(ssn4.into(), UvdKind::Ssn4)?;
        self.collected_data.push(CollectedDataOption::Ssn4);
        Ok(())
    }

    fn add_ssn(&mut self, ssn: Ssn) -> ApiResult<()> {
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

    fn add_address(&mut self, address: Address) -> ApiResult<()> {
        let Address {
            line1: line_1,
            line2: line_2,
            city,
            state,
            zip,
            country,
        } = address;

        self.add_sealed(line_1.into(), UvdKind::AddressLine1)?;
        if let Some(line_2) = line_2 {
            self.add_sealed(line_2.into(), UvdKind::AddressLine2)?;
        } else {
            // Regardless of whether the new address has a line2, clear the old line2
            self.kinds_to_deactivate.push(UvdKind::AddressLine2);
        }

        self.add_sealed(city.into(), UvdKind::City)?;
        self.add_sealed(state.into(), UvdKind::State)?;
        self.add_sealed(zip.into(), UvdKind::Zip)?;
        self.add_sealed(country.into(), UvdKind::Country)?;

        self.collected_data.push(CollectedDataOption::FullAddress);

        Ok(())
    }

    fn add_zip_and_country_only(&mut self, zip: Zip, country: Country) -> ApiResult<()> {
        self.add_sealed(zip.into(), UvdKind::Zip)?;
        self.add_sealed(country.into(), UvdKind::Country)?;

        // TODO What happens if other fields are set? We probably shouldn't allow you to set zip +
        // country if we already have full address
        self.kinds_to_deactivate.push(UvdKind::AddressLine1);
        self.kinds_to_deactivate.push(UvdKind::AddressLine2);
        self.kinds_to_deactivate.push(UvdKind::City);
        self.kinds_to_deactivate.push(UvdKind::State);

        self.collected_data.push(CollectedDataOption::PartialAddress);
        Ok(())
    }

    fn add_full_address_or_zip(&mut self, address: FullAddressOrZip) -> ApiResult<()> {
        match address {
            FullAddressOrZip::Address(address) => {
                self.add_address(address)?;
            }
            FullAddressOrZip::ZipAndCountry(ZipAndCountry { zip, country }) => {
                self.add_zip_and_country_only(zip, country)?;
            }
        }

        Ok(())
    }

    pub fn save(
        self,
        conn: &mut TxnPgConnection,
        user_vault_id: UserVaultId,
        scoped_user_id: ScopedUserId,
        fingerprints: Vec<(UvdKind, FingerprintBytes)>,
    ) -> ApiResult<Vec<CollectedDataOption>> {
        // TODO verify there isn't already committed data for this user vault

        // Deactivate old UVDs that we have overwritten
        let seqno = DataLifetime::get_next_seqno(conn)?;
        UserVaultData::bulk_deactivate_uncommitted(
            conn,
            scoped_user_id.clone(),
            self.kinds_to_deactivate,
            seqno,
        )?;

        // Create the new UVDs
        let uvds = UserVaultData::bulk_create(conn, user_vault_id, Some(scoped_user_id), self.data, seqno)?;

        // Point fingerprints to the same lifetime used for the corresponding UVD row
        let kind_to_lifetime: HashMap<_, _> =
            HashMap::from_iter(uvds.into_iter().map(|uvd| (uvd.kind, uvd.lifetime_id)));
        let fingerprints: Vec<_> = fingerprints
            .into_iter()
            .map(|(kind, sh_data)| -> ApiResult<_> {
                Ok(NewFingerprint {
                    kind: kind.into(),
                    sh_data,
                    lifetime_id: kind_to_lifetime
                        .get(&kind)
                        .ok_or(ApiError::NotImplemented)?
                        .clone(),
                })
            })
            .collect::<ApiResult<_>>()?;
        Fingerprint::bulk_create(conn, fingerprints)?;

        Ok(self.collected_data)
    }
}
