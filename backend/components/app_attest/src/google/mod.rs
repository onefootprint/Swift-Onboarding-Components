use chrono::Utc;
use josekit::{
    jwe::{self, A256KW},
    jws::ES256,
    jwt,
};

use crate::{
    error::Result,
    google::integrity_verdict::{AppRecognitionVerdict, IntegrityVerdict},
};

pub mod integrity_verdict;

#[derive(Debug, Clone)]
pub struct GoogleAppAttestationVerifier {
    config: Config,
}

#[derive(Debug, Clone)]
pub struct Config {
    pub allowed_apk_package_names: Vec<String>,
    pub allowed_apk_cert_sha256_values: Vec<String>,
    pub allowed_token_ttl_ms: TtlEnforcement,
    pub token_decryption_key_base64: String,
    pub token_verification_key_base64: String,
}

#[derive(Debug, Clone)]
pub enum TtlEnforcement {
    #[cfg(test)]
    None,
    FiveMinutes,
    Custom(i64),
}

impl TtlEnforcement {
    fn millis(&self) -> Option<i64> {
        match self {
            #[cfg(test)]
            TtlEnforcement::None => None,
            TtlEnforcement::FiveMinutes => Some(5 * 60 * 1000),
            TtlEnforcement::Custom(t) => Some(*t),
        }
    }
}

#[derive(Debug, thiserror::Error)]
pub enum PlayIntegrityTokenError {
    #[error("Invalid JWE token string")]
    InvalidJwe,

    #[error("Invalid JWE KW key")]
    InvalidKeyWrappingKey,

    #[error("Failed to unwrap JWE key")]
    KeyUnwrappingFailed,

    #[error("Failed to decrypt JWE token")]
    AesError,

    #[error("Package name not allowed")]
    UnexpectedPackageName,

    #[error("Package sha256 not allowed")]
    UnexpectedCertSha256,

    #[error("Token timestamp invalid format")]
    InvalidTimestamp,

    #[error("Token was created too long ago")]
    TokenTooOld,

    #[error("The nonce is invalid")]
    NonceMismatch,

    #[error("The token is missing a cert sha256")]
    MissingCertSha256,

    #[error("The integrity verdict was unevaluated")]
    Unevaluated(Box<IntegrityVerdictWithRawResponse>),
}

#[derive(Debug, Clone)]
pub struct IntegrityVerdictWithRawResponse {
    pub verdict: IntegrityVerdict,
    pub raw_claims: serde_json::Value,
}

impl GoogleAppAttestationVerifier {
    pub fn new(config: Config) -> Self {
        Self { config }
    }

    pub fn verify_token(
        &self,
        token: String,
        expected_nonce: Vec<u8>,
    ) -> Result<IntegrityVerdictWithRawResponse> {
        let decryption_key = base64::decode(self.config.token_decryption_key_base64.as_bytes())?;
        let verification_key = base64::decode(self.config.token_verification_key_base64.as_bytes())?;

        let decryptor = A256KW.decrypter_from_bytes(decryption_key.as_slice())?;
        let (payload, _header) = jwe::deserialize_compact(token.as_str(), &decryptor)?;

        let verifier = ES256.verifier_from_der(verification_key.as_slice())?;
        let (payload, _header) = jwt::decode_with_verifier(payload, &verifier)?;
        tracing::info!("got google token claims: {:?}", payload.claims_set());

        let value = serde_json::Value::Object(payload.into());
        let verdict: IntegrityVerdict = serde_json::from_value(value.clone())?;

        // check package name
        if !self
            .config
            .allowed_apk_package_names
            .contains(&verdict.request_details.request_package_name)
        {
            return Err(PlayIntegrityTokenError::UnexpectedPackageName)?;
        }

        // check nonce
        if base64::decode_config(verdict.request_details.nonce.as_str(), base64::URL_SAFE)? != expected_nonce
        {
            return Err(PlayIntegrityTokenError::NonceMismatch)?;
        }

        // check timestamp
        if let Some(allowed_ttl) = &self.config.allowed_token_ttl_ms.millis() {
            let timestamp: i64 = verdict
                .request_details
                .timestamp_millis
                .parse()
                .map_err(|_| PlayIntegrityTokenError::InvalidTimestamp)?;
            if Utc::now().timestamp_millis() - timestamp > *allowed_ttl {
                return Err(PlayIntegrityTokenError::TokenTooOld)?;
            }
        }

        // no evaluation possible
        if matches!(
            verdict.app_integrity.app_recognition_verdict,
            AppRecognitionVerdict::Unevaluated | AppRecognitionVerdict::Unknown
        ) {
            return Err(PlayIntegrityTokenError::Unevaluated(Box::new(
                IntegrityVerdictWithRawResponse {
                    verdict,
                    raw_claims: value,
                },
            )))?;
        }

        // check cert hashes
        if !verdict
            .app_integrity
            .certificate_sha256_digest
            .as_ref()
            .ok_or(PlayIntegrityTokenError::MissingCertSha256)?
            .iter()
            .any(|hash| self.config.allowed_apk_cert_sha256_values.contains(hash))
        {
            return Err(PlayIntegrityTokenError::UnexpectedPackageName)?;
        }

        Ok(IntegrityVerdictWithRawResponse {
            verdict,
            raw_claims: value,
        })
    }
}

#[cfg(test)]
mod tests {
    use crate::google::integrity_verdict::DeviceRecognitionVerdict;

    use super::*;

