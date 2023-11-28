#![recursion_limit = "256"]
#![warn(clippy::unwrap_used)]
#![warn(clippy::expect_used)]

pub use actix_web::{middleware::Logger, App, HttpServer, ResponseError};
pub use idv::socure::{
    client::SocureClient,
    reason_code::check_reason_code_api::query_socure_reason_code_endpoint_and_compare_against_enum,
};

pub use std::borrow::Cow;
pub use telemetry::TelemetrySpanBuilder;
pub use tracing_actix_web::TracingLogger;

pub mod auth;
pub mod config;
pub mod decision;
pub mod enclave_client;
pub mod errors;
pub mod fingerprinter;
pub mod metrics;
pub mod prometheus;
pub mod proxy;
pub mod s3;
pub mod serializers;
pub mod state;
pub mod task;
pub mod telemetry;
#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;
pub mod types;
pub mod utils;
pub mod vault;
pub mod vendor_clients;

pub use crate::errors::ApiError;
pub use crate::errors::ApiErrorKind;
pub use paperclip::actix::{web, OpenApiExt};

pub use self::state::State;

lazy_static::lazy_static! {
    pub static ref GIT_HASH:&'static str = env!("GIT_HASH");
}
