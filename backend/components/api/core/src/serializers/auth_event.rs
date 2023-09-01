use api_wire_types::{AttestedDeviceData, DeviceFraudRiskLevel, DeviceType};
use db::models::auth_event::{AuthEvent, LoadedAuthEvent};
use newtypes::FootprintReasonCode;

use crate::utils::db2api::DbToApi;

impl DbToApi<LoadedAuthEvent> for api_wire_types::AuthEvent {
    fn from_db(event: LoadedAuthEvent) -> Self {
        let LoadedAuthEvent {
            event,
            insight,
            attested_devices,
        } = event;

        let AuthEvent { id, created_at, .. } = event;

        let linked_attestations = if let Some(attested_devices) = attested_devices {
            let unique_vaults = attested_devices.unique_vaults_associated_by_attestation;

            attested_devices
                .ios_devices
                .into_iter()
                .map(|ios| AttestedDeviceData {
                    // this is placeholder -- maybe we shouldn't reveal this here?
                    fraud_risk: crate::decision::features::fp_ios_attestation::generate_reason_codes(
                        &ios,
                        unique_vaults,
                    )
                    .into_iter()
                    .filter_map(|r| match r {
                        FootprintReasonCode::AttestedDeviceNoFraudDuplicateRisk
                        | FootprintReasonCode::AttestedDeviceFraudDuplicateRiskLow => {
                            Some(DeviceFraudRiskLevel::Low)
                        }
                        FootprintReasonCode::AttestedDeviceFraudDuplicateRiskMedium => {
                            Some(DeviceFraudRiskLevel::Medium)
                        }
                        FootprintReasonCode::AttestedDeviceFraudDuplicateRiskHigh => {
                            Some(DeviceFraudRiskLevel::High)
                        }
                        _ => None,
                    })
                    .next(),
                    app_bundle_id: ios.bundle_id,
                    model: ios.metadata.model,
                    os: ios.metadata.os,
                    device_type: DeviceType::Ios,
                })
                .collect()
        } else {
            vec![]
        };

        Self {
            id,
            created_at,
            insight: insight.map(api_wire_types::InsightEvent::from_db),
            linked_attestations,
            kind: event.kind,
        }
    }
}
