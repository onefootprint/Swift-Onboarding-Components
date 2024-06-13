use super::ConversionError;
use chrono::{
    Datelike,
    NaiveDate,
};
use newtypes::*;
use serde::{
    Deserialize,
    Serialize,
};
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
    /// Indicates whether the request considers only OFAC records where the DOB is within the number
    /// of years that are specified in DOBRadius (reduces false positives)
    #[serde(rename = "UseDOBFilter")]
    pub use_dob_filter: LBool,
    /// Integer value for the number of years to consider for OFAC matches when UseDOBFilter is
    /// enabled. The default value is 2.
    #[serde(rename = "DOBRadius")]
    pub dob_radius: i32,
    /// Indicates whether the request considers more than one SSN for an identity unacceptable and
    /// reduces the CVI to a 10
    #[serde(rename = "IncludeMSOverride")]
    pub include_ms_override: LBool,
    /// Indicates whether the request considers a PO Box address unacceptable under your CIP rules,
    /// and reduces the CVI to a 10
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
    /// Integer value for the number of days since the input identity was last seen active at the
    /// input address to consider the address verified The default value is transaction date plus
    /// 365 days.
    pub last_seen_threshold: i32,
    /// Indicates whether the request considers multiple identities for an input SSN unacceptable
    /// and reduces the CVI to a 10
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
    /// Indicates whether the request requires an exact match on first name, but considers a valid
    /// nickname to be an exact match
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
    /// Integer value for the number of years to consider, if you select RadiusCCYY. Possible
    /// values: 0–3. Values that are greater than three are capped at three.
    pub match_year_radius: i32,
}

