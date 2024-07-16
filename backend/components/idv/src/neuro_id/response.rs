use super::error;
use newtypes::PiiJsonValue;
use newtypes::ScrubbedPiiVendorResponse;
use serde::Deserialize;
use serde::Serialize;
use serde_with::DeserializeFromStr;
use strum::Display;
use strum::EnumIter;
use strum::EnumString;
use strum::IntoEnumIterator;

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroIdAnalyticsResponse {
    pub message: Option<String>,
    pub more_info: Option<String>,
    status: String,
    pub profile: NeuroProfile,
}

impl NeuroIdAnalyticsResponse {
    pub(crate) fn signals(&self) -> &Vec<NeuroSignal> {
        &self.profile.signals
    }

    pub fn flagged_signals(&self) -> Vec<&NeuroSignal> {
        self.signals().iter().filter(|s| s.is_flagged()).collect()
    }

    pub fn all_attributes(&self) -> Vec<(Model, Attribute)> {
        self.signals()
            .iter()
            .filter_map(|s| s.attributes().map(|a| (s.model(), a)))
            .collect()
    }

    pub fn get_signal_for_model(&self, model: Model) -> Option<NeuroSignal> {
        self.signals().iter().find(|s| s.model() == model).cloned()
    }
}

impl NeuroIdAnalyticsResponse {
    pub fn status(&self) -> Status {
        let s = self.status.as_str();
        match Status::try_from(s) {
            Ok(r) => r,
            Err(err) => {
                tracing::error!(?err, status=%s, "Error parsing Neuro status");
                Status::Unknown
            }
        }
    }
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroProfile {
    pub id: String,
    pub funnel: Option<String>,
    pub signals: Vec<NeuroSignal>,
    // Cookie based identifier
    pub client_id: Option<String>,
    // Fingerprint JS derived ID
    pub device_id: Option<String>,
    pub interaction_attributes: Option<InteractionAttributes>,
    pub site_id: Option<String>,
}

#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroSignal {
    /// The classification label for the signal. E.g., for the Intent signal, the possible labels
    /// are genuine, neutral, risky, and insufficient data. For others, it's "true"
    pub label: String,
    /// The name of the signal.
    model: String,
    pub score: Option<f32>,
    pub version: Option<String>,
    // The lower-level data elements used to arrive at the classification for a signal.
    // Only available for customers who have purchased ID Attributes.
    // A block of associated attributes are added to each element in the signals array under the heading
    // attributes. The keys of this map are strings, while the values could be different data types.
    pub attributes: Option<serde_json::Value>,
    pub reason_codes: Option<serde_json::Value>,
}

impl NeuroSignal {
    pub fn model(&self) -> Model {
        let m = self.model.as_str();
        match Model::try_from(m) {
            Ok(r) => r,
            Err(err) => {
                // TODO: remove this after rollout!
                tracing::error!(?err, model=%m, "Error parsing NeuroSignal model");
                Model::Other
            }
        }
    }

    // TODO: familiary and combined digital intent have labels that are non-boolean
    // but we can handle these after we move to using those models
    pub fn is_flagged(&self) -> bool {
        self.label == *"true"
    }

    pub fn attributes(&self) -> Option<Attribute> {
        // This doesn't ahve attributes
        if matches!(self.model(), Model::Familiarity) {
            None
        } else {
            self.attributes.clone().and_then(|a| {
                match serde_json::from_value(a) {
                    Ok(a) => Some(a),
                    Err(e) => {
                        // TODO: remove this after rollout!
                        tracing::error!(?e, model=?self.model, "error deserializing model attributes");

                        None
                    }
                }
            })
        }
    }
}

