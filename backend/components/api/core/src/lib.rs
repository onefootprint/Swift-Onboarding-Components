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

pub mod config;
pub mod metrics;
pub mod prometheus;
pub mod signed_hash;
pub mod telemetry;

pub mod auth;
pub mod decision;
pub mod enclave_client;
pub mod errors;
pub mod routes;
pub mod serializers;
pub mod task;
pub use self::routes::*;
pub mod proxy;
pub mod s3;
pub mod state;
#[allow(clippy::expect_used)]
#[allow(clippy::unwrap_used)]
#[cfg(test)]
mod tests;
pub mod types;
pub mod utils;

pub use crate::errors::ApiError;
pub use paperclip::actix::{web, OpenApiExt};

pub use self::state::State;

lazy_static::lazy_static! {
    pub static ref GIT_HASH:&'static str = env!("GIT_HASH");
}