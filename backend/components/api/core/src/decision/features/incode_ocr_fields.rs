use super::incode_utils::ParsedIncodeAddress;
use super::incode_utils::ParsedIncodeField;
use super::incode_utils::ParsedIncodeNames;
use idv::incode::doc::response::FetchOCRResponse;
use newtypes::IdentityDataKind as IDK;
use newtypes::OcrDataKind as ODK;
use newtypes::PiiString;
use strum::EnumIter;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, EnumIter)]
pub enum IncodeOcrField {
    FullName,
    FullAddress,
    Dob,
    ExpiresAt,
    IssuedAt,
    IssuingCountry,
    IssuingState,
    Gender,
    DocumentNumber,
    RefNumber,
    Nationality,
    Curp,
    ClaveDeElector,
    ClassifiedDocumentType,
    // IDKs
    FirstName,
    MiddleName,
    LastName,
    AddressLine1,
    AddressLine2,
    City,
    State,
    Zip,
    Country,
    DriversLicenseNumber,
    DriversLicenseState,
}

impl TryFrom<IncodeOcrField> for ODK {
    type Error = crate::decision::Error;

    fn try_from(value: IncodeOcrField) -> Result<Self, Self::Error> {
        match value {
            IncodeOcrField::FullName => Ok(ODK::FullName),
            IncodeOcrField::FullAddress => Ok(ODK::FullAddress),
            IncodeOcrField::Dob => Ok(ODK::Dob),
            IncodeOcrField::ExpiresAt => Ok(ODK::ExpiresAt),
            IncodeOcrField::IssuedAt => Ok(ODK::IssuedAt),
            IncodeOcrField::IssuingCountry => Ok(ODK::IssuingCountry),
            IncodeOcrField::IssuingState => Ok(ODK::IssuingState),
            IncodeOcrField::Gender => Ok(ODK::Gender),
            IncodeOcrField::DocumentNumber => Ok(ODK::DocumentNumber),
            IncodeOcrField::RefNumber => Ok(ODK::RefNumber),
            IncodeOcrField::Nationality => Ok(ODK::Nationality),
            IncodeOcrField::Curp => Ok(ODK::Curp),
            IncodeOcrField::ClaveDeElector => Ok(ODK::ClaveDeElector),
            IncodeOcrField::ClassifiedDocumentType => Ok(ODK::ClassifiedDocumentType),
            // IDKs
            IncodeOcrField::FirstName
            | IncodeOcrField::MiddleName
            | IncodeOcrField::LastName
            | IncodeOcrField::AddressLine1
            | IncodeOcrField::AddressLine2
            | IncodeOcrField::City
            | IncodeOcrField::State
            | IncodeOcrField::Zip
            | IncodeOcrField::Country
            | IncodeOcrField::DriversLicenseNumber
            | IncodeOcrField::DriversLicenseState => {
                Err(crate::decision::Error::IncodeOCRDataIdentifierConversionError)
            }
        }
    }
}


impl TryFrom<IncodeOcrField> for IDK {
    type Error = crate::decision::Error;

    fn try_from(value: IncodeOcrField) -> Result<Self, Self::Error> {
        match value {
            IncodeOcrField::FullName
            | IncodeOcrField::FullAddress
            | IncodeOcrField::ExpiresAt
            | IncodeOcrField::IssuedAt
            | IncodeOcrField::IssuingCountry
            | IncodeOcrField::IssuingState
            | IncodeOcrField::Gender
            | IncodeOcrField::DocumentNumber
            | IncodeOcrField::RefNumber
            | IncodeOcrField::Nationality
            | IncodeOcrField::Curp
            | IncodeOcrField::ClaveDeElector
            | IncodeOcrField::ClassifiedDocumentType => {
                Err(crate::decision::Error::IncodeOCRDataIdentifierConversionError)
            }
            IncodeOcrField::Dob => Ok(IDK::Dob),
            IncodeOcrField::FirstName => Ok(IDK::FirstName),
            IncodeOcrField::MiddleName => Ok(IDK::MiddleName),
            IncodeOcrField::LastName => Ok(IDK::LastName),
            IncodeOcrField::AddressLine1 => Ok(IDK::AddressLine1),
            IncodeOcrField::AddressLine2 => Ok(IDK::AddressLine2),
            IncodeOcrField::City => Ok(IDK::City),
            IncodeOcrField::State => Ok(IDK::State),
            IncodeOcrField::Zip => Ok(IDK::Zip),
            IncodeOcrField::Country => Ok(IDK::Country),
            IncodeOcrField::DriversLicenseNumber => Ok(IDK::DriversLicenseNumber),
            IncodeOcrField::DriversLicenseState => Ok(IDK::DriversLicenseState),
        }
    }
}

