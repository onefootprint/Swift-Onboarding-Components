use openssl::sha::sha256;

use crate::apple::*;

fn combine_hash_list(input: &[&[u8]]) -> Vec<u8> {
    input
        .iter()
        .map(|c| sha256(c).to_vec())
        .collect::<Vec<Vec<u8>>>()
        .concat()
}

mod test_vectors {
    pub const ATT_OBJ_1: &str = "o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViY-OLwle2v2xLqCtchQhgKzUd88HBYwRC3AD4aIpx6oLldAAAAAAAAAAAAAAAAAAAAAAAAAAAAFMiD9Jz1CW-rS1qUb3BKEfMbuXg5pQECAyYgASFYIHDLrK_44D42AAgKvUYqPKNeUSjYkpHqK3-D6_FGRamxIlgg-Nwqf3EvxN4xknE2mr0upFt5LlyAR9CEc16GVb9Pkdg";

    pub const CLIENT_DATA_JSON_1: &str = "eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoidkt4V3RlQlFScnVaeG9iNENicXQ5aTVpNldvY29lTmtOZ2VzNy1CU3U1dyIsIm9yaWdpbiI6Imh0dHBzOi8vZm9vdHByaW50LmRldiJ9";

    pub const LOCATION_MATCH_1: u8 = 0x00;

    pub const CDH_1: &str = "9jxZRU1/nN0iIxHGrcKokUhRMxVcP1xIdfMbWDBNTXo=";

