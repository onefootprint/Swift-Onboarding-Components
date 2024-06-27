use paperclip::actix::Apiv2Schema;
use serde_with::DeserializeFromStr;
use serde_with::SerializeDisplay;
use strum_macros::AsRefStr;
use strum_macros::Display;
use strum_macros::EnumString;


/// List of USPS-accepted US States: https://pe.usps.com/text/pub28/28apb.htm
#[derive(
    Debug,
    Clone,
    Copy,
    Eq,
    PartialEq,
    Hash,
    SerializeDisplay,
    Display,
    DeserializeFromStr,
    Apiv2Schema,
    EnumString,
    AsRefStr,
    macros::SerdeAttr,
)]
#[serde(rename_all = "UPPERCASE")]
#[strum(serialize_all = "UPPERCASE")]
pub enum UsStateAndTerritories {
    AL,
    AK,
    AZ,
    AR,
    CA,
    CO,
    CT,
    DE,
    DC,
    FL,
    GA,
    HI,
    ID,
    IL,
    IN,
    IA,
    KS,
    KY,
    LA,
    ME,
    MD,
    MA,
    MI,
    MN,
    MS,
    MO,
    MT,
    NE,
    NV,
    NH,
    NJ,
    NM,
    NY,
    NC,
    ND,
    OH,
    OK,
    OR,
    PA,
    RI,
    SC,
    SD,
    TN,
    TX,
    UT,
    VT,
    VA,
    WA,
    WV,
    WI,
    WY,
    // Territories
    PR,
    AS,
    GU,
    MP,
    MH,
    VI,
    PW,
    FM,
}

impl UsStateAndTerritories {
    pub fn from_raw_string(s: &str) -> Result<Self, strum::ParseError> {
        let sanitized = s.trim().to_uppercase();

        UsStateAndTerritories::try_from(sanitized.as_str())
    }
}

#[derive(Display, Debug, EnumString, Eq, PartialEq)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum UsStateFull {
    Alabama,
    Alaska,
    Arizona,
    Arkansas,
    California,
    Colorado,
    Connecticut,
    Delaware,
    Florida,
    Georgia,
    Hawaii,
    Idaho,
    Illinois,
    Indiana,
    Iowa,
    Kansas,
    Kentucky,
    Louisiana,
    Maine,
    Maryland,
    Massachusetts,
    Michigan,
    Minnesota,
    Mississippi,
    Missouri,
    Montana,
    Nebraska,
    Nevada,
    NewHampshire,
    NewJersey,
    NewMexico,
    NewYork,
    NorthCarolina,
    NorthDakota,
    Ohio,
    Oklahoma,
    Oregon,
    Pennsylvania,
    RhodeIsland,
    SouthCarolina,
    SouthDakota,
    Tennessee,
    Texas,
    Utah,
    Vermont,
    Virginia,
    Washington,
    WestVirginia,
    Wisconsin,
    Wyoming,
    WashingtonDC,
    // Territories
    PuertoRico,
    AmericanSamoa,
    MarshallIslands,
    Palau,
    FederatedStatesofMicronesia,
    NorthernMarianaIslands,
    #[strum(
        serialize = "VIRGIN_ISLANDS",
        serialize = "US_VIRGIN_ISLANDS",
        serialize = "UNITED_STATES_VIRGIN_ISLANDS"
    )]
    VirginIslands,
    Guam,
}

impl UsStateFull {
    pub fn from_raw_string(s: &str) -> Result<Self, strum::ParseError> {
        let sanitized = s.trim().to_uppercase().replace(' ', "_").replace('.', "");

        UsStateFull::try_from(sanitized.as_str())
    }
}

