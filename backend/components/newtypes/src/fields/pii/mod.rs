mod bytes;
mod int;
mod integration_string;
mod json;
mod long;
mod string;

#[macro_use]
pub mod macros;

pub use bytes::*;
pub use int::*;
pub use integration_string::*;
pub use json::*;
pub use long::*;
pub use string::*;

pub fn scrub_value<S>(_v: &Option<serde_json::Value>, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}

pub fn scrub_pii_value<S>(_v: &Option<PiiJsonValue>, s: S) -> Result<S::Ok, S::Error>
where
    S: serde::Serializer,
{
    s.serialize_str("<SCRUBBED>")
}
