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
pub fn experian_cross_core_response() -> serde_json::Value {
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
                                        "preciseIDServer": experian_precise_id_response(false, "656"),
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
                            "value": "Y"
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

pub fn experian_precise_id_response(consumer_not_found: bool, score: &str) -> serde_json::Value {
    let glb_rule_val = if consumer_not_found { "3001" } else { "1234" };
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
                        "code": "Y "
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
                        "code": glb_rule_val
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
