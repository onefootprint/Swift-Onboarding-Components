use super::AllData;
use super::CleanAndValidate;
use crate::data_identifier::bank_data_kind::BankInfo;
use crate::DataIdentifierValue;
use crate::NtResult;
use crate::PiiJsonValue;
use crate::ValidateArgs;

impl CleanAndValidate for BankInfo {
    type Parsed = ();

    fn clean_and_validate(
        self,
        value: PiiJsonValue,
        _: ValidateArgs,
        _: &AllData,
    ) -> NtResult<DataIdentifierValue<Self::Parsed>> {
        // skip validation for now
        Ok(DataIdentifierValue {
            di: self.into(),
            value: value.as_string()?,
            parsed: (),
        })
    }
}
