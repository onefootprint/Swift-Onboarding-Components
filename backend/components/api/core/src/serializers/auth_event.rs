use api_wire_types::{AttestedDeviceData, DeviceFraudRiskLevel, DeviceType};
use db::models::auth_event::{AuthEvent, LoadedAuthEvent};

use crate::utils::db2api::DbToApi;

impl DbToApi<LoadedAuthEvent> for api_wire_types::AuthEvent {
    fn from_db(event: LoadedAuthEvent) -> Self {
        let LoadedAuthEvent {
            event,
            insight,
            attested_devices,
        } = event;

        let AuthEvent { id, created_at, .. } = event;

        let linked_attestations = attested_devices
            .into_iter()
            .map(|att| match att {
                db::models::auth_event::LinkedDeviceAttestation::Ios(ios) => {
                    // this is placeholder...
                    let fraud_risk = ios.receipt_risk_metric.map(|metric| match metric {
                        0..=2 => DeviceFraudRiskLevel::Low,
                        3..=5 => DeviceFraudRiskLevel::Medium,
                        _ => DeviceFraudRiskLevel::High,
                    });
                    AttestedDeviceData {
                        app_bundle_id: ios.bundle_id,
                        model: ios.metadata.model,
                        os: ios.metadata.os,
                        device_type: DeviceType::Ios,
                        fraud_risk,
                    }
                }
            })
            .collect();

        Self {
            id,
            created_at,
            insight: insight.map(api_wire_types::InsightEvent::from_db),
            linked_attestations,
            kind: event.kind,
        }
    }
}
