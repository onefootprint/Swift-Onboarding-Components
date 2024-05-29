// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

mod client;
mod ffi;

pub use self::client::{
    decrypt as kms_decrypt,
    Client,
};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum Error {
    #[error("Init")]
    SdkInitError,
    #[error("Generic")]
    SdkGenericError,
    #[error("Config")]
    SdkKmsConfigError,
    #[error("Client")]
    SdkKmsClientError,
    #[error("Decrypt")]
    SdkKmsDecryptError,

    #[error("join {0}")]
    JoinError(#[from] tokio::task::JoinError),
}

pub fn init() {
    // Initialize the SDK
    unsafe {
        ffi::aws_nitro_enclaves_library_init(std::ptr::null_mut());
    };
}

pub fn clean_up() {
    unsafe {
        ffi::aws_nitro_enclaves_library_clean_up();
    }
}

pub fn seed_entropy() -> bool {
    let rc = unsafe { ffi::aws_nitro_enclaves_library_seed_entropy(1024) };
    rc == 0
}