// Reference: https://neuro-id.readme.io/reference/interaction-attributes-1
#[derive(Clone, Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case")] // argh neuro
pub struct InteractionAttributes {
    // The number of distinct client_ids associated with a user_id; represents the number of different
    // browsers/devices a user_id uses to interact with the application.
    pub client_id_count: Option<i32>,
    // The number of sessions a user_id is associated with; the session is defined as a set of interaction
    // data bounded by 30 minutes of idle time; represents the number of interactions it takes a user_id to
    // “complete” the application.
    pub session_id_count: Option<i32>,
    // The number of user identifiers set to the specific session.
    pub user_id_count: Option<i32>,
    // this has camelCase fields inside FYI
    pub ip_geolocation: Option<serde_json::Value>,
    // As of 2024-04-11 we haven't gotten the below ones yet
    // Elapsed time from calling start() to the timestamp from the most recently processed event in
    // milliseconds.
    pub elapsed_time_ms: Option<serde_json::Value>,
    // Total time spent interacting with the form fields in the application in milliseconds.
    pub interaction_time_ms: Option<serde_json::Value>,
    // The number of unique targets the user has interacted with up to this point in the application.
    pub unique_all_targets_count: Option<serde_json::Value>,
    // The number of unique high-familiarity targets the user has interacted with up to this point in the
    // application.
    pub unique_known_targets_count: Option<serde_json::Value>,
    // The number of unique low-familiarity targets the user has interacted with up to this point in the
    // application.
    pub unique_unknown_targets_count: Option<serde_json::Value>,
    pub fields_interacted_count: Option<serde_json::Value>,
}

#[derive(Clone, Serialize, Deserialize, PartialEq, Eq, Debug)]
#[serde(rename_all = "camelCase")]
pub struct NeuroIdAnalyticsResponseError {
    status: String,
    pub message: Option<String>,
    pub more_info: Option<String>,
}
impl NeuroIdAnalyticsResponseError {
    pub fn status(&self) -> Status {
        let s = self.status.as_str();
        match Status::try_from(s) {
            Ok(r) => r,
            Err(err) => {
                tracing::error!(?err, status=%s, "Error parsing NeuroAnalyticsResponseError status ");
                Status::Unknown
            }
        }
    }
}
impl std::fmt::Display for NeuroIdAnalyticsResponseError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(
            f,
            "NeuroIdAnalyticsResponseError {:?}: {} more_info: {}>",
            self.status,
            self.message.as_ref().unwrap_or(&"".to_string()),
            self.more_info.as_ref().unwrap_or(&"".to_string())
        )
    }
}

// private fn since this assumes you are doing http status checking first
fn from_analytics_response_to_error(value: NeuroIdAnalyticsResponse) -> NeuroIdAnalyticsResponseError {
    let NeuroIdAnalyticsResponse {
        message,
        more_info,
        status,
        profile: _,
    } = value;
    NeuroIdAnalyticsResponseError {
        status,
        message,
        more_info,
    }
}

#[derive(Clone, Debug, Display, EnumString, DeserializeFromStr, Eq, PartialEq, Serialize)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum Status {
    Success,
    // Data has been received for this profile though the signals have insufficient data to calculate a
    // result
    NotEnoughInteractionData,
    // Data has been received for this profile though the site still needs to be configured to calculate an
    // accurate result.
    SiteNotConfigured,
    // Api key not correct
    UnauthorizedAccess,
    // No profiles found for the given ID and Site ID
    ProfileNotFound,
    Unknown,
}

