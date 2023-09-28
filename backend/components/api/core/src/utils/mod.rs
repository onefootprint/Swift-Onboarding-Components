pub mod actix;
pub mod body_bytes;
pub mod challenge;
pub mod contact;
pub mod db2api;
pub mod email;
pub mod email_domain;
pub mod file_upload;
pub mod headers;
pub mod large_json;
pub mod liveness;
pub mod magic_link;
pub mod onboarding;
pub mod paperclip;
pub mod session;
pub mod sms;
pub mod vault_wrapper;
pub mod webhook_app;

#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
pub(crate) mod mock_enclave;
