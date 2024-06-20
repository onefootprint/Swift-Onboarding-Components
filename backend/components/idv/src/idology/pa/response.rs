use crate::idology::common::response::IDologyQualifiers;
use crate::idology::common::response::IdologyResponseHelpers;
use crate::idology::error as IdologyError;
use crate::idology::expectid::response::IdNumber;
use crate::idology::expectid::response::Restriction;
use crate::idology::IdologyError::RequestError;
use crate::ParsedResponse;

pub fn parse_response(value: serde_json::Value) -> Result<PaResponse, IdologyError::Error> {
    let response: PaResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Eq, PartialEq)]
pub struct PaResponse {
    pub response: Response,
}

impl TryFrom<ParsedResponse> for PaResponse {
    type Error = crate::Error;

    fn try_from(value: ParsedResponse) -> Result<Self, Self::Error> {
        match value {
            ParsedResponse::IDologyPa(res) => Ok(res),
            _ => Err(crate::Error::ConversionError(
                "Can't convert into PaResponse".to_owned(),
            )),
        }
    }
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default, Eq, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub struct Response {
    pub id_number: Option<IdNumber>, // TODO: move IdNumber and Restriction to `common`
    pub restriction: Option<Restriction>,
    pub qualifiers: Option<IDologyQualifiers>,
    pub error: Option<String>,
}

impl Response {
    fn error(&self) -> Option<RequestError> {
        self.error
            .clone()
            .map(IdologyResponseHelpers::parse_idology_error)
    }

    pub fn validate(&self) -> Result<(), IdologyError::Error> {
        // see if we have any errors
        if let Some(error) = self.error() {
            return Err(error.into());
        }

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_deser() {
        let json_res = json!({"response": {
            "id-number": 423154235,
            "restriction": {
                "key": "result.something",
                "message": "damn got a hit"
            }
        }
        });
        let parsed_response = parse_response(json_res).unwrap();

        assert_eq!(
            PaResponse {
                response: Response {
                    id_number: Some(423154235),
                    restriction: Some(Restriction {
                        key: Some("result.something".to_owned()),
                        message: Some("damn got a hit".to_owned()),
                        pa: None
                    }),
                    qualifiers: None,
                    error: None
                }
            },
            parsed_response
        )
    }
}
