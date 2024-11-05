use newtypes::IdentityDataKind as IDK;
use newtypes::OcrDataKind as ODK;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
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
