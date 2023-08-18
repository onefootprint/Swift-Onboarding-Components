mod bytes;
mod json;
mod string;
#[macro_use]
pub mod macros;

pub use bytes::*;
pub use json::*;
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
