use chrono::{DateTime, Utc};
use newtypes::{Declaration, PiiJsonValue, PiiString};
use paperclip::actix::Apiv2Schema;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct CreateAccountRequest {
    // Will default to us_equity. Alpaca has the ability to update the default value upon request.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enabled_assets: Option<Vec<AssetClass>>,
    pub contact: Contact,
    pub identity: Identity,
    pub disclosures: Disclosures,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub agreements: Option<Vec<Agreement>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub documents: Option<Vec<Document>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub trusted_contact: Option<TrustedContact>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Contact {
    pub email_address: PiiString, //"cool_alpaca@example.com",
    /// Phone number should include the country code, format: “+15555555555”
    pub phone_number: PiiString, //"555-666-7788",
    /// Maximum of 3 objects in array
    pub street_address: Vec<PiiString>, //["20 N San Mateo Dr"],
    /// The specific apartment number if applicable
    pub unit: Option<PiiString>, //"Apt 1A",
    pub city: PiiString,          //"San Mateo",
    /// required if country_of_tax_residence in identity model (below) is ‘USA’
    pub state: Option<PiiString>, //"CA",
    pub postal_code: PiiString,   // "94401",
    pub country: PiiString,       // "USA"
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct Identity {
    pub given_name: PiiString,          //"John",
    pub middle_name: Option<PiiString>, //"Smith",
    pub family_name: PiiString,         //"Doe",
    /// Format: YYYY-MM-DD
    pub date_of_birth: PiiString, //"1990-01-01",
    /// Required if tax_id_type is set.
    pub tax_id: Option<PiiString>, //"666-55-4321",
    /// Required if tax_id is set.
    pub tax_id_type: Option<TaxIdType>, //"USA_SSN",
    /// 3 letter country code acceptable
    pub country_of_citizenship: Option<PiiString>, //"USA",
    /// 3 letter country code acceptable
    pub country_of_birth: Option<PiiString>, //"USA",
    /// 3 letter country code acceptable
    pub country_of_tax_residence: PiiString, //"USA",
    /// Only used to collect visa types for users residing in the USA.
    pub visa_type: Option<VisaType>,
    /// Required if visa_type is set.
    pub visa_expiration_date: Option<PiiString>,
    /// Required if visa_type = B1 or B2
    pub date_of_departure_from_usa: Option<PiiString>,
    /// Only used to collect permanent residence status in the USA.
    pub permanent_resident: Option<bool>,
    pub funding_source: Vec<FundingSource>,      //["employment_income"]
    pub annual_income_min: Option<PiiString>,    //	string/number
    pub annual_income_max: Option<PiiString>,    //	string/number
    pub liquid_net_worth_min: Option<PiiString>, //	string/number
    pub liquid_net_worth_max: Option<PiiString>, //	string/number
    pub total_net_worth_min: Option<PiiString>,  //	string/number
    pub total_net_worth_max: Option<PiiString>,  //	string/number
    /// Any additional information used for KYC purposes
    pub extra: Option<PiiJsonValue>, //	object
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// It is your responsibility as the service provider to denote if the account owner falls under each category defined by FINRA rules. We recommend asking these questions at any point of the onboarding process of each account owner in the form of Y/N and Radio Buttons.
pub struct Disclosures {
    /// Whether user holds a controlling position in a publicly traded company, member of the board of directors or has policy making abilities in a publicly traded company.
    pub is_control_person: bool, // false,
    pub is_affiliated_exchange_or_finra: bool, // true,
    pub is_politically_exposed: bool,          // false,
    /// If your user’s immediate family member (sibling, husband/wife, child, parent) is either politically exposed or holds a control position.
    pub immediate_family_exposed: bool, // false,
    /// Information relevant to the user’s disclosure selection should be sent through this object.
    pub context: Option<Vec<DisclosureContext>>,
    pub employment_status: Option<EmploymentStatus>,
    pub employer_name: Option<PiiString>,
    pub employer_address: Option<PiiString>,
    pub employment_position: Option<PiiString>,
}

impl Disclosures {
    pub fn from_declarations(declarations: &[Declaration]) -> Disclosures {
        Disclosures {
            is_control_person: declarations.contains(&Declaration::SeniorExecutive),
            is_affiliated_exchange_or_finra: declarations.contains(&Declaration::AffiliatedWithUsBroker),
            is_politically_exposed: declarations.contains(&Declaration::SeniorPoliticalFigure),
            immediate_family_exposed: declarations.contains(&Declaration::FamilyOfPoliticalFigure),
            context: None,
            employment_status: None,
            employer_name: None,
            employer_address: None,
            employment_position: None,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// If you utilize Alpaca for KYCaaS, additional information will need to be submitted if the user identifies with any of the disclosures before the account can be approved. This information can be sent through the context object to speed up the time to approve their account.
pub struct DisclosureContext {
    pub context_type: ContextType, // "AFFILIATE_FIRM",
    /// Required if context_type = AFFILIATE_FIRM or CONTROLLED_FIRM
    pub company_name: PiiString, // "Finra",
    /// Required if context_type = AFFILIATE_FIRM or CONTROLLED_FIRM
    pub company_street_address: Vec<PiiString>, // ["1735 K Street, NW"],
    /// Required if context_type = AFFILIATE_FIRM or CONTROLLED_FIRM
    pub company_city: PiiString, // "Washington",
    /// Required if company_country = USA
    pub company_state: PiiString, // "DC",
    /// Required if context_type = AFFILIATE_FIRM or CONTROLLED_FIRM
    pub company_country: PiiString, // "USA",
    /// Required if context_type = AFFILIATE_FIRM or CONTROLLED_FIRM
    pub company_compliance_email: PiiString, // "compliance@finra.org"
    /// Required if context_type = IMMEDIATE_FAMILY_EXPOSED
    pub given_name: PiiString,
    /// Required if context_type = IMMEDIATE_FAMILY_EXPOSED
    pub family_name: PiiString,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// In order to comply with Alpaca’s terms of service, each account owner must be presented the following agreements.
pub struct Agreement {
    pub agreement: Agreements,
    /// string (timestamp)
    pub signed_at: DateTime<Utc>, //"2020-09-11T18:13:44Z",
    pub ip_address: PiiString,    //"185.13.21.99"
    pub revision: Option<String>, //"19.2022.02"
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
/// This model consists of a series of documents based on the KYC requirements. Documents are binary objects whose contents are encoded in base64. Each encoded content size is limited to 10MB if you use Alpaca for KYCaaS. If you perform your own KYC there are no document size limitations.
pub struct Document {
    pub document_type: DocumentType,
    pub document_sub_type: Option<String>, // "passport",
    /// base64 string
    pub content: PiiString,
    pub mime_type: String, // "image/jpeg"
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Apiv2Schema)]
/// This model input is optional. However, the client should make reasonable effort to obtain the trusted contact information. See more details in FINRA Notice 17-11
pub struct TrustedContact {
    pub given_name: PiiString,  //"Jane",
    pub family_name: PiiString, // "Doe",
    /// In addition, only one of the following is required:
    pub email_address: Option<PiiString>, // "jane.doe@example.com"
    pub phone_number: Option<PiiString>,
    pub street_address: Option<PiiString>,
    pub city: Option<PiiString>,        //If street_address is chosen
    pub state: Option<PiiString>,       //If street_address is chosen
    pub postal_code: Option<PiiString>, //If street_address is chosen
    pub country: Option<PiiString>,     //If street_address is chosen
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum AssetClass {
    UsEquity,
    Crypto,
}

#[allow(non_camel_case_types)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy)]
pub enum TaxIdType {
    USA_SSN,       //USA Social Security Number
    ARG_AR_CUIT,   //	Argentina CUIT
    AUS_TFN,       //	Australian Tax File Number
    AUS_ABN,       //	Australian Business Number
    BOL_NIT,       //	Bolivia NIT
    BRA_CPF,       //	Brazil CPF
    CHL_RUT,       //	Chile RUT
    COL_NIT,       //	Colombia NIT
    CRI_NITE,      //	Costa Rica NITE
    DEU_TAX_ID,    //	Germany Tax ID (Identifikationsnummer)
    DOM_RNC,       //	Dominican Republic RNC
    ECU_RUC,       //	Ecuador RUC
    FRA_SPI,       //	France SPI (Reference Tax Number)
    GBR_UTR,       //	UK UTR (Unique Taxpayer Reference)
    GBR_NINO,      //	UK NINO (National Insurance Number)
    GTM_NIT,       //	Guatemala NIT
    HND_RTN,       //	Honduras RTN
    HUN_TIN,       //	Hungary TIN Number
    IDN_KTP,       //	Indonesia KTP
    IND_PAN,       //	India PAN Number
    ISR_TAX_ID,    //	Israel Tax ID (Teudat Zehut)
    ITA_TAX_ID,    //	Italy Tax ID (Codice Fiscale)
    JPN_TAX_ID,    //	Japan Tax ID (Koijin Bango)
    MEX_RFC,       //	Mexico RFC
    NIC_RUC,       //	Nicaragua RUC
    NLD_TIN,       //	Netherlands TIN Number
    PAK_NIC,       //	Pakistan National Identity Card Number
    PAN_RUC,       //	Panama RUC
    PER_RUC,       //	Peru RUC
    PRY_RUC,       //	Paraguay RUC
    SGP_NRIC,      //	Singapore NRIC
    SGP_FIN,       //	Singapore FIN
    SGP_ASGD,      //	Singapore ASGD
    SGP_ITR,       //	Singapore ITR
    SLV_NIT,       //	El Salvador NIT
    SWE_TAX_ID,    //	Sweden Tax ID (Personnummer)
    URY_RUT,       //	Uruguay RUT
    VEN_RIF,       //	Venezuela RIF
    NOT_SPECIFIED, //	Other Tax IDs
}

#[allow(non_camel_case_types)]
#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy)]
pub enum VisaType {
    B1,    //	USA Visa Category B-1
    B2,    //	USA Visa Category B-2
    DACA,  //	USA Visa Category DACA
    E1,    //	USA Visa Category E-1
    E2,    //	USA Visa Category E-2
    E3,    //	USA Visa Category E-3
    F1,    //	USA Visa Category F-1
    G4,    //	USA Visa Category G-4
    H1B,   //	USA Visa Category H-1B
    J1,    //	USA Visa Category J-1
    L1,    //	USA Visa Category L-1
    OTHER, //	Any other USA Visa Category
    O1,    //	USA Visa Category O-1
    TN1,   //	USA Visa Category TN-1
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy)]
#[serde(rename_all = "snake_case")]
pub enum FundingSource {
    EmploymentIncome, //	Employment income
    Investments,      //	Investments
    Inheritance,      //	Inheritance
    BusinessIncome,   //	Business income
    Savings,          //	Savings
    Family,           //	Family
}

#[allow(non_camel_case_types)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy, Apiv2Schema)]
pub enum ContextType {
    CONTROLLED_FIRM,          // Controlled firm. Recommened to use when is_control_person = true
    AFFILIATE_FIRM,           //	Affiliated firm. Recommened to use when is_affiliated_exchange_or_finra = true
    IMMEDIATE_FAMILY_EXPOSED, //	Immediate family exposed. Recommended to use when immediate_family_exposed = true
}

#[allow(non_camel_case_types)]
#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy, Apiv2Schema)]
pub enum EmploymentStatus {
    UNEMPLOYED, //	Unemployed
    EMPLOYED,   //	Employed
    STUDENT,    //	Student
    RETIRED,    //	Retired
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum Agreements {
    CustomerAgreement, //	Customer agreement
    CryptoAgreement,   //	Crypto agreement
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize, Copy, Apiv2Schema)]
#[serde(rename_all = "snake_case")]
pub enum DocumentType {
    IdentityVerification,    //	Identity verification
    AddressVerification,     //	Address verification
    DateOfBirthVerification, //	Date of birth verification
    TaxIdVerification,       //	Tax ID verification
    AccountApprovalLetter,   //	407 approval letter
    W8ben,                   //	W-8 BEN tax form
    W9,                      //	W9 tax form
}
