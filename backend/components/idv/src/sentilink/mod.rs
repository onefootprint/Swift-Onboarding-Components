use application_risk::request::AppRiskMetadata;
use application_risk::response::ApplicationRiskResponse;
use newtypes::sentilink::SentilinkProduct;
use newtypes::vendor_credentials::SentilinkCredentials;
use newtypes::FpId;
use newtypes::IdvData;
use newtypes::PiiString;
use newtypes::WorkflowId;
use strum::EnumDiscriminants;
use strum::EnumString;

pub mod application_risk;
pub mod client;
pub mod error;
use error::Error as SentilinkError;
use newtypes::PiiJsonValue;
use newtypes::ScrubbedPiiVendorResponse;
use reqwest::StatusCode;


pub type SentilinkResult<T> = Result<T, SentilinkError>;

#[derive(EnumString, PartialEq, Eq, Debug)]
#[strum(serialize_all = "SCREAMING_SNAKE_CASE")]
pub enum SentilinkResponseStatus {
    Success,
    Partial,
    Failure,
}

#[derive(EnumDiscriminants)]
#[strum_discriminants(name(SentilinkAPIResultKind))]
pub enum SentilinkAPIResult {
    // We successfully can deserialize a 200 response
    Success(ApplicationRiskResponse),
    // We successfully can deserialize a 200 response, but there are errors in 1 or more requested products
    PartialSuccess(ApplicationRiskResponse),
    Error(SentilinkError),
}
impl SentilinkAPIResult {
    pub fn into_success(self) -> Result<ApplicationRiskResponse, SentilinkError> {
        match self {
            SentilinkAPIResult::Success(s) => Ok(s),
            SentilinkAPIResult::PartialSuccess(s) => Ok(s),
            SentilinkAPIResult::Error(e) => Err(e),
        }
    }

    pub fn scrub(&self) -> Result<ScrubbedPiiVendorResponse, SentilinkError> {
        let res = match self {
            SentilinkAPIResult::Success(s) => ScrubbedPiiVendorResponse::new(s),
            SentilinkAPIResult::PartialSuccess(s) => ScrubbedPiiVendorResponse::new(s),
            // If we have an unhandled error, there's no T to serialize
            SentilinkAPIResult::Error(_) => ScrubbedPiiVendorResponse::new(serde_json::json!({})),
        }?;

        Ok(res)
    }

    // TODO: maybe in the future we handle partial successes better
    pub fn is_error(&self) -> bool {
        !matches!(
            self,
            SentilinkAPIResult::Success(_) | SentilinkAPIResult::PartialSuccess(_)
        )
    }
}

#[derive(derive_more::Deref)]
pub struct SentilinkAPIResponse {
    #[deref]
    pub result: SentilinkAPIResult,
    pub raw_response: PiiJsonValue,
}

impl SentilinkAPIResponse {
    pub async fn from_response(response: reqwest::Response) -> Self {
        let (cl, http_status) = (response.content_length(), response.status());

        // we might get json for 200 or 4xx
        let raw_json: Result<serde_json::Value, SentilinkError> = response
            .json()
            .await
            .map_err(|e| SentilinkError::ReqwestErrorWithCode(e, http_status.as_u16()));
        match raw_json {
            Ok(j) => Self::from_value(j, http_status, cl),
            Err(e) => {
                let result = SentilinkAPIResult::Error(e);
                Self {
                    result,
                    raw_response: serde_json::json!({}).into(),
                }
            }
        }
    }

