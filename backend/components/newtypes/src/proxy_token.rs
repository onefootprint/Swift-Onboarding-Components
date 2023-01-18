use std::str::FromStr;

use itertools::Itertools;


use serde_with::{DeserializeFromStr, SerializeDisplay};

use crate::{DataIdentifier, FootprintUserId};

///
/// The token format is as follows:
/// $<fp_id>.<data_kind>.<attribute_name>
///
/// Example:
/// $fp_id_Gysdl9zxbBfrbSvfc0xCz.id.ssn9
///
/// Rules:
/// - Whitespaces are ignored
/// - Case SENSITIVE
///
///
/// Future work: support filters / transformations, i.e: :: $<fp_id>.id.last_name | uppercase ::
///
#[derive(Debug, Clone, PartialEq, Eq, Hash, DeserializeFromStr, SerializeDisplay)]
pub struct ProxyToken {
    pub fp_id: FootprintUserId,
    pub identifier: DataIdentifier,
}

impl ProxyToken {
    /// parses a string into a single Proxy Token
    pub fn parse(raw: &str) -> Result<Self, crate::Error> {
        let mut chars = raw.trim().chars();

        if chars.next() != Some('$') {
            return Err(ProxyTokenError::InvalidTokenStart)?;
        }
        let token = chars.collect::<String>();
        let mut token = token.split('.');
        let Some(fp_id) = token.next() else {
            return Err(ProxyTokenError::InvalidTokenComponents)?;
        };
        let data_identifier = token.join(".");

        Ok(Self {
            fp_id: FootprintUserId::from(fp_id.to_string()),
            identifier: DataIdentifier::from_str(&data_identifier).map_err(ProxyTokenError::from)?,
        })
    }
}

impl FromStr for ProxyToken {
    type Err = crate::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

impl std::fmt::Display for ProxyToken {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        format!("${}.{}", self.fp_id, self.identifier).fmt(f)
    }
}

impl paperclip::v2::schema::Apiv2Schema for ProxyToken {
    fn name() -> Option<String> {
        Some("ProxyToken".into())
    }

    fn description() -> &'static str {
        "String of format '$<fp_id>.<data_kind>.<attribute_name>'"
    }

    fn required() -> bool {
        true
    }
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum ProxyTokenError {
    #[error("missing $ from token start")]
    InvalidTokenStart,
    #[error("missing or invalid components")]
    InvalidTokenComponents,
    #[error("invalid data type identifier: {0}")]
    InvalidDataIdentifier(#[from] crate::DataIdentifierParsingError),
}
