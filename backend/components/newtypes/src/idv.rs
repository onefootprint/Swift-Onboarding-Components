use std::str::FromStr;

use super::Error::AssertionError;
use crate::{
    BusinessOwnerData, IdentityDataKind, Iso3166TwoDigitCountryCode, PiiString, VerificationRequestId,
    DATE_FORMAT,
};
use chrono::NaiveDate;
use serde::{Deserialize, Serialize};
use strum::IntoEnumIterator;

#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize, Deserialize)]
pub struct IdvData {
    pub first_name: Option<PiiString>,
    pub middle_name: Option<PiiString>,
    pub last_name: Option<PiiString>,
    pub address_line1: Option<PiiString>,
    pub address_line2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
    pub country: Option<PiiString>,
    pub ssn4: Option<PiiString>,
    pub ssn9: Option<PiiString>,
    pub dob: Option<PiiString>,
    pub email: Option<PiiString>,
    pub phone_number: Option<PiiString>,
    // this is convenient to have
    pub verification_request_id: Option<VerificationRequestId>,
}

impl IdvData {
    pub fn name(&self) -> Option<String> {
        match (self.first_name.as_ref(), self.last_name.as_ref()) {
            (Some(first_name), Some(last_name)) => {
                Some(format!("{} {}", first_name.leak(), last_name.leak()))
            }
            (Some(name), None) | (None, Some(name)) => Some(name.leak_to_string()),
            (None, None) => None,
        }
    }

    pub fn present_data_attributes(&self) -> Vec<IdentityDataKind> {
        IdentityDataKind::iter()
            .flat_map(|attr| self.get(attr).is_some().then_some(attr))
            .collect()
    }

    pub fn get(&self, idk: IdentityDataKind) -> Option<&PiiString> {
        match idk {
            IdentityDataKind::FirstName => self.first_name.as_ref(),
            IdentityDataKind::MiddleName => self.middle_name.as_ref(),
            IdentityDataKind::LastName => self.last_name.as_ref(),
            IdentityDataKind::Dob => self.dob.as_ref(),
            IdentityDataKind::Ssn4 => self.ssn4.as_ref(),
            IdentityDataKind::Ssn9 => self.ssn9.as_ref(),
            IdentityDataKind::AddressLine1 => self.address_line1.as_ref(),
            IdentityDataKind::AddressLine2 => self.address_line2.as_ref(),
            IdentityDataKind::City => self.city.as_ref(),
            IdentityDataKind::State => self.state.as_ref(),
            IdentityDataKind::Zip => self.zip.as_ref(),
            IdentityDataKind::Country => self.country.as_ref(),
            IdentityDataKind::Email => self.email.as_ref(),
            IdentityDataKind::PhoneNumber => self.phone_number.as_ref(),
            IdentityDataKind::Nationality
            | IdentityDataKind::UsLegalStatus
            | IdentityDataKind::VisaKind
            | IdentityDataKind::VisaExpirationDate
            | IdentityDataKind::Citizenships => None,
        }
    }

    pub fn dob(&self) -> Result<Option<NaiveDate>, chrono::ParseError> {
        self.dob
            .as_ref()
            .map(|d| NaiveDate::parse_from_str(d.leak(), DATE_FORMAT))
            .transpose()
    }

    /// helper to normalize an idv data struct
    pub fn get_normalized(&self, idk: IdentityDataKind) -> Option<PiiString> {
        self.get(idk).map(|p| p.leak().trim().to_lowercase().into())
    }

    pub fn state_and_country_for_vendors(&self) -> IdvDataStateAndCountry {
        // For some vendors, they expect US territory country codes to be sent in the "state" field but US territory code is vaulted in `id.country`
        if self
            .country
            .as_ref()
            .and_then(|c| Iso3166TwoDigitCountryCode::from_str(c.leak()).ok())
            .is_some_and(|code| code.is_us_territory())
        {
            if self.state.is_some() {
                // error so we can check nothing changed on the FE<>BE impl since we don't expect this
                tracing::error!(verification_request_id=?self.verification_request_id, "state provided for US territory");
            }
            IdvDataStateAndCountry {
                state: self.country.clone(),
                country: Some(Iso3166TwoDigitCountryCode::US.to_string().into()),
            }
        } else {
            IdvDataStateAndCountry {
                state: self.state.clone(),
                country: self.country.clone(),
            }
        }
    }
}

