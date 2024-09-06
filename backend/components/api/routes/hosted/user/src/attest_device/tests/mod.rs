use super::ios::attest_inner as attest_ios;
use app_attest::apple::AppleAppAttestationVerifier;
use newtypes::VaultId;

const ATT_1: &str = include_str!("vectors/att_1.base64");
const ATT_2: &str = include_str!("vectors/att_2.base64");

/// note this will fail because of payload expiration issues
/// hence why we ignore this!
#[ignore]
#[tokio::test]
async fn test_attest_ios() {
    let test_attestation = ATT_1;

    let verifier = AppleAppAttestationVerifier::new_default_ca(
        vec![
            "5F264K8AG4.com.onefootprint.my",
            "5F264K8AG4.com.onefootprint.my.Clip",
            "5F264K8AG4.com.onefootprint.demo-swift",
        ],
        "-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg5dQK1vD+J6BPctWQ
OnQ3z58zG0IrWakPqw6J0Es8k+igCgYIKoZIzj0DAQehRANCAAS/QUqu/nzVEoi/
CIFxdXazwDWRQ1rIBiYULgRNGDXOfVCtT6hWkmtDxD1KYQ4nUhIkd76ubRxk3XxX
qriAvCkH
-----END PRIVATE KEY-----",
        "3A9LZR4SKP",
        "5F264K8AG4",
    )
    .unwrap();
    let vault_id = VaultId::test_data("test".into());
    attest_ios(&vault_id, &verifier, "".into(), test_attestation.into(), vec![])
        .await
        .expect("failed attest");
}

#[ignore]
#[tokio::test]
async fn test_attest_ios_2() {
    let test_attestation = ATT_2;

    let verifier = AppleAppAttestationVerifier::new_default_ca(
        vec![
            "5F264K8AG4.com.onefootprint.my",
            "5F264K8AG4.com.onefootprint.my.Clip",
            "5F264K8AG4.com.onefootprint.demo-swift",
        ],
        "-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg5dQK1vD+J6BPctWQ
OnQ3z58zG0IrWakPqw6J0Es8k+igCgYIKoZIzj0DAQehRANCAAS/QUqu/nzVEoi/
CIFxdXazwDWRQ1rIBiYULgRNGDXOfVCtT6hWkmtDxD1KYQ4nUhIkd76ubRxk3XxX
qriAvCkH
-----END PRIVATE KEY-----",
        "3A9LZR4SKP",
        "5F264K8AG4",
    )
    .unwrap();
    let vault_id = VaultId::test_data("test".into());
    let res = attest_ios(&vault_id, &verifier, "".into(), test_attestation.into(), vec![])
        .await
        .expect("failed attest");

    println!("{:?}", &res);
    assert!(res.dc_bit0.is_some());
    assert!(res.dc_bit1.is_some());
    assert!(res.receipt_risk_metric.is_some())
}
