use super::ResponseError;
use crate::lexis;
use newtypes::*;
use serde::Deserialize;
use serde::Serialize;
use std::fmt::Debug;

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct FlexIdResponse {
    #[serde(rename = "FlexIDResponseEx")]
    pub flex_id_response_ex: Option<FlexIdResponseEx>,
    pub fault: Option<Fault>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
// this ones not PascalCase lol
#[allow(non_snake_case)]
pub struct Fault {
    pub detail: Option<FaultDetail>,
    pub faultactor: Option<String>,
    pub faultstring: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct FaultDetail {
    pub exceptions: Option<Exceptions>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Exceptions {
    pub exception: Option<Vec<Exception>>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
// this ones not PascalCase lol
#[allow(non_snake_case)]
pub struct FlexIdResponseEx {
    pub response: Option<Response>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Response {
    pub header: Option<Header>,
    pub result: Option<LResult>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Header {
    /// Product interface version. For this field to return, you must input &return_version_ at the end of the URL, for example, https://wsonline.seisint.com/WsIdentity/?ver_=2.60&return_version_
    pub interface_version: Option<String>,
    /// Not used; returns 0
    pub status: Option<i32>,
    /// Error code
    pub message: Option<String>,
    /// Code for the transaction that was provided in the request
    pub query_id: Option<String>,
    /// Unique LexisNexis Risk Solutions transaction ID
    pub transaction_id: Option<String>,
    pub exceptions: Option<Exceptions>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Exception {
    /// System component that reports the error
    pub source: Option<String>,
    /// HTML error code (see "HTTP Errors" on page 376)
    pub code: Option<String>,
    /// Location of the error that occurred
    pub location: Option<String>,
    /// Description of the error that occurred
    pub message: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct LResult {
    pub input_echo: Option<InputEcho>,
    /// LexID number
    pub unique_id: Option<String>,
    /// Indicates whether the SSN is verified
    #[serde(rename = "VerifiedSSN")]
    pub verified_ssn: Option<ScrubbedPiiString>, /* TODO: not totally clear why this is a string, it
                                                  * appears to be last4 maybe...? */
    pub name_address_phone: Option<NameAddressPhone>,
    pub verified_element_summary: Option<VerifiedElementSummary>, // think we don't get this jawn with FlexId
    pub valid_element_summary: Option<ValidElementSummary>,
    /// Index that indicates the level of the match of the submitted NAS
    #[serde(rename = "NameAddressSSNSummary")]
    pub name_address_ssn_summary: Option<i32>,
    pub comprehensive_verification: Option<ComprehensiveVerification>,
    pub custom_comprehensive_verification: Option<ComprehensiveVerification>,
    pub models: Option<Models>,
    /// InstantID version that is used to generate the results
    #[serde(rename = "InstantIDVersion")]
    pub instant_id_version: Option<String>,
    /// Indicates whether the NAS verification record is a LexisNexis Risk Solutions emerging
    /// identity record and does not have an assigned LexID number. The default value is 0. See your
    /// LexisNexis Risk Solutions account representative for details about using the EmergingId
    /// element.
    pub emerging_id: Option<bool>,
    /// Type of secondary range mismatch between the input address and the address that was found in
    /// LexisNexis Risk Solutions records Possible values:
    /// • D (No secondary range was submitted as input, but a secondary range was found in
    /// LexisNexis Risk Solutions records) • I (A secondary range was submitted as input, but a
    /// secondary range was not found in LexisNexis Risk Solutions records) • M (A secondary
    /// range was submitted as input, but the secondary range does not match the secondary range
    /// that was found in LexisNexis Risk Solutions records) • N (No secondary range was
    /// submitted as input, and no secondary range was found in or found in LexisNexis Risk
    /// Solutions records) • V (Secondary range was verified, and the input secondary range
    /// matches records)
    pub address_secondary_range_mismatch: Option<String>,
    // Indicates whether the SSN is not verified because the bureau deleted the record
    pub bureau_deleted: Option<bool>,
    /// Indicates whether the input ITIN is potentially expired
    #[serde(rename = "ITINExpired")]
    pub itin_expired: Option<bool>,
    /// Indicates whether the phone number is current
    pub is_phone_current: Option<bool>,
    /// Indicates the phone line type
    /// Possible values:
    /// • 0 (Landline)
    /// • 1 (Wireless)
    /// • 2 (VoIP (Voice over Internet Protocol))
    /// • 3 (Unknown)
    pub phone_line_type: Option<String>,
    /// Description of the phone line
    /// • L (Landline)
    /// • W (Wireless)
    /// • V (VOIP)
    /// • U (Unknown)
    pub phone_line_description: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Models {
    pub model: Option<Vec<Model>>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Model {
    pub name: Option<String>,
    pub scores: Option<Scores>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Scores {
    pub score: Option<Vec<Score>>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Score {
    /// Score type
    #[serde(rename = "Type")]
    pub _type: Option<String>,
    /// Score value
    pub value: Option<i32>,
    pub high_risk_indicators: Option<HighRiskIndicators>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct HighRiskIndicators {
    pub high_risk_indicator: Option<Vec<HighRiskIndicator>>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct HighRiskIndicator {
    /// Risk code
    pub risk_code: Option<String>,
    /// Risk code description
    pub description: Option<String>,
    /// Risk code sequence
    pub sequence: Option<i32>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct RiskIndices {
    pub risk_index: Option<Vec<RiskIndex>>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct RiskIndex {
    /// Risk index name
    pub name: Option<String>,
    /// Risk index value
    pub value: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct ComprehensiveVerification {
    /// Index summarizing the verification matches that are found in the NAS summary and NAP summary
    pub comprehensive_verification_index: Option<i32>,
    pub risk_indicators: Option<RiskIndicators>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct RiskIndicators {
    pub risk_indicator: Option<Vec<RiskIndicator>>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct RiskIndicator {
    /// Risk code
    pub risk_code: Option<String>,
    /// Risk code description
    pub description: Option<String>,
    /// Risk code sequence
    pub sequence: Option<i32>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct ValidElementSummary {
    /// Indicates whether the SSN is valid
    #[serde(rename = "SSNValid")]
    pub ssn_valid: Option<bool>,
    /// Indicates whether the SSN is issued to a deceased individual
    #[serde(rename = "SSNDeceased")]
    pub ssn_deceased: Option<bool>,
    /// Indicates whether the driver license number is valid
    #[serde(rename = "DLValid")]
    pub dl_valid: Option<bool>,
    /// Indicates whether the passport is valid
    pub passport_valid: Option<bool>,
    /// Indicates whether the address is a PO Box
    #[serde(rename = "AddressPOBox")]
    pub address_po_box: Option<bool>,
    /// Indicates whether the address is a CMRA
    #[serde(rename = "AddressCMRA")]
    pub address_cmra: Option<bool>,
    /// Indicates whether an SSN is found in the input individual's LexID record
    #[serde(rename = "SSNFoundForLexID")]
    pub ssn_found_for_lex_id: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct VerifiedElementSummary {
    /// Indicates whether the first name is verified
    pub first_name: Option<bool>,
    /// Indicates whether the last name is verified
    pub last_name: Option<bool>,
    /// Indicates whether the middle name is verified
    pub middle_name: Option<bool>,
    /// Indicates whether the street address is verified
    pub street_address: Option<bool>,
    /// Indicates whether the city is verified
    pub city: Option<bool>,
    /// Indicates whether the state is verified
    pub state: Option<bool>,
    /// Indicates whether the ZIP Code is verified
    pub zip: Option<bool>,
    /// Indicates whether the home phone number is verified
    pub home_phone: Option<bool>,
    /// Indicates whether the DOB is verified
    #[serde(rename = "DOB")]
    pub dob: Option<bool>,
    ///Confidence level of the match of the input DOB and the DOB that was found for the subject
    /// Possible values:
    /// • 0 (No DOB found or no DOB submitted)
    /// • 1 (Nothing matches)
    /// • 2 (Only Day matches)
    /// • 3 (Only Month matches)
    /// • 4 (Only Day and Month match)
    /// • 5 (Only Day and Year match)
    /// • 6 (Only Year matches)
    /// • 7 (Only Month and Year match)
    /// • 8 (Month, Day, and Year match)
    #[serde(rename = "DOBMatchLevel")]
    pub dob_match_level: Option<String>,
    /// Indicates whether the SSN is verified
    #[serde(rename = "SSN")]
    pub ssn: Option<bool>,
    /// Indicates whether the driver license number is verified
    #[serde(rename = "DL")]
    pub dl: Option<bool>,
    // Indicates whether the email address is verified
    pub email: Option<bool>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct NameAddressPhone {
    /// Index that indicates the level of the match of the submitted NAP
    pub summary: Option<String>,
    /// Type of data that was used to perform the NAP verification
    /// Possible values:
    /// • A (Phone listing)
    /// • P (Phone records)
    /// • U (Utility records)
    /// • S (Customer network)
    //  • I (Internal proprietary)
    #[serde(rename = "Type")]
    pub _type: Option<String>,
    /// Phone number status
    /// Possible values:
    /// • C (Connected)
    /// • D (Disconnected)
    pub status: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct InputEcho {
    pub name: Option<Name>,
    pub address: Option<Address>,
    pub dob: Option<Dob>,
    pub age: Option<ScrubbedPiiInt>,
    #[serde(rename = "SSN")]
    pub ssn: Option<ScrubbedPiiString>,
    /// Last four digits of the SSN
    #[serde(rename = "SSNLast4")]
    pub ssn_last_4: Option<ScrubbedPiiString>,
    /// IP address
    #[serde(rename = "IPAddress")]
    pub ip_address: Option<ScrubbedPiiString>,
    /// Driver license number
    pub driver_license_number: Option<ScrubbedPiiString>,
    /// Two-letter state abbreviation of the driver license issuing state
    pub driver_license_state: Option<ScrubbedPiiString>,
    /// Ten-digit home phone number
    pub home_phone: Option<ScrubbedPiiString>,
    /// Ten-digit work phone number
    pub work_phone: Option<ScrubbedPiiString>,
    /// Email address
    pub email: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Name {
    /// Not currently used
    pub full: Option<ScrubbedPiiString>,
    /// First name
    pub first: Option<ScrubbedPiiString>,
    /// Middle name
    pub middle: Option<ScrubbedPiiString>,
    /// Last name
    pub last: Option<ScrubbedPiiString>,
    /// Generational suffix (for example, Jr or Sr)
    pub suffix: Option<ScrubbedPiiString>,
    /// Not currently used
    pub prefix: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Address {
    /// Not currently used
    pub street_number: Option<ScrubbedPiiString>,
    /// Not currently used
    pub street_pre_direction: Option<ScrubbedPiiString>,
    /// Not currently used
    pub street_name: Option<ScrubbedPiiString>,
    /// Not currently used
    pub street_suffix: Option<ScrubbedPiiString>,
    /// Not currently used
    pub street_post_direction: Option<ScrubbedPiiString>,
    /// Not currently used
    pub unit_designation: Option<ScrubbedPiiString>,
    /// Not currently used
    pub unit_number: Option<ScrubbedPiiString>,
    /// Unparsed first address line (for example, 1 N. Main St)
    pub street_address_1: Option<ScrubbedPiiString>,
    /// Unparsed second address line (for example, Apt 3C)
    pub street_address_2: Option<ScrubbedPiiString>,
    /// City
    pub city: Option<ScrubbedPiiString>,
    /// Two-letter state abbreviation (for example, MT or FL)
    pub state: Option<ScrubbedPiiString>,
    /// Five-digit ZIP Code
    pub zip_5: Option<ScrubbedPiiString>,
    /// Not currently used
    pub zip_4: Option<ScrubbedPiiString>,
    /// Not currently used
    pub county: Option<ScrubbedPiiString>,
    /// Not currently used
    pub postal_code: Option<ScrubbedPiiString>,
    /// Not currently used
    pub state_city_zip: Option<ScrubbedPiiString>,
    /// Not currently used
    pub latitude: Option<ScrubbedPiiString>,
    /// Not currently used
    pub longitude: Option<ScrubbedPiiString>,
}

#[derive(Debug, Clone, Deserialize, Serialize, Eq, PartialEq)]
#[serde(rename_all = "PascalCase")]
#[allow(non_snake_case)]
pub struct Dob {
    /// Year (yyyy)
    pub year: Option<ScrubbedPiiString>,
    /// Month (MM)
    pub month: Option<ScrubbedPiiString>,
    /// Day (dd)
    pub day: Option<ScrubbedPiiString>,
}

impl FlexIdResponse {
    fn result(&self) -> Option<&LResult> {
        self.flex_id_response_ex
            .as_ref()
            .and_then(|r| r.response.as_ref())
            .and_then(|r: &Response| r.result.as_ref())
    }

    fn header(&self) -> Option<&Header> {
        self.flex_id_response_ex
            .as_ref()
            .and_then(|r| r.response.as_ref())
            .and_then(|r| r.header.as_ref())
    }

    fn error(&self) -> Option<ResponseError> {
        let error_message = self.header().and_then(|r| r.message.clone());
        let exceptions = self
            .header()
            .and_then(|h| h.exceptions.as_ref())
            .and_then(|e| e.exception.clone())
            .unwrap_or_default();
        let fault = self.fault.clone();

        // if any of these possible indications of an error are present, then treat this as a ErrorResponse
        if error_message.is_some() || !exceptions.is_empty() || fault.is_some() {
            Some(ResponseError::ErrorResponse(Box::new(self.clone())))
        } else if self.result().is_none() {
            // if we have an empty result body for whatever reason then also treat that as an error
            Some(ResponseError::MissingResult(Box::new(self.clone())))
        } else {
            None
        }
    }

    pub fn validate(&self) -> Result<(), lexis::Error> {
        if let Some(err) = self.error() {
            Err(err.into())
        } else {
            Ok(())
        }
    }

    pub fn name_address_phone_summary(&self) -> NameAddressPhoneSummary {
        self.result()
            .and_then(|r| r.name_address_phone.as_ref())
            .and_then(|nap| nap.summary.as_ref())
            .and_then(|s| match NameAddressPhoneSummary::try_from(s.as_str().trim()) {
                Ok(naps) => Some(naps),
                Err(_) => {
                    tracing::error!(name_address_phone_summary=%s, "Unknown Lexis NameAddressPhone summary");
                    None
                }
            })
            .unwrap_or(NameAddressPhoneSummary::NothingFound) // TODO: in general when an expected
                                                              // field is missing or we fail to
                                                              // parse, do we want produce a
                                                              // conservative FRC (like this
                                                              // unwrap_or) or do we want to just
                                                              // not produce any FRC at all?
    }

    pub fn name_address_ssn_summary(&self) -> NameAddressSsnSummary {
        self.result()
            .and_then(|r| r.name_address_ssn_summary.as_ref())
            .and_then(
                |i| match NameAddressSsnSummary::try_from(i.to_string().as_str()) {
                    Ok(nass) => Some(nass),
                    Err(_) => {
                        tracing::error!(name_address_ssn_summary=%i, "Unknown Lexis NameAddressSsn summary");
                        None
                    }
                },
            )
            .unwrap_or(NameAddressSsnSummary::NothingFound) // TODO: in general when an expected
                                                            // field is missing or we fail to parse,
                                                            // do we want produce a conservative FRC
                                                            // (like this unwrap_or) or do we want
                                                            // to just not produce any FRC at all?
    }

    pub fn dob_match_level(&self) -> DobMatchLevel {
        self.result()
            .and_then(|r| r.verified_element_summary.as_ref())
            .and_then(|v| v.dob_match_level.as_ref())
            .and_then(|d| match DobMatchLevel::try_from(d.as_str().trim()) {
                Ok(dml) => Some(dml),
                Err(_) => {
                    tracing::error!(dob_match_level=%d, "Unknown Lexis DobMatchLevel");
                    None
                }
            })
            .unwrap_or(DobMatchLevel::NoDobFoundOrSubmitted) // TODO: in general when an expected
                                                             // field is missing or we fail to
                                                             // parse, do we want produce a
                                                             // conservative FRC (like this
                                                             // unwrap_or) or do we want to just not
                                                             // produce any FRC at all?
    }

    pub fn dl_verified(&self) -> Option<bool> {
        self.result()
            .and_then(|r| r.verified_element_summary.as_ref())
            .and_then(|v| v.dl)
    }

    pub fn valid_element_summary(&self) -> Option<ValidElementSummary> {
        self.result().and_then(|r| r.valid_element_summary.clone())
    }

    pub fn verified_element_summary(&self) -> Option<VerifiedElementSummary> {
        self.result().and_then(|r| r.verified_element_summary.clone())
    }

    pub fn bureau_deleted(&self) -> Option<bool> {
        self.result().and_then(|r| r.bureau_deleted)
    }

    pub fn itin_expired(&self) -> Option<bool> {
        self.result().and_then(|r| r.itin_expired)
    }

    pub fn phone_line_description(&self) -> PhoneLineDescription {
        self.result()
            .and_then(|r| r.phone_line_description.as_ref())
            .and_then(|s| match PhoneLineDescription::try_from(s.as_str().trim()) {
                Ok(pld) => Some(pld),
                Err(_) => {
                    tracing::error!(phone_line_description=%s, "Unknown Lexis PhoneLineDescription");
                    None
                }
            })
            .unwrap_or(PhoneLineDescription::Unknown)
    }

    pub fn comprehensive_verification_index(&self) -> Option<i32> {
        self.result()
            .and_then(|r| r.comprehensive_verification.as_ref())
            .and_then(|c| c.comprehensive_verification_index)
    }

    pub fn risk_indicator_codes(&self) -> Vec<RiskIndicatorCode> {
        self.result()
            .and_then(|r| r.comprehensive_verification.as_ref())
            .and_then(|c| c.risk_indicators.as_ref())
            .and_then(|r| r.risk_indicator.as_ref())
            .map(|r| {
                r.iter()
                    .filter_map(|ri| ri.risk_code.as_ref())
                    .filter_map(|c| match RiskIndicatorCode::try_from(c.as_str().trim()) {
                        Ok(ric) => Some(ric),
                        Err(_) => {
                            tracing::error!(risk_indicator=%c, "Unknown Lexis RiskIndicator");
                            None
                        }
                    })
                    .collect()
            })
            .unwrap_or_default()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::lexis;
    use serde_json::json;

    #[test]
    pub fn test_deser() {
        let json = json!({
          "FlexIDResponseEx": {
            "@xmlns": "http://webservices.seisint.com/WsIdentity",
            "response": {
              "Header": {
                "QueryId": "2b78260f-24d6-4e09-ad39-91e38b654ec2",
                "Status": 0,
                "TransactionId": "173737581S921904"
              },
              "Result": {
                "BureauDeleted": false,
                "ComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 40,
                  "RiskIndicators": {
                    "RiskIndicator": [
                      {
                        "Description": "Unable to verify date-of-birth",
                        "RiskCode": "28",
                        "Sequence": 1
                      },
                      {
                        "Description": "Unable to verify first name",
                        "RiskCode": "48",
                        "Sequence": 2
                      }
                    ]
                  }
                },
                "CustomComprehensiveVerification": {
                  "ComprehensiveVerificationIndex": 0
                },
                "EmergingId": false,
                "ITINExpired": false,
                "InputEcho": {
                  "Address": {
                    "City": "anytown",
                    "State": "CA",
                    "StreetAddress1": "100 east street",
                    "Zip5": "94121"
                  },
                  "Age": 0,
                  "HomePhone": "1085551212",
                  "Name": {
                    "First": "NICHOLAS",
                    "Last": "BOGGAN"
                  },
                  "SSN": "486639975"
                },
                "InstantIDVersion": "1",
                "IsPhoneCurrent": false,
                "NameAddressPhone": {
                  "Summary": "11"
                },
                "NameAddressSSNSummary": 11,
                "UniqueId": "0",
                "ValidElementSummary": {
                  "AddressCMRA": false,
                  "AddressPOBox": false,
                  "PassportValid": false,
                  "SSNDeceased": false,
                  "SSNFoundForLexID": false,
                  "SSNValid": true
                },
                "VerifiedElementSummary": {
                  "DOB": false,
                  "Email": false
                },
                "VerifiedSSN": "0121"
              }
            }
          }
        });

        let parsed = lexis::parse_response(json).unwrap();

        assert_eq!(
            FlexIdResponse {
                fault: None,
                flex_id_response_ex: Some(FlexIdResponseEx {
                    response: Some(Response {
                        header: Some(Header {
                            interface_version: None,
                            status: Some(0),
                            message: None,
                            query_id: Some("2b78260f-24d6-4e09-ad39-91e38b654ec2".to_owned()),
                            transaction_id: Some("173737581S921904".to_owned()),
                            exceptions: None
                        }),
                        result: Some(LResult {
                            input_echo: Some(InputEcho {
                                name: Some(Name {
                                    full: None,
                                    first: Some("NICHOLAS".into()),
                                    middle: None,
                                    last: Some("BOGGAN".into()),
                                    suffix: None,
                                    prefix: None
                                }),
                                address: Some(Address {
                                    street_number: None,
                                    street_pre_direction: None,
                                    street_name: None,
                                    street_suffix: None,
                                    street_post_direction: None,
                                    unit_designation: None,
                                    unit_number: None,
                                    street_address_1: Some("100 east street".into()),
                                    street_address_2: None,
                                    city: Some("anytown".into()),
                                    state: Some("CA".into()),
                                    zip_5: Some("94121".into()),
                                    zip_4: None,
                                    county: None,
                                    postal_code: None,
                                    state_city_zip: None,
                                    latitude: None,
                                    longitude: None
                                }),
                                dob: None,
                                age: Some(ScrubbedPiiInt::new(PiiInt::new(0))),
                                ssn: Some("486639975".into()),
                                ssn_last_4: None,
                                ip_address: None,
                                driver_license_number: None,
                                driver_license_state: None,
                                home_phone: Some("1085551212".into()),
                                work_phone: None,
                                email: None
                            }),
                            unique_id: Some("0".to_owned()),
                            verified_ssn: Some("0121".into()),
                            name_address_phone: Some(NameAddressPhone {
                                summary: Some("11".to_owned()),
                                _type: None,
                                status: None
                            }),
                            verified_element_summary: Some(VerifiedElementSummary {
                                first_name: None,
                                last_name: None,
                                middle_name: None,
                                street_address: None,
                                city: None,
                                state: None,
                                zip: None,
                                home_phone: None,
                                dob: Some(false),
                                dob_match_level: None,
                                ssn: None,
                                dl: None,
                                email: Some(false)
                            }),
                            valid_element_summary: Some(ValidElementSummary {
                                ssn_valid: Some(true),
                                ssn_deceased: Some(false),
                                dl_valid: None,
                                passport_valid: Some(false),
                                address_po_box: Some(false),
                                address_cmra: Some(false),
                                ssn_found_for_lex_id: Some(false)
                            }),
                            name_address_ssn_summary: Some(11),
                            comprehensive_verification: Some(ComprehensiveVerification {
                                comprehensive_verification_index: Some(40),
                                risk_indicators: Some(RiskIndicators {
                                    risk_indicator: Some(vec![
                                        RiskIndicator {
                                            risk_code: Some("28".to_owned()),
                                            description: Some("Unable to verify date-of-birth".to_owned()),
                                            sequence: Some(1)
                                        },
                                        RiskIndicator {
                                            risk_code: Some("48".to_owned()),
                                            description: Some("Unable to verify first name".to_owned()),
                                            sequence: Some(2)
                                        }
                                    ])
                                })
                            }),
                            custom_comprehensive_verification: Some(ComprehensiveVerification {
                                comprehensive_verification_index: Some(0),
                                risk_indicators: None
                            }),
                            models: None,
                            instant_id_version: Some("1".to_owned()),
                            emerging_id: Some(false),
                            address_secondary_range_mismatch: None,
                            bureau_deleted: Some(false),
                            itin_expired: Some(false),
                            is_phone_current: Some(false),
                            phone_line_type: None,
                            phone_line_description: None
                        })
                    })
                })
            },
            parsed
        );
    }

    #[test]
    pub fn test_validate() {
        let parsed = lexis::parse_response(serde_json::json!(  {
          "Fault": {
            "detail": {
              "Exceptions": {
                "Exception": [
                  {
                    "Code": "401",
                    "Message": "[401: Insufficient privilege to run the function AllowFlexIDSSNVerification] "
                  }
                ]
              }
            },
            "faultactor": "Esp",
            "faultstring": "[401: Insufficient privilege to run the function AllowFlexIDSSNVerification] "
          }
        }))
        .unwrap();
        let lexis::Error::ResponseError(e) = parsed.validate().unwrap_err() else {
            panic!();
        };
        assert!(matches!(e, ResponseError::ErrorResponse(_)));

        let parsed = lexis::parse_response(serde_json::json!(  {
          "Fault": {
            "detail": {
              "Exceptions": {
                "Exception": [
                  {
                    "Code": "-1",
                    "Message": "[ -1: Invalid value for type DOBMatchType: Exac] "
                  }
                ]
              }
            },
            "faultactor": "Esp",
            "faultstring": "[ -1: Invalid value for type DOBMatchType: Exac] "
          }
        }))
        .unwrap();
        let lexis::Error::ResponseError(e) = parsed.validate().unwrap_err() else {
            panic!();
        };
        assert!(matches!(e, ResponseError::ErrorResponse(_)));

        let parsed = lexis::parse_response(serde_json::json!({})).unwrap();
        let lexis::Error::ResponseError(e) = parsed.validate().unwrap_err() else {
            panic!();
        };
        assert!(matches!(e, ResponseError::MissingResult(_)));
    }
}
