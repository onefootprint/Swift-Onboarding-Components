use newtypes::*;
use std::fmt::Debug;

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct BusinessRequest {
    name: PiiString, // TODO: do we consider this PII?
    addresses: Vec<Address>,
    tin: Option<PiiString>,
    people: Vec<Person>,
    website: Option<Website>,
    phone_numbers: Option<Vec<PhoneNumber>>,
}

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct Address {
    // TODO: do we consider Address PII?
    pub address_line1: PiiString,
    pub address_line2: Option<PiiString>,
    pub city: PiiString,
    pub state: PiiString,
    pub postal_code: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct Person {
    pub name: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct PhoneNumber {
    pub phone_number: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct Website {
    pub url: PiiString,
}

impl From<BusinessData> for BusinessRequest {
    fn from(data: BusinessData) -> Self {
        Self {
            name: data.name,
            addresses: vec![Address {
                address_line1: data.address_line1,
                address_line2: data.address_line2,
                city: data.city,
                state: data.state,
                postal_code: data.zip,
            }],
            tin: data.tin,
            people: data
                .business_owners
                .into_iter()
                .map(|bo| Person {
                    name: PiiString::from(format!("{} {}", bo.first_name.leak(), bo.last_name.leak())),
                })
                .collect(),
            website: data.website_url.map(|url| Website { url }),
            phone_numbers: data.phone_number.map(|p| vec![PhoneNumber { phone_number: p }]),
        }
    }
}

#[cfg(test)]
mod tests {

    use crate::middesk::request;

    use super::*;
    use newtypes::{BoData, BusinessData};

    #[test]
    fn test_from_business_data() {
        let business_data = BusinessData {
            name: PiiString::from("Waffle House"),
            website_url: Some(PiiString::from("www.wafflehouse.com")),
            phone_number: Some(PiiString::from("+11234567890")),
            tin: Some(PiiString::from("23571113171923")),
            address_line1: PiiString::from("2180 Bryant St"),
            address_line2: Some(PiiString::from("#9")),
            city: PiiString::from("San Francisco"),
            state: PiiString::from("CA"),
            zip: PiiString::from("94110"),
            business_owners: vec![
                BoData {
                    first_name: PiiString::from("Marvin"),
                    last_name: PiiString::from("Gaye"),
                },
                BoData {
                    first_name: PiiString::from("Miles"),
                    last_name: PiiString::from("Davis"),
                },
            ],
        };

        assert_eq!(
            BusinessRequest::from(business_data),
            BusinessRequest {
                name: PiiString::from("Waffle House"),
                addresses: vec![Address {
                    address_line1: PiiString::from("2180 Bryant St"),
                    address_line2: Some(PiiString::from("#9")),
                    city: PiiString::from("San Francisco"),
                    state: PiiString::from("CA"),
                    postal_code: PiiString::from("94110")
                }],
                tin: Some(PiiString::from("23571113171923")),
                people: vec![
                    Person {
                        name: PiiString::from("Marvin Gaye")
                    },
                    Person {
                        name: PiiString::from("Miles Davis")
                    }
                ],
                website: Some(Website {
                    url: PiiString::from("www.wafflehouse.com")
                }),
                phone_numbers: Some(vec![request::business::PhoneNumber {
                    phone_number: PiiString::from("+11234567890")
                }])
            }
        );
    }
}
