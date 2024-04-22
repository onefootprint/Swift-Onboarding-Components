use paperclip::actix::Apiv2Schema;

use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum_macros::{AsRefStr, Display, EnumString};

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
pub enum UsState {
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
}

impl UsState {
    pub fn from_raw_string(s: &str) -> Result<Self, strum::ParseError> {
        let sanitized = s.trim().to_uppercase();

        UsState::try_from(sanitized.as_str())
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
    WashingtonDC, // it's in the UsState list already, but not a state /shrug
}

impl UsStateFull {
    pub fn from_raw_string(s: &str) -> Result<Self, strum::ParseError> {
        let sanitized = s.trim().to_uppercase().replace(' ', "_").replace('.', "");

        UsStateFull::try_from(sanitized.as_str())
    }
}

impl From<UsStateFull> for UsState {
    fn from(value: UsStateFull) -> UsState {
        match value {
            UsStateFull::Alabama => UsState::AL,
            UsStateFull::Alaska => UsState::AK,
            UsStateFull::Arizona => UsState::AZ,
            UsStateFull::Arkansas => UsState::AR,
            UsStateFull::California => UsState::CA,
            UsStateFull::Colorado => UsState::CO,
            UsStateFull::Connecticut => UsState::CT,
            UsStateFull::Delaware => UsState::DE,
            UsStateFull::Florida => UsState::FL,
            UsStateFull::Georgia => UsState::GA,
            UsStateFull::Hawaii => UsState::HI,
            UsStateFull::Idaho => UsState::ID,
            UsStateFull::Illinois => UsState::IL,
            UsStateFull::Indiana => UsState::IN,
            UsStateFull::Iowa => UsState::IA,
            UsStateFull::Kansas => UsState::KS,
            UsStateFull::Kentucky => UsState::KY,
            UsStateFull::Louisiana => UsState::LA,
            UsStateFull::Maine => UsState::ME,
            UsStateFull::Maryland => UsState::MD,
            UsStateFull::Massachusetts => UsState::MA,
            UsStateFull::Michigan => UsState::MI,
            UsStateFull::Minnesota => UsState::MN,
            UsStateFull::Mississippi => UsState::MS,
            UsStateFull::Missouri => UsState::MO,
            UsStateFull::Montana => UsState::MT,
            UsStateFull::Nebraska => UsState::NE,
            UsStateFull::Nevada => UsState::NV,
            UsStateFull::NewHampshire => UsState::NH,
            UsStateFull::NewJersey => UsState::NJ,
            UsStateFull::NewMexico => UsState::NM,
            UsStateFull::NewYork => UsState::NY,
            UsStateFull::NorthCarolina => UsState::NC,
            UsStateFull::NorthDakota => UsState::ND,
            UsStateFull::Ohio => UsState::OH,
            UsStateFull::Oklahoma => UsState::OK,
            UsStateFull::Oregon => UsState::OR,
            UsStateFull::Pennsylvania => UsState::PA,
            UsStateFull::RhodeIsland => UsState::RI,
            UsStateFull::SouthCarolina => UsState::SC,
            UsStateFull::SouthDakota => UsState::SD,
            UsStateFull::Tennessee => UsState::TN,
            UsStateFull::Texas => UsState::TX,
            UsStateFull::Utah => UsState::UT,
            UsStateFull::Vermont => UsState::VT,
            UsStateFull::Virginia => UsState::VA,
            UsStateFull::Washington => UsState::WA,
            UsStateFull::WestVirginia => UsState::WV,
            UsStateFull::Wisconsin => UsState::WI,
            UsStateFull::Wyoming => UsState::WY,
            UsStateFull::WashingtonDC => UsState::DC,
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
    fn test_us_state_full_from_raw_string(raw: &str) -> UsStateFull {
        UsStateFull::from_raw_string(raw).unwrap()
    }
}
