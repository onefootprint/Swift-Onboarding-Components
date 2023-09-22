use crate::{
    AllData, CollectedData, DataIdentifier, IsDataIdentifierDiscriminant, KvDataKey, NtResult, PiiJsonValue,
    PiiString, Validate, ValidateArgs,
};

impl Validate for KvDataKey {
    fn validate(
        self,
        value: PiiJsonValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
        Ok(vec![(self.into(), value.to_piistring()?)])
    }
}

impl TryFrom<DataIdentifier> for KvDataKey {
    type Error = crate::Error;
    fn try_from(value: DataIdentifier) -> Result<Self, Self::Error> {
        match value {
            DataIdentifier::Custom(kv_key) => Ok(kv_key),
            _ => Err(crate::Error::Custom("Can't convert into KvDataKey".to_owned())),
        }
    }
}

impl IsDataIdentifierDiscriminant for KvDataKey {
    fn parent(&self) -> Option<CollectedData> {
        None
    }
}

impl From<KvDataKey> for DataIdentifier {
    fn from(value: KvDataKey) -> Self {
        Self::Custom(value)
    }
}