    #[allow(unused)]
    fn from_value(value: serde_json::Value, status_code: StatusCode, content_length: Option<u64>) -> Self {
        if status_code.is_success() {
            let parsed: Result<ApplicationRiskResponse, SentilinkError> =
                serde_json::from_value(value.clone()).map_err(SentilinkError::from);
            match parsed {
                Ok(deser) => {
                    let result = match deser.response_status() {
                        SentilinkResponseStatus::Success => SentilinkAPIResult::Success(deser),
                        SentilinkResponseStatus::Partial => SentilinkAPIResult::PartialSuccess(deser),
                        // we shouldn't get this case in practice
                        SentilinkResponseStatus::Failure => {
                            log_response_error(status_code, content_length, "unexpected 200 with failure");

                            SentilinkAPIResult::Error(SentilinkError::UnknownError(
                                "200 with failure response_status".to_string(),
                            ))
                        }
                    };

                    Self {
                        result,
                        raw_response: value.into(),
                    }
                }
                // We couldn't deserialize into what we wanted, so its unclear what happened
                Err(e) => {
                    log_response_error(status_code, content_length, "200 deser issue");
                    let result = SentilinkAPIResult::Error(e);
                    Self {
                        result,
                        raw_response: value.into(),
                    }
                }
            }
        } else {
            log_response_error(status_code, content_length, "error");
            let result = SentilinkAPIResult::Error(SentilinkError::HttpError(status_code.as_u16()));

            Self {
                result,
                raw_response: value.into(),
            }
        }
    }
}


pub struct SentilinkApplicationRiskRequest {
    pub idv_data: IdvData,
    pub credentials: SentilinkCredentials,
    pub products: Vec<SentilinkProduct>,
    pub workflow_id: WorkflowId,
    pub ip_address: Option<PiiString>,
    pub fp_id: FpId,
    pub metadata: Option<AppRiskMetadata>,
}


fn log_response_error(http_status: StatusCode, content_length: Option<u64>, issue: &str) {
    tracing::warn!(
        ?http_status,
        ?content_length,
        ?issue,
        "Error handling sentilink response"
    );
}


#[cfg(test)]
mod tests {
    use super::SentilinkAPIResponse;
    use crate::sentilink::SentilinkAPIResult;
    use crate::sentilink::SentilinkResponseStatus;
    use reqwest::StatusCode;
    use strum::EnumIter;
    use strum::IntoEnumIterator;


    #[derive(Clone, Copy, EnumIter)]
    enum TestCase {
        Success,
        Partial,
        ProductLevel400,
        APILevel400,
        Api401,
    }

    impl TestCase {
        fn input(&self) -> (serde_json::Value, StatusCode) {
            match self {
                TestCase::Success => (success(), StatusCode::OK),
                TestCase::Partial => (partial_200(), StatusCode::OK),
                TestCase::ProductLevel400 => (fail_product_level_400(), StatusCode::BAD_REQUEST),
                TestCase::APILevel400 => (fail_api_level_400(), StatusCode::BAD_REQUEST),
                TestCase::Api401 => (fail_401(), StatusCode::UNAUTHORIZED),
            }
        }
    }

    #[test]
    fn test_app_risk_api_response() {
        for test_case in TestCase::iter() {
            let (val, status) = test_case.input();
            let result: SentilinkAPIResponse = SentilinkAPIResponse::from_value(val, status, None);

            // We expect all the test cases as of this writing to populate a non-empty raw_response
            assert_ne!(result.raw_response.leak().clone(), serde_json::json!({}));

            match test_case {
                TestCase::Success => match result.result {
                    SentilinkAPIResult::Success(r) => {
                        assert_eq!(r.response_status(), SentilinkResponseStatus::Success);
                        assert!(r.sentilink_synthetic_score.unwrap().score().unwrap().score > 0);
                    }
                    _ => panic!("wrong result"),
                },
                TestCase::Partial => match result.result {
                    SentilinkAPIResult::PartialSuccess(r) => {
                        assert_eq!(r.response_status(), SentilinkResponseStatus::Partial)
                    }
                    _ => panic!("wrong result received"),
                },
                TestCase::ProductLevel400 | TestCase::APILevel400 | TestCase::Api401 => match result.result {
                    SentilinkAPIResult::Error(error) => match error {
                        super::error::Error::HttpError(code) => assert_eq!(code, status.as_u16()),
                        _ => panic!("wrong error"),
                    },
                    _ => panic!("wrong result"),
                },
            }
        }
    }

