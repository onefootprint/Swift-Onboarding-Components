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
                [],
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
                  "score": null,
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
                "name": "JANE WATCHLIST HIT"
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
