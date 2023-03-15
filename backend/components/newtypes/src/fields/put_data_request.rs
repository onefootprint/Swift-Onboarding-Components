use crate::{
    flat_api_object_map_type, BusinessDataKind as BDK, DataIdentifier, DataRequest, Error,
    IdentityDataKind as IDK, InvestorProfileKind as IPK, KvDataKey, NtResult, PiiString,
};

flat_api_object_map_type!(
    PutDataRequest<DataIdentifier, PiiString>,
    description="Key-value map for data to store in the vault",
    example=r#"{ "id.first_name": "Peter", "custom.ach_account_number": "1234567890", "custom.cc_last_4": "4242" }"#
);

impl PutDataRequest {
    /// Decomposes the hashmap of DataIdentifier -> PiiString into its parts that live in different
    /// underlying database tables.
    pub fn decompose(mut self, for_bifrost: bool) -> NtResult<DecomposedPutRequest> {
        // Custom logic to always populate ssn4 if ssn9 is provided
        if let Some(ssn9) = self.get(&IDK::Ssn9.into()) {
            #[allow(clippy::map_entry)]
            if !self.contains_key(&IDK::Ssn4.into()) {
                let ssn4 = PiiString::new(ssn9.leak().chars().skip(ssn9.leak().len() - 4).collect());
                self.map.insert(IDK::Ssn4.into(), ssn4);
            }
        }

        // TODO more general logic to parse DataRequests for each type

        // Parse identity data
        let (id_update, other_data) = DataRequest::<IDK>::new(self.into(), for_bifrost)?;

        // Parse investor profile data
        let (ip_update, other_data) = DataRequest::<IPK>::new(other_data, for_bifrost)?;

        // Parse business data
        let (business_data, other_data) = DataRequest::<BDK>::new(other_data, for_bifrost)?;

        // Parse custom data - this is mostly a no-op since we do no validation on custom data
        let (custom_data, other_data) = DataRequest::<KvDataKey>::new(other_data, for_bifrost)?;
        if let Some(k) = other_data.into_iter().next() {
            return Err(Error::Custom(format!("Cannot put key {}", k.0)));
        }
        let result = DecomposedPutRequest {
            id_update,
            ip_update,
            custom_data,
            business_data,
        };
        Ok(result)
    }
}

pub struct DecomposedPutRequest {
    pub id_update: DataRequest<IDK>,
    pub ip_update: DataRequest<IPK>,
    pub custom_data: DataRequest<KvDataKey>,
    pub business_data: DataRequest<BDK>,
}

impl DecomposedPutRequest {
    // TODO do validation at parse time
    /// Returns an Err if this request contains identity data
    pub fn assert_no_id_data(&self) -> NtResult<()> {
        Self::assert_empty(self.id_update.keys().collect())?;
        Self::assert_empty(self.ip_update.keys().collect())?;
        Ok(())
    }

    /// Returns an Err if this request contains business data
    pub fn assert_no_business_data(&self) -> NtResult<()> {
        Self::assert_empty(self.business_data.keys().collect())
    }

    fn assert_empty<T>(values: Vec<&T>) -> NtResult<()>
    where
        T: Into<DataIdentifier> + Copy,
    {
        if !values.is_empty() {
            let field_errors = values
                .into_iter()
                .map(|di| ((*di).into(), Error::IncompatibleDataIdentifier))
                .collect();
            return Err(crate::DataValidationError::FieldValidationError(field_errors).into());
        }
        Ok(())
    }
}
