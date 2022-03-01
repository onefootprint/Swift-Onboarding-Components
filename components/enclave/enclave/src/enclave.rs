use thiserror::Error;

use crate::ne::kms_decrypt;
use crate::{EnvelopeDecrypt, FnDecryption};

#[derive(Error, Debug)]
pub enum Error {
    #[error("Bad private key")]
    InvalidPrivateKey,
}

pub async fn handle_fn_decrypt(request: EnvelopeDecrypt) -> Result<FnDecryption, Error> {
    
    unimplemented!()
}
