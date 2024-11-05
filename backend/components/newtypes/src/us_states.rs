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
        let from_2_char = Self::from_raw_string_inner(s);
        let from_full: Result<UsStateAndTerritories, strum::ParseError> =
            UsStateFull::from_raw_string_inner(s).map(|full| full.into());

        from_2_char.or(from_full)
    }

    fn from_raw_string_inner(s: &str) -> Result<Self, strum::ParseError> {
        let sanitized = s.trim().to_uppercase();

        UsStateAndTerritories::try_from(sanitized.as_str())
    }

    pub fn is_state(&self) -> bool {
        !matches!(
            self,
            UsStateAndTerritories::PR
                | UsStateAndTerritories::AS
                | UsStateAndTerritories::GU
                | UsStateAndTerritories::MP
                | UsStateAndTerritories::MH
                | UsStateAndTerritories::VI
                | UsStateAndTerritories::PW
                | UsStateAndTerritories::FM
        )
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
    fn from_raw_string_inner(s: &str) -> Result<Self, strum::ParseError> {
        let trimmed = s.trim();
        let chars: Vec<_> = trimmed.split_whitespace().collect();
        let sanitized = chars.join(" ").to_uppercase().replace(' ', "_").replace('.', "");

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

    #[test_case("  North    DaKotA     " => UsStateAndTerritories::ND)]
    #[test_case(" WY " => UsStateAndTerritories::WY)]
    #[test_case("new              york" => UsStateAndTerritories::NY)]
    #[test_case("Washington D.C." => UsStateAndTerritories::DC)]
    #[test_case("DC" => UsStateAndTerritories::DC)]
    #[test_case("Puerto Rico" => UsStateAndTerritories::PR)]
    #[test_case("Virgin Islands" => UsStateAndTerritories::VI)]
    #[test_case("U.S. Virgin Islands" => UsStateAndTerritories::VI)]
    #[test_case("United States Virgin Islands" => UsStateAndTerritories::VI)]
    #[test_case("American Samoa" => UsStateAndTerritories::AS)]
    #[test_case("Northern Mariana Islands" => UsStateAndTerritories::MP)]
    #[test_case("Guam" => UsStateAndTerritories::GU)]
    fn test_us_state_from_raw_string(raw: &str) -> UsStateAndTerritories {
        UsStateAndTerritories::from_raw_string(raw).unwrap()
    }
}
