use newtypes::DataLifetimeKind::{self, *};
use strum::IntoEnumIterator;
use strum_macros::{Display, EnumIter};

#[derive(Debug, Clone, EnumIter, PartialEq, Eq, Display)]
#[strum(serialize_all = "lowercase")]
pub enum SocureModule {
    AddressRisk,
    AlertList,
    Decision,
    EmailRisk,
    KYC,
    WatchlistPremier,
    PhoneRisk,
    DeviceRisk,
    Fraud,
    Synthetic,
}

struct Requirements {
    required: Vec<DataLifetimeKind>,
    one_of: Vec<Vec<DataLifetimeKind>>,
}

impl SocureModule {
    // Whether or not the Socure module requires certain pieces of PII data
    fn requires_pii_data(&self) -> bool {
        match self {
            SocureModule::Decision => false, // Decision is always included in the request
            SocureModule::DeviceRisk => false, // Device risk is included if we have a deviceSessionId (which we theoretically should also always have)
            _ => true,
        }
    }

    fn pii_data_requirements(&self) -> Requirements {
        match self {
            SocureModule::AddressRisk => Requirements {
                required: vec![FirstName, LastName, AddressLine1, Country],
                one_of: vec![vec![City, State], vec![Zip]],
            },
            SocureModule::AlertList => Requirements {
                required: vec![],
                one_of: vec![vec![Ssn9], vec![Email], vec![PhoneNumber]],
            },
            SocureModule::EmailRisk => Requirements {
                required: vec![Email],
                one_of: vec![],
            },
            SocureModule::KYC => Requirements {
                required: vec![FirstName, LastName, Country],
                one_of: vec![vec![AddressLine1, City, State, Zip], vec![Ssn9], vec![Dob]],
            },
            SocureModule::WatchlistPremier => Requirements {
                required: vec![FirstName, LastName],
                one_of: vec![],
            },
            SocureModule::PhoneRisk => Requirements {
                required: vec![PhoneNumber, Country],
                one_of: vec![],
            },
            SocureModule::DeviceRisk => Requirements {
                required: vec![],
                one_of: vec![],
            },
            SocureModule::Fraud => Requirements {
                required: vec![FirstName, LastName, Country],
                one_of: vec![
                    vec![AddressLine1, City, State, Zip],
                    vec![AddressLine1, City, Zip],
                    vec![AddressLine1, State, Zip],
                    vec![AddressLine1, Zip],
                    vec![PhoneNumber],
                    vec![Email],
                ],
            },
            SocureModule::Decision => Requirements {
                required: vec![],
                one_of: vec![],
            },
            SocureModule::Synthetic => Requirements {
                required: vec![FirstName, LastName, Country],
                one_of: vec![
                    vec![AddressLine1, City, State, Zip],
                    vec![AddressLine1, City, State],
                    vec![AddressLine1, Zip],
                    vec![PhoneNumber],
                    vec![Email],
                    vec![Ssn9],
                    vec![Dob],
                ],
            },
        }
    }

    fn meets_requirements_for_module(&self, present_data_kinds: &[DataLifetimeKind]) -> bool {
        let requirements_for_module = self.pii_data_requirements();

        let required_met = requirements_for_module
            .required
            .iter()
            .all(|r| present_data_kinds.contains(r));

        let one_of_met = if requirements_for_module.one_of.is_empty() {
            true
        } else {
            requirements_for_module
                .one_of
                .iter()
                .any(|v| v.iter().all(|r| present_data_kinds.contains(r)))
        };

        required_met & one_of_met
    }
}

fn modules_meeting_pii_requirements(present_data_kinds: &[DataLifetimeKind]) -> Vec<SocureModule> {
    SocureModule::iter()
        .filter(|sm| sm.requires_pii_data())
        .filter(|sm| sm.meets_requirements_for_module(present_data_kinds))
        .collect()
}

pub fn modules_for_idplus_request(
    present_data_kinds: &[DataLifetimeKind],
    device_session_id: &Option<String>,
) -> Vec<SocureModule> {
    let mut modules_meeting_requirement = modules_meeting_pii_requirements(present_data_kinds);

    if device_session_id.is_some() {
        modules_meeting_requirement.push(SocureModule::DeviceRisk);
    }
    // modules_meeting_requirement.push(SocureModule::Decision); //TODO: we aren't provisioned for this yet

    modules_meeting_requirement
}

pub fn meets_requirements_for_idplus_request(present_data_kinds: &[DataLifetimeKind]) -> bool {
    let modules_meeting_requirements = modules_meeting_pii_requirements(present_data_kinds);

    !modules_meeting_requirements.is_empty()
}

#[cfg(test)]
mod tests {

    use super::*;
    use newtypes::{IdvData, PiiString};
    use SocureModule::*;

    #[test]
    fn test1() {
        let idv_data = IdvData {
            first_name: Some(PiiString::from("Dwayne")),
            last_name: Some(PiiString::from("Denver")),
            address_line1: None,
            address_line2: None,
            city: None,
            state: None,
            country: Some(PiiString::from("US")),
            zip: None,
            ssn4: None,
            ssn9: None,
            dob: Some(PiiString::from("1975-04-02")),
            email: None,
            phone_number: None,
        };

        let present_data_kinds = IdvData::present_data_attributes(&idv_data);
        assert_eq!(
            vec![KYC, WatchlistPremier, Synthetic],
            modules_meeting_pii_requirements(&present_data_kinds)
        );
        assert_eq!(
            vec![KYC, WatchlistPremier, Synthetic, DeviceRisk],
            modules_for_idplus_request(&present_data_kinds, &Some(String::from("device123")))
        );
        assert_eq!(
            vec![KYC, WatchlistPremier, Synthetic],
            modules_for_idplus_request(&present_data_kinds, &None)
        );
    }
}
