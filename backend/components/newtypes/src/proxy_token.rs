use std::str::FromStr;

use itertools::Itertools;

use serde_with::{DeserializeFromStr, SerializeDisplay};

use crate::{DataIdentifier, FootprintUserId, PrefixId};

///
/// The token format is as follows:
/// <fp_id>.<data_kind>.<attribute_name>
///
/// OR, if a global fp_id is known, the following is also accepted:
///
/// <data_kind>.<attribute_name>
///
/// Example:
/// fp_id_Gysdl9zxbBfrbSvfc0xCz.id.ssn9
///
/// Rules:
/// - Whitespaces are ignored
/// - Case SENSITIVE
///
///
/// Future work: support filters / transformations, i.e: :: <fp_id>.id.last_name | uppercase ::
///
#[derive(Debug, Clone, PartialEq, Eq, Hash, DeserializeFromStr, SerializeDisplay)]
pub struct ProxyToken {
    pub fp_id: FootprintUserId,
    pub identifier: DataIdentifier,
}

impl ProxyToken {
    /// parses a string into a single Proxy Token
    pub fn parse(raw: &str) -> Result<Self, crate::Error> {
        Self::parse_global(raw, None)
    }

    /// parses a string into a single Proxy Token with support for a global footprint user id
    /// in the case where just an identifier is specified
    pub fn parse_global(raw: &str, global_fp_id: Option<FootprintUserId>) -> Result<Self, crate::Error> {
        let chars = raw.trim().chars();
        let token = chars.collect::<String>();

        // accept the case where the token is just a data identifier but we have a global fp_id
        if let (Some(fp_id), Ok(identifier)) = (global_fp_id, DataIdentifier::from_str(&token)) {
            return Ok(Self { fp_id, identifier });
        }

        let mut token = token.split('.');
        let Some(fp_id) = token.next() else {
            return Err(ProxyTokenError::InvalidTokenComponents)?;
        };
        let data_identifier = token.join(".");

        Ok(Self {
            fp_id: FootprintUserId::parse_with_prefix(fp_id)?,
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
        format!("{}.{}", self.fp_id, self.identifier).fmt(f)
    }
}

impl paperclip::v2::schema::Apiv2Schema for ProxyToken {
    fn name() -> Option<String> {
        Some("ProxyToken".into())
    }

    fn description() -> &'static str {
        "String of format '<fp_id>.<data_kind>.<attribute_name>'"
    }

    fn required() -> bool {
        true
    }
}

#[derive(Debug, Clone, thiserror::Error)]
pub enum ProxyTokenError {
    #[error("missing or invalid components")]
    InvalidTokenComponents,
    #[error("invalid data type identifier: {0}")]
    InvalidDataIdentifier(#[from] crate::EnumDotNotationError),
}
