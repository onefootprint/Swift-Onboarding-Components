use crate::{CollectedData, DataIdentifier, IsDataIdentifierDiscriminant, KvDataKey, Validate, ValidateArgs};

impl Validate for KvDataKey {
    fn validate(&self, value: crate::PiiString, _args: ValidateArgs) -> crate::NtResult<crate::PiiString> {
        Ok(value)
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
    fn is_optional(&self) -> bool {
        // Doesn't really apply to custom data
        false
    }

    fn parent(&self) -> Option<CollectedData> {
        None
    }
}

impl From<KvDataKey> for DataIdentifier {
    fn from(value: KvDataKey) -> Self {
        Self::Custom(value)
    }
}