#[allow(clippy::upper_case_acronyms)]
#[derive(Debug, Clone, Deserialize, Serialize)]
pub enum DobMatchType {
    FuzzyCCYYMMDD, /* default, uses "mis key" fuzzy logic and considers Day as well (unlike the below
                    * option) */
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
    /// Indicates whether verification of the input driver license is considered in the CVI
    /// calculation
    pub include_driver_license: LBool,
    /// Indicates whether to disable the use of customer network information in the verification and
    /// the calculation of the CVI
    pub disable_customer_network_option: LBool,
    /// Indicates whether to disable the invalid SSN score override to allow the input ITIN to
    /// return the calculated CVI score
    #[serde(rename = "IncludeITIN")]
    pub include_itin: LBool,
    /// Indicates whether to include a verified element compliance cap on the CVI calculation when
    /// IncludeDOB or IncludeDriverLicense is set to 1
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
    pub end_user: EndUser,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct EndUser {
    /// Entity on whose behalf the report is generated
    pub company_name: PiiString,
    /// Unparsed street address (for example, 123 N. Main St)
    #[serde(rename = "StreetAddress1")]
    pub street_address_1: PiiString,
    /// City
    pub city: PiiString,
    /// Two-letter state abbreviation (for example, MT or FL)
    pub state: PiiString,
    /// Five-digit ZIP Code
    #[serde(rename = "Zip5")]
    pub zip5: PiiString,
    ///Ten-digit phone number
    pub phone: PiiString,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct DriverInfo {
    #[serde(rename = "DriverLicenseNumber")]
    pub license_number: PiiString,
    #[serde(rename = "DriverLicenseState")]
    pub license_state: PiiString,
}
#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub(crate) struct SearchBy {
    pub name: Name,
    pub address: Address,
    #[serde(rename = "DOB")]
    pub dob: Option<Dob>,
    /// Submit SSN or submit SSNLast4. The input SSN should not contain dashes.
    #[serde(rename = "SSN")]
    pub ssn: Option<PiiString>,
    #[serde(rename = "SSNLast4")]
    pub ssn_last_4: Option<PiiString>,
    #[serde(rename = "IPAddress")]
    pub ip_address: Option<PiiString>,
    /// Ten-digit home phone number (for example, 925551234)
    pub home_phone: Option<PiiString>,
    pub email: Option<PiiString>,
    #[serde(flatten)]
    #[serde(skip_serializing_if = "Option::is_none")]
    pub drivers_license_info: Option<DriverInfo>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Name {
    pub first: Option<PiiString>,
    pub middle: Option<PiiString>,
    pub last: Option<PiiString>,
    /// Generational suffix (for example, Jr or Sr)
    pub suffix: Option<PiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Address {
    pub street_address_1: Option<PiiString>,
    pub street_address_2: Option<PiiString>,
    pub city: Option<PiiString>,
    pub state: Option<PiiString>,
    pub zip_5: Option<PiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "PascalCase")]
pub(crate) struct Dob {
    /// Year (yyyy)
    pub year: PiiString,
    /// Month (MM)
    pub month: PiiString,
    /// Day (dd)
    pub day: PiiString,
}

#[derive(Serialize_repr, Deserialize_repr, Clone, PartialEq, Eq, Debug, Copy)]
#[repr(u8)]
pub enum LBool {
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
    /// HM Treasury Sanctions (formerly known as Her Majesty's Treasury's Consolidated List of
    /// Financial Sanctions Targets)
    BES,
    /// HM Treasury List
    UK,
    /// Bureau of Industry and Security (formerly known as US Bureau of Industry and Security -
    /// Denied Entity List, US Bureau of Industry and Security - Denied Persons List, and US Bureau
    /// of Industry and Security - Unverified Entity List)
    BIS,
    /// Commodity Futures Trading Commission Sanctions (formerly known as Commodity and Futures
    /// Trading Commission List of Regulatory and Self-Regulatory and Authorities)
    CFTC,
    /// DTC Debarred Parties
    DTC,
    /// EU Consolidated List (formerly known as European Union Designated Terrorist Groups +
    /// Individuals)
    EUDT,
    /// Foreign Agents Registration
    FAR,
    /// FATF Financial Action Task Force*^ (formerly known as FATF Financial Action Task Force,
    /// Deficient Jurisdictions - Countries)
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
    /// Unauthorized Banks (formerly known as Office of the Comptroller of the Currency Alerts -
    /// Unauthorized Banks)
    OCC,
    /// OFAC Non-SDN Entities (formerly OFAC - Palestinian Legislative Council), OFAC Sanctions,
    /// OFAC SDN
    OFAC,
    /// Offshore Financial Centers*^
    OFFC,
    /// OSFI Consolidated List (formerly known as OSFI - Canada Individuals), OSFI Country (formerly
    /// known as OSFI - Canada Entities)
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
    pub fn new(
        idv_data: IdvData,
        tenant_identifier: String,
        tbi: TenantBusinessInfo,
    ) -> Result<Self, ConversionError> {
        let state_and_country = idv_data.state_and_country_for_vendors();
        let IdvData {
            first_name,
            middle_name,
            last_name,
            address_line1,
            address_line2,
            city,
            state: _,
            zip,
            country: _,
            ssn4,
            ssn9,
            dob,
            email,
            phone_number,
            verification_request_id,
            drivers_license_number,
        } = idv_data;

        let dob = if let Some(dob) = dob {
            let parsed_dob = NaiveDate::parse_from_str(dob.leak(), "%Y-%m-%d")
                .map_err(|_| ConversionError::CantParseDob)?;

            Some(Dob {
                year: parsed_dob.year().to_string().into(),
                month: parsed_dob.month().to_string().into(),
                day: parsed_dob.day().to_string().into(),
            })
        } else {
            None
        };

        // Only send phone if we have a valid 10 digit phone number and send it as such (without the country
        // code) TODO: should we just not send phone at all if its a non-US phone? Need to answer
        // this empiracally from performance we see with lexis on intl nums
        let phone_number = phone_number
            .and_then(|pn| PhoneNumber::parse(pn).ok())
            .map(|pn| pn.subscriber_number())
            .filter(|pn| pn.len() == 10);

        let (ssn, ssn_last_4) = match (ssn9, ssn4) {
            (Some(ssn9), _) => (Some(ssn9), None),
            (None, Some(ssn4)) => (None, Some(ssn4)),
            (None, None) => (None, None),
        };

        // Lexis requires sending DL issuing state as well when sending DL, for now we send user's state
        // since including DL only helps CVI
        // TODO: update this when we collect license issuing state (or update this for doc first OBC)
        let state2 = state_and_country.state.clone();
        let (include_dl_in_cvi, drivers_license_info) =
            if let Some((dl_number, state)) = drivers_license_number.and_then(|dl| state2.map(|s| (dl, s))) {
                let info = DriverInfo {
                    license_number: dl_number,
                    license_state: state,
                };
                (LBool::One, Some(info))
            } else {
                (LBool::Zero, None)
            };


        Ok(Self {
            flex_id_request: FlexIdRequest {
                user: User {
                    reference_code: tenant_identifier,
                    // TODO: check with Lexis if we should use 5 or mb 6 here for cases that are not stricly
                    // Bifrost
                    glb_purpose: String::from("1"), /* Transactions Authorized by Consumer—As necessary to
                                                     * effect, administer, or enforce a transaction
                                                     * requested or authorized by the consumer */
                    dl_purpose: String::from("3"), /* Use in the Normal Course of Business—For use in the
                                                    * normal course of business but only to verify the
                                                    * accuracy of personal information submitted by the
                                                    * individual to the business; and if the submitted
                                                    * information is incorrect, to obtain the correct
                                                    * information, but only for the purposes of preventing
                                                    * fraud by, pursuing legal remedies against, or
                                                    * recovering on a debt or security interest against,
                                                    * the individual. */
                    query_id: verification_request_id
                        .map(|v| v.to_string())
                        .unwrap_or(Uuid::new_v4().to_string()),
                    end_user: EndUser {
                        company_name: tbi.company_name,
                        street_address_1: tbi.address_line1,
                        city: tbi.city,
                        state: tbi.state,
                        zip5: tbi.zip,
                        phone: tbi.phone,
                    },
                },
                options: Options {
                    watchlists: vec![Watchlist {
                        watchlist: WatchlistKind::ALLV4, /* always ask for all available watchlists to be
                                                          * checked */
                    }],
                    use_dob_filter: LBool::One, /* by default optimize for precision a bit more since this
                                                 * is just best case "non-enhanced" aml checks */
                    dob_radius: 2,
                    include_ms_override: LBool::Zero, /* for now, don't let multiple SSN's impact the CVI
                                                       * score. We'll just parse that reason code
                                                       * separately and not let it impact the score */
                    po_box_compliance: LBool::Zero, /* for now, don't let this impact CVI score and we'll
                                                     * just parse that reason code separately */
                    require_exact_match: RequireExactMatch {
                        last_name: LBool::Zero,
                        first_name: LBool::Zero,
                        first_name_allow_nickname: LBool::Zero,
                        address: LBool::Zero,
                        home_phone: LBool::Zero,
                        ssn: LBool::Zero,
                        driver_license: LBool::Zero, // noop for us
                    },
                    include_all_risk_indicators: LBool::One,
                    include_verified_element_summary: LBool::Zero, // Don't have privelages for this :(
                    // IncludeDLVerification option can be turned on if you would like LexisNExis to attempt
                    // to verify the DL# submitted in the request Verified DL#  means that
                    // we were actually able to verify the the DL3 and State does belong to the individuals
                    // PII that was submitted it the FlexID transaction This is an extra
                    // charge, which we currently (2024-06-13) do not have    -It gets
                    // included in VerifiedElementSummary if this option is turned on
                    //
                    // NOTE: This will error if we try to set it to 1 and we aren't paying for it
                    include_dl_verification: LBool::Zero,
                    dob_match: DobMatch {
                        match_type: DobMatchType::FuzzyCCYYMMDD,
                        match_year_radius: 0, // should be noop since we arent using RadiusCCYY
                    },
                    include_models: IncludeModels {
                        fraud_point_model: FraudPointModel {
                            model_name: None,
                            include_risk_indices: LBool::One,
                        },
                        model_requests: vec![],
                    },
                    last_seen_threshold: 365, // Lexis's default but we can tweak later if we want
                    include_mi_override: LBool::Zero, /* probably? don't let this influence score for now
                                               * and give us more flexbility to just use as a risk
                                               * signal */
                    include_ssn_verification: LBool::Zero, // Don't have privelages for this :(
                    cvi_calculation_options: Some(CviCalculationOptions {
                        include_dob: LBool::One,
                        //  (this is the option that Lexis communicated we should use)
                        // IncludeDriverLicense in CVI calculation is an option that can
                        // be turned “on” which will take the Verified DL and add that to the CVI Calculation.
                        // A Verified DL # can an additional 10 points to the CVI score.  It can move a 10 to
                        // a 20, move a 20 to a 30, and move a 30 to a 40.  The Include Verified DL # will not
                        // move a 40 to a 50.
                        //
                        // Note: If the IncludeDLVerification in the CVI calculation is turned “on” and
                        // LexisNexis is “not able to verify” the DL#, it will “not” have a negative effect on
                        // the CVI calculation.
                        //
                        // Unfortunate note: This helps with searching/verifying, but we can't derive whether
                        // or not the DL was verified (since we don't know what the score would have been had
                        // we not sent the DL)
                        include_driver_license: include_dl_in_cvi,
                        disable_customer_network_option: LBool::Zero, /* TODO: might need to fiddle with this and see how it impacts scores */
                        include_itin: LBool::One,
                        include_compliance_cap: LBool::Zero,
                    }),
                    instant_id_version: None,
                    name_input_order: NameInputOrder::Unknown, // Lexis's default and seems fair
                    include_email_verification: LBool::One,
                    disable_non_government_dl_data: LBool::Zero,
                },
                search_by: SearchBy {
                    name: Name {
                        first: first_name,
                        middle: middle_name,
                        last: last_name,
                        suffix: None, // maybe we'll collect/parse this later
                    },
                    address: Address {
                        street_address_1: address_line1,
                        street_address_2: address_line2,
                        city,
                        state: state_and_country.state,
                        zip_5: zip,
                    },
                    ssn,
                    ssn_last_4,
                    home_phone: phone_number,
                    dob,
                    ip_address: None, // maybe add this later
                    email,
                    drivers_license_info,
                },
            },
        })
    }
}


#[cfg(test)]
mod tests {
    use super::*;

    fn tbi() -> TenantBusinessInfo {
        TenantBusinessInfo {
            company_name: "Inc".into(),
            address_line1: "1 main".into(),
            city: "Philly".into(),
            state: "NY".into(),
            zip: "12345".into(),
            phone: "12345".into(),
        }
    }
    #[test]
    fn test_lexis_request_new() {
        let idv_data_with_dl_full = IdvData {
            first_name: Some("Bob".into()),
            last_name: Some("Flexidierto".into()),
            drivers_license_number: Some("12345".into()),
            state: Some("GA".into()),
            verification_request_id: Some(VerificationRequestId::from("vres_1234".to_string())), /* need this for query id randomness */
            ..Default::default()
        };
        let request = LexisRequest::new(idv_data_with_dl_full, "ti_1".into(), tbi()).unwrap();
        assert_eq!(serde_json::to_value(request).unwrap(), example_with_dl());

        // don't have state, shouldn't populate dl stuff
        // `IncludeDriverLicense` is 0 here
        let idv_data_with_dl_partial = IdvData {
            first_name: Some("Bob".into()),
            last_name: Some("Flexidierto".into()),
            drivers_license_number: Some("12345".into()),
            verification_request_id: Some(VerificationRequestId::from("vres_1234".to_string())), /* need this for query id randomness */
            ..Default::default()
        };
        let request = LexisRequest::new(idv_data_with_dl_partial, "ti_1".into(), tbi()).unwrap();
        assert_eq!(serde_json::to_value(request).unwrap(), example_without_dl());
    }


    fn example_with_dl() -> serde_json::Value {
        serde_json::json!({
            "FlexIDRequest": {
                "Options": {
                    "CVICalculationOptions": {
                        "DisableCustomerNetworkOption": 0,
                        "IncludeComplianceCap": 0,
                        "IncludeDOB": 1,
                        "IncludeDriverLicense": 1,
                        "IncludeITIN": 1
                    },
                    "DisableNonGovernmentDLData": 0,
                    "DOBMatch": {
                        "MatchType": "FuzzyCCYYMMDD",
                        "MatchYearRadius": 0
                    },
                    "DOBRadius": 2,
                    "IncludeAllRiskIndicators": 1,
                    "IncludeDLVerification": 0,
                    "IncludeEmailVerification": 1,
                    "IncludeMIOverride": 0,
                    "IncludeModels": {
                        "FraudPointModel": {
                            "IncludeRiskIndices": 1,
                            "ModelName": null
                        },
                        "ModelRequests": []
                    },
                    "IncludeMSOverride": 0,
                    "IncludeSSNVerification": 0,
                    "IncludeVerifiedElementSummary": 0,
                    "InstantIDVersion": null,
                    "LastSeenThreshold": 365,
                    "NameInputOrder": "Unknown",
                    "PoBoxCompliance": 0,
                    "RequireExactMatch": {
                        "Address": 0,
                        "DriverLicense": 0,
                        "FirstName": 0,
                        "FirstNameAllowNickname": 0,
                        "HomePhone": 0,
                        "LastName": 0,
                        "SSN": 0
                    },
                    "UseDOBFilter": 1,
                    "Watchlists": [
                        {
                            "Watchlist": "ALLV4"
                        }
                    ]
                },
                "SearchBy": {
                    "Address": {
                        "City": null,
                        "State": "GA",
                        "StreetAddress1": null,
                        "StreetAddress2": null,
                        "Zip5": null
                    },
                    "DOB": null,
                    "DriverLicenseNumber": "12345",
                    "DriverLicenseState": "GA",
                    "Email": null,
                    "HomePhone": null,
                    "IPAddress": null,
                    "Name": {
                        "First": "Bob",
                        "Last": "Flexidierto",
                        "Middle": null,
                        "Suffix": null
                    },
                    "SSN": null,
                    "SSNLast4": null
                },
                "User": {
                    "DLPurpose": "3",
                    "EndUser": {
                        "City": "Philly",
                        "CompanyName": "Inc",
                        "Phone": "12345",
                        "State": "NY",
                        "StreetAddress1": "1 main",
                        "Zip5": "12345"
                    },
                    "GLBPurpose": "1",
                    "QueryId": "vres_1234",
                    "ReferenceCode": "ti_1"
                }
            }
        })
    }
    fn example_without_dl() -> serde_json::Value {
        serde_json::json!({
            "FlexIDRequest": {
                "Options": {
                    "CVICalculationOptions": {
                        "DisableCustomerNetworkOption": 0,
                        "IncludeComplianceCap": 0,
                        "IncludeDOB": 1,
                        "IncludeDriverLicense": 0,
                        "IncludeITIN": 1
                    },
                    "DisableNonGovernmentDLData": 0,
                    "DOBMatch": {
                        "MatchType": "FuzzyCCYYMMDD",
                        "MatchYearRadius": 0
                    },
                    "DOBRadius": 2,
                    "IncludeAllRiskIndicators": 1,
                    "IncludeDLVerification": 0,
                    "IncludeEmailVerification": 1,
                    "IncludeMIOverride": 0,
                    "IncludeModels": {
                        "FraudPointModel": {
                            "IncludeRiskIndices": 1,
                            "ModelName": null
                        },
                        "ModelRequests": []
                    },
                    "IncludeMSOverride": 0,
                    "IncludeSSNVerification": 0,
                    "IncludeVerifiedElementSummary": 0,
                    "InstantIDVersion": null,
                    "LastSeenThreshold": 365,
                    "NameInputOrder": "Unknown",
                    "PoBoxCompliance": 0,
                    "RequireExactMatch": {
                        "Address": 0,
                        "DriverLicense": 0,
                        "FirstName": 0,
                        "FirstNameAllowNickname": 0,
                        "HomePhone": 0,
                        "LastName": 0,
                        "SSN": 0
                    },
                    "UseDOBFilter": 1,
                    "Watchlists": [
                        {
                            "Watchlist": "ALLV4"
                        }
                    ]
                },
                "SearchBy": {
                    "Address": {
                        "City": null,
                        "State": null,
                        "StreetAddress1": null,
                        "StreetAddress2": null,
                        "Zip5": null
                    },
                    "DOB": null,
                    "Email": null,
                    "HomePhone": null,
                    "IPAddress": null,
                    "Name": {
                        "First": "Bob",
                        "Last": "Flexidierto",
                        "Middle": null,
                        "Suffix": null
                    },
                    "SSN": null,
                    "SSNLast4": null
                },
                "User": {
                    "DLPurpose": "3",
                    "EndUser": {
                        "City": "Philly",
                        "CompanyName": "Inc",
                        "Phone": "12345",
                        "State": "NY",
                        "StreetAddress1": "1 main",
                        "Zip5": "12345"
                    },
                    "GLBPurpose": "1",
                    "QueryId": "vres_1234",
                    "ReferenceCode": "ti_1"
                }
            }
        })
    }
}
