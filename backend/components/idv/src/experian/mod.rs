use self::cross_core::response::CrossCoreAPIResponse;
use newtypes::vendor_credentials::ExperianCredentials;
use newtypes::IdvData;
use newtypes::PiiJsonValue;
use regex::Regex;

pub mod auth;
pub mod cross_core;
pub mod error;
pub mod precise_id;

lazy_static::lazy_static! {
    pub static ref ADDRESS_LINE_1_VALIDATION: Regex =
        Regex::new(r"[^a-zA-Z0-9#\s \-'$/\.]").unwrap();
    pub static ref CITY_VALIDATION: Regex =
        Regex::new(r"[^a-zA-Z\s \-'\.]").unwrap();
    pub static ref NAME_VALIDATION: Regex =
        Regex::new(r"[^a-zA-Z \-'\s]").unwrap();

}
pub struct ExperianCrossCoreRequest {
    pub idv_data: IdvData,
    pub credentials: ExperianCredentials,
}

#[derive(Clone)]
pub struct ExperianCrossCoreResponse {
    pub raw_response: PiiJsonValue,
    pub parsed_response: CrossCoreAPIResponse,
}

fn normalize_with_regex(s: &str, regex: &Regex) -> String {
    let converted = deunicode::deunicode(s);
    regex.replace_all(&converted, "").trim().to_string()
}

pub fn normalize_address_line_1(s: &str) -> String {
    normalize_with_regex(s, &ADDRESS_LINE_1_VALIDATION)
}

pub fn normalize_city(s: &str) -> String {
    normalize_with_regex(s, &CITY_VALIDATION)
}

pub fn normalize_name(s: &str) -> String {
    normalize_with_regex(s, &NAME_VALIDATION)
}

#[cfg(test)]
mod tests {
    use test_case::test_case;
    #[test_case("123 Penguin Blvd.-   " => "123 Penguin Blvd.-".to_string())]
    #[test_case("123 Penguini Blvd," => "123 Penguini Blvd".to_string())]
    #[test_case("123, Penguini's Blvd" => "123 Penguini's Blvd".to_string())]
    #[test_case("123 Penguin Blvd, Apt 1" => "123 Penguin Blvd Apt 1".to_string())]
    #[test_case("3 Penguin Blvd, #1" => "3 Penguin Blvd #1".to_string())]
    #[test_case("Out of the US (Brazil)" => "Out of the US Brazil".to_string())] // real case
    #[test_case("1 Penguín street" => "1 Penguin street".to_string())]
    #[test_case("1 Main Street Apt 2" => "1 Main Street Apt 2".to_string())]
    fn test_normalize_address_line_1(s: &str) -> String {
        super::normalize_address_line_1(s)
    }

    #[test_case("123 Boston.#,'-   " => "Boston.'-".to_string())]
    #[test_case("Boston" => "Boston")]
    fn test_normalize_city(s: &str) -> String {
        super::normalize_city(s)
    }

    #[test_case("Piip Penguin.#,'-   " => "Piip Penguin'-".to_string())]
    #[test_case("Peter" => "Peter")]
    fn test_normalize_name(s: &str) -> String {
        super::normalize_name(s)
    }
}
