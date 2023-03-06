use newtypes::idology::IdologyScanOnboardingCaptureResult;

pub fn test_idology_expectid_response() -> serde_json::Value {
    serde_json::json!({
        "response": {
          "id-number": 3010453,
          "summary-result": {
            "key": "id.success",
            "message": "Pass"
          },
          "results": {
            "key": "result.match",
            "message": "ID Located"
          },
          "qualifiers": {
            "qualifier": [
              {
                "key": "resultcode.ip.not.located",
                "message": "IP Not Located"
              },
              {
                "key": "resultcode.street.name.does.not.match",
                "message": "Street name does not match"
              },
            ]
          }
        }
      }
    )
}

pub fn idology_fake_data_expectid_response() -> serde_json::Value {
    serde_json::json!({"response": {
            "id-number": 3010453,
            "summary-result": {
                "key": "id.success",
                "message": "Pass"
            },
            "results": {
                "key": "result.match",
                "message": "ID Located"
            },
            "qualifiers": {
                "qualifier": [
                    {
                        "key": "idphone.wireless",
                        "message": "Possible Wireless Number"
                    },
                    {
                        "key": "resultcode.corporate.email.domain",
                        "message": "Indicates that the domain of the email address has been identified as belonging to a corporate entity.",
                    },
                ]
            }
    }})
}
pub fn test_twilio_lookupv2_response() -> serde_json::Value {
    serde_json::json!({
      "country_code": "GB",
      "phone_number": "+447772000001",
      "national_format": "07772 000001",
      "valid": true,
      "validation_errors": null,
      "caller_name": {
          "caller_name": "Sergio Suarez",
          "caller_type": "CONSUMER",
          "error_code": null
        },
      "sim_swap": {
        "last_sim_swap": {
          "last_sim_swap_date": "2020-04-27T10:18:50Z",
          "swapped_period": "PT15282H33M44S",
          "swapped_in_period": true
        },
        "carrier_name": "Vodafone UK",
        "mobile_country_code": "276",
        "mobile_network_code": "02",
        "error_code": null
      },
      "call_forwarding": {
          "call_forwarding_status": "true",
          "carrier_name": "Vodafone UK",
          "mobile_country_code": "276",
          "mobile_network_code": "02",
          "error_code": null
        },
        "live_activity": {
          "connectivity": "connected",
          "original_carrier": {
            "name": "Vodafone",
            "mobile_country_code": "234",
            "mobile_network_code": "15"
          },
          "ported": "false",
          "ported_carrier": null,
          "roaming": "false",
          "roaming_carrier": null,
          "error_code": null
        },
      "line_type_intelligence": null,
      "url": "https://lookups.twilio.com/v2/PhoneNumbers/+447772000001"}
    )
}

pub fn socure_idplus_fake_passing_response() -> serde_json::Value {
    serde_json::json!({
       "referenceId":"1234-abcd-5678",
       "nameAddressCorrelation":{
          "reasonCodes":[],
          "score":0.01
       },
       "namePhoneCorrelation":{
          "reasonCodes":[],
          "score":0.01
       },
       "fraud":{
          "reasonCodes":[],
          "scores":[
             {
                "name":"sigma",
                "version":"1.0",
                "score":0.01
             }
          ]
       },
       "kyc":{
          "reasonCodes":[],
          "correlationIndices":{
             "nameAddressPhoneIndex":0.0,
             "nameAddressSsnIndex":0.0
          },
          "fieldValidations":{
             "firstName":0.99,
             "surName":0.99,
             "streetAddress":0.99,
             "city":0.99,
             "state":0.99,
             "zip":0.99,
             "mobileNumber":0.99,
             "dob":0.99,
             "ssn":0.99
          }
       },
       "addressRisk":{
          "reasonCodes":[],
          "score":0.01
       },
       "phoneRisk":{
          "reasonCodes":[],
          "score":0.01
       }
    })
}

pub fn scan_onboarding_fake_response(
    capture_result_key: IdologyScanOnboardingCaptureResult,
    image_errors: Option<Vec<&str>>,
) -> serde_json::Value {
    let capture_result = capture_result_key.to_string();
    if image_errors.is_none() {
        serde_json::json!({
            "response": {
                "query-id": 3010453,
                "capture-result": {
                    "key": capture_result.as_str(),
                    "message": "Completed"
                },
                "capture-decision": {
                    "key": "result.scan.capture.id.approved",
                    "message": "ID Approved"
                },
                "qualifiers": null,
                "capture-data": {
                    "first-name": "JOHN",
                    "middle-name": "A",
                    "last-name": "SMITH",
                    "last-name2": null,
                    "last-name3": null,
                    "street-address": "222333 PEACHTREE STREET",
                    "street-address2": null,
                    "street-address3": null,
                    "street-address4": null,
                    "street-address5": null,
                    "street-address6": null,
                    "city": "ATLANTA",
                    "state": "GA",
                    "zip": 303181234,
                    "country": "USA",
                    "month-of-birth": "02",
                    "day-of-birth": 28,
                    "year-of-birth": 1975,
                    "expiration-date": "02-28-2025",
                    "issuance-date": "02-01-2015",
                    "document-number": 123456789,
                    "document-type": "DL",
                    "template-type": "DL",
                    "capture-confidence-score": 100,
                    "capture-facial-match-score": null
                }
            }
        })
    } else {
        serde_json::json!({
          "response": {
            "error": image_errors
          }
        })
    }
}

pub fn fingerprint_server_api_fake_event() -> serde_json::Value {
    serde_json::json!({
      "products": {
        "identification": {
          "data": {
            "visitorId": "Ibk1527CUFmcnjLwIs4A9",
            "requestId": "0KSh65EnVoB85JBmloQK",
            "incognito": true,
            "linkedId": "somelinkedId",
            "time": "2019-05-21T16:40:13Z",
            // timestamp of the event with millisecond precision. Truncated in fake response due to i32 defaults of serde_json
            // which i didn't think it was important to fix since we are deser as i64
            "timestamp": 158229,
            "url": "https://www.example.com/login",
            "ip": "61.127.217.15",
            "ipLocation": {
              "accuracyRadius": 10,
              "latitude": 49.982,
              "longitude": 36.2566,
              "postalCode": "61202",
              "timezone": "Europe/Dusseldorf",
              "city": {
                "name": "Dusseldorf"
              },
              "continent": {
                "code": "EU",
                "name": "Europe"
              },
              "country": {
                "code": "DE",
                "name": "Germany"
              },
              "subdivisions": [
                {
                  "isoCode": "63",
                  "name": "North Rhine-Westphalia"
                }
              ],
            },
            "browserDetails": {
              "browserName": "Chrome",
              "browserMajorVersion": "74",
              "browserFullVersion": "74.0.3729",
              "os": "Windows",
              "osVersion": "7",
              "device": "Other",
              "userAgent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) ....",
            },
            "confidence": {
               "score": 0.97
            },
            "visitorFound": true,
            "firstSeenAt": {
               "global": "2022-03-16T11:26:45.362Z",
               "subscription": "2022-03-16T11:31:01.101Z"
            },
            "lastSeenAt": {
              "global": "2022-03-16T11:28:34.023Z",
              "subscription": null
            }
          }
        },
        "botd": {
          "data": {
            "bot": {
              "result": "notDetected"
            },
            "url": "https://example.com/login",
            "ip": "61.127.217.15",
            "time": "2019-05-21T16:40:13Z"
          }
        }
      }
    })
}
