use crate::{CollectedData, DataIdentifier, HasParentCdo, IsDataIdentifierDiscriminant, KvDataKey, Validate};

impl HasParentCdo for KvDataKey {
    fn parent(&self) -> Option<CollectedData> {
        None
    }
}

impl Validate for KvDataKey {
    fn validate(&self, value: crate::PiiString, _for_bifrost: bool) -> crate::NtResult<crate::PiiString> {
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
}

impl From<KvDataKey> for DataIdentifier {
    fn from(value: KvDataKey) -> Self {
        Self::Custom(value)
    }
}
