use crate::idology::common::response::IDologyQualifiers;
use crate::idology::error as IdologyError;
use crate::idology::expectid::response::{IdNumber, Restriction};

pub fn parse_response(value: serde_json::Value) -> Result<PaResponse, IdologyError::Error> {
    let response: PaResponse = serde_json::value::from_value(value)?;
    Ok(response)
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Eq, PartialEq)]
pub struct PaResponse {
    pub response: Response,
}

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize, Default, Eq, PartialEq)]
#[serde(rename_all = "kebab-case")]
pub struct Response {
    pub id_number: Option<IdNumber>, // TODO: move IdNumber and Restriction to `common`
    pub restriction: Option<Restriction>,
    pub qualifiers: Option<IDologyQualifiers>,
}

#[cfg(test)]
mod tests {
    use serde_json::json;

    use super::*;

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
                }
            },
            parsed_response
        )
    }
}