    pub const APP_ATTEST_1: &str = "o2NmbXRvYXBwbGUtYXBwYXR0ZXN0Z2F0dFN0bXSiY3g1Y4JZAuwwggLoMIICbaADAgECAgYBgXedm1YwCgYIKoZIzj0EAwIwTzEjMCEGA1UEAwwaQXBwbGUgQXBwIEF0dGVzdGF0aW9uIENBIDExEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwHhcNMjIwNjE3MTYyMDI2WhcNMjMwMTE3MTMxNTI2WjCBkTFJMEcGA1UEAwxAMTA4N2ZmNDVkM2Q3NTA3YWRlOWQ0OWM1MGQ5MjgzZTNmNDY3NWZjNTBkNmE1OGVhY2EwZDM4ZTlkMmI4N2JiMTEaMBgGA1UECwwRQUFBIENlcnRpZmljYXRpb24xEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARSEfEMqo_gCuZR08NW5K_5F0A5J0CJEAUytNdH_yTdeY-K4LbR0obWNW0Zhrsw2yfsv8d0ZcwgowVo0grBgzdko4HxMIHuMAwGA1UdEwEB_wQCMAAwDgYDVR0PAQH_BAQDAgTwMH4GCSqGSIb3Y2QIBQRxMG-kAwIBCr-JMAMCAQG_iTEDAgEAv4kyAwIBAb-JMwMCAQG_iTQmBCRDMjQ2QkM4OUNKLmluLmFsZXhnci5Gb290cHJpbnRWZXJpZnmlBgQEc2tzIL-JNgMCAQW_iTcDAgEAv4k5AwIBAL-JOgMCAQAwGQYJKoZIhvdjZAgHBAwwCr-KeAYEBDE2LjAwMwYJKoZIhvdjZAgCBCYwJKEiBCC4JsVxyhcd1igOXZ1iQQMXyd1gR9I2D-qrAa7TpJ64eDAKBggqhkjOPQQDAgNpADBmAjEAmHV4YXYRaf1BtqrTHodUzKyjd8t9iwbnMjJVVEciL0acTA1yPERT1d8tX12ez4d8AjEAlj_fl1rObsTE3v0u8CO1p_HsvG0cl-nkZHQhC_7-cdVaqIvRZ4V74N8yaywv42IGWQJHMIICQzCCAcigAwIBAgIQCbrF4bxAGtnUU5W8OBoIVDAKBggqhkjOPQQDAzBSMSYwJAYDVQQDDB1BcHBsZSBBcHAgQXR0ZXN0YXRpb24gUm9vdCBDQTETMBEGA1UECgwKQXBwbGUgSW5jLjETMBEGA1UECAwKQ2FsaWZvcm5pYTAeFw0yMDAzMTgxODM5NTVaFw0zMDAzMTMwMDAwMDBaME8xIzAhBgNVBAMMGkFwcGxlIEFwcCBBdHRlc3RhdGlvbiBDQSAxMRMwEQYDVQQKDApBcHBsZSBJbmMuMRMwEQYDVQQIDApDYWxpZm9ybmlhMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAErls3oHdNebI1j0Dn0fImJvHCX-8XgC3qs4JqWYdP-NKtFSV4mqJmBBkSSLY8uWcGnpjTY71eNw-_oI4ynoBzqYXndG6jWaL2bynbMq9FXiEWWNVnr54mfrJhTcIaZs6Zo2YwZDASBgNVHRMBAf8ECDAGAQH_AgEAMB8GA1UdIwQYMBaAFKyREFMzvb5oQf-nDKnl-url5YqhMB0GA1UdDgQWBBQ-410cBBmpybQx-IR01uHhV3LjmzAOBgNVHQ8BAf8EBAMCAQYwCgYIKoZIzj0EAwMDaQAwZgIxALu-iI1zjQUCz7z9Zm0JV1A1vNaHLD-EMEkmKe3R-RToeZkcmui1rvjTqFQz97YNBgIxAKs47dDMge0ApFLDukT5k2NlU_7MKX8utN-fXr5aSsq2mVxLgg35BDhveAe7WJQ5t2dyZWNlaXB0WQ5fMIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQMEAgEFADCABgkqhkiG9w0BBwGggCSABIID6DGCBBkwLAIBAgIBAQQkQzI0NkJDODlDSi5pbi5hbGV4Z3IuRm9vdHByaW50VmVyaWZ5MIIC9gIBAwIBAQSCAuwwggLoMIICbaADAgECAgYBgXedm1YwCgYIKoZIzj0EAwIwTzEjMCEGA1UEAwwaQXBwbGUgQXBwIEF0dGVzdGF0aW9uIENBIDExEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwHhcNMjIwNjE3MTYyMDI2WhcNMjMwMTE3MTMxNTI2WjCBkTFJMEcGA1UEAwxAMTA4N2ZmNDVkM2Q3NTA3YWRlOWQ0OWM1MGQ5MjgzZTNmNDY3NWZjNTBkNmE1OGVhY2EwZDM4ZTlkMmI4N2JiMTEaMBgGA1UECwwRQUFBIENlcnRpZmljYXRpb24xEzARBgNVBAoMCkFwcGxlIEluYy4xEzARBgNVBAgMCkNhbGlmb3JuaWEwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAARSEfEMqo_gCuZR08NW5K_5F0A5J0CJEAUytNdH_yTdeY-K4LbR0obWNW0Zhrsw2yfsv8d0ZcwgowVo0grBgzdko4HxMIHuMAwGA1UdEwEB_wQCMAAwDgYDVR0PAQH_BAQDAgTwMH4GCSqGSIb3Y2QIBQRxMG-kAwIBCr-JMAMCAQG_iTEDAgEAv4kyAwIBAb-JMwMCAQG_iTQmBCRDMjQ2QkM4OUNKLmluLmFsZXhnci5Gb290cHJpbnRWZXJpZnmlBgQEc2tzIL-JNgMCAQW_iTcDAgEAv4k5AwIBAL-JOgMCAQAwGQYJKoZIhvdjZAgHBAwwCr-KeAYEBDE2LjAwMwYJKoZIhvdjZAgCBCYwJKEiBCC4JsVxyhcd1igOXZ1iQQMXyd1gR9I2D-qrAa7TpJ64eDAKBggqhkjOPQQDAgNpADBmAjEAmHV4YXYRaf1BtqrTHodUzKyjd8t9iwbnMjJVVEciL0acTA1yPERT1d8tX12ez4d8AjEAlj_fl1rObsTE3v0u8CO1p_HsvG0cl-nkZHQhC_7-cdVaqIvRZ4V74N8yaywv42IGMCgCAQQCAQEEIPY8WUVNf5zdIiMRxq3CqJFIUTMVXD9cSHXzG1gwTU16MGACAQUCAQEEWE1sZGpkTWtPQmkrSjdnSlB5MjRCSXc5MUdrVisvdGdvdUlmY2tFcDZDZ3d0ZHoxWGpTemg5TjBhcUdBcE5BSWZkMzRubVZLZlZWcjl5Tkx6dG9qOC9nPT0wDgIBBgIBAQQGQVRURVNUMA8CAQcCAQEEB3NhbmRib3gwIAIBDAIBAQQYMjAyMi0ENTA2LTE4VDE2OjIwOjI2LjYyMVowIAIBFQIBAQQYMjAyMi0wOS0xNlQxNjoyMDoyNi42MjFaAAAAAAAAoIAwggOuMIIDVKADAgECAhAJObS86QzDoYFlNjcvZnFBMAoGCCqGSM49BAMCMHwxMDAuBgNVBAMMJ0FwcGxlIEFwcGxpY2F0aW9uIEludGVncmF0aW9uIENBIDUgLSBHMTEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTIyMDQxOTEzMzMwM1oXDTIzMDUxOTEzMzMwMlowWjE2MDQGA1UEAwwtQXBwbGljYXRpb24gQXR0ZXN0YXRpb24gRnJhdWQgUmVjZWlwdCBTaWduaW5nMRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzBZMBMGByqGSM49AgEGCCqGSM49AwEHA0IABDnU-aqbHMRF1lumF6zywITsbwcI1ZAUoOduzz3uOZmpTGv7AVUQVVVkbNqOI-AmARQC0H4TuVQf2LTWV9guk3ijggHYMIIB1DAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFNkX_ktnkDhLkvTbztVXgBQLjz3JMEMGCCsGAQUFBwEBBDcwNTAzBggrBgEFBQcwAYYnaHR0cDovL29jc3AuYXBwbGUuY29tL29jc3AwMy1hYWljYTVnMTAxMIIBHAYDVR0gBIIBEzCCAQ8wggELBgkqhkiG92NkBQEwgf0wgcMGCCsGAQUFBwICMIG2DIGzUmVsaWFuY2Ugb24gdGhpcyBjZXJ0aWZpY2F0ZSBieSBhbnkgcGFydHkgYXNzdW1lcyBhY2NlcHRhbmNlIG9mIHRoZSB0aGVuIGFwcGxpY2FibGUgc3RhbmRhcmQgdGVybXMgYW5kIGNvbmRpdGlvbnMgb2YgdXNlLCBjZXJ0aWZpY2F0ZSBwb2xpY3kgYW5kIGNlcnRpZmljYXRpb24gcHJhY3RpY2Ugc3RhdGVtZW50cy4wNQYIKwYBBQUHAgEWKWh0dHA6Ly93d3cuYXBwbGUuY29tL2NlcnRpZmljYXRlYXV0aG9yaXR5MB0GA1UdDgQWBBT7Z9MNv3O3kqYmXUiNLMEdleJz-DAOBgNVHQ8BAf8EBAMCB4AwDwYJKoZIhvdjZAwPBAIFADAKBggqhkjOPQQDAgNIADBFAiEAlJCgZzdz5y94KTZ2I7jdUdfImgnquwDjnG5FCwVYC9ACIEc0GivRPMBUqAo6qsw8wUV8AFRTGOozjX1t1fYLK4cuMIIC-TCCAn-gAwIBAgIQVvuD1Cv_jcM3mSO1Wq5uvTAKBggqhkjOPQQDAzBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzAeFw0xOTAzMjIxNzUzMzNaFw0zNDAzMjIwMDAwMDBaMHwxMDAuBgNVBAMMJ0FwcGxlIEFwcGxpY2F0aW9uIEludGVncmF0aW9uIENBIDUgLSBHMTEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEks5jvX2GsasoCjsc4a_7BJSAkaz2Md-myyg1b0RL4SHlV90SjY26gnyVvkn6vjPKrs0EGfEvQyX69L6zy4N-uqOB9zCB9DAPBgNVHRMBAf8EBTADAQH_MB8GA1UdIwQYMBaAFLuw3qFYM4iapIqZ3r6966_ayySrMEYGCCsGAQUFBwEBBDowODA2BggrBgEFBQcwAYYqaHR0cDovL29jc3AuYXBwbGUuY29tL29jc3AwMy1hcHBsZXJvb3RjYWczMDcGA1UdHwQwMC4wLKAqoCiGJmh0dHA6Ly9jcmwuYXBwbGUuY29tL2FwcGxlcm9vdGNhZzMuY3JsMB0GA1UdDgQWBBTZF_5LZ5A4S5L0287VV4AUC489yTAOBgNVHQ8BAf8EBAMCAQYwEAYKKoZIhvdjZAYCAwQCBQAwCgYIKoZIzj0EAwMDaAAwZQIxAI1vpp-h4OTsW05zipJ_PXhTmI_02h9YHsN1Sv44qEwqgxoaqg2mZG3huZPo0VVM7QIwZzsstOHoNwd3y9XsdqgaOlU7PzVqyMXmkrDhYb6ASWnkXyupbOERAqrMYdk4t3NKMIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBSb290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9yaXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtfTjjTuxxEtX_1H7YyYl3J6YRbTzBPEVoA_VhYDKX1DyxNB0cTddqXl5dvMVztK517IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966_ayySrMA8GA1UdEwEB_wQFMAMBAf8wDgYDVR0PAQH_BAQDAgEGMAoGCCqGSM49BAMDA2gAMGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN-yRhHFD_3meoyhpmvOwgPUnPWTxnS4at-qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm-YhidDkLF1vLUagM6BgD56KyKAAAMYH9MIH6AgEBMIGQMHwxMDAuBgNVBAMMJ0FwcGxlIEFwcGxpY2F0aW9uIEludGVncmF0aW9uIENBIDUgLSBHMTEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTAhAJObS86QzDoYFlNjcvZnFBMA0GCWCGSAFlAwQCAQUAMAoGCCqGSM49BAMCBEcwRQIhAJzUqBxuc9DGqpAD6Iu2xbEDeF1V15hVYhjH3DnKi_eDAiAejB9EucWASNeL_oSXS6gtV8vxuQr0fME6k6xmJ20sAAAAAAAAAGhhdXRoRGF0YVikCYBXqS4yuvxbsQNKDw69fi2znP5U7QoV0OI-YtTmiY9AAAAAAGFwcGF0dGVzdGRldmVsb3AAIBCH_0XT11B63p1JxQ2Sg-P0Z1_FDWpY6soNOOnSuHuxpQECAyYgASFYIFIR8Qyqj-AK5lHTw1bkr_kXQDknQIkQBTK010f_JN15Ilggj4rgttHShtY1bRmGuzDbJ-y_x3RlzCCjBWjSCsGDN2Q";
}

