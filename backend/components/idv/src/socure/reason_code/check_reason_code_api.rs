use crate::socure::client::SocureClient;
use newtypes::SocureReasonCode;

#[derive(Debug, Eq, PartialEq)]
pub struct ReasonCodeDiscrepancies {
    pub missing_reason_codes: Vec<MissingReasonCode>,
    pub differing_description_reason_codes: Vec<DifferingDescriptionReasonCode>,
}

#[derive(Debug, Eq, PartialEq)]
pub struct MissingReasonCode {
    pub code: String,
    pub description: String,
}

#[derive(Debug, Eq, PartialEq)]
pub struct DifferingDescriptionReasonCode {
    pub code: String,
    pub api_description: String,
    pub enum_description: String,
}

pub fn compare_enum_vs_latest_api_response(res: serde_json::Value) -> ReasonCodeDiscrepancies {
    let reason_codes = res["reasonCodes"].as_object().unwrap();
    let mut missing_reason_codes: Vec<MissingReasonCode> = Vec::new();
    let mut differing_description_reason_codes: Vec<DifferingDescriptionReasonCode> = Vec::new();
    for (code, description) in reason_codes {
        let description = description.as_str().get_or_insert("").to_owned();
        match SocureReasonCode::try_from(code.as_str()) {
            Ok(existing_enum) => {
                if existing_enum.description() != description {
                    differing_description_reason_codes.push(DifferingDescriptionReasonCode {
                        code: code.clone(),
                        api_description: description,
                        enum_description: existing_enum.description(),
                    });
                }
            }
            Err(_) => {
                missing_reason_codes.push(MissingReasonCode {
                    code: code.clone(),
                    description,
                });
            }
        }
    }
    ReasonCodeDiscrepancies {
        missing_reason_codes,
        differing_description_reason_codes,
    }
}

pub async fn query_socure_reason_code_endpoint_and_compare_against_enum(
    socure_client: &SocureClient,
) -> Result<ReasonCodeDiscrepancies, crate::socure::Error> {
    let res = socure_client.reason_code().await?;
    let reason_code_discrepancies = compare_enum_vs_latest_api_response(res);
    Ok(reason_code_discrepancies)
}

#[cfg(test)]
mod tests {

    use super::compare_enum_vs_latest_api_response;
    use crate::socure::client::SocureClient;
    use crate::socure::reason_code::check_reason_code_api::DifferingDescriptionReasonCode;
    use crate::socure::reason_code::check_reason_code_api::MissingReasonCode;
    use newtypes::SocureReasonCode;
    use serde_json::json;
    use tracing_test::traced_test;

    #[test]
    fn test_compare_enum_vs_latest_api_response() {
        // code1 + code2 don't exist in enum SocureReasonCode yet
        let code1 = "X123";
        let description1 = "This is a fake reason code";
        let code2 = "X456";
        let description2 = "This is also a fake reason code";
        // code3 + code4 exist in enum SocureReasonCode but with different `description`'s
        let code3 = "I610";
        let description3 = "Phone number is whack";
        let code4 = "R601";
        let description4 = "Phone and addy are whack";
        // code 5 exisints in enum SocureReasonCode with the same `description`
        let code5 = "I203";
        let description5 = "SSN was first seen in credit header records between 5 to 10 years ago";

        let res = json!(
            {
                "referenceId": "3970085d-7bb1-49fb-bf40-58036dd620b2",
                "reasonCodes":
                {
                    code1: description1,
                    code2: description2,
                    code3: description3,
                    code4: description4,
                    code5: description5,
                }
            }
        );

        let reason_code_discrepancies = compare_enum_vs_latest_api_response(res);
        assert_eq!(
            vec![
                MissingReasonCode {
                    code: code1.to_owned(),
                    description: description1.to_owned(),
                },
                MissingReasonCode {
                    code: code2.to_owned(),
                    description: description2.to_owned(),
                }
            ],
            reason_code_discrepancies.missing_reason_codes
        );
        assert_eq!(
            vec![
                DifferingDescriptionReasonCode {
                    code: code3.to_owned(),
                    api_description: description3.to_owned(),
                    enum_description: SocureReasonCode::try_from(code3).unwrap().description()
                },
                DifferingDescriptionReasonCode {
                    code: code4.to_owned(),
                    api_description: description4.to_owned(),
                    enum_description: SocureReasonCode::try_from(code4).unwrap().description()
                }
            ],
            reason_code_discrepancies.differing_description_reason_codes
        );
    }

    #[ignore]
    #[traced_test]
    #[tokio::test]
    // This test just provides an easy adhoc way to do what we would run on app start in main.rs. We can
    // run this manually when needed to actually  ping the Socure Reason Code endpoint and compare
    // for discrepenancies in our enum.
    async fn query_reason_codes_and_compare() {
        let sdk_key = dotenv::var("SOCURE_CERTIFICATION_API_KEY").unwrap();
        let socure_client = SocureClient::new(sdk_key, false).unwrap();

        let res = socure_client.reason_code().await.unwrap();
        tracing::info!(res = format!("{:?}", res), "res");
        let reason_code_discrepancies = compare_enum_vs_latest_api_response(res);
        tracing::info!(
            reason_code_discrepancieses = format!("{:?}", reason_code_discrepancies),
            "reason_code_discrepancies"
        );
    }
}
