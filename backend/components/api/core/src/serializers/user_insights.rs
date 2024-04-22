use api_wire_types::UserInsight;
use db::models::{neuro_id_analytics_event::NeuroIdAnalyticsEvent, workflow::Workflow};
use newtypes::UserInsightScope;
use strum_macros::{Display, EnumString};
macro_rules! user_insight {
    (
        $(#[$macros:meta])*
        enum $name:ident {
            $(#[ser = $ser:expr, description = $description:expr] $item:ident),*
        }
    ) => {
        $(#[$macros])*
        enum $name {

            $(#[strum(serialize = $ser)]
                #[doc = $description] $item,)*
        }

        impl $name {
            pub fn description(&self) -> String {
                match self {
                    $(
                        $name::$item => String::from($description),
                    )*
                }
            }
        }
    }
}

pub fn from_db(event: Option<NeuroIdAnalyticsEvent>, workflow: Option<Workflow>) -> Vec<UserInsight> {
    let behavior_features = if let Some(ev) = event {
        let NeuroIdAnalyticsEvent {
            cookie_id,
            device_id,
            model_fraud_ring_indicator_result,
            model_automated_activity_result,
            model_tor_exit_node_result,
            model_public_proxy_result,
            model_vpn_result,
            model_incognito_result,
            model_multiple_ids_per_device_result,
            suspicious_device_emulator,
            suspicious_device_frida,
            suspicious_device_missing_expected_properties,
            ..
        } = ev;

        let behavior = vec![
            (
                Insight::FraudRingIndicator,
                model_fraud_ring_indicator_result,
                UserInsightScope::Behavior,
            ),
            (
                Insight::AutomatedActivity,
                model_automated_activity_result,
                UserInsightScope::Behavior,
            ),
        ]
        .into_iter()
        .filter_map(|(n, value, scope)| {
            value.map(|v| UserInsight {
                name: n.to_string(),
                value: v.to_string(),
                scope,
                description: n.description(),
            })
        });

        let device = vec![
            (Insight::Vpn, model_vpn_result, UserInsightScope::Device),
            (
                Insight::MultipleSessionsPerDevice,
                model_multiple_ids_per_device_result,
                UserInsightScope::Device,
            ),
            (
                Insight::Incognito,
                model_incognito_result,
                UserInsightScope::Device,
            ),
            (Insight::Tor, model_tor_exit_node_result, UserInsightScope::Device),
            (
                Insight::Proxy,
                model_public_proxy_result,
                UserInsightScope::Device,
            ),
            (
                Insight::SuspiciousDeviceEmulator,
                suspicious_device_emulator,
                UserInsightScope::Device,
            ),
            (
                Insight::SuspiciousDeviceMissingExpectedProperties,
                suspicious_device_missing_expected_properties,
                UserInsightScope::Device,
            ),
            (
                Insight::SuspiciousDeviceMissingExpectedFrida,
                suspicious_device_frida,
                UserInsightScope::Device,
            ),
        ]
        .into_iter()
        .filter_map(|(n, value, scope)| {
            value.map(|v| UserInsight {
                name: n.to_string(),
                value: v.to_string(),
                scope,
                description: n.description(),
            })
        });

        let device_ids = vec![
            (Insight::CookieId, cookie_id, UserInsightScope::Device),
            (Insight::DeviceId, device_id, UserInsightScope::Device),
        ]
        .into_iter()
        .filter_map(|(n, value, scope)| {
            value.map(|value| UserInsight {
                name: n.to_string(),
                value,
                scope,
                description: n.description(),
            })
        });

        behavior.chain(device).chain(device_ids).collect()
    } else {
        vec![]
    };

    //
    // Workflow
    //
    // TODO: shouldn't just show latest!
    // TODO: more stuff
    let wf_features = if let Some(wf) = workflow {
        let wf_time = wf.completed_at.map(|e| {
            let duration = e - wf.created_at;
            duration.num_milliseconds()
        });
        vec![(
            Insight::WorkflowCompletionTime,
            wf_time,
            UserInsightScope::Workflow,
        )]
        .into_iter()
        .filter_map(|(n, value, scope)| {
            value.map(|v| UserInsight {
                name: n.to_string(),
                value: v.to_string(),
                scope,
                description: n.description(),
            })
        })
        .collect()
    } else {
        vec![]
    };


    behavior_features.into_iter().chain(wf_features).collect()
}

user_insight! {
    #[derive(Display, EnumString, Clone, Debug)]
    enum Insight {
        #[ser = "Fraud Ring Indicator", description = "This session has behavior associated to fraud ring activities"]
        FraudRingIndicator,
        #[ser = "Automated Activity", description = "This session has automated behaviors"]
        AutomatedActivity,
        #[ser = "Suspicious Device", description = "Identifies if a device has properties that suggest the device has been modified in a way that indicates the device is being used for fraudulent or bot activity"]
        SuspiciousDevice,
        #[ser = "Suspicious Device - Emulator", description = ""]
        SuspiciousDeviceEmulator,
        #[ser = "Suspicious Device - Missing Expected Properties", description = ""]
        SuspiciousDeviceMissingExpectedProperties,
        #[ser = "Suspicious Device - Frida", description = ""]
        SuspiciousDeviceMissingExpectedFrida,
        #[ser = "VPN", description = "The public IP of the user is associated with a VPN"]
        Vpn,
        #[ser = "Incognito Mode", description = "Browser in incognito mode"]
        Incognito,
        #[ser = "Multiple Sessions per Device", description = "Browser in incognito mode"]
        MultipleSessionsPerDevice,
        #[ser = "Tor Exit Node", description = "Public IP associated with TOR exit node"]
        Tor,
        #[ser = "Public Proxy", description = "Public IP associated with a proxy"]
        Proxy,
        #[ser = "Cookie ID", description = "Identifier based on browser cookie"]
        CookieId,
        #[ser = "Device ID", description = "Persistent identifier based on fingerprinting"]
        DeviceId,
        #[ser = "Workflow time in ms", description = "The amount of time in ms it took this user to onboard"]
        WorkflowCompletionTime
    }
}
