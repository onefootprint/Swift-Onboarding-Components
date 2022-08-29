use aws_sdk_kms::error::DecryptError;
use aws_sdk_kms::types::{Blob, SdkError};
use aws_types::config::Config;
use aws_types::region::Region;

use thiserror::Error;

use crate::KmsCredentials;

#[allow(clippy::large_enum_variant)]
#[derive(Debug, Error)]
pub enum Error {
    #[error("decrypt {0}")]
    Kms(#[from] SdkError<DecryptError>),

    #[error("decrypt failed")]
    DecryptionFailed,
}

#[derive(Debug, Clone)]
pub struct Client {
    kms_client: aws_sdk_kms::Client,
}

impl Client {
    pub fn new(kms_creds: KmsCredentials) -> Result<Self, Error> {
        let creds = aws_types::Credentials::new(
            kms_creds.key_id,
            kms_creds.secret_key,
            kms_creds.session_token,
            None,
            "simulated",
        );
        let mut config = Config::builder();
        config.set_region(Region::new(kms_creds.region));
        config.set_credentials_provider(Some(aws_types::credentials::SharedCredentialsProvider::new(
            creds,
        )));
        let config = config.build();
        let kms_client = aws_sdk_kms::Client::new(&config);
        Ok(Self { kms_client })
    }
}

impl Client {
    pub async fn kms_decrypt(&self, ciphertext: Vec<u8>) -> Result<Vec<u8>, Error> {
        let out = self
            .kms_client
            .decrypt()
            .ciphertext_blob(Blob::new(ciphertext))
            .send()
            .await?;

        Ok(out.plaintext.ok_or(Error::DecryptionFailed)?.into_inner())
    }
}

pub async fn kms_decrypt(client: Client, ciphertext: Vec<u8>) -> Result<Vec<u8>, Error> {
    client.kms_decrypt(ciphertext).await
}
