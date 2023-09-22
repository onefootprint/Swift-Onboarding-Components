use crate::{
    AllData, CollectedData, DataIdentifier, IsDataIdentifierDiscriminant, KvDataKey, NtResult, PiiString,
    PiiValue, Validate, ValidateArgs,
};

impl Validate for KvDataKey {
    fn validate(
        self,
        value: PiiValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<Vec<(DataIdentifier, PiiString)>> {
        let value = match value {
            PiiValue::String(s) => s,
            PiiValue::Json(v) => PiiString::try_from(&v)?,
        };
        Ok(vec![(self.into(), value)])
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