    fn partial_200() -> serde_json::Value {
        serde_json::json!({
            "application_id": "APP-10848",
            "customer_id": "01J7GYCK7XH7CSZXS2H106D9FA",
            "environment": "SANDBOX",
            "latency_ms": 92,
            "response_status": "PARTIAL",
            "sentilink_id_theft_score": {
                "reason_codes": [
                    {
                        "code": "R034",
                        "direction": "more_fraudy",
                        "explanation": "Length of history of the email",
                        "rank": 1
                    },
                    {
                        "code": "R029",
                        "direction": "less_fraudy",
                        "explanation": "Whether the applicant appears to be the best owner of the phone",
                        "rank": 2
                    },
                    {
                        "code": "R021",
                        "direction": "more_fraudy",
                        "explanation": "Whether the supplied phone number corresponds to a risky carrier or line type",
                        "rank": 3
                    }
                ],
                "score": 768,
                "version": "1.7.2"
            },
            "sentilink_synthetic_score": {
                "error_code": 2000,
                "errors": [
                    "ssn is required"
                ]
            },
            "timestamp": "2024-09-19T14:25:33.969369776Z",
            "transaction_id": "01J85AS3-NGA7-N7B351QZ"
        })
    }

    fn fail_product_level_400() -> serde_json::Value {
        serde_json::json!({
            "application_id": "APP-10848",
            "customer_id": "01J7GYCK7XH7CSZXS2H106D9FA",
            "environment": "SANDBOX",
            "latency_ms": 26,
            "response_status": "FAILURE",
            "sentilink_id_theft_score": {
                "error_code": 2000,
                "errors": [
                    "dob is required"
                ]
            },
            "sentilink_synthetic_score": {
                "error_code": 2000,
                "errors": [
                    "dob is required"
                ]
            },
            "timestamp": "2024-09-19T13:56:32.757660656Z",
            "transaction_id": "01J8593Z-APFF-BGJJWN8T"
        })
    }

    fn fail_api_level_400() -> serde_json::Value {
        serde_json::json!({
            "customer_id": "01J7GYCK7XH7CSZXS2H106D9FA",
            "environment": "SANDBOX",
            "transaction_id": "01J83E5Z-4M76-62HXN9BQ",
            "timestamp": "2024-09-18T20:46:32.113551286Z",
            "latency_ms": 24,
            "response_status": "FAILURE",
            "errors": [
                "no products requested"
            ],
            "error_code": 2000
        })
    }

    fn fail_401() -> serde_json::Value {
        serde_json::json!({
            "customer_id": "foo",
            "environment": "SANDBOX",
            "transaction_id": "",
            "timestamp": "2024-09-18T20:43:27.685755674Z",
            "latency_ms": 0,
            "error": "Unauthorized",
            "error_code": 1000
        })
    }

    fn success() -> serde_json::Value {
        serde_json::json!({
            "application_id": "APP-10848",
            "customer_id": "01J7GYCK7XH7CSZXS2H106D9FA",
            "environment": "SANDBOX",
            "latency_ms": 156,
            "response_status": "SUCCESS",
            "sentilink_id_theft_score": {
                "reason_codes": [
                    {
                        "code": "R034",
                        "direction": "more_fraudy",
                        "explanation": "Length of history of the email",
                        "rank": 1
                    },
                    {
                        "code": "R029",
                        "direction": "less_fraudy",
                        "explanation": "Whether the applicant appears to be the best owner of the phone",
                        "rank": 2
                    },
                    {
                        "code": "R021",
                        "direction": "more_fraudy",
                        "explanation": "Whether the supplied phone number corresponds to a risky carrier or line type",
                        "rank": 3
                    }
                ],
                "score": 85,
                "version": "1.7.2"
            },
            "sentilink_synthetic_score": {
                "reason_codes": [
                    {
                        "code": "R000",
                        "direction": "more_fraudy",
                        "explanation": "Whether the supplied name or SSN is nonsense",
                        "rank": 1
                    },
                    {
                        "code": "R008",
                        "direction": "more_fraudy",
                        "explanation": "Whether the SSN is tied to a clump of SSNs empirically used for fraud",
                        "rank": 2
                    },
                    {
                        "code": "R004",
                        "direction": "more_fraudy",
                        "explanation": "Whether the supplied SSN aligns with the consumer's DOB",
                        "rank": 3
                    }
                ],
                "score": 451,
                "version": "1.8.1"
            },
            "timestamp": "2024-09-19T18:47:53.962217803Z",
            "transaction_id": "01J85SSE-PAPV-04P4RHED"
        })
    }
}
