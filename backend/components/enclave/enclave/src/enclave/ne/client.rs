use super::ffi::aws_allocator;
use super::ffi::aws_nitro_enclaves_kms_client;
use super::ffi::aws_nitro_enclaves_kms_client_configuration;
use super::ffi::aws_string;
use super::ffi::{
    self,
};
use super::Error;
use crate::now_millis;
use rpc::KmsCredentials;

pub struct AwsString(pub *mut aws_string);
unsafe impl Send for AwsString {}
unsafe impl Sync for AwsString {}

impl std::ops::Deref for AwsString {
    type Target = *mut aws_string;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub struct KmsClientConfiguration(pub *mut aws_nitro_enclaves_kms_client_configuration);
unsafe impl Send for KmsClientConfiguration {}
unsafe impl Sync for KmsClientConfiguration {}

pub struct AwsAllocator(pub *mut aws_allocator);
unsafe impl Send for AwsAllocator {}
unsafe impl Sync for AwsAllocator {}

impl std::ops::Deref for KmsClientConfiguration {
    type Target = *mut aws_nitro_enclaves_kms_client_configuration;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

pub struct KmsClient(pub *mut aws_nitro_enclaves_kms_client);
unsafe impl Send for KmsClient {}
unsafe impl Sync for KmsClient {}

impl std::ops::Deref for KmsClient {
    type Target = *mut aws_nitro_enclaves_kms_client;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl std::ops::DerefMut for KmsClient {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

pub struct Client {
    key_id: AwsString,
    secret_key: AwsString,
    session_token: AwsString,
    region: AwsString,
    #[allow(dead_code)]
    allocator: AwsAllocator,
    kms_client_cfg: KmsClientConfiguration,
    kms_client: KmsClient,
}

impl Client {
    pub fn new(kms_creds: KmsCredentials) -> Result<Self, Error> {
        let KmsCredentials {
            region: aws_region,
            key_id: aws_key_id,
            secret_key: aws_secret_key,
            session_token: aws_session_token,
        } = kms_creds;
        let aws_region = aws_region.as_bytes();
        let aws_key_id = aws_key_id.as_bytes();
        let aws_secret_key = aws_secret_key.as_bytes();
        let aws_session_token = aws_session_token.unwrap_or_default();
        let aws_session_token = aws_session_token.as_bytes();

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
                return Err(Error::SdkGenericError);
            }
            kid
        };
        // AWS_SECRET_ACCESS_KEY
        let secret_key = unsafe {
            let skey =
                ffi::aws_string_new_from_array(allocator, aws_secret_key.as_ptr(), aws_secret_key.len());
            if skey.is_null() {
                return Err(Error::SdkGenericError);
            }
            skey
        };
        // AWS_SESSION_TOKEN
        let session_token = unsafe {
            let sess_token = ffi::aws_string_new_from_array(
                allocator,
                aws_session_token.as_ptr(),
                aws_session_token.len(),
            );
            if sess_token.is_null() {
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
                return Err(Error::SdkKmsConfigError);
            }
            cfg
        };
        // Construct KMS Client
        let kms_client = unsafe { ffi::aws_nitro_enclaves_kms_client_new(kms_client_cfg) };
        if kms_client.is_null() {
            return Err(Error::SdkKmsClientError);
        }
        let client = Self {
            key_id: AwsString(key_id),
            secret_key: AwsString(secret_key),
            session_token: AwsString(session_token),
            region: AwsString(region),
            allocator: AwsAllocator(allocator),
            kms_client_cfg: KmsClientConfiguration(kms_client_cfg),
            kms_client: KmsClient(kms_client),
        };
        Ok(client)
    }
}

impl Drop for Client {
    fn drop(&mut self) {
        unsafe {
            log::info!("dropping kms client");
            if !self.secret_key.is_null() {
                ffi::aws_string_destroy_secure(*self.key_id);
            }
            if !self.secret_key.is_null() {
                ffi::aws_string_destroy_secure(*self.secret_key);
            }
            if !self.session_token.is_null() {
                ffi::aws_string_destroy_secure(*self.session_token);
            }
            if !self.region.is_null() {
                ffi::aws_string_destroy_secure(*self.region);
            }
            if !self.kms_client_cfg.is_null() {
                ffi::aws_nitro_enclaves_kms_client_config_destroy(*self.kms_client_cfg);
            }
            if !self.kms_client.is_null() {
                ffi::aws_nitro_enclaves_kms_client_destroy(*self.kms_client);
            }
            log::info!("done dropping kms client");
        }
    }
}

pub async fn decrypt(client: Client, ciphertext: Vec<u8>) -> Result<Vec<u8>, Error> {
    log::info!("ne decrypt {}", now_millis());

    tokio::task::spawn_blocking(move || {
        // Ciphertext
        let ciphertext_buf = unsafe {
            ffi::aws_byte_buf_from_array(ciphertext.as_ptr() as *mut ffi::c_void, ciphertext.len())
        };

        log::info!("before decrypt blocking {}", now_millis());

        // Decrypt
        let mut plaintext_buf: ffi::aws_byte_buf = unsafe { std::mem::zeroed() };
        let rc = unsafe {
            ffi::aws_kms_decrypt_blocking(
                *client.kms_client,
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                &ciphertext_buf,
                &mut plaintext_buf,
            )
        };
        if rc != 0 {
            // TODO what happens here? is the client broken?
            return Err(Error::SdkKmsDecryptError);
        }

        log::info!("after decrypt blocking {}", now_millis());

        // Plaintext
        let plaintext =
            unsafe { std::slice::from_raw_parts(plaintext_buf.buffer, plaintext_buf.len as usize).to_vec() };
        unsafe { ffi::aws_byte_buf_clean_up_secure(&mut plaintext_buf) };

        Ok(plaintext)
    })
    .await?
}
