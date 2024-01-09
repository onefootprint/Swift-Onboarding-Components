#[cfg(test)]
pub(crate) mod test_data {
    use newtypes::PiiString;
    use serde::Serialize;

    fn load_username() -> PiiString {
        PiiString::from(dotenv::var("IDOLOGY_SANDBOX_USERNAME").unwrap())
    }

    fn load_password() -> PiiString {
        PiiString::from(dotenv::var("IDOLOGY_SANDBOX_PASSWORD").unwrap())
    }

    #[derive(Serialize)]
    #[serde(rename_all = "camelCase")]
    pub struct ExpectIDTestData {
        pub first_name: String,
        pub last_name: String,
        pub zip: String,
        pub address_line_1: String,
        pub username: PiiString,
        pub password: PiiString,
        pub dob: String,
        pub ssn: String,
    }
    impl ExpectIDTestData {
        // from https://web.idologylive.com/api_portal.php#expectid-sandbox-testing-subtitle-expectid-sandbox-testing-expectid-iq
        //
        pub fn load_passing_sandbox_data() -> Self {
            Self {
                first_name: "JOHN".to_string(),
                last_name: "SMITH".to_string(),
                zip: "30318".to_string(),
                dob: "02/28/1975".to_string(),
                ssn: "112-22-3333".to_string(),
                username: load_username(),
                password: load_password(),
                address_line_1: "222333 PEACHTREE PLACE".to_string(),
            }
        }
    }
}
