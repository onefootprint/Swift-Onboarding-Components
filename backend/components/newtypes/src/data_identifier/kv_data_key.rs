use crate::AllData;
use crate::CleanAndValidate;
use crate::CollectedData;
use crate::DataIdentifier;
use crate::DataIdentifierValue;
use crate::IsDataIdentifierDiscriminant;
use crate::KvDataKey;
use crate::NtResult;
use crate::PiiJsonValue;
use crate::ValidateArgs;

impl CleanAndValidate for KvDataKey {
    type Parsed = ();

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        Ok(DataIdentifierValue {
            di: self.into(),
            value: value.to_piistring()?,
            parsed: (),
        })
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
