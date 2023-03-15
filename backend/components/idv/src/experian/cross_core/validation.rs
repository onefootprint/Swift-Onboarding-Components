use newtypes::{IdvData, PiiString};

pub enum TestCaseOutcome {
    Pass,
    DeceasedSSN,
}
struct ExperianSandboxTestCase {
    idv_data: IdvData,
    #[allow(dead_code)]
    pub outcome: TestCaseOutcome,
}

impl ExperianSandboxTestCase {
    fn required_fields_present(data_to_match: &IdvData) -> bool {
        data_to_match.first_name.is_some()
            && data_to_match.last_name.is_some()
            && data_to_match.address_line1.is_some()
            && data_to_match.zip.is_some()
    }

    pub fn matches(&self, data_to_match: &IdvData) -> bool {
        if !Self::required_fields_present(data_to_match) {
            return false;
        }

        let first_name_match = self
            .idv_data
            .first_name
            .as_ref()
            .and_then(|f1| {
                data_to_match
                    .first_name
                    .as_ref()
                    .map(|f2| normalize_pii_string(f1) == normalize_pii_string(f2))
            })
            .unwrap_or(false);

        let last_name_match = self
            .idv_data
            .last_name
            .as_ref()
            .and_then(|l1| {
                data_to_match
                    .last_name
                    .as_ref()
                    .map(|l2| normalize_pii_string(l1) == normalize_pii_string(l2))
            })
            .unwrap_or(false);

        let address_match = self
            .idv_data
            .address_line1
            .as_ref()
            .and_then(|a1| {
                data_to_match
                    .address_line1
                    .as_ref()
                    .map(|a2| normalize_pii_string(a1) == normalize_pii_string(a2))
            })
            .unwrap_or(false);
        let zip_match = self
            .idv_data
            .zip
            .as_ref()
            .and_then(|z1| {
                data_to_match
                    .zip
                    .as_ref()
                    .map(|z2| normalize_pii_string(z1) == normalize_pii_string(z2))
            })
            .unwrap_or(false);

        let ssn9_is_valid_format = data_to_match
            .ssn9
            .as_ref()
            .map(|ssn9| ssn9.leak().starts_with("666"))
            // if not present, default to true
            .unwrap_or(true);

        // no test cases have ssn4
        // https://docs.google.com/spreadsheets/d/1xeNE4HoCYyHB6-ruLxZoyxiztp761Lhj1xUoQ4cNweY/edit#gid=646517948
        let ssn4_not_present = data_to_match.ssn4.is_none();

        first_name_match
            && last_name_match
            && address_match
            && zip_match
            && ssn9_is_valid_format
            && ssn4_not_present
    }
}

/// If sending to sandbox, ensure entire struct matches so we're sure we're sending the correct test data
/// If sending to production, we need to check if it's fuzzy a test case
/// +---------------------+--------------+------------------+
/// |                     |   Prod data  |  Sandbox data    |
/// +---------------------+--------------+------------------+
/// | Prod credentials    | Fine         |        Bad       |
/// | Sandbox credentials | Bad          |        Fine      |
/// +---------------------+--------------+------------------+
pub fn is_sandbox_data(idv_data: &IdvData) -> bool {
    load_sandbox_data().iter().any(|tc| tc.matches(idv_data))
}

fn load_sandbox_data() -> Vec<ExperianSandboxTestCase> {
    let passing = vec![IdvData {
        first_name: lift_pii("JOHN".into()),
        last_name: lift_pii("BREEN".into()),
        address_line1: lift_pii("PO BOX 445".into()),
        zip: lift_pii("09061".into()),
        city: lift_pii("APO".into()),
        state: lift_pii("AE".into()),
        ssn9: lift_pii("666436878".into()),
        dob: lift_pii("02191957".into()),
        phone_number: lift_pii("7818945369".into()),
        ..Default::default()
    }]
    .into_iter()
    .map(|tc| ExperianSandboxTestCase {
        idv_data: tc,
        outcome: TestCaseOutcome::Pass,
    });

    let deceased = vec![IdvData {
        first_name: lift_pii("JOHN".into()),
        last_name: lift_pii("MILLEN".into()),
        address_line1: lift_pii("53 ROTARY WAY".into()),
        zip: lift_pii("94591".into()),
        city: lift_pii("VALLEJO".into()),
        state: lift_pii("CA".into()),
        ..Default::default()
    }]
    .into_iter()
    .map(|tc| ExperianSandboxTestCase {
        idv_data: tc,
        outcome: TestCaseOutcome::DeceasedSSN,
    });

    passing.chain(deceased).collect()
}

pub fn lift_pii(s: String) -> Option<PiiString> {
    Some(PiiString::from(s))
}

fn normalize_pii_string(s: &PiiString) -> String {
    s.leak().trim().to_lowercase()
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;
    // test case
    #[test_case(&IdvData {
        first_name: lift_pii("JOHN".into()),
        last_name: lift_pii("MILLEN".into()),
        address_line1: lift_pii("53 ROTARY WAY".into()),
        zip: lift_pii("94591".into()),
        ssn9: lift_pii("666347388".into()),
        ..Default::default()
    } => true)]
    // test case, but ssn9 is wrong format (prefix is not 666)
    #[test_case(&IdvData {
        first_name: lift_pii("JOHN".into()),
        last_name: lift_pii("MILLEN".into()),
        address_line1: lift_pii("53 ROTARY WAY".into()),
        zip: lift_pii("94591".into()),
        ssn9: lift_pii("123456789".into()),
        ..Default::default()
    } => false)]
    // Not a test case
    #[test_case(&IdvData {
        first_name: lift_pii("Bob".into()),
        last_name: lift_pii("Boberto".into()),
        address_line1: lift_pii("123 main way".into()),
        ..Default::default()
    }=> false)]
    // lowercase test case, with whitespace
    #[test_case(&IdvData {
        first_name: lift_pii("john    ".into()),
        last_name: lift_pii("millen".into()),
        address_line1: lift_pii("53 rotary way".into()),
        zip: lift_pii("94591".into()),
        ..Default::default()
    }=> true)]
    // test case name, but missing zip
    #[test_case(&IdvData {
        first_name: lift_pii("john".into()),
        last_name: lift_pii("millen".into()),
        address_line1: lift_pii("53 rotary way".into()),
        ..Default::default()
    }=> false)]
    // test case name, but includes ssn4
    #[test_case(&IdvData {
        first_name: lift_pii("john".into()),
        last_name: lift_pii("millen".into()),
        address_line1: lift_pii("millen".into()),
        zip: lift_pii("94591".into()),
        ssn4: lift_pii("1234".into()),
        ..Default::default()
    }=> false)]
    fn test_is_sandbox_data(idv_data: &IdvData) -> bool {
        is_sandbox_data(idv_data)
    }
}
