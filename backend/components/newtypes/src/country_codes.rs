use diesel::{sql_types::Text, AsExpression, FromSqlRow};
use paperclip::actix::Apiv2Schema;
use schemars::JsonSchema;
use serde_with::{DeserializeFromStr, SerializeDisplay};
use strum::{Display, IntoEnumIterator};
use strum_macros::{AsRefStr, EnumIter, EnumString};

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
    JsonSchema,
    EnumIter,
    FromSqlRow,
    AsExpression,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "UPPERCASE")]
#[strum(serialize_all = "UPPERCASE")]
#[diesel(sql_type = Text)]
pub enum Iso3166ThreeDigitCountryCode {
    TWN,
    AFG,
    ALB,
    DZA,
    ASM,
    AND,
    AGO,
    AIA,
    ATA,
    ATG,
    ARG,
    ARM,
    ABW,
    AUS,
    AUT,
    AZE,
    BHS,
    BHR,
    BGD,
    BRB,
    BLR,
    BEL,
    BLZ,
    BEN,
    BMU,
    BTN,
    BOL,
    BES,
    BIH,
    BWA,
    BVT,
    BRA,
    IOT,
    VGB,
    BRN,
    BGR,
    BFA,
    BDI,
    CPV,
    KHM,
    CMR,
    CAN,
    CYM,
    CAF,
    TCD,
    CHL,
    CHN,
    HKG,
    MAC,
    CXR,
    CCK,
    COL,
    COM,
    COG,
    COK,
    CRI,
    HRV,
    CUB,
    CUW,
    CYP,
    CZE,
    CIV,
    PRK,
    COD,
    DNK,
    DJI,
    DMA,
    DOM,
    ECU,
    EGY,
    SLV,
    GNQ,
    ERI,
    EST,
    SWZ,
    ETH,
    FLK,
    FRO,
    FJI,
    FIN,
    FRA,
    GUF,
    PYF,
    ATF,
    GAB,
    GMB,
    GEO,
    DEU,
    GHA,
    GIB,
    GRC,
    GRL,
    GRD,
    GLP,
    GUM,
    GTM,
    GGY,
    GIN,
    GNB,
    GUY,
    HTI,
    HMD,
    VAT,
    HND,
    HUN,
    ISL,
    IND,
    IDN,
    IRN,
    IRQ,
    IRL,
    IMN,
    ISR,
    ITA,
    JAM,
    JPN,
    JEY,
    JOR,
    KAZ,
    KEN,
    KIR,
    KWT,
    KGZ,
    LAO,
    LVA,
    LBN,
    LSO,
    LBR,
    LBY,
    LIE,
    LTU,
    LUX,
    MDG,
    MWI,
    MYS,
    MDV,
    MLI,
    MLT,
    MHL,
    MTQ,
    MRT,
    MUS,
    MYT,
    MEX,
    FSM,
    MCO,
    MNG,
    MNE,
    MSR,
    MAR,
    MOZ,
    MMR,
    NAM,
    NRU,
    NPL,
    NLD,
    NCL,
    NZL,
    NIC,
    NER,
    NGA,
    NIU,
    NFK,
    MNP,
    NOR,
    OMN,
    PAK,
    PLW,
    PAN,
    PNG,
    PRY,
    PER,
    PHL,
    PCN,
    POL,
    PRT,
    PRI,
    QAT,
    KOR,
    MDA,
    ROU,
    RUS,
    RWA,
    REU,
    BLM,
    SHN,
    KNA,
    LCA,
    MAF,
    SPM,
    VCT,
    WSM,
    SMR,
    STP,
    SAU,
    SEN,
    SRB,
    SYC,
    SLE,
    SGP,
    SXM,
    SVK,
    SVN,
    SLB,
    SOM,
    ZAF,
    SGS,
    SSD,
    ESP,
    LKA,
    PSE,
    SDN,
    SUR,
    SJM,
    SWE,
    CHE,
    SYR,
    TJK,
    THA,
    MKD,
    TLS,
    TGO,
    TKL,
    TON,
    TTO,
    TUN,
    TUR,
    TKM,
    TCA,
    TUV,
    UGA,
    UKR,
    ARE,
    GBR,
    TZA,
    UMI,
    VIR,
    USA,
    URY,
    UZB,
    VUT,
    VEN,
    VNM,
    WLF,
    ESH,
    YEM,
    ZMB,
    ZWE,
    ALA,
}