impl IncodeOcrField {
    pub fn build_parsed_incode_field_from_response(self, r: &FetchOCRResponse) -> Option<ParsedIncodeField> {
        let conf = r.ocr_data_confidence.clone();

        let (nationality_conf, nationality_value) = if let Some(nationality) = r.nationality_mrz.clone() {
            (
                conf.as_ref().and_then(|c| c.nationality_mrz_confidence),
                Some(PiiString::from(nationality)),
            )
        } else {
            (
                conf.as_ref().and_then(|c| c.nationality_confidence),
                r.nationality.clone().map(PiiString::from),
            )
        };

        let parsed_names = ParsedIncodeNames::from_fetch_ocr_res(r);

        // Incode sends full state in one field, and 2 character code in another, so we handle here. we
        // prefer the checked address, since it uses an external service to validate
        let address_checked_bean_state = r.checked_address_bean.as_ref().and_then(|a| a.normalized_state());
        let address_fields_state = r.address_fields.as_ref().and_then(|a| a.normalized_state());
        let state = match address_checked_bean_state.or(address_fields_state) {
            Some(Ok(s)) => Some(s),
            _ => {
                tracing::warn!("incode changed address formats");
                None
            }
        };

        let address = r.checked_address_bean.as_ref().or(r.address_fields.as_ref());
        let zip5 = address.and_then(|a| a.normalized_zip5());

        let (drivers_license_number, drivers_license_state) =
            if r.type_of_id == Some(newtypes::incode::IncodeDocumentType::DriversLicense) {
                let state = r
                    .issuing_state_us_2_char()
                    .map(|s| s.to_string().into())
                    .or(r.normalized_issuing_state());
                (r.document_number.as_ref(), state)
            } else {
                (None, None)
            };

        let address_line2 = if r.type_of_id == Some(newtypes::incode::IncodeDocumentType::VoterIdentification)
        {
            address.and_then(|a| a.colony.as_ref())
        } else {
            None
        };
        let (confidence, value) = match self {
            IncodeOcrField::FullName => (
                conf.as_ref().and_then(|c| c.name_confidence),
                parsed_names.full_name,
            ),
            IncodeOcrField::FullAddress => (
                conf.as_ref().and_then(|c| c.address_confidence),
                ParsedIncodeAddress::from_fetch_ocr_res(r).full_address,
            ),
            IncodeOcrField::Dob => (
                conf.as_ref().and_then(|c| c.birth_date_confidence),
                r.dob().ok().map(|s| s.into()),
            ),
            IncodeOcrField::ExpiresAt => (
                conf.as_ref().and_then(|c| c.expire_at_confidence),
                r.expiration_date().ok().map(|s| s.into()),
            ),
            IncodeOcrField::IssuedAt => (
                conf.as_ref().and_then(|c| c.issued_at_confidence),
                r.issue_date().ok().map(|s| s.into()),
            ),
            // TODO: seems like theres no confidence for these two..?
            IncodeOcrField::IssuingCountry => (None, r.issuing_country_two_digit().map(|s| s.into())),
            IncodeOcrField::IssuingState => (None, r.normalized_issuing_state().map(|s| s.into())),
            IncodeOcrField::Gender => (
                conf.as_ref().and_then(|c| c.gender_confidence),
                r.gender.clone().map(|s| s.into()),
            ),
            IncodeOcrField::DocumentNumber => (
                conf.as_ref().and_then(|c| c.document_number_confidence),
                r.document_number.clone().map(|s| s.into()),
            ),
            IncodeOcrField::RefNumber => (
                conf.as_ref().and_then(|c| c.ref_number_confidence),
                r.ref_number.clone().map(|s| s.into()),
            ),
            // TODO: use nationality_mrz_confidence here too? also why would a MRZ field have confidence
            IncodeOcrField::Nationality =>
            // in the first place?
            {
                (nationality_conf, nationality_value)
            }
            IncodeOcrField::Curp => (
                conf.as_ref().and_then(|c| c.curp_confidence),
                r.curp.clone().map(|s| s.into()),
            ),
            IncodeOcrField::ClaveDeElector => (
                conf.as_ref().and_then(|c| c.clave_de_elector_confidence),
                r.clave_de_elector.clone().map(|s| s.into()),
            ),
            IncodeOcrField::ClassifiedDocumentType => {
                (None, r.type_of_id.clone().map(|s| s.to_string().into()))
            }
            IncodeOcrField::FirstName => (None, parsed_names.first_name),

            IncodeOcrField::MiddleName => (None, parsed_names.middle_name),
            IncodeOcrField::LastName => (None, parsed_names.last_name),
            IncodeOcrField::AddressLine1 => (
                None,
                address.and_then(|n| n.street.as_ref().map(|s| s.leak().into())),
            ),
            IncodeOcrField::AddressLine2 => (None, address_line2.map(|s| s.leak().into())),
            IncodeOcrField::City => (
                None,
                address.and_then(|n| n.city.as_ref().map(|s| s.leak().into())),
            ),
            IncodeOcrField::State => (None, state.map(|s| s.leak().into())),
            IncodeOcrField::Zip => (None, zip5.map(|s| s.leak().into())),
            IncodeOcrField::Country => (None, r.issuing_country_two_digit().map(|s| s.leak().into())),
            IncodeOcrField::DriversLicenseNumber => (None, drivers_license_number.map(|s| s.leak().into())),
            IncodeOcrField::DriversLicenseState => (None, drivers_license_state.map(|s| s.leak().into())),
        };

        value.map(|v| ParsedIncodeField {
            field: self,
            confidence,
            value: v,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use db::test_helpers::assert_have_same_elements;
    use itertools::Itertools;
    use strum::IntoEnumIterator;

    #[test]
    fn test_all_odks_covered() {
        let incode_odks = IncodeOcrField::iter()
            .filter_map(|f| ODK::try_from(f).ok())
            .collect_vec();
        let odks = ODK::iter()
            .filter(|odk| !matches!(odk, ODK::CurpValidationResponse))
            .collect_vec();

        assert_have_same_elements(incode_odks, odks);
    }
}