#[derive(PartialEq, Eq, Clone, Debug)]
pub struct IdvDataStateAndCountry {
    pub state: Option<PiiString>,
    pub country: Option<PiiString>,
}

// KYB analogs of IdvData, still TBD and subject to change
#[derive(Debug, Clone, Default)]
pub struct BoData {
    pub first_name: PiiString,
    pub last_name: PiiString,
}

// An struct representing the business data we fetch from the vault
#[derive(Debug, Clone, Default)]
pub struct BusinessDataFromVault {
    pub name: Option<PiiString>,
    pub dba: Option<PiiString>,
    pub website_url: Option<PiiString>,
    pub phone_number: Option<PiiString>,
    pub tin: Option<PiiString>,
    pub address_line1: Option<PiiString>,
    pub address_line2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip: Option<PiiString>,
    pub business_owners: Vec<BoData>,
}

// An enum representing the validated business we produce to send to middesk
#[allow(clippy::large_enum_variant)]
pub enum BusinessDataForRequest {
    FullKyb {
        name: PiiString,
        city: PiiString,
        state: PiiString,
        zip: PiiString,
        dba: Option<PiiString>,
        website_url: Option<PiiString>,
        phone_number: Option<PiiString>,
        tin: Option<PiiString>,
        address_line1: PiiString,
        address_line2: Option<PiiString>,
        business_owners: Vec<BoData>,
    },
    EinOnly {
        tin: PiiString,
        name: PiiString,
    },
}


impl From<BusinessOwnerData> for BoData {
    fn from(value: BusinessOwnerData) -> Self {
        Self {
            first_name: value.first_name,
            last_name: value.last_name,
        }
    }
}

pub struct EinOnly(pub bool);
impl TryFrom<(BusinessDataFromVault, EinOnly)> for BusinessDataForRequest {
    type Error = super::Error;

    fn try_from(value: (BusinessDataFromVault, EinOnly)) -> Result<Self, Self::Error> {
        let (data, ein_only) = value;
        let BusinessDataFromVault {
            name,
            dba,
            website_url,
            phone_number,
            tin,
            address_line1,
            address_line2,
            city,
            state,
            zip,
            business_owners,
        } = data;
        let res = if ein_only.0 {
            BusinessDataForRequest::EinOnly {
                tin: tin.ok_or(AssertionError("missing business tin".into()))?,
                name: name.ok_or(AssertionError("missing business name".into()))?,
            }
        } else {
            BusinessDataForRequest::FullKyb {
                name: name.ok_or(AssertionError("missing business name".into()))?,
                city: city.ok_or(AssertionError("missing business city".into()))?,
                state: state.ok_or(AssertionError("missing business state".into()))?,
                zip: zip.ok_or(AssertionError("missing business zip".into()))?,
                address_line1: address_line1
                    .ok_or(AssertionError("missing business address_line_1".into()))?,
                address_line2,
                dba,
                website_url,
                phone_number,
                tin,
                business_owners,
            }
        };


        Ok(res)
    }
}


#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case("US" => IdvDataStateAndCountry {state: Some("NY".into()), country: Some("US".into())})]
    #[test_case("PR" => IdvDataStateAndCountry {state: Some("PR".into()), country: Some("US".into())}; "sending PR country puts PR into state instead of country")]
    fn test_state_and_country_for_vendors(country: &str) -> IdvDataStateAndCountry {
        let idv_data = IdvData {
            country: Some(country.into()),
            state: Some("NY".into()),
            ..Default::default()
        };

        idv_data.state_and_country_for_vendors()
    }
}
