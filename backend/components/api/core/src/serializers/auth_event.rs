use crate::utils::db2api::DbToApi;
use api_wire_types::AttestedDeviceData;
use api_wire_types::DeviceFraudRiskLevel;
use api_wire_types::DeviceType;
use db::models::auth_event::AuthEvent;
use db::models::auth_event::LoadedAuthEvent;

impl DbToApi<LoadedAuthEvent> for api_wire_types::AuthEvent {
    fn from_db(event: LoadedAuthEvent) -> Self {
        let LoadedAuthEvent {
            event,
            insight,
            attested_devices,
        } = event;

        let AuthEvent {
            created_at, scope, ..
        } = event;

        let linked_attestations = if let Some(attested_devices) = attested_devices {
            attested_devices
                .ios_devices
                .into_iter()
                .map(|ios| AttestedDeviceData {
                    app_bundle_id: ios.bundle_id,
                    model: ios.metadata.model,
                    os: ios.metadata.os,
                    device_type: DeviceType::Ios,
                    // this is placeholder -- maybe we shouldn't reveal this here?
                    fraud_risk: ios.receipt_risk_metric.map(|metric| match metric {
                        0..=3 => DeviceFraudRiskLevel::Low,
                        4 | 5 => DeviceFraudRiskLevel::Medium,
                        _ => DeviceFraudRiskLevel::High,
                    }),
                })
                .chain(
                    attested_devices
                        .android_devices
                        .into_iter()
                        .map(|att| AttestedDeviceData {
                            app_bundle_id: att.package_name,
                            model: att.metadata.model,
                            os: att.metadata.os,
                            device_type: DeviceType::Android,
                            // this is also a placeholder
                            fraud_risk: Some(if att.is_trustworthy_device {
                                DeviceFraudRiskLevel::Low
                            } else if att.is_evaluated_device {
                                DeviceFraudRiskLevel::Medium
                            } else {
                                DeviceFraudRiskLevel::High
                            }),
                        }),
                )
                .collect()
        } else {
            vec![]
        };

        Self {
            created_at,
            scope,
            insight: insight.map(api_wire_types::InsightEvent::from_db),
            linked_attestations,
            kind: event.kind,
        }
    }
}

impl DbToApi<LoadedAuthEvent> for api_wire_types::PublicAuthEvent {
    fn from_db(event: LoadedAuthEvent) -> Self {
        let LoadedAuthEvent {
            event,
            insight,
            attested_devices: _,
        } = event;
        let AuthEvent { created_at, .. } = event;

        Self {
            created_at,
            insight: insight.map(api_wire_types::PublicInsightEvent::from_db),
            kind: event.kind.into(),
        }
    }
}