impl From<UsStateFull> for UsStateAndTerritories {
    fn from(value: UsStateFull) -> UsStateAndTerritories {
        match value {
            UsStateFull::Alabama => UsStateAndTerritories::AL,
            UsStateFull::Alaska => UsStateAndTerritories::AK,
            UsStateFull::Arizona => UsStateAndTerritories::AZ,
            UsStateFull::Arkansas => UsStateAndTerritories::AR,
            UsStateFull::California => UsStateAndTerritories::CA,
            UsStateFull::Colorado => UsStateAndTerritories::CO,
            UsStateFull::Connecticut => UsStateAndTerritories::CT,
            UsStateFull::Delaware => UsStateAndTerritories::DE,
            UsStateFull::Florida => UsStateAndTerritories::FL,
            UsStateFull::Georgia => UsStateAndTerritories::GA,
            UsStateFull::Hawaii => UsStateAndTerritories::HI,
            UsStateFull::Idaho => UsStateAndTerritories::ID,
            UsStateFull::Illinois => UsStateAndTerritories::IL,
            UsStateFull::Indiana => UsStateAndTerritories::IN,
            UsStateFull::Iowa => UsStateAndTerritories::IA,
            UsStateFull::Kansas => UsStateAndTerritories::KS,
            UsStateFull::Kentucky => UsStateAndTerritories::KY,
            UsStateFull::Louisiana => UsStateAndTerritories::LA,
            UsStateFull::Maine => UsStateAndTerritories::ME,
            UsStateFull::Maryland => UsStateAndTerritories::MD,
            UsStateFull::Massachusetts => UsStateAndTerritories::MA,
            UsStateFull::Michigan => UsStateAndTerritories::MI,
            UsStateFull::Minnesota => UsStateAndTerritories::MN,
            UsStateFull::Mississippi => UsStateAndTerritories::MS,
            UsStateFull::Missouri => UsStateAndTerritories::MO,
            UsStateFull::Montana => UsStateAndTerritories::MT,
            UsStateFull::Nebraska => UsStateAndTerritories::NE,
            UsStateFull::Nevada => UsStateAndTerritories::NV,
            UsStateFull::NewHampshire => UsStateAndTerritories::NH,
            UsStateFull::NewJersey => UsStateAndTerritories::NJ,
            UsStateFull::NewMexico => UsStateAndTerritories::NM,
            UsStateFull::NewYork => UsStateAndTerritories::NY,
            UsStateFull::NorthCarolina => UsStateAndTerritories::NC,
            UsStateFull::NorthDakota => UsStateAndTerritories::ND,
            UsStateFull::Ohio => UsStateAndTerritories::OH,
            UsStateFull::Oklahoma => UsStateAndTerritories::OK,
            UsStateFull::Oregon => UsStateAndTerritories::OR,
            UsStateFull::Pennsylvania => UsStateAndTerritories::PA,
            UsStateFull::RhodeIsland => UsStateAndTerritories::RI,
            UsStateFull::SouthCarolina => UsStateAndTerritories::SC,
            UsStateFull::SouthDakota => UsStateAndTerritories::SD,
            UsStateFull::Tennessee => UsStateAndTerritories::TN,
            UsStateFull::Texas => UsStateAndTerritories::TX,
            UsStateFull::Utah => UsStateAndTerritories::UT,
            UsStateFull::Vermont => UsStateAndTerritories::VT,
            UsStateFull::Virginia => UsStateAndTerritories::VA,
            UsStateFull::Washington => UsStateAndTerritories::WA,
            UsStateFull::WestVirginia => UsStateAndTerritories::WV,
            UsStateFull::Wisconsin => UsStateAndTerritories::WI,
            UsStateFull::Wyoming => UsStateAndTerritories::WY,
            UsStateFull::WashingtonDC => UsStateAndTerritories::DC,
            UsStateFull::PuertoRico => UsStateAndTerritories::PR,
            UsStateFull::AmericanSamoa => UsStateAndTerritories::AS,
            UsStateFull::NorthernMarianaIslands => UsStateAndTerritories::MP,
            UsStateFull::VirginIslands => UsStateAndTerritories::VI,
            UsStateFull::Guam => UsStateAndTerritories::GU,
            UsStateFull::MarshallIslands => UsStateAndTerritories::MH,
            UsStateFull::Palau => UsStateAndTerritories::PW,
            UsStateFull::FederatedStatesofMicronesia => UsStateAndTerritories::FM,
        }
    }
}

#[cfg(test)]

mod tests {
    use super::*;
    use test_case::test_case;

    #[test_case("  North DaKotA     " => UsStateFull::NorthDakota)]
    #[test_case("new york" => UsStateFull::NewYork)]
    #[test_case("Washington D.C." => UsStateFull::WashingtonDC)]
    #[test_case("Puerto Rico" => UsStateFull::PuertoRico)]
    #[test_case("Virgin Islands" => UsStateFull::VirginIslands)]
    #[test_case("U.S. Virgin Islands" => UsStateFull::VirginIslands)]
    #[test_case("United States Virgin Islands" => UsStateFull::VirginIslands)]
    #[test_case("American Samoa" => UsStateFull::AmericanSamoa)]
    #[test_case("Northern Mariana Islands" => UsStateFull::NorthernMarianaIslands)]
    #[test_case("Guam" => UsStateFull::Guam)]
    fn test_us_state_full_from_raw_string(raw: &str) -> UsStateFull {
        UsStateFull::from_raw_string(raw).unwrap()
    }
}
