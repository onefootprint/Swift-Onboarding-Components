use db::models::fingerprint::IsUnique;
use futures::TryFutureExt;
use newtypes::{
    address::{Address, FullAddressOrZip},
    name::FullName,
    ssn::Ssn,
    DataKind, Fingerprint, Fingerprinter, PiiString,
};

use crate::{errors::ApiError, State};

/// help collecting fingerprints
pub struct FingerprintBuilder {
    fingerprints: Vec<(DataKind, PiiString)>,
}
impl FingerprintBuilder {
    pub fn new() -> Self {
        Self { fingerprints: vec![] }
    }

    pub fn add(&mut self, pii: PiiString, kind: DataKind) {
        self.fingerprints.push((kind, pii))
    }

    pub fn add_full_name(&mut self, name: FullName) {
        self.add(name.first_name.into(), DataKind::FirstName);
        self.add(name.last_name.into(), DataKind::LastName);
    }

    pub fn add_ssn(&mut self, ssn: Ssn) {
        match ssn {
            Ssn::Ssn9(ssn9) => self.add(ssn9.into(), DataKind::Ssn9),
            Ssn::Ssn4(ssn4) => self.add(ssn4.into(), DataKind::Ssn4),
        }
    }

    pub fn add_address(&mut self, address: Address) {
        let Address {
            line1: line_1,
            line2: line_2,
            city,
            state,
            zip,
            country,
        } = address;

        self.add(line_1.into(), DataKind::AddressLine1);

        if let Some(line_2) = line_2 {
            self.add(line_2.into(), DataKind::AddressLine2);
        };

        self.add(city.into(), DataKind::City);
        self.add(state.into(), DataKind::State);
        self.add(zip.into(), DataKind::Zip);
        self.add(country.into(), DataKind::Country);
    }

    pub fn add_address_or_zip(&mut self, address: FullAddressOrZip) {
        match address {
            FullAddressOrZip::Address(address) => self.add_address(address),
            FullAddressOrZip::ZipAndCountry { zip, country } => {
                self.add(zip.into(), DataKind::Zip);
                self.add(country.into(), DataKind::Country);
            }
        }
    }

    pub async fn create(self, state: &State) -> Result<Vec<(DataKind, Fingerprint, IsUnique)>, ApiError> {
        // create the new fingerprints
        let fut_fingerprints = self.fingerprints.into_iter().map(|(kind, pii)| {
            let pii = pii.clean_for_fingerprint();
            state.compute_fingerprint(kind, pii).map_ok(move |fp| {
                // do not mark verified for this data
                (kind, fp, false)
            })
        });
        let fingerprints: Vec<(DataKind, Fingerprint, IsUnique)> =
            futures::future::try_join_all(fut_fingerprints).await?;
        Ok(fingerprints)
    }
}
