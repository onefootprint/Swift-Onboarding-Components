use db::models::apple_device_attest::AppleDeviceAttestation;
use db::models::google_device_attest::GoogleDeviceAttestation;
use newtypes::{
    AndroidAppLicense,
    AndroidDeviceIntegrityLevel,
    FootprintReasonCode,
};

/// generates our risk signals for apple device attestation by footprint
/// receipt metric value defined here: https://developer.apple.com/documentation/devicecheck/assessing_fraud_risk#3578868
/// the ios device/app clip tries to use the SAME attestation key, which means unless device is
/// reset/app-reinstalled/etc it should be the same, singular atttestation key
/// if a bad actor is using the same device (without resetting it) we will see the same attestation
/// key, so the `associated_vault_count` surfaces this case
pub fn generate_apple_reason_codes(
    result: &AppleDeviceAttestation,
    associated_vault_count: i64,
) -> Vec<FootprintReasonCode> {
    let metric = if let Some(receipt_risk_metric) = result.receipt_risk_metric.as_ref() {
        std::cmp::max(*receipt_risk_metric as i64, associated_vault_count)
    } else {
        associated_vault_count
    };

    let risk_code = match metric {
        0 | 1 => FootprintReasonCode::AttestedDeviceNoFraudDuplicateRisk,
        2 | 3 => FootprintReasonCode::AttestedDeviceFraudDuplicateRiskLow,
        4 | 5 => FootprintReasonCode::AttestedDeviceFraudDuplicateRiskMedium,
        _ => FootprintReasonCode::AttestedDeviceFraudDuplicateRiskHigh,
    };

    // TODO: us dc_bits to override these value

    vec![FootprintReasonCode::AttestedDeviceApple, risk_code]
}

/// generates the associated google (android) device risk signals
/// Combination of play integrity verdicts from here: https://developer.android.com/google/play/integrity/verdicts
/// and the widevine id
/// Note: widevine is experimental
pub fn generate_google_reason_codes(
    result: &GoogleDeviceAttestation,
    associated_vault_count: i64,
) -> Vec<FootprintReasonCode> {
    let attestation_signal = if result.is_trustworthy_device {
        FootprintReasonCode::AttestedDeviceAndroid
    } else if result.is_evaluated_device {
        FootprintReasonCode::AttestedDeviceAndroidRisky
    } else {
        FootprintReasonCode::AttestedDeviceAndroidFailedEvaluation
    };

    let duplicate_signal = match associated_vault_count {
        0 | 1 => FootprintReasonCode::AttestedDeviceNoFraudDuplicateRisk,
        2 | 3 => FootprintReasonCode::AttestedDeviceFraudDuplicateRiskLow,
        4 | 5 => FootprintReasonCode::AttestedDeviceFraudDuplicateRiskMedium,
        _ => FootprintReasonCode::AttestedDeviceFraudDuplicateRiskHigh,
    };

    let mut signals = vec![attestation_signal, duplicate_signal];

    if matches!(result.integrity_level, AndroidDeviceIntegrityLevel::Strong) {
        signals.push(FootprintReasonCode::AttestedDeviceAndroidStrongIntegrity);
    }

    if !matches!(result.license_verdict, AndroidAppLicense::Licensed) {
        signals.push(FootprintReasonCode::AttestedDeviceAndroidUnlicensed);
    }

    signals
}
