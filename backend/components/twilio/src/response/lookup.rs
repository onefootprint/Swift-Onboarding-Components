use newtypes::ScrubbedPiiString;

// https://www.twilio.com/docs/lookup/api
#[derive(Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LookupResponse {
    pub caller_name: Option<String>,
    pub carrier: Option<CarrierInformation>,
    pub country_code: String,
    pub national_format: String,
    pub phone_number: String,
    pub add_ons: Option<String>,
    pub url: String,
}

// https://www.twilio.com/docs/lookup/v2-api
#[derive(Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize, Debug)]
pub struct LookupV2Response {
    pub valid: Option<bool>,
    pub country_code: String,
    pub national_format: ScrubbedPiiString,
    pub phone_number: ScrubbedPiiString,
    pub add_ons: Option<String>,
    pub url: ScrubbedPiiString,
    pub carrier: Option<CarrierInformation>,
    pub call_forwarding: Option<CallForwarding>,
    pub live_activity: Option<LiveActivity>,
    pub sim_swap: Option<SimSwap>,
    pub caller_name: Option<CallerName>,
    pub line_type_intelligence: Option<LineTypeIntelligence>,
    // TODO this is a field we added ourselves, maybe put this somewhere else?
    pub name_str_distance: Option<usize>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CarrierInformation {
    pub error_code: Option<String>,
    // The three digit mobile country code of the carrier, used with the mobile network code to identify a
    // mobile network operator.
    pub mobile_country_code: Option<String>,
    // The two-three digit mobile network code of the carrier, used with the mobile country code to identify
    // a mobile network operator.
    pub mobile_network_code: Option<String>,
    // The name of the carrier
    pub name: Option<String>,
    // The phone number type. One of landline, mobile, or voip
    pub type_: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CallForwarding {
    // The two-three digit mobile network code of the carrier, used with the mobile country code to identify
    // a mobile network operator.
    pub mobile_network_code: Option<String>,
    // A boolean value indicating unconditional call forwarding is currently enabled for the requested mobile
    // phone number (true) or is not (false).
    pub call_forwarding_enabled: Option<String>,
    // // The three digit mobile country code of the carrier, used with the mobile network code to identify a
    // mobile network operator.
    pub mobile_country_code: Option<String>,
    // The name of the carrier
    pub carrier_name: Option<String>,
    pub error_code: Option<i64>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LiveActivity {
    // If ported is false, this contains carrier information for the number's current network. If ported is
    // true, this contains carrier information for the network the number was ported from.
    pub original_carrier: Option<OriginalCarrier>,
    // A boolean value indicating the requested mobile phone number has been ported (true) or has not
    // (false).
    pub ported: Option<String>,
    // If ported is true, this contains carrier information for the network the number was ported to.
    pub ported_carrier: Option<String>,
    // The connectivity status of the requested mobile phone number. See Connectivity status values below
    pub connectivity: Option<String>,
    // If roaming is true, this contains carrier information for the network the number is roaming in.
    pub roaming_carrier: Option<String>,
    // Boolean indicating whether or not the requested mobile phone number is roaming.
    pub roaming: Option<String>,
    pub error_code: Option<i64>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct OriginalCarrier {
    pub name: Option<String>,
    pub mobile_country_code: Option<String>,
    pub mobile_network_code: Option<String>,
}

#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct SimSwap {
    // The three digit mobile country code of the carrier, used with the mobile network code to identify a
    // mobile network operator.
    pub mobile_country_code: Option<String>,
    // The two-three digit mobile network code of the carrier, used with the mobile country code to identify
    // a mobile network operator.
    pub mobile_network_code: Option<String>,
    // The name of the carrier.
    pub carrier_name: Option<String>,
    // An object that contains information on the last date the subscriber identity module (SIM) was changed
    // for a mobile phone number.
    pub last_sim_swap: Option<LastSimSwap>,
    pub error_code: Option<i64>,
}

// Carriers provide their data to Lookup SIM Swap in a variety of ways.
// For example, not all countries or carriers will return the exact SIM swap date, but Lookup SIM
// Swap will return it as the last_sim_swap_date field when it's available. To standardize all these
// different methods of conveying SIM swap information, we use the fields swapped_period and
// swapped_in_period. Both of these values together allow you to answer a question like, “Was the
// SIM for this phone number swapped in the last 24 hours?” This is done by configuring the
// swapped_period field to hold the trailing time period that you’re interested in knowing if a SIM
// has been swapped, for example 24 hours, and using the swapped_in_period field to indicate yes or
// no. Find more information about the field descriptions from the API docs.
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LastSimSwap {
    pub last_sim_swap_date: Option<String>,
    pub swapped_period: Option<String>,
    pub swapped_in_period: Option<bool>,
}
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CallerName {
    // A string indicating the name of the owner of the phone number. If not available, this will be null.
    pub caller_name: Option<ScrubbedPiiString>,
    // A string indicating whether this caller is a business or consumer. Possible values are BUSINESS and
    // CONSUMER. If not available, this will be null.
    pub caller_type: Option<String>,
    // The error code, if any, associated with your request.
    pub error_code: Option<i64>,
}

// Get the line type of a phone number including mobile, landline, fixed VoIP, non-fixed VoIP,
// toll-free, and more.
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct LineTypeIntelligence {
    // The three digit mobile country code of the carrier, used with the mobile network code to identify a
    // mobile network operator.
    pub mobile_country_code: Option<String>,
    // The two-three digit mobile network code of the carrier, used with the mobile country code to identify
    // a mobile network operator (only returned for mobile numbers).
    pub mobile_network_code: Option<String>,
    // The name of the carrier; subject to change.
    pub carrier_name: Option<String>,
    // The phone number type. See Phone number type values for possible values.
    #[serde(rename = "type")]
    pub kind: Option<LineType>,
    // The error code, if any, associated with your request.
    pub error_code: Option<i64>,
}


/// Phone line type
#[derive(Debug, Clone, Eq, PartialEq, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub enum LineType {
    Landline,
    Mobile,
    FixedVoip,
    NonFixedVoip,
    Personal,
    TollFree,
    Premium,
    SharedCost,
    Uan,
    Voicemail,
    Pager,
    Unknown,
    #[serde(other)]
    Other,
}

impl LineType {
    pub fn is_voip(&self) -> bool {
        matches!(self, LineType::FixedVoip | LineType::NonFixedVoip)
    }
}
