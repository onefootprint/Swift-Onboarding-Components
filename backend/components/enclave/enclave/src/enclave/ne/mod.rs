// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

mod ffi;

use thiserror::Error;

use crate::KmsCredentials;
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

pub async fn kms_decrypt(kms_creds: KmsCredentials, ciphertext: Vec<u8>) -> Result<Vec<u8>, Error> {
    tokio::task::spawn_blocking(move || {
        let KmsCredentials {
            region,
            key_id,
            secret_key,
            session_token,
        } = kms_creds;

        kms_decrypt_inner(
            region.as_bytes(),
            key_id.as_bytes(),
            secret_key.as_bytes(),
            session_token.unwrap_or_default().as_bytes(),
            &ciphertext,
        )
    })
    .await?
}
/// KMS decrypt FFI wrapper
/// TODO: Add a trait for Drop wrappers for SDK resources
fn kms_decrypt_inner(
    aws_region: &[u8],
    aws_key_id: &[u8],
    aws_secret_key: &[u8],
    aws_session_token: &[u8],
    ciphertext: &[u8],
) -> Result<Vec<u8>, Error> {
    // Fetch allocator
    let allocator = unsafe { ffi::aws_nitro_enclaves_get_allocator() };
    if allocator.is_null() {
        return Err(Error::SdkInitError);
    }

    // REGION
    let region = unsafe {
        let reg = ffi::aws_string_new_from_array(allocator, aws_region.as_ptr(), aws_region.len());
        if reg.is_null() {
            return Err(Error::SdkGenericError);
        }
        reg
    };
    // ENDPOINT
    let mut endpoint = {
        let mut ep = ffi::aws_socket_endpoint {
            address: [0; ffi::AWS_ADDRESS_MAX_LEN],
            port: ffi::AWS_NE_VSOCK_PROXY_PORT,
        };
        ep.address[..ffi::AWS_NE_VSOCK_PROXY_ADDR.len()].copy_from_slice(&ffi::AWS_NE_VSOCK_PROXY_ADDR);
        ep
    };
    // AWS_ACCESS_KEY_ID
    let key_id = unsafe {
        let kid = ffi::aws_string_new_from_array(allocator, aws_key_id.as_ptr(), aws_key_id.len());
        if kid.is_null() {
            ffi::aws_string_destroy_secure(region);
            return Err(Error::SdkGenericError);
        }
        kid
    };
    // AWS_SECRET_ACCESS_KEY
    let secret_key = unsafe {
        let skey = ffi::aws_string_new_from_array(allocator, aws_secret_key.as_ptr(), aws_secret_key.len());
        if skey.is_null() {
            ffi::aws_string_destroy_secure(key_id);
            ffi::aws_string_destroy_secure(region);
            return Err(Error::SdkGenericError);
        }
        skey
    };
    // AWS_SESSION_TOKEN
    let session_token = unsafe {
        let sess_token =
            ffi::aws_string_new_from_array(allocator, aws_session_token.as_ptr(), aws_session_token.len());
        if sess_token.is_null() {
            ffi::aws_string_destroy_secure(secret_key);
            ffi::aws_string_destroy_secure(key_id);
            ffi::aws_string_destroy_secure(region);
            return Err(Error::SdkGenericError);
        }
        sess_token
    };
    // Construct KMS client configuration
    let kms_client_cfg = unsafe {
        // Configure
        let cfg = ffi::aws_nitro_enclaves_kms_client_config_default(
            region,
            &mut endpoint,
            ffi::AWS_SOCKET_VSOCK_DOMAIN,
            key_id,
            secret_key,
            session_token,
        );

        if cfg.is_null() {
            ffi::aws_string_destroy_secure(key_id);
            ffi::aws_string_destroy_secure(secret_key);
            ffi::aws_string_destroy_secure(session_token);
            ffi::aws_string_destroy_secure(region);
            return Err(Error::SdkKmsConfigError);
        }
        cfg
    };
    // Construct KMS Client
    let kms_client = unsafe { ffi::aws_nitro_enclaves_kms_client_new(kms_client_cfg) };
    if kms_client.is_null() {
        unsafe {
            ffi::aws_string_destroy_secure(key_id);
            ffi::aws_string_destroy_secure(secret_key);
            ffi::aws_string_destroy_secure(session_token);
            ffi::aws_string_destroy_secure(region);
            ffi::aws_nitro_enclaves_kms_client_config_destroy(kms_client_cfg);
        }
        return Err(Error::SdkKmsClientError);
    }
    // Ciphertext
    let ciphertext_buf =
        unsafe { ffi::aws_byte_buf_from_array(ciphertext.as_ptr() as *mut ffi::c_void, ciphertext.len()) };

    // Decrypt
    let mut plaintext_buf: ffi::aws_byte_buf = unsafe { std::mem::zeroed() };
    let rc = unsafe { ffi::aws_kms_decrypt_blocking(kms_client, &ciphertext_buf, &mut plaintext_buf) };
    if rc != 0 {
        unsafe {
            ffi::aws_string_destroy_secure(key_id);
            ffi::aws_string_destroy_secure(secret_key);
            ffi::aws_string_destroy_secure(session_token);
            ffi::aws_string_destroy_secure(region);
            ffi::aws_nitro_enclaves_kms_client_config_destroy(kms_client_cfg);
            ffi::aws_nitro_enclaves_kms_client_destroy(kms_client);
        }
        return Err(Error::SdkKmsDecryptError);
    }

    // Cleanup
    unsafe {
        ffi::aws_string_destroy_secure(key_id);
        ffi::aws_string_destroy_secure(secret_key);
        ffi::aws_string_destroy_secure(session_token);
        ffi::aws_string_destroy_secure(region);
        ffi::aws_nitro_enclaves_kms_client_config_destroy(kms_client_cfg);
        ffi::aws_nitro_enclaves_kms_client_destroy(kms_client);
    }

    // Plaintext
    let plaintext =
        unsafe { std::slice::from_raw_parts(plaintext_buf.buffer, plaintext_buf.len as usize).to_vec() };
    unsafe { ffi::aws_byte_buf_clean_up_secure(&mut plaintext_buf) };

    Ok(plaintext)
}