#[test]
fn test_att_matches_iphone() {
    let client_data = {
        let client_data_json =
            base64::decode_config(test_vectors::CLIENT_DATA_JSON_1, base64::URL_SAFE_NO_PAD).unwrap();

        let att_obj = base64::decode_config(test_vectors::ATT_OBJ_1, base64::URL_SAFE_NO_PAD).unwrap();

        let location_match = vec![test_vectors::LOCATION_MATCH_1];

        combine_hash_list(&[
            client_data_json.as_ref(),
            att_obj.as_ref(),
            location_match.as_ref(),
        ])
    };

    let cdh = sha256(&client_data);
    assert_eq!(&base64::encode(&cdh), test_vectors::CDH_1);

    let app_attestation = base64::decode_config(test_vectors::APP_ATTEST_1, base64::URL_SAFE_NO_PAD).unwrap();

    let verifier = AppleAppAttestationVerifier::new_default_ca(vec![
        "C246BC89CJ.in.alexgr.FootprintVerify",
        "C246BC89CJ.in.alexgr.FootprintVerify.Clip",
    ])
    .unwrap();

    let res = verifier
        .attest(&client_data, &app_attestation)
        .expect("failed to verify");
    assert!(res.is_development);
}

#[test]
fn test_att_fails_hash() {
    let app_attestation = base64::decode_config(test_vectors::APP_ATTEST_1, base64::URL_SAFE_NO_PAD).unwrap();

    let verifier = AppleAppAttestationVerifier::new_default_ca(vec![
        "C246BC89CJ.in.alexgr.FootprintVerify",
        "C246BC89CJ.in.alexgr.FootprintVerify.Clip",
    ])
    .unwrap();

    let client_data = b"some_wrong_client_data_inputs";

    verifier
        .attest(client_data, &app_attestation)
        .expect_err("failed to verify");
}
