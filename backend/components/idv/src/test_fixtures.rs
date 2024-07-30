use chrono::NaiveDate;
use newtypes::incode::IncodeStatus;
use newtypes::ExperianAddressAndNameMatchReasonCodes;
use newtypes::ExperianSSNReasonCodes;
use newtypes::ExperianWatchlistReasonCodes;
// From: https://learn.sayari.com/mexico-national-id-number-curp/
//
// Name: Juan Carlos Hernandez Garcia
// Gender: Male
// Date of birth: May 6, 1982
// Place of birth: Ensenada, Baja California, Mexico
// Final two digits of CURP assigned by the Mexican government: 09
pub const TEST_CURP: &str = "HEGJ820506HBCRRN09";

pub fn passing_lexis_flex_id_response() -> serde_json::Value {
    serde_json::json!({
        "FlexIDResponseEx": {
          "@xmlns": "http://webservices.seisint.com/WsIdentity",
          "response": {
            "Header": {
              "QueryId": "123456",
              "Status": 0,
              "TransactionId": "12345"
            },
            "Result": {
              "BureauDeleted": false,
              "ComprehensiveVerification": {
                "ComprehensiveVerificationIndex": 50,
                "RiskIndicators": {
                  "RiskIndicator": []
                }
              },
              "CustomComprehensiveVerification": {
                "ComprehensiveVerificationIndex": 0
              },
              "EmergingId": false,
              "ITINExpired": false,
              "InputEcho": {
                "Address": {
                  "City": "San Francisco",
                  "State": "CA",
                  "StreetAddress1": "123 main street",
                  "Zip5": "94114"
                },
                "Age": 0,
                "HomePhone": "5555550100",
                "Name": {
                  "First": "Piip",
                  "Last": "Pengiun"
                },
                "SSN": "123456789"
              },
              "InstantIDVersion": "1",
              "IsPhoneCurrent": true,
              "NameAddressPhone": {
                "Summary": "12"
              },
              "NameAddressSSNSummary": 12,
              "PhoneLineDescription": "W",
              "UniqueId": "12345678",
              "ValidElementSummary": {
                "AddressCMRA": false,
                "AddressPOBox": false,
                "PassportValid": false,
                "SSNDeceased": false,
                "SSNFoundForLexID": true,
                "SSNValid": true
              },
              "VerifiedElementSummary": {
                "DOB": true,
                "DOBMatchLevel": "8",
                "Email": true
              }
            }
          }
        }
      }

    )
}

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