#[derive(Clone, Copy, Debug, Display, EnumString, DeserializeFromStr, Eq, PartialEq, Serialize, EnumIter)]
#[strum(serialize_all = "snake_case")]
pub enum Model {
    //
    // Behavior:
    //   reference: https://neuro-id.readme.io/reference/behavior-analytics-1
    //
    // provide information on how familiar a user is with the Personal Information data that they enter into
    // your mobile/web application.
    Familiarity,
    // flags that this session has behavior associated to fraud ring activities
    FraudRingIndicator,
    // flags that this session has automated behaviors
    AutomatedActivity,
    CombinedDigitalIntent,
    //  flags that this device has previous sessions that have low familiarity
    RiskyDevice,
    //
    // Device and Network
    //   reference: https://neuro-id.readme.io/reference/device-and-network-intelligence-1
    //
    // signal identifies if an iOS device has been reset to the default factory settings
    FactoryReset,
    // identifies if the location of a mobile device has been spoofed. Location spoofing is a common
    // practice among fraudsters to fool fraud detection systems.
    GpsSpoofing,
    // identifies if the public IP of the user is associated with a TOR (The Onion Router) exit node
    TorExitNode,
    // signal identifies if the public IP of the user is associated with a proxy server
    PublicProxy,
    // signal identifies if the public IP of the user is associated with a VPN
    Vpn,
    // identifies if the public IP of the user is associated with a blocklist you have provided or one of
    // the available NeuroID blocklists
    IpBlocklist,
    // identifies if the public IP of the user is associated with known IP address of various cloud
    // providers (azure, aws, digital ocean etc)
    IpAddressAssociation,
    // identifies if the web browser accessing your web application is being run in incognito mode.
    Incognito,
    // identifies if a device has properties that are typically associated with automation tools.
    BotFramework,
    // identifies if a device has properties that suggest the device has been modified in a way that
    // indicates the device is being used for fraudulent or bot activity
    SuspiciousDevice,
    // identifies the number of sessions associated with a device
    DeviceVelocity,
    // identifies the number of sessions associated with a device
    MultipleIdsPerDevice,
    // identifies if the device is associated with a blocklist you have provided or one of the available
    // NeuroID blocklists
    DeviceReputation,
    Other,
}