crate::util::impl_enum_str_diesel!(Iso3166TwoDigitCountryCode);

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
    JsonSchema,
    EnumIter,
    FromSqlRow,
    AsExpression,
    EnumString,
    AsRefStr,
)]
#[serde(rename_all = "UPPERCASE")]
#[strum(serialize_all = "UPPERCASE")]
#[diesel(sql_type = Text)]
/// list of valid iso3166-alpha-2 country codes, from https://datahub.io/core/country-codes#data
/// eventually we should maybe just pony up and pay for the subscription to iso: https://www.iso.org/publication/PUB500001.html
/// Channel islands does not have a country code
pub enum Iso3166TwoDigitCountryCode {
    TW,
    AF,
    AL,
    DZ,
    AS,
    AD,
    AO,
    AI,
    AQ,
    AG,
    AR,
    AM,
    AW,
    AU,
    AT,
    AZ,
    BS,
    BH,
    BD,
    BB,
    BY,
    BE,
    BZ,
    BJ,
    BM,
    BT,
    BO,
    BQ,
    BA,
    BW,
    BV,
    BR,
    IO,
    VG,
    BN,
    BG,
    BF,
    BI,
    CV,
    KH,
    CM,
    CA,
    KY,
    CF,
    TD,
    CL,
    CN,
    HK,
    MO,
    CX,
    CC,
    CO,
    KM,
    CG,
    CK,
    CR,
    HR,
    CU,
    CW,
    CY,
    CZ,
    CI,
    KP,
    CD,
    DK,
    DJ,
    DM,
    DO,
    EC,
    EG,
    SV,
    GQ,
    ER,
    EE,
    SZ,
    ET,
    FK,
    FO,
    FJ,
    FI,
    FR,
    GF,
    PF,
    TF,
    GA,
    GM,
    GE,
    DE,
    GH,
    GI,
    GR,
    GL,
    GD,
    GP,
    GU,
    GT,
    GG,
    GN,
    GW,
    GY,
    HT,
    HM,
    VA,
    HN,
    HU,
    IS,
    IN,
    ID,
    IR,
    IQ,
    IE,
    IM,
    IL,
    IT,
    JM,
    JP,
    JE,
    JO,
    KZ,
    KE,
    KI,
    KW,
    KG,
    LA,
    LV,
    LB,
    LS,
    LR,
    LY,
    LI,
    LT,
    LU,
    MG,
    MW,
    MY,
    MV,
    ML,
    MT,
    MH,
    MQ,
    MR,
    MU,
    YT,
    MX,
    FM,
    MC,
    MN,
    ME,
    MS,
    MA,
    MZ,
    MM,
    NA,
    NR,
    NP,
    NL,
    NC,
    NZ,
    NI,
    NE,
    NG,
    NU,
    NF,
    MP,
    NO,
    OM,
    PK,
    PW,
    PA,
    PG,
    PY,
    PE,
    PH,
    PN,
    PL,
    PT,
    PR,
    QA,
    KR,
    MD,
    RO,
    RU,
    RW,
    RE,
    BL,
    SH,
    KN,
    LC,
    MF,
    PM,
    VC,
    WS,
    SM,
    ST,
    SA,
    SN,
    RS,
    SC,
    SL,
    SG,
    SX,
    SK,
    SI,
    SB,
    SO,
    ZA,
    GS,
    SS,
    ES,
    LK,
    PS,
    SD,
    SR,
    SJ,
    SE,
    CH,
    SY,
    TJ,
    TH,
    MK,
    TL,
    TG,
    TK,
    TO,
    TT,
    TN,
    TR,
    TM,
    TC,
    TV,
    UG,
    UA,
    AE,
    GB,
    TZ,
    UM,
    VI,
    US,
    UY,
    UZ,
    VU,
    VE,
    VN,
    WF,
    EH,
    YE,
    ZM,
    ZW,
    AX,
}

impl Iso3166TwoDigitCountryCode {
    pub fn is_us_including_territories(&self) -> bool {
        self.is_us() || self.is_us_territory()
    }
    pub fn is_us_territory(&self) -> bool {
        matches!(
            self,
            // territories https://en.wikipedia.org/wiki/ISO_3166-2:US
            Self::AS | Self::GU | Self::MP | Self::PR | Self::UM | Self::VI
        )
    }

