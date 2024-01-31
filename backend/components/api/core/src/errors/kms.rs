use aws_sdk_kms::{
    error::SdkError as KmsSdkError,
    operation::{
        generate_data_key_pair_without_plaintext::GenerateDataKeyPairWithoutPlaintextError,
        generate_data_key_without_plaintext::GenerateDataKeyWithoutPlaintextError,
        generate_mac::GenerateMacError, verify_mac::VerifyMacError,
    },
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum KmsSignError {
    #[error("kms datakeypair generate error: {0}")]
    KeyPair(#[from] KmsSdkError<GenerateDataKeyPairWithoutPlaintextError>),
    #[error("kms datakey generate error: {0}")]
    DataKey(#[from] KmsSdkError<GenerateDataKeyWithoutPlaintextError>),
    #[error("kms hmac sign error: {0}")]
    SignMacError(#[from] KmsSdkError<GenerateMacError>),
    #[error("kms hmac verify error: {0}")]
    VerifyMacError(#[from] KmsSdkError<VerifyMacError>),
    #[error("crypto error: {0}")]
    Crypto(#[from] crypto::Error),
    #[error("data not available")]
    MacDataNotReturned,
}