// T isn't needed here since it isn't an incode-style multi-endpoint request
// so we can prob just drop it
pub enum NeuroAPIResult {
    // We successfully can deserialize a 200 response
    Success(NeuroIdAnalyticsResponse),
    // We got a neuro error, but we have informative error information we handle in code
    ResponseErrorWithResponse(NeuroIdAnalyticsResponseError),
    // We got a non-200 that didn't have handleable error information
    ResponseErrorUnhandled(error::Error),
}
impl NeuroAPIResult {
    pub fn into_success(self) -> Result<NeuroIdAnalyticsResponse, error::Error> {
        match self {
            NeuroAPIResult::Success(s) => Ok(s),
            NeuroAPIResult::ResponseErrorWithResponse(e) => Err(error::Error::APIResponseError(e)),
            NeuroAPIResult::ResponseErrorUnhandled(e) => Err(e),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiVendorResponse, error::Error> {
        let res = match self {
            NeuroAPIResult::Success(s) => ScrubbedPiiVendorResponse::new(s),
            NeuroAPIResult::ResponseErrorWithResponse(e) => ScrubbedPiiVendorResponse::new(e),
            // If we have an unhandled error, there's no T to serialize
            NeuroAPIResult::ResponseErrorUnhandled(_) => {
                ScrubbedPiiVendorResponse::new(serde_json::json!({}))
            }
        }?;

        Ok(res)
    }

    pub fn is_error(&self) -> bool {
        !matches!(self, NeuroAPIResult::Success(_))
    }
}

#[derive(derive_more::Deref)]
pub struct NeuroApiResponse {
    #[deref]
    pub result: NeuroAPIResult,
    pub raw_response: PiiJsonValue,
}

impl NeuroApiResponse {
    pub async fn from_response(response: reqwest::Response) -> Self {
        let (cl, http_status) = (response.content_length(), response.status());
        let response_json: Result<serde_json::Value, reqwest::Error> = response.json().await;
        match response_json {
            Ok(j) => {
                if http_status.is_success() {
                    let deserialized: Result<NeuroIdAnalyticsResponse, serde_json::Error> =
                        serde_json::from_value(j.clone());
                    match deserialized {
                        Ok(d) => match d.status() {
                            // if we are http 200, we shouldn't see anything other than success, but enums
                            // /shrug
                            Status::Success => Self {
                                result: NeuroAPIResult::Success(d),
                                raw_response: j.into(),
                            },
                            _ => Self {
                                result: NeuroAPIResult::ResponseErrorWithResponse(
                                    from_analytics_response_to_error(d),
                                ),
                                raw_response: j.into(),
                            },
                        },
                        Err(e) => Self {
                            result: NeuroAPIResult::ResponseErrorUnhandled(
                                error::Error::Http200WithDeserializationError(e),
                            ),
                            raw_response: j.into(),
                        },
                    }
                } else {
                    let deserialized_error: Result<NeuroIdAnalyticsResponseError, serde_json::Error> =
                        serde_json::from_value(j.clone());

                    match deserialized_error {
                        Ok(de) => {
                            if matches!(de.status(), Status::Success) {
                                tracing::error!("unexpected success status for neuro error");
                            }

                            Self {
                                result: NeuroAPIResult::ResponseErrorWithResponse(de),
                                raw_response: j.into(),
                            }
                        }
                        Err(_) => Self {
                            result: NeuroAPIResult::ResponseErrorUnhandled(error::Error::UnknownStatus),
                            raw_response: j.into(),
                        },
                    }
                }
            }
            // if we can't deserialize as json, we probably have a 5xx
            Err(err) => {
                tracing::error!(http_status=%http_status, content_length=?cl, ?err, "error parsing Neuro response as json");
                Self {
                    result: NeuroAPIResult::ResponseErrorUnhandled(err.into()),
                    raw_response: serde_json::json!({}).into(),
                }
            }
        }
    }
}

// Define attribute serializations

#[derive(Debug, Clone, serde::Deserialize)]
#[serde(untagged)]
pub enum Attribute {
    RiskyDevice {
        risky_application_count: i32,
    },
    DeviceVelocity {
        sessions_per_device_count_1_day: i32,
        sessions_per_device_count_1_week: i32,
        sessions_per_device_count_4_week: i32,
        sessions_per_device_count_12_week: i32,
    },
    SuspiciousDevice {
        emulator: bool,
        jailbroken: bool,
        missing_expected_properties: bool,
        frida: bool,
    },
    IpAddressAssociation {
        aws_ip_set: bool,
        azure_china_ip_set: bool,
        azure_germany_ip_set: bool,
        azure_government_ip_set: bool,
        azure_public_ip_set: bool,
        digital_ocean_ip_set: bool,
        google_ip_set: bool,
        oracle_ip_set: bool,
        vultr_ip_set: bool,
    },

    MultipleIdsPerDevice {
        multiple_ids_per_device_count_1_day: i32,
        multiple_ids_per_device_count_1_week: i32,
        multiple_ids_per_device_count_4_week: i32,
        multiple_ids_per_device_count_12_week: i32,
    },
    // for device and IP
    Blocklist {
        customer_blocklist: bool,
        global_blocklist: bool,
    },
    Empty {},
}

#[derive(Default)]
pub struct NeuroAttributesBuilder {
    risky_application_count: i32,
    sessions_per_device_count_1_day: i32,
    sessions_per_device_count_1_week: i32,
    sessions_per_device_count_4_week: i32,
    sessions_per_device_count_12_week: i32,
    emulator: Option<bool>,
    jailbroken: Option<bool>,
    missing_expected_properties: Option<bool>,
    frida: Option<bool>,
    aws_ip_set: Option<bool>,
    azure_china_ip_set: Option<bool>,
    azure_germany_ip_set: Option<bool>,
    azure_government_ip_set: Option<bool>,
    azure_public_ip_set: Option<bool>,
    digital_ocean_ip_set: Option<bool>,
    google_ip_set: Option<bool>,
    oracle_ip_set: Option<bool>,
    vultr_ip_set: Option<bool>,
    multiple_ids_per_device_count_1_day: i32,
    multiple_ids_per_device_count_1_week: i32,
    multiple_ids_per_device_count_4_week: i32,
    multiple_ids_per_device_count_12_week: i32,
    ip_customer_blocklist: Option<bool>,
    ip_global_blocklist: Option<bool>,
    device_customer_blocklist: Option<bool>,
    device_global_blocklist: Option<bool>,
    model_fraud_ring_indicator_result: Option<bool>,
    model_automated_activity_result: Option<bool>,
    model_risky_device_result: Option<bool>,
    model_factory_reset_result: Option<bool>,
    model_gps_spoofing_result: Option<bool>,
    model_tor_exit_node_result: Option<bool>,
    model_public_proxy_result: Option<bool>,
    model_vpn_result: Option<bool>,
    model_ip_blocklist_result: Option<bool>,
    model_ip_address_association_result: Option<bool>,
    model_incognito_result: Option<bool>,
    model_bot_framework_result: Option<bool>,
    model_suspicious_device_result: Option<bool>,
    model_multiple_ids_per_device_result: Option<bool>,
    model_device_reputation_result: Option<bool>,
}
impl NeuroAttributesBuilder {
    pub fn build_from_response(response: &NeuroIdAnalyticsResponse) -> NeuroIdAttributes {
        let mut builder = NeuroAttributesBuilder::default();
        builder.set_attributes(response);
        builder.set_model_results(response);

        let NeuroAttributesBuilder {
            risky_application_count,
            sessions_per_device_count_1_day,
            sessions_per_device_count_1_week,
            sessions_per_device_count_4_week,
            sessions_per_device_count_12_week,
            emulator,
            jailbroken,
            missing_expected_properties,
            frida,
            aws_ip_set,
            azure_china_ip_set,
            azure_germany_ip_set,
            azure_government_ip_set,
            azure_public_ip_set,
            digital_ocean_ip_set,
            google_ip_set,
            oracle_ip_set,
            vultr_ip_set,
            multiple_ids_per_device_count_1_day,
            multiple_ids_per_device_count_1_week,
            multiple_ids_per_device_count_4_week,
            multiple_ids_per_device_count_12_week,
            ip_customer_blocklist,
            ip_global_blocklist,
            device_customer_blocklist,
            device_global_blocklist,
            model_fraud_ring_indicator_result,
            model_automated_activity_result,
            model_risky_device_result,
            model_factory_reset_result,
            model_gps_spoofing_result,
            model_tor_exit_node_result,
            model_public_proxy_result,
            model_vpn_result,
            model_ip_blocklist_result,
            model_ip_address_association_result,
            model_incognito_result,
            model_bot_framework_result,
            model_suspicious_device_result,
            model_multiple_ids_per_device_result,
            model_device_reputation_result,
        } = builder;

        NeuroIdAttributes {
            risky_application_count,
            sessions_per_device_count_1_day,
            sessions_per_device_count_1_week,
            sessions_per_device_count_4_week,
            sessions_per_device_count_12_week,
            emulator,
            jailbroken,
            missing_expected_properties,
            frida,
            aws_ip_set,
            azure_china_ip_set,
            azure_germany_ip_set,
            azure_government_ip_set,
            azure_public_ip_set,
            digital_ocean_ip_set,
            google_ip_set,
            oracle_ip_set,
            vultr_ip_set,
            multiple_ids_per_device_count_1_day,
            multiple_ids_per_device_count_1_week,
            multiple_ids_per_device_count_4_week,
            multiple_ids_per_device_count_12_week,
            ip_customer_blocklist,
            ip_global_blocklist,
            device_customer_blocklist,
            device_global_blocklist,
            model_fraud_ring_indicator_result,
            model_automated_activity_result,
            model_risky_device_result,
            model_factory_reset_result,
            model_gps_spoofing_result,
            model_tor_exit_node_result,
            model_public_proxy_result,
            model_vpn_result,
            model_ip_blocklist_result,
            model_ip_address_association_result,
            model_incognito_result,
            model_bot_framework_result,
            model_suspicious_device_result,
            model_multiple_ids_per_device_result,
            model_device_reputation_result,
        }
    }

    fn set_attributes(&mut self, response: &NeuroIdAnalyticsResponse) {
        response.all_attributes().into_iter().for_each(|(m, a)| match a {
            Attribute::RiskyDevice {
                risky_application_count,
            } => self.risky_application_count = risky_application_count,
            Attribute::DeviceVelocity {
                sessions_per_device_count_1_day,
                sessions_per_device_count_1_week,
                sessions_per_device_count_4_week,
                sessions_per_device_count_12_week,
            } => {
                self.sessions_per_device_count_1_day = sessions_per_device_count_1_day;
                self.sessions_per_device_count_1_week = sessions_per_device_count_1_week;
                self.sessions_per_device_count_4_week = sessions_per_device_count_4_week;
                self.sessions_per_device_count_12_week = sessions_per_device_count_12_week;
            }
            Attribute::SuspiciousDevice {
                emulator,
                jailbroken,
                missing_expected_properties,
                frida,
            } => {
                self.emulator = Some(emulator);
                self.jailbroken = Some(jailbroken);
                self.missing_expected_properties = Some(missing_expected_properties);
                self.frida = Some(frida);
            }
            Attribute::IpAddressAssociation {
                aws_ip_set,
                azure_china_ip_set,
                azure_germany_ip_set,
                azure_government_ip_set,
                azure_public_ip_set,
                digital_ocean_ip_set,
                google_ip_set,
                oracle_ip_set,
                vultr_ip_set,
            } => {
                self.aws_ip_set = Some(aws_ip_set);
                self.azure_china_ip_set = Some(azure_china_ip_set);
                self.azure_germany_ip_set = Some(azure_germany_ip_set);
                self.azure_government_ip_set = Some(azure_government_ip_set);
                self.azure_public_ip_set = Some(azure_public_ip_set);
                self.digital_ocean_ip_set = Some(digital_ocean_ip_set);
                self.google_ip_set = Some(google_ip_set);
                self.oracle_ip_set = Some(oracle_ip_set);
                self.vultr_ip_set = Some(vultr_ip_set);
            }
            Attribute::MultipleIdsPerDevice {
                multiple_ids_per_device_count_1_day,
                multiple_ids_per_device_count_1_week,
                multiple_ids_per_device_count_4_week,
                multiple_ids_per_device_count_12_week,
            } => {
                self.multiple_ids_per_device_count_1_day = multiple_ids_per_device_count_1_day;
                self.multiple_ids_per_device_count_1_week = multiple_ids_per_device_count_1_week;
                self.multiple_ids_per_device_count_4_week = multiple_ids_per_device_count_4_week;
                self.multiple_ids_per_device_count_12_week = multiple_ids_per_device_count_12_week;
            }
            Attribute::Blocklist {
                customer_blocklist,
                global_blocklist,
            } => {
                if m == Model::DeviceReputation {
                    self.device_customer_blocklist = Some(customer_blocklist);
                    self.device_global_blocklist = Some(global_blocklist);
                } else if m == Model::IpBlocklist {
                    self.ip_customer_blocklist = Some(customer_blocklist);
                    self.ip_global_blocklist = Some(global_blocklist);
                }
            }
            Attribute::Empty {} => (),
        });
    }

    fn set_model_results(&mut self, response: &NeuroIdAnalyticsResponse) {
        Model::iter().for_each(|m| {
            let result = response.get_signal_for_model(m).map(|s| s.is_flagged());
            match m {
                Model::FraudRingIndicator => self.model_fraud_ring_indicator_result = result,
                Model::AutomatedActivity => self.model_automated_activity_result = result,

                Model::RiskyDevice => self.model_risky_device_result = result,
                Model::FactoryReset => self.model_factory_reset_result = result,
                Model::GpsSpoofing => self.model_gps_spoofing_result = result,
                Model::TorExitNode => self.model_tor_exit_node_result = result,
                Model::PublicProxy => self.model_public_proxy_result = result,
                Model::Vpn => self.model_vpn_result = result,
                Model::IpBlocklist => self.model_ip_blocklist_result = result,
                Model::IpAddressAssociation => self.model_ip_address_association_result = result,
                Model::Incognito => self.model_incognito_result = result,
                Model::BotFramework => self.model_bot_framework_result = result,
                Model::SuspiciousDevice => self.model_suspicious_device_result = result,
                // we'll compute this ourselves maybe
                Model::DeviceVelocity => (),
                Model::MultipleIdsPerDevice => self.model_multiple_ids_per_device_result = result,
                Model::DeviceReputation => self.model_device_reputation_result = result,
                Model::Other => (),
                // TODO: these models use non-boolean fields to indicate flags, so we need to handle those
                // when we go to use them
                Model::CombinedDigitalIntent => (),
                Model::Familiarity => (),
            }
        })
    }
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub struct NeuroIdAttributes {
    pub risky_application_count: i32,
    pub sessions_per_device_count_1_day: i32,
    pub sessions_per_device_count_1_week: i32,
    pub sessions_per_device_count_4_week: i32,
    pub sessions_per_device_count_12_week: i32,
    pub emulator: Option<bool>,
    pub jailbroken: Option<bool>,
    pub missing_expected_properties: Option<bool>,
    pub frida: Option<bool>,
    pub aws_ip_set: Option<bool>,
    pub azure_china_ip_set: Option<bool>,
    pub azure_germany_ip_set: Option<bool>,
    pub azure_government_ip_set: Option<bool>,
    pub azure_public_ip_set: Option<bool>,
    pub digital_ocean_ip_set: Option<bool>,
    pub google_ip_set: Option<bool>,
    pub oracle_ip_set: Option<bool>,
    pub vultr_ip_set: Option<bool>,
    pub multiple_ids_per_device_count_1_day: i32,
    pub multiple_ids_per_device_count_1_week: i32,
    pub multiple_ids_per_device_count_4_week: i32,
    pub multiple_ids_per_device_count_12_week: i32,
    pub ip_customer_blocklist: Option<bool>,
    pub ip_global_blocklist: Option<bool>,
    pub device_customer_blocklist: Option<bool>,
    pub device_global_blocklist: Option<bool>,
    pub model_fraud_ring_indicator_result: Option<bool>,
    pub model_automated_activity_result: Option<bool>,
    pub model_risky_device_result: Option<bool>,
    pub model_factory_reset_result: Option<bool>,
    pub model_gps_spoofing_result: Option<bool>,
    pub model_tor_exit_node_result: Option<bool>,
    pub model_public_proxy_result: Option<bool>,
    pub model_vpn_result: Option<bool>,
    pub model_ip_blocklist_result: Option<bool>,
    pub model_ip_address_association_result: Option<bool>,
    pub model_incognito_result: Option<bool>,
    pub model_bot_framework_result: Option<bool>,
    pub model_suspicious_device_result: Option<bool>,
    pub model_multiple_ids_per_device_result: Option<bool>,
    pub model_device_reputation_result: Option<bool>,
}

impl NeuroIdAttributes {
    pub fn new(response: &NeuroIdAnalyticsResponse) -> Self {
        NeuroAttributesBuilder::build_from_response(response)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_fixtures::NeuroTestOpts;
    use crate::test_fixtures::{
        self,
    };

    fn get_signal_for_model(res: &NeuroIdAnalyticsResponse, model: Model) -> Option<NeuroSignal> {
        res.signals().iter().find(|s| s.model() == model).cloned()
    }

    #[test]
    fn test_deserializes() {
        use Model::*;
        let raw = test_fixtures::neuro_id_success_response(NeuroTestOpts::default());
        let parsed: NeuroIdAnalyticsResponse = serde_json::from_value(raw).unwrap();

        // these are the signals neuro recommends using for their decision logic, so just checking we can
        // deser
        vec![
            FraudRingIndicator,
            AutomatedActivity,
            Vpn,
            PublicProxy,
            Incognito,
            IpAddressAssociation,
            FactoryReset,
            SuspiciousDevice,
            GpsSpoofing,
            BotFramework,
            IpBlocklist,
            DeviceReputation,
            TorExitNode,
            MultipleIdsPerDevice,
            DeviceVelocity,
        ]
        .into_iter()
        .for_each(|m| assert!(get_signal_for_model(&parsed, m).is_some()));

        // Attribute matching
        assert!(matches!(
            get_signal_for_model(&parsed, RiskyDevice)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::RiskyDevice { .. }
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, DeviceVelocity)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::DeviceVelocity { .. }
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, SuspiciousDevice)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::SuspiciousDevice { .. }
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, IpAddressAssociation)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::IpAddressAssociation { .. }
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, MultipleIdsPerDevice)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::MultipleIdsPerDevice { .. }
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, IpBlocklist)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::Blocklist { .. }
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, DeviceReputation)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::Blocklist { .. }
        ));
        // no attributes here
        assert!(get_signal_for_model(&parsed, Familiarity)
            .unwrap()
            .attributes()
            .is_none(),);
        assert!(matches!(
            get_signal_for_model(&parsed, FraudRingIndicator)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::Empty {}
        ));
        assert!(matches!(
            get_signal_for_model(&parsed, AutomatedActivity)
                .unwrap()
                .attributes()
                .unwrap(),
            Attribute::Empty {}
        ));
    }

    #[test]
    fn test_neuro_id_attributes() {
        let opts = NeuroTestOpts {
            automated_activity: true,
            bot_framework: true,
            factory_reset: true,
            fraud_ring_indicator: true,
            ..Default::default()
        };
        let raw = test_fixtures::neuro_id_success_response(opts);
        let parsed: NeuroIdAnalyticsResponse = serde_json::from_value(raw).unwrap();

        let expected = NeuroIdAttributes {
            risky_application_count: 0,
            sessions_per_device_count_1_day: 1,
            sessions_per_device_count_1_week: 1,
            sessions_per_device_count_4_week: 1,
            sessions_per_device_count_12_week: 3,
            emulator: Some(false),
            jailbroken: Some(true),
            missing_expected_properties: Some(false),
            frida: Some(false),
            aws_ip_set: Some(false),
            azure_china_ip_set: Some(false),
            azure_germany_ip_set: Some(false),
            azure_government_ip_set: Some(true),
            azure_public_ip_set: Some(false),
            digital_ocean_ip_set: Some(false),
            google_ip_set: Some(false),
            oracle_ip_set: Some(false),
            vultr_ip_set: Some(false),
            multiple_ids_per_device_count_1_day: 1,
            multiple_ids_per_device_count_1_week: 1,
            multiple_ids_per_device_count_4_week: 1,
            multiple_ids_per_device_count_12_week: 5,
            ip_customer_blocklist: Some(false),
            ip_global_blocklist: Some(false),
            device_customer_blocklist: Some(true),
            device_global_blocklist: Some(true),
            model_fraud_ring_indicator_result: Some(true),
            model_automated_activity_result: Some(true),
            model_risky_device_result: Some(false),
            model_factory_reset_result: Some(true),
            model_gps_spoofing_result: Some(false),
            model_tor_exit_node_result: Some(false),
            model_public_proxy_result: Some(false),
            model_vpn_result: Some(false),
            model_ip_blocklist_result: Some(false),
            model_ip_address_association_result: Some(false),
            model_incognito_result: Some(false),
            model_bot_framework_result: Some(true),
            model_suspicious_device_result: Some(false),
            model_multiple_ids_per_device_result: Some(false),
            model_device_reputation_result: Some(false),
        };
        assert_eq!(NeuroIdAttributes::new(&parsed), expected);
    }
}