    pub fn is_us(&self) -> bool {
        matches!(self, Self::US)
    }

    pub fn all_codes_for_us_including_territories() -> Vec<Self> {
        Iso3166TwoDigitCountryCode::iter()
            .filter(|c| c.is_us_including_territories())
            .collect()
    }

    pub fn codes_for_us_territories() -> Vec<Self> {
        Iso3166TwoDigitCountryCode::iter()
            .filter(|c| c.is_us_territory())
            .collect()
    }

    pub fn all_international() -> Vec<Self> {
        Iso3166TwoDigitCountryCode::iter()
            .filter(|c| !c.is_us())
            .collect()
    }
}

crate::util::impl_enum_str_diesel!(Iso3166ThreeDigitCountryCode);

impl From<Iso3166ThreeDigitCountryCode> for Iso3166TwoDigitCountryCode {
    fn from(value: Iso3166ThreeDigitCountryCode) -> Self {
        match value {
            Iso3166ThreeDigitCountryCode::TWN => Self::TW,
            Iso3166ThreeDigitCountryCode::AFG => Self::AF,
            Iso3166ThreeDigitCountryCode::ALB => Self::AL,
            Iso3166ThreeDigitCountryCode::DZA => Self::DZ,
            Iso3166ThreeDigitCountryCode::ASM => Self::AS,
            Iso3166ThreeDigitCountryCode::AND => Self::AD,
            Iso3166ThreeDigitCountryCode::AGO => Self::AO,
            Iso3166ThreeDigitCountryCode::AIA => Self::AI,
            Iso3166ThreeDigitCountryCode::ATA => Self::AQ,
            Iso3166ThreeDigitCountryCode::ATG => Self::AG,
            Iso3166ThreeDigitCountryCode::ARG => Self::AR,
            Iso3166ThreeDigitCountryCode::ARM => Self::AM,
            Iso3166ThreeDigitCountryCode::ABW => Self::AW,
            Iso3166ThreeDigitCountryCode::AUS => Self::AU,
            Iso3166ThreeDigitCountryCode::AUT => Self::AT,
            Iso3166ThreeDigitCountryCode::AZE => Self::AZ,
            Iso3166ThreeDigitCountryCode::BHS => Self::BS,
            Iso3166ThreeDigitCountryCode::BHR => Self::BH,
            Iso3166ThreeDigitCountryCode::BGD => Self::BD,
            Iso3166ThreeDigitCountryCode::BRB => Self::BB,
            Iso3166ThreeDigitCountryCode::BLR => Self::BY,
            Iso3166ThreeDigitCountryCode::BEL => Self::BE,
            Iso3166ThreeDigitCountryCode::BLZ => Self::BZ,
            Iso3166ThreeDigitCountryCode::BEN => Self::BJ,
            Iso3166ThreeDigitCountryCode::BMU => Self::BM,
            Iso3166ThreeDigitCountryCode::BTN => Self::BT,
            Iso3166ThreeDigitCountryCode::BOL => Self::BO,
            Iso3166ThreeDigitCountryCode::BES => Self::BQ,
            Iso3166ThreeDigitCountryCode::BIH => Self::BA,
            Iso3166ThreeDigitCountryCode::BWA => Self::BW,
            Iso3166ThreeDigitCountryCode::BVT => Self::BV,
            Iso3166ThreeDigitCountryCode::BRA => Self::BR,
            Iso3166ThreeDigitCountryCode::IOT => Self::IO,
            Iso3166ThreeDigitCountryCode::VGB => Self::VG,
            Iso3166ThreeDigitCountryCode::BRN => Self::BN,
            Iso3166ThreeDigitCountryCode::BGR => Self::BG,
            Iso3166ThreeDigitCountryCode::BFA => Self::BF,
            Iso3166ThreeDigitCountryCode::BDI => Self::BI,
            Iso3166ThreeDigitCountryCode::CPV => Self::CV,
            Iso3166ThreeDigitCountryCode::KHM => Self::KH,
            Iso3166ThreeDigitCountryCode::CMR => Self::CM,
            Iso3166ThreeDigitCountryCode::CAN => Self::CA,
            Iso3166ThreeDigitCountryCode::CYM => Self::KY,
            Iso3166ThreeDigitCountryCode::CAF => Self::CF,
            Iso3166ThreeDigitCountryCode::TCD => Self::TD,
            Iso3166ThreeDigitCountryCode::CHL => Self::CL,
            Iso3166ThreeDigitCountryCode::CHN => Self::CN,
            Iso3166ThreeDigitCountryCode::HKG => Self::HK,
            Iso3166ThreeDigitCountryCode::MAC => Self::MO,
            Iso3166ThreeDigitCountryCode::CXR => Self::CX,
            Iso3166ThreeDigitCountryCode::CCK => Self::CC,
            Iso3166ThreeDigitCountryCode::COL => Self::CO,
            Iso3166ThreeDigitCountryCode::COM => Self::KM,
            Iso3166ThreeDigitCountryCode::COG => Self::CG,
            Iso3166ThreeDigitCountryCode::COK => Self::CK,
            Iso3166ThreeDigitCountryCode::CRI => Self::CR,
            Iso3166ThreeDigitCountryCode::HRV => Self::HR,
            Iso3166ThreeDigitCountryCode::CUB => Self::CU,
            Iso3166ThreeDigitCountryCode::CUW => Self::CW,
            Iso3166ThreeDigitCountryCode::CYP => Self::CY,
            Iso3166ThreeDigitCountryCode::CZE => Self::CZ,
            Iso3166ThreeDigitCountryCode::CIV => Self::CI,
            Iso3166ThreeDigitCountryCode::PRK => Self::KP,
            Iso3166ThreeDigitCountryCode::COD => Self::CD,
            Iso3166ThreeDigitCountryCode::DNK => Self::DK,
            Iso3166ThreeDigitCountryCode::DJI => Self::DJ,
            Iso3166ThreeDigitCountryCode::DMA => Self::DM,
            Iso3166ThreeDigitCountryCode::DOM => Self::DO,
            Iso3166ThreeDigitCountryCode::ECU => Self::EC,
            Iso3166ThreeDigitCountryCode::EGY => Self::EG,
            Iso3166ThreeDigitCountryCode::SLV => Self::SV,
            Iso3166ThreeDigitCountryCode::GNQ => Self::GQ,
            Iso3166ThreeDigitCountryCode::ERI => Self::ER,
            Iso3166ThreeDigitCountryCode::EST => Self::EE,
            Iso3166ThreeDigitCountryCode::SWZ => Self::SZ,
            Iso3166ThreeDigitCountryCode::ETH => Self::ET,
            Iso3166ThreeDigitCountryCode::FLK => Self::FK,
            Iso3166ThreeDigitCountryCode::FRO => Self::FO,
            Iso3166ThreeDigitCountryCode::FJI => Self::FJ,
            Iso3166ThreeDigitCountryCode::FIN => Self::FI,
            Iso3166ThreeDigitCountryCode::FRA => Self::FR,
            Iso3166ThreeDigitCountryCode::GUF => Self::GF,
            Iso3166ThreeDigitCountryCode::PYF => Self::PF,
            Iso3166ThreeDigitCountryCode::ATF => Self::TF,
            Iso3166ThreeDigitCountryCode::GAB => Self::GA,
            Iso3166ThreeDigitCountryCode::GMB => Self::GM,
            Iso3166ThreeDigitCountryCode::GEO => Self::GE,
            Iso3166ThreeDigitCountryCode::DEU => Self::DE,
            Iso3166ThreeDigitCountryCode::GHA => Self::GH,
            Iso3166ThreeDigitCountryCode::GIB => Self::GI,
            Iso3166ThreeDigitCountryCode::GRC => Self::GR,
            Iso3166ThreeDigitCountryCode::GRL => Self::GL,
            Iso3166ThreeDigitCountryCode::GRD => Self::GD,
            Iso3166ThreeDigitCountryCode::GLP => Self::GP,
            Iso3166ThreeDigitCountryCode::GUM => Self::GU,
            Iso3166ThreeDigitCountryCode::GTM => Self::GT,
            Iso3166ThreeDigitCountryCode::GGY => Self::GG,
            Iso3166ThreeDigitCountryCode::GIN => Self::GN,
            Iso3166ThreeDigitCountryCode::GNB => Self::GW,
            Iso3166ThreeDigitCountryCode::GUY => Self::GY,
            Iso3166ThreeDigitCountryCode::HTI => Self::HT,
            Iso3166ThreeDigitCountryCode::HMD => Self::HM,
            Iso3166ThreeDigitCountryCode::VAT => Self::VA,
            Iso3166ThreeDigitCountryCode::HND => Self::HN,
            Iso3166ThreeDigitCountryCode::HUN => Self::HU,
            Iso3166ThreeDigitCountryCode::ISL => Self::IS,
            Iso3166ThreeDigitCountryCode::IND => Self::IN,
            Iso3166ThreeDigitCountryCode::IDN => Self::ID,
            Iso3166ThreeDigitCountryCode::IRN => Self::IR,
            Iso3166ThreeDigitCountryCode::IRQ => Self::IQ,
            Iso3166ThreeDigitCountryCode::IRL => Self::IE,
            Iso3166ThreeDigitCountryCode::IMN => Self::IM,
            Iso3166ThreeDigitCountryCode::ISR => Self::IL,
            Iso3166ThreeDigitCountryCode::ITA => Self::IT,
            Iso3166ThreeDigitCountryCode::JAM => Self::JM,
            Iso3166ThreeDigitCountryCode::JPN => Self::JP,
            Iso3166ThreeDigitCountryCode::JEY => Self::JE,
            Iso3166ThreeDigitCountryCode::JOR => Self::JO,
            Iso3166ThreeDigitCountryCode::KAZ => Self::KZ,
            Iso3166ThreeDigitCountryCode::KEN => Self::KE,
            Iso3166ThreeDigitCountryCode::KIR => Self::KI,
            Iso3166ThreeDigitCountryCode::KWT => Self::KW,
            Iso3166ThreeDigitCountryCode::KGZ => Self::KG,
            Iso3166ThreeDigitCountryCode::LAO => Self::LA,
            Iso3166ThreeDigitCountryCode::LVA => Self::LV,
            Iso3166ThreeDigitCountryCode::LBN => Self::LB,
            Iso3166ThreeDigitCountryCode::LSO => Self::LS,
            Iso3166ThreeDigitCountryCode::LBR => Self::LR,
            Iso3166ThreeDigitCountryCode::LBY => Self::LY,
            Iso3166ThreeDigitCountryCode::LIE => Self::LI,
            Iso3166ThreeDigitCountryCode::LTU => Self::LT,
            Iso3166ThreeDigitCountryCode::LUX => Self::LU,
            Iso3166ThreeDigitCountryCode::MDG => Self::MG,
            Iso3166ThreeDigitCountryCode::MWI => Self::MW,
            Iso3166ThreeDigitCountryCode::MYS => Self::MY,
            Iso3166ThreeDigitCountryCode::MDV => Self::MV,
            Iso3166ThreeDigitCountryCode::MLI => Self::ML,
            Iso3166ThreeDigitCountryCode::MLT => Self::MT,
            Iso3166ThreeDigitCountryCode::MHL => Self::MH,
            Iso3166ThreeDigitCountryCode::MTQ => Self::MQ,
            Iso3166ThreeDigitCountryCode::MRT => Self::MR,
            Iso3166ThreeDigitCountryCode::MUS => Self::MU,
            Iso3166ThreeDigitCountryCode::MYT => Self::YT,
            Iso3166ThreeDigitCountryCode::MEX => Self::MX,
            Iso3166ThreeDigitCountryCode::FSM => Self::FM,
            Iso3166ThreeDigitCountryCode::MCO => Self::MC,
            Iso3166ThreeDigitCountryCode::MNG => Self::MN,
            Iso3166ThreeDigitCountryCode::MNE => Self::ME,
            Iso3166ThreeDigitCountryCode::MSR => Self::MS,
            Iso3166ThreeDigitCountryCode::MAR => Self::MA,
            Iso3166ThreeDigitCountryCode::MOZ => Self::MZ,
            Iso3166ThreeDigitCountryCode::MMR => Self::MM,
            Iso3166ThreeDigitCountryCode::NAM => Self::NA,
            Iso3166ThreeDigitCountryCode::NRU => Self::NR,
            Iso3166ThreeDigitCountryCode::NPL => Self::NP,
            Iso3166ThreeDigitCountryCode::NLD => Self::NL,
            Iso3166ThreeDigitCountryCode::NCL => Self::NC,
            Iso3166ThreeDigitCountryCode::NZL => Self::NZ,
            Iso3166ThreeDigitCountryCode::NIC => Self::NI,
            Iso3166ThreeDigitCountryCode::NER => Self::NE,
            Iso3166ThreeDigitCountryCode::NGA => Self::NG,
            Iso3166ThreeDigitCountryCode::NIU => Self::NU,
            Iso3166ThreeDigitCountryCode::NFK => Self::NF,
            Iso3166ThreeDigitCountryCode::MNP => Self::MP,
            Iso3166ThreeDigitCountryCode::NOR => Self::NO,
            Iso3166ThreeDigitCountryCode::OMN => Self::OM,
            Iso3166ThreeDigitCountryCode::PAK => Self::PK,
            Iso3166ThreeDigitCountryCode::PLW => Self::PW,
            Iso3166ThreeDigitCountryCode::PAN => Self::PA,
            Iso3166ThreeDigitCountryCode::PNG => Self::PG,
            Iso3166ThreeDigitCountryCode::PRY => Self::PY,
            Iso3166ThreeDigitCountryCode::PER => Self::PE,
            Iso3166ThreeDigitCountryCode::PHL => Self::PH,
            Iso3166ThreeDigitCountryCode::PCN => Self::PN,
            Iso3166ThreeDigitCountryCode::POL => Self::PL,
            Iso3166ThreeDigitCountryCode::PRT => Self::PT,
            Iso3166ThreeDigitCountryCode::PRI => Self::PR,
            Iso3166ThreeDigitCountryCode::QAT => Self::QA,
            Iso3166ThreeDigitCountryCode::KOR => Self::KR,
            Iso3166ThreeDigitCountryCode::MDA => Self::MD,
            Iso3166ThreeDigitCountryCode::ROU => Self::RO,
            Iso3166ThreeDigitCountryCode::RUS => Self::RU,
            Iso3166ThreeDigitCountryCode::RWA => Self::RW,
            Iso3166ThreeDigitCountryCode::REU => Self::RE,
            Iso3166ThreeDigitCountryCode::BLM => Self::BL,
            Iso3166ThreeDigitCountryCode::SHN => Self::SH,
            Iso3166ThreeDigitCountryCode::KNA => Self::KN,
            Iso3166ThreeDigitCountryCode::LCA => Self::LC,
            Iso3166ThreeDigitCountryCode::MAF => Self::MF,
            Iso3166ThreeDigitCountryCode::SPM => Self::PM,
            Iso3166ThreeDigitCountryCode::VCT => Self::VC,
            Iso3166ThreeDigitCountryCode::WSM => Self::WS,
            Iso3166ThreeDigitCountryCode::SMR => Self::SM,
            Iso3166ThreeDigitCountryCode::STP => Self::ST,
            Iso3166ThreeDigitCountryCode::SAU => Self::SA,
            Iso3166ThreeDigitCountryCode::SEN => Self::SN,
            Iso3166ThreeDigitCountryCode::SRB => Self::RS,
            Iso3166ThreeDigitCountryCode::SYC => Self::SC,
            Iso3166ThreeDigitCountryCode::SLE => Self::SL,
            Iso3166ThreeDigitCountryCode::SGP => Self::SG,
            Iso3166ThreeDigitCountryCode::SXM => Self::SX,
            Iso3166ThreeDigitCountryCode::SVK => Self::SK,
            Iso3166ThreeDigitCountryCode::SVN => Self::SI,
            Iso3166ThreeDigitCountryCode::SLB => Self::SB,
            Iso3166ThreeDigitCountryCode::SOM => Self::SO,
            Iso3166ThreeDigitCountryCode::ZAF => Self::ZA,
            Iso3166ThreeDigitCountryCode::SGS => Self::GS,
            Iso3166ThreeDigitCountryCode::SSD => Self::SS,
            Iso3166ThreeDigitCountryCode::ESP => Self::ES,
            Iso3166ThreeDigitCountryCode::LKA => Self::LK,
            Iso3166ThreeDigitCountryCode::PSE => Self::PS,
            Iso3166ThreeDigitCountryCode::SDN => Self::SD,
            Iso3166ThreeDigitCountryCode::SUR => Self::SR,
            Iso3166ThreeDigitCountryCode::SJM => Self::SJ,
            Iso3166ThreeDigitCountryCode::SWE => Self::SE,
            Iso3166ThreeDigitCountryCode::CHE => Self::CH,
            Iso3166ThreeDigitCountryCode::SYR => Self::SY,
            Iso3166ThreeDigitCountryCode::TJK => Self::TJ,
            Iso3166ThreeDigitCountryCode::THA => Self::TH,
            Iso3166ThreeDigitCountryCode::MKD => Self::MK,
            Iso3166ThreeDigitCountryCode::TLS => Self::TL,
            Iso3166ThreeDigitCountryCode::TGO => Self::TG,
            Iso3166ThreeDigitCountryCode::TKL => Self::TK,
            Iso3166ThreeDigitCountryCode::TON => Self::TO,
            Iso3166ThreeDigitCountryCode::TTO => Self::TT,
            Iso3166ThreeDigitCountryCode::TUN => Self::TN,
            Iso3166ThreeDigitCountryCode::TUR => Self::TR,
            Iso3166ThreeDigitCountryCode::TKM => Self::TM,
            Iso3166ThreeDigitCountryCode::TCA => Self::TC,
            Iso3166ThreeDigitCountryCode::TUV => Self::TV,
            Iso3166ThreeDigitCountryCode::UGA => Self::UG,
            Iso3166ThreeDigitCountryCode::UKR => Self::UA,
            Iso3166ThreeDigitCountryCode::ARE => Self::AE,
            Iso3166ThreeDigitCountryCode::GBR => Self::GB,
            Iso3166ThreeDigitCountryCode::TZA => Self::TZ,
            Iso3166ThreeDigitCountryCode::UMI => Self::UM,
            Iso3166ThreeDigitCountryCode::VIR => Self::VI,
            Iso3166ThreeDigitCountryCode::USA => Self::US,
            Iso3166ThreeDigitCountryCode::URY => Self::UY,
            Iso3166ThreeDigitCountryCode::UZB => Self::UZ,
            Iso3166ThreeDigitCountryCode::VUT => Self::VU,
            Iso3166ThreeDigitCountryCode::VEN => Self::VE,
            Iso3166ThreeDigitCountryCode::VNM => Self::VN,
            Iso3166ThreeDigitCountryCode::WLF => Self::WF,
            Iso3166ThreeDigitCountryCode::ESH => Self::EH,
            Iso3166ThreeDigitCountryCode::YEM => Self::YE,
            Iso3166ThreeDigitCountryCode::ZMB => Self::ZM,
            Iso3166ThreeDigitCountryCode::ZWE => Self::ZW,
            Iso3166ThreeDigitCountryCode::ALA => Self::AX,
        }
    }
}

