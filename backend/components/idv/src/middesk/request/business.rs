use newtypes::*;
use std::fmt::Debug;

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct BusinessRequest {
    pub external_id: String,
    #[serde(flatten)]
    pub(crate) data: BusinessRequestData,
}

#[allow(clippy::large_enum_variant)]
#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
#[serde(untagged)]
pub(crate) enum BusinessRequestData {
    Kyb {
        name: PiiString, // TODO: do we consider this PII?
        addresses: Vec<Address>,
        tin: Option<Tin>,
        people: Vec<Person>,
        website: Option<Website>,
        phone_numbers: Option<Vec<PhoneNumber>>,
        names: Option<Vec<Name>>,
    },
    TinCheck {
        tin: Tin,
        name: PiiString,
    },
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
pub struct Tin {
    pub tin: PiiString,
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

#[derive(Debug, Clone, serde::Serialize, PartialEq, Eq)]
pub struct Name {
    pub name: PiiString,
    pub name_type: PiiString,
}

type ExternalId = String;
impl From<(BusinessDataForRequest, ExternalId)> for BusinessRequest {
    fn from(data: (BusinessDataForRequest, ExternalId)) -> Self {
        let (data, external_id) = data;

        let biz_data = match data {
            BusinessDataForRequest::FullKyb {
                name,
                city,
                state,
                zip,
                dba,
                website_url,
                phone_number,
                tin,
                address_line1,
                address_line2,
                business_owners,
            } => {
                let addresses = vec![Address {
                    address_line1,
                    address_line2,
                    city,
                    state,
                    postal_code: zip,
                }];
                let tin = tin.map(|t| Tin { tin: t });
                let people = business_owners
                    .into_iter()
                    .map(|bo| Person {
                        name: PiiString::from(format!("{} {}", bo.first_name.leak(), bo.last_name.leak())),
                    })
                    .collect();
                let website = website_url.map(|url| Website { url });
                let phone_numbers = phone_number.map(|p| vec![PhoneNumber { phone_number: p }]);
                let names = dba.map(|dba| {
                    vec![Name {
                        name: dba,
                        name_type: PiiString::from("dba"),
                    }]
                });

                BusinessRequestData::Kyb {
                    name,
                    addresses,
                    tin,
                    people,
                    website,
                    phone_numbers,
                    names,
                }
            }
            BusinessDataForRequest::EinOnly { tin, name } => {
                let tin = Tin { tin };
                BusinessRequestData::TinCheck { tin, name }
            }
        };

        BusinessRequest {
            external_id,
            data: biz_data,
        }
    }
}

#[cfg(test)]
mod tests {

    use super::*;
    use crate::middesk::request;
    use newtypes::BoData;
    use newtypes::BusinessDataFromVault;

    #[test]
    fn test_from_business_data() {
        // Biz data in the vault
        let business_data = BusinessDataFromVault {
            name: Some(PiiString::from("Waffle House")),
            dba: Some(PiiString::from("waho")),
            website_url: Some(PiiString::from("www.wafflehouse.com")),
            phone_number: Some(PiiString::from("+11234567890")),
            tin: Some(PiiString::from("23571113171923")),
            address_line1: Some(PiiString::from("2180 Bryant St")),
            address_line2: Some(PiiString::from("#9")),
            city: Some(PiiString::from("San Francisco")),
            state: Some(PiiString::from("CA")),
            zip: Some(PiiString::from("94110")),
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

        let expected_request_struct = BusinessRequest {
            external_id: "external_id123".to_string(),
            data: BusinessRequestData::Kyb {
                name: PiiString::from("Waffle House"),
                addresses: vec![super::Address {
                    address_line1: PiiString::from("2180 Bryant St"),
                    address_line2: Some(PiiString::from("#9")),
                    city: PiiString::from("San Francisco"),
                    state: PiiString::from("CA"),
                    postal_code: PiiString::from("94110"),
                }],
                tin: Some(Tin {
                    tin: PiiString::from("23571113171923"),
                }),
                people: vec![
                    Person {
                        name: PiiString::from("Marvin Gaye"),
                    },
                    Person {
                        name: PiiString::from("Miles Davis"),
                    },
                ],
                website: Some(Website {
                    url: PiiString::from("www.wafflehouse.com"),
                }),
                phone_numbers: Some(vec![request::business::PhoneNumber {
                    phone_number: PiiString::from("+11234567890"),
                }]),
                names: Some(vec![request::business::Name {
                    name: PiiString::from("waho"),
                    name_type: PiiString::from("dba"),
                }]),
            },
        };
        let expected_json = serde_json::json!(
            {
                "addresses": [
                  {
                    "address_line1": "2180 Bryant St",
                    "address_line2": "#9",
                    "city": "San Francisco",
                    "postal_code": "94110",
                    "state": "CA"
                  }
                ],
                "external_id": "external_id123",
                "name": "Waffle House",
                "names": [
                  {
                    "name": "waho",
                    "name_type": "dba"
                  }
                ],
                "people": [
                  {
                    "name": "Marvin Gaye"
                  },
                  {
                    "name": "Miles Davis"
                  }
                ],
                "phone_numbers": [
                  {
                    "phone_number": "+11234567890"
                  }
                ],
                "tin": {
                  "tin": "23571113171923"
                },
                "website": {
                  "url": "www.wafflehouse.com"
                }
              }
        );

        let business_data_for_request =
            BusinessDataForRequest::try_from((business_data.clone(), EinOnly(false))).unwrap();
        let business_request = BusinessRequest::from((business_data_for_request, "external_id123".into()));

        assert_eq!(business_request.clone(), expected_request_struct);
        assert_eq!(serde_json::to_value(business_request).unwrap(), expected_json);

        // EIN ONLY
        let expected_business_request_struct = BusinessRequest {
            external_id: "external_id123".to_string(),
            data: BusinessRequestData::TinCheck {
                tin: Tin {
                    tin: PiiString::from("23571113171923"),
                },
                name: PiiString::from("Waffle House"),
            },
        };
        let expected_request_json = serde_json::json!({
            "external_id": "external_id123",
            "name": "Waffle House",
            "tin": {
                "tin": "23571113171923"
            }
        });

        let business_data_for_request_ein_only =
            BusinessDataForRequest::try_from((business_data, EinOnly(true))).unwrap();
        let business_request =
            BusinessRequest::from((business_data_for_request_ein_only, "external_id123".into()));

        assert_eq!(business_request.clone(), expected_business_request_struct.clone());
        assert_eq!(
            serde_json::to_value(business_request).unwrap(),
            expected_request_json
        )
    }
}
