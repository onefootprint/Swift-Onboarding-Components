use std::{collections::HashMap, str::FromStr};

use crate::{
    email::Email, flat_api_object_map_type, DataIdentifier, Error, IdentityDataKind, IdentityDataUpdate,
    KvDataKey, NtResult, PiiString,
};

flat_api_object_map_type!(
    PutDataRequest<DataIdentifier, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

pub struct DecomposedPutRequest {
    pub id_update: IdentityDataUpdate,
    pub phone_number: Option<PiiString>,
    pub email: Option<Email>,
    pub custom_data: HashMap<KvDataKey, PiiString>,
}

pub type FingerprintableData = HashMap<IdentityDataKind, PiiString>;

impl PutDataRequest {
    /// Decomposes the hashmap of DataIdentifier -> PiiString into its parts that live in different
    /// underlying database tables.
    pub fn decompose(self, for_bifrost: bool) -> NtResult<(DecomposedPutRequest, FingerprintableData)> {
        // Parse identity data
        let (mut id_update, other_data) = IdentityDataUpdate::new(self.into(), for_bifrost)?;

        let fingerprintable_data = id_update.clone().into_inner();

        // Extract phone and email from identity data since they are handled separately (for now)
        let phone_number = id_update.remove(&IdentityDataKind::PhoneNumber);
        let email = id_update
            .remove(&IdentityDataKind::Email)
            .map(|p| Email::from_str(p.leak()))
            .transpose()?;

        // Parse custom data
        let custom_data = other_data
            .into_iter()
            .map(|(k, v)| match k {
                DataIdentifier::Custom(k) => Ok((k, v)),
                k => Err(Error::Custom(format!("Cannot put key {}", k))),
            })
            .collect::<NtResult<HashMap<_, _>>>()?;
        let result = DecomposedPutRequest {
            id_update,
            phone_number,
            email,
            custom_data,
        };
        Ok((result, fingerprintable_data))
    }
}
