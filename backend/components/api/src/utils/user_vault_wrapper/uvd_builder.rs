use crate::{
    errors::{user::UserError, ApiError, ApiResult},
    types::identity_data_request::IdentityDataUpdate,
};
use db::{
    models::{
        data_lifetime::DataLifetime,
        fingerprint::{Fingerprint, NewFingerprint},
        user_vault_data::{NewUserVaultData, UserVaultData},
    },
    TxnPgConnection,
};
use newtypes::{
    address::{Address, FullAddressOrZip, ZipAndCountry},
    name::FullName,
    ssn::{Ssn, Ssn4},
    CollectedDataOption, DataLifetimeKind, Fingerprint as FingerprintBytes, PiiString, ScopedUserId,
    UserVaultId, UvdKind, VaultPublicKey,
};
use std::collections::HashMap;

/// Helps to process updates for data in an IdentityDataUpdate request.
pub struct UvdBuilder {
    data: Vec<NewUserVaultData>,
}

impl UvdBuilder {
    /// Construct the list of NewUserVaultData from an IdentityDataUpdate
    pub fn build(update: IdentityDataUpdate, vault_public_key: VaultPublicKey) -> ApiResult<Self> {
        let mut data = vec![];

        let mut add_sealed = |pii: PiiString, kind: UvdKind| -> ApiResult<()> {
            let sealed = vault_public_key.seal_pii(&pii)?;
            data.push(NewUserVaultData { kind, e_data: sealed });
            Ok(())
        };

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = update;

        // Add the name, if provided
        if let Some(name) = name {
            let FullName {
                first_name,
                last_name,
            } = name;
            add_sealed(first_name.into(), UvdKind::FirstName)?;
            add_sealed(last_name.into(), UvdKind::LastName)?;
        }

        // Add the dob, if provided
        if let Some(dob) = dob {
            add_sealed(dob.into(), UvdKind::Dob)?;
        }

        // Add the ssn, if provided
        match ssn {
            Some(Ssn::Ssn9(ssn9)) => {
                let ssn4 = Ssn4::from(&ssn9);
                add_sealed(ssn9.into(), UvdKind::Ssn9)?;
                add_sealed(ssn4.into(), UvdKind::Ssn4)?;
            }
            Some(Ssn::Ssn4(ssn4)) => {
                add_sealed(ssn4.into(), UvdKind::Ssn4)?;
            }
            None => {}
        }

        // Add the address, if provided
        match address {
            Some(FullAddressOrZip::Address(Address {
                line1: line_1,
                line2: line_2,
                city,
                state,
                zip,
                country,
            })) => {
                add_sealed(line_1.into(), UvdKind::AddressLine1)?;
                if let Some(line_2) = line_2 {
                    add_sealed(line_2.into(), UvdKind::AddressLine2)?;
                }
                add_sealed(city.into(), UvdKind::City)?;
                add_sealed(state.into(), UvdKind::State)?;
                add_sealed(zip.into(), UvdKind::Zip)?;
                add_sealed(country.into(), UvdKind::Country)?;
            }
            Some(FullAddressOrZip::ZipAndCountry(ZipAndCountry { zip, country })) => {
                add_sealed(zip.into(), UvdKind::Zip)?;
                add_sealed(country.into(), UvdKind::Country)?;
            }
            None => {}
        }

        Ok(Self { data })
    }

    /// Validates that the pending updates are valid and then saves them to the DB as speculative data
    pub fn validate_and_save(
        self,
        conn: &mut TxnPgConnection,
        existing_fields: Vec<DataLifetimeKind>, // committed or speculative on UVW
        user_vault_id: UserVaultId,
        scoped_user_id: ScopedUserId,
        fingerprints: Vec<(UvdKind, FingerprintBytes)>,
    ) -> ApiResult<Vec<CollectedDataOption>> {
        // First, validate that we're not overwriting any full data with partial data.
        // For example, we shouldn't let you provide an Ssn4 if we already have an Ssn9.
        let new_fields = self.data.iter().map(|d| d.kind.into()).collect();
        let existing = CollectedDataOption::list_from(existing_fields);
        let new = CollectedDataOption::list_from(new_fields);
        let offending_partial_cdo =
            new.iter()
                .cloned()
                .find(|speculative_cdo| match speculative_cdo.full_variant() {
                    Some(full_cdo) => existing.contains(&full_cdo),
                    None => false,
                });
        if let Some(offending_partial_cdo) = offending_partial_cdo {
            return Err(UserError::PartialUpdateNotAllowed(offending_partial_cdo).into());
        }

        // Deactivate old UVDs that we have overwritten that belong to this tenant.
        // We will only deactivate speculative, uncommitted data here - never committed data
        let kinds_to_deactivate = new.iter().flat_map(|cdo| cdo.attributes()).collect();
        let seqno = DataLifetime::get_next_seqno(conn)?;
        DataLifetime::bulk_deactivate_uncommitted(conn, &scoped_user_id, kinds_to_deactivate, seqno)?;

        // Create the new UVDs
        let uvds = UserVaultData::bulk_create(conn, &user_vault_id, Some(&scoped_user_id), self.data, seqno)?;

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
        Ok(new.into_iter().collect())
    }
}