    mod vectors {
        pub const TEST_DECRYPTION_KEY: &str = "2iWMF5NQxQ/rF+BAGwvYQO9PcjEotMFmiJYjLM/hUhg=";
        pub const TEST_VERIFICATION_KEY: &str ="MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE4T/itgpd59tQMBfhv1RZCLhFVjXHx4mesCw87ujAJuaKq4xyf5NLbBe5PbTafMvf45xcOWQXGYa1oy68viJTyw==";

        pub const TOKEN:&str = "eyJhbGciOiJBMjU2S1ciLCJlbmMiOiJBMjU2R0NNIn0.X4kwtCTIR4a3Q5_eXsLMbJIBzn5jxRICNjIWQlXT1NHL98wPitF5vA.BuxTpdyVyT8g4fx4.YRqEm_Bmw5AyZmlpX-Fh68-xvXHYhjm7GFRcGpXSpX_QV2LmNVeiedImTRojH1v9BI_9yUvhTGmaGLAHdXOsGGQlnnSvxhdKX0_3m9HKS8yaaTQ4Zd5OgW2tORHoo13pNUsjZJmWx0IDmb1079Gu8D96rtqqotds_hpjHPp4B1fiR5EpinJ5IM8B-J60DWwdZ86rtBktrQXq0Xa4oerKIdVMuUIcNU3SfjR0eTYLjxz37xtMXK6zy2t93p1gie9QKo4m7AwCrIv1BRBSApagtaPWCLVJ_fI57aKF_pFBNMJR4BFTwgCb-sFpbnGDfE5g4MAGvjCD0R9I87fkuHBP8zwxskDaF2QLS9z56h4iVuSPAbp0-ZthKBGmA_RkkOP_loystYV9vqp3N8TgHt-3nJIt6KAT71KAINGxNbfblxetduAOHaiaTxZHL9AkM90T0DiPkaK3IViWr5UsxFMy2U5BKo7kL-GLb1N39mj-d9ZASoL0BD2xGAP00dQHJvwi2g0Y-uufKKNciz5fWEyJ8iSWjh-m8TQZH04Rnvu69Bj5OlyCgY2aPoQuaaCQ6tf7L73HT-JECvn3MJOIxh_DHdUs3UrCnDgUQ77JuyYuTVlBRwKWELUCOp8Y-3t-Ex_g4Wb33qeUwrEX4BYllNnEguoqD-b6yzRHna0MJoWHYLqceHttkXnrQfjHJwwfmdZ5Ha6n3rD_qjVv1JuxXb5OrUaWFM8h1-Fez4kTYCRxzDJI_6o8TMJedg2K30a9rqsI0Tp_8pN8cGopgUeS4P1AIjNLIJAUEXV1mI62e1Ff8WFFw6KerQ-30s2IBpzIVOzPA1Q-NYZtSrB3cucWBcBQZg_JIiPoo2T0smJe8RgETr-PLjGi-k0V7feQ_oQkfZkCIdNRNfb6bUT263JJiyLD4drLJFg8CH7qgKqC10j5tn4-aa64daV5zL2WWc_3Qi6-qltlPQNPr899R7w-7FJZHr152WDlHpiFoqq5GGHivp0vWJPtcYPgFUK-t8v57WLpQIgPYp1nhIyaskCLDHVNEP3hJxpbPldtilTulJ8Zm6YVpxb76IaaNNIrk5MMzDzyO0UbNOD_iy_Fk-7AIemSVtZkZaf302TnGleM5rTzcIF-7hb4TE9_RZktLR7zlAUFmbGpSg.iMcqhZaVT8fNnSNNTg3Org";

        pub const METADATA:&str = "eyJmb290cHJpbnRBdHRlc3RhdGlvbkNoYWxsZW5nZSI6InRlc3QiLCJ3ZWJhdXRobkRldmljZVJlc3BvbnNlSnNvbiI6bnVsbCwid2lkZXZpbmVJZCI6IjI0NzVlMzdhY2VhZDBiNmVhYjljNDhmNmE5MWQzZTRmMDQ5Mzg5ZDZiMzkzMGNjOGY1NzVkZGZmYjUyMzU1N2QiLCJ3aWRldmluZVNlY3VyaXR5TGV2ZWwiOiJMMSIsIm1vZGVsIjoiUGl4ZWwgNiIsIm1hbnVmYWN0dXJlciI6Ikdvb2dsZSIsIm9zIjoiMzMiLCJhbmRyb2lkSWQiOiJmYmNhN2Q4YzUyNjQyM2EzIn0=";
    }

    #[test]
    fn test_verify_token() {
        let v = GoogleAppAttestationVerifier::new(Config {
            allowed_apk_package_names: vec!["com.onefootprint.testapp".into()],
            allowed_apk_cert_sha256_values: vec!["-TWqSiuntQMu841-IDMBjfiKXO5nGASvsELOI-nQdl0".into()],
            token_decryption_key_base64: vectors::TEST_DECRYPTION_KEY.into(),
            token_verification_key_base64: vectors::TEST_VERIFICATION_KEY.into(),
            allowed_token_ttl_ms: TtlEnforcement::None,
        });

        let md = base64::decode(vectors::METADATA).unwrap();
        let nonce = openssl::sha::sha256(&md).to_vec();

        let IntegrityVerdictWithRawResponse {
            verdict,
            raw_claims: _,
        } = v
            .verify_token(vectors::TOKEN.into(), nonce)
            .expect("verify failed");

        assert!(matches!(
            verdict.app_integrity.app_recognition_verdict,
            AppRecognitionVerdict::UnrecognizedVersion
        ));

        assert!(matches!(
            verdict.device_integrity.device_recognition_verdict[0],
            DeviceRecognitionVerdict::MeetsDeviceIntegrity
        ));
    }
}
