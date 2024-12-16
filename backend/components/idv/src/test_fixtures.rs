use newtypes::ExperianAddressAndNameMatchReasonCodes;
use newtypes::ExperianSSNReasonCodes;
use newtypes::ExperianWatchlistReasonCodes;

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
      "line_type_intelligence": {
            "carrier_name": "Google (Grand Central) - SVR",
            "error_code": null,
            "mobile_country_code": "111",
            "mobile_network_code": "910",
            "type": "nonFixedVoip"
        },
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
        // nosemgrep
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

#[derive(Default)]
pub struct NeuroTestOpts {
    pub automated_activity: bool,
    pub bot_framework: bool,
    pub factory_reset: bool,
    pub fraud_ring_indicator: bool,
    pub device_id: Option<String>,
    pub cookie_id: Option<String>,
    pub incognito: bool,
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
                    "label": opts.incognito.to_string(),
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

pub struct SentilinkTestOpts {
    pub synthetic_score: Option<i32>,
    pub id_theft_score: Option<i32>,
}
pub fn sentilink_result(opts: SentilinkTestOpts) -> serde_json::Value {
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
            "score": opts.id_theft_score.unwrap_or(400),
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
            "score": opts.synthetic_score.unwrap_or(400),
            "version": "1.8.1"
        },
        "timestamp": "2024-09-19T18:47:53.962217803Z",
        "transaction_id": "01J85SSE-PAPV-04P4RHED"
    })
}


pub fn samba_create_order_response() -> serde_json::Value {
    serde_json::json!({
        "orderId": "f6113a2c-61e3-4ede-b8ad-aeaf67a80477"
    })
}
