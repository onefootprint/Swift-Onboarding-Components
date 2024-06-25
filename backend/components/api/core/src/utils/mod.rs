pub mod actix;
pub mod body_bytes;
pub mod challenge;
pub mod challenge_rate_limit;
pub mod db2api;
pub mod email;
pub mod email_domain;
pub mod file_upload;
pub mod fp_id_path;
pub mod headers;
pub mod identify;
pub mod incode_helper;
pub mod kyb_utils;
pub mod large_json;
pub mod magic_link;
pub mod onboarding;
pub mod paperclip;
pub mod passkey;
pub mod requirements;
pub mod search_utils;
pub mod session;
pub mod sms;
pub mod tenant_business_info;
pub mod timeouts;
pub mod token;
pub mod vault_wrapper;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
pub(crate) mod mock_enclave;

#[cfg(test)]
mod tests;
