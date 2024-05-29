use newtypes::{
    IdentityDataKind,
    IdvData,
    PiiString,
};

pub enum TestCaseOutcome {
    Pass,
    DeceasedSSN,
}
pub(crate) struct ExperianSandboxTestCase {
    pub idv_data: IdvData,
    #[allow(dead_code)]
    pub outcome: TestCaseOutcome,
}

impl std::ops::Deref for ExperianSandboxTestCase {
    type Target = IdvData;

    fn deref(&self) -> &Self::Target {
        &self.idv_data
    }
}

impl ExperianSandboxTestCase {
    pub fn matches(&self, data_to_match: &IdvData, is_production: bool) -> bool {
        // find what attributes are present in the data to match
        let data_to_match_attributes = data_to_match.present_data_attributes();

        // make sure all of them match a test case
        // TODO: get is_production case
        data_to_match_attributes.into_iter().all(|idk| {
            // in sandbox we just don't send phone or email to experian
            // 1) it always is collected in bifrost
            // 2) none of the experian test cases include it, so we should never send it.
            if !is_production && [IdentityDataKind::PhoneNumber, IdentityDataKind::Email].contains(&idk) {
                true
            } else {
                self.get_normalized(idk) == data_to_match.get_normalized(idk)
            }
        })
    }
}

/// If sending to sandbox, ensure entire struct matches so we're sure we're sending the correct test
/// data If sending to production, we need to check if it's fuzzy a test case
/// +---------------------+--------------+------------------+
/// |                     |   Prod data  |  Sandbox data    |
/// +---------------------+--------------+------------------+
/// | Prod credentials    | Fine         |        Bad       |
/// | Sandbox credentials | Bad          |        Fine      |
/// +---------------------+--------------+------------------+
pub fn is_sandbox_data(idv_data: &IdvData, is_production: bool) -> bool {
    load_sandbox_data()
        .iter()
        .any(|tc| tc.matches(idv_data, is_production))
}

pub(crate) fn load_sandbox_data() -> Vec<ExperianSandboxTestCase> {
    let passing = vec![IdvData {
        first_name: lift_pii("JANALEE"),
        last_name: lift_pii("CHANDLER-ZOSS"),
        address_line1: lift_pii("280 MAIN ST"),
        zip: lift_pii("01235"),
        city: lift_pii("HINSDALE"),
        state: lift_pii("MA"),
        country: lift_pii("US"),
        dob: lift_pii("1943-04-22"),
        ssn4: lift_pii("5123"),
        ssn9: lift_pii("666055123"),
        ..Default::default()
    }]
    .into_iter()
    .map(|tc| ExperianSandboxTestCase {
        idv_data: tc,
        outcome: TestCaseOutcome::Pass,
    });

    let deceased = vec![IdvData {
        first_name: lift_pii("JON"),
        last_name: lift_pii("MILLEN"),
        address_line1: lift_pii("53 ROTARY WAY"),
        zip: lift_pii("94591"),
        city: lift_pii("VALLEJO"),
        state: lift_pii("CA"),
        country: lift_pii("US"),
        dob: lift_pii("1946"),
        ..Default::default()
    }]
    .into_iter()
    .map(|tc| ExperianSandboxTestCase {
        idv_data: tc,
        outcome: TestCaseOutcome::DeceasedSSN,
    });

    passing.chain(deceased).collect()
}

pub fn lift_pii<S: Into<String>>(s: S) -> Option<PiiString> {
    Some(PiiString::from(s.into()))
}

#[cfg(test)]
mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case(&IdvData {
        first_name: lift_pii("JON"),
        last_name: lift_pii("MILLEN"),
        address_line1: lift_pii("53 ROTARY WAY"),
        zip: lift_pii("94591"),
        city: lift_pii("VALLEJO"),
        state: lift_pii("CA"),
        country: lift_pii("US"),
        ..Default::default()
    } => true; "test case")]
    #[test_case(&IdvData {
        first_name: lift_pii("JON"),
        last_name: lift_pii("MILLEN"),
        address_line1: lift_pii("53 ROTARY WAY"),
        zip: lift_pii("94591"),
        ssn9: lift_pii("123456789"),
        ..Default::default()
    } => false; "test case, but ssn9 is wrong format (prefix is not 666)")]
    #[test_case(&IdvData {
        first_name: lift_pii("Bob"),
        last_name: lift_pii("Boberto"),
        address_line1: lift_pii("123 main way"),
        ..Default::default()
    }=> false; "Not a test case")]
    #[test_case(&IdvData {
        first_name: lift_pii("jon    "),
        last_name: lift_pii("     millen"),
        address_line1: lift_pii("53 rotary way"),
        zip: lift_pii("94591"),
        city: lift_pii("VALLEJO"),
        state: lift_pii("CA"),
        country: lift_pii("US"),
        ..Default::default()
    }=> true; "lowercase test case, with whitespace")]
    fn test_is_sandbox_data(idv_data: &IdvData) -> bool {
        is_sandbox_data(idv_data, false)
    }
}
