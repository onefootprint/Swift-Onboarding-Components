use crate::{InvestorProfileKind as IPK, PiiString};
use crate::{NtResult, Validate};

impl Validate for IPK {
    fn validate(&self, value: PiiString, _for_bifrost: bool) -> NtResult<PiiString> {
        // TODO
        Ok(value)
    }
}