pub fn idology_pa_response() -> serde_json::Value {
    serde_json::json!({
        "response": {
            "error": null,
            "id-number": 4671490,
            "qualifiers": {
                "qualifier": {
                    "key": "resultcode.pa.dob.not.available",
                    "message": "PA DOB Not Available"
                }
            },
            "restriction": {
                "key": "global.watch.list",
                "message": "Patriot Act Alert",
                "pa": {
                    "list": "Politically Exposed Persons",
                    "score": 94
                }
            }
        }
    }
    )
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
pub fn experian_cross_core_response(ssn_result_code: Option<&str>, score: Option<&str>) -> serde_json::Value {
    let score = score.unwrap_or("656");
    let ssn_result_code = ssn_result_code.unwrap_or("EA");
    serde_json::json!({
        "responseHeader": {
            "requestType": "PreciseIdOnly",
            "clientReferenceId": "ExpInternal-TEST",
            "expRequestId": "RB000000003868",
            "messageTime": "2023-02-16T02:35:07Z",
            "overallResponse": {
                "decision": "ACCEPT",
                "decisionText": "Continue",
                "decisionReasons": [
                    "Continue"
                ],
                "recommendedNextActions": [],
                "spareObjects": []
            },
            "responseCode": "R0201",
            "responseType": "INFO",
            "responseMessage": "Workflow Complete.",
            "tenantID": "105408b68cde455a92e95a3eaa989e"
        },
        "clientResponsePayload": {
            "orchestrationDecisions": [
                {
                    "sequenceId": "1",
                    "decisionSource": "PreciseId",
                    "decision": "ACCEPT",
                    "decisionReasons": [
                        "Continue"
                    ],
                    "score": 656,
                    "decisionText": "Continue",
                    "nextAction": "Continue",
                    "appReference": "2243698991",
                    "decisionTime": "2023-03-06T15:15:35Z"
                }
            ],
            "decisionElements": [
                {
                    "serviceName": "PreciseId",
                    "applicantId": "APPLICANT_CONTACT_ID_1",
                    "decision": "ACC",
                    "normalizedScore": 66,
                    "score": 656,
                    "decisionText": "Accept",
                    "appReference": "2243698991",
                    "rules": [
                        {
                            "ruleId": "3401",
                            "ruleName": "glbRule01"
                        }
                    ],
                    "otherData": {
                        "json": {
                            "fraudSolutions": {
                                "response": {
                                    "products": {
                                        "preciseIDServer": experian_precise_id_response(score, None, None, Some(ssn_result_code)),
                                        "customerManagement": {
                                            "version": "1.00",
                                            "reportDate": "03062023",
                                            "reportTime": "091534",
                                            "transactionID": "PIDCM0751776122855763486765576349806",
                                            "clientTrackingID": "2243698991",
                                            "primaryResponseCode": "0000",
                                            "secondaryResponseCode": "1400",
                                            "responseCodeDesc": "PID Cust Management v1 Scores/Attributes are calculated without SSN, name, and address",
                                            "referenceText": "ExpInternal-TEST",
                                            "scoreResults": {
                                                "score": "348",
                                                "scoreFactors": {
                                                    "scoreFactor1": {
                                                        "value": "Number of SSNs, phone numbers, name/address matches",
                                                        "code": "E014"
                                                    },
                                                    "scoreFactor2": {
                                                        "value": "Number of unique transactions with same SSN or phone number",
                                                        "code": "E005"
                                                    },
                                                    "scoreFactor3": {
                                                        "value": "Number of records with same phone number and different last names",
                                                        "code": "E007"
                                                    },
                                                    "scoreFactor4": {
                                                        "value": "Number of records with current address not on file and same phone number",
                                                        "code": "E008"
                                                    }
                                                }
                                            },
                                            "attributes": {
                                                "attributes01Day": "0;0;0;0;0;0;0;0;0;0;0;0;",
                                                "attributes03Day": "0;0;0;0;0;0;0;1;0;0;0;0;1;1;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1;0;0;0;0;1;1;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;1;0;0;0;0;1;1;0;0;0;0;0;0;0;0;",
                                                "attributes07Day": "0;0;0;0;0;0;0;6;0;0;0;0;1;2;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;6;0;0;0;0;1;2;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;6;0;0;0;0;1;2;0;0;0;0;0;0;0;0;",
                                                "attributes21Day": "0;0;0;",
                                                "attributes28Day": "0;0;0;0;0;0;0;9;1;1;2;2;2;2;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;9;1;1;2;2;2;2;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;9;1;1;2;2;2;2;0;0;0;0;0;0;0;0;",
                                                "attributes90Day": "0;0;0;0;0;0;0;0;10;1;1;2;2;2;2;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;10;1;1;2;2;2;2;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;10;1;1;2;2;2;2;0;0;0;0;0;0;0;0;"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "decisions": [
                        {
                            "element": "finalDecision",
                            "value": "ACC",
                            "reason": ""
                        },
                        {
                            "element": "ienScoreFactor1",
                            "value": "E014",
                            "reason": "Number of SSNs, phone numbers, name/address matches"
                        },
                        {
                            "element": "ienScoreFactor2",
                            "value": "E005",
                            "reason": "Number of unique transactions with same SSN or phone number"
                        },
                        {
                            "element": "ienScoreFactor3",
                            "value": "E007",
                            "reason": "Number of records with same phone number and different last names"
                        },
                        {
                            "element": "ienScoreFactor4",
                            "value": "E008",
                            "reason": "Number of records with current address not on file and same phone number"
                        }
                    ],
                    "matches": [
                        {
                            "name": "pmAddressVerificationResult1",
                            "value": "AC"
                        },
                        {
                            "name": "pmPhoneVerificationResult1",
                            "value": "EB"
                        },
                        {
                            "name": "pmConsumerIDVerificationResult",
                            "value": ssn_result_code
                        },
                        {
                            "name": "pmDateOfBirthMatchResult",
                            "value": "9"
                        },
                        {
                            "name": "pmDriverLicenseVerificationResult",
                            "value": "M"
                        },
                        {
                            "name": "pmChangeOfAddressVerificationResult1",
                            "value": "N"
                        },
                        {
                            "name": "pmOFACVerificationResult",
                            "value": "1"
                        },
                        {
                            "name": "glbFSIndicator01",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator02",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator03",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator04",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator05",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator06",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator10",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator11",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator13",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator14",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator15",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator16",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator17",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator18",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator21",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator25",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator26",
                            "value": "N"
                        }
                    ],
                    "scores": [
                        {
                            "name": "preciseIDScore",
                            "score": 656,
                            "type": "score"
                        },
                        {
                            "name": "validationScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "verificationScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "fpdScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "preciseMatchScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "ienScore",
                            "score": 348,
                            "type": "score"
                        }
                    ]
                }
            ]
        },
        "originalRequestData": {
            "control": [
                {
                    "option": "PIDXML_VERSION",
                    "value": "06.00"
                },
                {
                    "option": "SUBSCRIBER_PREAMBLE",
                    "value": "TBD3"
                },
                {
                    "option": "SUBSCRIBER_OPERATOR_INITIAL",
                    "value": "OF"
                },
                {
                    "option": "SUBSCRIBER_SUB_CODE",
                    "value": "2956241"
                },
                {
                    "option": "PID_USERNAME",
                    "value": "ofp_demo"
                },
                {
                    "option": "PID_PASSWORD",
                    "value": "Y3lkamVqLTBXdXNkZS12dXJ3ZWM="
                },
                {
                    "option": "PRODUCT_OPTION",
                    "value": "01"
                },
                {
                    "option": "DETAIL_REQUEST",
                    "value": "D"
                }
            ],
            "contacts": [
                {
                    "id": "APPLICANT_CONTACT_ID_1",
                    "person": {
                        "typeOfPerson": "APPLICANT",
                        "personIdentifier": "1234",
                        "personDetails": {
                            "dateOfBirth": "1957-02-19"
                        },
                        "names": [
                            {
                                "firstName": "JOHN",
                                "middleNames": "WAKEFIELD",
                                "surName": "BREEN"
                            }
                        ]
                    },
                    "addresses": [
                        {
                            "id": "Main_Contact_Address_0",
                            "addressType": "CURRENT",
                            "street": "PO BOX 445",
                            "postTown": "APO",
                            "postal": "09061",
                            "stateProvinceCode": "AE"
                        }
                    ],
                    "telephones": [
                        {
                            "id": "Main_Phone_0",
                            "number": "+1 7818945369"
                        }
                    ],
                    "emails": [
                        {
                            "id": "MAIN_EMAIL_0",
                            "email": "John.Smith@Experian.com"
                        }
                    ],
                    "identityDocuments": [
                        {
                            "documentNumber": "666436878",
                            "documentType": "SSN"
                        }
                    ]
                }
            ],
            "application": {
                "productDetails": {
                    "productType": "WRITTEN_INSTRUCTIONS"
                },
                "applicants": [
                    {
                        "contactId": "APPLICANT_CONTACT_ID_1",
                        "applicantType": "APPLICANT"
                    }
                ]
            }
        }
    })
}

pub fn experian_precise_id_response(
    score: &str,
    precise_match_version: Option<&str>,
    precise_id_model_version: Option<&str>,
    ssn_result_code: Option<&str>,
) -> serde_json::Value {
    let ssn_result_code = ssn_result_code.unwrap_or("EA");
    serde_json::json!({
        "sessionID": "YMWK2SXF855BNZGM01HDWMW2.pidd4v-2303060915341255630306",
        "header": {
            "reportDate": "03062023",
            "reportTime": "091535",
            "productOption": "01",
            "subcode": "2956241",
            "referenceNumber": "ExpInternal-TEST"
        },
        "summary": {
            "transactionID": "2243698991",
            "finalDecision": "ACC",
            "scores": {
                "preciseIDScore": score,
                "preciseIDScorecard": precise_id_model_version.unwrap_or("IDS_V3.0"),
                "validationScore": "000000",
                "verificationScore": "000000",
                "complianceDescription": "No Compliance Code",
                "fpdscore": "000000"
            }
        },
        "preciseMatch": {
            "version": precise_match_version.unwrap_or("04.00"),
            "responseStatusCode": {
                "value": "",
                "code": "00"
            },
            "preciseMatchTransactionID": "3b636700-3a07-425d-9",
            "preciseMatchScore": "000",
            "preciseMatchDecision": {
                "value": "",
                "code": " "
            },
            "addresses": {
                "address": [
                    {
                        "summary": {
                            "verificationResult": {
                                "value": "",
                                "code": "AC"
                            },
                            "type": {
                                "value": "",
                                "code": "P "
                            },
                            "unitMismatchResult": {
                                "value": "",
                                "code": "  "
                            },
                            "highRiskResult": {
                                "value": "",
                                "code": "N "
                            },
                            "counts": {
                                "standardizedAddressReturnCount": 0,
                                "residentialAddressMatchCount": 3,
                                "residentialAddressReturnCount": 2,
                                "highRiskAddressReturnCount": 0,
                                "businessAddressMatchCount": 0,
                                "businessAddressReturnCount": 0
                            }
                        },
                        "detail": {
                            "standardizedAddressRcd": {
                                "surname": "BREEN",
                                "firstName": "JOHN",
                                "middle": "W",
                                "address": "PO BOX 445",
                                "city": "APO",
                                "state": "AE",
                                "zipCode": "09061"
                            },
                            "residentialAddressRcd": [
                                {
                                    "surname": "BREEN",
                                    "firstName": "JOHN",
                                    "middle": "W",
                                    "aliasName": [],
                                    "address": "445",
                                    "city": "APO",
                                    "state": "AE",
                                    "zipCode": "09061",
                                    "areaCode": "781",
                                    "phone": "8945369",
                                    "monthsAtResidence": "0048",
                                    "lastUpdatedDate": "20080222"
                                },
                                {
                                    "surname": "BREEN",
                                    "firstName": "JOHN",
                                    "aliasName": [],
                                    "address": "PO BOX",
                                    "city": "APO",
                                    "state": "AE",
                                    "zipCode": "09061",
                                    "lastUpdatedDate": "20120820"
                                }
                            ],
                            "highRiskAddressRcd": [],
                            "highRiskAddressDescription": [
                                {
                                    "highRiskDescription": "No high risk business at address/phone"
                                }
                            ],
                            "businessAddressRcd": []
                        }
                    }
                ]
            },
            "phones": {
                "phone": [
                    {
                        "summary": {
                            "verificationResult": {
                                "value": "",
                                "code": "EB"
                            },
                            "classification": {
                                "value": "",
                                "code": "LM"
                            },
                            "highRiskResult": {
                                "value": "",
                                "code": "N"
                            },
                            "counts": {
                                "residentialPhoneMatchCount": 2,
                                "residentialPhoneReturnCount": 2,
                                "highRiskPhoneReturnCount": 0,
                                "businessPhoneMatchCount": 1,
                                "businessPhoneReturnCount": 1
                            }
                        },
                        "detail": {
                            "residentialPhoneRcd": [
                                {
                                    "surname": "BREEN",
                                    "firstName": "JOHN",
                                    "middle": "W",
                                    "aliasName": [],
                                    "address": "445",
                                    "city": "APO",
                                    "state": "AE",
                                    "zipCode": "09061",
                                    "areaCode": "781",
                                    "phone": "8945369",
                                    "monthsAtResidence": "0048",
                                    "lastUpdatedDate": "20080222"
                                },
                                {
                                    "surname": "BREEN KAREN",
                                    "firstName": "JOHN",
                                    "middle": "W",
                                    "aliasName": [],
                                    "address": "PO BOX",
                                    "city": "APO",
                                    "state": "AE",
                                    "zipCode": "09061",
                                    "zipPlus4": "0000",
                                    "areaCode": "781",
                                    "phone": "8945369",
                                    "lastUpdatedDate": "20131220"
                                }
                            ],
                            "phoneHighRiskRcd": [],
                            "highRiskPhoneDescription": [
                                {
                                    "highRiskDescription": "No high risk business at address/phone"
                                }
                            ],
                            "businessPhoneRcd": [
                                {
                                    "address": "PO BOX 445",
                                    "city": "APO",
                                    "state": "AE",
                                    "zipCode": "09061",
                                    "areaCode": "781",
                                    "phone": "8945369"
                                }
                            ]
                        }
                    }
                ]
            },
            "consumerID": {
                "summary": {
                    "verificationResult": {
                        "value": "",
                        "code": ssn_result_code
                    },
                    "deceasedResult": {
                        "value": "",
                        "code": "N"
                    },
                    "formatResult": {
                        "value": "",
                        "code": "V"
                    },
                    "issueResult": {
                        "value": "",
                        "code": "C"
                    },
                    "counts": {
                        "consumerIDReturnCount": 2
                    }
                },
                "detail": {
                    "consumerIDRcd": [
                        {
                            "surname": "BREEN",
                            "firstName": "JOHN",
                            "aliasName": [],
                            "address": "4528 W VALLEY CT",
                            "city": "ARCATA",
                            "state": "CA",
                            "areaCode": "781",
                            "phone": "8945369",
                            "reportedDate": "20060524",
                            "lastUpdatedDate": "20060524"
                        },
                        {
                            "surname": "SWARTZ",
                            "firstName": "SEAN",
                            "middle": "C",
                            "aliasName": [],
                            "address": "340 COPENHAFFER RD",
                            "city": "YORK",
                            "state": "PA",
                            "zipCode": "17404",
                            "zipPlus4": "8402",
                            "reportedDate": "19890901",
                            "lastUpdatedDate": "20051113"
                        }
                    ]
                }
            },
            "dateOfBirth": {
                "summary": {
                    "matchResult": {
                        "value": "",
                        "code": "9"
                    },
                    "monthOfBirth": "02",
                    "dayOfBirth": "19",
                    "yearOfBirth": "1957"
                }
            },
            "driverLicense": {
                "summary": {
                    "verificationResult": {
                        "value": "",
                        "code": "M"
                    },
                    "formatValidation": {
                        "value": "",
                        "code": " "
                    }
                }
            },
            "changeOfAddresses": {
                "changeOfAddress": [
                    {
                        "summary": {
                            "verificationResult": {
                                "value": "",
                                "code": "N "
                            },
                            "counts": {
                                "changeOfAddressReturnCount": 0
                            }
                        }
                    }
                ]
            },
            "ofac": {
                "summary": {
                    "verificationResult": {
                        "value": "",
                        "code": "1 "
                    },
                    "counts": {
                        "ofacReturnCount": 0
                    }
                }
            },
            "previousAddresses": {
                "previousAddress": [
                    {
                        "summary": {
                            "counts": {
                                "previousAddressReturnCount": 1
                            }
                        },
                        "detail": {
                            "previousAddressRcd": [
                                {
                                    "address": "1335 N CLAYTON ST",
                                    "city": "WILMINGTON",
                                    "state": "DE",
                                    "zipCode": "19806",
                                    "zipPlus4": "4003",
                                    "reportedDate": "20051214",
                                    "lastUpdatedDate": "20051214"
                                }
                            ]
                        }
                    }
                ]
            },
            "ssnfinder": {
                "summary": {
                    "counts": {
                        "ssnfinderReturnCount": 0
                    }
                }
            }
        },
        "ipAddress": {
            "ipAddressMatchZipCode": {
                "value": "",
                "code": " "
            },
            "ipAddressMatchState": {
                "value": "",
                "code": " "
            },
            "ipAddressMatchCity": {
                "value": "",
                "code": " "
            },
            "ipAddressMatchCountry": {
                "value": "",
                "code": " "
            }
        },
        "pidxmlversion": "06.00",
        "glbDetail": {
            "fraudShield": {
                "indicator": [
                    {
                        "value": "N",
                        "code": "01"
                    },
                    {
                        "value": "N",
                        "code": "02"
                    },
                    {
                        "value": "N",
                        "code": "03"
                    },
                    {
                        "value": "N",
                        "code": "04"
                    },
                    {
                        "value": "N",
                        "code": "05"
                    },
                    {
                        "value": "N",
                        "code": "06"
                    },
                    {
                        "value": "N",
                        "code": "10"
                    },
                    {
                        "value": "N",
                        "code": "11"
                    },
                    {
                        "value": "N",
                        "code": "13"
                    },
                    {
                        "value": "N",
                        "code": "14"
                    },
                    {
                        "value": "N",
                        "code": "15"
                    },
                    {
                        "value": "N",
                        "code": "16"
                    },
                    {
                        "value": "N",
                        "code": "17"
                    },
                    {
                        "value": "N",
                        "code": "18"
                    },
                    {
                        "value": "N",
                        "code": "21"
                    },
                    {
                        "value": "N",
                        "code": "25"
                    },
                    {
                        "value": "N",
                        "code": "26"
                    }
                ]
            },
            "glbRules": {
                "glbRule": [
                    {
                        "value": "",
                        "code": "1234"
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    },
                    {
                        "value": "",
                        "code": "    "
                    }
                ]
            }
        }
    })
}

pub fn cross_core_response_with_fraud_shield_codes(
    address_code: ExperianAddressAndNameMatchReasonCodes,
    ssn_code: ExperianSSNReasonCodes,
    watchlist_code: ExperianWatchlistReasonCodes,
) -> serde_json::Value {
    serde_json::json!({
        "responseHeader": {
            "requestType": "PreciseIdOnly",
            "clientReferenceId": "ExpInternal-TEST",
            "expRequestId": "RB000000013465",
            "messageTime": "2023-04-16T02:35:07Z",
            "overallResponse": {
                "decision": "REFER",
                "decisionText": "Continue & Investigate",
                "decisionReasons": [
                    "Continue & Investigate"
                ],
                "recommendedNextActions": [],
                "spareObjects": []
            },
            "responseCode": "R0201",
            "responseType": "INFO",
            "responseMessage": "Workflow Complete.",
            "tenantID": "105408b68cde455a92e95a3eaa989e"
        },
        "clientResponsePayload": {
            "orchestrationDecisions": [
                {
                    "sequenceId": "1",
                    "decisionSource": "PreciseId",
                    "decision": "REFER",
                    "decisionReasons": [
                        "Continue & Investigate"
                    ],
                    "score": 269,
                    "decisionText": "Continue & Investigate",
                    "nextAction": "Continue",
                    "appReference": "2250516834",
                    "decisionTime": "2023-04-28T18:35:38Z"
                }
            ],
            "decisionElements": [
                {
                    "serviceName": "PreciseId",
                    "applicantId": "APPLICANT_CONTACT_ID_1",
                    "decision": "R20",
                    "normalizedScore": 27,
                    "score": 269,
                    "decisionText": "Refer",
                    "appReference": "2250516834",
                    "rules": [
                        {
                            "ruleId": "3403",
                            "ruleName": "glbRule01"
                        },
                        {
                            "ruleId": "1015",
                            "ruleName": "glbRule02"
                        },
                        {
                            "ruleId": "1009",
                            "ruleName": "glbRule03"
                        },
                        {
                            "ruleId": "1017",
                            "ruleName": "glbRule04"
                        },
                        {
                            "ruleId": "3201",
                            "ruleName": "glbRule05"
                        },
                        {
                            "ruleId": "3402",
                            "ruleName": "glbRule06"
                        }
                    ],
                    "otherData": {
                        "json": {
                            "fraudSolutions": {
                                "response": {
                                    "products": {
                                        "preciseIDServer": {
                                            "sessionID": "PB47EFFK8YETQSBAKLP7PGNX.pidd2v-23042813353781977586",
                                            "header": {
                                                "reportDate": "04282023",
                                                "reportTime": "133538",
                                                "productOption": "01",
                                                "subcode": "2956241",
                                                "referenceNumber": "ExpInternal-TEST"
                                            },
                                            "summary": {
                                                "transactionID": "2250516834",
                                                "finalDecision": "R20",
                                                "scores": {
                                                    "preciseIDScore": "269",
                                                    "preciseIDScorecard": "IDS_V3.0",
                                                    "validationScore": "000000",
                                                    "verificationScore": "000000",
                                                    "complianceDescription": "No Compliance Code",
                                                    "fpdscore": "000000"
                                                }
                                            },
                                            "preciseMatch": {
                                                "version": "02.00",
                                                "responseStatusCode": {
                                                    "value": "",
                                                    "code": "00"
                                                },
                                                "preciseMatchTransactionID": "123ab111-4d47-486d-a",
                                                "preciseMatchScore": "000",
                                                "preciseMatchDecision": {
                                                    "value": "",
                                                    "code": " "
                                                },
                                                "addresses": {
                                                    "address": [
                                                        {
                                                            "summary": {
                                                                "verificationResult": {
                                                                    "value": "",
                                                                    "code": "A1"
                                                                },
                                                                "type": {
                                                                    "value": "",
                                                                    "code": "N "
                                                                },
                                                                "unitMismatchResult": {
                                                                    "value": "",
                                                                    "code": "  "
                                                                },
                                                                "highRiskResult": {
                                                                    "value": "",
                                                                    "code": "N "
                                                                },
                                                                "counts": {
                                                                    "standardizedAddressReturnCount": 1,
                                                                    "residentialAddressMatchCount": 1,
                                                                    "residentialAddressReturnCount": 1,
                                                                    "highRiskAddressReturnCount": 0,
                                                                    "businessAddressMatchCount": 0,
                                                                    "businessAddressReturnCount": 0
                                                                }
                                                            },
                                                            "detail": {
                                                                "standardizedAddressRcd": {
                                                                    "surname": "KURTH",
                                                                    "firstName": "BRIAN",
                                                                    "middle": "P",
                                                                    "address": "2010 SAINT NAZAIRE BLVD",
                                                                    "city": "HOMESTEAD",
                                                                    "state": "FL",
                                                                    "zipCode": "33039",
                                                                    "zipPlus4": "0001"
                                                                },
                                                                "residentialAddressRcd": [
                                                                    {
                                                                        "surname": "KURTH",
                                                                        "firstName": "BRIAN",
                                                                        "aliasName": [],
                                                                        "address": "2010 SAINT NAZAIRE BLVD",
                                                                        "city": "HOMESTEAD",
                                                                        "state": "FL",
                                                                        "zipCode": "33039"
                                                                    }
                                                                ],
                                                                "highRiskAddressRcd": [],
                                                                "highRiskAddressDescription": [
                                                                    {
                                                                        "highRiskDescription": "No high risk business at address/phone"
                                                                    }
                                                                ],
                                                                "businessAddressRcd": []
                                                            }
                                                        }
                                                    ]
                                                },
                                                "phones": {
                                                    "phone": [
                                                        {
                                                            "summary": {
                                                                "verificationResult": {
                                                                    "value": "",
                                                                    "code": "EA"
                                                                },
                                                                "classification": {
                                                                    "value": "",
                                                                    "code": "L"
                                                                },
                                                                "highRiskResult": {
                                                                    "value": "",
                                                                    "code": "N"
                                                                },
                                                                "counts": {
                                                                    "residentialPhoneMatchCount": 0,
                                                                    "residentialPhoneReturnCount": 0,
                                                                    "highRiskPhoneReturnCount": 0,
                                                                    "businessPhoneMatchCount": 0,
                                                                    "businessPhoneReturnCount": 0
                                                                }
                                                            },
                                                            "detail": {
                                                                "residentialPhoneRcd": [],
                                                                "phoneHighRiskRcd": [],
                                                                "highRiskPhoneDescription": [
                                                                    {
                                                                        "highRiskDescription": "No high risk business at address/phone"
                                                                    }
                                                                ],
                                                                "businessPhoneRcd": []
                                                            }
                                                        }
                                                    ]
                                                },
                                                "consumerID": {
                                                    "summary": {
                                                        "verificationResult": {
                                                            "value": "",
                                                            "code": ssn_code.to_string()
                                                        },
                                                        "deceasedResult": {
                                                            "value": "",
                                                            "code": "N"
                                                        },
                                                        "formatResult": {
                                                            "value": "",
                                                            "code": "V"
                                                        },
                                                        "issueResult": {
                                                            "value": "",
                                                            "code": "C"
                                                        },
                                                        "counts": {
                                                            "consumerIDReturnCount": 1
                                                        }
                                                    },
                                                    "detail": {
                                                        "consumerIDRcd": [
                                                            {
                                                                "surname": "KURTH",
                                                                "firstName": "BRIAN",
                                                                "middle": "P",
                                                                "aliasName": [],
                                                                "address": "2010 SAINT NAZAIRE BLVD",
                                                                "city": "HOMESTEAD",
                                                                "state": "FL",
                                                                "areaCode": "301",
                                                                "phone": "3246413",
                                                                "reportedDate": "20050418",
                                                                "lastUpdatedDate": "20060620"
                                                            }
                                                        ]
                                                    }
                                                },
                                                "dateOfBirth": {
                                                    "summary": {
                                                        "matchResult": {
                                                            "value": "",
                                                            "code": "8"
                                                        },
                                                        "yearOfBirth": "1963"
                                                    }
                                                },
                                                "driverLicense": {
                                                    "summary": {
                                                        "verificationResult": {
                                                            "value": "",
                                                            "code": "M"
                                                        },
                                                        "formatValidation": {
                                                            "value": "",
                                                            "code": " "
                                                        }
                                                    }
                                                },
                                                "changeOfAddresses": {
                                                    "changeOfAddress": [
                                                        {
                                                            "summary": {
                                                                "verificationResult": {
                                                                    "value": "",
                                                                    "code": "N "
                                                                },
                                                                "counts": {
                                                                    "changeOfAddressReturnCount": 0
                                                                }
                                                            }
                                                        }
                                                    ]
                                                },
                                                "ofac": {
                                                    "summary": {
                                                        "verificationResult": {
                                                            "value": "",
                                                            "code": "1 "
                                                        },
                                                        "counts": {
                                                            "ofacReturnCount": 0
                                                        }
                                                    }
                                                },
                                                "previousAddresses": {
                                                    "previousAddress": [
                                                        {
                                                            "summary": {
                                                                "counts": {
                                                                    "previousAddressReturnCount": 2
                                                                }
                                                            },
                                                            "detail": {
                                                                "previousAddressRcd": [
                                                                    {
                                                                        "address": "PO BOX 10244",
                                                                        "city": "POMPANO BEACH",
                                                                        "state": "FL",
                                                                        "zipCode": "33061",
                                                                        "zipPlus4": "6244",
                                                                        "reportedDate": "20060321",
                                                                        "lastUpdatedDate": "20060321"
                                                                    },
                                                                    {
                                                                        "address": "135 FALLS RD",
                                                                        "city": "BEAUFORT",
                                                                        "state": "SC",
                                                                        "zipCode": "29906",
                                                                        "zipPlus4": "6221",
                                                                        "reportedDate": "20040614",
                                                                        "lastUpdatedDate": "20060227"
                                                                    }
                                                                ]
                                                            }
                                                        }
                                                    ]
                                                },
                                                "ssnfinder": {
                                                    "summary": {
                                                        "counts": {
                                                            "ssnfinderReturnCount": 0
                                                        }
                                                    }
                                                }
                                            },
                                            "pidxmlversion": "06.00",
                                            "glbDetail": {
                                                "fraudShield": {
                                                    "indicator": [
                                                        {
                                                            "value": "N",
                                                            "code": "01"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "02"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "03"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "04"
                                                        },
                                                        {
                                                            "value": "Y", // I manually changed this to generate FRCs
                                                            "code": "05"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "06"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "10"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "11"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "13"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "14"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "15"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "16"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "17"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "18"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "21"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "25"
                                                        },
                                                        {
                                                            "value": "N",
                                                            "code": "26"
                                                        }
                                                    ]
                                                },
                                                "glbRules": {
                                                    "glbRule": [
                                                        {
                                                            "value": "",
                                                            "code": "3403"
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "1015"
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "1009"
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "1017"
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "3201"
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "3402"
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        },
                                                        {
                                                            "value": "",
                                                            "code": "    "
                                                        }
                                                    ]
                                                }
                                            },
                                            "ipAddress": {
                                                "ipAddressMatchCountry": {
                                                    "value": "",
                                                    "code": " "
                                                },
                                                "ipAddressMatchState": {
                                                    "value": "",
                                                    "code": " "
                                                },
                                                "ipAddressMatchCity": {
                                                    "value": "",
                                                    "code": " "
                                                },
                                                "ipAddressMatchZipCode": {
                                                    "value": "",
                                                    "code": " "
                                                }
                                            }
                                        },
                                        "customerManagement": {
                                            "version": "1.00",
                                            "reportDate": "04282023",
                                            "reportTime": "133537",
                                            "transactionID": "PIDCM0757440541671513783227151379716",
                                            "clientTrackingID": "2250516834",
                                            "primaryResponseCode": "0000",
                                            "secondaryResponseCode": "1300",
                                            "responseCodeDesc": "PID Cust Management v1 Scores/Attributes are calculated without SSN",
                                            "referenceText": "ExpInternal-TEST",
                                            "scoreResults": {
                                                "score": "150",
                                                "scoreFactors": {
                                                    "scoreFactor1": {
                                                        "value": "Number of records with same phone number and different last names",
                                                        "code": "E007"
                                                    },
                                                    "scoreFactor2": {
                                                        "value": "Number of SSNs, phone numbers, name/address matches",
                                                        "code": "E014"
                                                    },
                                                    "scoreFactor3": {
                                                        "value": "Number of records with same name and address, and different phone numbers",
                                                        "code": "E010"
                                                    },
                                                    "scoreFactor4": {
                                                        "value": "Number of records with current address not on file and same phone number",
                                                        "code": "E008"
                                                    }
                                                }
                                            },
                                            "attributes": {
                                                "attributes01Day": "0;0;0;0;0;0;0;0;0;0;0;0;",
                                                "attributes03Day": "0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;0;",
                                                "attributes07Day": "0;0;0;0;0;0;0;5;5;5;0;0;1;1;4;0;4;0;0;1;1;1;0;0;0;0;0;0;0;5;5;5;0;0;1;1;4;0;4;0;0;1;1;1;0;0;0;0;0;0;0;5;5;5;0;0;1;1;4;0;4;0;0;1;1;1;",
                                                "attributes21Day": "0;0;0;",
                                                "attributes28Day": "0;0;0;0;0;0;0;8;8;8;2;2;2;2;4;0;4;0;0;1;1;1;0;0;0;0;0;0;0;8;8;8;2;2;2;2;4;0;4;0;0;1;1;1;0;0;0;0;0;0;0;8;8;8;2;2;2;2;4;0;4;0;0;1;1;1;",
                                                "attributes90Day": "0;0;0;0;0;0;0;0;10;10;10;2;2;2;2;6;0;6;0;0;1;2;2;0;0;0;0;0;0;0;0;10;10;10;2;2;2;2;6;0;6;0;0;1;1;2;0;0;0;0;0;0;0;0;10;10;10;2;2;2;2;6;1;6;0;0;2;2;2;"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    "decisions": [
                        {
                            "element": "finalDecision",
                            "value": "R20",
                            "reason": ""
                        },
                        {
                            "element": "ienScoreFactor1",
                            "value": "E007",
                            "reason": "Number of records with same phone number and different last names"
                        },
                        {
                            "element": "ienScoreFactor2",
                            "value": "E014",
                            "reason": "Number of SSNs, phone numbers, name/address matches"
                        },
                        {
                            "element": "ienScoreFactor3",
                            "value": "E010",
                            "reason": "Number of records with same name and address, and different phone numbers"
                        },
                        {
                            "element": "ienScoreFactor4",
                            "value": "E008",
                            "reason": "Number of records with current address not on file and same phone number"
                        }
                    ],
                    "matches": [
                        {
                            "name": "pmAddressVerificationResult1",
                            "value": address_code.to_string()
                        },
                        {
                            "name": "pmPhoneVerificationResult1",
                            "value": "NX"
                        },
                        {
                            "name": "pmConsumerIDVerificationResult",
                            "value": "Y"
                        },
                        {
                            "name": "pmDateOfBirthMatchResult",
                            "value": "8"
                        },
                        {
                            "name": "pmDriverLicenseVerificationResult",
                            "value": "M"
                        },
                        {
                            "name": "pmChangeOfAddressVerificationResult1",
                            "value": "N"
                        },
                        {
                            "name": "pmOFACVerificationResult",
                            "value": watchlist_code.to_string(),
                        },
                        {
                            "name": "glbFSIndicator01",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator02",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator03",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator04",
                            "value": "Y"
                        },
                        {
                            "name": "glbFSIndicator05",
                            "value": "Y" // I manually changed this to generate FRCs
                        },
                        {
                            "name": "glbFSIndicator06",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator10",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator11",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator13",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator14",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator15",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator16",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator17",
                            "value": "Y"
                        },
                        {
                            "name": "glbFSIndicator18",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator21",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator25",
                            "value": "N"
                        },
                        {
                            "name": "glbFSIndicator26",
                            "value": "Y"
                        }
                    ],
                    "scores": [
                        {
                            "name": "preciseIDScore",
                            "score": 269,
                            "type": "score"
                        },
                        {
                            "name": "validationScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "verificationScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "fpdScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "preciseMatchScore",
                            "score": 0,
                            "type": "score"
                        },
                        {
                            "name": "ienScore",
                            "score": 150,
                            "type": "score"
                        }
                    ]
                }
            ]
        },
        "originalRequestData": {
            "control": [
                {
                    "option": "PIDXML_VERSION",
                    "value": "06.00"
                },
                {
                    "option": "SUBSCRIBER_PREAMBLE",
                    "value": "TBD3"
                },
                {
                    "option": "SUBSCRIBER_OPERATOR_INITIAL",
                    "value": "OF"
                },
                {
                    "option": "SUBSCRIBER_SUB_CODE",
                    "value": "2956241"
                },
                {
                    "option": "PID_USERNAME",
                    "value": "ofp_demo"
                },
                {
                    "option": "PID_PASSWORD",
                    "value": "Y3lkamVqLTBXdXNkZS12dXJ3ZWM="
                },
                {
                    "option": "PRODUCT_OPTION",
                    "value": "01"
                },
                {
                    "option": "DETAIL_REQUEST",
                    "value": "D"
                }
            ],
            "contacts": [
                {
                    "id": "APPLICANT_CONTACT_ID_1",
                    "person": {
                        "typeOfPerson": "APPLICANT",
                        "personIdentifier": "1234",
                        "personDetails": {
                            "dateOfBirth": "1963-01-01"
                        },
                        "names": [
                            {
                                "firstName": "BRIAN",
                                "middleNames": "P",
                                "surName": "KURTH"
                            }
                        ]
                    },
                    "addresses": [
                        {
                            "id": "Main_Contact_Address_0",
                            "addressType": "CURRENT",
                            "street": "2010 SAINT NAZAIRE BLVD",
                            "postTown": "HOMESTEAD",
                            "postal": "33039",
                            "stateProvinceCode": "FL"
                        }
                    ],
                    "telephones": [
                        {
                            "id": "Main_Phone_0",
                            "number": "+1 7818945369"
                        }
                    ],
                    "emails": [
                        {
                            "id": "MAIN_EMAIL_0",
                            "email": "John.Smith@Experian.com"
                        }
                    ],
                    "identityDocuments": [
                        {
                            "documentNumber": "666810987",
                            "documentType": "SSN"
                        }
                    ]
                }
            ],
            "application": {
                "productDetails": {
                    "productType": "WRITTEN_INSTRUCTIONS"
                },
                "applicants": [
                    {
                        "contactId": "APPLICANT_CONTACT_ID_1",
                        "applicantType": "APPLICANT"
                    }
                ]
            }
        }
    })
}

pub fn middesk_business_response() -> serde_json::Value {
    serde_json::json!({
        "object": "business",
        "id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
        "external_id": null,
        "name": "Waffle House",
        "created_at": "2023-04-13T22:10:39.065Z",
        "updated_at": "2023-04-13T22:10:43.057Z",
        "status": "in_review",
        "tags":
        [],
        "requester":
        {
            "id": "d34f4ef7-7a67-4772-b4a1-b19853e1a5a7",
            "type": "account",
            "name": "Footprint",
            "requested_at": "2023-04-13T22:10:39.138Z"
        },
        "assignee_id": "d21f6f81-9865-4c1c-8b24-f9ce64b2d469",
        "supported_document_types":
        [
            "Articles of Incorporation",
            "Certificate of Good Standing"
        ],
        "review":
        {
            "object": "review",
            "id": "4348eb22-22ba-4fa0-a30e-baf13a08f90e",
            "created_at": "2023-04-13T22:10:39.897Z",
            "updated_at": "2023-04-13T22:10:40.115Z",
            "completed_at": null,
            "tasks":
            [
                {
                    "category": "name",
                    "key": "dba_name",
                    "label": "DBA Name",
                    "message": "Unable to identify a match to the submitted DBA Name",
                    "name": "name",
                    "status": "failure",
                    "sub_label": "Unverified",
                    "sources":
                    []
                },
                {
                    "category": "people",
                    "key": "person_verification",
                    "label": "People",
                    "message": "Unable to identify a match to the submitted person",
                    "name": "people",
                    "status": "failure",
                    "sub_label": "Unverified",
                    "sources":
                    []
                },
                {
                    "category": "tin",
                    "key": "tin",
                    "label": "TIN Match",
                    "message": "The IRS does not have a record for the submitted TIN and Business Name combination",
                    "name": "tin",
                    "status": "failure",
                    "sub_label": "Not Found",
                    "sources": []
                },
                {
                    "category": "phone",
                    "key": "phone",
                    "label": "Phone Number",
                    "message": "Unable to verify the submitted Phone Number",
                    "name": "phone",
                    "status": "warning",
                    "sub_label": "Unverified",
                    "sources":
                    []
                },
                {
                    "category": "name",
                    "key": "name",
                    "label": "Business Name",
                    "message": "Match identified to the submitted Business Name",
                    "name": "name",
                    "status": "success",
                    "sub_label": "Verified",
                    "sources":
                    [
                        {
                            "id": "eada8258-c0b0-44c4-987b-2bc21d8d5327",
                            "type": "name",
                            "metadata":
                            {
                                "name": "Waffle House",
                                "submitted": true
                            }
                        }
                    ]
                },
                {
                    "category": "address",
                    "key": "address_verification",
                    "label": "Office Address",
                    "message": "Match identified to the submitted Office Address",
                    "name": "address",
                    "status": "success",
                    "sub_label": "Verified",
                    "sources":
                    [
                        {
                            "id": "3249db39-843b-4381-b6d6-f8d4785fbe87",
                            "type": "address",
                            "metadata":
                            {
                                "city": "Monrovia",
                                "state": "CA",
                                "submitted": true,
                                "postal_code": "91016",
                                "full_address": "123 Bob St, Monrovia, CA 91016",
                                "address_line1": "123 Bob St",
                                "address_line2": null
                            }
                        }
                    ]
                },
                {
                    "category": "address",
                    "key": "address_deliverability",
                    "label": "Office Address",
                    "message": "The USPS is able to deliver mail to the submitted Office Address",
                    "name": "address",
                    "status": "success",
                    "sub_label": "Deliverable",
                    "sources":
                    []
                },
                {
                    "category": "address",
                    "key": "address_property_type",
                    "label": "Office Address",
                    "message": "Submitted Office Address is a Commercial property",
                    "name": "address",
                    "status": "success",
                    "sub_label": "Commercial",
                    "sources":
                    []
                },
                {
                    "category": "sos",
                    "key": "sos_match",
                    "label": "SOS Filings",
                    "message": "The business is Active in the state of the submitted Office Address",
                    "name": "sos",
                    "status": "success",
                    "sub_label": "Submitted Active",
                    "sources":
                    []
                },
                {
                    "category": "sos",
                    "key": "sos_active",
                    "label": "SOS Filings",
                    "message": "1 of 1 filings are Active",
                    "name": "sos",
                    "status": "success",
                    "sub_label": "Active",
                    "sources":
                    []
                },
                {
                    "category": "sos",
                    "key": "sos_domestic_sub_status",
                    "label": "SOS Domestic Sub‑status",
                    "message": "The domestic registration is in Good Standing.",
                    "name": "sos",
                    "status": "success",
                    "sub_label": "Good Standing",
                    "sources":
                    []
                },
                {
                    "category": "sos",
                    "key": "sos_domestic",
                    "label": "SOS Filings",
                    "message": "Active domestic filing found",
                    "name": "sos",
                    "status": "success",
                    "sub_label": "Domestic Active",
                    "sources":
                    []
                },
                {
                    "category": "watchlist",
                    "key": "watchlist",
                    "label": "Watchlist",
                    "message": "No Watchlist hits were identified",
                    "name": "watchlist",
                    "status": "success",
                    "sub_label": "No Hits",
                    "sources":
                    []
                },
                {
                    "category": "industry",
                    "key": "industry",
                    "label": "True Industry",
                    "message": "This business likely does not operate in a high risk industry",
                    "name": "industry",
                    "status": "success",
                    "sub_label": "No Hits",
                    "sources":
                    []
                },
                {
                    "category": "website",
                    "key": "website_status",
                    "label": "Website",
                    "message": "Website was Online when the business record was ordered",
                    "name": "website",
                    "status": "success",
                    "sub_label": "Online",
                    "sources":
                    []
                },
                {
                    "category": "website",
                    "key": "website_verification",
                    "label": "Website",
                    "message": "Successfully found entity details on the submitted Website",
                    "name": "website",
                    "status": "success",
                    "sub_label": "Verified",
                    "sources":
                    []
                },
                {
                    "category": "bankruptcies",
                    "key": "bankruptcies",
                    "label": "Bankruptcies",
                    "message": "The business has no bankruptcy filings",
                    "name": "bankruptcies",
                    "status": "success",
                    "sub_label": "None Found",
                    "sources":
                    []
                }
            ],
            "assignee":
            {
                "object": "user",
                "id": "d21f6f81-9865-4c1c-8b24-f9ce64b2d469",
                "name": "Eli Wachs",
                "email": "eli@onefootprint.com",
                "roles":
                [
                    "admin",
                    "member"
                ],
                "image_url": "//www.gravatar.com/avatar/13102acff7b53fdc51ce7f9a27ac82bf?s=64&d=https%3A%2F%2Fapp-sandbox.middesk.com%2Fimages%2Fdefault-avatar.png",
                "last_login_at": null,
                "settings":
                {
                    "receives_agent_emails": false
                }
            }
        },
        "tin": null,
        "business_batch_id": null,
        "formation":
        {
            "entity_type": "CORPORATION",
            "formation_date": "2020-02-24",
            "formation_state": "CA",
            "created_at": "2023-04-13T22:10:39.613Z",
            "updated_at": "2023-04-13T22:10:39.613Z"
        },
        "website":
        {
            "object": "website",
            "id": "ee45cd59-44c9-42b8-aa4e-e5853a6532f3",
            "url": "https://www.wafflehouse.com",
            "status": "online",
            "title": "Lorem Ipsum",
            "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "domain":
            {
                "domain": "wafflehouse.com",
                "domain_id": "1234567890_DOMAIN_COM-VRSN",
                "creation_date": "2022-04-13 22:10:39 UTC",
                "expiration_date": "2024-04-13 22:10:39 UTC",
                "registrar":
                {
                    "organization": "GoDaddy.com, LLC",
                    "name": "GoDaddy.com, LLC",
                    "url": "http://www.godaddy.com"
                }
            },
            "pages":
            [
                {
                    "url": "https://www.wafflehouse.com",
                    "category": "home",
                    "screenshot_url": "https://cdn-middesk-websites.com/1595276893.png"
                }
            ],
            "created_at": "2023-04-13T22:10:39.089Z",
            "updated_at": "2023-04-13T22:10:39.501Z",
            "parked": false,
            "error": null,
            "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
            "business_name_match": true,
            "phone_numbers":
            [],
            "addresses":
            []
        },
        "watchlist":
        {
            "object": "watchlist",
            "id": "dfc140a2-5540-41f9-b0d3-c8737797962c",
            "hit_count": 0,
            "agencies":
            [
                {
                    "abbr": "OFAC",
                    "name": "Office of Foreign Assets Control",
                    "org": "U.S. Department of Treasury"
                },
                {
                    "abbr": "BIS",
                    "name": "Bureau of Industry and Security",
                    "org": "U.S. Department of Commerce"
                },
                {
                    "abbr": "DDTC",
                    "name": "Directorate of Defense Trade Controls",
                    "org": "U.S. Department of State"
                },
                {
                    "abbr": "ISN",
                    "name": "Bureau of International Security and Non-Proliferation",
                    "org": "U.S. Department of State"
                }
            ],
            "lists":
            [
                {
                    "object": "watchlist_source",
                    "agency": "Bureau of Industry and Security",
                    "agency_abbr": "BIS",
                    "organization": "U.S. Department of Commerce",
                    "title": "Denied Persons List",
                    "abbr": "DPL",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Directorate of Defense Trade Controls",
                    "agency_abbr": "DDTC",
                    "organization": "U.S. Department of State",
                    "title": "AECA/ITAR Debarred",
                    "abbr": "DTC",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Bureau of Industry and Security",
                    "agency_abbr": "BIS",
                    "organization": "U.S. Department of Commerce",
                    "title": "Entity List",
                    "abbr": "EL",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Specially Designated Nationals",
                    "abbr": "SDN",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Foreign Sanctions Evaders",
                    "abbr": "FSE",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Bureau of International Security and Non-Proliferation",
                    "agency_abbr": "ISN",
                    "organization": "U.S. Department of State",
                    "title": "Nonproliferation Sanctions",
                    "abbr": "ISN",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Palestinian Legislative Council",
                    "abbr": "PLC",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Sectoral Sanctions Identifications",
                    "abbr": "SSI",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Bureau of Industry and Security",
                    "agency_abbr": "BIS",
                    "organization": "U.S. Department of Commerce",
                    "title": "Unverified List",
                    "abbr": "UVL",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Capta List",
                    "abbr": "CAP",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Bureau of Industry and Security",
                    "agency_abbr": "BIS",
                    "organization": "U.S. Department of Commerce",
                    "title": "Military End User",
                    "abbr": "MEU",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Non-SDN Menu-Based Sanctions",
                    "abbr": "NS-MBS",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Non-SDN Iranian Sanctions",
                    "abbr": "NS-ISA",
                    "results":
                    []
                },
                {
                    "object": "watchlist_source",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "organization": "U.S. Department of Treasury",
                    "title": "Non-SDN Chinese Military-Industrial Complex Companies List",
                    "abbr": "NS-CMIC",
                    "results":
                    []
                }
            ],
            "people":
            [
                {
                    "object": "person",
                    "name": "Bob Boberto",
                    "submitted": true,
                    "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                    "sources":
                    [],
                    "titles":
                    []
                },
                {
                    "object": "person",
                    "name": "Jane Doe",
                    "submitted": true,
                    "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                    "sources":
                    [],
                    "titles":
                    []
                }
            ]
        },
        "bankruptcies":
        [],
        "certifications":
        [],
        "documents":
        [],
        "liens":
        [],
        "names":
        [
            {
                "object": "name",
                "id": "88442d86-e0be-452c-a6ec-fd0ea3c5c6b8",
                "name": "Waho",
                "submitted": true,
                "type": "dba",
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "sources":
                [
                    {
                        "id": "ee45cd59-44c9-42b8-aa4e-e5853a6532f3",
                        "type": "website",
                        "metadata":
                        {}
                    }
                ]
            },
            {
                "object": "name",
                "id": "eada8258-c0b0-44c4-987b-2bc21d8d5327",
                "name": "Waffle House",
                "submitted": true,
                "type": "legal",
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "sources":
                [
                    {
                        "id": "4def1e98-387c-41b7-847e-c31d9419466f",
                        "type": "registration",
                        "metadata":
                        {
                            "state": "CA",
                            "status": "active",
                            "file_number": "FN-XXXXXXX",
                            "jurisdiction": "DOMESTIC"
                        }
                    }
                ]
            }
        ],
        "addresses":
        [
            {
                "object": "address",
                "address_line1": "123 Bob St",
                "address_line2": null,
                "city": "Monrovia",
                "state": "CA",
                "postal_code": "91016",
                "full_address": "123 Bob St, Monrovia, CA 91016",
                "submitted": true,
                "id": "3249db39-843b-4381-b6d6-f8d4785fbe87",
                "latitude": 40.52,
                "longitude": 30.4,
                "property_type": null,
                "deliverable": true,
                "deliverability_analysis": null,
                "street_view_available": false,
                "labels":
                [],
                "created_at": "2023-04-13T22:10:39.107Z",
                "updated_at": "2023-04-13T22:10:39.475Z",
                "registered_agent_name": null,
                "cmra": false,
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "sources":
                [
                    {
                        "id": "4def1e98-387c-41b7-847e-c31d9419466f",
                        "type": "registration",
                        "metadata":
                        {
                            "state": "CA",
                            "status": "active",
                            "file_number": "FN-XXXXXXX",
                            "jurisdiction": "DOMESTIC"
                        }
                    }
                ]
            },
            {
                "object": "address",
                "address_line1": "354 Circle Ct",
                "address_line2": null,
                "city": "Bronx",
                "state": "NY",
                "postal_code": "10468",
                "full_address": "354 Circle Ct, Bronx, NY 10468",
                "submitted": false,
                "id": "ed265844-58dd-4ac3-b8a6-030553a5137b",
                "latitude": null,
                "longitude": null,
                "property_type": null,
                "deliverable": null,
                "deliverability_analysis": null,
                "street_view_available": null,
                "labels":
                [],
                "created_at": "2023-04-13T22:10:39.680Z",
                "updated_at": "2023-04-13T22:10:39.680Z",
                "registered_agent_name": null,
                "cmra": false,
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "sources":
                [
                    {
                        "id": "4def1e98-387c-41b7-847e-c31d9419466f",
                        "type": "registration",
                        "metadata":
                        {
                            "state": "CA",
                            "status": "active",
                            "file_number": "FN-XXXXXXX",
                            "jurisdiction": "DOMESTIC"
                        }
                    }
                ]
            }
        ],
        "people":
        [
            {
                "object": "person",
                "name": "Bob Boberto",
                "submitted": true,
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "sources":
                [],
                "titles":
                []
            },
            {
                "object": "person",
                "name": "Jane Doe",
                "submitted": true,
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "sources":
                [],
                "titles":
                []
            }
        ],
        "phone_numbers":
        [
            {
                "object": "phone_number",
                "phone_number": "+12222222222"
            }
        ],
        "profiles":
        [],
        "registrations":
        [
            {
                "object": "registration",
                "id": "4def1e98-387c-41b7-847e-c31d9419466f",
                "business_id": "189b6b3b-0319-4fca-8cea-2c62c5964536",
                "name": "Waffle House",
                "status": "active",
                "sub_status": "GOOD_STANDING",
                "status_details": "Active-Good Standing",
                "jurisdiction": "DOMESTIC",
                "entity_type": "CORPORATION",
                "file_number": "FN-XXXXXXX",
                "addresses":
                [
                    "123 BOB ST, MONROVIA, CA 91016",
                    "354 CIRCLE COURT,BRONX, NY 10468"
                ],
                "officers":
                [
                    {
                        "name": "BOB BOBERTO",
                        "roles": [
                          "CEO"
                        ]
                      },
                      {
                        "name": "BOB BOBERTO",
                        "roles": [
                          "PRESIDENT"
                        ]
                      },
                ],
                "registered_agent":
                {},
                "registration_date": "2020-02-24",
                "state": "CA",
                "source": "https://bizfileonline.sos.ca.gov/search/business"
            }
        ],
        "orders":
        [
            {
                "object": "order",
                "id": "ec2df2bd-b913-41f0-919f-72698e1bb210",
                "created_at": "2023-04-13T22:10:39.164Z",
                "updated_at": "2023-04-13T22:10:39.860Z",
                "completed_at": "2023-04-13T22:10:39.860Z",
                "status": "completed",
                "product": "identity",
                "subproducts":
                []
            },
            {
                "object": "order",
                "id": "c3bb0a23-0a9f-4f1a-9015-9d7491c494a8",
                "created_at": "2023-04-13T22:10:39.138Z",
                "updated_at": "2023-04-13T22:10:39.881Z",
                "completed_at": "2023-04-13T22:10:39.881Z",
                "status": "completed",
                "product": "website",
                "subproducts":
                []
            }
        ],
        "industry_classification":
        {
            "object": "industry_classification",
            "id": "529cb24a-18e5-4276-b5c1-2e764956cb30",
            "status": "completed",
            "categories":
            [
                {
                    "name": "Retail",
                    "sector": "RETAIL",
                    "category": "RETAIL",
                    "score": 0.62405075,
                    "high_risk": false,
                    "naics_codes":
                    [
                        "44",
                        "45"
                    ],
                    "sic_codes":
                    [
                        "52",
                        "53",
                        "54",
                        "55",
                        "56",
                        "57",
                        "58",
                        "59"
                    ]
                },
                {
                    "name": "Construction",
                    "sector": "CONSTRUCTION",
                    "category": "CONSTRUCTION",
                    "score": 0.013767034,
                    "high_risk": false,
                    "naics_codes":
                    [
                        "23"
                    ],
                    "sic_codes":
                    [
                        "15",
                        "16",
                        "17"
                    ]
                }
            ],
            "created_at": "2023-04-13T22:10:39.543Z",
            "completed_at": "2023-04-13T22:10:39.584Z",
            "website":
            {
                "url": "https://www.wafflehouse.com",
                "status": "online",
                "parked": false
            }
        },
        "subscription": null,
        "tax_exempt_organization": null,
        "fmcsa_registrations":
        [],
        "litigations":
        [],
        "actions":
        [],
        "policy_results":
        [],
        "submitted":
        {
            "object": "submitted_attributes",
            "name": "Waffle House",
            "addresses":
            [
                {
                    "city": "Monrovia",
                    "state": "CA",
                    "postal_code": "91016",
                    "address_line1": "123 Bob Street",
                    "address_line2": null
                }
            ],
            "orders": null,
            "people":
            [
                {
                    "name": "Bob Boberto"
                },
                {
                    "name": "Jane Doe"
                }
            ],
            "phone_numbers":
            [
                {
                    "phone_number": "+12222222222"
                }
            ],
            "tags": null,
            "external_id": null,
            "tin": null,
            "website":
            {
                "url": "https://www.wafflehouse.com"
            },
            "assignee_id": null,
            "formation": null,
            "names":
            [
                {
                    "name": "Waho",
                    "name_type": "dba"
                }
            ]
        }
    })
}

pub fn middesk_business_update_webhook_response() -> serde_json::Value {
    serde_json::json!({
        "object": "event",
    "id": "c434359d-0463-4f77-96cd-63827ffd8664",
    "account_id": "d34f4ef7-7a67-4772-b4a1-b19853e1a5a7",
    "type": "business.updated",
    "data": {
      "object": {
        "object": "business",
        "id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
        "external_id": null,
        "name": "Waffle House",
        "created_at": "2023-05-03T05:59:58.447Z",
        "updated_at": "2023-05-03T06:00:17.678Z",
        "status": "in_review",
        "tags": [],
        "requester": {
          "id": "d34f4ef7-7a67-4772-b4a1-b19853e1a5a7",
          "type": "account",
          "name": "Footprint",
          "requested_at": "2023-05-03T05:59:58.523Z"
        },
        "assignee_id": "d21f6f81-9865-4c1c-8b24-f9ce64b2d469",
        "supported_document_types": [
          "Articles of Incorporation",
          "Certificate of Good Standing"
        ],
        "review": {
          "object": "review",
          "id": "3c1cf256-8ff5-4897-af74-0674842763ba",
          "created_at": "2023-05-03T06:00:17.659Z",
          "updated_at": "2023-05-03T06:00:17.959Z",
          "completed_at": null,
          "tasks": [
            {
              "category": "name",
              "key": "dba_name",
              "label": "DBA Name",
              "message": "Unable to identify a match to the submitted DBA Name",
              "name": "name",
              "status": "failure",
              "sub_label": "Unverified",
              "sources": []
            },
            {
              "category": "watchlist",
              "key": "watchlist",
              "label": "Watchlist",
              "message": "1 Watchlists hit(s) have been identified",
              "name": "watchlist",
              "status": "failure",
              "sub_label": "Hits",
              "sources": []
            },
            {
              "category": "phone",
              "key": "phone",
              "label": "Phone Number",
              "message": "Unable to verify the submitted Phone Number",
              "name": "phone",
              "status": "warning",
              "sub_label": "Unverified",
              "sources": []
            },
            {
              "category": "name",
              "key": "name",
              "label": "Business Name",
              "message": "Match identified to the submitted Business Name",
              "name": "name",
              "status": "success",
              "sub_label": "Verified",
              "sources": [
                {
                  "id": "dbd6e900-1e24-4668-8221-87a3e0c6b7b7",
                  "type": "name",
                  "metadata": {
                    "name": "Waffle House",
                    "submitted": true
                  }
                }
              ]
            },
            {
              "category": "address",
              "key": "address_verification",
              "label": "Office Address",
              "message": "Match identified to the submitted Office Address",
              "name": "address",
              "status": "success",
              "sub_label": "Verified",
              "sources": [
                {
                  "id": "62f6f3cd-cd4d-473d-85a1-4951deb14836",
                  "type": "address",
                  "metadata": {
                    "city": "Charlotte County",
                    "state": "FL",
                    "submitted": true,
                    "postal_code": "33981",
                    "full_address": "123 Waffle Ln, Charlotte County, FL 33981",
                    "address_line1": "123 Waffle Ln",
                    "address_line2": null
                  }
                }
              ]
            },
            {
              "category": "address",
              "key": "address_deliverability",
              "label": "Office Address",
              "message": "The USPS is able to deliver mail to the submitted Office Address",
              "name": "address",
              "status": "success",
              "sub_label": "Deliverable",
              "sources": []
            },
            {
              "category": "address",
              "key": "address_property_type",
              "label": "Office Address",
              "message": "Submitted Office Address is a Commercial property",
              "name": "address",
              "status": "success",
              "sub_label": "Commercial",
              "sources": []
            },
            {
              "category": "people",
              "key": "person_verification",
              "label": "People",
              "message": "Match identified to the submitted person",
              "name": "people",
              "status": "success",
              "sub_label": "Verified",
              "sources": []
            },
            {
              "category": "sos",
              "key": "sos_match",
              "label": "SOS Filings",
              "message": "The business is Active in the state of the submitted Office Address",
              "name": "sos",
              "status": "success",
              "sub_label": "Submitted Active",
              "sources": []
            },
            {
              "category": "sos",
              "key": "sos_active",
              "label": "SOS Filings",
              "message": "1 of 1 filings are Active",
              "name": "sos",
              "status": "success",
              "sub_label": "Active",
              "sources": []
            },
            {
              "category": "sos",
              "key": "sos_domestic_sub_status",
              "label": "SOS Domestic Sub‑status",
              "message": "The domestic registration is in Good Standing.",
              "name": "sos",
              "status": "success",
              "sub_label": "Good Standing",
              "sources": []
            },
            {
              "category": "sos",
              "key": "sos_domestic",
              "label": "SOS Filings",
              "message": "Active domestic filing found",
              "name": "sos",
              "status": "success",
              "sub_label": "Domestic Active",
              "sources": []
            },
            {
              "category": "industry",
              "key": "industry",
              "label": "True Industry",
              "message": "This business likely does not operate in a high risk industry",
              "name": "industry",
              "status": "success",
              "sub_label": "No Hits",
              "sources": []
            },
            {
              "category": "website",
              "key": "website_status",
              "label": "Website",
              "message": "Website was Online when the business record was ordered",
              "name": "website",
              "status": "success",
              "sub_label": "Online",
              "sources": []
            },
            {
              "category": "website",
              "key": "website_verification",
              "label": "Website",
              "message": "Successfully found entity details on the submitted Website",
              "name": "website",
              "status": "success",
              "sub_label": "Verified",
              "sources": []
            },
            {
              "category": "bankruptcies",
              "key": "bankruptcies",
              "label": "Bankruptcies",
              "message": "The business has no bankruptcy filings",
              "name": "bankruptcies",
              "status": "success",
              "sub_label": "None Found",
              "sources": []
            }
          ],
          "assignee": {
            "object": "user",
            "id": "d21f6f81-9865-4c1c-8b24-f9ce64b2d469",
            "name": "Eli Wachs",
            "email": "eli@onefootprint.com",
            "roles": [
              "admin",
              "member"
            ],
            "image_url": "//www.gravatar.com/avatar/13102acff7b53fdc51ce7f9a27ac82bf?s=64&d=https%3A%2F%2Fapp-sandbox.middesk.com%2Fimages%2Fdefault-avatar.png",
            "last_login_at": null,
            "settings": {
              "receives_agent_emails": false
            }
          }
        },
        "tin": null,
        "business_batch_id": null,
        "formation": {
          "entity_type": "CORPORATION",
          "formation_date": "2020-02-24",
          "formation_state": "FL",
          "created_at": "2023-05-03T05:59:59.132Z",
          "updated_at": "2023-05-03T05:59:59.132Z"
        },
        "website": {
          "object": "website",
          "id": "cd3cad0e-20ae-4958-aa90-22a7fb392213",
          "url": "https://www.wafflehouse.com",
          "status": "online",
          "title": "Lorem Ipsum",
          "description": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
          "domain": {
            "domain": "wafflehouse.com",
            "domain_id": "1234567890_DOMAIN_COM-VRSN",
            "creation_date": "2022-05-03 05:59:58 UTC",
            "expiration_date": "2024-05-03 05:59:58 UTC",
            "registrar": {
              "organization": "GoDaddy.com, LLC",
              "name": "GoDaddy.com, LLC",
              "url": "http://www.godaddy.com"
            }
          },
          "pages": [
            {
              "url": "https://www.wafflehouse.com",
              "category": "home",
              "screenshot_url": "https://cdn-middesk-websites.com/1595276893.png"
            }
          ],
          "created_at": "2023-05-03T05:59:58.476Z",
          "updated_at": "2023-05-03T05:59:58.931Z",
          "parked": false,
          "error": null,
          "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
          "business_name_match": true,
          "phone_numbers": [],
          "addresses": []
        },
        "watchlist": {
          "object": "watchlist",
          "id": "478ee62a-fefe-4a30-aad5-f410ed7c0bf3",
          "hit_count": 1,
          "agencies": [
            {
              "abbr": "OFAC",
              "name": "Office of Foreign Assets Control",
              "org": "U.S. Department of Treasury"
            },
            {
              "abbr": "BIS",
              "name": "Bureau of Industry and Security",
              "org": "U.S. Department of Commerce"
            },
            {
              "abbr": "DDTC",
              "name": "Directorate of Defense Trade Controls",
              "org": "U.S. Department of State"
            },
            {
              "abbr": "ISN",
              "name": "Bureau of International Security and Non-Proliferation",
              "org": "U.S. Department of State"
            }
          ],
          "lists": [
            {
              "object": "watchlist_source",
              "agency": "Bureau of Industry and Security",
              "agency_abbr": "BIS",
              "organization": "U.S. Department of Commerce",
              "title": "Denied Persons List",
              "abbr": "DPL",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Directorate of Defense Trade Controls",
              "agency_abbr": "DDTC",
              "organization": "U.S. Department of State",
              "title": "AECA/ITAR Debarred",
              "abbr": "DTC",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Bureau of Industry and Security",
              "agency_abbr": "BIS",
              "organization": "U.S. Department of Commerce",
              "title": "Entity List",
              "abbr": "EL",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Specially Designated Nationals",
              "abbr": "SDN",
              "results": [
                {
                  "object": "watchlist_result",
                  "id": "85bd7c25-6499-49a0-95d1-db775df9a34f",
                  "entity_name": "Jane watchlist hit",
                  "entity_aliases": [],
                  "listed_at": null,
                  "agency_information_url": "http://bit.ly/1MLgpye",
                  "agency_list_url": "http://bit.ly/1I7ipyR",
                  "score": 66.7,
                  "addresses": [
                    {
                      "full_address": "PA"
                    }
                  ],
                  "url": "https://sanctionssearch.ofac.treas.gov/Details.aspx?id=1043"
                }
              ]
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Foreign Sanctions Evaders",
              "abbr": "FSE",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Bureau of International Security and Non-Proliferation",
              "agency_abbr": "ISN",
              "organization": "U.S. Department of State",
              "title": "Nonproliferation Sanctions",
              "abbr": "ISN",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Palestinian Legislative Council",
              "abbr": "PLC",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Sectoral Sanctions Identifications",
              "abbr": "SSI",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Bureau of Industry and Security",
              "agency_abbr": "BIS",
              "organization": "U.S. Department of Commerce",
              "title": "Unverified List",
              "abbr": "UVL",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Capta List",
              "abbr": "CAP",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Bureau of Industry and Security",
              "agency_abbr": "BIS",
              "organization": "U.S. Department of Commerce",
              "title": "Military End User",
              "abbr": "MEU",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Non-SDN Menu-Based Sanctions",
              "abbr": "NS-MBS",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Non-SDN Iranian Sanctions",
              "abbr": "NS-ISA",
              "results": []
            },
            {
              "object": "watchlist_source",
              "agency": "Office of Foreign Assets Control",
              "agency_abbr": "OFAC",
              "organization": "U.S. Department of Treasury",
              "title": "Non-SDN Chinese Military-Industrial Complex Companies List",
              "abbr": "NS-CMIC",
              "results": []
            }
          ],
          "people": [
            {
              "object": "person",
              "name": "Jane watchlist hit",
              "submitted": true,
              "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
              "sources": [
                {
                  "id": "f426b6bd-3f1d-4d20-b94a-27d62d22f13f",
                  "type": "registration",
                  "metadata": {
                    "state": "FL",
                    "status": "active",
                    "file_number": "FN-XXXXXXX",
                    "jurisdiction": "DOMESTIC"
                  }
                },
                {
                  "id": "85bd7c25-6499-49a0-95d1-db775df9a34f",
                  "type": "watchlist_result",
                  "metadata": {
                    "abbr": "SDN",
                    "title": "Specially Designated Nationals",
                    "agency": "Office of Foreign Assets Control",
                    "agency_abbr": "OFAC",
                    "entity_name": "Jane watchlist hit"
                  }
                }
              ],
              "titles": [
                {
                  "object": "person_title",
                  "title": "CEO"
                }
              ]
            }
          ]
        },
        "bankruptcies": [],
        "certifications": [],
        "documents": [],
        "liens": [],
        "names": [
          {
            "object": "name",
            "id": "dbd6e900-1e24-4668-8221-87a3e0c6b7b7",
            "name": "Waffle House",
            "submitted": true,
            "type": "legal",
            "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
            "sources": [
              {
                "id": "f426b6bd-3f1d-4d20-b94a-27d62d22f13f",
                "type": "registration",
                "metadata": {
                  "state": "FL",
                  "status": "active",
                  "file_number": "FN-XXXXXXX",
                  "jurisdiction": "DOMESTIC"
                }
              }
            ]
          },
          {
            "object": "name",
            "id": "10ca40b2-715a-4760-9f1e-4748747a699f",
            "name": "Waho",
            "submitted": true,
            "type": "dba",
            "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
            "sources": [
              {
                "id": "cd3cad0e-20ae-4958-aa90-22a7fb392213",
                "type": "website",
                "metadata": {}
              }
            ]
          }
        ],
        "addresses": [
          {
            "object": "address",
            "address_line1": "123 Waffle Ln",
            "address_line2": null,
            "city": "Charlotte County",
            "state": "FL",
            "postal_code": "33981",
            "full_address": "123 Waffle Ln, Charlotte County, FL 33981",
            "submitted": true,
            "id": "62f6f3cd-cd4d-473d-85a1-4951deb14836",
            "latitude": 40.52,
            "longitude": 30.4,
            "property_type": null,
            "deliverable": true,
            "deliverability_analysis": null,
            "street_view_available": false,
            "labels": [],
            "created_at": "2023-05-03T05:59:58.493Z",
            "updated_at": "2023-05-03T05:59:58.903Z",
            "registered_agent_name": null,
            "cmra": false,
            "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
            "sources": [
              {
                "id": "f426b6bd-3f1d-4d20-b94a-27d62d22f13f",
                "type": "registration",
                "metadata": {
                  "state": "FL",
                  "status": "active",
                  "file_number": "FN-XXXXXXX",
                  "jurisdiction": "DOMESTIC"
                }
              }
            ]
          },
          {
            "object": "address",
            "address_line1": "354 Circle Ct",
            "address_line2": null,
            "city": "Bronx",
            "state": "NY",
            "postal_code": "10468",
            "full_address": "354 Circle Ct, Bronx, NY 10468",
            "submitted": false,
            "id": "4b23307a-4ea1-47d3-8db0-00e59ac272e5",
            "latitude": null,
            "longitude": null,
            "property_type": null,
            "deliverable": null,
            "deliverability_analysis": null,
            "street_view_available": null,
            "labels": [],
            "created_at": "2023-05-03T05:59:59.223Z",
            "updated_at": "2023-05-03T05:59:59.223Z",
            "registered_agent_name": null,
            "cmra": false,
            "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
            "sources": [
              {
                "id": "f426b6bd-3f1d-4d20-b94a-27d62d22f13f",
                "type": "registration",
                "metadata": {
                  "state": "FL",
                  "status": "active",
                  "file_number": "FN-XXXXXXX",
                  "jurisdiction": "DOMESTIC"
                }
              }
            ]
          }
        ],
        "people": [
          {
            "object": "person",
            "name": "Jane watchlist hit",
            "submitted": true,
            "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
            "sources": [
              {
                "id": "f426b6bd-3f1d-4d20-b94a-27d62d22f13f",
                "type": "registration",
                "metadata": {
                  "state": "FL",
                  "status": "active",
                  "file_number": "FN-XXXXXXX",
                  "jurisdiction": "DOMESTIC"
                }
              },
              {
                "id": "85bd7c25-6499-49a0-95d1-db775df9a34f",
                "type": "watchlist_result",
                "metadata": {
                  "abbr": "SDN",
                  "title": "Specially Designated Nationals",
                  "agency": "Office of Foreign Assets Control",
                  "agency_abbr": "OFAC",
                  "entity_name": "Jane watchlist hit"
                }
              }
            ],
            "titles": [
              {
                "object": "person_title",
                "title": "CEO"
              }
            ]
          }
        ],
        "phone_numbers": [
          {
            "object": "phone_number",
            "phone_number": "+12222222222"
          }
        ],
        "profiles": [],
        "registrations": [
          {
            "object": "registration",
            "id": "f426b6bd-3f1d-4d20-b94a-27d62d22f13f",
            "business_id": "a323a26e-bac6-4ecf-9fdf-7ac1ec5af6e2",
            "name": "Waffle House",
            "status": "active",
            "sub_status": "GOOD_STANDING",
            "status_details": "Active-Good Standing",
            "jurisdiction": "DOMESTIC",
            "entity_type": "CORPORATION",
            "file_number": "FN-XXXXXXX",
            "addresses": [
              "123 WAFFLE LN, CHARLOTTE COUNTY, FL 33981",
              "354 CIRCLE COURT,BRONX, NY 10468"
            ],
            "officers": [
              {
                "name": "JANE WATCHLIST HIT",
                "roles": [ "CEO"]
              }
            ],
            "registered_agent": {},
            "registration_date": "2020-02-24",
            "state": "FL",
            "source": "http://search.sunbiz.org/Inquiry/CorporationSearch/ByName"
          }
        ],
        "orders": [
          {
            "object": "order",
            "id": "756dd5ea-617b-4f48-a60a-f618270e2c97",
            "completed_at": "2023-05-03T05:59:59.063Z",
            "created_at": "2023-05-03T05:59:58.523Z",
            "product": "website",
            "requester": {
              "name": "Footprint"
            },
            "status": "completed",
            "subproducts": [],
            "updated_at": "2023-05-03T05:59:59.063Z"
          },
          {
            "object": "order",
            "id": "7c89d7c5-d9e8-496e-a684-ba4973527c3d",
            "completed_at": "2023-05-03T06:00:17.633Z",
            "created_at": "2023-05-03T05:59:58.565Z",
            "product": "identity",
            "requester": {
              "name": "Footprint"
            },
            "status": "completed",
            "subproducts": [],
            "updated_at": "2023-05-03T06:00:17.633Z"
          }
        ],
        "industry_classification": {
          "object": "industry_classification",
          "id": "f2bae82b-d0dc-415d-bef2-c565395bffe4",
          "status": "completed",
          "categories": [
            {
              "name": "Retail",
              "sector": "RETAIL",
              "category": "RETAIL",
              "score": 0.62405075,
              "high_risk": false,
              "naics_codes": [
                "44",
                "45"
              ],
              "sic_codes": [
                "52",
                "53",
                "54",
                "55",
                "56",
                "57",
                "58",
                "59"
              ]
            },
            {
              "name": "Construction",
              "sector": "CONSTRUCTION",
              "category": "CONSTRUCTION",
              "score": 0.013767034,
              "high_risk": false,
              "naics_codes": [
                "23"
              ],
              "sic_codes": [
                "15",
                "16",
                "17"
              ]
            }
          ],
          "created_at": "2023-05-03T05:59:58.966Z",
          "completed_at": "2023-05-03T05:59:59.012Z",
          "website": {
            "url": "https://www.wafflehouse.com",
            "status": "online",
            "parked": false
          }
        },
        "subscription": null,
        "tax_exempt_organization": null,
        "fmcsa_registrations": [],
        "litigations": [],
        "actions": [],
        "policy_results": [],
        "submitted": {
          "object": "submitted_attributes",
          "name": "Waffle House",
          "addresses": [
            {
              "city": "Charlotte County",
              "state": "FL",
              "postal_code": "33981",
              "address_line1": "123 Waffle Ln",
              "address_line2": null
            }
          ],
          "orders": null,
          "people": [
            {
              "name": "Jane watchlist hit"
            }
          ],
          "phone_numbers": [
            {
              "phone_number": "+12222222222"
            }
          ],
          "tags": null,
          "external_id": null,
          "tin": null,
          "website": {
            "url": "https://www.wafflehouse.com"
          },
          "assignee_id": null,
          "formation": null,
          "names": [
            {
              "name": "Waho",
              "name_type": "dba"
            }
          ]
        }
      }
    },
    "created_at": "2023-05-03T06:00:18.196Z"
    })
}

pub fn cross_core_response_with_error() -> serde_json::Value {
    serde_json::json!({
      "responseHeader": {
        "category": null,
        "tenantId": "105408b68cde455a92e95a3eaa989e",
        "messageTime": "2023-08-16T03:38:14Z",
        "requestType": "PreciseIdOnly",
        "expRequestId": "RB000016347814",
        "responseCode": "R0201",
        "responseType": "INFO",
        "overallResponse": {
          "score": null,
          "decision": null,
          "decisionText": null,
          "spareObjects": [],
          "decisionReasons": [],
          "recommendedNextActions": []
        },
        "responseMessage": "Workflow Complete.",
        "clientReferenceId": "vreq_lWimW2PqVkq1LAPskZizP"
      },
      "originalRequestData": {
        "control": [
            {
                "option": "PIDXML_VERSION",
                "value": "06.00"
            },
            {
                "option": "SUBSCRIBER_PREAMBLE",
                "value": "TBD3"
            },
            {
                "option": "SUBSCRIBER_OPERATOR_INITIAL",
                "value": "OF"
            },
            {
                "option": "SUBSCRIBER_SUB_CODE",
                "value": "2956241"
            },
            {
                "option": "PID_USERNAME",
                "value": "ofp_demo"
            },
            {
                "option": "PID_PASSWORD",
                "value": "Y3lkamVqLTBXdXNkZS12dXJ3ZWM="
            },
            {
                "option": "PRODUCT_OPTION",
                "value": "01"
            },
            {
                "option": "DETAIL_REQUEST",
                "value": "D"
            }
        ],
        "contacts": [
            {
                "id": "APPLICANT_CONTACT_ID_1",
                "person": {
                    "typeOfPerson": "APPLICANT",
                    "personIdentifier": "1234",
                    "personDetails": {
                        "dateOfBirth": "1963-01-01"
                    },
                    "names": [
                        {
                            "firstName": "BRIAN",
                            "middleNames": "P",
                            "surName": "KURTH"
                        }
                    ]
                },
                "addresses": [
                    {
                        "id": "Main_Contact_Address_0",
                        "addressType": "CURRENT",
                        "street": "2010 SAINT NAZAIRE BLVD",
                        "postTown": "HOMESTEAD",
                        "postal": "33039",
                        "stateProvinceCode": "FL"
                    }
                ],
                "telephones": [
                    {
                        "id": "Main_Phone_0",
                        "number": "+1 7818945369"
                    }
                ],
                "emails": [
                    {
                        "id": "MAIN_EMAIL_0",
                        "email": "John.Smith@Experian.com"
                    }
                ],
                "identityDocuments": [
                    {
                        "documentNumber": "666810987",
                        "documentType": "SSN"
                    }
                ]
            }
        ],
        "application": {
            "productDetails": {
                "productType": "WRITTEN_INSTRUCTIONS"
            },
            "applicants": [
                {
                    "contactId": "APPLICANT_CONTACT_ID_1",
                    "applicantType": "APPLICANT"
                }
            ]
        }
    },
      "clientResponsePayload": {
        "decisionElements": [
          {
            "matches": null,
            "decisions": null,
            "otherData": {
              "json": {
                "fraudSolutions": {
                  "response": {
                    "products": {
                      "preciseIDServer": {
                        "error": {
                          "errorCode": "709",
                          "reportDate": "08152023",
                          "reportTime": "223821",
                          "actionIndicator": {
                            "code": "C",
                            "value": ""
                          },
                          "referenceNumber": "vreq_lWimW2PqVkq1LAPskZizP",
                          "errorDescription": "Invalid user id/password"
                        },
                        "header": "<SCRUBBED>",
                        "summary": null,
                        "glbDetail": null,
                        "ipAddress": "<SCRUBBED>",
                        "onFileSsn": "<SCRUBBED>",
                        "sessionId": null,
                        "preciseMatch": null,
                        "pidxmlversion": "06.00"
                      },
                      "customerManagement": null
                    }
                  }
                }
              }
            },
            "applicantId": "Contact1",
            "serviceName": "PreciseId",
            "warningsErrors": [
              {
                "responseCode": "709",
                "responseType": "ERROR",
                "responseMessage": "Invalid user id/password"
              }
            ],
            "normalizedScore": -1
          }
        ],
        "orchestrationDecisions": []
      }
    })
}

pub struct DocTestOpts {
    pub screen: IncodeStatus,
    pub paper: IncodeStatus,
    pub expiration: IncodeStatus,
    pub overall: IncodeStatus,
    pub tamper: IncodeStatus,
    pub visible_photo_features: IncodeStatus,
    pub barcode: IncodeStatus,
    pub barcode_content: IncodeStatus,
    pub fake: IncodeStatus,
    pub ocr_confidence: IncodeStatus,
    pub selfie_match: IncodeStatus,
    pub lenses_and_mask_check: IncodeStatus,
    pub cross_checks: IncodeStatus,
    pub liveness: IncodeStatus,
}
impl Default for DocTestOpts {
    fn default() -> Self {
        Self {
            screen: IncodeStatus::Ok,
            paper: IncodeStatus::Ok,
            expiration: IncodeStatus::Ok,
            overall: IncodeStatus::Ok,
            tamper: IncodeStatus::Ok,
            visible_photo_features: IncodeStatus::Ok,
            barcode: IncodeStatus::Ok,
            barcode_content: IncodeStatus::Ok,
            fake: IncodeStatus::Ok,
            ocr_confidence: IncodeStatus::Ok,
            selfie_match: IncodeStatus::Ok,
            lenses_and_mask_check: IncodeStatus::Ok,
            cross_checks: IncodeStatus::Ok,
            liveness: IncodeStatus::Ok,
        }
    }
}

pub fn incode_fetch_scores_response(opts: DocTestOpts) -> serde_json::Value {
    serde_json::json!({
      "idValidation": {
        "photoSecurityAndQuality": [
          {
            "value": "PASSED",
            "status": opts.tamper.to_string(),
            "key": "tamperCheck"
          },
          {
            "value": "PASSED",
            "status": "OK",
            "key": "idAlterationCheckFront"
          },
          {
            "value": "PASSED",
            "status": "OK",
            "key": "idAlterationCheckBack"
          },
          {
            "value": "PASSED",
            "status": "OK",
            "key": "alignment"
          },
          {
            "value": "OK",
            "status": opts.screen.to_string(),
            "key": "screenIdLiveness"
          },
          {
            "value": "OK",
            "status": opts.paper.to_string(),
            "key": "paperIdLiveness"
          },
          {
            "value": "PASSED",
            "status": "OK",
            "key": "idAlreadyUsedCheck"
          },
          {
            "value": "96",
            "status": "OK",
            "key": "balancedLightFront"
          },
          {
            "value": "99",
            "status": "OK",
            "key": "sharpnessFront"
          }
        ],
        "idSpecific": [
          {
            "value": "100",
            "status": "WARN",
            "key": "documentClassification"
          },
          {
            "value": "100",
            "status": "OK",
            "key": "birthDateValidity"
          },
          {
            "value": "100",
            "status": opts.visible_photo_features.to_string(),
            "key": "visiblePhotoFeatures"
          },
          {
            "value": "100",
            "status": "FAIL",
            "key": "expirationDateValidity"
          },
          {
            "value": "20",
            "status": opts.expiration.to_string(),
            "key": "documentExpired"
          },
          {
            "value": "20",
            "status": opts.barcode_content.to_string(),
            "key": "2DBarcodeContent"
          },
          {
            "value": "20",
            "status": opts.barcode.to_string(),
            "key": "barcode2DDetected"
          },
          {
            "value": "20",
            "status": opts.fake.to_string(),
            "key": "fakeCheck"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "sexCrosscheck"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "fullNameCrosscheck"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "documentNumberCrosscheck"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "birthDateCrosscheck"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "documentNumberCheckDigit"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "birthDateCheckDigit"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "expirationDateCheckDigit"
          },
          {
            "value": "PASSED",
            "status": opts.cross_checks.to_string(),
            "key": "compositeCheckDigit"
          },

        ],
        "customFields": [
          {
            "value": "firstNameMatch",
            "status": "FAIL",
            "key": "firstNameMatch"
          },
          {
            "value": "lastNameMatch",
            "status": "FAIL",
            "key": "lastNameMatch"
          }
        ],
        "appliedRule": null,
        "overall": {
            "value": "100.0",
            "status": opts.overall.to_string(),
            "key": null
          }
      },
      "liveness": {
         "overall": {
            "value": "100.0",
            "status": opts.liveness.to_string(),
            "key": null
         },
         "photoQuality": {
            "value": "100.0",
         },
         "liveness_score": {
            "value": "100.0",
            "status": "OK",
         }
      },
      "faceRecognition": {
        "maskCheck": {
          "value": "0.0",
          "status": opts.lenses_and_mask_check.to_string(),
        },
        "lensesCheck": {
          "status": opts.lenses_and_mask_check.to_string(),
        },
        "faceBrightness": {
          "value": "128.6",
          "status": "OK"
        },
        "overall": {
          "value": "100.0",
          "status": opts.selfie_match.to_string(),
        }
      },
      "idOcrConfidence": {
        "overallConfidence": {
          "value": "99.0",
          "status": opts.ocr_confidence.to_string(),
          "key": null
        }
      },
      "overall": {
        "value": "100.0",
        "status": "FAIL",
        "key": null
      }
    })
}

pub struct OcrTestOpts {
    pub first_name: String,
    pub paternal_last_name: String,
    pub dob: String,
}
fn dob_to_incode_timestamp(dob: &str) -> i64 {
    NaiveDate::parse_from_str(dob, "%Y-%m-%d")
        .unwrap()
        .and_hms_milli_opt(0, 0, 0, 0)
        .map(|d| d.timestamp_millis())
        .unwrap()
}
pub fn incode_fetch_ocr_response(opts: Option<OcrTestOpts>) -> serde_json::Value {
    serde_json::json!({
      "name": {
        "fullName": opts.as_ref().map(|o| format!("{} {}", o.first_name.clone(), o.paternal_last_name.clone())).unwrap_or("ALEX GINMAN".into()),
        "firstName": opts.as_ref().map(|o| o.first_name.clone()).unwrap_or("ALEX".into()),
        "givenName": opts.as_ref().map(|o| o.first_name.clone()).unwrap_or("ALEX".into()),
        "paternalLastName": opts.as_ref().map(|o| o.paternal_last_name.clone()).unwrap_or("GINMAN".into()),
      },
      "address": "76 PARKER HILL AVE 1\nBOSTON, MA 02120",
      "addressFields": {
        "state": "MA"
      },
      "checkedAddress": "76 Parker Hill Ave, Boston, MA 02120, United States",
      "checkedAddressBean": {
        "street": "76 Parker Hill Ave",
        "postalCode": "02120",
        "city": "Boston",
        "state": "MA",
        "label": "76 Parker Hill Ave, Boston, MA 02120, United States",
        "zipColonyOptions": []
      },
      "typeOfId": "DriversLicense",
      "documentFrontSubtype": "DRIVERS_LICENSE",
      "documentBackSubtype": "DRIVERS_LICENSE",
      "birthDate": opts.as_ref().map(|o| dob_to_incode_timestamp(&o.dob)).unwrap_or(534267), // serde_json overflows, so this is artificially truncated
      "gender": "M",
      "documentNumber": "S3441243",
      "refNumber": "06/13/2015 Rev 02/22/2016",
      "issuedAt": "1560384000000",
      "expireAt": "1728950400000",
      "expirationDate": 2024,
      "issueDate": 2019,
      "additionalTimestamps": [],
      "issuingCountry": "USA",
      "issuingState": "MASSACHUSETTS",
      "height": "5 '  11",
      "restrictions": "NONE",
      "ocrDataConfidence": {
        "birthDateConfidence": 0.9975609,
        "nameConfidence": 0.98470485,
        "givenNameConfidence": 0.98787415,
        "firstNameConfidence": 0.98787415,
        "fathersSurnameConfidence": 0.98153555,
        "addressConfidence": 0.91200954,
        "genderConfidence": 0.9834226,
        "issueDateConfidence": 0.99,
        "expirationDateConfidence": 0.99,
        "issuedAtConfidence": 0.99948984,
        "expireAtConfidence": 0.9990068,
        "documentNumberConfidence": 0.9766761,
        "heightConfidence": 0.9645301,
        "refNumberConfidence": 0.9727157,
        "restrictionsConfidence": 0.92769164
      }
    })
}

pub fn incode_fetch_ocr_response_for_drivers_license(
    class: &str,
    issuing_state: &str,
    type_of_id: &str,
) -> serde_json::Value {
    serde_json::json!({
        "name": {
            "fullName": "ROBERT BOB BOBERTO",
            "machineReadableFullName": "ROBERT BOB BOBERTO",
            "firstName": "ROBERT",
            "middleName": "BOB",
            "givenName": "BOBERTO",
            "paternalLastName": "BOBERTO"},
        "address": "1 MAIN ST HAYES VALLEY GA 30088-2794 USA",
        "addressFields": {
            "street": "1 MAIN ST",
            "postalCode": "300882794",
            "city": "HAYES VALLEY",
            "state": "GA"
        },
        "checkedAddress": "1 Main St, Hayes Valley, GA 30088, United States",
        "checkedAddressBean": {
            "street": "1 Main St",
            "postalCode": "30088",
            "city": "Hayes Valley",
            "state": "GA",
            "label": "1 Main St",
            "latitude": 2.75955,
            "longitude": -1.18541,
            "zipColonyOptions": []},
        "typeOfId": type_of_id,
        "documentFrontSubtype": "DRIVERS_LICENSE",
        "documentBackSubtype": "DRIVERS_LICENSE",
        "birthDate": 775958,
        "gender": "F",
        "documentNumber": "12345",
        "refNumber": "12345",
        "issuedAt": "1686614400000",
        "expireAt": "1754265600000",
        "expirationDate": 2025,
        "issueDate": 2023,
        "issuingCountry": "USA",
        "issuingState": issuing_state,
        "height": "067 IN",
        "weight": "126",
        "eyeColor": "BRO",
        "classes": class,
        "mentions": "NONE",
        "restrictions": "A",
        "ocrDataConfidence": {"birthDateConfidence": 1.0,
            "nameConfidence": 1.0,
            "givenNameConfidence": 1.0,
            "firstNameConfidence": 1.0,
            "middleNameConfidence": 1.0,
            "fathersSurnameConfidence": 1.0,
            "fullNameMrzConfidence": 1.0,
            "addressConfidence": 1.0,
            "streetConfidence": 1.0,
            "postalCodeConfidence": 1.0,
            "cityConfidence": 1.0,
            "stateConfidence": 1.0,
            "countryCodeConfidence": 1.0,
            "genderConfidence": 1.0,
            "issueDateConfidence": 1.0,
            "expirationDateConfidence": 1.0,
            "issuedAtConfidence": 1.0,
            "expireAtConfidence": 1.0,
            "documentNumberConfidence": 1.0,
            "heightConfidence": 1.0,
            "eyeColorConfidence": 1.0,
            "classesConfidence": 1.0,
            "mentionsConfidence": 1.0,
            "refNumberConfidence": 1.0,
            "weightConfidence": 1.0,
            "restrictionsConfidence": 1.0}
        }
    )
}
pub fn incode_watchlist_result_response_large() -> serde_json::Value {
    let s = r#"
    {
        "content":
        {
            "data":
            {
                "id": 1303119978,
                "ref": "1684540570-X0lf4jZ_",
                "searcher_id": 14876,
                "assignee_id": 14876,
                "filters":
                {
                    "country_codes":
                    [],
                    "exact_match": false,
                    "fuzziness": 0.5,
                    "remove_deceased": 0,
                    "types":
                    [
                        "adverse-media-v2-regulatory",
                        "fitness-probity",
                        "pep-class-1",
                        "adverse-media-v2-property",
                        "adverse-media-v2-other-serious",
                        "adverse-media-v2-violence-non-aml-cft",
                        "adverse-media-v2-financial-difficulty",
                        "pep-class-4",
                        "pep",
                        "adverse-media-v2-cybercrime",
                        "adverse-media-v2-fraud-linked",
                        "adverse-media-v2-other-financial",
                        "pep-class-2",
                        "adverse-media-v2-other-minor",
                        "adverse-media-v2-general-aml-cft",
                        "adverse-media-v2-terrorism",
                        "adverse-media-v2-narcotics-aml-cft",
                        "sanction",
                        "warning",
                        "pep-class-3",
                        "adverse-media-v2-financial-aml-cft",
                        "adverse-media-v2-violence-aml-cft"
                    ]
                },
                "match_status": "potential_match",
                "risk_level": "unknown",
                "search_term": "James Koang Chuol",
                "total_hits": 4,
                "total_matches": 4,
                "updated_at": "2023-05-19 23:56:10",
                "created_at": "2023-05-19 23:56:10",
                "tags":
                [],
                "limit": 100,
                "offset": 0,
                "share_url": "https://app.complyadvantage.com/public/search/1684540570-X0lf4jZ_/1128fcd09aa2",
                "hits":
                [
                    {
                        "doc":
                        {
                            "aka":
                            [
                                {
                                    "name": "James Koang Chual"
                                },
                                {
                                    "name": "James Koang Chol"
                                },
                                {
                                    "name": "Koang Chuol Ranley"
                                },
                                {
                                    "name": "James Koang"
                                },
                                {
                                    "name": "Chol James Koang"
                                },
                                {
                                    "name": "Chuol James Koang"
                                },
                                {
                                    "name": "KoangChuolRanley"
                                },
                                {
                                    "name": "Ranley James Koang Chol"
                                },
                                {
                                    "name": "James Koang Chuol"
                                },
                                {
                                    "name": "James KoangCholRanley"
                                },
                                {
                                    "name": "Джеймс Коанг Чуол"
                                },
                                {
                                    "name": "Ranley Koang Chuol"
                                },
                                {
                                    "name": "James Koang Chol Ranley"
                                },
                                {
                                    "name": "James KoangChual"
                                },
                                {
                                    "name": "James KoangChol"
                                }
                            ],
                            "fields":
                            [
                                {
                                    "name": "Nationality",
                                    "source": "europe-sanctions-list",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "tresor-direction-generale",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "hm-treasury-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "dfat-australia-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "south-africa-targeted-financial-sanctions-list-person",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "un-consolidated",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "sfm-ukraine",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Country",
                                    "source": "europe-sanctions-list",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "europe-sanctions-list",
                                    "value": "SUDAN"
                                },
                                {
                                    "name": "Country",
                                    "source": "dfat-australia-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "dfat-australia-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Place of Birth",
                                    "source": "europe-sanctions-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Original Place of Birth Text",
                                    "source": "europe-sanctions-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Place of Birth",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Sudan, United Kingdom"
                                },
                                {
                                    "name": "Original Place of Birth Text",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya, South Sudan, Sudan, Tanzania, United States"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "tresor-direction-generale",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "hm-treasury-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "belarus-state-security-agency-list-of-organizations-and-individuals-involved-in-terrorist-activities",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "europe-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "dfat-australia-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "un-consolidated",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "ofac-sdn-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "swiss-seco-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Tanzania"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "sfm-ukraine",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United States"
                                },
                                {
                                    "name": "Passport",
                                    "source": "hm-treasury-list",
                                    "tag": "passport",
                                    "value": "(Number):R00012098 (Details):South Sudan"
                                },
                                {
                                    "name": "Passport",
                                    "source": "europe-sanctions-list",
                                    "tag": "passport",
                                    "value": "National passport R00012098, Issuing Country SUDAN, SOUTH SUDAN"
                                },
                                {
                                    "name": "Passport",
                                    "source": "ofac-sdn-list",
                                    "tag": "passport",
                                    "value": "Passport: R00012098, Issuing Country: South Sudan"
                                },
                                {
                                    "name": "Passport",
                                    "source": "un-consolidated",
                                    "tag": "passport",
                                    "value": "Passport: R00012098, South Sudan"
                                },
                                {
                                    "name": "Passport",
                                    "source": "swiss-seco-list",
                                    "tag": "passport",
                                    "value": "R00012098, Issued by South Sudan"
                                },
                                {
                                    "name": "Passport",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "tag": "passport",
                                    "value": "R00012098, SUDAN, SOUTH SUDAN"
                                },
                                {
                                    "name": "Passport",
                                    "source": "tresor-direction-generale",
                                    "tag": "passport",
                                    "value": "R00012098, Soudan du Sud"
                                },
                                {
                                    "name": "Passport",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "tag": "passport",
                                    "value": "R00012098, South Sudan"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "europe-sanctions-list",
                                    "value": "2017-03-09"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "hm-treasury-list",
                                    "value": "2020-12-31"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "tresor-direction-generale",
                                    "value": "(UE) 2015/1112 du 09/07/2015 (ONU Soudan du sud - RCSNU 2206 (2015) et R (UE) 2015/735)"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "tresor-direction-generale",
                                    "value": "(UE) 2017/402 du 07/03/2017 (ONU Soudan du sud - RCSNU 2206 (2015) et R (UE) 2015/735)"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "europe-sanctions-list",
                                    "value": "2017/402 (OJ L63)"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "2017/402 (OJ L63)"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "tresor-direction-generale",
                                    "value": "décision du comité des sanctions des Nations unies du 01/07/2015 (ONU Soudan du sud - RCSNU 2206 (2015) et R (UE) 2015/735)"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "europe-sanctions-list",
                                    "value": "01-07-2015"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "value": "1 Jul. 2015"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "ofac-sdn-list",
                                    "value": "2014-09-18"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "hm-treasury-list",
                                    "value": "2015-07-01"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "un-consolidated",
                                    "value": "2015-07-01"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "dfat-australia-list",
                                    "value": "2015-07-01"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "2015-07-01"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "sfm-ukraine",
                                    "value": "2015-07-13"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "swiss-seco-list",
                                    "value": "2015-08-12"
                                },
                                {
                                    "name": "Function",
                                    "source": "europe-sanctions-list",
                                    "value": "Appointed commander of the Sudan People's Liberation Army in Opposition (SPLAIO) Special Division in December 2014 Koang defected from his position as the Sudan People's Liberation Army (SPLA) Fourth Division commander in December 2013"
                                },
                                {
                                    "name": "Function",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "Appointed commander of the Sudan People's Liberation Army in Opposition (SPLAIO) Special Division in December 2014 Koang defected from his position as the Sudan People's Liberation Army (SPLA) Fourth Division commander in December 2013"
                                },
                                {
                                    "name": "Function",
                                    "source": "hm-treasury-list",
                                    "value": "Commander of the Sudan People's Liberation Army in Opposition (SPLAIO) Special Division"
                                },
                                {
                                    "name": "Identification Number",
                                    "source": "south-africa-targeted-financial-sanctions-list-person",
                                    "value": "Passport, R00012098, South Sudan"
                                },
                                {
                                    "name": "Identification Number",
                                    "source": "sfm-ukraine",
                                    "value": "R00012098, South Sudan"
                                },
                                {
                                    "name": "Issuing Authority",
                                    "source": "europe-sanctions-list",
                                    "value": "European Union"
                                },
                                {
                                    "name": "Issuing Authority",
                                    "source": "un-consolidated",
                                    "value": "United Nations"
                                },
                                {
                                    "name": "Legal Basis",
                                    "source": "tresor-direction-generale",
                                    "value": "EU.3805.30"
                                },
                                {
                                    "name": "Legal Basis",
                                    "source": "ofac-sdn-list",
                                    "value": "Executive Order 13664 (South Sudan)"
                                },
                                {
                                    "name": "Legal Basis",
                                    "source": "tresor-direction-generale",
                                    "value": "SSi.003"
                                },
                                {
                                    "name": "List Name",
                                    "source": "ofac-sdn-list",
                                    "value": "SDN List"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "hm-treasury-list",
                                    "value": "13265"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "europe-sanctions-list",
                                    "value": "EU.3805.30"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "EU.3805.30"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "ofac-sdn-list",
                                    "value": "OFAC-16910"
                                },
                                {
                                    "name": "Listing Origin",
                                    "source": "hm-treasury-list",
                                    "value": "UN"
                                },
                                {
                                    "name": "Listing Origin",
                                    "source": "swiss-seco-list",
                                    "value": "UN, EU"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "hm-treasury-list",
                                    "value": "(UK Sanctions List Ref):SSU0003 (UNRef):SSi.003 (Further Identifying Information):Appointed commander of the Sudan People's Liberation Army in Opposition (SPLA-IO) Special Division in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government. INTERPOL-UN Security Council Special Notice web link: https://www.interpol.int/en/notice/search/un/5879069"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "swiss-seco-list",
                                    "value": "Appointed commander of the Sudan People's Liberation Army in Opposition (SPLA-IO) Special Division in Dec 2014. His forces have been engaged in attacks against civilians. In Feb 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government."
                                },
                                {
                                    "name": "Other Information",
                                    "source": "un-consolidated",
                                    "value": "Appointed commander of the Sudan People's Liberation Army in Opposition (SPLA-IO) Special Division in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government. INTERPOL-UN Security Council Special Notice web link: https://www.interpol.int/en/How-we-work/Notices/View-UN-Notices-Individuals"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "sfm-ukraine",
                                    "value": "Appointed commander of the Sudan People`s Liberation Army in Opposition (SPLA-IO) Special Division in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government."
                                },
                                {
                                    "name": "Other Information",
                                    "source": "south-africa-targeted-financial-sanctions-list-person",
                                    "value": "Appointed commander of the Sudan Peoples Liberation Army in Opposition (SPLA-IO) Special Division in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government. INTERPOL-UN Security Council Special Notice web link: https://www.interpol.int/en/How-we-work/Notices/View-UN-Notices-Individuals"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "value": "Major General; Appointed commander of the Sudan People's Liberation Army in Opposition (SPLA-IO) SpecialDivision in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape,torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with thegovernment. INTERPOL-UN Security Council Special Notice web link: https://www.interpol.int/en/How-we-work/ Notices/View-UN-Notices-Individuals"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "dfat-australia-list",
                                    "value": "Title: Major General. Passport no: R00012098, South Sudan. Appointed commander of the Sudan People's Liberation Army in Opposition (SPLAIO) Special Division in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government."
                                },
                                {
                                    "name": "Other Information",
                                    "source": "argentina-ministerio-de-relaciones-exteriores-y-culto-sanciones-de-la-onu",
                                    "value": "Título: General de División Cargo:Fecha de nacimiento: 1961 Lugar de nacimiento:Alias de buena calidad: a) James Koang Chol Ranley b) James Koang Chol c) Koang Chuol Ranley d) James Koang Chual Alias de baja calidad:Nacionalidad: Sudán del Sur Número de pasaporte: Pasaporte de Sudán del Sur núm. R00012098 Número nacional de identidad:Domicilio:Fecha de inclusión: 1 jul. 2015"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "belarus-state-security-agency-list-of-organizations-and-individuals-involved-in-terrorist-activities",
                                    "value": "В декабре 2014 года назначен командующим Особой дивизии Народно-освободительной армии Судана в оппозиции (НОАС в оппозиции). Силы под его командованием участвовали в нападениях на гражданское население. В феврале 2014 года его люди совершали нападения на лагеря Организации Объединенных Наций, больницы, церкви и школы, широко применяя изнасилования и пытки и уничтожая имущество с целью изгнать мирных жителей, военнослужащих и полицейских, выступающих на стороне правительства. Ссылка на веб-ресурс \"Специальные уведомления Интерпола - Совета Безопасности ООН\": https://www.interpol.int/en/How-we-work/Notices/View-UN-Notices-Individual"
                                },
                                {
                                    "name": "Program",
                                    "source": "dfat-australia-list",
                                    "value": "2206 (South Sudan)"
                                },
                                {
                                    "name": "Program",
                                    "source": "argentina-ministerio-de-relaciones-exteriores-y-culto-sanciones-de-la-onu",
                                    "value": "Comité 2206 Sudán del Sur"
                                },
                                {
                                    "name": "Program",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "value": "List of individuals and entities published under section 32 of the UN Sanctions (South sudan) Regulation 2018 (Cap.537CC) (updated on 22 November 2018)"
                                },
                                {
                                    "name": "Program",
                                    "source": "swiss-seco-list",
                                    "value": "Ordinance of 12 August 2015 on measures against the Republic of South Sudan (SR 946.231.169.9), annexes 1 and 2"
                                },
                                {
                                    "name": "Program",
                                    "source": "ofac-sdn-list",
                                    "value": "SOUTH SUDAN"
                                },
                                {
                                    "name": "Program",
                                    "source": "europe-sanctions-list",
                                    "value": "SSD"
                                },
                                {
                                    "name": "Program",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "SSD"
                                },
                                {
                                    "name": "Program",
                                    "source": "hm-treasury-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Program",
                                    "source": "un-consolidated",
                                    "value": "SouthSudan"
                                },
                                {
                                    "name": "Program",
                                    "source": "sfm-ukraine",
                                    "value": "Резолюція РБ ООН 2206 (2015)"
                                },
                                {
                                    "name": "Reason",
                                    "source": "tresor-direction-generale",
                                    "value": "Ses forces se sont livrées à des attaques contre des civils. En février 2014, des forces placées sous son commandement ont attaqué des camps des Nations unies, des hôpitaux, des églises et des écoles et commis de nombreux viols, actes de torture et destructions de biens, pour tenter de débusquer des civils, soldats et policiers alliés au gouvernement"
                                },
                                {
                                    "name": "Reason",
                                    "source": "belarus-state-security-agency-list-of-organizations-and-individuals-involved-in-terrorist-activities",
                                    "value": "Санкционный перечень Комитета Совета Безопасности ООН, учрежденный резолюцией 2206 (2015)."
                                },
                                {
                                    "name": "Related URL",
                                    "source": "europe-sanctions-list",
                                    "tag": "related_url",
                                    "value": "http://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32017R0402&from=EN"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "tag": "related_url",
                                    "value": "http://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32017R0402&from=EN"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "tresor-direction-generale",
                                    "tag": "related_url",
                                    "value": "https://gels-avoirs.dgtresor.gouv.fr/List"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "argentina-ministerio-de-relaciones-exteriores-y-culto-sanciones-de-la-onu",
                                    "tag": "related_url",
                                    "value": "https://www.cancilleria.gob.ar/es/politica-exterior/seguridad-internacional/comite-de-sanciones/comite-2206-sudan-del-sur"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "tag": "related_url",
                                    "value": "https://www.cedb.gov.hk/assets/document/citb/03_CITB_2.0_Policies/CITB_2.0_Policies_Eng/Policies/List_of_TargetedFinancialSanctions_south_sudan_en.pdf"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "un-consolidated",
                                    "tag": "related_url",
                                    "value": "https://www.un.org/securitycouncil/content/un-sc-consolidated-list"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "ofac-sdn-list",
                                    "value": "Block"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "swiss-seco-list",
                                    "value": "art. 2, para. 1 let. a (Financial sanctions) et art. 4, para. 1 and 2 (Travel ban), annexe 1"
                                },
                                {
                                    "name": "Title",
                                    "source": "swiss-seco-list",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "hm-treasury-list",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "un-consolidated",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "ofac-sdn-list",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "sfm-ukraine",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "europe-sanctions-list",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "south-africa-targeted-financial-sanctions-list-person",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "Major General"
                                },
                                {
                                    "name": "Title",
                                    "source": "tresor-direction-generale",
                                    "value": "commandant de la division spéciale de l'Armée populaire de libération du Soudan (APLS) dans l'opposition en décembre 2014"
                                },
                                {
                                    "name": "Un Listing Id",
                                    "source": "un-consolidated",
                                    "value": "SSi.003"
                                },
                                {
                                    "name": "Un Listing Id",
                                    "source": "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                    "value": "SSi.003"
                                },
                                {
                                    "name": "Un Listing Id",
                                    "source": "south-africa-targeted-financial-sanctions-list-person",
                                    "value": "SSi.003"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Kenya, South Sudan, Sudan, Tanzania, United Kingdom, United States"
                                }
                            ],
                            "id": "H0SVUC5007H24TO",
                            "last_updated_utc": "2023-02-20T18:27:43Z",
                            "media":
                            [
                                {
                                    "date": "2003-11-02T00:00:00Z",
                                    "snippet": "\"The needs are massive, but there is virtually no humanitarian presence in the area, and attacks on health workers and facilities deprive patients of any care.\" In the last decade, MSF has lost eight Sudanese health workers to violence, including, most recently, James Koang, who was killed in the aerial bombing of Nimne in February 2002. Health workers, and, at times, patients, also have been forcibly recruited as soldiers by various factions.",
                                    "title": "(no title)",
                                    "url": "https://www.doctorswithoutborders.org/sites/default/files/2018-12/alert_2-2003.pdf"
                                },
                                {
                                    "date": "2014-05-09T00:00:00Z",
                                    "pdf_url": "http://complyadvantage-asset.s3.amazonaws.com/54bc0461-306b-45d9-81f1-90be3157fbd8.pdf",
                                    "snippet": "Flooding The UN imposed sanctions on Gen Peter Gadet this week in connection with this killing, but it was Maj-Gen James Koang Chol who was in charge of the troops. He rejected the UN report about what happened under his command when Bentiu was re-taken by the rebels.",
                                    "title": "Investigating rape and murder in South Sudan's Bentiu - BBC News",
                                    "url": "http://www.bbc.com/news/world-africa-27329787"
                                },
                                {
                                    "date": "2017-05-13T00:00:00Z",
                                    "snippet": "James Koang admits to killing unarmed civilians Email",
                                    "title": "James Koang admits to killing unarmed civilians",
                                    "url": "http://www.newnationsouthsudan.com/special-report/james-koang-admits-to-killing-unarmed-civilians.html"
                                },
                                {
                                    "date": "2002-02-15T00:00:00Z",
                                    "snippet": "Hundreds fled to Bentiu and other areas in the region. A few individuals, including MSF's James Koang, returned several days later to Nimne where Koang was killed by the February 9 bombing. The attack on Nimne came on the same day that planes of the government of Sudan bombed Akuem in the southern state of Bahr al-Ghazal, hours after a food airdrop from the UN World Food Program (WFP).",
                                    "title": "MSF Denounces Killing of Aid Worker and Civilians in Southern Sudan | Doctors Without Borders - USA",
                                    "url": "https://www.doctorswithoutborders.org/what-we-do/news-stories/news/msf-denounces-killing-aid-worker-and-civilians-southern-sudan"
                                },
                                {
                                    "date": "2014-01-10T00:00:00Z",
                                    "snippet": "The where about of the rebels' Chief of Staff Maj. Gen. James Koang are not known as he escaped from the captured town. He added that, one of Koang's Commanders Brig. Gen Makar surrendered to the Sudan Armed Forces (SAF) in Heglig with a number of vehicles and tanks.",
                                    "title": "SPLA Recaptures Unity State Capital > Gurtong Trust > Editorial",
                                    "url": "http://www.gurtong.net/ECM/Editorial/tabid/124/ctl/ArticleView/mid/519/articleId/14499/SPLA-Recaptures-Unity-State-Capital.aspx"
                                },
                                {
                                    "date": "2020-08-02T00:00:00Z",
                                    "snippet": "a commander of rebel forces and a major general in the army loyal to President Salva Kiir. James Koang Chuol, a 53-year-old major general who defected from the South Sudan army, was cited for involvement in rebel attacks that \"targeted civilians, including women and children, with killing, sexual violence and attacks on schools, hospitals, religious sites, and locations where civilians were seeking refuge.\" Santino Deng Wol, 51, a top commander in the Sudan People's Liberation Army, is accused by the US Treasury Department of obstructing progress toward peace following the two sides' signing of a ceasefire agreement in January.",
                                    "title": "South Sudan generals face sanctions - The East African",
                                    "url": "https://www.theeastafrican.co.ke/news/South-Sudan-generals-face-sanctions-/-/2558/2459940/-/yxldgcz/-/index.html"
                                },
                                {
                                    "date": "2014-04-20T00:00:00Z",
                                    "snippet": "Reports released by the Sudanese social media and activists however directly blamed the rebels claiming that over 200 Darfur civilians were shot dead inside the Mosque in Bentiu town. However, the rebel commander in charge of Unity state's military division 4, Maj. Gen. James Koang Chol, dismissed the accusation as \"lies.\" \"By the time we came in Bentiu for this second time there were no Sudanese civilians or traders still in Bentiu who we were aware of as they all fled in the early weeks of January 2014 when violence erupted in Bentiu,\" Gen Koang told Sudan Tribune on Sunday by phone from Bentiu.",
                                    "title": "South Sudan rebels deny killing Darfurian traders in Unity state - Sudan Tribune: Plural news and views on Sudan",
                                    "url": "https://www.sudantribune.com/spip.php?article50723"
                                },
                                {
                                    "date": "2017-09-12T00:00:00Z",
                                    "snippet": "Plural news and views on Sudan South Sudan rebels dismiss alleged arrest of two officials August 1, 2017 (JUBA) The armed opposition faction allied to the country's former First Vice President, Riek Machar on Tuesday dismissed allegations that Sudanese intelligence agents allegedly arrested their chief of general staff, Gen. Gatwech Dual and Gen. James Koang Chuol in the country's capital, Khartoum on Monday. The accusation comes after the Jikany Nuer Community in South Sudan and Ethiopia claimed that at least four rebel generals have defected to the government.",
                                    "title": "South Sudan rebels dismiss alleged arrest of two officials - Sudan Tribune: Plural news and views on Sudan",
                                    "url": "http://www.sudantribune.com/spip.php?article63142"
                                },
                                {
                                    "date": "2016-12-16T00:00:00Z",
                                    "snippet": "Koang confirmed opposition forces had killed some people in Bentiu, but maintained the victims were not civilians , but members of the Justice and Equality Movement (JEM), a Sudanese opposition group. Both the UN and the US have imposed sanctions on Koang, with the US Treasury department accusing the general of leading forces who \"targeted civilians, including women and children, with killing, sexual violence and attacks on schools, hospitals, religious sites, and locations where civilians were seeking refuge.\" Unmiss, which has been accused by Juba of supporting rebels, has not replied to a request for comments on the allegations.",
                                    "title": "South Sudan war: Unmiss accused of arming SPLM-IO forces accused of massacres",
                                    "url": "https://www.ibtimes.co.uk/unmiss-gave-weapons-splm-io-forces-who-later-committed-atrocities-bentiu-claims-research-group-1596881"
                                },
                                {
                                    "date": "2018-10-21T00:00:00Z",
                                    "snippet": "UNMISS also accused the rebel SPLM-In-Opposition of separating civilians along tribal lines, saying Darfuris were specifically targeted and killed at the hospital along with other civilians. However, the rebel commander in charge of Unity state's military division 4, Maj. Gen. James Koang Chol, dismissed the accusation as \"lies\" when contacted by Sudan Tribune by phone on Sunday. However, he admitted to the killing of armed Sudanese nationals who were fighting alongside Kiir's forces.",
                                    "title": "Sudan condemns Bentiu atrocities, accuses Juba of using Darfur rebels - Sudan Tribune: Plural news and views on Sudan",
                                    "url": "http://www.sudantribune.com/spip.php?article50753"
                                },
                                {
                                    "date": "2018-10-21T00:00:00Z",
                                    "snippet": "In 2016, the U.S. imposed a travel ban and asset freezes on six officials from government and the opposition. General Marial Chaunuong, Gen Jok Riak, and Gen Santino Deng Wol were sanctioned on the government side while General Peter Gatdet, General James Koang Chuol and General Gatwech Dual were sanctioned on the side of the armed opposition movement. In 2017, the U.S. Treasury Department sanctioned Malek, Malong, and Lueth for playing a negative role in the country's peace process.",
                                    "title": "U.N Security Council fell short of vote to sanction senior South Sudanese officials: diplomat - Sudan Tribune: Plural news and views on Sudan",
                                    "url": "http://www.sudantribune.com/spip.php?article65513"
                                },
                                {
                                    "date": "2014-09-18T00:00:00Z",
                                    "snippet": "The U.S. Treasury Department announced sanctions on James Koang Chuol, who defected from South Sudan's army , the Sudan People's Liberation Army (SPLA), to join the rebel forces, and Santino Deng Wol , an SPLA major general. It accused Koang of leading anti-government forces that \"targeted civilians, including women and children, with killing, sexual violence and attacks on schools, hospitals, religious sites, and locations where civilians were seeking refuge.\" The Treasury Department accused Deng Wol of expanding the conflict in South Sudan and of obstructing peace, saying he conducted confrontational troop movements after the signing of a Jan. 23 ceasefire agreement.",
                                    "title": "U.S. sanctions military officers on both sides of South Sudan conflict - Jamestown Sun | News, weather, sports from Jamestown North Dakota",
                                    "url": "https://www.jamestownsun.com/news/u-s-sanctions-military-officers-on-both-sides-of-south-sudan-conflict"
                                },
                                {
                                    "date": "2014-09-18T00:00:00Z",
                                    "snippet": "?Santino Deng Wol, an SPLA major general. It accused Koang of leading anti-government forces that \"targeted civilians, including women and? ?children, with killing, sexual violence and attacks on schools, hospitals, religious sites, and locations where civilians were seeking refuge.\"",
                                    "title": "U.S. sanctions military officers on both sides of South Sudan conflict | Jamestown Sun",
                                    "url": "http://www.jamestownsun.com/node/3493557"
                                },
                                {
                                    "date": "2017-08-01T00:00:00Z",
                                    "snippet": "Major General Marial Chanuong Yol Mangok, commander of President Salva Kiir's presidential guard; Lieutenant General Gabriel Jok Riak, whose forces are fighting in Unity State; and Major General Santino Deng Wol, who led an offensive through Unity State in May in which children, women and old men were killed. From the rebels, the sanctions target Major General Simon Gatwech Dual, chief of the general staff, Major General James Koang Chuol, who led attacks in Upper Nile State and General Peter Gadet, the rebels' deputy chief of staff for operations. The six were the first to be targeted by a newly formed UN sanctions committee formed after the Security Council, frustrated by the failure of successive ceasefires, agreed to punish those deemed responsible for the violence.",
                                    "title": "UN imposes first sanctions on six South Sudan commanders - Region - World - Ahram Online",
                                    "url": "http://english.ahram.org.eg/NewsContent/2/8/134315/World/Region/UN-imposes-first-sanctions-on-six-South-Sudan-comm.aspx"
                                },
                                {
                                    "date": "2020-07-28T00:00:00Z",
                                    "snippet": "The Small Arms Survey, a lobby group disclosed in a new investigation released last week that the UN officials operating in South Sudan's Bentiu town offered dozens of weapons and ammunitions to rebel General James Koang after the outbreak of war in 2013. The report says the weapons were later used for committing war crimes and crimes against humanity after Gen Koang's troops stormed a mosque and hospital and killed dozens of civilians in Bentiu. The weapons were collected from the soldiers and civilians who sought protection at a UN base in Bentiu after fighting occurred between President Salva Kiir forces and rebels in 2014, the report says.",
                                    "title": "UN peacekeepers implicated in South Sudan atrocities - The East African",
                                    "url": "https://www.theeastafrican.co.ke/news/UN-peacekeepers-implicated-in-South-Sudan-atrocities/2558-3491664-mif8y3z/index.html"
                                },
                                {
                                    "date": "2016-12-21T00:00:00Z",
                                    "snippet": "The Small Arms Survey, a lobby group disclosed in a new investigation released last week that the UN officials operating in South Sudan's Bentiu town offered dozens of weapons and ammunitions to rebel General James Koang after the outbreak of war in 2013. The report says the weapons were later used for committing war crimes and crimes against humanity after Gen Koang's troops stormed a mosque and hospital and killed dozens of civilians in Bentiu. (NMG)",
                                    "title": "UN peacekeepers implicated in atrocities in South Sudan - East Africa News | The Citizen",
                                    "url": "http://www.thecitizen.co.tz/News/UN-peacekeepers-implicated-in-atrocities-in-South-Sudan/1840360-3493668-n9sb6qz/index.html"
                                },
                                {
                                    "date": "2015-07-03T00:00:00Z",
                                    "snippet": "For instance, he explained that their now sanctioned chief of general staff, Maj-Gen Simon Gatwech Dual, who was only appointed last year by the rebel leadership after the conflict erupted in December 2013, fled the capital, Juba, for his life in January when his house was attacked by presidential guards and forces loyal to president Kiir. Dak also said the same was true with both Maj-General Peter Gatdet Yak and Maj-Gen James Koang Chuol, who only responded to the mass killing of ethnic Nuer civilians in Juba. General Yak was in charge of army division 8 in Jonglei state while General Chuol was in charge of division 4 in Unity state.",
                                    "title": "UN sanctions will not affect military operations against rebels : officials - Sudan Tribune",
                                    "url": "https://sudantribune.com/article54078/"
                                },
                                {
                                    "date": "2014-09-20T00:00:00Z",
                                    "snippet": "According to the treasury, Wol is accused of breaking the agreement with a series of military engagements in which his forces recaptured the towns of Mayom, Tor Abyad and Wang Kai from the rebels. The statement also accused the rebel commander Koang of carrying out attacks against civilians in Unity state. The rebel attacks \"targeted civilians, including women and children, with killing, sexual violence and attacks on schools, hospitals, religious sites, and locations where civilians were seeking refuge,\" says the statement.",
                                    "title": "US imposes sanctions on more South Sudanese military - Sudan Tribune",
                                    "url": "https://sudantribune.com/article51178/"
                                },
                                {
                                    "date": "2014-09-19T00:00:00Z",
                                    "snippet": "The US Treasury Department announced sanctions on James Koang Chuol, who defected from South Sudan's army, the Sudan People's Liberation Army (SPLA), to join the rebel forces, and Santino Deng Wol, an SPLA major general. It accused Koang of leading anti-government forces that \"targeted civilians, including women and children, with killing, sexual violence and attacks on schools, hospitals, religious sites, and locations where civilians were seeking refuge.\" The Treasury Department accused Deng Wol of expanding the conflict in South Sudan and of obstructing peace, saying he conducted confrontational troop movements after the signing of a January 23 ceasefire agreement.",
                                    "title": "US sanctions military officers on both sides of S Sudan conflict – Stabroek News",
                                    "url": "https://www.stabroeknews.com/2014/news/world/09/19/us-sanctions-military-officers-sides-s-sudan-conflict/"
                                },
                                {
                                    "date": "2018-12-27T00:00:00Z",
                                    "snippet": "Eleven SPLA soldiers were reportedly killed in the attack. The SPLA fourth division commander in Rubkotna, James Koang Chuol, accused Hoth and other local officials of being complicit in the attack. The attack on the army base was allegedly carried out by about 20 armed Leek youth, with eyewitnesses describing the fighting as some of the fiercest the region has seen.",
                                    "title": "Unity state: Rubkotna residents urged to refrain from tribal violence - Sudan Tribune: Plural news and views on Sudan",
                                    "url": "http://www.sudantribune.com/spip.php?article49038"
                                }
                            ],
                            "name": "Chuol James Koang",
                            "sources":
                            [
                                "argentina-ministerio-de-relaciones-exteriores-y-culto-sanciones-de-la-onu",
                                "belarus-state-security-agency-list-of-organizations-and-individuals-involved-in-terrorist-activities",
                                "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                "complyadvantage-adverse-media",
                                "dfat-australia-list",
                                "europe-sanctions-list",
                                "hm-treasury-list",
                                "hong-kong-special-administrative-region-sanctions-issued-under-the-un-sanctions-ordinance",
                                "ofac-sdn-list",
                                "sfm-ukraine",
                                "south-africa-targeted-financial-sanctions-list-person",
                                "swiss-seco-list",
                                "tresor-direction-generale",
                                "un-consolidated"
                            ],
                            "types":
                            [
                                "adverse-media",
                                "adverse-media-v2-terrorism",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft",
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types":
                        [
                            "aka_exact"
                        ],
                        "match_types_details":
                        [
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches": [
                                    {
                                        "match_types": [
                                            "exact_birth_year_match"
                                        ],
                                        "query_term": "1966"
                                    }
                                ],
                                "sources":
                                [
                                    "United Kingdom HM Treasury Office of Financial Sanctions Implementation Consolidated List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "Chuol James Koang",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches": [
                                    {
                                        "match_types": [
                                            "exact_birth_year_match"
                                        ],
                                        "query_term": "1966"
                                    }
                                ],
                                "sources":
                                [
                                    "OFAC SDN List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "Chuol James Koang",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "France Tresor Direction Generale Liste Unique de Gels"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "DFAT Australia Consolidated Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                               "secondary_matches": [
                                    {
                                        "match_types": [
                                            "exact_birth_year_match"
                                        ],
                                        "query_term": "1966"
                                    }
                                ],
                                "sources":
                                [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Hong Kong Special Administrative Region Sanctions issued under the UN Sanctions Ordinance"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "South Africa Targeted Financial Sanctions List persons"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Belarus State Security Agency List of Organizations and Individuals Involved in Terrorist Activities"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "Chuol James Koang",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "EU External Action Service - Consolidated list of Sanctions"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "Chuol James Koang",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Belgium Consolidated List of the National and European Sanctions"
                                ]
                            }
                        ],
                        "score": 1.7
                    },
                    {
                        "doc":
                        {
                            "aka":
                            [
                                {
                                    "name": "James Chuol"
                                },
                                {
                                    "name": "James Koang Chual"
                                },
                                {
                                    "name": "James Koang Chol"
                                },
                                {
                                    "name": "Koang Chuol Ranley"
                                },
                                {
                                    "name": "Chuol James Koang"
                                },
                                {
                                    "name": "James Koang Chuol"
                                },
                                {
                                    "name": "James Koang Chol Ranley"
                                }
                            ],
                            "fields":
                            [
                                {
                                    "name": "Nationality",
                                    "source": "monaco-economic-sanctions",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Passport",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "tag": "passport",
                                    "value": "R00012098, South Sudan"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "monaco-economic-sanctions",
                                    "value": "(UE) 2015/1112 du 09/07/2015, (UE) 2017/402 du 07/03/2017, décision du comité des sanctions des Nations unies du 01/07/2015; DM 2021-01 du 04/06/2021"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "value": "2015-07-01"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2021-06-04"
                                },
                                {
                                    "name": "Function",
                                    "source": "monaco-economic-sanctions",
                                    "value": "commandant de la division spéciale de l'Armée populaire de libération du Soudan (APLS) dans l'opposition en décembre 2014"
                                },
                                {
                                    "name": "Issuing Authority",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "value": "Anti-Money Laundering and Terrorist Financing Unit"
                                },
                                {
                                    "name": "Issuing Authority",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Ministre d'État"
                                },
                                {
                                    "name": "Other Info",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "value": "Appointed commander of the Sudan People's Liberation Army in Opposition (SPLA-IO) Special Division in December 2014. His forces have been engaged in attacks against civilians. In February 2014, forces under his command attacked United Nations camps, hospitals, churches, and schools, engaging in widespread rape, torture, and the destruction of property, in an attempt to flush out civilians, soldiers, and policemen allied with the government. INTERPOL-UN Security Council Special Notice web link: https://www.interpol.int/en/How-we-work/ Notices/View-UN-Notices-Individuals"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Other Info",
                                    "source": "monaco-economic-sanctions",
                                    "value": "N° Passeport : R00012098 : Soudan du Sud"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Program",
                                    "source": "monaco-economic-sanctions",
                                    "value": "ONU Soudan du sud - RCSNU 2206 (2015) et R (UE) 2015/735"
                                },
                                {
                                    "name": "Program",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "value": "SSi"
                                },
                                {
                                    "name": "Reason",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Ses forces se sont livrées à des attaques contre des civils. En février 2014, des forces placées sous son commandement ont attaqué des camps des Nations unies, des hôpitaux, des églises et des écoles et commis de nombreux viols, actes de torture et destructions de biens, pour tenter de débusquer des civils, soldats et policiers alliés au gouvernement"
                                },
                                {
                                    "name": "Un Listing Id",
                                    "source": "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                    "value": "SSi.003"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "South Sudan, Sudan"
                                }
                            ],
                            "id": "0YH0XNXIIVZEFIV",
                            "last_updated_utc": "2023-04-26T15:31:37Z",
                            "media":
                            [
                                {
                                    "date": "2010-05-10T00:00:00Z",
                                    "snippet": "Brigadier General John Jok who has been the Commissioner of Police in River Jur County of Western Bahr el Ghazal state said he left the state through permission to go to Nairobi, Kenya, for medical treatment and then left Juba for his County to check on his broken truck and to support his wife who was contesting for SPLM Women List for Juba parliament. He said Commissioner James Chuol had ordered for the looting of 6,600 Sudanese pounds and confiscated his rifles at Pulturuk Payam of the County, adding that more than ten people were also arrested by the Commissioner over the conspiracy issue. He added that he was also detained for two days.",
                                    "title": "I have not defected to Gen. George Athor Deng, says senior police officer - Sudan Tribune",
                                    "url": "https://sudantribune.com/article34808/"
                                }
                            ],
                            "name": "Chuol James Koang",
                            "sources":
                            [
                                "complyadvantage-adverse-media",
                                "egypt-anti-money-laundering-and-terrorist-financing-unit-security-council-sanctions-list",
                                "monaco-economic-sanctions"
                            ],
                            "types":
                            [
                                "adverse-media",
                                "adverse-media-v2-violence-aml-cft",
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types":
                        [
                            "name_exact"
                        ],
                        "match_types_details":
                        [
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Egypt Anti-Money Laundering and Terrorist Financing Unit Security Council Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Monaco Economic Sanctions"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chol Ranley",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Monaco Economic Sanctions"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chual",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Monaco Economic Sanctions"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Egypt Anti-Money Laundering and Terrorist Financing Unit Security Council Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chual",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Egypt Anti-Money Laundering and Terrorist Financing Unit Security Council Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "Chuol James Koang",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Monaco Economic Sanctions"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chol Ranley",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Egypt Anti-Money Laundering and Terrorist Financing Unit Security Council Sanctions List"
                                ]
                            }
                        ],
                        "score": 1.7
                    },
                    {
                        "doc":
                        {
                            "aka":
                            [
                                {
                                    "name": "James Koang Chual"
                                },
                                {
                                    "name": "ジェームズ・コアン・チョル・ランレイ"
                                },
                                {
                                    "name": "James Koang Chol"
                                },
                                {
                                    "name": "Koang Chuol Ranley"
                                },
                                {
                                    "name": "ジェームズ・コアン・チュオル"
                                },
                                {
                                    "name": "ジェームズ・コアン・チュアル"
                                },
                                {
                                    "name": "James Koang Chuol"
                                },
                                {
                                    "name": "James Koang Chol Ranley"
                                },
                                {
                                    "name": "コアン・チョル・ランレイ"
                                },
                                {
                                    "name": "ジェームズ・コアン・チョル"
                                }
                            ],
                            "fields":
                            [
                                {
                                    "name": "Nationality",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1961"
                                },
                                {
                                    "name": "Passport",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "tag": "passport",
                                    "value": "南スーダン旅券,R00012098"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "value": "2015-07-01"
                                },
                                {
                                    "name": "Issuing Authority",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "value": "Ministry of Finance of Japan"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "value": "2014 年 12 月にスーダン人民解放軍反体制派(SPLA-IO)特別部隊の指揮官に任命された。同人の部隊は,民間人に対する攻撃に関与している。2014年2月,同人の指揮下にある部隊は,政府側の民間人,軍人,警察官を排除しようとして,広い範囲での強姦,拷問,器物破壊に関与し,国連駐屯地,病院,教会,学校を攻撃した。"
                                },
                                {
                                    "name": "Program",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "value": "南スーダンにおける平和等を脅かす行為等に関与した者等"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "tag": "related_url",
                                    "value": "https://www.mof.go.jp/international_policy/gaitame_kawase/gaitame/economic_sanctions/"
                                },
                                {
                                    "name": "Title",
                                    "source": "ministry-of-finance-japan-economic-sanctions-list",
                                    "value": "少将"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "South Sudan"
                                }
                            ],
                            "id": "BOPYI4R887JPBQO",
                            "last_updated_utc": "2022-09-21T12:39:59Z",
                            "name": "James Koang Chuol",
                            "sources":
                            [
                                "ministry-of-finance-japan-economic-sanctions-list"
                            ],
                            "types":
                            [
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types":
                        [
                            "aka_exact"
                        ],
                        "match_types_details":
                        [
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chual",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Ministry of Finance Japan Economic Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chol Ranley",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Ministry of Finance Japan Economic Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chuol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Ministry of Finance Japan Economic Sanctions List"
                                ]
                            },
                            {
                                "aml_types":
                                [
                                    "sanction"
                                ],
                                "matching_name": "James Koang Chol",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "Ministry of Finance Japan Economic Sanctions List"
                                ]
                            }
                        ],
                        "score": 1.7
                    },
                    {
                        "doc":
                        {
                            "aka":
                            [
                                {
                                    "name": "James C. Kang"
                                }
                            ],
                            "fields":
                            [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United States"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United States"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "United States"
                                }
                            ],
                            "id": "5292DB0SHK05MIT",
                            "last_updated_utc": "2021-03-27T12:06:51Z",
                            "media":
                            [
                                {
                                    "snippet": "Plaintiff James C. Kang was, at all relevant times, a resident and 14 citizen of the State of California. Plaintiff Kang was employed by Defendant as a 15 mortgage broker in Defendant's Palo Alto Branch, in the State of California, 16 during the liability period as alleged herein. Plaintiff Kang started with Defendant 17 in approximately October 2000 and, other than a short break in employment in 18 2011, was employed by Defendant through May 2015.",
                                    "title": "Kang v. Wells Fargo Bank, N.A., No. 5:2017cv06220 - Document 63 (N.D. Cal. 2019) :: Justia",
                                    "url": "https://law.justia.com/cases/federal/district-courts/california/candce/5:2017cv06220/318670/63/"
                                }
                            ],
                            "name": "James C. Kang",
                            "sources":
                            [
                                "complyadvantage-adverse-media"
                            ],
                            "types":
                            [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types":
                        [
                            "unknown"
                        ],
                        "match_types_details":
                        [
                            {
                                "aml_types":
                                [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "James C Kang",
                                "name_matches":
                                [
                                    {
                                        "match_types":
                                        [
                                            "exact_match"
                                        ],
                                        "query_term": "james"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "edit_distance"
                                        ],
                                        "query_term": "koang"
                                    },
                                    {
                                        "match_types":
                                        [
                                            "word_to_initial"
                                        ],
                                        "query_term": "chuol"
                                    }
                                ],
                                "secondary_matches":
                                [],
                                "sources":
                                [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    }
                ]
            }
        },
        "status": "success"
    }
    "#;
    serde_json::from_str(s).unwrap()
}

pub fn incode_watchlist_result_response_no_hits() -> serde_json::Value {
    serde_json::json!({
        "content":
        {
            "data":
            {
                "id": 23523445,
                "ref": "23545234534-X0lf23454jZ_",
                "searcher_id": 345820,
                "assignee_id": 5342453,
                "filters":
                {
                    "country_codes":
                    [],
                    "exact_match": false,
                    "fuzziness": 0.5,
                    "remove_deceased": 0,
                    "types":
                    [
                        "adverse-media-v2-regulatory",
                        "fitness-probity",
                        "pep-class-1",
                        "adverse-media-v2-property",
                        "adverse-media-v2-other-serious",
                        "adverse-media-v2-violence-non-aml-cft",
                        "adverse-media-v2-financial-difficulty",
                        "pep-class-4",
                        "pep",
                        "adverse-media-v2-cybercrime",
                        "adverse-media-v2-fraud-linked",
                        "adverse-media-v2-other-financial",
                        "pep-class-2",
                        "adverse-media-v2-other-minor",
                        "adverse-media-v2-general-aml-cft",
                        "adverse-media-v2-terrorism",
                        "adverse-media-v2-narcotics-aml-cft",
                        "sanction",
                        "warning",
                        "pep-class-3",
                        "adverse-media-v2-financial-aml-cft",
                        "adverse-media-v2-violence-aml-cft"
                    ]
                },
                "match_status": "potential_match",
                "risk_level": "unknown",
                "search_term": "Piip Penguin",
                "total_hits": 0,
                "total_matches": 0,
                "updated_at": "2023-05-19 23:56:10",
                "created_at": "2023-05-19 23:56:10",
                "tags":
                [],
                "limit": 100,
                "offset": 0,
                "hits":
                []
            }

        },
        "status": "success"
    })
}

pub fn incode_watchlist_result_response_yes_hits() -> serde_json::Value {
    serde_json::json!({
        "content":
        {
            "data":
            {
                "id": 13243589,
                "ref": "152345423570-X0lf4jZ_",
                "searcher_id": 17656345,
                "assignee_id": 64354356,
                "filters":
                {
                    "country_codes":
                    [],
                    "exact_match": false,
                    "fuzziness": 0.5,
                    "remove_deceased": 0,
                    "types":
                    [
                        "adverse-media-v2-regulatory",
                        "fitness-probity",
                        "pep-class-1",
                        "adverse-media-v2-property",
                        "adverse-media-v2-other-serious",
                        "adverse-media-v2-violence-non-aml-cft",
                        "adverse-media-v2-financial-difficulty",
                        "pep-class-4",
                        "pep",
                        "adverse-media-v2-cybercrime",
                        "adverse-media-v2-fraud-linked",
                        "adverse-media-v2-other-financial",
                        "pep-class-2",
                        "adverse-media-v2-other-minor",
                        "adverse-media-v2-general-aml-cft",
                        "adverse-media-v2-terrorism",
                        "adverse-media-v2-narcotics-aml-cft",
                        "sanction",
                        "warning",
                        "pep-class-3",
                        "adverse-media-v2-financial-aml-cft",
                        "adverse-media-v2-violence-aml-cft"
                    ]
                },
                "match_status": "potential_match",
                "risk_level": "unknown",
                "search_term": "Piip Penguin",
                "total_hits": 1,
                "total_matches": 1,
                "updated_at": "2023-05-19 23:56:10",
                "created_at": "2023-05-19 23:56:10",
                "tags":
                [],
                "limit": 100,
                "offset": 0,
                "share_url": "https://app.eu.complyadvantage.com/public/search/abc/123",
                "hits":
                [
                    {
                        "doc":
                        {
                            "aka":
                            [
                                {
                                    "name": "Sir Piipy the Penguin"
                                },
                            ],
                            "fields":
                            [
                                {
                                    "name": "Nationality",
                                    "source": "europe-sanctions-list",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "tresor-direction-generale",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Nationality",
                                    "source": "un-consolidated",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Country",
                                    "source": "europe-sanctions-list",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "europe-sanctions-list",
                                    "value": "SUDAN"
                                },
                                {
                                    "name": "Place of Birth",
                                    "source": "europe-sanctions-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Original Place of Birth Text",
                                    "source": "europe-sanctions-list",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Sudan, United Kingdom"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya, South Sudan, Sudan, Tanzania, United States"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Sudan"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "europe-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1943"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Sudan"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "un-consolidated",
                                    "tag": "date_of_birth",
                                    "value": "1943"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Tanzania"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United States"
                                },
                                {
                                    "name": "Passport",
                                    "source": "europe-sanctions-list",
                                    "tag": "passport",
                                    "value": "National passport R123456789, Issuing Country SUDAN, SOUTH SUDAN"
                                },
                                {
                                    "name": "Passport",
                                    "source": "un-consolidated",
                                    "tag": "passport",
                                    "value": "Passport: R123456789, South Sudan"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "europe-sanctions-list",
                                    "value": "2016-02-05"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "europe-sanctions-list",
                                    "value": "2014/302 (OJ L123)"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "europe-sanctions-list",
                                    "value": "02-04-2014"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "un-consolidated",
                                    "value": "2014-03-01"
                                }
                            ],
                            "id": "H0SVUC5007H24TO",
                            "last_updated_utc": "2023-02-20T18:27:43Z",
                            "media":
                            [
                                {
                                    "date": "2002-10-01T00:00:00Z",
                                    "snippet": "\"Person of interest in fraud case",
                                    "url": "http://www.cnn.com/"
                                },
                                {
                                    "date": "2015-06-06T00:00:00Z",
                                    "snippet": "A CEO by the name of Piip Penguin has been found guilty of fraud",
                                    "title": "Fraudulent CEO arrested",
                                    "url": "http://www.bbc.com/"
                                },
                            ],
                            "name": "Piip Penguin",
                            "sources":
                            [
                                "complyadvantage-adverse-media",
                                "europe-sanctions-list",
                                "un-consolidated"
                            ],
                            "types":
                            [
                                "adverse-media",
                                "adverse-media-v2-terrorism",
                                "adverse-media-v2-fraud-linked",
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types":
                        [
                            "name_exact"
                        ],
                        "match_types_details": [
                            {
                                "secondary_matches": [
                                    {
                                        "match_types": [
                                            "fuzzy_birth_year_match"
                                        ],
                                        "query_term": "1966"
                                    }
                                ]
                            }
                        ],
                        "score": 1.7
                    },
                ]
            }

        },
        "status": "success"
    })
}

pub fn incode_curp_validation_good_curp() -> serde_json::Value {
    serde_json::json!({
        "success": true,
        "curp": "VIMR910502HNELLG04",
        "sex": "HOMBRE",
        "nationality": "HND",
        "result": "success",
        "renapo_valid": true,
        "names": "BOBOBERTO JOSE",
        "paternal_surname": "VILLEDA",
        "mothers_maiden_name": "BOBERR",
        "birthdate": "02/05/1995",
        "entity_birth": "NE",
        "probation_document": "3",
        "probation_document_data": {
            "foja": "",
            "numEntidadReg": "",
            "libro": "",
            "NumRegExtranjeros": "221223",
            "cveEntidadNac": "NE",
            "numActa": "",
            "CRIP": "",
            "tomo": "",
            "cveEntidadEmisora": "",
            "anioReg": "",
            "cveMunicipioReg": "",
            "FolioCarta": ""
        },
        "status_curp": "AN"
    })
}

pub fn incode_curp_validation_bad_curp(tipo_error: &str, codigo_error: &str) -> serde_json::Value {
    serde_json::json!({
        "success": false,
        "error": {
            "codigoError": codigo_error,
            "resultCURPS": {
                "numEntidadReg": "",
                "apellidoPaterno": "",
                "libro": "",
                "statusCurp": "",
                "cveEntidadNac": "",
                "numActa": "",
                "CRIP": "",
                "tomo": "",
                "cveEntidadEmisora": "",
                "FolioCertificado": "",
                "anioReg": "",
                "cveMunicipioReg": "",
                "FolioCarta": "",
                "CURP": "",
                "apellidoMaterno": "",
                "nombres": "",
                "nacionalidad": "",
                "foja": "",
                "NumRegExtranjeros": "",
                "fechNac": "",
                "sexo": "",
                "docProbatorio": ""
            },
            "statusOper": "NO EXITOSO",
            "tipoError": tipo_error,
            "sessionID": "LNvRMK1zysdZDYLo7hQt8IeVu1hFnZIgGRTjhIa4dNUhlsfb5hik!-1293949714!1708611644787",
            "message": "La CURP no se encuentra en la base de datos"
        },
        "result": "Not valid request: La CURP no se encuentra en la base de datos code: 06",
        "renapo_valid": false
    })
}

#[derive(Default)]
pub struct NeuroTestOpts {
    pub automated_activity: bool,
    pub bot_framework: bool,
    pub factory_reset: bool,
    pub fraud_ring_indicator: bool,
    pub device_id: Option<String>,
    pub cookie_id: Option<String>,
}
pub fn neuro_id_success_response(opts: NeuroTestOpts) -> serde_json::Value {
    serde_json::json!({
        "status": "SUCCESS",
        "message": "success",
        "moreInfo": null,
        "profile": {
            "siteId": "form_humor717",
            "funnel": "unknown",
            "clientId": opts.cookie_id.unwrap_or("c00a322f-2179-4ef2-812b-e14b43945069".into()),
            "deviceId": opts.device_id.unwrap_or("c00a322f-2179-4ef2-812b-e14b43945069".into()),
            "interactionAttributes": {
                "client_id_count": 1,
                "session_id_count": 1,
                "user_id_count": 1,
                "ip_geolocation": {
                    "accuracyRadius": 10,
                    "latitude": 43.0592,
                    "longitude": -73.7356,
                    "postalCode": "12866",
                    "timezone": "America/New_York",
                    "city": {
                        "name": "Saratoga Springs"
                    },
                    "country": {
                        "code": "US",
                        "name": "United States"
                    },
                    "continent": {
                        "code": "NA",
                        "name": "North America"
                    },
                    "subdivisions": [
                        {
                            "isoCode": "NY",
                            "name": "New York"
                        }
                    ]
                }
            },
            "signals": [
                {
                    "version": "3.0.nm",
                    "model": "familiarity",
                    "label": "medium",
                    "reasonCodes": [
                        "A2700",
                        "A2900",
                        "A2800"
                    ],
                    "score": 73.141122
                },
                {
                    "version": "1.0",
                    "model": "fraud_ring_indicator",
                    "label": opts.fraud_ring_indicator.to_string(),
                    "attributes": {},
                    "score": 0.0
                },
                {
                    "version": "1.0",
                    "model": "automated_activity",
                    "label": opts.automated_activity.to_string(),
                    "attributes": {},
                    "score": 0.0
                },
                {
                    "version": "1.0",
                    "model": "combined_digital_intent",
                    "label": "neutral",
                    "attributes": {},
                    "score": 0.5
                },
                {
                    "version": "1.0",
                    "model": "risky_device",
                    "label": "false",
                    "attributes": {
                        "risky_application_count": 0
                    },
                    "score": 0.0
                },
                {
                    "version": "1.0",
                    "model": "bot_framework",
                    "label": opts.bot_framework.to_string(),
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "factory_reset",
                    "label": opts.factory_reset.to_string(),
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "device_reputation",
                    "label": "false",
                    "attributes": {
                        "customer_blocklist": true,
                        "global_blocklist": true
                    }
                },
                {
                    "version": "1.0",
                    "model": "device_velocity",
                    "label": "false",
                    "attributes": {
                        "sessions_per_device_count_1_day": 1,
                        "sessions_per_device_count_1_week": 1,
                        "sessions_per_device_count_4_week": 1,
                        "sessions_per_device_count_12_week": 3
                    }
                },
                {
                    "version": "1.0",
                    "model": "incognito",
                    "label": "false",
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "multiple_ids_per_device",
                    "label": "false",
                    "attributes": {
                        "multiple_ids_per_device_count_1_day": 1,
                        "multiple_ids_per_device_count_1_week": 1,
                        "multiple_ids_per_device_count_4_week": 1,
                        "multiple_ids_per_device_count_12_week": 5
                    }
                },
                {
                    "version": "1.0",
                    "model": "public_proxy",
                    "label": "false",
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "gps_spoofing",
                    "label": "false",
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "suspicious_device",
                    "label": "false",
                    "attributes": {
                        "emulator": false,
                        "jailbroken": true,
                        "missing_expected_properties": false,
                        "frida": false
                    }
                },
                {
                    "version": "1.0",
                    "model": "tor_exit_node",
                    "label": "false",
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "vpn",
                    "label": "false",
                    "attributes": {}
                },
                {
                    "version": "1.0",
                    "model": "ip_address_association",
                    "label": "false",
                    "attributes": {
                        "aws_ip_set": false,
                        "azure_china_ip_set": false,
                        "azure_germany_ip_set": false,
                        "azure_government_ip_set": true,
                        "azure_public_ip_set": false,
                        "digital_ocean_ip_set": false,
                        "google_ip_set": false,
                        "oracle_ip_set": false,
                        "vultr_ip_set": false
                    }
                },
                {
                    "version": "1.0",
                    "model": "ip_blocklist",
                    "label": "false",
                    "attributes": {
                        "customer_blocklist": false,
                        "global_blocklist": false
                    }
                }
            ],
            "id": "6hJkiD8VKFWT9yK1SdF201BcxxMC_Pg5l66rHplSDGg"
        }
    })
}

pub fn incode_ine_not_found_in_db() -> serde_json::Value {
    serde_json::json!({
        "valid": false,
        "statusCode": 8,
        "registralSituation": {
            "tipoSituacionRegistral": "DATOS_NO_ENCONTRADOS"
        },
        "governmentValidation": {
            "validationStatus": {
                "value": "8",
                "status": "FAIL",
                "key": "userNotFoundInIneDb"
            },
            "overall": {
                "status": "FAIL"
            }
        },
        "customFields": {
            "firstName": null,
            "lastName": null
        },
        "ocrData": {
            "name": {
                "fullName": "BOBIERTA GOMEZ VELAZQUEZ",
                "machineReadableFullName": "VELAZQUEZ BOBIERTA GOMEZ",
                "firstName": "BOBIERTA",
                "givenName": "BOBIERTA",
                "givenNameMrz": "VELAZQUEZ BOBIERTA",
                "paternalLastName": "GOMEZ",
                "maternalLastName": "VELAZQUEZ",
                "lastNameMrz": "GOMEZ"
            },
            "address": "PERCYPENGUIN 1253 INT. 4\nMAIN 04800\nCEMALPA DE MORELOS, D.F",
            "addressFields": {
                "street": "PENGI 1253 INT. 4",
                "colony": "COMORELOS",
                "postalCode": "04800",
                "city": "PENGIN DE MORELOS",
                "state": "D.F",
                "stateCode": "09"
            },
            "fullAddress": true,
            "invalidAddress": false,
            "checkedAddressBean": {
                "zipColonyOptions": []
            },
            "exteriorNumber": "1253",
            "interiorNumber": "INT. 4",
            "typeOfId": "VoterIdentification",
            "documentFrontSubtype": "VOTER_IDENTIFICATION_CARD",
            "documentBackSubtype": "VOTER_IDENTIFICATION_CARD",
            "birthDate": 3316032,
            "gender": "F",
            "claveDeElector": "OINOIN",
            "curp": "OINSOINOIN",
            "numeroEmisionCredencial": "02",
            "cic": "123123",
            "ocr": "12312321",
            "expireAt": "1546214400000",
            "expirationDate": 2018,
            "issueDate": 2008,
            "registrationDate": 2008,
            "issuingCountry": "MEX",
            "birthPlace": "CL",
            "nationality": "MEX",
            "nationalityMrz": "MEX",
            "notExtracted": 0,
            "notExtractedDetails": [],
            "mrz1": "IDMEX1836577170<<0747116375842",
            "mrz2": "8007057M1812315MEX<02<<12345<7",
            "mrz3": "GOMEZ<<VELAZQUEZ<BOBIERTA<<<<",
            "fullNameMrz": "VELAZQUEZ BOBIERTA GOMEZ",
            "documentNumberCheckDigit": "0",
            "dateOfBirthCheckDigit": "7",
            "expirationDateCheckDigit": "5",
            "ocrDataConfidence": {
                "birthDateConfidence": 0.9461168,
                "nameConfidence": 0.96933496,
                "givenNameConfidence": 0.96933496,
                "firstNameConfidence": 0.96933496,
                "mothersSurnameConfidence": 0.97957855,
                "fathersSurnameConfidence": 0.97165126,
                "addressConfidence": 0.5680398,
                "streetConfidence": 0.8881735,
                "colonyConfidence": 0.8590793,
                "postalCodeConfidence": 0.96619743,
                "cityConfidence": 0.7587342,
                "stateConfidence": 0.5680398,
                "stateCodeConfidence": 0.9881933,
                "countryCodeConfidence": 0.9461168,
                "genderConfidence": 0.9461168,
                "expirationDateConfidence": 0.9461168,
                "expireAtConfidence": 0.9461168,
                "mrz1Confidence": 0.9756986,
                "mrz2Confidence": 0.9600486,
                "mrz3Confidence": 0.92436004,
                "documentNumberConfidence": 0.9461168,
                "backNumberConfidence": 0.9928337,
                "claveDeElectorConfidence": 0.9491997,
                "numeroEmisionCredencialConfidence": 0.9461168,
                "curpConfidence": 0.8678653,
                "birthPlaceConfidence": 0.8678653,
                "nationalityConfidence": 0.9461168,
                "nationalityMrzConfidence": 0.9461168
            }
        },
        "deviceInfo": {},
        "errorDescription": "userNotFoundInIneDb"
    })
}

pub fn samba_license_validation_pass() -> serde_json::Value {
    serde_json::json!({
      "Record": {
        "DlRecord": {
          "Criteria": {
            "OrderDate": {
              "Year": 2023,
              "Month": 7,
              "Day": 10,
              "Full": "2023-07-10",
              "Ticks": 1688947
            },
            "OrderTime": {
              "Hour": "18",
              "Minute": "22",
              "Second": "0"
            },
            "AccountID": "K1619",
            "UserID": "K161937",
            "Routing": "LILO",
            "Reference": "LICENSE VALIDATION",
            "TrackingNumber": "000000",
            "BillCode": "EXAMPLE",
            "Host": "OL",
            "ProductID": "LV",
            "State": {
              "Abbrev": "TX",
              "Full": "TEXAS"
            },
            "Subtype": "ST",
            "SubtypeFull": "LICENSE VALIDATION",
            "FirstName": "ANTONINA",
            "LastName": "STIEDEMANN",
            "BirthDate": {
              "Year": 1980,
              "Month": 1,
              "Day": 1,
              "Full": "1980-01-01",
              "Ticks": 315532
            },
            "LicenseNumber": "88894412",
            "Gender": "M",
            "Source": "13"
          },
          "Result": {
            "Control": "07IEEF",
            "Valid": "Y",
            "ReturnedDate": {
              "Year": 2023,
              "Month": 7,
              "Day": 10,
              "Full": "2023-07-10",
              "Ticks": 168894
            },
            "ReturnedTime": {
              "Hour": "18",
              "Minute": "22",
              "Second": "0"
            },
            "ResultCode": "RB"
          },
          "LicenseValidation": {
            "DocumentValidationResult": "PASS",
            "DriverLicenseNumberMatch": "TRUE",
            "BirthDateMatch": "TRUE",
            "LastNameExactMatch": "TRUE",
            "LastNameFuzzyPrimMatch": "FALSE",
            "LastNameFuzzyAltMatch": "FALSE",
            "FirstNameExactMatch": "TRUE",
            "FirstNameFuzzyPrimMatch": "FALSE",
            "FirstNameFuzzyAltMatch": "FALSE",
            "MiddleNameExactMatch": "FALSE",
            "MiddleNameFuzzyPrimMatch": "FALSE",
            "MiddleNameFuzzyAltMatch": "FALSE",
            "MiddleNameInitialMatch": "FALSE",
            "NameSufixMatch": "FALSE",
            "DocumentCategoryMatch": "FALSE",
            "IssueDateMatch": "FALSE",
            "ExpiryDateMatch": "FALSE",
            "SexMatch": "FALSE",
            "HeightMatch": "FALSE",
            "WeightMatch": "FALSE",
            "EyeColorMatch": "FALSE",
            "Address1Match": "FALSE",
            "Address2Match": "FALSE",
            "AddressCityMatch": "FALSE",
            "AddressStateMatch": "TRUE",
            "AddressZip5Match": "FALSE",
            "AddressZip4Match": "FALSE"
          },
          "Driver": {
            "FirstName": "ANTONINA",
            "LastName": "STIEDEMANN"
          },
          "CurrentLicense": {
            "Number": "88894412"
          }
        }
      }
    })
}
