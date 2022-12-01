use futures::TryFutureExt;
use newtypes::{
    address::{Address, FullAddressOrZip, ZipAndCountry},
    name::FullName,
    ssn::Ssn,
    DataAttribute, Fingerprint, Fingerprinter, PiiString, UvdKind,
};
use std::convert::Into;

use crate::{errors::ApiResult, types::identity_data_request::IdentityDataUpdate, State};

/// help collecting fingerprints for identity data updates (eventually stored in UserVaultData)
pub struct FingerprintBuilder {
    fingerprints: Vec<(UvdKind, PiiString)>,
}

impl FingerprintBuilder {
    pub async fn fingerprints(
        state: &State,
        request: IdentityDataUpdate,
    ) -> ApiResult<Vec<(UvdKind, Fingerprint)>> {
        let mut builder = Self { fingerprints: vec![] };

        let IdentityDataUpdate {
            name,
            dob,
            ssn,
            address,
        } = request;

        if let Some(name) = name {
            builder.add_full_name(name);
        }
        if let Some(dob) = dob {
            builder.add(dob.into(), UvdKind::Dob);
        }
        if let Some(ssn) = ssn {
            builder.add_ssn(ssn);
        }
        if let Some(address) = address {
            builder.add_address_or_zip(address);
        }

        let fut_fingerprints = builder.fingerprints.into_iter().map(|(kind, pii)| {
            let pii = pii.clean_for_fingerprint();
            state
                .compute_fingerprint(Into::<DataAttribute>::into(kind), pii)
                .map_ok(move |sh_data| (kind, sh_data))
        });
        let fingerprints = futures::future::try_join_all(fut_fingerprints).await?;
        Ok(fingerprints)
    }

    fn add(&mut self, pii: PiiString, kind: UvdKind) {
        self.fingerprints.push((kind, pii))
    }

    fn add_full_name(&mut self, name: FullName) {
        self.add(name.first_name.into(), UvdKind::FirstName);
        self.add(name.last_name.into(), UvdKind::LastName);
    }

    fn add_ssn(&mut self, ssn: Ssn) {
        match ssn {
            Ssn::Ssn9(ssn9) => self.add(ssn9.into(), UvdKind::Ssn9),
            Ssn::Ssn4(ssn4) => self.add(ssn4.into(), UvdKind::Ssn4),
        }
    }

    fn add_address(&mut self, address: Address) {
        let Address {
            line1: line_1,
            line2: line_2,
            city,
            state,
            zip,
            country,
        } = address;

        self.add(line_1.into(), UvdKind::AddressLine1);

        if let Some(line_2) = line_2 {
            self.add(line_2.into(), UvdKind::AddressLine2);
        };

        self.add(city.into(), UvdKind::City);
        self.add(state.into(), UvdKind::State);
        self.add(zip.into(), UvdKind::Zip);
        self.add(country.into(), UvdKind::Country);
    }

    fn add_address_or_zip(&mut self, address: FullAddressOrZip) {
        match address {
            FullAddressOrZip::Address(address) => self.add_address(address),
            FullAddressOrZip::ZipAndCountry(ZipAndCountry { zip, country }) => {
                self.add(zip.into(), UvdKind::Zip);
                self.add(country.into(), UvdKind::Country);
            }
        }
    }
}
