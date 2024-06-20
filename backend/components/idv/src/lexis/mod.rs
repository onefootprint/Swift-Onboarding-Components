pub mod client;
mod request;
pub mod response;
use self::response::FlexIdResponse;
use newtypes::PiiJsonValue;

pub fn parse_response(value: serde_json::Value) -> Result<FlexIdResponse, Error> {
    let res: FlexIdResponse = serde_json::value::from_value(value)?;
    Ok(res)
}

#[derive(Debug, thiserror::Error)]
pub enum Error {
    #[error("request error: {0}")]
    Request(#[from] reqwest::Error),
    #[error("internal reqwest error: {0}")]
    ReqwestError(#[from] ReqwestError),
    #[error("api error: {0}")]
    Api(String),
    #[error("Json error: {0}")]
    SerdeJson(#[from] serde_json::Error),
    #[error("lexis type conversion error: {0}")]
    ConversionEror(#[from] ConversionError),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
    #[error("lexis response error: {0}")]
    ResponseError(#[from] ResponseError),
    #[error("Parsable APIError {0}")]
    ErrorWithResponse(Box<ErrorWithResponse>),
}

#[derive(Debug, thiserror::Error)]
pub enum ReqwestError {
    #[error("{0}")]
    ReqwestError(#[from] reqwest::Error),
    #[error("error sending request to lexis api: {0}")]
    ReqwestSendError(String),
    #[error("error setting api headers: {0}")]
    InvalidHeader(#[from] reqwest::header::InvalidHeaderValue),
}

#[derive(Debug, thiserror::Error)]
pub enum ConversionError {
    #[error("Could not parse DOB")]
    CantParseDob,
}

#[derive(PartialEq, Eq, Clone, Debug, thiserror::Error)]
pub enum ResponseError {
    #[error("Lexis response missing `result`: {0:?}")]
    MissingResult(Box<FlexIdResponse>),
    #[error("Error: {0:?}")]
    ErrorResponse(Box<FlexIdResponse>),
    /*
    From docs for grep convenience. There's no need to really parse these as variants right now cause we wouldn't do anything programatic with these atm anyway.

    Note: This only seems to be a (small?) subset of all the actual potential errors. There are various "Fault" errors i've been able to generate that aren't found in their docs

        0 OFAC version does not support ALLV4
            Error - Minimum input fields required: please refer to your product manual
            for guidance.
            Watchlist server error
            Only Authorized Representative 1 is allowed on input with InstantID
            Business Validate Solution; please refer to your product manual for
            guidance.
            Bridger Gateway Error
        2 You need DPPA rights to see vehicle and driver license data
        3 Reports must supply DID, BDID, Unique Identifier, or ST + Vehicle Number
        11 The search is too broad
        23 License State and Number are both required for the search
        100 A SOAP connection error or a Database Error occurred
        203 Too many subjects were found
        301 Insufficient input
        302 At least three leading characters are required
        310 Incomplete address
        311 Highly-populated address
     */
}

impl Error {
    pub fn into_error_with_response(self, response: serde_json::Value) -> Self {
        Self::ErrorWithResponse(Box::new(ErrorWithResponse {
            error: self,
            response: response.into(),
        }))
    }
}

// TODO: we keep copy pasting this, should generify it and share
pub struct ErrorWithResponse {
    pub error: Error,
    pub response: PiiJsonValue,
}

impl std::fmt::Display for ErrorWithResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.error)
    }
}

impl std::fmt::Debug for ErrorWithResponse {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ErrorWithResponse")
            .field("error", &self.error)
            .field("response", &"<omitted>")
            .finish()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use serde_json::Value;

    #[test]
    #[ignore]
    fn test_parse_response() {
        // TODO
        let response_json: Value = json!({});

        let decoded_response = parse_response(response_json).expect("Failed to parse!!");
        println!("{:?}", decoded_response);
    }
}
