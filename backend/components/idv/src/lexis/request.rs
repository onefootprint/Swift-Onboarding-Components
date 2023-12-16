use newtypes::*;
use serde::{Deserialize, Serialize};
use serde_repr::*;
use std::fmt::Debug;

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct LexisRequest {
    #[serde(rename = "FlexIDRequest")]
    pub flex_id_request: FlexIdRequest,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct FlexIdRequest {
    pub user: User,
    pub options: Options,
    pub search_by: SearchBy,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct Options {
    pub watchlists: Vec<Watchlist>,
    /// Indicates whether the request considers only OFAC records where the DOB is within the number of years that are specified in DOBRadius (reduces false positives)
    #[serde(rename = "UseDOBFilter")]
    pub use_dob_filter: LBool,
    /// Integer value for the number of years to consider for OFAC matches when UseDOBFilter is enabled. The default value is 2.
    #[serde(rename = "DOBRadius")]
    pub dob_radius: i32,
    /// Indicates whether the request considers more than one SSN for an identity unacceptable and reduces the CVI to a 10
    #[serde(rename = "IncludeMSOverride")]
    pub include_ms_override: LBool,
    /// Indicates whether the request considers a PO Box address unacceptable under your CIP rules, and reduces the CVI to a 10
    #[serde(rename = "PoBoxCompliance")]
    pub po_box_compliance: LBool,
    pub require_exact_match: RequireExactMatch,
    /// Indicates whether the response includes all risk indicators
    #[serde(rename = "IncludeAllRiskIndicators")]
    pub include_all_risk_indicators: LBool,
    /// Indicates whether the response includes a verified element summary
    #[serde(rename = "IncludeVerifiedElementSummary")]
    pub include_verified_element_summary: LBool,
    /// Indicates whether the request verifies submitted driver license information
    #[serde(rename = "IncludeDLVerification")]
    pub include_dl_verification: LBool,
    #[serde(rename = "DOBMatch")]
    pub dob_match: DobMatch,
    pub include_models: IncludeModels,
    /// Integer value for the number of days since the input identity was last seen active at the input address to consider the address verified The default value is transaction date plus 365 days.
    pub last_seen_threshold: i32,
    /// Indicates whether the request considers multiple identities for an input SSN unacceptable and reduces the CVI to a 10
    #[serde(rename = "IncludeMIOverride")]
    pub include_mi_override: LBool,
    /// Indicates whether the response returns the verified SSN data
    #[serde(rename = "IncludeSSNVerification")]
    pub include_ssn_verification: LBool,
    #[serde(rename = "CVICalculationOptions")]
    pub cvi_calculation_options: Option<CviCalculationOptions>,
    /// Integer value for the version of LexisNexis® InstantID® to use Possible value: 1
    #[serde(rename = "InstantIDVersion")]
    pub instant_id_version: Option<i32>,
    /// Specifies the order of the full name field in the request
    pub name_input_order: NameInputOrder,
    /// Indicates whether to verify the input email address
    pub include_email_verification: LBool,
    /// Indicates whether to exclude non-government driver license source data
    #[serde(rename = "DisableNonGovernmentDLData")]
    pub disable_non_government_dl_data: LBool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct Watchlist {
    pub watchlist: WatchlistKind,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct RequireExactMatch {
    /// Indicates whether the request requires an exact match on last name
    pub last_name: LBool,
    /// Indicates whether the request requires an exact match on first name
    pub first_name: LBool,
    /// Indicates whether the request requires an exact match on first name, but considers a valid nickname to be an exact match
    pub first_name_allow_nickname: LBool,
    /// Indicates whether the request requires an exact match on address
    pub address: LBool,
    /// Indicates whether the request requires an exact match on a home phone number
    pub home_phone: LBool,
    /// Indicates whether the request requires an exact match on SSN
    #[serde(rename = "SSN")]
    pub ssn: LBool,
    /// Indicates whether the request requires an exact match on a driver license number
    pub driver_license: LBool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct DobMatch {
    pub match_type: DobMatchType,
    /// Integer value for the number of years to consider, if you select RadiusCCYY. Possible values: 0–3. Values that are greater than three are capped at three.
    pub match_year_radius: i32,
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum DobMatchType {
    FuzzyCCYYMMDD,
    FuzzyCCYYMM,
    RadiusCCYY,
    ExactCCYYMMDD,
    ExactCCYYMM,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct IncludeModels {
    pub fraud_point_model: FraudPointModel,
    pub model_requests: Vec<ModelRequest>, // TODO: ask Lexis if there's any reason we'd need to set this
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct ModelRequest {
    pub model_name: String,
    pub model_options: Vec<ModelOption>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct ModelOption {
    pub option_name: String,
    pub option_value: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct FraudPointModel {
    /// FraudPoint model that is requested
    pub model_name: Option<ModelName>, // TODO: ask Lexis if we should set this for any reason
    /// Indicates whether the response includes risk indices
    pub include_risk_indices: LBool,
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum ModelName {
    FP31505_0,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct CviCalculationOptions {
    /// Indicates whether verification of the input DOB is considered in the CVI calculation
    #[serde(rename = "IncludeDOB")]
    pub include_dob: LBool,
    /// Indicates whether verification of the input driver license is considered in the CVI calculation
    pub include_driver_license: LBool,
    /// Indicates whether to disable the use of customer network information in the verification and the calculation of the CVI
    pub disable_customer_network_option: LBool,
    /// Indicates whether to disable the invalid SSN score override to allow the input ITIN to return the calculated CVI score
    #[serde(rename = "IncludeITIN")]
    pub include_itin: LBool,
    /// Indicates whether to include a verified element compliance cap on the CVI calculation when IncludeDOB or IncludeDriverLicense is set to 1
    pub include_compliance_cap: LBool,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct User {
    pub reference_code: String,
    pub query_id: String,
    #[serde(rename = "GLBPurpose")]
    pub glb_purpose: String,
    #[serde(rename = "DLPurpose")]
    pub dl_purpose: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct SearchBy {
    pub name: Name,
    pub address: Address,
    #[serde(rename = "SSN")]
    pub ssn: Option<PiiString>,
    pub home_phone: Option<PiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Name {
    pub first: Option<PiiString>,
    pub middle: Option<PiiString>,
    pub last: Option<PiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Address {
    pub street_address_1: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip_5: Option<PiiString>,
}

#[derive(Serialize_repr, Deserialize_repr, Clone, PartialEq, Eq, Debug)]
#[repr(u8)]
pub(crate) enum LBool {
    Zero = 0,
    One = 1,
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum NameInputOrder {
    /// (default value)
    Unknown,
    /// (First, Middle, and Last)
    FML,
    /// (Last, First, and Middle)
    LFM,
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum WatchlistKind {
    /// All available watch lists (not including new lists)
    ALL,
    /// All available watch lists^
    ALLV4,
    /// Australia Dept of Foreign Affairs and Trade*^
    ADFA,
    /// HM Treasury Sanctions (formerly known as Her Majesty's Treasury's Consolidated List of Financial Sanctions Targets)
    BES,
    /// HM Treasury List
    UK,
    /// Bureau of Industry and Security (formerly known as US Bureau of Industry and Security - Denied Entity List, US Bureau of Industry and Security - Denied Persons List, and US Bureau of Industry and Security - Unverified Entity List)
    BIS,
    /// Commodity Futures Trading Commission Sanctions (formerly known as Commodity and Futures Trading Commission List of Regulatory and Self-Regulatory and Authorities)
    CFTC,
    /// DTC Debarred Parties
    DTC,
    /// EU Consolidated List (formerly known as European Union Designated Terrorist Groups + Individuals)
    EUDT,
    /// Foreign Agents Registration
    FAR,
    /// FATF Financial Action Task Force*^ (formerly known as FATF Financial Action Task Force, Deficient Jurisdictions - Countries)
    FATF,
    /// FBI Top Ten Most Wanted
    FBI,
    /// FBI Hijack Suspects*^
    FBIH,
    /// FBI Seeking Information*^
    FBIS,
    /// FBI Most Wanted Terrorists*^
    FBIT,
    /// FBI Most Wanted*^
    FBIW,
    /// Hong Kong Monetary Authority*^
    HKMA,
    /// Monetary Authority of Singapore*^
    MASI,
    /// Unauthorized Banks (formerly known as Office of the Comptroller of the Currency Alerts - Unauthorized Banks)
    OCC,
    /// OFAC Non-SDN Entities (formerly OFAC - Palestinian Legislative Council), OFAC Sanctions, OFAC SDN
    OFAC,
    /// Offshore Financial Centers*^
    OFFC,
    /// OSFI Consolidated List (formerly known as OSFI - Canada Individuals), OSFI Country (formerly known as OSFI - Canada Entities)
    OSFI,
    /// Chiefs of State and Foreign Cabinet Members
    PEP,
    /// Primary Money Laundering Concern*^
    PMLC,
    /// Primary Money Laundering Concern - Jurisdictions*^
    PMLJ,
    /// Terrorist Exclusion List (formerly known as State Department Terrorist Exclusions)
    SDT,
    /// UN Consolidated List (formerly known as United Nations Named Terrorists)
    UNNT,
    /// World Bank Ineligible Firms^
    WBIF,
}

impl LexisRequest {
    pub fn new(idv_data: IdvData) -> Result<Self, crate::lexis::Error> {
        let IdvData {
            first_name,
            middle_name,
            last_name,
            address_line1,
            address_line2: _,
            city,
            state,
            zip,
            country: _,
            ssn4: _,
            ssn9,
            dob: _,
            email: _,
            phone_number,
            verification_request_id: _,
        } = idv_data;

        Ok(Self {
            flex_id_request: FlexIdRequest {
                user: User {
                    reference_code: String::from("org_123"), // TODO: TenantID
                    glb_purpose: String::from("1"),          // TODO
                    dl_purpose: String::from("0"),
                    query_id: String::from("vreq_123"), // TODO: vreq_id
                },
                options: Options {
                    watchlists: vec![Watchlist {
                        watchlist: WatchlistKind::ALLV4, // always ask for all available watchlists to be checked
                    }],
                    use_dob_filter: LBool::One, // by default optimize for precision a bit more since this is just best case "non-enhanced" aml checks
                    dob_radius: 2,
                    include_ms_override: LBool::Zero, // for now, don't let multiple SSN's impact the CVI score. We'll just parse that reason code separately and not let it impact the score
                    po_box_compliance: LBool::Zero, // for now, don't let this impact CVI score and we'll just parse that reason code separately
                    require_exact_match: RequireExactMatch {
                        // for now, we require exact name/address matching because we can't disambiguate partial vs exact matches
                        last_name: LBool::One,
                        first_name: LBool::One,
                        first_name_allow_nickname: LBool::Zero,
                        address: LBool::One,
                        home_phone: LBool::Zero,
                        ssn: LBool::One,
                        driver_license: LBool::Zero, // noop for us
                    },
                    include_all_risk_indicators: LBool::One,
                    include_verified_element_summary: LBool::Zero, // Don't have privelages for this :(
                    include_dl_verification: LBool::Zero,          // noops for us
                    dob_match: DobMatch {
                        // for now, we require exact dob matching because we can't disambiguate partial vs exact matches
                        match_type: DobMatchType::ExactCCYYMMDD,
                        match_year_radius: 0, // should be noop since we chose Exact above
                    },
                    include_models: IncludeModels {
                        fraud_point_model: FraudPointModel {
                            model_name: None,
                            include_risk_indices: LBool::One,
                        },
                        model_requests: vec![],
                    },
                    last_seen_threshold: 365, // Lexis's default but we can tweak later if we want
                    include_mi_override: LBool::Zero, // probably? don't let this influence score for now and give us more flexbility to just use as a risk signal
                    include_ssn_verification: LBool::Zero, // Don't have privelages for this :(
                    cvi_calculation_options: None, // TODO: ask Lexis what the defaults are for these and why/if we would want to change them
                    instant_id_version: None,      // TODO: ask Lexis if any reason we'd set this
                    name_input_order: NameInputOrder::Unknown, // Lexis's default and seems fair
                    include_email_verification: LBool::One, // TODO: confirm with Lexis that this won't impact the CVI or anything else
                    disable_non_government_dl_data: LBool::Zero,
                },
                search_by: SearchBy {
                    name: Name {
                        first: first_name,
                        middle: middle_name,
                        last: last_name,
                    },
                    address: Address {
                        street_address_1: address_line1,
                        city,
                        state,
                        zip_5: zip,
                    },
                    ssn: ssn9,
                    home_phone: phone_number,
                },
            },
        })
    }
}