#[cfg(test)]
mod tests {
    use strum::IntoEnumIterator;

    use crate::{Iso3166ThreeDigitCountryCode, Iso3166TwoDigitCountryCode};

    #[test]
    fn test_country_codes_correct() {
        // ToString
        let serialize_country_codes_to_string: Vec<String> = Iso3166TwoDigitCountryCode::iter()
            .map(|cc| cc.to_string())
            .collect();
        assert_eq!(serialize_country_codes_to_string.len(), 249);

        // Serde
        let serialize_country_codes_serde: Vec<String> = Iso3166TwoDigitCountryCode::iter()
            .map(|cc| {
                let ser: String = serde_json::to_string(&cc).unwrap();
                let deser: Iso3166TwoDigitCountryCode = serde_json::from_str(&ser).unwrap();
                serde_json::to_string(&deser).unwrap()
            })
            .collect();

        assert_eq!(serialize_country_codes_serde.len(), 249);

        let three_digit_cods: Vec<String> = Iso3166ThreeDigitCountryCode::iter()
            .map(|cc| {
                let ser: String = serde_json::to_string(&cc).unwrap();
                let deser: Iso3166ThreeDigitCountryCode = serde_json::from_str(&ser).unwrap();
                serde_json::to_string(&deser).unwrap()
            })
            .collect();

        assert_eq!(three_digit_cods.len(), 249);
    }
}
