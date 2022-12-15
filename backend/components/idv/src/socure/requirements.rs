use newtypes::DataLifetimeKind::{self, *};
use strum::IntoEnumIterator;
use strum_macros::{Display, EnumIter};

#[derive(Debug, Clone, EnumIter, PartialEq, Eq, Display)]
#[strum(serialize_all = "lowercase")]
pub enum SocureModule {
    AddressRisk,
    AlertList,
    EmailRisk,
    KYC,
    // KYCPlus,
    WatchlistPremier,
    PhoneRisk,
    // DeviceRisk, TODO: requires wiring deviceSessionId from frontend SDK
    Fraud,
    // Synthetic, TODO: our api key isn't provisioned for synthetic
    // ECBSV, TODO: our api key isn't provisioned for ecbsv
}

struct Requirements {
    required: Vec<DataLifetimeKind>,
    one_of: Vec<Vec<DataLifetimeKind>>,
}

impl SocureModule {
    fn requirements(&self) -> Requirements {
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
            // SocureModule::KYCPlus => Requirements {
            //     required: vec![FirstName, LastName, Country],
            //     one_of: vec![vec![AddressLine1, City, State, Zip], vec![Dob], vec![Ssn9]],
            // },
            SocureModule::WatchlistPremier => Requirements {
                required: vec![FirstName, LastName],
                one_of: vec![],
            },
            SocureModule::PhoneRisk => Requirements {
                required: vec![PhoneNumber, Country],
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
            // SocureModule::Synthetic => Requirements {
            //     required: vec![FirstName, LastName, Country],
            //     one_of: vec![
            //         vec![AddressLine1, City, State, Zip],
            //         vec![AddressLine1, City, State],
            //         vec![AddressLine1, Zip],
            //         vec![PhoneNumber],
            //         vec![Email],
            //         vec![Ssn9],
            //         vec![Dob],
            //     ],
            // },
            // SocureModule::ECBSV => Requirements {
            //     required: vec![FirstName, LastName, Dob, Ssn9],
            //     one_of: vec![],
            // },
        }
    }

    fn meets_requirements_for_module(&self, present_data_kinds: &[DataLifetimeKind]) -> bool {
        let requirements_for_module = self.requirements();

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

pub fn all_modules_with_met_requirements(present_data_kinds: &[DataLifetimeKind]) -> Vec<SocureModule> {
    SocureModule::iter()
        .filter(|sm| sm.meets_requirements_for_module(present_data_kinds))
        .collect()
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
            vec![KYC, WatchlistPremier],
            all_modules_with_met_requirements(&present_data_kinds)
        );
    }
}
