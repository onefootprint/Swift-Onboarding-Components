use chrono::NaiveDate;
use newtypes::incode::IncodeStatus;

// From: https://learn.sayari.com/mexico-national-id-number-curp/
//
// Name: Juan Carlos Hernandez Garcia
// Gender: Male
// Date of birth: May 6, 1982
// Place of birth: Ensenada, Baja California, Mexico
// Final two digits of CURP assigned by the Mexican government: 09
pub const TEST_CURP: &str = "HEGJ820506HBCRRN09";

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
      "expireAt": "2549464802000",
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

pub fn incode_watchlist_result_response_low_fuzzy_hits() -> serde_json::Value {
    serde_json::json!({
        "content": {
            "data": {
                "id": 1994562062,
                "ref": "1729270695-6GhrpdZn",
                "searcher_id": 14876,
                "assignee_id": 14876,
                "filters": {
                    "country_codes": [],
                    "entity_type": "person",
                    "exact_match": false,
                    "fuzziness": 0.3,
                    "remove_deceased": 0,
                    "types": [
                        "adverse-media-v2-regulatory",
                        "adverse-media-v2-general-aml-cft",
                        "adverse-media-v2-other-minor",
                        "sanction",
                        "pep-class-4",
                        "pep-class-1",
                        "adverse-media-v2-financial-aml-cft",
                        "adverse-media-v2-narcotics-aml-cft",
                        "adverse-media-v2-fraud-linked",
                        "fitness-probity",
                        "pep-class-2",
                        "pep-class-3",
                        "adverse-media-v2-other-serious",
                        "adverse-media-v2-violence-non-aml-cft",
                        "adverse-media-v2-violence-aml-cft",
                        "adverse-media-v2-terrorism",
                        "warning",
                        "adverse-media-v2-other-financial",
                        "adverse-media-v2-property",
                        "pep",
                        "adverse-media-v2-financial-difficulty",
                        "adverse-media-v2-cybercrime"
                    ]
                },
                "match_status": "potential_match",
                "risk_level": "unknown",
                "search_term": "Bob Mugabe",
                "total_hits": 12,
                "total_matches": 12,
                "updated_at": "2024-10-18 16:58:15",
                "created_at": "2024-10-18 16:58:15",
                "tags": [],
                "limit": 100,
                "offset": 0,
                "share_url": "https://app.eu.complyadvantage.com/public/search/1729270695-6GhrpdZn/c801a0456e5e",
                "hits": [
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Mugabe; Robert Gabriel"
                                },
                                {
                                    "name": "Robert Ga briel Mugabe"
                                },
                                {
                                    "name": "Роберто Мугабе"
                                },
                                {
                                    "name": "Роберт Мугабэ"
                                },
                                {
                                    "name": "Роберта Мугабе"
                                },
                                {
                                    "name": "روبرت موغابي"
                                },
                                {
                                    "name": "रॉबर्ट मुगाबे"
                                },
                                {
                                    "name": "Mugabe Robert Gabriel"
                                },
                                {
                                    "name": "R. G. Mugabe"
                                },
                                {
                                    "name": "Robert Mugade"
                                },
                                {
                                    "name": "Rober Mugabe"
                                },
                                {
                                    "name": "Mugabe Gabriel Robert"
                                },
                                {
                                    "name": "রবার্ট মুগাবে"
                                },
                                {
                                    "name": "Robert Mogabe"
                                },
                                {
                                    "name": "Robert Mugabes"
                                },
                                {
                                    "name": "Robert Muqabe"
                                },
                                {
                                    "name": "Gabriel Robert Mugabe"
                                },
                                {
                                    "name": "Robert G. Mugabe"
                                },
                                {
                                    "name": "Ρόμπερτ Μουγκάμπε"
                                },
                                {
                                    "name": "رابرت موگابه"
                                },
                                {
                                    "name": "Оберт Мугабе"
                                },
                                {
                                    "name": "Ռոբերտ Մուգաբե"
                                },
                                {
                                    "name": "Робърт Мугабе"
                                },
                                {
                                    "name": "Roberts Mugabe"
                                },
                                {
                                    "name": "Mugabe Robert"
                                },
                                {
                                    "name": "Роберт Мугабе"
                                },
                                {
                                    "name": "Rob Mugabe"
                                },
                                {
                                    "name": "Robbert Mugabe"
                                },
                                {
                                    "name": "Robert Gabriel Mugabe"
                                },
                                {
                                    "name": "റോബർട്ട് മുഗാബെ"
                                },
                                {
                                    "name": "ロバート・ムガベ"
                                },
                                {
                                    "name": "רוברט מוגאבה"
                                },
                                {
                                    "name": "رابرٹ موگابے"
                                },
                                {
                                    "name": "Robertus Mugabe"
                                },
                                {
                                    "name": "ராபர்ட் முகாபே"
                                },
                                {
                                    "name": "Robert Mugabe"
                                },
                                {
                                    "name": "로버트 무가베"
                                },
                                {
                                    "name": "รอเบิร์ต มูกาบี"
                                },
                                {
                                    "name": "Bob Mugabe"
                                },
                                {
                                    "name": "Zimbabwe Robert Mugabe"
                                },
                                {
                                    "name": "Robert Magabe"
                                },
                                {
                                    "name": "羅伯·穆加貝"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "child",
                                    "name": "Bona Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Bona Mugabe"
                                },
                                {
                                    "association": "child",
                                    "name": "Chatunga Bellarmine Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Gabriel Mugabe Matibiri"
                                },
                                {
                                    "association": "former spouse",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "sibling",
                                    "name": "Michael Mugabe"
                                },
                                {
                                    "association": "child",
                                    "name": "Michael Nhamodzenyika Mugabe"
                                },
                                {
                                    "association": "relative",
                                    "name": "Patrick Zhuwao"
                                },
                                {
                                    "association": "child",
                                    "name": "Robert Mugabe Jr."
                                },
                                {
                                    "association": "child",
                                    "name": "Robert Peter Mugabe Jr."
                                },
                                {
                                    "association": "relative",
                                    "name": "Robert Zhuwawo"
                                },
                                {
                                    "association": "sibling",
                                    "name": "Sabina Mugabe"
                                },
                                {
                                    "association": "spouse",
                                    "name": "Sally Hayfron"
                                },
                                {
                                    "association": "former spouse",
                                    "name": "Sally Mugabe"
                                },
                                {
                                    "association": "relative",
                                    "name": "Simbanashe Chikore"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Nationality",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Place of Birth Text",
                                    "source": "complyadvantage",
                                    "value": "Harare"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Egypt"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Egypt, Kenya, South Africa"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany, Indonesia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Indonesia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria, South Africa, Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russian Federation"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Turkey"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Turkey"
                                },
                                {
                                    "name": "Country",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
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
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage",
                                    "tag": "date_of_birth",
                                    "value": "1924"
                                },
                                {
                                    "name": "Country",
                                    "source": "company-am",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "tresor-direction-generale",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "hm-treasury-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "company-am",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "europe-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "iceland-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "dfat-australia-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "special-economic-measures-act",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1914"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "ofac-sdn-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1924"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "swiss-seco-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Passport",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Date of Death",
                                    "source": "complyadvantage",
                                    "tag": "date_of_death",
                                    "value": "2019"
                                },
                                {
                                    "name": "Passport",
                                    "source": "hm-treasury-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Date of Death",
                                    "source": "complyadvantage",
                                    "tag": "date_of_death",
                                    "value": "2019-09-06"
                                },
                                {
                                    "name": "Gender",
                                    "source": "complyadvantage",
                                    "value": "male"
                                },
                                {
                                    "name": "Passport",
                                    "source": "europe-sanctions-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "iceland-sanctions-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "swiss-seco-list",
                                    "tag": "passport",
                                    "value": "AD001095, Issued by Zimbabwe"
                                },
                                {
                                    "name": "Passport",
                                    "source": "tresor-direction-generale",
                                    "tag": "passport",
                                    "value": "Passeport n° AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "ofac-sdn-list",
                                    "tag": "passport",
                                    "value": "Passport: AD002119, Issuing Country: Zimbabwe"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Chairperson Of The African Union"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Chairperson Of The Organisation Of African Unity"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Politician"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "President"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "President Of Zimbabwe"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Prime Minister Of Zimbabwe"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "swiss-seco-list",
                                    "value": "2018-02-27"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Secretary General Of The Non-aligned Movement"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2019-03-08 00:00:00"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "former President of Zimbabwe"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Arrêté Ministériel n° 2008-400 du 30 juillet 2008 portant application de l'ordonnance souveraine n° 1.675 du 10 juin 2008 relative aux procédures de gel des fonds mettant en œuvre des sanctions économiques, visant le Zimbabwe"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "ofac-sdn-list",
                                    "value": "2003-03-10"
                                },
                                {
                                    "name": "Chamber",
                                    "source": "complyadvantage",
                                    "value": "African Union"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2008-08-08 00:00:00"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "iceland-sanctions-list",
                                    "value": "2012-02-17 00:00:00"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "dfat-australia-list",
                                    "value": "2012-03-02"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "2014"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "swiss-seco-list",
                                    "value": "2018-02-27"
                                },
                                {
                                    "name": "Function",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Function",
                                    "source": "iceland-sanctions-list",
                                    "value": "President"
                                },
                                {
                                    "name": "List Name",
                                    "source": "ofac-sdn-list",
                                    "value": "SDN List"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "ofac-sdn-list",
                                    "value": "OFAC-7480"
                                },
                                {
                                    "name": "Listing Origin",
                                    "source": "swiss-seco-list",
                                    "value": "EU"
                                },
                                {
                                    "name": "National Id",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "AD001095 (passport-National passport) ((passport))"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "tresor-direction-generale",
                                    "value": "Désigné par l'Union européenne le 21/02/2002, par les règlements (UE) 2016/218 du 16/02/2016, (UE) 2018/223 du 15/02/2018, (UE)2019/283 du 18/02/2019"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "dfat-australia-list",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "hm-treasury-list",
                                    "value": "Former President."
                                },
                                {
                                    "name": "Other Information",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "President; born 21.2.1924"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "tresor-direction-generale",
                                    "value": "Renseignements complémentaires : Ancien président; responsable d'activités qui portent gravement atteinte à la démocratie, au respect des droits de l'homme et à l'État de droit"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32019R0283&from=EN"
                                },
                                {
                                    "name": "Program",
                                    "source": "dfat-australia-list",
                                    "value": "Autonomous (Zimbabwe)"
                                },
                                {
                                    "name": "Program",
                                    "source": "swiss-seco-list",
                                    "value": "Ordinance of 19 March 2002 on measures against Zimbabwe (SR 946.209.2), annex 2"
                                },
                                {
                                    "name": "Party",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe African National Union"
                                },
                                {
                                    "name": "Program",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "The lists published on the official site of The Malta Financial Services Authority include United Nations; European Union and United States sanctions; that have been implemented by Malta under its own laws and regulations during the 2010 - 2016 period. However; entities found on the present list are to be considered active (under current sanctions of Malta) only if they are also under current UN and/or EU sanctions. Also; all UN and EU current sanctions; even those that are not on the present list; are to be considered as active in Malta; as the Maltese National Interest (Enabling Powers) Act provides for the direct applicability into Maltese law of all the sanctions issued by the United Nations Security Council and the sanctions imposed by the Council of the European Union."
                                },
                                {
                                    "name": "Program",
                                    "source": "ofac-sdn-list",
                                    "value": "ZIMBABWE"
                                },
                                {
                                    "name": "Program",
                                    "source": "special-economic-measures-act",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Reason",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "COUNCIL REGULATION (EC) No 314/2004 of 19 February 2004"
                                },
                                {
                                    "name": "Reason",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Chef du gouvernement ; responsable d'activités qui portent gravement atteinte à la démocratie, au respect des droits de l'homme et à l'État de droit."
                                },
                                {
                                    "name": "Reason",
                                    "source": "swiss-seco-list",
                                    "value": "Former President and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Reason",
                                    "source": "swiss-seco-list",
                                    "value": "Head of Government and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Reason",
                                    "source": "iceland-sanctions-list",
                                    "value": "Head of Government and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Regime",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "2019/283 (OJ L47)"
                                },
                                {
                                    "name": "Regime",
                                    "source": "hm-treasury-list",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Regime",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe (annexe III Gel actif)"
                                },
                                {
                                    "name": "Regulation",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "ZWE"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "related_url",
                                    "value": "https://journaldemonaco.gouv.mc/Journaux/2008/Journal-7872/Arrete-Ministeriel-n-2008-400-du-30-juillet-2008-portant-application-de-l-ordonnance-souveraine-n-1.675-du-10-juin-2008-relative-aux-procedures-de-gel-des-fonds-mettant-en-oeuvre-des-sanctions-economiques-visant-le-Zimbabwe; https://journaldemonaco.gouv.mc/Journaux/2020/Journal-8477/Arrete-Ministeriel-n-2020-192-du-5-mars-2020-modifiant-l-arrete-ministeriel-n-2008-400-du-30-juillet-2008-portant-application-de-l-Ordonnance-Souveraine-n-1.675-du-10-juin-2008-relative-aux-procedures-de-gel-des-fonds-mettant-en-oeuvre-des-sanctions-eco"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "tag": "related_url",
                                    "value": "https://mfsa.com.mt/pages/readfile.aspx?f=/files/International%20Affairs/Sanctions%202014/L.N.%20172.2014%20zimbabwe.pdf"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "http://www.au.int/"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "iceland-sanctions-list",
                                    "tag": "related_url",
                                    "value": "https://www.stjornartidindi.is/Advert.aspx?RecordID=e5c9c811-b322-4246-a97d-379b98e0c144"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "tresor-direction-generale",
                                    "tag": "related_url",
                                    "value": "https://www.tresor.economie.gouv.fr/services-aux-entreprises/sanctions-economiques"
                                },
                                {
                                    "name": "Removal Date",
                                    "source": "swiss-seco-list",
                                    "value": "2020-03-03"
                                },
                                {
                                    "name": "Removal Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2020-03-13 00:00:00"
                                },
                                {
                                    "name": "Role",
                                    "source": "europe-sanctions-list",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "ofac-sdn-list",
                                    "value": "Block"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "swiss-seco-list",
                                    "value": "article 2 paragraphs 1 and 2 (Financial sanctions) and article 4 paragraph 1 (Travel ban)"
                                },
                                {
                                    "name": "Title",
                                    "source": "ofac-sdn-list",
                                    "value": "President of the Republic of Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://dbpedia.org/data/Robert_Mugabe.json"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://fr.wikipedia.org/wiki/Robert_Mugabe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Grace+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Grace+Mugabe&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Robert+Gabriel+Mugabe&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "http://www.au.int/en/cpau"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://dbpedia.org/data/Robert_Mugabe.json"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://fr.wikipedia.org/wiki/Robert_Mugabe"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Grace+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Grace+Mugabe&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Robert+Gabriel+Mugabe&ucbcb=1"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Egypt, France, Germany, Indonesia, Kenya, Nigeria, Russian Federation, South Africa, Turkey, United Kingdom, United States, Venezuela, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "N0HUXBOHUAA52RH",
                            "last_updated_utc": "2024-10-09T21:29:08Z",
                            "media": [
                                {
                                    "date": "2022-01-16T00:00:00Z",
                                    "snippet": "A-LOCAL firm Inverness Investments has lost US$500 000 cash to a South African company in a botched loan agreement deal. This was after Brent Greyling (31) the director of the South African company Milean Investment was lured to come to Zimbabwe after he was promised a US$1.2 million loan before he was arrested at the Robert Gabriel Mugabe International Airport for fraud. Greyling who was represented by Rungano Mahuni on Friday appeared before Harare magistrate Sharon Rakafa charged with fraud.",
                                    "title": "A local firm loses US$500 000 in suspected externalisation deal - NewsDay Zimbabwe",
                                    "url": "https://www.newsday.co.zw/2022/01/a-local-firm-loses-us500-000-in-suspected-externalisation-deal/"
                                },
                                {
                                    "date": "2023-07-23T00:00:00Z",
                                    "snippet": "Mugabe once claimed that Zimbabwe's treasury lost more than US$15-billion in diamond money because of corruption, but nothing was done to bring perpetrators to account. Mnangagwa, who promised a raft of reforms, including dealing with corruption, when he took over from Mugabe, has failed to deal with corruption in his government, and his critics have accused him of applying a \"catch and release\" strategy to make it seem as if he was taking action. Some security sector sources alleged that some resources used to finance the military-assisted transition that caused Mugabe to resign in November 2017 were derived from illegal diamond sales, although this could not be independently verified.",
                                    "title": "As Zimbabwe's elections loom, main opposition party 'threatened by Mozambique's Frelimo'",
                                    "url": "https://www.dailymaverick.co.za/article/2023-07-23-as-zimbabwes-elections-loom-main-opposition-party-threatened-by-mozambiques-frelimo/"
                                },
                                {
                                    "date": "2024-06-14T00:00:00Z",
                                    "snippet": "The Centre for Natural Resource Governance expressed concern over a criminal case against five people accused of stealing diamonds during the routine sale of diamonds at the Robert Gabriel Mugabe International Airport in Harare. Notably, on October 26, 2020, Zimbabwe Miners' Federation president Henrietta Rushwaya was arrested at the Robert Gabriel Mugabe International Airport and later convicted for attempting to smuggle six kilogrammes of gold worth US$333 042,28 to Dubai. She, however, got away with a neglible fine.",
                                    "title": "Can Africa Mining Vision unlock Zim's potential for sustainable development and governance? - The Standard",
                                    "url": "https://newsday.co.zw/thestandard/opinion-analysis/article/200028221/can-africa-mining-vision-unlock-zims-potential-for-sustainable-development-and-governance"
                                },
                                {
                                    "date": "2024-08-31T00:00:00Z",
                                    "snippet": "CHATUNGA Bellarmine Mugabe, son of former Zimbabwean leader Robert Mugabe, has been arrested for violent conduct in Beitbridge where he allegedly assaulted a policeman at a roadblock at Bubi, 80 kilometres north of the border town. He is alleged to have brandished a knife in the scuffle with police who now accuse him of resisting arrest.",
                                    "title": "Chatunga Mugabe arrested in Beitbridge -Newsday Zimbabwe",
                                    "url": "https://www.newsday.co.zw/newsday/local-news/article/200031686/chatunga-mugabe-arrested-in-beitbridge"
                                },
                                {
                                    "date": "2019-04-16T00:00:00Z",
                                    "snippet": "PRESIDENT Robbert Mugabe's nephew Leo Mugabe has been accused of attempting to seize a Chinese-owned firm, Hwange Coal Gasification, whose bank account with Stanbic Bank has been frozen at the instigation of its non-executive directors who are allegedly working in cahoots with Mugabe. REPORT BY CHARLES LAITON",
                                    "title": "Chinese, Leo Mugabe lock horns",
                                    "url": "https://www.newsday.co.zw/2013/06/chinese-leo-mugabe-lock-horns/amp/"
                                },
                                {
                                    "date": "2021-06-09T00:00:00Z",
                                    "snippet": "The Archbishop of York, John Sentamu, memorably cut up his clerical collar live on Andrew Marr's Sunday breakfast show in 2007 to demonstrate how Robert Mugabe had destroyed the identity of the people of Zimbabwe. Sentamu believes Mugabe should be tried for crimes against humanity, and pledged not to wear a dog collar again until the president had gone. But nearly two years on there is no sign of the archbishop being able to resume his neckwear.",
                                    "title": "Could you forgive Mugabe?",
                                    "url": "https://www.newstatesman.com/politics/2009/09/mugabe-crimes-catholic?qt-trending=0"
                                },
                                {
                                    "date": "2024-10-09T00:00:00Z",
                                    "snippet": "Governments may shift responsibility to external forces rather than addressing internal governance failures. Zimbabwe, under Robert Mugabe, for example, was accused of attributing the country's economic collapse to Western sanctions, deflecting responsibility away from poor governance and corruption. Blameocracy reduces the focus on domestic accountability and encourages a narrative of victimhood.",
                                    "title": "Dr Muhammad Dan Suleiman: Ten other names we can call Democracy in Africa - MyJoyOnline",
                                    "url": "https://www.myjoyonline.com/dr-muhammad-dan-suleiman-ten-other-names-we-can-call-democracy-in-africa/"
                                },
                                {
                                    "date": "2019-09-06T00:00:00Z",
                                    "snippet": "Robert Mugabe, former prime minister and president of Zimbabwe whose rule was mired in accusations of human rights abuses and corruption, has died aged 95. His 40-year leadership of the former British colony was marked with bloodshed, persecution of political opponents and vote-rigging on a large scale.",
                                    "title": "Former Zimbabwe president Robert Mugabe dies aged 95 | Irish Independent",
                                    "url": "https://www.independent.ie/world-news/former-zimbabwe-president-robert-mugabe-dies-aged-95/38472774.html"
                                },
                                {
                                    "date": "2019-09-06T00:00:00Z",
                                    "snippet": "His rule was mired in accusations of human rights abuses and corruption Robert Mugabe, former prime minister and president of Zimbabwe whose rule was mired in accusations of human rights abuses and corruption, has died aged 95. His near 40-year leadership of the former British colony was marked with bloodshed, persecution of political opponents and vote-rigging on a large scale.",
                                    "title": "Former president of Zimbabwe Robert Mugabe dead at 95 - Liverpool Echo",
                                    "url": "https://www.liverpoolecho.co.uk/news/uk-world-news/former-president-zimbabwe-robert-mugabe-16874091"
                                },
                                {
                                    "date": "2024-04-03T00:00:00Z",
                                    "snippet": "The arrest of Peter Dube marks a significant development in the ongoing investigation into the triple murder case. Dube's arrest at Robert Gabriel Mugabe International Airport brings an end to his nearly three-year evasion of authorities.",
                                    "title": "Fugitive multiple-murders accused Peter Dube arrested at RGM Int. Airport on deportation return from Ireland – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/main/fugitive-mulitple-murders-accused-peter-dube-arrested-at-rgm-int-airport-on-return-on-deportation-return-from-ireland/"
                                },
                                {
                                    "date": "2022-01-27T00:00:00Z",
                                    "snippet": "Zimbabwe was not left out, when on November 15, 2017, the military rolled its tanks into the capital Harare taking over the state broadcast station and announcing that they were in charge of the nation. The coup plotters immediately placed 93-year-old president, Robert Mugabe, and his family under house arrest. This marked the end of his 37-year rule, as pressure mounted from the military, protesters, and looming impeachment in parliament.",
                                    "title": "How recurring coups amplify calls for enhanced governance in Africa | The Guardian Nigeria News - Nigeria and World News — World — The Guardian Nigeria News – Nigeria and World News",
                                    "url": "https://guardian.ng/news/how-recurring-coups-amplify-calls-for-enhanced-governance-in-africa/amp/"
                                },
                                {
                                    "date": "2019-07-19T00:00:00Z",
                                    "snippet": "I particularly want to thank His Excellency, the President and Commander-In-Chief of the Zimbabwe Defence Forces, Cde. R. G Mugabe, who is also the First Secretary of the revolutionary party ZANU PF, for making it possible for me to be in this House today. I am humbled by the magnitude of the confidence and responsibility placed upon me by my revolutionary party ZANU PF and the people of Lobengula Constituency.",
                                    "title": "Lobengula MP blames the mushrooming of Vuzu parties to absentee parents | The Insider",
                                    "url": "https://www.insiderzim.com/lobengula-mp-blames-the-mushrooming-of-vuzu-parties-to-absentee-parents/"
                                },
                                {
                                    "date": "2024-03-10T00:00:00Z",
                                    "snippet": "Soon after his arrest at the Robert Mugabe International Airport, Cuan Reed Govender, 25, was accused of being the \"John Doe\" who had reported a bomb at the Victoria Falls International Airport on Friday. Flights at the airport were suspended following the alleged bomb threat.",
                                    "title": "Man's Zimbabwe airport drama: Arrested for carrying live ammunition and accused of sending a bomb threat",
                                    "url": "https://www.iol.co.za/thepost/community-news/mans-zimbabwe-airport-drama-arrested-for-carrying-live-ammunition-and-accused-of-sending-a-bomb-threat-e156dd6d-d5d1-42f1-9a8a-ea318d2b76fe"
                                },
                                {
                                    "date": "2018-07-19T00:00:00Z",
                                    "snippet": "the ex-president's heavy legacy hangs over the country. The political party Mr. Mugabe led for decades is now represented by Emmerson Mnangagwa, a former vice president who has been accused of organizing brutal repression during Mr. Mugabe's rule. The opposition has been fractured and weakened after the death this year of its longtime leader, Morgan Tsvangirai, who challenged Mr. Mugabe in successive elections in 2002, 2008 and 2013.",
                                    "title": "Mugabe Has Left, but His Legacy Haunts Zimbabwe's Election – The Zimbabwe Mail",
                                    "url": "http://www.thezimbabwemail.com/main/mugabe-has-left-but-his-legacy-haunts-zimbabwes-election/"
                                },
                                {
                                    "date": "2024-04-04T00:00:00Z",
                                    "snippet": "FUGITIVE Gweru murder suspect Peter Dube was arrested yesterday at Robert Gabriel Mugabe International Airport after he was deported from Mozambique. Dube was",
                                    "title": "Murder suspect deported, arrested – DailyNews",
                                    "url": "https://dailynews.co.zw/murder-suspect-deported-arrested/amp/"
                                },
                                {
                                    "date": "2018-09-11T00:00:00Z",
                                    "snippet": "The war veterans/soldiers had to use a coup in order to push Grace Mugabe away. If Grace Mugabe was a genuine/supporting wife, she should have allowed R.G Mugabe to retire from politics long back but because of her love of planes and money, R.G Mugabe had to be subjected to a long period of political prison. On 11/09/2018, I wrote a piece condemning ZANU PF government for abusing taxpayers' money by chartering a plane for Grace Mugabe from Singapore.",
                                    "title": "No difference between Grace Mugabe & Judas Iscariot - Bulawayo24 News",
                                    "url": "https://bulawayo24.com/index-id-opinion-sc-columnist-byo-144993.html"
                                },
                                {
                                    "date": "2024-09-01T00:00:00Z",
                                    "snippet": "His brother Robert Mugabe Junior was arrested in February last year after allegedly damaging property worth US$12 000 in Harare. An investigation by South African unit Amabhungane last year uncovered potential money laundering involving Chatunga, just before Mugabe's ouster in a coup. The investigation revealed a series of illegal Hawala payments made to Chatunga Mugabe through an unnamed individual connected to Ewan Macmillan of the Gold Mafia exposé.",
                                    "title": "Okapi-wielding Chatunga Mugabe charged - The Zimbabwe Independent",
                                    "url": "https://www.theindependent.co.zw/news/article/200031738/okapi-wielding-chatunga-mugabe-charged"
                                },
                                {
                                    "date": "2024-07-28T00:00:00Z",
                                    "snippet": "Like many modern political nightmares Robert Mugabe began as a liberator but ended up unleashing a bloodletting in 1980's Zimbabwe. The ethnic purge known as the \"Gukurahundi\" (translated nicely as 'cleansing rain' and not so nicely as 'sweep away the dirty') unleashed Mugabe's murderous North Korean-trained Five Brigade against his opponents. An estimated 10,000 civilians perished in the \"cleansing rain.\"",
                                    "title": "Playing the 'Hitler card' and misreading history: op-ed",
                                    "url": "https://www.al.com/opinion/2024/07/playing-the-hitler-card-and-misreading-history-op-ed.html?outputType=amp"
                                },
                                {
                                    "date": "2024-05-29T00:00:00Z",
                                    "snippet": "Dziva, along with his accomplice Alex Tombe, was found guilty of demanding a US$20,000 bribe from Rushwaya to secure a lighter sentence for her. Rushwaya was arrested in 2020 at the Robert Mugabe International Airport while attempting to smuggle gold bars weighing 6 kilograms to Dubai. In 2023, she was convicted and fined US$5,000, with an 18-month jail term wholly suspended.",
                                    "title": "Prosecutor in Rushwaya's gold smuggling case convicted of fraud after demanding US$20k bribe – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/prosecutor-in-rushwayas-gold-smuggling-case-convicted-of-fraud-after-demanding-us20k-bribe/"
                                },
                                {
                                    "date": "2019-09-13T00:00:00Z",
                                    "snippet": "He has, therefore, quit life's stage trailed by very unflattering epithets which only very few could have imagined would ever be associated with his name and career during his first decade in office. From his country's independence on April 18, 1980 till November 14, 2017, when the combined effort of the top officers of the Zimbabwean Defence Forces (ZDF) and the top hierarchy of the ruling party, Zimbabwe African National Union-Patriotic Front (ZANU-PF), eased him out of office and got him to resign after one week of being under house arrest, Mugabe served as Zimbabwe's Prime Minister (1980 to 1987) and President (1987 to 2017), following the amendment of the Constitution to institute a presidential system of government. He was in office for nearly four decades during which Zimbabwe's economy witnessed grievous decline, the citizenry whose country was once hailed as the \"food basket of the continent,\" saw the worst of times and Mr. Mugabe's image plummeted badly.",
                                    "title": "Robert Gabriel Mugabe (1924 – 2019) – Independent Newspaper Nigeria",
                                    "url": "https://independent.ng/robert-gabriel-mugabe-1924-2019/"
                                },
                                {
                                    "date": "2019-09-07T00:00:00Z",
                                    "snippet": "However, a brutal military campaign waged against an uprising in western Matabeleland province that ended in 1987 augured a bitter turn in Zimbabwe's fortunes. As the years went by, Mugabe was widely accused of hanging onto power through violence and vote fraud, notably in a 2008 election that led to a troubled coalition government after regional mediators intervened. \"I have many degrees in violence,\" Mugabe once boasted on a campaign trail, raising his fist.",
                                    "title": "Robert Mugabe Joins Ancestors - BNW | BiafraNigeriaWorld",
                                    "url": "http://biafranigeriaworld.com/2019/09/07/robert-mugabe-joins-ancestors/"
                                },
                                {
                                    "date": "2019-09-05T00:00:00Z",
                                    "snippet": "However, a brutal military campaign waged against an uprising in western Matabeleland province that ended in 1987 augured a bitter turn in Zimbabwe 's fortunes. As the years went by, Mugabe was widely accused of hanging onto power through violence and vote fraud, notably in a 2008 election that led to a troubled coalition government after regional mediators intervened. \"I have many degrees in violence, \" Mugabe once boasted on a campaign trail, raising his fist.",
                                    "title": "Robert Mugabe, strongman who ruled Zimbabwe for decades, dies | Las Vegas Review-Journal",
                                    "url": "https://www.reviewjournal.com/news/nation-and-world/robert-mugabe-strongman-who-ruled-zimbabwe-for-decades-dies-1842196/"
                                },
                                {
                                    "date": "2023-11-01T00:00:00Z",
                                    "snippet": "Tserai and Mufandauya have been acquitted due to a lack of evidence, marking a dramatic turn of events. Rushwaya's conviction stems from an incident three years ago when she was arrested at the Robert Gabriel Mugabe International Airport on October 26, 2020, attempting to board a flight to Dubai with 6kg of gold valued at approximately US$333,000 in her possession. During her defense, Rushwaya claimed that she mistakenly picked up the wrong bag, which contained the gold, instead of her own.",
                                    "title": "Rushwaya Convicted Proving Hopewell's Actually Closer To Mnangagwa Than Her – ZimEye",
                                    "url": "https://www.zimeye.net/2023/11/01/rushwaya-convicted-proving-hopewells-actually-closer-to-mnangagwa-than-her/"
                                },
                                {
                                    "date": "2018-06-20T00:00:00Z",
                                    "snippet": "Britain's longest-reigning monarch, she meets with foreign leaders frequently at the behest of her ministers. She has greeted numerous presidents over the years who were later condemned for corruption or violence against their own citizens, including Bashar al-Assad of Syria, Nicolae Ceausescu of Romania, Robert G. Mugabe of Zimbabwe, Vladimir V. Putin of Russia, Mobutu Sese Seko of Zaire and Suharto of Indonesia.",
                                    "title": "Trump Will Meet Queen Elizabeth II Next Month, His Ambassador Says - The New York Times",
                                    "url": "https://www.nytimes.com/2018/06/20/world/europe/trump-queen-visit.html"
                                },
                                {
                                    "date": "2023-07-28T00:00:00Z",
                                    "snippet": "In response to questions, Zimbabwe Republic Police (ZRP) confirmed that it has recorded several cases of drug smuggling. \"In one of the cases, on March 27, 2023 police acted on received information and arrested Davison Gomo, 27, at Robert Gabriel Mugabe International Airport in connection with drug trafficking involving cocaine and crystal meth,\" ZRP spokesperson Assistant Commissioner Paul Nyathi said. Gomo had 21kgs of crystal meth and 1,2kgs of cocaine concealed in metal pulleys.",
                                    "title": "Zim turns into international drug transit point - The Zimbabwe Independent",
                                    "url": "https://theindependent.co.zw/index.php/local-news/article/200014572/zim-turns-into-international-drug-transit-point"
                                },
                                {
                                    "date": "2023-05-31T00:00:00Z",
                                    "snippet": "President Mnangagwa at the weekend promised to set the election date this week as he seeks re-election for a second full term in office. Zimbabwe and the US have frosty relations that go back two decades after Washington imposed sanctions on the regime of the late Robert Mugabe for alleged human rights violations and electoral fraud. President Joe Biden's administration has maintained the embargo as it accuses Mr Mugabe's successor of failing to implement economic and political reforms that he promised after the 2017 military coup.",
                                    "title": "Zimbabwe summons US envoy over election tweets | Nation",
                                    "url": "https://nation.africa/africa/news/zimbabwe-summons-us-envoy-over-election-tweets--4252900?redirect_to=https://nation.africa/africa/news/zimbabwe-summons-us-envoy-over-election-tweets--4252900"
                                },
                                {
                                    "date": "2019-08-30T00:00:00Z",
                                    "snippet": "Бархатный путч в Зимбабве Военные арестовали президента Зимбабве Роберта Мугабе В субботу 18 ноября в столице Зимбабве состоялась демонстрация против 93-летнего президента Роберта Мугабе, который бессменно правит южноафриканской страной с 1980 г. На днях, он был изолирован в своей резиденции и взят под домашний арест группой военных. Солдаты опечатали вход в парламент, правительственные учреждения и суды в столице Хараре.",
                                    "title": "Бархатный путч в Зимбабве",
                                    "url": "https://comments.ua/world/602223-barhatniy-putch-zimbabve.html"
                                },
                                {
                                    "date": "2019-09-20T00:00:00Z",
                                    "snippet": "В Зимбабве военные задержали президента страны Роберта Мугабе В Зимбабве военные задержали президента страны Роберта Мугабе Военные, захватившие в  Зимбабве здание государственной телекомпании Зед-би-си, объявили, что взяли под стражу президента страны Роберта Мугабе и  его семью. При этом они не  считают случившееся военным переворотом и  заявляют, что Мугабе и  его родным ничего не  угрожает.",
                                    "title": "В Зимбабве военные задержали президента страны Роберта Мугабе",
                                    "url": "https://gomel.today/amp/rus/news/world-1524/"
                                },
                                {
                                    "date": "2020-05-23T00:00:00Z",
                                    "snippet": "Напомним, 14 ноября зимбабвийский главнокомандующий Константино Чивенга предъявил руководству страны ультиматум с четырьмя требованиями, а к столице Зимбабве Хараре начали стягивать танки. Позже военные арестовали президента страны Роберта Мугабе и его жену Грейс, но позже появилась информация, что она покинула страну.",
                                    "title": "Мугабе выступил с телеобращением: в отставку уходить не собирается - ФОКУС",
                                    "url": "https://focus.ua/amp/world/385315"
                                },
                                {
                                    "date": "2019-09-20T00:00:00Z",
                                    "snippet": "Неназванный источник в  правящей партии «Зимбабвийский африканский национальный союз  - Патриотический фронт» сообщил Associated Press, что главой страны, вероятно, станет бывший вице-президент Эммерсон Мнангагва. 15  ноября группа военных из  высшего командования армии Зимбабве захватила власть в  стране и  посадила президента Роберта Мугабе под домашний арест. Это произошло вскоре после отставки вице-президента Эммерсона Мнангагвы, которого называли одним из  двух вероятных преемников Мугабе.",
                                    "title": "Спикер парламента Зимбабве объявил об отставке Роберта Мугабе",
                                    "url": "https://gomel.today/amp/rus/news/world-1557/"
                                }
                            ],
                            "name": "Bob Mugabe",
                            "sources": [
                                "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                "company-am",
                                "complyadvantage",
                                "complyadvantage-adverse-media",
                                "dfat-australia-list",
                                "europe-sanctions-list",
                                "hm-treasury-list",
                                "iceland-sanctions-list",
                                "malta-financial-services-authority-mfsa-national-sanctions",
                                "monaco-economic-sanctions",
                                "ofac-sdn-list",
                                "special-economic-measures-act",
                                "swiss-seco-list",
                                "tresor-direction-generale"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-cybercrime",
                                "adverse-media-v2-financial-aml-cft",
                                "adverse-media-v2-financial-difficulty",
                                "adverse-media-v2-fraud-linked",
                                "adverse-media-v2-general-aml-cft",
                                "adverse-media-v2-narcotics-aml-cft",
                                "adverse-media-v2-other-financial",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-other-serious",
                                "adverse-media-v2-property",
                                "adverse-media-v2-terrorism",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft",
                                "pep",
                                "pep-class-1",
                                "pep-class-2",
                                "pep-class-4",
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "aka_exact"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Bob Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Mugabe Gabriel Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "France Tresor Direction Generale Liste Unique de Gels"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "DFAT Australia Consolidated Sanctions List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Gabriel Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Mugabe Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "United Kingdom HM Treasury Office of Financial Sanctions Implementation Consolidated List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "OFAC SDN List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "Malta Financial Services Authority (MFSA) National Sanctions (Suspended)"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "Switzerland SECO List"
                                ]
                            }
                        ],
                        "score": 1.7
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Mugabe Robert"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "Linked to",
                                    "name": "Mugabe Leo"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Other Info",
                                    "source": "sanction-related-entities",
                                    "value": "Entity associated with Mugabe Leo, designated on OFAC SDN List"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "sanction-related-entities",
                                    "tag": "related_url",
                                    "value": "http://www.treasury.gov/resource-center/sanctions/SDN-List/Pages/default.aspx"
                                }
                            ],
                            "id": "DZ8N6S3SDGSLSW7",
                            "last_updated_utc": "2024-04-16T11:47:57Z",
                            "name": "Mugabe Robert",
                            "sources": [
                                "sanction-related-entities"
                            ],
                            "types": [
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "Sanction Related Entities"
                                ]
                            }
                        ],
                        "score": 1.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "John Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Zambia"
                                }
                            ],
                            "id": "H02NTHBJZD62A7K",
                            "last_updated_utc": "2020-12-05T16:52:12Z",
                            "media": [
                                {
                                    "date": "2007-03-26T00:00:00Z",
                                    "pdf_url": "http://complyadvantage-asset.s3.amazonaws.com/622e6231-7b22-48b3-9365-7399c8c5adc3.pdf",
                                    "snippet": "This will teach other dictators how painful it is for the people to go through pain. I feel Mugabe needs to be prosecuted for crimes against humanity and sent to jail for life By :",
                                    "title": "Comments on: Put pressure on Mugabe, Africa leaders prodded",
                                    "url": "https://www.lusakatimes.com/2007/03/26/put-pressure-on-mugabe-africa-leaders-prodded/feed/"
                                }
                            ],
                            "name": "John Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-violence-non-aml-cft"
                                ],
                                "matching_name": "John Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Mugabe Robert Goma"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Rwanda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Rwanda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Rwanda"
                                }
                            ],
                            "id": "MJAK88QEFMR9TQR",
                            "last_updated_utc": "2021-10-24T20:02:56Z",
                            "media": [
                                {
                                    "date": "2011-08-23T00:00:00Z",
                                    "snippet": "Great Lakes Voice This post has already been read 6087 times! By Josephine Lukoya and Mugabe Robert Goma, DRC -A driver of UN Mission in Democratic Republic of Congo (Monusco) was arrested Sunday, August 21 at about 23 hours at the border between Rwanda and Congo, with 1,200 kilos of Cassiterite black in a vehicle of the UN mission in DRC. These 24 parcels of 50 kilos each.",
                                    "title": "UN mission in Congo under scrutiny as staff nabbed with gem – Great Lakes Voice",
                                    "url": "http://greatlakesvoice.com/un-mission-is-congo-under-scrutiny-as-staff-nabbed-with-gem/"
                                }
                            ],
                            "name": "Mugabe Robert Goma",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Mugabe Robert Goma",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Simon Maina Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Bangladesh"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Bangladesh"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Bangladesh"
                                }
                            ],
                            "id": "4DL1293JS91AUC2",
                            "last_updated_utc": "2021-10-30T13:40:16Z",
                            "media": [
                                {
                                    "date": "2019-12-05T00:00:00Z",
                                    "snippet": "In November 2017, a coup by senior military personnel was launched in terms that seemed almost polite, a sort of dinner party seizure. Mugabe was placed under house arrest; his ZANU-PF party had decided that the time had come. The risk of Marufu coming to power was becoming all too real, though this femme fatale rationale can only be pushed so far.",
                                    "title": "Revolution, amity and decline",
                                    "url": "http://www.newagebd.net/article/83990/revolution-amity-and-decline"
                                }
                            ],
                            "name": "Robert Simon Maina Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Simon Maina Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Freeman Robert Mugabe"
                                },
                                {
                                    "name": "Robert Freeman Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "International, Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "YF35NN44FGAXIXP",
                            "last_updated_utc": "2024-06-26T11:19:47Z",
                            "media": [
                                {
                                    "date": "2023-11-04T00:00:00Z",
                                    "snippet": "UPDF has said that the memorandum of understanding and the status of forces agreement with Somalia provide that each troop contributing country has to try her own personnel while in the mission area. Brig Mugabe will be in Somalia for two weeks hearing cases and at the end of the sessions, those who will be found guilty will be given appropriate sentences and those found not guilty will be acquitted. The army said the judgements will depend on the circumstances under which the offences were committed and the evidence that will be brought to court.",
                                    "title": "Al-Shabaab attack: Ugandan army commanders charged over cowardice",
                                    "url": "https://observer.ug/news/headlines/79662-al-shabaab-attack-ugandan-army-commanders-charged-over-cowardice"
                                },
                                {
                                    "date": "2023-12-07T00:00:00Z",
                                    "snippet": "Some of the remanded civilians include Judith Angwech, a pastor from Alebtong district, Simon Oyoma, a pastor from Soroti city, Daniel Owitti (also known as Ott or ODM), a social worker from Adjumani district, Fabio Ocen, a builder from Kole district, Muhammad Ijosiga, a peasant from Arua district, Stanley Yiacia (also known as Simple), a marketeer from Maracha, Anthony Kamau Omacj, a teacher from Dokolo district, Joaquin Parm, an electrician from Nebbi district, Abdu Hakim Koloboka, a security guard from Yumbe district, Habibu Ezale, a mechanic from Koboko district, Ssebi Keppo, a peasant from Arua district, among others. The Court Martial chaired by Brig Gen Freeman Robert Mugabe, the group faced charges of alleged treachery as defined in the Uganda People's Defense Forces Act. The prosecution, represented by Lt Col Raphael Mugisha, Lt Alex Lasto Mukhwana, and Pte Regina Nanzala, informed the court that investigations are ongoing and requested an adjournment.",
                                    "title": "Army court remands 8 soldiers, 23 civilians over plot to overthrow NRM govt",
                                    "url": "https://observer.ug/news/headlines/79979-army-court-remands-31-over-plot-to-overthrow-nrm-govt"
                                },
                                {
                                    "date": "2023-12-06T00:00:00Z",
                                    "snippet": "Some of the civilians include Judith Angwech, a pastor from Alebtong district, Simon Oyoma, a pastor from Soroti City, Daniel Owitti (also known as Ott or ODM), a Social worker from Adjumani District, Fabio Ocen, a builder from Kole District, Muhammad Ijosiga, a peasant from Arua district, Stanley Yiacia (also known as Simple), a Marketeer from Maracha, Anthony Kamau Omacj, a teacher from Dokolo District, Joaquin Parm, an electrician from Nebbi District, Abdu Hakim Koloboka, a security guard from Yumbe District, Habibu Ezale, a mechanic from Koboko District, Ssebi Keppo, a peasant from Arua District, among others. Before the Court Martial, chaired by Brigadier General Freeman Robert Mugabe, the group faced charges of alleged treachery as defined in the Uganda People's Defense Forces Act. The prosecution, represented by Lt Col Raphael Mugisha, Lt Alex Lasto Mukhwana, and Private Regina Nanzala, informed the court that investigations are ongoing and requested an adjournment.",
                                    "title": "Court Martial remands 7 UPDF soldiers, policeman and 23 civilians for plot to overthrow Govt",
                                    "url": "https://www.independent.co.ug/court-martial-remands-7-updf-soldiers-policeman-and-23-civilians-for-plot-to-overthrow-govt/"
                                },
                                {
                                    "date": "2022-09-20T00:00:00Z",
                                    "snippet": "The suspects are Benon Kisekka, a resident of Kinonya Masanafu in Kampala district, and Kassim Kibirango Muwanga, a resident of Busiro in Wakiso district. The General Court-Martial Chairperson, Brigadier Robert Freeman Mugabe read for the accused four counts of murder, two for aggravated robberies, and treachery. This brings to 21, the number of suspects charged in this matter.",
                                    "title": "Court Martial remands two suspects over murder of police officers",
                                    "url": "https://www.independent.co.ug/court-martial-remands-two-suspects-over-murder-of-police-officers/"
                                },
                                {
                                    "date": "2023-10-02T00:00:00Z",
                                    "snippet": "Mutumba was gunned down on February 14, 2020, at Lwemba trading center in Bugiri district. In the sentence delivered today Monday by a seven-member panel led by Army court chairperson, Brig General Freeman Robert Mugabe, Mugoya will effectively serve 41 years in prison, after the three years, seven months, and 15 days he spent on remand were deducted off. Biasaali recently confessed to the murder, citing vengeance and after his conviction last week, his lawyer, Capt Nsubuga Busagwa, requested for a lenient sentence, arguing that Biasaali is a first-time offender, has been in prison since February 2020, has nine children from two wives, and is their sole breadwinner.",
                                    "title": "Former SGA Security supervisor sentenced to 45 years in prison over murdering Sheikh Mutumba",
                                    "url": "https://observer.ug/news/headlines/79361-former-sga-security-supervisor-sentenced-to-45-years-in-prison-over-murdering-sheikh-mutumba"
                                },
                                {
                                    "date": "2023-12-07T00:00:00Z",
                                    "snippet": "Treachery, under Section 16 of UPDF Act, is an offence involving infiltration on behalf of foreign entities, solicitation and unauthorised sharing of military information and or withholding of vital security information from proper authorities. Prosecution told the General Court Martial sitting in Makindye, a Kampala outskirt, and chaired by Brig Freeman Robert Mugabe, the accused --- among them three pastors, a teacher and masons --- between February 2022 and October 2023 engaged in \"war or war-like activities intending to overthrow the government of Uganda\". It is alleged that they committed the offences in various places within and outside the country, including South Sudan's capital Juba, where they \"held meetings, recruited and formed a rebel group called Uganda Lord's Salvation Army...\"",
                                    "title": "How plot to overthrow the govt was uncovered | Monitor",
                                    "url": "https://www.monitor.co.ug/uganda/news/national/how-plot-to-overthrow-the-govt-was-uncovered-4456510"
                                },
                                {
                                    "snippet": "Accordingly, this court finds that each of you has a case to answer and you put on your defence,\" ruled Brig. Gen. Robert Freeman Mugabe, the GCM chairman on Tuesday (April 16, 2024) as the accused reappeared in his court for mention of their case. Maj. Mwesigye was one of Uganda People's Defence Forces' (UPDF) finest commandos and took part in UPDF's decisive battles against Al Shabaab in Somalia.",
                                    "title": "SFC commando murder suspects have a case to answer – court - New Vision Official",
                                    "url": "https://www.newvision.co.ug/category/news/sfc-commando-murder-suspects-have-a-case-to-a-NV_186106"
                                },
                                {
                                    "date": "2022-09-01T00:00:00Z",
                                    "snippet": "Those remanded are; Major Joel Mugabi Butaaho, Major Justus Mugenyi and Captain William Serumaga, who are all residents of Rubongi Military Hospital and were attached to the hospital as Quartermaster, Administration officer and Political Commissariat respectively. The group on Wednesday was arraigned before the General Court Martial presided over by Brigadier Robert Freeman Mugabe and charged with fraudulent offenses. The court has heard that the officers and others still at large during the months of May, June and July 2022 mismanaged drugs, X ray films and unspecified amount of emergence funds which were all meant for Rubongi Military Hospital.",
                                    "title": "Three UPDF officers remanded for mismanagement of Rubongi military hospital",
                                    "url": "https://www.independent.co.ug/three-updf-officers-remanded-for-mismanagement-of-rubongi-military-hospital/"
                                },
                                {
                                    "date": "2023-01-23T00:00:00Z",
                                    "snippet": "Two cleaners from Kitovu hospital and Good Foundation primary school in Masaka municipality have been jailed for four years over aggravated robbery contrary to sections 285 and 286 of the panel code act. The two, Asuman Ssemivumbi and Innocent Safari were convicted by the General Court Martial chairperson Brig Gen Robert Freeman Mugabe who found them guilty of aggravated robbery. According to the prosecution, in April 2019, Ssemivumbi and Safari robbed Vicent Kiberu of Shs 2.3 million and a Techno phone.",
                                    "title": "Two cleaners sentenced to 4 years in jail over aggravated robbery",
                                    "url": "https://observer.ug/news/headlines/76598-two-cleaners-sentenced-to-4-years-in-jail-over-aggravated-robbery"
                                },
                                {
                                    "date": "2023-11-03T00:00:00Z",
                                    "snippet": "UPDF has said that a Memorandum of Understanding and the Status of Forces Agreement with Somalia, provide that each Troop Contributing Country has to try her own personnel while in the mission area. Brig Mugabe will be in Somalia for two weeks hearing cases and at the end of the sessions, those who will be found guilty will be given appropriate sentences and those found not guilty acquitted. The Army said the judgements will depend on the circumstances under which the offences were committed and evidence that will be brought to court.",
                                    "title": "UPDF Majors in Mogadishu face charges of cowardice following Al-Shabaab attack",
                                    "url": "https://www.independent.co.ug/updf-majors-on-mogadishu-face-charges-of-cowardice-following-al-shabaab-attack/"
                                },
                                {
                                    "date": "2022-09-27T00:00:00Z",
                                    "snippet": "However, lance corporal Richard Isoke who has been on remand for more than a year will now serve four months and 23 days in jail. Court presided over by Brig Robert Freeman Mugabe had initially charged Isoke with aggravated robbery but later acquitted him of the crime and instead found him guilty of attempting to rob since the alleged stolen items did not leave the scene of the crime. He committed the cirme on November 1, 2018, at Foundation Building, Jinja road while travelling in Toyota Hiace registration number, H4DF 789.",
                                    "title": "UPDF corporal sentenced to 2 years for attempted robbery of Indian businessman",
                                    "url": "https://observer.ug/news/headlines/75311-updf-corporal-sentenced-to-2-years-for-attempted-robbery-of-indian-businessman"
                                },
                                {
                                    "date": "2022-08-16T00:00:00Z",
                                    "snippet": "The General Court Martial in Makindye has remanded two people including a Uganda People's Defence Forces junior officer Lt Paddy Nahabwe alias Kenneth Turinawe on charges of murder. Nahabwe together with James Niwamanya were arraigned before the court presided over by Brigadier Robert Freeman Mugabe and charged with murder and aggravated robbery. The court heard that on October 13th 2018 in Nkuzongere Katale zone, Semuto sub county in Nakaseke district, Niwamanya and Nahabwe unlawfully caused the death of Samson Nteza.",
                                    "title": "UPDF officer remanded over murder of boda boda rider",
                                    "url": "https://www.independent.co.ug/updf-officer-remanded-over-murder-of-boda-boda-rider/"
                                },
                                {
                                    "date": "2022-10-26T00:00:00Z",
                                    "snippet": "The General Court Martial in Makindye has remanded Major Gordon Joel Atwebembeire, over allegations of murder. Atwebembeire, 47, on Tuesday appeared before the Court presided over by Brigadier Robert Freeman Mugabe, and was charged with one count of murder. Court heard that on October 6th, 2022, Atwebembeire while in Bayima village, Nabitanga sub county, Sembabule district with malice aforethought, unlawfully caused the death of his wife Marion Tukamuhebwa.",
                                    "title": "UPDF officer remanded over murder of spouse",
                                    "url": "https://www.independent.co.ug/updf-officer-remanded-over-murder-of-spouse/"
                                },
                                {
                                    "date": "2022-11-29T00:00:00Z",
                                    "snippet": "Batte ,50, is a militant of the Regular Forces of the UPDF under the Directorate of Logistics, as a driver. On Tuesday, he was arraigned before the General Court Martial in Makindye presided over by Brigadier Freeman Robert Mugabe, and charged with one count of offenses related to security contrary to the UPDF Act of 2005. The court heard that between December 1st and 5th, 2021 at Entebbe Air force military base in Wakiso district, without authorization, Batte and five others moved and accessed the Air Drone Wing which was an act prejudicing the security of the Defense Forces.",
                                    "title": "UPDF sergeant pleads guilty to illegal access of air drone wing",
                                    "url": "https://www.independent.co.ug/updf-sergeant-pleads-guilty-to-illegal-access-of-air-drone-wing/"
                                },
                                {
                                    "date": "2024-06-25T00:00:00Z",
                                    "snippet": "President Museveni, the Commander-in-Chief of the armed forces, reappointed Gen Mugabe last amid outcry from rights groups that said he had presided over a court blighted with human rights violations. Gen Mugabe has been criticised for his handling of the case of the Opposition National Unity Platform supporters who were arrested in 2021. At least 28 of the NUP supporters",
                                    "title": "Uganda: Court Martial Chief Mugabe Sworn in for Third Term - allAfrica.com",
                                    "url": "https://allafrica.com/stories/202406250443.html"
                                }
                            ],
                            "name": "Freeman Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-fraud-linked",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-property",
                                "adverse-media-v2-violence-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Freeman Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Freeman Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Tinotenda Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Tinotenda Mugabe"
                                },
                                {
                                    "name": "Robert Mugabe Jnr"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Arab Emirates"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Canada, China, Cyprus, United Arab Emirates, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Canada"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "China"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Cyprus"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa, United Kingdom, Venezuela, Zambia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Mali"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "International, Mali, Russia, South Africa, Zambia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russian Federation"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa, Zambia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1992"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Canada, China, Cyprus, Mali, Russian Federation, South Africa, United Arab Emirates, United Kingdom, Venezuela, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "KEUR6HVMHUAT2FC",
                            "last_updated_utc": "2024-08-14T14:30:42Z",
                            "media": [
                                {
                                    "snippet": "The Late former President Mugabe's son, Robert Mugabe Jr, was yesterday arrested for vandalising cars and properties at a place where he was partying over the weekend.protected :",
                                    "title": "(no title)",
                                    "url": "https://www.thezimbabwean.co/wp-json/wp/v2/posts/227412"
                                },
                                {
                                    "snippet": "Il figlio maggiore di Robert Mugabe, il defunto dittatore dello Zimbabwe, è stato arrestato per aver presumibilmente causato danni per un valore di 12mila dollari ad auto e altre proprietà durante una festa in un quartiere elegante di Harare durante il fine settimana scorso. Robert Mugabe Jr, 31 anni, ha trascorso una notte in una stazione di polizia locale e poi è comparso brevemente in un tribunale di Harare, la capitale, lunedì. Mugabe non è stato trattenuto dopo l'udienza, ma il suo avvocato, Ashiel Mugiya, ha dichiarato che le accuse sono ancora in corso e che le due parti stanno negoziando un accordo extragiudiziale.",
                                    "title": "10 notizie dal mondo che non sono finite in prima pagina",
                                    "url": "https://www.today.it/mondo/dieci-notizie-alluvione-brasile-opposizione-tunisia.html"
                                },
                                {
                                    "date": "2023-02-28T00:00:00Z",
                                    "snippet": ": Robert Mugabe Jr arrested in Zimbabwe Jonathan deBurca Butler takes listeners through the week's international stories",
                                    "title": "Around The World: Robert Mugabe Jr arrested in Zimbabwe | Newstalk",
                                    "url": "https://www.newstalk.com/podcasts/around-the-world/around-the-world-robert-mugabe-jr-arrested-in-zimbabwe"
                                },
                                {
                                    "snippet": "For decades his father was one of the world's most feared dictators. Today, Robert Mugabe Jr. is on bail, pending Washington Times",
                                    "title": "District Of Columbia News",
                                    "url": "https://www.bignewsnetwork.com/category/district-of-columbia-news"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Police spokesperson Paul Nyathi confirmed the arrest in a statement and said that Mugabe (Junior), aged 31, will be produced in court soon, Xinhua news agency reported. Mugabe was arrested on Sunday after a complaint by his friend Nkatazo Sindiso that he destroyed property worth $12,000 at House number 3A, Verdi Lane, Strathaven, Harare, Zimbabwe's official news agency New Ziana quoted Nyathi as saying. 20230220-210203",
                                    "title": "Ex-Zimbabwe President Mugabe's son held on property damage charges | CanIndia News",
                                    "url": "https://www.canindia.com/ex-zimbabwe-president-mugabes-son-held-on-property-damage-charges/"
                                },
                                {
                                    "date": "2023-03-24T00:00:00Z",
                                    "snippet": "For decades his father was one of the world's most feared dictators. Today, Robert Mugabe Jr. is on bail, pending a return to a Zimbabwean court on a charge of damaging property that could send him to jail. His mother, Grace, has a warrant for her arrest across the border in South Africa where she is accused of assaulting a woman in Johannesburg.",
                                    "title": "In Africa, a powerful name no longer guarantees protection - Washington Times",
                                    "url": "https://www.washingtontimes.com/news/2023/mar/24/africa-powerful-name-no-longer-guarantees-protecti/"
                                },
                                {
                                    "date": "2023-03-24T00:00:00Z",
                                    "snippet": "For decades his father was one of the world's most feared dictators. Today, Robert Mugabe Jr. is on bail, pending a return to a Zimbabwean court on a charge of damaging property that could send him to jail. His mother, Grace, has a warrant for her arrest across the border in South Africa where she is accused of assaulting a woman in Johannesburg.",
                                    "title": "In Africa, a powerful name no longer guarantees protection – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/politics/in-africa-a-powerful-name-no-longer-guarantees-protection/"
                                },
                                {
                                    "date": "2023-02-22T00:00:00Z",
                                    "snippet": "Depuis le dimanche 19 février dernier, le fils de l'ancien président zimbabwéen Robert Mugabe a quelques soucis avec la justice de son pays. En effet, Robert Mugabe Jr a été mis aux arrêts pour des dégradations sur des voitures de luxe et des biens privés. L'annonce a en effet été faite par la police.",
                                    "title": "Le fils de Robert Mugabe a été arrêté au Zimbabwe – La Nouvelle Tribune",
                                    "url": "https://lanouvelletribune.info/2023/02/le-fils-de-robert-mugabe-a-ete-arrete-au-zimbabwe/amp/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "Norton legislator Temba Mliswa has blasted the state over the way they handled the Robert Mugabe Junior's arrest on charges of malicious damage to property saying it clearly showed preferential treatment as anyone would not have been given the same privilege. Posting on Twitter, Mliswa said since the matter was before the courts, they were supposed to allow the parties involved to appear before the court while any pleas for withdrawals were supposed to be made through the Magistrate as opposed to the National Prosecuting Authority (NPA).",
                                    "title": "Mliswa Blasts State Over Preferential Treatment Given To Robert Mugabe Jnr – ZimEye",
                                    "url": "https://www.zimeye.net/2023/02/21/mliswa-blasts-preferential-treatment-given-to-robert-mugabe-jnr/"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": ": Robert Mugabe Junior (31) was set free Monday following his arrest at the weekend. Mugabe was accused of damaging a friend's vehicle and property worth US$12,000 during a party held in Harare's Strathaven suburb.",
                                    "title": "Mugabe Junior set free after arrest; says lawyer - 'the State decided to give parties the opportunity to negotiate' - NewZimbabwe.com",
                                    "url": "https://www.newzimbabwe.com/mugabe-junior-set-free-after-arrest-says-lawyer-the-state-decided-to-give-parties-the-opportunity-to-negotiate/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "ROBERT Mugabe Jnr, the son of the late former President Robert Mugabe was arrested at the weekend for alleged malicious damage to property, but was released yesterday before plea. He was represented by lawyers Ashiel Mugiya and Tungamirai Muganhiri.",
                                    "title": "Mugabe son arrested, released before plea - The Zimbabwe Independent",
                                    "url": "https://theindependent.co.zw/index.php/local-news/article/200007754/mugabe-son-arrested-released-before-plea"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Mugabe's son arrested for damaging property -",
                                    "title": "Mugabe's son arrested for damaging property – police",
                                    "url": "https://zambianobserver.com/mugabes-son-arrested-for-damaging-property-police/?amp=1"
                                },
                                {
                                    "date": "2019-08-10T00:00:00Z",
                                    "snippet": "President Emmerson Mnangagwa said in a statement on Tuesday that though Mugabe was still at an undisclosed hospital in Singapore, he was responding well to treatment and could be released soon. \"Mugabe remains detained at a hospital in Singapore where he is receiving medical attention. Unlike in the past when the former president would require just about a month for this, his physicians this time around determined that he be kept for much longer, from early April this year when he left for his routine check-up,\" read a statement from Mnangagwa.",
                                    "title": "Our prayers are with you, EFF tells Mugabe – The Citizen",
                                    "url": "https://citizen.co.za/news/south-africa/general/2163835/our-prayers-are-with-you-eff-tells-mugabe/amp/"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "ARREST OF ROBERT TINOTENDA MUGABE (JUNIOR) The Zimbabwe Republic Police confirms that Robert Tinotenda Mugabe (Junior) (31) has been arrested on Malicious Damage to Property allegations after a complaint by his friend Nkatazo Sindiso (31) that he destroyed property worth USD12 000.00 at house number 3A Verdi Lane, Strathaven, Harare. He will appear in court in due course.",
                                    "title": "Police Confirm The Arrest Of Late Robert Mugabe Jnr – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/police-confirm-the-arrest-of-late-robert-mugabe-jnr/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "JOHANNESBURG -Charges against Robert Mugabe Junior, the son of the late former President of Zimbabwe Robert Mugabe, have been dropped. Mugabe junior was arrested by police at the weekend on charges of malicious damage to property. He arrived at Harare magistrate's court accompanied by his two lawyers, friends and police officers.",
                                    "title": "Prosecutors hold off charging Mugabe Jr over damage to property - eNCA",
                                    "url": "https://www.enca.com/news/prosecutors-hold-charging-mugabe-jr-over-damage-property"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "The state-controlled Herald newspaper initially published the story of the former president's son's arrest but later withdrew the story from its website after state agents allegedly phoned the editor of the publication. Former Zimbabwean President Robert Mugabe's son Robert Mugabe Jnr (31) was arrested on Sunday. He was escorted by detectives to the Harare Magistrates' Court on Monday, but prosecutors referred his matter back to the police station 'for further management'.",
                                    "title": "Robert Mugabe Jnr arrested on charge of malicious damag...",
                                    "url": "https://www.dailymaverick.co.za/article/2023-02-20-robert-mugabe-jnr-arrested-on-charge-of-malicious-damage-to-property/?utm_campaign=maverick_news"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "THE late former President Robert Gabriel Mugabe's son, Robert Tinotenda Mugabe (Junior), who was arrested on malicious property destruction charges was released",
                                    "title": "Robert Mugabe Jnr arrested, released – DailyNews",
                                    "url": "https://dailynews.co.zw/robert-mugabe-jnr-arrested-released/amp/"
                                },
                                {
                                    "date": "2023-06-14T00:00:00Z",
                                    "snippet": "He was served with summons this week and is expected in court for trial. As woes mounted on him, Mugabe was issued with an arrest warrant after he failed to show up in court. The State alleges he slapped Karimbika, accusing him of urinating on his vehicle.",
                                    "title": "Robert Mugabe Jnr at it again! Slaps friend's relative for urinating on his car, due in court - NewZimbabwe.com",
                                    "url": "https://www.newzimbabwe.com/robert-mugabe-jnr-at-it-again-slaps-friends-relative-for-urinating-on-his-car-due-in-court/"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Police confirmed the arrest saying he was picked up after a friend levelled charges against him. \"The Zimbabwe Republic Police confirms that Robert Tinotenda Mugabe (Junior) (31) has been arrested on Malicious Damage to Property allegations after a complaint by his friend Nkatazo Sindiso (31) that he destroyed property worth US$12 000 at house number 3A Verdi Lane, Strathaven, Harare,\" police said in statement.",
                                    "title": "Robert Mugabe Jnr in court for destroying property worth US$12 000 - The Standard",
                                    "url": "https://thestandard.co.zw/index.php/local-news/article/200007722/robert-mugabe-jnr-in-court-for-destroying-property-worth-us12-000"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "Former Zimbabwean President Robert Mugabe's son Robert Mugabe Jnr (31) was arrested on Sunday and was detained at Avondale police station. He was escorted by detectives to the Harare Magistrates' Court on Monday, but prosecutors referred his matter back to the police station 'for further management'.",
                                    "title": "Robert Mugabe Jnr released so he can celebrate his late father's birthday",
                                    "url": "https://zambianobserver.com/robert-mugabe-jnr-released-so-he-can-celebrate-his-late-fathers-birthday/amp/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "The eldest son of former Zimbabwean dictator Robert Mugabe has been arrested for damaging a house at a party. Robert Mugabe Jnr, 31, is accused of causing $12,000 (£10,000) worth of damage to cars and other property while partying at his friend Sindiso Nkatazo's residence. The allegations relate to a party attended by Mugabe Jnr, known for his playboy antics, in an upmarket area of the capital, Harare, over the weekend.",
                                    "title": "Robert Mugabe's playboy son arrested for 'spree of destruction at wild party' - Daily Star",
                                    "url": "https://www.dailystar.co.uk/news/world-news/robert-mugabes-playboy-son-arrested-29272855.amp"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Robert Tinotenda Mugabe junior has been arrested on charges of causing $12,000 worth of damage to cars and property at a party in Zimbabwe's Harare at the weekend. His friend, Sindiso Nkatazo, made the complaint, police said.",
                                    "title": "Robert Mugabe's son arrested after property destruction at Harare party",
                                    "url": "https://www.thenationalnews.com/world/2023/02/20/robert-mugabes-son-arrested-after-property-destruction-at-harare-party/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "The eldest son of Robert Mugabe, Zimbabwe's former president, has been arrested over allegations he damaged property at a party. Robert Mugabe Jnr, 31, the second child of the late authoritarian leader and his wife, Grace, is accused of causing $12,000 (£10,000) worth of damage to cars and other property belonging to his friend Sindiso Nkatazo, also aged 31. The allegations relate to a party attended by Mugabe Jnr in an upmarket area of the capital, Harare, over the weekend, reports Zimbabwean news site ZimLive.com.",
                                    "title": "Robert Mugabe's son charged in Zimbabwe for damaging cars at Harare party | World News | Sky News",
                                    "url": "https://news.sky.com/story/amp/robert-mugabes-son-charged-in-zimbabwe-for-damaging-cars-at-harare-party-12816214"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "- The National Prosecuting Authority (NPA) on Monday stopped Robert Mugabe Jnr's prosecution on charges of malicious damage to property after a weekend rampage during which he allegedly damaged vehicles and other property in a drunken rage. The 31-year-old son of the late former president Robert Mugabe was arrested on Sunday after his friend Sindiso Nkatazo, 31, filed a police report accusing him of destroying property worth US$12,000 during a party in Harare's upmarket Strathaven neighbourhood.",
                                    "title": "State Prosecutor shields Robert Mugabe Jnr from prosecution over party rampage – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/state-prosecutor-shields-robert-mugabe-jnr-from-prosecution-over-party-rampage/"
                                },
                                {
                                    "date": "2017-12-08T00:00:00Z",
                                    "snippet": "A Zimbabwean court on Thursday freed a Mugabe-era finance minister on bail ahead of his trial on corruption charges, laid following his arrest at the height of last month's military takeover. Ignatius Chombo, a close ally of former president Robert Mugabe who resigned on November 21, was the first Mugabe loyalist to be charged with a crime. The Zimbabwe High Court freed him on $5 000-bail but ordered he report to police three times a day, surrender his passport and stay away from government offices and the central bank.",
                                    "title": "Top Africa stories: Mugabe, Mnangagwa, Libya | News24",
                                    "url": "https://www.news24.com/Africa/News/top-africa-stories-mugabe-mnangagwa-libya-20171208"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Convicted of sedition, he spent the next ten years in prison. Robert Mugabe Junior, 31, one of three children of the former Zimbabwean leader, has been accused of destroying cars at a party last weekend in the country's capital Harare. The estimated value of the damaged property is $12,000 police said.",
                                    "title": "What Was Robert Mugabe's Son Arrested For?",
                                    "url": "https://sputnikglobe.com/20230220/what-was-robert-mugabes-son-arrested-for-1107633040.html?chat_room_id=1107633040"
                                },
                                {
                                    "date": "2020-09-13T00:00:00Z",
                                    "snippet": ": Mugabe, Africa's longest-serving dictator, who has been implicated in serious human rights abuses throughout his 37 years in charge. Like father, like mother, like sons.",
                                    "title": "Zim's disgraceful first family | News | Africa | M&G",
                                    "url": "https://mg.co.za/article/2017-08-18-00-zims-disgraceful-first-family"
                                },
                                {
                                    "date": "2019-09-14T00:00:00Z",
                                    "snippet": "(Reuters) Friends and enemies A young Mugabe was once jailed in the former British colony Rhodesia for his nationalist ideas. But he swept to power in the 1980 elections after a guerrilla war and sanctions forced the Rhodesian government to the negotiating table.",
                                    "title": "Zimbabwe's Mugabe honoured at state funeral, burial delayed - EntornoInteligente",
                                    "url": "https://www.entornointeligente.com/zimbabwes-mugabe-honoured-at-state-funeral-burial-delayed/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "Robert Mugabe Junior (31) was set free Monday following his arrest at the weekend. Mugabe was accused of damaging a friend's vehicle and property worth US$12,000 during a party held in Harare's Strathaven suburb. He spent the night in detention at Avondale Police Station before being taken to Harare magistrate court where he spent the day going up and down the corridors, from office to office before he was set free.",
                                    "title": "Zimbabwe: Mugabe Junior Set Free After Arrest - Says Lawyer - 'The State Decided to Give Parties the Opportunity to Negotiate' - allAfrica.com",
                                    "url": "https://allafrica.com/stories/202302210024.html"
                                },
                                {
                                    "date": "2023-06-15T00:00:00Z",
                                    "snippet": "Robert Mugabe Junior, son of late former President has been hit with fresh criminal charges of assault. In February he was dragged to court accused of malicious damage to property after he smashed his friend, Simbiso Nkatazo's vehicle.",
                                    "title": "Zimbabwe: Robert Mugabe Jnr At It Again! Slaps Friend's Relative for Urinating On His Car, Due in Court - allAfrica.com",
                                    "url": "https://allafrica.com/stories/202306150053.html"
                                }
                            ],
                            "name": "Robert Mugabe Jnr",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-property",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Tinotenda Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Tinotenda Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Mugabe Jnr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabe, Jr."
                                }
                            ],
                            "associates": [
                                {
                                    "association": "parent",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Robert Gabriel Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++age&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Robert+Gabriel+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++age&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Robert+Gabriel+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Zimbabwe"
                                }
                            ],
                            "id": "NW48HUWBK4ZLS5P",
                            "last_updated_utc": "2024-09-10T22:15:55Z",
                            "name": "Robert Mugabe, Jr.",
                            "sources": [
                                "complyadvantage"
                            ],
                            "types": [
                                "pep"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep"
                                ],
                                "matching_name": "Robert Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Peter Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Tinotenda Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Jnr Mugabe"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "parent",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Robert Gabriel Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++family&ucbcb=1"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Netherlands"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++family&ucbcb=1"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Netherlands"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "date-of-birth-enrichment",
                                    "tag": "date_of_birth",
                                    "value": "1992-04-11"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "date-of-birth-enrichment",
                                    "tag": "related_url",
                                    "value": "https://www.pindula.co.zw/Robert_Mugabe_Junior"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Netherlands, United Kingdom, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "A7BHR4MPWCOUO2T",
                            "last_updated_utc": "2023-11-06T11:27:28Z",
                            "media": [
                                {
                                    "snippet": ": \"Mugabe's son arrested for damaging property -",
                                    "title": "(no title)",
                                    "url": "https://zambianobserver.com/wp-json/wp/v2/posts/433252"
                                },
                                {
                                    "date": "2017-08-27T00:00:00Z",
                                    "snippet": "Zijn conclusie luidt dat het daarom van belang is om de economische samenhang binnen de EMU te versterken. Wat hebben Teodorin Nguema Obiang Mangue, Duduzane Zuma, Robert Peter Mugabe Jr. en Chatunga Bellarmine Mugabe gemeen? Het zijn allen zonen van puissant rijke Afrikaanse dictators",
                                    "title": "Follow the Money selecteert - Follow the Money - Platform voor onderzoeksjournalistiek",
                                    "url": "https://www.ftm.nl/artikelen/follow-the-money-selecteert-27aug2017?utm_campaign=sharebuttonnietleden&utm_medium=social"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "A son of Robert Mugabe, Zimbabwe's former president, has been arrested and charged with damaging property after a party where he was accused of smashing up cars. Robert Tinotenda Mugabe Jr was accused of smashing up £10,000 worth of property at a party in the Strathaven suburb of the capital, Harare. The former dictator's son faces three charges of malicious damage to property and two charges of assaulting a police officer, his lawyer said.",
                                    "title": "Robert Mugabe's son charged with smashing up £10,000 worth of cars",
                                    "url": "https://www.telegraph.co.uk/world-news/2023/02/20/robert-mugabes-son-charged-smashing-10000-worth-cars/"
                                }
                            ],
                            "name": "Robert Jnr Mugabe",
                            "sources": [
                                "complyadvantage",
                                "complyadvantage-adverse-media",
                                "date-of-birth-enrichment"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-general-aml-cft",
                                "adverse-media-v2-other-minor",
                                "pep",
                                "pep-class-1"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep",
                                    "pep-class-1"
                                ],
                                "matching_name": "Robert Peter Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Tinotenda Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Peter Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Jnr Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Brig Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "L5R6GBGCNQUVIM4",
                            "last_updated_utc": "2024-04-17T03:22:39Z",
                            "media": [
                                {
                                    "date": "2024-04-16T00:00:00Z",
                                    "snippet": "A National Unity Platform (NUP) supporter, Muydin Kakooza aka Saanya who has been on remand since May 2021, on Monday jumped out of the dock to charge at army court's chairman Brig Robert Mugabe after being denied bail again for the third time. Kakooza is accused alongside 27 others including Yasin Ssekitoleko alias Machete, Robert Christopher Rugumayo, Patrick Mwase, Simon Kikaabe, Olivia Lutaaya, Abdu Matovu, Ronald Kijambo, Sharif Kalanzi, Joseph Muwonge, Mesach Kiwanuka, Abdalla Kintu, Umar Emma Kato, and Musa Kavuma of being in illegal possession of 13 pieces of explosive devices between November 2020 and May 2021 in areas of Jinja, Mbale, Kireka, Nakulabye, Kawempe, Natete, and Kampala Central.",
                                    "title": "NUP supporters protest continued detention as army court denies them bail again",
                                    "url": "https://observer.ug/index.php/news/headlines/81066-nup-supporters-protest-continued-detention-as-army-court-denies-them-bail-again"
                                }
                            ],
                            "name": "Brig Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Brig Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Zimbabwe Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Switzerland"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France, Mali, Rwanda, Switzerland"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Mali"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Rwanda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "France, Mali, Rwanda, Switzerland"
                                }
                            ],
                            "id": "G02VX7RUNJTAYE5",
                            "last_updated_utc": "2024-05-09T04:38:05Z",
                            "media": [
                                {
                                    "snippet":"Le soutien longtemps inconditionnel des allis dAfrique australe ne sera peut-tre pas ternel. En Afrique du Sud, la faveur d accords conomiques (barrage dInga et contrats miniers) le prsident Jacob Zuma a longtemps reprsent un alli de taille, mais il est aujourdhui contest pour cause de corruption tandis quau Zimbabwe Robert Mugabe, le plus fidle des amis de Kinshasa, a du passer la main. En Angola, le prsident dos Santos na pas hsit faire fermer la frontire au plus fort de la crise du Kasa afin de bloquer lafflux des rfugis et son successeur Joao Louren a prvenu quil ne tolrerait aucun dbordement.",
                                    "title": "(no title)",
                                    "url": "https://rwandaises.com/wp-json/wp/v2/posts/35749"
                                },
                                {
                                    "snippet": "Le Zimbabwe a requis l'immunité diplomatique pour Grace Mugabe, accusée d'agression Le Zimbabwe a requis l'immunité diplomatique pour Grace Mugabe, accusée d'agression L 'épouse du président du Zimbabwe Robert Mugabe est accusée d 'avoir agressé un mannequin dans un hôtel de la ville sud-africaine de Johannesburg, dimanche. Les autorités du Zimbabwe ont requis l'immunité diplomatique pour la première dame du pays Grace Mugabe, accusée d'avoir agressé dimanche un mannequin dans hôtel de Johannesburg, a annoncé mercredi le ministère sud-africain de la Police.",
                                    "title": "Le Zimbabwe a requis l'immunité diplomatique pour Grace Mugabe, accusée d'agression",
                                    "url": "http://www.europe1.fr/international/le-zimbabwe-a-requis-limmunite-diplomatique-pour-grace-mugabe-accusee-dagression-3412616"
                                },
                                {
                                    "date": "2017-11-19T00:00:00Z",
                                    "snippet": "La politique européenne est-elle inhumaine, comme l'accuse l'ONU? ZIMBABWE Robert Mugabe sera destitué, s'il ne démissionne pas d'ici à lundi. L'inamovible président zimbabwéen lâché de toutes parts.",
                                    "title": "TV5MONDE : Kiosque - LIBAN, ESCLAVAGE EN LIBYE, CHUTE DE MUGABE, COP23",
                                    "url": "http://www.tv5monde.com/cms/chaine-francophone/Revoir-nos-emissions/Kiosque/Episodes/p-33334-LIBAN-ESCLAVAGE-EN-LIBYE-CHUTE-DE-MUGABE-COP23.htm"
                                },
                                {
                                    "date": "2017-02-01T00:00:00Z",
                                    "snippet": "l'opposant Evan Mawarire interpellé Le pasteur Evan Mawarire, l'un des chefs de file de la fronde contre le président du Zimbabwe Robert Mugabe, a été arrêté mercredi à l'aéroport d' Harare, alors qu'il rentrait de plus de six mois d'exil, a-t-on appris auprès de sa soeur. \"Quand il est arrivé à l'aéroport, il a été escorté dans une pièce par trois hommes avant même de passer par l'immigration ou la douane\", a affirmé à l'AFP Telda Mawarire.",
                                    "title": "Zimbabwe: l'opposant Evan Mawarire interpellé | Slate Afrique",
                                    "url": "http://www.slateafrique.com/716696/zimbabwe-lopposant-evan-mawarire-interpelle-"
                                },
                                {
                                    "date": "2017-02-02T00:00:00Z",
                                    "snippet": "Harare Le pasteur Evan Mawarire, l'un des chefs de file de la fronde contre le président du Zimbabwe Robert Mugabe, a été arrêté mercredi à l'aéroport d' Harare, alors qu'il rentrait de plus de six mois d'exil, a-t-on appris auprès de sa soeur. \"Quand il est arrivé à l'aéroport, il a été escorté dans une pièce par trois hommes avant même de passer par l'immigration ou la douane\", a affirmé à l'AFP Telda Mawarire.",
                                    "title": "Zimbabwe: l'opposant Evan Mawarire interpellé à l'aéroport d'Harare",
                                    "url": "http://www.romandie.com/news/Zimbabwe-lopposant-Evan-Mawarire-interpelle-a-laeroport_ROM/771823.rom"
                                },
                                {
                                    "date": "2017-02-01T00:00:00Z",
                                    "snippet": "AFP/Archives Le pasteur Evan Mawarire, l'un des chefs de file de la fronde contre le président du Zimbabwe Robert Mugabe, a été arrêté mercredi à l'aéroport d' Harare, alors qu'il rentrait de plus de six mois d'exil, a-t-on appris auprès de sa soeur. \"Quand il est arrivé à l'aéroport, il a été escorté dans une pièce par trois hommes avant même de passer par l'immigration ou la douane\", a affirmé à l'AFP Telda Mawarire.",
                                    "title": "Zimbabwe: l'opposant Evan Mawarire interpellé à l'aéroport d'Harare | Courrier international",
                                    "url": "http://www.courrierinternational.com/depeche/zimbabwe-lopposant-evan-mawarire-interpelle-son-retour-dexil.afp.com.20170201.doc.lb5sx.xml"
                                }
                            ],
                            "name": "Zimbabwe Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-general-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Zimbabwe Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabe"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "spouse",
                                    "name": "Grace Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://fr.wikipedia.org/wiki/Grace_Mugabe"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://fr.wikipedia.org/wiki/Grace_Mugabe"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Zimbabwe"
                                }
                            ],
                            "id": "QFO48Z97SNZD7WS",
                            "last_updated_utc": "2024-08-23T07:09:39Z",
                            "name": "Robert Mugabe",
                            "sources": [
                                "complyadvantage"
                            ],
                            "types": [
                                "pep"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "equivalent_name"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep"
                                ],
                                "matching_name": "Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "equivalent_name"
                                        ],
                                        "query_term": "bob"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            }
                        ],
                        "score": 0.2
                    }
                ]
            }
        },
        "status": "success"
    })
}

pub fn incode_watchlist_result_response_medium_fuzzy_hits() -> serde_json::Value {
    serde_json::json!({
        "content": {
            "data": {
                "id": 1994577825,
                "ref": "1729271445-ersCFW3G",
                "searcher_id": 14876,
                "assignee_id": 14876,
                "filters": {
                    "country_codes": [],
                    "entity_type": "person",
                    "exact_match": false,
                    "fuzziness": 0.7,
                    "remove_deceased": 0,
                    "types": [
                        "adverse-media-v2-other-minor",
                        "sanction",
                        "warning",
                        "pep-class-1",
                        "pep-class-2",
                        "pep",
                        "adverse-media-v2-cybercrime",
                        "adverse-media-v2-financial-difficulty",
                        "adverse-media-v2-regulatory",
                        "adverse-media-v2-financial-aml-cft",
                        "adverse-media-v2-fraud-linked",
                        "adverse-media-v2-other-serious",
                        "adverse-media-v2-property",
                        "adverse-media-v2-violence-aml-cft",
                        "adverse-media-v2-narcotics-aml-cft",
                        "adverse-media-v2-terrorism",
                        "adverse-media-v2-other-financial",
                        "fitness-probity",
                        "pep-class-4",
                        "pep-class-3",
                        "adverse-media-v2-general-aml-cft",
                        "adverse-media-v2-violence-non-aml-cft"
                    ]
                },
                "match_status": "potential_match",
                "risk_level": "unknown",
                "search_term": "Rober Mugabe",
                "total_hits": 1,
                "total_matches": 1,
                "updated_at": "2024-10-18 17:10:45",
                "created_at": "2024-10-18 17:10:45",
                "tags": [],
                "limit": 100,
                "offset": 0,
                "share_url": "https://app.eu.complyadvantage.com/public/search/1729271445-ersCFW3G/edd50e5c980a",
                "hits": [
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "রবার্ট মুগাবে"
                                },
                                {
                                    "name": "Mugabe; Robert Gabriel"
                                },
                                {
                                    "name": "رابرت موگابه"
                                },
                                {
                                    "name": "Robertus Mugabe"
                                },
                                {
                                    "name": "Робърт Мугабе"
                                },
                                {
                                    "name": "Ρόμπερτ Μουγκάμπε"
                                },
                                {
                                    "name": "Ռոբերտ Մուգաբե"
                                },
                                {
                                    "name": "Rob Mugabe"
                                },
                                {
                                    "name": "Роберта Мугабе"
                                },
                                {
                                    "name": "Mugabe Robert"
                                },
                                {
                                    "name": "Robert Mugabes"
                                },
                                {
                                    "name": "റോബർട്ട് മുഗാബെ"
                                },
                                {
                                    "name": "ロバート・ムガベ"
                                },
                                {
                                    "name": "Robert Mugabe"
                                },
                                {
                                    "name": "روبرت موغابي"
                                },
                                {
                                    "name": "Gabriel Robert Mugabe"
                                },
                                {
                                    "name": "Zimbabwe Robert Mugabe"
                                },
                                {
                                    "name": "Mugabe Gabriel Robert"
                                },
                                {
                                    "name": "Роберт Мугабэ"
                                },
                                {
                                    "name": "Robert Mugade"
                                },
                                {
                                    "name": "Mugabe Robert Gabriel"
                                },
                                {
                                    "name": "रॉबर्ट मुगाबे"
                                },
                                {
                                    "name": "Роберт Мугабе"
                                },
                                {
                                    "name": "رابرٹ موگابے"
                                },
                                {
                                    "name": "Roberts Mugabe"
                                },
                                {
                                    "name": "ராபர்ட் முகாபே"
                                },
                                {
                                    "name": "Robert Ga briel Mugabe"
                                },
                                {
                                    "name": "Robert Magabe"
                                },
                                {
                                    "name": "Роберто Мугабе"
                                },
                                {
                                    "name": "Robert Muqabe"
                                },
                                {
                                    "name": "Оберт Мугабе"
                                },
                                {
                                    "name": "Bob Mugabe"
                                },
                                {
                                    "name": "R. G. Mugabe"
                                },
                                {
                                    "name": "Rober Mugabe"
                                },
                                {
                                    "name": "Robert Gabriel Mugabe"
                                },
                                {
                                    "name": "Robert Mogabe"
                                },
                                {
                                    "name": "Robert G. Mugabe"
                                },
                                {
                                    "name": "로버트 무가베"
                                },
                                {
                                    "name": "羅伯·穆加貝"
                                },
                                {
                                    "name": "รอเบิร์ต มูกาบี"
                                },
                                {
                                    "name": "Robbert Mugabe"
                                },
                                {
                                    "name": "רוברט מוגאבה"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "child",
                                    "name": "Bona Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Bona Mugabe"
                                },
                                {
                                    "association": "child",
                                    "name": "Chatunga Bellarmine Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Gabriel Mugabe Matibiri"
                                },
                                {
                                    "association": "former spouse",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "sibling",
                                    "name": "Michael Mugabe"
                                },
                                {
                                    "association": "child",
                                    "name": "Michael Nhamodzenyika Mugabe"
                                },
                                {
                                    "association": "relative",
                                    "name": "Patrick Zhuwao"
                                },
                                {
                                    "association": "child",
                                    "name": "Robert Mugabe Jr."
                                },
                                {
                                    "association": "child",
                                    "name": "Robert Peter Mugabe Jr."
                                },
                                {
                                    "association": "relative",
                                    "name": "Robert Zhuwawo"
                                },
                                {
                                    "association": "sibling",
                                    "name": "Sabina Mugabe"
                                },
                                {
                                    "association": "spouse",
                                    "name": "Sally Hayfron"
                                },
                                {
                                    "association": "former spouse",
                                    "name": "Sally Mugabe"
                                },
                                {
                                    "association": "relative",
                                    "name": "Simbanashe Chikore"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Nationality",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Place of Birth Text",
                                    "source": "complyadvantage",
                                    "value": "Harare"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Egypt"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Egypt, Kenya, South Africa"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany, Indonesia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Indonesia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria, South Africa, Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russian Federation"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Turkey"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Turkey"
                                },
                                {
                                    "name": "Country",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
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
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage",
                                    "tag": "date_of_birth",
                                    "value": "1924"
                                },
                                {
                                    "name": "Country",
                                    "source": "company-am",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "tresor-direction-generale",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "hm-treasury-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "company-am",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "europe-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "iceland-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "dfat-australia-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "special-economic-measures-act",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1914"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "ofac-sdn-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1924"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "swiss-seco-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Passport",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Date of Death",
                                    "source": "complyadvantage",
                                    "tag": "date_of_death",
                                    "value": "2019"
                                },
                                {
                                    "name": "Passport",
                                    "source": "hm-treasury-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Date of Death",
                                    "source": "complyadvantage",
                                    "tag": "date_of_death",
                                    "value": "2019-09-06"
                                },
                                {
                                    "name": "Gender",
                                    "source": "complyadvantage",
                                    "value": "male"
                                },
                                {
                                    "name": "Passport",
                                    "source": "europe-sanctions-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "iceland-sanctions-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "swiss-seco-list",
                                    "tag": "passport",
                                    "value": "AD001095, Issued by Zimbabwe"
                                },
                                {
                                    "name": "Passport",
                                    "source": "tresor-direction-generale",
                                    "tag": "passport",
                                    "value": "Passeport n° AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "ofac-sdn-list",
                                    "tag": "passport",
                                    "value": "Passport: AD002119, Issuing Country: Zimbabwe"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Chairperson Of The African Union"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Chairperson Of The Organisation Of African Unity"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Politician"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "President"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "President Of Zimbabwe"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Prime Minister Of Zimbabwe"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "swiss-seco-list",
                                    "value": "2018-02-27"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Secretary General Of The Non-aligned Movement"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2019-03-08 00:00:00"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "former President of Zimbabwe"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Arrêté Ministériel n° 2008-400 du 30 juillet 2008 portant application de l'ordonnance souveraine n° 1.675 du 10 juin 2008 relative aux procédures de gel des fonds mettant en œuvre des sanctions économiques, visant le Zimbabwe"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "ofac-sdn-list",
                                    "value": "2003-03-10"
                                },
                                {
                                    "name": "Chamber",
                                    "source": "complyadvantage",
                                    "value": "African Union"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2008-08-08 00:00:00"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "iceland-sanctions-list",
                                    "value": "2012-02-17 00:00:00"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "dfat-australia-list",
                                    "value": "2012-03-02"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "2014"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "swiss-seco-list",
                                    "value": "2018-02-27"
                                },
                                {
                                    "name": "Function",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Function",
                                    "source": "iceland-sanctions-list",
                                    "value": "President"
                                },
                                {
                                    "name": "List Name",
                                    "source": "ofac-sdn-list",
                                    "value": "SDN List"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "ofac-sdn-list",
                                    "value": "OFAC-7480"
                                },
                                {
                                    "name": "Listing Origin",
                                    "source": "swiss-seco-list",
                                    "value": "EU"
                                },
                                {
                                    "name": "National Id",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "AD001095 (passport-National passport) ((passport))"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "tresor-direction-generale",
                                    "value": "Désigné par l'Union européenne le 21/02/2002, par les règlements (UE) 2016/218 du 16/02/2016, (UE) 2018/223 du 15/02/2018, (UE)2019/283 du 18/02/2019"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "dfat-australia-list",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "hm-treasury-list",
                                    "value": "Former President."
                                },
                                {
                                    "name": "Other Information",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "President; born 21.2.1924"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "tresor-direction-generale",
                                    "value": "Renseignements complémentaires : Ancien président; responsable d'activités qui portent gravement atteinte à la démocratie, au respect des droits de l'homme et à l'État de droit"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32019R0283&from=EN"
                                },
                                {
                                    "name": "Program",
                                    "source": "dfat-australia-list",
                                    "value": "Autonomous (Zimbabwe)"
                                },
                                {
                                    "name": "Program",
                                    "source": "swiss-seco-list",
                                    "value": "Ordinance of 19 March 2002 on measures against Zimbabwe (SR 946.209.2), annex 2"
                                },
                                {
                                    "name": "Party",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe African National Union"
                                },
                                {
                                    "name": "Program",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "The lists published on the official site of The Malta Financial Services Authority include United Nations; European Union and United States sanctions; that have been implemented by Malta under its own laws and regulations during the 2010 - 2016 period. However; entities found on the present list are to be considered active (under current sanctions of Malta) only if they are also under current UN and/or EU sanctions. Also; all UN and EU current sanctions; even those that are not on the present list; are to be considered as active in Malta; as the Maltese National Interest (Enabling Powers) Act provides for the direct applicability into Maltese law of all the sanctions issued by the United Nations Security Council and the sanctions imposed by the Council of the European Union."
                                },
                                {
                                    "name": "Program",
                                    "source": "ofac-sdn-list",
                                    "value": "ZIMBABWE"
                                },
                                {
                                    "name": "Program",
                                    "source": "special-economic-measures-act",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Reason",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "COUNCIL REGULATION (EC) No 314/2004 of 19 February 2004"
                                },
                                {
                                    "name": "Reason",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Chef du gouvernement ; responsable d'activités qui portent gravement atteinte à la démocratie, au respect des droits de l'homme et à l'État de droit."
                                },
                                {
                                    "name": "Reason",
                                    "source": "swiss-seco-list",
                                    "value": "Former President and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Reason",
                                    "source": "swiss-seco-list",
                                    "value": "Head of Government and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Reason",
                                    "source": "iceland-sanctions-list",
                                    "value": "Head of Government and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Regime",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "2019/283 (OJ L47)"
                                },
                                {
                                    "name": "Regime",
                                    "source": "hm-treasury-list",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Regime",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe (annexe III Gel actif)"
                                },
                                {
                                    "name": "Regulation",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "ZWE"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "related_url",
                                    "value": "https://journaldemonaco.gouv.mc/Journaux/2008/Journal-7872/Arrete-Ministeriel-n-2008-400-du-30-juillet-2008-portant-application-de-l-ordonnance-souveraine-n-1.675-du-10-juin-2008-relative-aux-procedures-de-gel-des-fonds-mettant-en-oeuvre-des-sanctions-economiques-visant-le-Zimbabwe; https://journaldemonaco.gouv.mc/Journaux/2020/Journal-8477/Arrete-Ministeriel-n-2020-192-du-5-mars-2020-modifiant-l-arrete-ministeriel-n-2008-400-du-30-juillet-2008-portant-application-de-l-Ordonnance-Souveraine-n-1.675-du-10-juin-2008-relative-aux-procedures-de-gel-des-fonds-mettant-en-oeuvre-des-sanctions-eco"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "tag": "related_url",
                                    "value": "https://mfsa.com.mt/pages/readfile.aspx?f=/files/International%20Affairs/Sanctions%202014/L.N.%20172.2014%20zimbabwe.pdf"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "http://www.au.int/"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "iceland-sanctions-list",
                                    "tag": "related_url",
                                    "value": "https://www.stjornartidindi.is/Advert.aspx?RecordID=e5c9c811-b322-4246-a97d-379b98e0c144"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "tresor-direction-generale",
                                    "tag": "related_url",
                                    "value": "https://www.tresor.economie.gouv.fr/services-aux-entreprises/sanctions-economiques"
                                },
                                {
                                    "name": "Removal Date",
                                    "source": "swiss-seco-list",
                                    "value": "2020-03-03"
                                },
                                {
                                    "name": "Removal Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2020-03-13 00:00:00"
                                },
                                {
                                    "name": "Role",
                                    "source": "europe-sanctions-list",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "ofac-sdn-list",
                                    "value": "Block"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "swiss-seco-list",
                                    "value": "article 2 paragraphs 1 and 2 (Financial sanctions) and article 4 paragraph 1 (Travel ban)"
                                },
                                {
                                    "name": "Title",
                                    "source": "ofac-sdn-list",
                                    "value": "President of the Republic of Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://dbpedia.org/data/Robert_Mugabe.json"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://fr.wikipedia.org/wiki/Robert_Mugabe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Grace+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Grace+Mugabe&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Robert+Gabriel+Mugabe&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "http://www.au.int/en/cpau"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://dbpedia.org/data/Robert_Mugabe.json"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://fr.wikipedia.org/wiki/Robert_Mugabe"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Grace+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Grace+Mugabe&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Robert+Gabriel+Mugabe&ucbcb=1"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Egypt, France, Germany, Indonesia, Kenya, Nigeria, Russian Federation, South Africa, Turkey, United Kingdom, United States, Venezuela, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "N0HUXBOHUAA52RH",
                            "last_updated_utc": "2024-10-09T21:29:08Z",
                            "media": [
                                {
                                    "date": "2022-01-16T00:00:00Z",
                                    "snippet": "A-LOCAL firm Inverness Investments has lost US$500 000 cash to a South African company in a botched loan agreement deal. This was after Brent Greyling (31) the director of the South African company Milean Investment was lured to come to Zimbabwe after he was promised a US$1.2 million loan before he was arrested at the Robert Gabriel Mugabe International Airport for fraud. Greyling who was represented by Rungano Mahuni on Friday appeared before Harare magistrate Sharon Rakafa charged with fraud.",
                                    "title": "A local firm loses US$500 000 in suspected externalisation deal - NewsDay Zimbabwe",
                                    "url": "https://www.newsday.co.zw/2022/01/a-local-firm-loses-us500-000-in-suspected-externalisation-deal/"
                                },
                                {
                                    "date": "2023-07-23T00:00:00Z",
                                    "snippet": "Mugabe once claimed that Zimbabwe's treasury lost more than US$15-billion in diamond money because of corruption, but nothing was done to bring perpetrators to account. Mnangagwa, who promised a raft of reforms, including dealing with corruption, when he took over from Mugabe, has failed to deal with corruption in his government, and his critics have accused him of applying a \"catch and release\" strategy to make it seem as if he was taking action. Some security sector sources alleged that some resources used to finance the military-assisted transition that caused Mugabe to resign in November 2017 were derived from illegal diamond sales, although this could not be independently verified.",
                                    "title": "As Zimbabwe's elections loom, main opposition party 'threatened by Mozambique's Frelimo'",
                                    "url": "https://www.dailymaverick.co.za/article/2023-07-23-as-zimbabwes-elections-loom-main-opposition-party-threatened-by-mozambiques-frelimo/"
                                },
                                {
                                    "date": "2024-06-14T00:00:00Z",
                                    "snippet": "The Centre for Natural Resource Governance expressed concern over a criminal case against five people accused of stealing diamonds during the routine sale of diamonds at the Robert Gabriel Mugabe International Airport in Harare. Notably, on October 26, 2020, Zimbabwe Miners' Federation president Henrietta Rushwaya was arrested at the Robert Gabriel Mugabe International Airport and later convicted for attempting to smuggle six kilogrammes of gold worth US$333 042,28 to Dubai. She, however, got away with a neglible fine.",
                                    "title": "Can Africa Mining Vision unlock Zim's potential for sustainable development and governance? - The Standard",
                                    "url": "https://newsday.co.zw/thestandard/opinion-analysis/article/200028221/can-africa-mining-vision-unlock-zims-potential-for-sustainable-development-and-governance"
                                },
                                {
                                    "date": "2024-08-31T00:00:00Z",
                                    "snippet": "CHATUNGA Bellarmine Mugabe, son of former Zimbabwean leader Robert Mugabe, has been arrested for violent conduct in Beitbridge where he allegedly assaulted a policeman at a roadblock at Bubi, 80 kilometres north of the border town. He is alleged to have brandished a knife in the scuffle with police who now accuse him of resisting arrest.",
                                    "title": "Chatunga Mugabe arrested in Beitbridge -Newsday Zimbabwe",
                                    "url": "https://www.newsday.co.zw/newsday/local-news/article/200031686/chatunga-mugabe-arrested-in-beitbridge"
                                },
                                {
                                    "date": "2019-04-16T00:00:00Z",
                                    "snippet": "PRESIDENT Robbert Mugabe's nephew Leo Mugabe has been accused of attempting to seize a Chinese-owned firm, Hwange Coal Gasification, whose bank account with Stanbic Bank has been frozen at the instigation of its non-executive directors who are allegedly working in cahoots with Mugabe. REPORT BY CHARLES LAITON",
                                    "title": "Chinese, Leo Mugabe lock horns",
                                    "url": "https://www.newsday.co.zw/2013/06/chinese-leo-mugabe-lock-horns/amp/"
                                },
                                {
                                    "date": "2021-06-09T00:00:00Z",
                                    "snippet": "The Archbishop of York, John Sentamu, memorably cut up his clerical collar live on Andrew Marr's Sunday breakfast show in 2007 to demonstrate how Robert Mugabe had destroyed the identity of the people of Zimbabwe. Sentamu believes Mugabe should be tried for crimes against humanity, and pledged not to wear a dog collar again until the president had gone. But nearly two years on there is no sign of the archbishop being able to resume his neckwear.",
                                    "title": "Could you forgive Mugabe?",
                                    "url": "https://www.newstatesman.com/politics/2009/09/mugabe-crimes-catholic?qt-trending=0"
                                },
                                {
                                    "date": "2024-10-09T00:00:00Z",
                                    "snippet": "Governments may shift responsibility to external forces rather than addressing internal governance failures. Zimbabwe, under Robert Mugabe, for example, was accused of attributing the country's economic collapse to Western sanctions, deflecting responsibility away from poor governance and corruption. Blameocracy reduces the focus on domestic accountability and encourages a narrative of victimhood.",
                                    "title": "Dr Muhammad Dan Suleiman: Ten other names we can call Democracy in Africa - MyJoyOnline",
                                    "url": "https://www.myjoyonline.com/dr-muhammad-dan-suleiman-ten-other-names-we-can-call-democracy-in-africa/"
                                },
                                {
                                    "date": "2019-09-06T00:00:00Z",
                                    "snippet": "Robert Mugabe, former prime minister and president of Zimbabwe whose rule was mired in accusations of human rights abuses and corruption, has died aged 95. His 40-year leadership of the former British colony was marked with bloodshed, persecution of political opponents and vote-rigging on a large scale.",
                                    "title": "Former Zimbabwe president Robert Mugabe dies aged 95 | Irish Independent",
                                    "url": "https://www.independent.ie/world-news/former-zimbabwe-president-robert-mugabe-dies-aged-95/38472774.html"
                                },
                                {
                                    "date": "2019-09-06T00:00:00Z",
                                    "snippet": "His rule was mired in accusations of human rights abuses and corruption Robert Mugabe, former prime minister and president of Zimbabwe whose rule was mired in accusations of human rights abuses and corruption, has died aged 95. His near 40-year leadership of the former British colony was marked with bloodshed, persecution of political opponents and vote-rigging on a large scale.",
                                    "title": "Former president of Zimbabwe Robert Mugabe dead at 95 - Liverpool Echo",
                                    "url": "https://www.liverpoolecho.co.uk/news/uk-world-news/former-president-zimbabwe-robert-mugabe-16874091"
                                },
                                {
                                    "date": "2024-04-03T00:00:00Z",
                                    "snippet": "The arrest of Peter Dube marks a significant development in the ongoing investigation into the triple murder case. Dube's arrest at Robert Gabriel Mugabe International Airport brings an end to his nearly three-year evasion of authorities.",
                                    "title": "Fugitive multiple-murders accused Peter Dube arrested at RGM Int. Airport on deportation return from Ireland – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/main/fugitive-mulitple-murders-accused-peter-dube-arrested-at-rgm-int-airport-on-return-on-deportation-return-from-ireland/"
                                },
                                {
                                    "date": "2022-01-27T00:00:00Z",
                                    "snippet": "Zimbabwe was not left out, when on November 15, 2017, the military rolled its tanks into the capital Harare taking over the state broadcast station and announcing that they were in charge of the nation. The coup plotters immediately placed 93-year-old president, Robert Mugabe, and his family under house arrest. This marked the end of his 37-year rule, as pressure mounted from the military, protesters, and looming impeachment in parliament.",
                                    "title": "How recurring coups amplify calls for enhanced governance in Africa | The Guardian Nigeria News - Nigeria and World News — World — The Guardian Nigeria News – Nigeria and World News",
                                    "url": "https://guardian.ng/news/how-recurring-coups-amplify-calls-for-enhanced-governance-in-africa/amp/"
                                },
                                {
                                    "date": "2019-07-19T00:00:00Z",
                                    "snippet": "I particularly want to thank His Excellency, the President and Commander-In-Chief of the Zimbabwe Defence Forces, Cde. R. G Mugabe, who is also the First Secretary of the revolutionary party ZANU PF, for making it possible for me to be in this House today. I am humbled by the magnitude of the confidence and responsibility placed upon me by my revolutionary party ZANU PF and the people of Lobengula Constituency.",
                                    "title": "Lobengula MP blames the mushrooming of Vuzu parties to absentee parents | The Insider",
                                    "url": "https://www.insiderzim.com/lobengula-mp-blames-the-mushrooming-of-vuzu-parties-to-absentee-parents/"
                                },
                                {
                                    "date": "2024-03-10T00:00:00Z",
                                    "snippet": "Soon after his arrest at the Robert Mugabe International Airport, Cuan Reed Govender, 25, was accused of being the \"John Doe\" who had reported a bomb at the Victoria Falls International Airport on Friday. Flights at the airport were suspended following the alleged bomb threat.",
                                    "title": "Man's Zimbabwe airport drama: Arrested for carrying live ammunition and accused of sending a bomb threat",
                                    "url": "https://www.iol.co.za/thepost/community-news/mans-zimbabwe-airport-drama-arrested-for-carrying-live-ammunition-and-accused-of-sending-a-bomb-threat-e156dd6d-d5d1-42f1-9a8a-ea318d2b76fe"
                                },
                                {
                                    "date": "2018-07-19T00:00:00Z",
                                    "snippet": "the ex-president's heavy legacy hangs over the country. The political party Mr. Mugabe led for decades is now represented by Emmerson Mnangagwa, a former vice president who has been accused of organizing brutal repression during Mr. Mugabe's rule. The opposition has been fractured and weakened after the death this year of its longtime leader, Morgan Tsvangirai, who challenged Mr. Mugabe in successive elections in 2002, 2008 and 2013.",
                                    "title": "Mugabe Has Left, but His Legacy Haunts Zimbabwe's Election – The Zimbabwe Mail",
                                    "url": "http://www.thezimbabwemail.com/main/mugabe-has-left-but-his-legacy-haunts-zimbabwes-election/"
                                },
                                {
                                    "date": "2024-04-04T00:00:00Z",
                                    "snippet": "FUGITIVE Gweru murder suspect Peter Dube was arrested yesterday at Robert Gabriel Mugabe International Airport after he was deported from Mozambique. Dube was",
                                    "title": "Murder suspect deported, arrested – DailyNews",
                                    "url": "https://dailynews.co.zw/murder-suspect-deported-arrested/amp/"
                                },
                                {
                                    "date": "2018-09-11T00:00:00Z",
                                    "snippet": "The war veterans/soldiers had to use a coup in order to push Grace Mugabe away. If Grace Mugabe was a genuine/supporting wife, she should have allowed R.G Mugabe to retire from politics long back but because of her love of planes and money, R.G Mugabe had to be subjected to a long period of political prison. On 11/09/2018, I wrote a piece condemning ZANU PF government for abusing taxpayers' money by chartering a plane for Grace Mugabe from Singapore.",
                                    "title": "No difference between Grace Mugabe & Judas Iscariot - Bulawayo24 News",
                                    "url": "https://bulawayo24.com/index-id-opinion-sc-columnist-byo-144993.html"
                                },
                                {
                                    "date": "2024-09-01T00:00:00Z",
                                    "snippet": "His brother Robert Mugabe Junior was arrested in February last year after allegedly damaging property worth US$12 000 in Harare. An investigation by South African unit Amabhungane last year uncovered potential money laundering involving Chatunga, just before Mugabe's ouster in a coup. The investigation revealed a series of illegal Hawala payments made to Chatunga Mugabe through an unnamed individual connected to Ewan Macmillan of the Gold Mafia exposé.",
                                    "title": "Okapi-wielding Chatunga Mugabe charged - The Zimbabwe Independent",
                                    "url": "https://www.theindependent.co.zw/news/article/200031738/okapi-wielding-chatunga-mugabe-charged"
                                },
                                {
                                    "date": "2024-07-28T00:00:00Z",
                                    "snippet": "Like many modern political nightmares Robert Mugabe began as a liberator but ended up unleashing a bloodletting in 1980's Zimbabwe. The ethnic purge known as the \"Gukurahundi\" (translated nicely as 'cleansing rain' and not so nicely as 'sweep away the dirty') unleashed Mugabe's murderous North Korean-trained Five Brigade against his opponents. An estimated 10,000 civilians perished in the \"cleansing rain.\"",
                                    "title": "Playing the 'Hitler card' and misreading history: op-ed",
                                    "url": "https://www.al.com/opinion/2024/07/playing-the-hitler-card-and-misreading-history-op-ed.html?outputType=amp"
                                },
                                {
                                    "date": "2024-05-29T00:00:00Z",
                                    "snippet": "Dziva, along with his accomplice Alex Tombe, was found guilty of demanding a US$20,000 bribe from Rushwaya to secure a lighter sentence for her. Rushwaya was arrested in 2020 at the Robert Mugabe International Airport while attempting to smuggle gold bars weighing 6 kilograms to Dubai. In 2023, she was convicted and fined US$5,000, with an 18-month jail term wholly suspended.",
                                    "title": "Prosecutor in Rushwaya's gold smuggling case convicted of fraud after demanding US$20k bribe – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/prosecutor-in-rushwayas-gold-smuggling-case-convicted-of-fraud-after-demanding-us20k-bribe/"
                                },
                                {
                                    "date": "2019-09-13T00:00:00Z",
                                    "snippet": "He has, therefore, quit life's stage trailed by very unflattering epithets which only very few could have imagined would ever be associated with his name and career during his first decade in office. From his country's independence on April 18, 1980 till November 14, 2017, when the combined effort of the top officers of the Zimbabwean Defence Forces (ZDF) and the top hierarchy of the ruling party, Zimbabwe African National Union-Patriotic Front (ZANU-PF), eased him out of office and got him to resign after one week of being under house arrest, Mugabe served as Zimbabwe's Prime Minister (1980 to 1987) and President (1987 to 2017), following the amendment of the Constitution to institute a presidential system of government. He was in office for nearly four decades during which Zimbabwe's economy witnessed grievous decline, the citizenry whose country was once hailed as the \"food basket of the continent,\" saw the worst of times and Mr. Mugabe's image plummeted badly.",
                                    "title": "Robert Gabriel Mugabe (1924 – 2019) – Independent Newspaper Nigeria",
                                    "url": "https://independent.ng/robert-gabriel-mugabe-1924-2019/"
                                },
                                {
                                    "date": "2019-09-07T00:00:00Z",
                                    "snippet": "However, a brutal military campaign waged against an uprising in western Matabeleland province that ended in 1987 augured a bitter turn in Zimbabwe's fortunes. As the years went by, Mugabe was widely accused of hanging onto power through violence and vote fraud, notably in a 2008 election that led to a troubled coalition government after regional mediators intervened. \"I have many degrees in violence,\" Mugabe once boasted on a campaign trail, raising his fist.",
                                    "title": "Robert Mugabe Joins Ancestors - BNW | BiafraNigeriaWorld",
                                    "url": "http://biafranigeriaworld.com/2019/09/07/robert-mugabe-joins-ancestors/"
                                },
                                {
                                    "date": "2019-09-05T00:00:00Z",
                                    "snippet": "However, a brutal military campaign waged against an uprising in western Matabeleland province that ended in 1987 augured a bitter turn in Zimbabwe 's fortunes. As the years went by, Mugabe was widely accused of hanging onto power through violence and vote fraud, notably in a 2008 election that led to a troubled coalition government after regional mediators intervened. \"I have many degrees in violence, \" Mugabe once boasted on a campaign trail, raising his fist.",
                                    "title": "Robert Mugabe, strongman who ruled Zimbabwe for decades, dies | Las Vegas Review-Journal",
                                    "url": "https://www.reviewjournal.com/news/nation-and-world/robert-mugabe-strongman-who-ruled-zimbabwe-for-decades-dies-1842196/"
                                },
                                {
                                    "date": "2023-11-01T00:00:00Z",
                                    "snippet": "Tserai and Mufandauya have been acquitted due to a lack of evidence, marking a dramatic turn of events. Rushwaya's conviction stems from an incident three years ago when she was arrested at the Robert Gabriel Mugabe International Airport on October 26, 2020, attempting to board a flight to Dubai with 6kg of gold valued at approximately US$333,000 in her possession. During her defense, Rushwaya claimed that she mistakenly picked up the wrong bag, which contained the gold, instead of her own.",
                                    "title": "Rushwaya Convicted Proving Hopewell's Actually Closer To Mnangagwa Than Her – ZimEye",
                                    "url": "https://www.zimeye.net/2023/11/01/rushwaya-convicted-proving-hopewells-actually-closer-to-mnangagwa-than-her/"
                                },
                                {
                                    "date": "2018-06-20T00:00:00Z",
                                    "snippet": "Britain's longest-reigning monarch, she meets with foreign leaders frequently at the behest of her ministers. She has greeted numerous presidents over the years who were later condemned for corruption or violence against their own citizens, including Bashar al-Assad of Syria, Nicolae Ceausescu of Romania, Robert G. Mugabe of Zimbabwe, Vladimir V. Putin of Russia, Mobutu Sese Seko of Zaire and Suharto of Indonesia.",
                                    "title": "Trump Will Meet Queen Elizabeth II Next Month, His Ambassador Says - The New York Times",
                                    "url": "https://www.nytimes.com/2018/06/20/world/europe/trump-queen-visit.html"
                                },
                                {
                                    "date": "2023-07-28T00:00:00Z",
                                    "snippet": "In response to questions, Zimbabwe Republic Police (ZRP) confirmed that it has recorded several cases of drug smuggling. \"In one of the cases, on March 27, 2023 police acted on received information and arrested Davison Gomo, 27, at Robert Gabriel Mugabe International Airport in connection with drug trafficking involving cocaine and crystal meth,\" ZRP spokesperson Assistant Commissioner Paul Nyathi said. Gomo had 21kgs of crystal meth and 1,2kgs of cocaine concealed in metal pulleys.",
                                    "title": "Zim turns into international drug transit point - The Zimbabwe Independent",
                                    "url": "https://theindependent.co.zw/index.php/local-news/article/200014572/zim-turns-into-international-drug-transit-point"
                                },
                                {
                                    "date": "2023-05-31T00:00:00Z",
                                    "snippet": "President Mnangagwa at the weekend promised to set the election date this week as he seeks re-election for a second full term in office. Zimbabwe and the US have frosty relations that go back two decades after Washington imposed sanctions on the regime of the late Robert Mugabe for alleged human rights violations and electoral fraud. President Joe Biden's administration has maintained the embargo as it accuses Mr Mugabe's successor of failing to implement economic and political reforms that he promised after the 2017 military coup.",
                                    "title": "Zimbabwe summons US envoy over election tweets | Nation",
                                    "url": "https://nation.africa/africa/news/zimbabwe-summons-us-envoy-over-election-tweets--4252900?redirect_to=https://nation.africa/africa/news/zimbabwe-summons-us-envoy-over-election-tweets--4252900"
                                },
                                {
                                    "date": "2019-08-30T00:00:00Z",
                                    "snippet": "Бархатный путч в Зимбабве Военные арестовали президента Зимбабве Роберта Мугабе В субботу 18 ноября в столице Зимбабве состоялась демонстрация против 93-летнего президента Роберта Мугабе, который бессменно правит южноафриканской страной с 1980 г. На днях, он был изолирован в своей резиденции и взят под домашний арест группой военных. Солдаты опечатали вход в парламент, правительственные учреждения и суды в столице Хараре.",
                                    "title": "Бархатный путч в Зимбабве",
                                    "url": "https://comments.ua/world/602223-barhatniy-putch-zimbabve.html"
                                },
                                {
                                    "date": "2019-09-20T00:00:00Z",
                                    "snippet": "В Зимбабве военные задержали президента страны Роберта Мугабе В Зимбабве военные задержали президента страны Роберта Мугабе Военные, захватившие в  Зимбабве здание государственной телекомпании Зед-би-си, объявили, что взяли под стражу президента страны Роберта Мугабе и  его семью. При этом они не  считают случившееся военным переворотом и  заявляют, что Мугабе и  его родным ничего не  угрожает.",
                                    "title": "В Зимбабве военные задержали президента страны Роберта Мугабе",
                                    "url": "https://gomel.today/amp/rus/news/world-1524/"
                                },
                                {
                                    "date": "2020-05-23T00:00:00Z",
                                    "snippet": "Напомним, 14 ноября зимбабвийский главнокомандующий Константино Чивенга предъявил руководству страны ультиматум с четырьмя требованиями, а к столице Зимбабве Хараре начали стягивать танки. Позже военные арестовали президента страны Роберта Мугабе и его жену Грейс, но позже появилась информация, что она покинула страну.",
                                    "title": "Мугабе выступил с телеобращением: в отставку уходить не собирается - ФОКУС",
                                    "url": "https://focus.ua/amp/world/385315"
                                },
                                {
                                    "date": "2019-09-20T00:00:00Z",
                                    "snippet": "Неназванный источник в  правящей партии «Зимбабвийский африканский национальный союз  - Патриотический фронт» сообщил Associated Press, что главой страны, вероятно, станет бывший вице-президент Эммерсон Мнангагва. 15  ноября группа военных из  высшего командования армии Зимбабве захватила власть в  стране и  посадила президента Роберта Мугабе под домашний арест. Это произошло вскоре после отставки вице-президента Эммерсона Мнангагвы, которого называли одним из  двух вероятных преемников Мугабе.",
                                    "title": "Спикер парламента Зимбабве объявил об отставке Роберта Мугабе",
                                    "url": "https://gomel.today/amp/rus/news/world-1557/"
                                }
                            ],
                            "name": "Rober Mugabe",
                            "sources": [
                                "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                "company-am",
                                "complyadvantage",
                                "complyadvantage-adverse-media",
                                "dfat-australia-list",
                                "europe-sanctions-list",
                                "hm-treasury-list",
                                "iceland-sanctions-list",
                                "malta-financial-services-authority-mfsa-national-sanctions",
                                "monaco-economic-sanctions",
                                "ofac-sdn-list",
                                "special-economic-measures-act",
                                "swiss-seco-list",
                                "tresor-direction-generale"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-cybercrime",
                                "adverse-media-v2-financial-aml-cft",
                                "adverse-media-v2-financial-difficulty",
                                "adverse-media-v2-fraud-linked",
                                "adverse-media-v2-general-aml-cft",
                                "adverse-media-v2-narcotics-aml-cft",
                                "adverse-media-v2-other-financial",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-other-serious",
                                "adverse-media-v2-property",
                                "adverse-media-v2-terrorism",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft",
                                "pep",
                                "pep-class-1",
                                "pep-class-2",
                                "pep-class-4",
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "aka_exact"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Rober Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "rober"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 1.7
                    }
                ]
            }
        },
        "status": "success"
    })
}

pub fn incode_watchlist_result_response_high_fuzzy_hits() -> serde_json::Value {
    serde_json::json!({
        "content": {
            "data": {
                "id": 1994580059,
                "ref": "1729271560-C9fOUhMn",
                "searcher_id": 14876,
                "assignee_id": 14876,
                "filters": {
                    "country_codes": [],
                    "entity_type": "person",
                    "exact_match": false,
                    "fuzziness": 1,
                    "remove_deceased": 0,
                    "types": [
                        "adverse-media-v2-narcotics-aml-cft",
                        "adverse-media-v2-financial-aml-cft",
                        "sanction",
                        "pep-class-4",
                        "adverse-media-v2-regulatory",
                        "adverse-media-v2-other-financial",
                        "adverse-media-v2-general-aml-cft",
                        "adverse-media-v2-other-serious",
                        "adverse-media-v2-fraud-linked",
                        "warning",
                        "pep",
                        "adverse-media-v2-other-minor",
                        "fitness-probity",
                        "pep-class-2",
                        "adverse-media-v2-financial-difficulty",
                        "adverse-media-v2-cybercrime",
                        "adverse-media-v2-violence-non-aml-cft",
                        "adverse-media-v2-violence-aml-cft",
                        "adverse-media-v2-property",
                        "adverse-media-v2-terrorism",
                        "pep-class-1",
                        "pep-class-3"
                    ]
                },
                "match_status": "potential_match",
                "risk_level": "unknown",
                "search_term": "Roberto Mugabe",
                "total_hits": 20,
                "total_matches": 20,
                "updated_at": "2024-10-18 17:12:40",
                "created_at": "2024-10-18 17:12:40",
                "tags": [],
                "limit": 100,
                "offset": 0,
                "share_url": "https://app.eu.complyadvantage.com/public/search/1729271560-C9fOUhMn/e9deef9ea7c2",
                "hits": [
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Mugabe Robert"
                                },
                                {
                                    "name": "റോബർട്ട് മുഗാബെ"
                                },
                                {
                                    "name": "羅伯·穆加貝"
                                },
                                {
                                    "name": "ராபர்ட் முகாபே"
                                },
                                {
                                    "name": "Roberto Mugabe"
                                },
                                {
                                    "name": "Bob Mugabe"
                                },
                                {
                                    "name": "R. G. Mugabe"
                                },
                                {
                                    "name": "روبرت موغابي"
                                },
                                {
                                    "name": "Роберто Мугабе"
                                },
                                {
                                    "name": "Robert Muqabe"
                                },
                                {
                                    "name": "Robert Gabriel Mugabe"
                                },
                                {
                                    "name": "Роберт Мугабе"
                                },
                                {
                                    "name": "Ռոբերտ Մուգաբե"
                                },
                                {
                                    "name": "Mugabe Robert Gabriel"
                                },
                                {
                                    "name": "ロバート・ムガベ"
                                },
                                {
                                    "name": "Robert Magabe"
                                },
                                {
                                    "name": "Robert Mogabe"
                                },
                                {
                                    "name": "Robbert Mugabe"
                                },
                                {
                                    "name": "Roberts Mugabe"
                                },
                                {
                                    "name": "Robertus Mugabe"
                                },
                                {
                                    "name": "Mugabe Gabriel Robert"
                                },
                                {
                                    "name": "Robert Mugade"
                                },
                                {
                                    "name": "Robert Mugabes"
                                },
                                {
                                    "name": "รอเบิร์ต มูกาบี"
                                },
                                {
                                    "name": "Роберта Мугабе"
                                },
                                {
                                    "name": "رابرٹ موگابے"
                                },
                                {
                                    "name": "רוברט מוגאבה"
                                },
                                {
                                    "name": "로버트 무가베"
                                },
                                {
                                    "name": "रॉबर्ट मुगाबे"
                                },
                                {
                                    "name": "Robert G. Mugabe"
                                },
                                {
                                    "name": "Ρόμπερτ Μουγκάμπε"
                                },
                                {
                                    "name": "Robert Ga briel Mugabe"
                                },
                                {
                                    "name": "Rob Mugabe"
                                },
                                {
                                    "name": "Robert Mugabe"
                                },
                                {
                                    "name": "Роберт Мугабэ"
                                },
                                {
                                    "name": "Rober Mugabe"
                                },
                                {
                                    "name": "Оберт Мугабе"
                                },
                                {
                                    "name": "رابرت موگابه"
                                },
                                {
                                    "name": "Робърт Мугабе"
                                },
                                {
                                    "name": "রবার্ট মুগাবে"
                                },
                                {
                                    "name": "Gabriel Robert Mugabe"
                                },
                                {
                                    "name": "Zimbabwe Robert Mugabe"
                                },
                                {
                                    "name": "Mugabe; Robert Gabriel"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "child",
                                    "name": "Bona Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Bona Mugabe"
                                },
                                {
                                    "association": "child",
                                    "name": "Chatunga Bellarmine Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Gabriel Mugabe Matibiri"
                                },
                                {
                                    "association": "former spouse",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "sibling",
                                    "name": "Michael Mugabe"
                                },
                                {
                                    "association": "child",
                                    "name": "Michael Nhamodzenyika Mugabe"
                                },
                                {
                                    "association": "relative",
                                    "name": "Patrick Zhuwao"
                                },
                                {
                                    "association": "child",
                                    "name": "Robert Mugabe Jr."
                                },
                                {
                                    "association": "child",
                                    "name": "Robert Peter Mugabe Jr."
                                },
                                {
                                    "association": "relative",
                                    "name": "Robert Zhuwawo"
                                },
                                {
                                    "association": "sibling",
                                    "name": "Sabina Mugabe"
                                },
                                {
                                    "association": "spouse",
                                    "name": "Sally Hayfron"
                                },
                                {
                                    "association": "former spouse",
                                    "name": "Sally Mugabe"
                                },
                                {
                                    "association": "relative",
                                    "name": "Simbanashe Chikore"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Nationality",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Place of Birth Text",
                                    "source": "complyadvantage",
                                    "value": "Harare"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Egypt"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Egypt, Kenya, South Africa"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany, Indonesia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Indonesia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Kenya"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria, South Africa, Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Nigeria"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russian Federation"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Turkey"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Turkey"
                                },
                                {
                                    "name": "Country",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
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
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage",
                                    "tag": "date_of_birth",
                                    "value": "1924"
                                },
                                {
                                    "name": "Country",
                                    "source": "company-am",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "tresor-direction-generale",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "hm-treasury-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "company-am",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "europe-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "iceland-sanctions-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "dfat-australia-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "special-economic-measures-act",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1914"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "ofac-sdn-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1924"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "swiss-seco-list",
                                    "tag": "date_of_birth",
                                    "value": "1924-02-21"
                                },
                                {
                                    "name": "Passport",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Date of Death",
                                    "source": "complyadvantage",
                                    "tag": "date_of_death",
                                    "value": "2019"
                                },
                                {
                                    "name": "Passport",
                                    "source": "hm-treasury-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Date of Death",
                                    "source": "complyadvantage",
                                    "tag": "date_of_death",
                                    "value": "2019-09-06"
                                },
                                {
                                    "name": "Gender",
                                    "source": "complyadvantage",
                                    "value": "male"
                                },
                                {
                                    "name": "Passport",
                                    "source": "europe-sanctions-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "iceland-sanctions-list",
                                    "tag": "passport",
                                    "value": "AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "swiss-seco-list",
                                    "tag": "passport",
                                    "value": "AD001095, Issued by Zimbabwe"
                                },
                                {
                                    "name": "Passport",
                                    "source": "tresor-direction-generale",
                                    "tag": "passport",
                                    "value": "Passeport n° AD001095"
                                },
                                {
                                    "name": "Passport",
                                    "source": "ofac-sdn-list",
                                    "tag": "passport",
                                    "value": "Passport: AD002119, Issuing Country: Zimbabwe"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Chairperson Of The African Union"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Chairperson Of The Organisation Of African Unity"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Politician"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "President"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "President Of Zimbabwe"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Prime Minister Of Zimbabwe"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "swiss-seco-list",
                                    "value": "2018-02-27"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "Secretary General Of The Non-aligned Movement"
                                },
                                {
                                    "name": "Amended On",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2019-03-08 00:00:00"
                                },
                                {
                                    "name": "Political Position",
                                    "source": "complyadvantage",
                                    "tag": "political_position",
                                    "value": "former President of Zimbabwe"
                                },
                                {
                                    "name": "Designation Act",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Arrêté Ministériel n° 2008-400 du 30 juillet 2008 portant application de l'ordonnance souveraine n° 1.675 du 10 juin 2008 relative aux procédures de gel des fonds mettant en œuvre des sanctions économiques, visant le Zimbabwe"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "ofac-sdn-list",
                                    "value": "2003-03-10"
                                },
                                {
                                    "name": "Chamber",
                                    "source": "complyadvantage",
                                    "value": "African Union"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2008-08-08 00:00:00"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "iceland-sanctions-list",
                                    "value": "2012-02-17 00:00:00"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "dfat-australia-list",
                                    "value": "2012-03-02"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "2014"
                                },
                                {
                                    "name": "Designation Date",
                                    "source": "swiss-seco-list",
                                    "value": "2018-02-27"
                                },
                                {
                                    "name": "Function",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Function",
                                    "source": "iceland-sanctions-list",
                                    "value": "President"
                                },
                                {
                                    "name": "List Name",
                                    "source": "ofac-sdn-list",
                                    "value": "SDN List"
                                },
                                {
                                    "name": "Listing Id",
                                    "source": "ofac-sdn-list",
                                    "value": "OFAC-7480"
                                },
                                {
                                    "name": "Listing Origin",
                                    "source": "swiss-seco-list",
                                    "value": "EU"
                                },
                                {
                                    "name": "National Id",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "AD001095 (passport-National passport) ((passport))"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "tresor-direction-generale",
                                    "value": "Désigné par l'Union européenne le 21/02/2002, par les règlements (UE) 2016/218 du 16/02/2016, (UE) 2018/223 du 15/02/2018, (UE)2019/283 du 18/02/2019"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "dfat-australia-list",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "hm-treasury-list",
                                    "value": "Former President."
                                },
                                {
                                    "name": "Other Information",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "President; born 21.2.1924"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "tresor-direction-generale",
                                    "value": "Renseignements complémentaires : Ancien président; responsable d'activités qui portent gravement atteinte à la démocratie, au respect des droits de l'homme et à l'État de droit"
                                },
                                {
                                    "name": "Other Information",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "https://eur-lex.europa.eu/legal-content/EN/TXT/PDF/?uri=CELEX:32019R0283&from=EN"
                                },
                                {
                                    "name": "Program",
                                    "source": "dfat-australia-list",
                                    "value": "Autonomous (Zimbabwe)"
                                },
                                {
                                    "name": "Program",
                                    "source": "swiss-seco-list",
                                    "value": "Ordinance of 19 March 2002 on measures against Zimbabwe (SR 946.209.2), annex 2"
                                },
                                {
                                    "name": "Party",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe African National Union"
                                },
                                {
                                    "name": "Program",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "The lists published on the official site of The Malta Financial Services Authority include United Nations; European Union and United States sanctions; that have been implemented by Malta under its own laws and regulations during the 2010 - 2016 period. However; entities found on the present list are to be considered active (under current sanctions of Malta) only if they are also under current UN and/or EU sanctions. Also; all UN and EU current sanctions; even those that are not on the present list; are to be considered as active in Malta; as the Maltese National Interest (Enabling Powers) Act provides for the direct applicability into Maltese law of all the sanctions issued by the United Nations Security Council and the sanctions imposed by the Council of the European Union."
                                },
                                {
                                    "name": "Program",
                                    "source": "ofac-sdn-list",
                                    "value": "ZIMBABWE"
                                },
                                {
                                    "name": "Program",
                                    "source": "special-economic-measures-act",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Reason",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "value": "COUNCIL REGULATION (EC) No 314/2004 of 19 February 2004"
                                },
                                {
                                    "name": "Reason",
                                    "source": "monaco-economic-sanctions",
                                    "value": "Chef du gouvernement ; responsable d'activités qui portent gravement atteinte à la démocratie, au respect des droits de l'homme et à l'État de droit."
                                },
                                {
                                    "name": "Reason",
                                    "source": "swiss-seco-list",
                                    "value": "Former President and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Reason",
                                    "source": "swiss-seco-list",
                                    "value": "Head of Government and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Reason",
                                    "source": "iceland-sanctions-list",
                                    "value": "Head of Government and responsible for activities that seriously undermine democracy, respect for human rights and the rule of law."
                                },
                                {
                                    "name": "Regime",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "2019/283 (OJ L47)"
                                },
                                {
                                    "name": "Regime",
                                    "source": "hm-treasury-list",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Regime",
                                    "source": "tresor-direction-generale",
                                    "value": "Zimbabwe (annexe III Gel actif)"
                                },
                                {
                                    "name": "Regulation",
                                    "source": "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                    "value": "ZWE"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "monaco-economic-sanctions",
                                    "tag": "related_url",
                                    "value": "https://journaldemonaco.gouv.mc/Journaux/2008/Journal-7872/Arrete-Ministeriel-n-2008-400-du-30-juillet-2008-portant-application-de-l-ordonnance-souveraine-n-1.675-du-10-juin-2008-relative-aux-procedures-de-gel-des-fonds-mettant-en-oeuvre-des-sanctions-economiques-visant-le-Zimbabwe; https://journaldemonaco.gouv.mc/Journaux/2020/Journal-8477/Arrete-Ministeriel-n-2020-192-du-5-mars-2020-modifiant-l-arrete-ministeriel-n-2008-400-du-30-juillet-2008-portant-application-de-l-Ordonnance-Souveraine-n-1.675-du-10-juin-2008-relative-aux-procedures-de-gel-des-fonds-mettant-en-oeuvre-des-sanctions-eco"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "malta-financial-services-authority-mfsa-national-sanctions",
                                    "tag": "related_url",
                                    "value": "https://mfsa.com.mt/pages/readfile.aspx?f=/files/International%20Affairs/Sanctions%202014/L.N.%20172.2014%20zimbabwe.pdf"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "http://www.au.int/"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "iceland-sanctions-list",
                                    "tag": "related_url",
                                    "value": "https://www.stjornartidindi.is/Advert.aspx?RecordID=e5c9c811-b322-4246-a97d-379b98e0c144"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "tresor-direction-generale",
                                    "tag": "related_url",
                                    "value": "https://www.tresor.economie.gouv.fr/services-aux-entreprises/sanctions-economiques"
                                },
                                {
                                    "name": "Removal Date",
                                    "source": "swiss-seco-list",
                                    "value": "2020-03-03"
                                },
                                {
                                    "name": "Removal Date",
                                    "source": "monaco-economic-sanctions",
                                    "value": "2020-03-13 00:00:00"
                                },
                                {
                                    "name": "Role",
                                    "source": "europe-sanctions-list",
                                    "value": "Former President"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "ofac-sdn-list",
                                    "value": "Block"
                                },
                                {
                                    "name": "Sanction Type",
                                    "source": "swiss-seco-list",
                                    "value": "article 2 paragraphs 1 and 2 (Financial sanctions) and article 4 paragraph 1 (Travel ban)"
                                },
                                {
                                    "name": "Title",
                                    "source": "ofac-sdn-list",
                                    "value": "President of the Republic of Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://dbpedia.org/data/Robert_Mugabe.json"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://fr.wikipedia.org/wiki/Robert_Mugabe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Grace+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Grace+Mugabe&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Robert+Gabriel+Mugabe&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "http://www.au.int/en/cpau"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://dbpedia.org/data/Robert_Mugabe.json"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://fr.wikipedia.org/wiki/Robert_Mugabe"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Grace+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Grace+Mugabe&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=who+is+Robert+Gabriel+Mugabe&ucbcb=1"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Egypt, France, Germany, Indonesia, Kenya, Nigeria, Russian Federation, South Africa, Turkey, United Kingdom, United States, Venezuela, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "N0HUXBOHUAA52RH",
                            "last_updated_utc": "2024-10-09T21:29:08Z",
                            "media": [
                                {
                                    "date": "2022-01-16T00:00:00Z",
                                    "snippet": "A-LOCAL firm Inverness Investments has lost US$500 000 cash to a South African company in a botched loan agreement deal. This was after Brent Greyling (31) the director of the South African company Milean Investment was lured to come to Zimbabwe after he was promised a US$1.2 million loan before he was arrested at the Robert Gabriel Mugabe International Airport for fraud. Greyling who was represented by Rungano Mahuni on Friday appeared before Harare magistrate Sharon Rakafa charged with fraud.",
                                    "title": "A local firm loses US$500 000 in suspected externalisation deal - NewsDay Zimbabwe",
                                    "url": "https://www.newsday.co.zw/2022/01/a-local-firm-loses-us500-000-in-suspected-externalisation-deal/"
                                },
                                {
                                    "date": "2023-07-23T00:00:00Z",
                                    "snippet": "Mugabe once claimed that Zimbabwe's treasury lost more than US$15-billion in diamond money because of corruption, but nothing was done to bring perpetrators to account. Mnangagwa, who promised a raft of reforms, including dealing with corruption, when he took over from Mugabe, has failed to deal with corruption in his government, and his critics have accused him of applying a \"catch and release\" strategy to make it seem as if he was taking action. Some security sector sources alleged that some resources used to finance the military-assisted transition that caused Mugabe to resign in November 2017 were derived from illegal diamond sales, although this could not be independently verified.",
                                    "title": "As Zimbabwe's elections loom, main opposition party 'threatened by Mozambique's Frelimo'",
                                    "url": "https://www.dailymaverick.co.za/article/2023-07-23-as-zimbabwes-elections-loom-main-opposition-party-threatened-by-mozambiques-frelimo/"
                                },
                                {
                                    "date": "2024-06-14T00:00:00Z",
                                    "snippet": "The Centre for Natural Resource Governance expressed concern over a criminal case against five people accused of stealing diamonds during the routine sale of diamonds at the Robert Gabriel Mugabe International Airport in Harare. Notably, on October 26, 2020, Zimbabwe Miners' Federation president Henrietta Rushwaya was arrested at the Robert Gabriel Mugabe International Airport and later convicted for attempting to smuggle six kilogrammes of gold worth US$333 042,28 to Dubai. She, however, got away with a neglible fine.",
                                    "title": "Can Africa Mining Vision unlock Zim's potential for sustainable development and governance? - The Standard",
                                    "url": "https://newsday.co.zw/thestandard/opinion-analysis/article/200028221/can-africa-mining-vision-unlock-zims-potential-for-sustainable-development-and-governance"
                                },
                                {
                                    "date": "2024-08-31T00:00:00Z",
                                    "snippet": "CHATUNGA Bellarmine Mugabe, son of former Zimbabwean leader Robert Mugabe, has been arrested for violent conduct in Beitbridge where he allegedly assaulted a policeman at a roadblock at Bubi, 80 kilometres north of the border town. He is alleged to have brandished a knife in the scuffle with police who now accuse him of resisting arrest.",
                                    "title": "Chatunga Mugabe arrested in Beitbridge -Newsday Zimbabwe",
                                    "url": "https://www.newsday.co.zw/newsday/local-news/article/200031686/chatunga-mugabe-arrested-in-beitbridge"
                                },
                                {
                                    "date": "2019-04-16T00:00:00Z",
                                    "snippet": "PRESIDENT Robbert Mugabe's nephew Leo Mugabe has been accused of attempting to seize a Chinese-owned firm, Hwange Coal Gasification, whose bank account with Stanbic Bank has been frozen at the instigation of its non-executive directors who are allegedly working in cahoots with Mugabe. REPORT BY CHARLES LAITON",
                                    "title": "Chinese, Leo Mugabe lock horns",
                                    "url": "https://www.newsday.co.zw/2013/06/chinese-leo-mugabe-lock-horns/amp/"
                                },
                                {
                                    "date": "2021-06-09T00:00:00Z",
                                    "snippet": "The Archbishop of York, John Sentamu, memorably cut up his clerical collar live on Andrew Marr's Sunday breakfast show in 2007 to demonstrate how Robert Mugabe had destroyed the identity of the people of Zimbabwe. Sentamu believes Mugabe should be tried for crimes against humanity, and pledged not to wear a dog collar again until the president had gone. But nearly two years on there is no sign of the archbishop being able to resume his neckwear.",
                                    "title": "Could you forgive Mugabe?",
                                    "url": "https://www.newstatesman.com/politics/2009/09/mugabe-crimes-catholic?qt-trending=0"
                                },
                                {
                                    "date": "2024-10-09T00:00:00Z",
                                    "snippet": "Governments may shift responsibility to external forces rather than addressing internal governance failures. Zimbabwe, under Robert Mugabe, for example, was accused of attributing the country's economic collapse to Western sanctions, deflecting responsibility away from poor governance and corruption. Blameocracy reduces the focus on domestic accountability and encourages a narrative of victimhood.",
                                    "title": "Dr Muhammad Dan Suleiman: Ten other names we can call Democracy in Africa - MyJoyOnline",
                                    "url": "https://www.myjoyonline.com/dr-muhammad-dan-suleiman-ten-other-names-we-can-call-democracy-in-africa/"
                                },
                                {
                                    "date": "2019-09-06T00:00:00Z",
                                    "snippet": "Robert Mugabe, former prime minister and president of Zimbabwe whose rule was mired in accusations of human rights abuses and corruption, has died aged 95. His 40-year leadership of the former British colony was marked with bloodshed, persecution of political opponents and vote-rigging on a large scale.",
                                    "title": "Former Zimbabwe president Robert Mugabe dies aged 95 | Irish Independent",
                                    "url": "https://www.independent.ie/world-news/former-zimbabwe-president-robert-mugabe-dies-aged-95/38472774.html"
                                },
                                {
                                    "date": "2019-09-06T00:00:00Z",
                                    "snippet": "His rule was mired in accusations of human rights abuses and corruption Robert Mugabe, former prime minister and president of Zimbabwe whose rule was mired in accusations of human rights abuses and corruption, has died aged 95. His near 40-year leadership of the former British colony was marked with bloodshed, persecution of political opponents and vote-rigging on a large scale.",
                                    "title": "Former president of Zimbabwe Robert Mugabe dead at 95 - Liverpool Echo",
                                    "url": "https://www.liverpoolecho.co.uk/news/uk-world-news/former-president-zimbabwe-robert-mugabe-16874091"
                                },
                                {
                                    "date": "2024-04-03T00:00:00Z",
                                    "snippet": "The arrest of Peter Dube marks a significant development in the ongoing investigation into the triple murder case. Dube's arrest at Robert Gabriel Mugabe International Airport brings an end to his nearly three-year evasion of authorities.",
                                    "title": "Fugitive multiple-murders accused Peter Dube arrested at RGM Int. Airport on deportation return from Ireland – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/main/fugitive-mulitple-murders-accused-peter-dube-arrested-at-rgm-int-airport-on-return-on-deportation-return-from-ireland/"
                                },
                                {
                                    "date": "2022-01-27T00:00:00Z",
                                    "snippet": "Zimbabwe was not left out, when on November 15, 2017, the military rolled its tanks into the capital Harare taking over the state broadcast station and announcing that they were in charge of the nation. The coup plotters immediately placed 93-year-old president, Robert Mugabe, and his family under house arrest. This marked the end of his 37-year rule, as pressure mounted from the military, protesters, and looming impeachment in parliament.",
                                    "title": "How recurring coups amplify calls for enhanced governance in Africa | The Guardian Nigeria News - Nigeria and World News — World — The Guardian Nigeria News – Nigeria and World News",
                                    "url": "https://guardian.ng/news/how-recurring-coups-amplify-calls-for-enhanced-governance-in-africa/amp/"
                                },
                                {
                                    "date": "2019-07-19T00:00:00Z",
                                    "snippet": "I particularly want to thank His Excellency, the President and Commander-In-Chief of the Zimbabwe Defence Forces, Cde. R. G Mugabe, who is also the First Secretary of the revolutionary party ZANU PF, for making it possible for me to be in this House today. I am humbled by the magnitude of the confidence and responsibility placed upon me by my revolutionary party ZANU PF and the people of Lobengula Constituency.",
                                    "title": "Lobengula MP blames the mushrooming of Vuzu parties to absentee parents | The Insider",
                                    "url": "https://www.insiderzim.com/lobengula-mp-blames-the-mushrooming-of-vuzu-parties-to-absentee-parents/"
                                },
                                {
                                    "date": "2024-03-10T00:00:00Z",
                                    "snippet": "Soon after his arrest at the Robert Mugabe International Airport, Cuan Reed Govender, 25, was accused of being the \"John Doe\" who had reported a bomb at the Victoria Falls International Airport on Friday. Flights at the airport were suspended following the alleged bomb threat.",
                                    "title": "Man's Zimbabwe airport drama: Arrested for carrying live ammunition and accused of sending a bomb threat",
                                    "url": "https://www.iol.co.za/thepost/community-news/mans-zimbabwe-airport-drama-arrested-for-carrying-live-ammunition-and-accused-of-sending-a-bomb-threat-e156dd6d-d5d1-42f1-9a8a-ea318d2b76fe"
                                },
                                {
                                    "date": "2018-07-19T00:00:00Z",
                                    "snippet": "the ex-president's heavy legacy hangs over the country. The political party Mr. Mugabe led for decades is now represented by Emmerson Mnangagwa, a former vice president who has been accused of organizing brutal repression during Mr. Mugabe's rule. The opposition has been fractured and weakened after the death this year of its longtime leader, Morgan Tsvangirai, who challenged Mr. Mugabe in successive elections in 2002, 2008 and 2013.",
                                    "title": "Mugabe Has Left, but His Legacy Haunts Zimbabwe's Election – The Zimbabwe Mail",
                                    "url": "http://www.thezimbabwemail.com/main/mugabe-has-left-but-his-legacy-haunts-zimbabwes-election/"
                                },
                                {
                                    "date": "2024-04-04T00:00:00Z",
                                    "snippet": "FUGITIVE Gweru murder suspect Peter Dube was arrested yesterday at Robert Gabriel Mugabe International Airport after he was deported from Mozambique. Dube was",
                                    "title": "Murder suspect deported, arrested – DailyNews",
                                    "url": "https://dailynews.co.zw/murder-suspect-deported-arrested/amp/"
                                },
                                {
                                    "date": "2018-09-11T00:00:00Z",
                                    "snippet": "The war veterans/soldiers had to use a coup in order to push Grace Mugabe away. If Grace Mugabe was a genuine/supporting wife, she should have allowed R.G Mugabe to retire from politics long back but because of her love of planes and money, R.G Mugabe had to be subjected to a long period of political prison. On 11/09/2018, I wrote a piece condemning ZANU PF government for abusing taxpayers' money by chartering a plane for Grace Mugabe from Singapore.",
                                    "title": "No difference between Grace Mugabe & Judas Iscariot - Bulawayo24 News",
                                    "url": "https://bulawayo24.com/index-id-opinion-sc-columnist-byo-144993.html"
                                },
                                {
                                    "date": "2024-09-01T00:00:00Z",
                                    "snippet": "His brother Robert Mugabe Junior was arrested in February last year after allegedly damaging property worth US$12 000 in Harare. An investigation by South African unit Amabhungane last year uncovered potential money laundering involving Chatunga, just before Mugabe's ouster in a coup. The investigation revealed a series of illegal Hawala payments made to Chatunga Mugabe through an unnamed individual connected to Ewan Macmillan of the Gold Mafia exposé.",
                                    "title": "Okapi-wielding Chatunga Mugabe charged - The Zimbabwe Independent",
                                    "url": "https://www.theindependent.co.zw/news/article/200031738/okapi-wielding-chatunga-mugabe-charged"
                                },
                                {
                                    "date": "2024-07-28T00:00:00Z",
                                    "snippet": "Like many modern political nightmares Robert Mugabe began as a liberator but ended up unleashing a bloodletting in 1980's Zimbabwe. The ethnic purge known as the \"Gukurahundi\" (translated nicely as 'cleansing rain' and not so nicely as 'sweep away the dirty') unleashed Mugabe's murderous North Korean-trained Five Brigade against his opponents. An estimated 10,000 civilians perished in the \"cleansing rain.\"",
                                    "title": "Playing the 'Hitler card' and misreading history: op-ed",
                                    "url": "https://www.al.com/opinion/2024/07/playing-the-hitler-card-and-misreading-history-op-ed.html?outputType=amp"
                                },
                                {
                                    "date": "2024-05-29T00:00:00Z",
                                    "snippet": "Dziva, along with his accomplice Alex Tombe, was found guilty of demanding a US$20,000 bribe from Rushwaya to secure a lighter sentence for her. Rushwaya was arrested in 2020 at the Robert Mugabe International Airport while attempting to smuggle gold bars weighing 6 kilograms to Dubai. In 2023, she was convicted and fined US$5,000, with an 18-month jail term wholly suspended.",
                                    "title": "Prosecutor in Rushwaya's gold smuggling case convicted of fraud after demanding US$20k bribe – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/prosecutor-in-rushwayas-gold-smuggling-case-convicted-of-fraud-after-demanding-us20k-bribe/"
                                },
                                {
                                    "date": "2019-09-13T00:00:00Z",
                                    "snippet": "He has, therefore, quit life's stage trailed by very unflattering epithets which only very few could have imagined would ever be associated with his name and career during his first decade in office. From his country's independence on April 18, 1980 till November 14, 2017, when the combined effort of the top officers of the Zimbabwean Defence Forces (ZDF) and the top hierarchy of the ruling party, Zimbabwe African National Union-Patriotic Front (ZANU-PF), eased him out of office and got him to resign after one week of being under house arrest, Mugabe served as Zimbabwe's Prime Minister (1980 to 1987) and President (1987 to 2017), following the amendment of the Constitution to institute a presidential system of government. He was in office for nearly four decades during which Zimbabwe's economy witnessed grievous decline, the citizenry whose country was once hailed as the \"food basket of the continent,\" saw the worst of times and Mr. Mugabe's image plummeted badly.",
                                    "title": "Robert Gabriel Mugabe (1924 – 2019) – Independent Newspaper Nigeria",
                                    "url": "https://independent.ng/robert-gabriel-mugabe-1924-2019/"
                                },
                                {
                                    "date": "2019-09-07T00:00:00Z",
                                    "snippet": "However, a brutal military campaign waged against an uprising in western Matabeleland province that ended in 1987 augured a bitter turn in Zimbabwe's fortunes. As the years went by, Mugabe was widely accused of hanging onto power through violence and vote fraud, notably in a 2008 election that led to a troubled coalition government after regional mediators intervened. \"I have many degrees in violence,\" Mugabe once boasted on a campaign trail, raising his fist.",
                                    "title": "Robert Mugabe Joins Ancestors - BNW | BiafraNigeriaWorld",
                                    "url": "http://biafranigeriaworld.com/2019/09/07/robert-mugabe-joins-ancestors/"
                                },
                                {
                                    "date": "2019-09-05T00:00:00Z",
                                    "snippet": "However, a brutal military campaign waged against an uprising in western Matabeleland province that ended in 1987 augured a bitter turn in Zimbabwe 's fortunes. As the years went by, Mugabe was widely accused of hanging onto power through violence and vote fraud, notably in a 2008 election that led to a troubled coalition government after regional mediators intervened. \"I have many degrees in violence, \" Mugabe once boasted on a campaign trail, raising his fist.",
                                    "title": "Robert Mugabe, strongman who ruled Zimbabwe for decades, dies | Las Vegas Review-Journal",
                                    "url": "https://www.reviewjournal.com/news/nation-and-world/robert-mugabe-strongman-who-ruled-zimbabwe-for-decades-dies-1842196/"
                                },
                                {
                                    "date": "2023-11-01T00:00:00Z",
                                    "snippet": "Tserai and Mufandauya have been acquitted due to a lack of evidence, marking a dramatic turn of events. Rushwaya's conviction stems from an incident three years ago when she was arrested at the Robert Gabriel Mugabe International Airport on October 26, 2020, attempting to board a flight to Dubai with 6kg of gold valued at approximately US$333,000 in her possession. During her defense, Rushwaya claimed that she mistakenly picked up the wrong bag, which contained the gold, instead of her own.",
                                    "title": "Rushwaya Convicted Proving Hopewell's Actually Closer To Mnangagwa Than Her – ZimEye",
                                    "url": "https://www.zimeye.net/2023/11/01/rushwaya-convicted-proving-hopewells-actually-closer-to-mnangagwa-than-her/"
                                },
                                {
                                    "date": "2018-06-20T00:00:00Z",
                                    "snippet": "Britain's longest-reigning monarch, she meets with foreign leaders frequently at the behest of her ministers. She has greeted numerous presidents over the years who were later condemned for corruption or violence against their own citizens, including Bashar al-Assad of Syria, Nicolae Ceausescu of Romania, Robert G. Mugabe of Zimbabwe, Vladimir V. Putin of Russia, Mobutu Sese Seko of Zaire and Suharto of Indonesia.",
                                    "title": "Trump Will Meet Queen Elizabeth II Next Month, His Ambassador Says - The New York Times",
                                    "url": "https://www.nytimes.com/2018/06/20/world/europe/trump-queen-visit.html"
                                },
                                {
                                    "date": "2023-07-28T00:00:00Z",
                                    "snippet": "In response to questions, Zimbabwe Republic Police (ZRP) confirmed that it has recorded several cases of drug smuggling. \"In one of the cases, on March 27, 2023 police acted on received information and arrested Davison Gomo, 27, at Robert Gabriel Mugabe International Airport in connection with drug trafficking involving cocaine and crystal meth,\" ZRP spokesperson Assistant Commissioner Paul Nyathi said. Gomo had 21kgs of crystal meth and 1,2kgs of cocaine concealed in metal pulleys.",
                                    "title": "Zim turns into international drug transit point - The Zimbabwe Independent",
                                    "url": "https://theindependent.co.zw/index.php/local-news/article/200014572/zim-turns-into-international-drug-transit-point"
                                },
                                {
                                    "date": "2023-05-31T00:00:00Z",
                                    "snippet": "President Mnangagwa at the weekend promised to set the election date this week as he seeks re-election for a second full term in office. Zimbabwe and the US have frosty relations that go back two decades after Washington imposed sanctions on the regime of the late Robert Mugabe for alleged human rights violations and electoral fraud. President Joe Biden's administration has maintained the embargo as it accuses Mr Mugabe's successor of failing to implement economic and political reforms that he promised after the 2017 military coup.",
                                    "title": "Zimbabwe summons US envoy over election tweets | Nation",
                                    "url": "https://nation.africa/africa/news/zimbabwe-summons-us-envoy-over-election-tweets--4252900?redirect_to=https://nation.africa/africa/news/zimbabwe-summons-us-envoy-over-election-tweets--4252900"
                                },
                                {
                                    "date": "2019-08-30T00:00:00Z",
                                    "snippet": "Бархатный путч в Зимбабве Военные арестовали президента Зимбабве Роберта Мугабе В субботу 18 ноября в столице Зимбабве состоялась демонстрация против 93-летнего президента Роберта Мугабе, который бессменно правит южноафриканской страной с 1980 г. На днях, он был изолирован в своей резиденции и взят под домашний арест группой военных. Солдаты опечатали вход в парламент, правительственные учреждения и суды в столице Хараре.",
                                    "title": "Бархатный путч в Зимбабве",
                                    "url": "https://comments.ua/world/602223-barhatniy-putch-zimbabve.html"
                                },
                                {
                                    "date": "2019-09-20T00:00:00Z",
                                    "snippet": "В Зимбабве военные задержали президента страны Роберта Мугабе В Зимбабве военные задержали президента страны Роберта Мугабе Военные, захватившие в  Зимбабве здание государственной телекомпании Зед-би-си, объявили, что взяли под стражу президента страны Роберта Мугабе и  его семью. При этом они не  считают случившееся военным переворотом и  заявляют, что Мугабе и  его родным ничего не  угрожает.",
                                    "title": "В Зимбабве военные задержали президента страны Роберта Мугабе",
                                    "url": "https://gomel.today/amp/rus/news/world-1524/"
                                },
                                {
                                    "date": "2020-05-23T00:00:00Z",
                                    "snippet": "Напомним, 14 ноября зимбабвийский главнокомандующий Константино Чивенга предъявил руководству страны ультиматум с четырьмя требованиями, а к столице Зимбабве Хараре начали стягивать танки. Позже военные арестовали президента страны Роберта Мугабе и его жену Грейс, но позже появилась информация, что она покинула страну.",
                                    "title": "Мугабе выступил с телеобращением: в отставку уходить не собирается - ФОКУС",
                                    "url": "https://focus.ua/amp/world/385315"
                                },
                                {
                                    "date": "2019-09-20T00:00:00Z",
                                    "snippet": "Неназванный источник в  правящей партии «Зимбабвийский африканский национальный союз  - Патриотический фронт» сообщил Associated Press, что главой страны, вероятно, станет бывший вице-президент Эммерсон Мнангагва. 15  ноября группа военных из  высшего командования армии Зимбабве захватила власть в  стране и  посадила президента Роберта Мугабе под домашний арест. Это произошло вскоре после отставки вице-президента Эммерсона Мнангагвы, которого называли одним из  двух вероятных преемников Мугабе.",
                                    "title": "Спикер парламента Зимбабве объявил об отставке Роберта Мугабе",
                                    "url": "https://gomel.today/amp/rus/news/world-1557/"
                                }
                            ],
                            "name": "Роберто Мугабе (Roberto Mugabe)",
                            "sources": [
                                "belgium-consolidated-list-of-the-national-and-european-sanctions",
                                "company-am",
                                "complyadvantage",
                                "complyadvantage-adverse-media",
                                "dfat-australia-list",
                                "europe-sanctions-list",
                                "hm-treasury-list",
                                "iceland-sanctions-list",
                                "malta-financial-services-authority-mfsa-national-sanctions",
                                "monaco-economic-sanctions",
                                "ofac-sdn-list",
                                "special-economic-measures-act",
                                "swiss-seco-list",
                                "tresor-direction-generale"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-cybercrime",
                                "adverse-media-v2-financial-aml-cft",
                                "adverse-media-v2-financial-difficulty",
                                "adverse-media-v2-fraud-linked",
                                "adverse-media-v2-general-aml-cft",
                                "adverse-media-v2-narcotics-aml-cft",
                                "adverse-media-v2-other-financial",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-other-serious",
                                "adverse-media-v2-property",
                                "adverse-media-v2-terrorism",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft",
                                "pep",
                                "pep-class-1",
                                "pep-class-2",
                                "pep-class-4",
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "aka_exact"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Mugabe Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "France Tresor Direction Generale Liste Unique de Gels"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "DFAT Australia Consolidated Sanctions List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Roberto Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Gabriel Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "OFAC SDN List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "United Kingdom HM Treasury Office of Financial Sanctions Implementation Consolidated List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-financial-crime",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-sexual-crime",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-cybercrime",
                                    "adverse-media-v2-financial-aml-cft",
                                    "adverse-media-v2-financial-difficulty",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Mugabe Gabriel Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "Switzerland SECO List"
                                ]
                            },
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert Gabriel",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "Malta Financial Services Authority (MFSA) National Sanctions (Suspended)"
                                ]
                            }
                        ],
                        "score": 1.7
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Mugabe Robert"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "Linked to",
                                    "name": "Mugabe Leo"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Other Info",
                                    "source": "sanction-related-entities",
                                    "value": "Entity associated with Mugabe Leo, designated on OFAC SDN List"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "sanction-related-entities",
                                    "tag": "related_url",
                                    "value": "http://www.treasury.gov/resource-center/sanctions/SDN-List/Pages/default.aspx"
                                }
                            ],
                            "id": "DZ8N6S3SDGSLSW7",
                            "last_updated_utc": "2024-04-16T11:47:57Z",
                            "name": "Mugabe Robert",
                            "sources": [
                                "sanction-related-entities"
                            ],
                            "types": [
                                "sanction"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "sanction"
                                ],
                                "matching_name": "Mugabe Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "Sanction Related Entities"
                                ]
                            }
                        ],
                        "score": 1.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "M. Robert"
                                }
                            ],
                            "id": "01ONO8HEQPY0XLZ",
                            "last_updated_utc": "2023-11-07T23:31:26Z",
                            "media": [
                                {
                                    "date": "2019-10-23T00:00:00Z",
                                    "snippet": "Il voulait que je le touche aussi mais je n'ai jamais voulu», a relaté la victime. Après avoir fait part à ses parents des choses troublantes qui lui ont été infligées, M. Robert a eu droit à une lettre d'excuses de l'abuseur. La mère de la victime, qui avait confronté André Thibeault, a conservé les aveux du pédophile jusqu'à ce que son fils porte plainte en 2018.",
                                    "title": "33 mois de prison pour le pédophile André Thibeault - Le Soleil de Châteauguay",
                                    "url": "https://www.cybersoleil.com/33-mois-de-prison-pour-le-pedophile-andre-thibeault/"
                                },
                                {
                                    "snippet": "En effet, il y a maintenant bientôt onze ans, ce père de famille a perdu la vie dans un accident de moto causé par le conducteur d'un Renault Scénic, qu'il soupçonnait d'avoir procédé à des attouchements sur sa fille avant de la déposer en bas de chez elle. L'enquête de police n'a jamais permis de prouver que le conducteur de ce véhicule, un certain M. Robert, était à l'origine de l'enlèvement de la fille, ni même de remettre la main sur ce mystérieux personnage dont le portait robot a été diffusé largement. Grâce à des actions associatives et à la mobilisation des proches, la famille a réussi à collecter ces 35 000 euros.",
                                    "title": "35 000 euros pour le meutrier de Youssef | 78actu",
                                    "url": "https://actu.fr/ile-de-france/sartrouville_78586/35-000-euros-pour-le-meutrier-de-youssef_12376567.html"
                                },
                                {
                                    "date": "2018-06-15T00:00:00Z",
                                    "snippet": "Son co-prévenu, un forain de 46 ans originaire de l'Hérault qui lui avait vendu les bouteilles incriminées, était jugé pour complicité. Le tribunal correctionnel a entendu comment M. Robert, gérant de société dans le négoce de vin depuis peu, avait acquis, puis revendu ou tenté de revendre à des négociants, entre juin 2017 et mars 2018, trois lots de magnums grand cru, notamment des Gruaud Larose, Pichon Longueville Comtesse de Lalande, Beychevelle, qui pour certains ont fini chez des acheteurs aux Etats-Unis ou en Finlande. Un doute sur l'authenticité",
                                    "title": "Contrefaçon de vin : prison ferme requise contre l'ex-footballeur Christophe Robert à Bordeaux",
                                    "url": "https://france3-regions.francetvinfo.fr/nouvelle-aquitaine/gironde/bordeaux/contrefacon-vin-prison-ferme-requise-contre-ex-footballeur-christophe-robert-bordeaux-1494915.html"
                                },
                                {
                                    "date": "2018-06-15T00:00:00Z",
                                    "snippet": "Son co-prévenu, un forain de 46 ans originaire de l'Hérault qui lui avait vendu les bouteilles incriminées, était jugé pour complicité. Le tribunal correctionnel a entendu comment M. Robert, gérant de société dans le négoce de vin depuis peu, avait acquis, puis revendu ou tenté de revendre à des négociants, entre juin 2017 et mars 2018, trois lots de magnums grand cru, notamment des Gruaud Larose, Pichon Longueville Comtesse de Lalande, Beychevelle, qui pour certains ont fini chez des acheteurs aux Etats-Unis ou en Finlande. Je ne suis pas négociant, j'essaie de faire des affaires",
                                    "title": "Contrefaçon de vin : prison ferme requise contre l'ex-footballeur de Valenciennes Christophe Robert",
                                    "url": "https://france3-regions.francetvinfo.fr/hauts-de-france/contrefacon-vin-prison-ferme-requise-contre-ex-footballeur-valenciennes-christophe-robert-1494919.html"
                                },
                                {
                                    "date": "2018-06-28T00:00:00Z",
                                    "snippet": "Il a été condamné à six mois de prison avec sursis. La société de M. Robert a été condamnée au versement d'une amende de 50.000 euros dont 40.000 euros avec sursis. Le tribunal a relevé des \"pratiques de négoce ou d'intermédiaire peu orthodoxes\" où \"les photos priment sur la dégustation d'échantillons\".",
                                    "title": "Contrefaçon de vin à Bordeaux : l'ex-footballeur Christophe Robert condamné à du sursis",
                                    "url": "https://france3-regions.francetvinfo.fr/nouvelle-aquitaine/gironde/bordeaux/contrefacon-vin-bordeaux-ex-footballeur-christophe-robert-condamne-du-sursis-1503179.html"
                                },
                                {
                                    "date": "2008-09-03T00:00:00Z",
                                    "snippet": "Dans un premier temps viendra une affaire jugée le 1er octobre 2003. La justice avait alors débouté Clearstream qui avait intenté un procès à M. Robert pour son livre «La boîte noire». S'ils avaient jugé les propos diffamatoires, les magistrats avaient accordé au journaliste le bénéfice de la «bonne foi», estimant que ses informations étaient «sérieuses».",
                                    "title": "Denis Robert jugé en appel pour diffamation - L'essentiel",
                                    "url": "https://www.lessentiel.lu/fr/story/denis-robert-juge-en-appel-pour-diffamation-880651899437"
                                },
                                {
                                    "date": "2017-12-11T00:00:00Z",
                                    "snippet": "Travaillant une quinzaine d'heures par semaine, ce dernier s'occupait principalement des danseuses. Une perquisition effectuée par les policiers à l'établissement le 20 février qui a suivi a permis de saisir sur M. Robert quinze rouleaux d'un demi-gramme de cocaïne. Des accusations de possession de cocaïne en vue d'en faire le trafic sont déposées au mois de juin 2014.",
                                    "title": "Le Bar 55 de Saint-Georges mis sous scellés pour une période de 25 jours | EnBeauce.com | EnBeauce.com",
                                    "url": "https://www.enbeauce.com/actualites/faits-divers/326281/le-bar-55-de-saint-georges-mis-sous-scelles-pour-une-periode-de-25-jours/amp"
                                },
                                {
                                    "date": "2019-03-06T00:00:00Z",
                                    "snippet": "Le premier conteste le congédiement « illégal, contraire à la convention collective et abusif » de l'agronome et demande sa réintégration en poste, avec compensation pour la perte de salaire et intérêts. Le second demande réparation, puisque M. Robert a été suspendu de ses fonctions pendant plus de quatre mois lors de l'enquête interne du ministère de l'Agriculture. Or, selon le Syndicat, la convention collective prévoit que la suspension ne peut excéder 30 jours.",
                                    "title": "Louis Robert dépose un grief contre Lamontagne et Legault - La Terre de chez nous",
                                    "url": "https://www.laterre.ca/actualites/politique/louis-robert-depose-un-grief-contre-lamontagne-et-legault/"
                                },
                                {
                                    "snippet": "Le député-maire de Saint-Leu (Réunion), Thierry Robert, a publié mardi un arrêté autorisant la chasse au requin bouledogue sur sa commune qui se situe intégralement au sein de la Réserve marine nationale de la Réunion. M. Lurel a ensuite annoncé que M. Robert avait retiré son arrêté \"entaché d'illégalité\", tout en rappelant ses instructions pour que \"des activités de pêche aux requins bouledogues soient effectives, y compris dans la réserve marine\", sous certaines conditions. \"L'action du ministre de l'Outre-mer pour provoquer le retrait de l'arrêté pourrait sembler satisfaisante\", mais \"l'argument du ministre repose uniquement sur l'illégalité de l'arrêté municipal\", déplore EELV.",
                                    "title": "Requins/Réunion: EELV critique la prise de position de Lurel",
                                    "url": "https://www.tahiti-infos.com/Requins-Reunion-EELV-critique-la-prise-de-position-de-Lurel_a53732.html"
                                },
                                {
                                    "date": "2019-11-26T00:00:00Z",
                                    "snippet": "« Nous sommes venus porter la pétition », explique l'écrivain. « Je dois dire que je ne comprends pas pourquoi M. Robert attaque de cette manière la langue et la culture réunionnaises, ni pourquoi il attaque ainsi le CAPES créole. Nous sommes bilingues, pourquoi ne pas donner aux enfants réunionnais tous les instruments et toutes les chances de maîtriser cette richesse ?",
                                    "title": "« Fé respèk nout droi » - Infos La Réunion - Témoignages",
                                    "url": "https://www.temoignages.re/spip.php?id_article=50689&page=amp"
                                }
                            ],
                            "name": "M. Robert",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-narcotics-aml-cft",
                                "adverse-media-v2-other-financial",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "unknown"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-financial",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "M Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "word_to_initial"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "M. Robert"
                                },
                                {
                                    "name": "Robert Bohn Sikol"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Vanuatu"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Vanuatu"
                                },
                                {
                                    "name": "Active Start Date",
                                    "source": "complyadvantage",
                                    "tag": "active_start_date",
                                    "value": "2012-11-19"
                                },
                                {
                                    "name": "Active End Date",
                                    "source": "complyadvantage",
                                    "tag": "active_end_date",
                                    "value": "2015-11-24"
                                },
                                {
                                    "name": "Gender",
                                    "source": "complyadvantage",
                                    "value": "male"
                                },
                                {
                                    "name": "Chamber",
                                    "source": "complyadvantage",
                                    "value": "Parliament"
                                },
                                {
                                    "name": "Given Name",
                                    "source": "complyadvantage",
                                    "value": "Robert"
                                },
                                {
                                    "name": "Legislative Period",
                                    "source": "complyadvantage",
                                    "value": "10th Parliament"
                                },
                                {
                                    "name": "Legislature",
                                    "source": "complyadvantage",
                                    "value": "Parliament"
                                },
                                {
                                    "name": "Political Party",
                                    "source": "complyadvantage",
                                    "tag": "political_party",
                                    "value": "VPDP"
                                },
                                {
                                    "name": "Political Region",
                                    "source": "complyadvantage",
                                    "tag": "political_region",
                                    "value": "Epi"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Vanuatu"
                                }
                            ],
                            "id": "PE1417SIDMWAWGH",
                            "last_updated_utc": "2019-05-24T11:04:17Z",
                            "name": "M. Robert",
                            "sources": [
                                "complyadvantage"
                            ],
                            "types": [
                                "pep",
                                "pep-class-1"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "unknown"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep",
                                    "pep-class-1"
                                ],
                                "matching_name": "M Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "word_to_initial"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabo Ssalongo"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "O5RHR1Q2Z4MGX91",
                            "last_updated_utc": "2020-10-23T20:55:55Z",
                            "media": [
                                {
                                    "date": "2020-10-23T00:00:00Z",
                                    "snippet": "Ahumuza was reunited with her family after the kidnappers paid a ransom of 2.5 Million Shillings. The suspects who include Kesta Muhereza, Christine Marunga, Joram Amara, Deogratius Isingoma and Robert Mugabo Ssalongo were also accused of being behind the numerous thefts of vehicle number plates. However, on Sunday, Uganda Radio Network learnt from a whistle blower that Mugume had escaped from Katojo and the security agencies.",
                                    "title": "Suspected kidnapper escapes from Katojo prison",
                                    "url": "https://www.independent.co.ug/suspected-kidnapper-escapes-from-katojo-prison/"
                                }
                            ],
                            "name": "Robert Mugabo Ssalongo",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-property"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-property"
                                ],
                                "matching_name": "Robert Mugabo Ssalongo",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "John Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Zambia"
                                }
                            ],
                            "id": "H02NTHBJZD62A7K",
                            "last_updated_utc": "2020-12-05T16:52:12Z",
                            "media": [
                                {
                                    "date": "2007-03-26T00:00:00Z",
                                    "pdf_url": "http://complyadvantage-asset.s3.amazonaws.com/622e6231-7b22-48b3-9365-7399c8c5adc3.pdf",
                                    "snippet": "This will teach other dictators how painful it is for the people to go through pain. I feel Mugabe needs to be prosecuted for crimes against humanity and sent to jail for life By :",
                                    "title": "Comments on: Put pressure on Mugabe, Africa leaders prodded",
                                    "url": "https://www.lusakatimes.com/2007/03/26/put-pressure-on-mugabe-africa-leaders-prodded/feed/"
                                }
                            ],
                            "name": "John Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-violence-non-aml-cft"
                                ],
                                "matching_name": "John Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Mugabe Robert Goma"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Rwanda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Rwanda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Rwanda"
                                }
                            ],
                            "id": "MJAK88QEFMR9TQR",
                            "last_updated_utc": "2021-10-24T20:02:56Z",
                            "media": [
                                {
                                    "date": "2011-08-23T00:00:00Z",
                                    "snippet": "Great Lakes Voice This post has already been read 6087 times! By Josephine Lukoya and Mugabe Robert Goma, DRC -A driver of UN Mission in Democratic Republic of Congo (Monusco) was arrested Sunday, August 21 at about 23 hours at the border between Rwanda and Congo, with 1,200 kilos of Cassiterite black in a vehicle of the UN mission in DRC. These 24 parcels of 50 kilos each.",
                                    "title": "UN mission in Congo under scrutiny as staff nabbed with gem – Great Lakes Voice",
                                    "url": "http://greatlakesvoice.com/un-mission-is-congo-under-scrutiny-as-staff-nabbed-with-gem/"
                                }
                            ],
                            "name": "Mugabe Robert Goma",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Mugabe Robert Goma",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Simon Maina Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Bangladesh"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Bangladesh"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Bangladesh"
                                }
                            ],
                            "id": "4DL1293JS91AUC2",
                            "last_updated_utc": "2021-10-30T13:40:16Z",
                            "media": [
                                {
                                    "date": "2019-12-05T00:00:00Z",
                                    "snippet": "In November 2017, a coup by senior military personnel was launched in terms that seemed almost polite, a sort of dinner party seizure. Mugabe was placed under house arrest; his ZANU-PF party had decided that the time had come. The risk of Marufu coming to power was becoming all too real, though this femme fatale rationale can only be pushed so far.",
                                    "title": "Revolution, amity and decline",
                                    "url": "http://www.newagebd.net/article/83990/revolution-amity-and-decline"
                                }
                            ],
                            "name": "Robert Simon Maina Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Simon Maina Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabo"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "J60RUYDPNL1W0KE",
                            "last_updated_utc": "2022-04-10T02:12:47Z",
                            "media": [
                                {
                                    "date": "2020-10-23T00:00:00Z",
                                    "snippet": "Ahumuza was reunited with her family after the kidnappers paid a ransom of 2.5 Million Shillings. The suspects who include Kesta Muhereza, Christine Marunga, Joram Amara, Deogratius Isingoma and Robert Mugabo Ssalongo were also accused of being behind the numerous thefts of vehicle number plates. However, on Sunday, Uganda Radio Network learnt from a whistle blower that Mugume had escaped from Katojo and the security agencies.",
                                    "title": "Suspected kidnapper escapes from Katojo prison",
                                    "url": "https://www.independent.co.ug/suspected-kidnapper-escapes-from-katojo-prison/"
                                }
                            ],
                            "name": "Robert Mugabo",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-property"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-property"
                                ],
                                "matching_name": "Robert Mugabo",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabi"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "RV1QG4C65D3364P",
                            "last_updated_utc": "2023-03-17T04:58:16Z",
                            "media": [
                                {
                                    "snippet": "Ben Mugizi alias Stephen Musisi is alleged to have deserted the UPDF in June this year. The district internal security officer, Lt. Robert Mugabi, said Mugizi was arrested with a gun, a pair of army uniform and 76 bullets. Body found MUKONO â€\" The body of a boda boda cyclist was on Thursday recovered in Zziba-Kikusa village in Nkokonjeru town council.",
                                    "title": "In Brief - New Vision Official",
                                    "url": "https://www.newvision.co.ug/news/1093990/brief"
                                },
                                {
                                    "date": "2022-11-15T00:00:00Z",
                                    "snippet": "Buganda Road Magistrate's Court has set November 30th, 2022 date for trial of Robert Mugabi, a boda boda rider accused of damaging the portrait of the president. Mugabi is battling one count of malicious damage after being charged last week. He appeared on Monday before the Buganda Road Grade One Magistrate, Siena Owomugisha.",
                                    "title": "Man faces trial for damage of Museveni's portrait",
                                    "url": "https://www.independent.co.ug/man-faces-trial-for-damage-of-musevenis-portrait/"
                                },
                                {
                                    "snippet": "Buganda Road Magistrate's Court has set November 30th, 2022 date for trial of Robert Mugabi, a boda boda rider accused of damaging the portrait of the president. Mugabi is battling one count of malicious damage after being charged last week. He appeared on Monday before ...",
                                    "title": "Robert Mugabi Archives - The Independent Uganda:",
                                    "url": "https://www.independent.co.ug/tag/robert-mugabi/"
                                }
                            ],
                            "name": "Robert Mugabi",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-violence-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Mugabi",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Freeman Mugabe"
                                },
                                {
                                    "name": "Freeman Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "International, Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "YF35NN44FGAXIXP",
                            "last_updated_utc": "2024-06-26T11:19:47Z",
                            "media": [
                                {
                                    "date": "2023-11-04T00:00:00Z",
                                    "snippet": "UPDF has said that the memorandum of understanding and the status of forces agreement with Somalia provide that each troop contributing country has to try her own personnel while in the mission area. Brig Mugabe will be in Somalia for two weeks hearing cases and at the end of the sessions, those who will be found guilty will be given appropriate sentences and those found not guilty will be acquitted. The army said the judgements will depend on the circumstances under which the offences were committed and the evidence that will be brought to court.",
                                    "title": "Al-Shabaab attack: Ugandan army commanders charged over cowardice",
                                    "url": "https://observer.ug/news/headlines/79662-al-shabaab-attack-ugandan-army-commanders-charged-over-cowardice"
                                },
                                {
                                    "date": "2023-12-07T00:00:00Z",
                                    "snippet": "Some of the remanded civilians include Judith Angwech, a pastor from Alebtong district, Simon Oyoma, a pastor from Soroti city, Daniel Owitti (also known as Ott or ODM), a social worker from Adjumani district, Fabio Ocen, a builder from Kole district, Muhammad Ijosiga, a peasant from Arua district, Stanley Yiacia (also known as Simple), a marketeer from Maracha, Anthony Kamau Omacj, a teacher from Dokolo district, Joaquin Parm, an electrician from Nebbi district, Abdu Hakim Koloboka, a security guard from Yumbe district, Habibu Ezale, a mechanic from Koboko district, Ssebi Keppo, a peasant from Arua district, among others. The Court Martial chaired by Brig Gen Freeman Robert Mugabe, the group faced charges of alleged treachery as defined in the Uganda People's Defense Forces Act. The prosecution, represented by Lt Col Raphael Mugisha, Lt Alex Lasto Mukhwana, and Pte Regina Nanzala, informed the court that investigations are ongoing and requested an adjournment.",
                                    "title": "Army court remands 8 soldiers, 23 civilians over plot to overthrow NRM govt",
                                    "url": "https://observer.ug/news/headlines/79979-army-court-remands-31-over-plot-to-overthrow-nrm-govt"
                                },
                                {
                                    "date": "2023-12-06T00:00:00Z",
                                    "snippet": "Some of the civilians include Judith Angwech, a pastor from Alebtong district, Simon Oyoma, a pastor from Soroti City, Daniel Owitti (also known as Ott or ODM), a Social worker from Adjumani District, Fabio Ocen, a builder from Kole District, Muhammad Ijosiga, a peasant from Arua district, Stanley Yiacia (also known as Simple), a Marketeer from Maracha, Anthony Kamau Omacj, a teacher from Dokolo District, Joaquin Parm, an electrician from Nebbi District, Abdu Hakim Koloboka, a security guard from Yumbe District, Habibu Ezale, a mechanic from Koboko District, Ssebi Keppo, a peasant from Arua District, among others. Before the Court Martial, chaired by Brigadier General Freeman Robert Mugabe, the group faced charges of alleged treachery as defined in the Uganda People's Defense Forces Act. The prosecution, represented by Lt Col Raphael Mugisha, Lt Alex Lasto Mukhwana, and Private Regina Nanzala, informed the court that investigations are ongoing and requested an adjournment.",
                                    "title": "Court Martial remands 7 UPDF soldiers, policeman and 23 civilians for plot to overthrow Govt",
                                    "url": "https://www.independent.co.ug/court-martial-remands-7-updf-soldiers-policeman-and-23-civilians-for-plot-to-overthrow-govt/"
                                },
                                {
                                    "date": "2022-09-20T00:00:00Z",
                                    "snippet": "The suspects are Benon Kisekka, a resident of Kinonya Masanafu in Kampala district, and Kassim Kibirango Muwanga, a resident of Busiro in Wakiso district. The General Court-Martial Chairperson, Brigadier Robert Freeman Mugabe read for the accused four counts of murder, two for aggravated robberies, and treachery. This brings to 21, the number of suspects charged in this matter.",
                                    "title": "Court Martial remands two suspects over murder of police officers",
                                    "url": "https://www.independent.co.ug/court-martial-remands-two-suspects-over-murder-of-police-officers/"
                                },
                                {
                                    "date": "2023-10-02T00:00:00Z",
                                    "snippet": "Mutumba was gunned down on February 14, 2020, at Lwemba trading center in Bugiri district. In the sentence delivered today Monday by a seven-member panel led by Army court chairperson, Brig General Freeman Robert Mugabe, Mugoya will effectively serve 41 years in prison, after the three years, seven months, and 15 days he spent on remand were deducted off. Biasaali recently confessed to the murder, citing vengeance and after his conviction last week, his lawyer, Capt Nsubuga Busagwa, requested for a lenient sentence, arguing that Biasaali is a first-time offender, has been in prison since February 2020, has nine children from two wives, and is their sole breadwinner.",
                                    "title": "Former SGA Security supervisor sentenced to 45 years in prison over murdering Sheikh Mutumba",
                                    "url": "https://observer.ug/news/headlines/79361-former-sga-security-supervisor-sentenced-to-45-years-in-prison-over-murdering-sheikh-mutumba"
                                },
                                {
                                    "date": "2023-12-07T00:00:00Z",
                                    "snippet": "Treachery, under Section 16 of UPDF Act, is an offence involving infiltration on behalf of foreign entities, solicitation and unauthorised sharing of military information and or withholding of vital security information from proper authorities. Prosecution told the General Court Martial sitting in Makindye, a Kampala outskirt, and chaired by Brig Freeman Robert Mugabe, the accused --- among them three pastors, a teacher and masons --- between February 2022 and October 2023 engaged in \"war or war-like activities intending to overthrow the government of Uganda\". It is alleged that they committed the offences in various places within and outside the country, including South Sudan's capital Juba, where they \"held meetings, recruited and formed a rebel group called Uganda Lord's Salvation Army...\"",
                                    "title": "How plot to overthrow the govt was uncovered | Monitor",
                                    "url": "https://www.monitor.co.ug/uganda/news/national/how-plot-to-overthrow-the-govt-was-uncovered-4456510"
                                },
                                {
                                    "snippet": "Accordingly, this court finds that each of you has a case to answer and you put on your defence,\" ruled Brig. Gen. Robert Freeman Mugabe, the GCM chairman on Tuesday (April 16, 2024) as the accused reappeared in his court for mention of their case. Maj. Mwesigye was one of Uganda People's Defence Forces' (UPDF) finest commandos and took part in UPDF's decisive battles against Al Shabaab in Somalia.",
                                    "title": "SFC commando murder suspects have a case to answer – court - New Vision Official",
                                    "url": "https://www.newvision.co.ug/category/news/sfc-commando-murder-suspects-have-a-case-to-a-NV_186106"
                                },
                                {
                                    "date": "2022-09-01T00:00:00Z",
                                    "snippet": "Those remanded are; Major Joel Mugabi Butaaho, Major Justus Mugenyi and Captain William Serumaga, who are all residents of Rubongi Military Hospital and were attached to the hospital as Quartermaster, Administration officer and Political Commissariat respectively. The group on Wednesday was arraigned before the General Court Martial presided over by Brigadier Robert Freeman Mugabe and charged with fraudulent offenses. The court has heard that the officers and others still at large during the months of May, June and July 2022 mismanaged drugs, X ray films and unspecified amount of emergence funds which were all meant for Rubongi Military Hospital.",
                                    "title": "Three UPDF officers remanded for mismanagement of Rubongi military hospital",
                                    "url": "https://www.independent.co.ug/three-updf-officers-remanded-for-mismanagement-of-rubongi-military-hospital/"
                                },
                                {
                                    "date": "2023-01-23T00:00:00Z",
                                    "snippet": "Two cleaners from Kitovu hospital and Good Foundation primary school in Masaka municipality have been jailed for four years over aggravated robbery contrary to sections 285 and 286 of the panel code act. The two, Asuman Ssemivumbi and Innocent Safari were convicted by the General Court Martial chairperson Brig Gen Robert Freeman Mugabe who found them guilty of aggravated robbery. According to the prosecution, in April 2019, Ssemivumbi and Safari robbed Vicent Kiberu of Shs 2.3 million and a Techno phone.",
                                    "title": "Two cleaners sentenced to 4 years in jail over aggravated robbery",
                                    "url": "https://observer.ug/news/headlines/76598-two-cleaners-sentenced-to-4-years-in-jail-over-aggravated-robbery"
                                },
                                {
                                    "date": "2023-11-03T00:00:00Z",
                                    "snippet": "UPDF has said that a Memorandum of Understanding and the Status of Forces Agreement with Somalia, provide that each Troop Contributing Country has to try her own personnel while in the mission area. Brig Mugabe will be in Somalia for two weeks hearing cases and at the end of the sessions, those who will be found guilty will be given appropriate sentences and those found not guilty acquitted. The Army said the judgements will depend on the circumstances under which the offences were committed and evidence that will be brought to court.",
                                    "title": "UPDF Majors in Mogadishu face charges of cowardice following Al-Shabaab attack",
                                    "url": "https://www.independent.co.ug/updf-majors-on-mogadishu-face-charges-of-cowardice-following-al-shabaab-attack/"
                                },
                                {
                                    "date": "2022-09-27T00:00:00Z",
                                    "snippet": "However, lance corporal Richard Isoke who has been on remand for more than a year will now serve four months and 23 days in jail. Court presided over by Brig Robert Freeman Mugabe had initially charged Isoke with aggravated robbery but later acquitted him of the crime and instead found him guilty of attempting to rob since the alleged stolen items did not leave the scene of the crime. He committed the cirme on November 1, 2018, at Foundation Building, Jinja road while travelling in Toyota Hiace registration number, H4DF 789.",
                                    "title": "UPDF corporal sentenced to 2 years for attempted robbery of Indian businessman",
                                    "url": "https://observer.ug/news/headlines/75311-updf-corporal-sentenced-to-2-years-for-attempted-robbery-of-indian-businessman"
                                },
                                {
                                    "date": "2022-08-16T00:00:00Z",
                                    "snippet": "The General Court Martial in Makindye has remanded two people including a Uganda People's Defence Forces junior officer Lt Paddy Nahabwe alias Kenneth Turinawe on charges of murder. Nahabwe together with James Niwamanya were arraigned before the court presided over by Brigadier Robert Freeman Mugabe and charged with murder and aggravated robbery. The court heard that on October 13th 2018 in Nkuzongere Katale zone, Semuto sub county in Nakaseke district, Niwamanya and Nahabwe unlawfully caused the death of Samson Nteza.",
                                    "title": "UPDF officer remanded over murder of boda boda rider",
                                    "url": "https://www.independent.co.ug/updf-officer-remanded-over-murder-of-boda-boda-rider/"
                                },
                                {
                                    "date": "2022-10-26T00:00:00Z",
                                    "snippet": "The General Court Martial in Makindye has remanded Major Gordon Joel Atwebembeire, over allegations of murder. Atwebembeire, 47, on Tuesday appeared before the Court presided over by Brigadier Robert Freeman Mugabe, and was charged with one count of murder. Court heard that on October 6th, 2022, Atwebembeire while in Bayima village, Nabitanga sub county, Sembabule district with malice aforethought, unlawfully caused the death of his wife Marion Tukamuhebwa.",
                                    "title": "UPDF officer remanded over murder of spouse",
                                    "url": "https://www.independent.co.ug/updf-officer-remanded-over-murder-of-spouse/"
                                },
                                {
                                    "date": "2022-11-29T00:00:00Z",
                                    "snippet": "Batte ,50, is a militant of the Regular Forces of the UPDF under the Directorate of Logistics, as a driver. On Tuesday, he was arraigned before the General Court Martial in Makindye presided over by Brigadier Freeman Robert Mugabe, and charged with one count of offenses related to security contrary to the UPDF Act of 2005. The court heard that between December 1st and 5th, 2021 at Entebbe Air force military base in Wakiso district, without authorization, Batte and five others moved and accessed the Air Drone Wing which was an act prejudicing the security of the Defense Forces.",
                                    "title": "UPDF sergeant pleads guilty to illegal access of air drone wing",
                                    "url": "https://www.independent.co.ug/updf-sergeant-pleads-guilty-to-illegal-access-of-air-drone-wing/"
                                },
                                {
                                    "date": "2024-06-25T00:00:00Z",
                                    "snippet": "President Museveni, the Commander-in-Chief of the armed forces, reappointed Gen Mugabe last amid outcry from rights groups that said he had presided over a court blighted with human rights violations. Gen Mugabe has been criticised for his handling of the case of the Opposition National Unity Platform supporters who were arrested in 2021. At least 28 of the NUP supporters",
                                    "title": "Uganda: Court Martial Chief Mugabe Sworn in for Third Term - allAfrica.com",
                                    "url": "https://allafrica.com/stories/202406250443.html"
                                }
                            ],
                            "name": "Freeman Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-fraud-linked",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-property",
                                "adverse-media-v2-violence-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Freeman Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Freeman Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Tinotenda Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Mugabe Jnr"
                                },
                                {
                                    "name": "Robert Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Tinotenda Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Arab Emirates"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Canada, China, Cyprus, United Arab Emirates, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Canada"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "China"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Cyprus"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa, United Kingdom, Venezuela, Zambia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Mali"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "International, Mali, Russia, South Africa, Zambia, Zimbabwe"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Russian Federation"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Venezuela"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "South Africa, Zambia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1992"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Canada, China, Cyprus, Mali, Russian Federation, South Africa, United Arab Emirates, United Kingdom, Venezuela, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "KEUR6HVMHUAT2FC",
                            "last_updated_utc": "2024-08-14T14:30:42Z",
                            "media": [
                                {
                                    "snippet": "The Late former President Mugabe's son, Robert Mugabe Jr, was yesterday arrested for vandalising cars and properties at a place where he was partying over the weekend protected :",
                                    "title": "(no title)",
                                    "url": "https://www.thezimbabwean.co/wp-json/wp/v2/posts/227412"
                                },
                                {
                                    "snippet": "Il figlio maggiore di Robert Mugabe, il defunto dittatore dello Zimbabwe, è stato arrestato per aver presumibilmente causato danni per un valore di 12mila dollari ad auto e altre proprietà durante una festa in un quartiere elegante di Harare durante il fine settimana scorso. Robert Mugabe Jr, 31 anni, ha trascorso una notte in una stazione di polizia locale e poi è comparso brevemente in un tribunale di Harare, la capitale, lunedì. Mugabe non è stato trattenuto dopo l'udienza, ma il suo avvocato, Ashiel Mugiya, ha dichiarato che le accuse sono ancora in corso e che le due parti stanno negoziando un accordo extragiudiziale.",
                                    "title": "10 notizie dal mondo che non sono finite in prima pagina",
                                    "url": "https://www.today.it/mondo/dieci-notizie-alluvione-brasile-opposizione-tunisia.html"
                                },
                                {
                                    "date": "2023-02-28T00:00:00Z",
                                    "snippet": ": Robert Mugabe Jr arrested in Zimbabwe Jonathan deBurca Butler takes listeners through the week's international stories",
                                    "title": "Around The World: Robert Mugabe Jr arrested in Zimbabwe | Newstalk",
                                    "url": "https://www.newstalk.com/podcasts/around-the-world/around-the-world-robert-mugabe-jr-arrested-in-zimbabwe"
                                },
                                {
                                    "snippet": "For decades his father was one of the world's most feared dictators. Today, Robert Mugabe Jr. is on bail, pending Washington Times",
                                    "title": "District Of Columbia News",
                                    "url": "https://www.bignewsnetwork.com/category/district-of-columbia-news"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Police spokesperson Paul Nyathi confirmed the arrest in a statement and said that Mugabe (Junior), aged 31, will be produced in court soon, Xinhua news agency reported. Mugabe was arrested on Sunday after a complaint by his friend Nkatazo Sindiso that he destroyed property worth $12,000 at House number 3A, Verdi Lane, Strathaven, Harare, Zimbabwe's official news agency New Ziana quoted Nyathi as saying. 20230220-210203",
                                    "title": "Ex-Zimbabwe President Mugabe's son held on property damage charges | CanIndia News",
                                    "url": "https://www.canindia.com/ex-zimbabwe-president-mugabes-son-held-on-property-damage-charges/"
                                },
                                {
                                    "date": "2023-03-24T00:00:00Z",
                                    "snippet": "For decades his father was one of the world's most feared dictators. Today, Robert Mugabe Jr. is on bail, pending a return to a Zimbabwean court on a charge of damaging property that could send him to jail. His mother, Grace, has a warrant for her arrest across the border in South Africa where she is accused of assaulting a woman in Johannesburg.",
                                    "title": "In Africa, a powerful name no longer guarantees protection - Washington Times",
                                    "url": "https://www.washingtontimes.com/news/2023/mar/24/africa-powerful-name-no-longer-guarantees-protecti/"
                                },
                                {
                                    "date": "2023-03-24T00:00:00Z",
                                    "snippet": "For decades his father was one of the world's most feared dictators. Today, Robert Mugabe Jr. is on bail, pending a return to a Zimbabwean court on a charge of damaging property that could send him to jail. His mother, Grace, has a warrant for her arrest across the border in South Africa where she is accused of assaulting a woman in Johannesburg.",
                                    "title": "In Africa, a powerful name no longer guarantees protection – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/politics/in-africa-a-powerful-name-no-longer-guarantees-protection/"
                                },
                                {
                                    "date": "2023-02-22T00:00:00Z",
                                    "snippet": "Depuis le dimanche 19 février dernier, le fils de l'ancien président zimbabwéen Robert Mugabe a quelques soucis avec la justice de son pays. En effet, Robert Mugabe Jr a été mis aux arrêts pour des dégradations sur des voitures de luxe et des biens privés. L'annonce a en effet été faite par la police.",
                                    "title": "Le fils de Robert Mugabe a été arrêté au Zimbabwe – La Nouvelle Tribune",
                                    "url": "https://lanouvelletribune.info/2023/02/le-fils-de-robert-mugabe-a-ete-arrete-au-zimbabwe/amp/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "Norton legislator Temba Mliswa has blasted the state over the way they handled the Robert Mugabe Junior's arrest on charges of malicious damage to property saying it clearly showed preferential treatment as anyone would not have been given the same privilege. Posting on Twitter, Mliswa said since the matter was before the courts, they were supposed to allow the parties involved to appear before the court while any pleas for withdrawals were supposed to be made through the Magistrate as opposed to the National Prosecuting Authority (NPA).",
                                    "title": "Mliswa Blasts State Over Preferential Treatment Given To Robert Mugabe Jnr – ZimEye",
                                    "url": "https://www.zimeye.net/2023/02/21/mliswa-blasts-preferential-treatment-given-to-robert-mugabe-jnr/"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": ": Robert Mugabe Junior (31) was set free Monday following his arrest at the weekend. Mugabe was accused of damaging a friend's vehicle and property worth US$12,000 during a party held in Harare's Strathaven suburb.",
                                    "title": "Mugabe Junior set free after arrest; says lawyer - 'the State decided to give parties the opportunity to negotiate' - NewZimbabwe.com",
                                    "url": "https://www.newzimbabwe.com/mugabe-junior-set-free-after-arrest-says-lawyer-the-state-decided-to-give-parties-the-opportunity-to-negotiate/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "ROBERT Mugabe Jnr, the son of the late former President Robert Mugabe was arrested at the weekend for alleged malicious damage to property, but was released yesterday before plea. He was represented by lawyers Ashiel Mugiya and Tungamirai Muganhiri.",
                                    "title": "Mugabe son arrested, released before plea - The Zimbabwe Independent",
                                    "url": "https://theindependent.co.zw/index.php/local-news/article/200007754/mugabe-son-arrested-released-before-plea"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Mugabe's son arrested for damaging property -",
                                    "title": "Mugabe's son arrested for damaging property – police",
                                    "url": "https://zambianobserver.com/mugabes-son-arrested-for-damaging-property-police/?amp=1"
                                },
                                {
                                    "date": "2019-08-10T00:00:00Z",
                                    "snippet": "President Emmerson Mnangagwa said in a statement on Tuesday that though Mugabe was still at an undisclosed hospital in Singapore, he was responding well to treatment and could be released soon. \"Mugabe remains detained at a hospital in Singapore where he is receiving medical attention. Unlike in the past when the former president would require just about a month for this, his physicians this time around determined that he be kept for much longer, from early April this year when he left for his routine check-up,\" read a statement from Mnangagwa.",
                                    "title": "Our prayers are with you, EFF tells Mugabe – The Citizen",
                                    "url": "https://citizen.co.za/news/south-africa/general/2163835/our-prayers-are-with-you-eff-tells-mugabe/amp/"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "ARREST OF ROBERT TINOTENDA MUGABE (JUNIOR) The Zimbabwe Republic Police confirms that Robert Tinotenda Mugabe (Junior) (31) has been arrested on Malicious Damage to Property allegations after a complaint by his friend Nkatazo Sindiso (31) that he destroyed property worth USD12 000.00 at house number 3A Verdi Lane, Strathaven, Harare. He will appear in court in due course.",
                                    "title": "Police Confirm The Arrest Of Late Robert Mugabe Jnr – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/police-confirm-the-arrest-of-late-robert-mugabe-jnr/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "JOHANNESBURG -Charges against Robert Mugabe Junior, the son of the late former President of Zimbabwe Robert Mugabe, have been dropped. Mugabe junior was arrested by police at the weekend on charges of malicious damage to property. He arrived at Harare magistrate's court accompanied by his two lawyers, friends and police officers.",
                                    "title": "Prosecutors hold off charging Mugabe Jr over damage to property - eNCA",
                                    "url": "https://www.enca.com/news/prosecutors-hold-charging-mugabe-jr-over-damage-property"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "The state-controlled Herald newspaper initially published the story of the former president's son's arrest but later withdrew the story from its website after state agents allegedly phoned the editor of the publication. Former Zimbabwean President Robert Mugabe's son Robert Mugabe Jnr (31) was arrested on Sunday. He was escorted by detectives to the Harare Magistrates' Court on Monday, but prosecutors referred his matter back to the police station 'for further management'.",
                                    "title": "Robert Mugabe Jnr arrested on charge of malicious damag...",
                                    "url": "https://www.dailymaverick.co.za/article/2023-02-20-robert-mugabe-jnr-arrested-on-charge-of-malicious-damage-to-property/?utm_campaign=maverick_news"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "THE late former President Robert Gabriel Mugabe's son, Robert Tinotenda Mugabe (Junior), who was arrested on malicious property destruction charges was released",
                                    "title": "Robert Mugabe Jnr arrested, released – DailyNews",
                                    "url": "https://dailynews.co.zw/robert-mugabe-jnr-arrested-released/amp/"
                                },
                                {
                                    "date": "2023-06-14T00:00:00Z",
                                    "snippet": "He was served with summons this week and is expected in court for trial. As woes mounted on him, Mugabe was issued with an arrest warrant after he failed to show up in court. The State alleges he slapped Karimbika, accusing him of urinating on his vehicle.",
                                    "title": "Robert Mugabe Jnr at it again! Slaps friend's relative for urinating on his car, due in court - NewZimbabwe.com",
                                    "url": "https://www.newzimbabwe.com/robert-mugabe-jnr-at-it-again-slaps-friends-relative-for-urinating-on-his-car-due-in-court/"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Police confirmed the arrest saying he was picked up after a friend levelled charges against him. \"The Zimbabwe Republic Police confirms that Robert Tinotenda Mugabe (Junior) (31) has been arrested on Malicious Damage to Property allegations after a complaint by his friend Nkatazo Sindiso (31) that he destroyed property worth US$12 000 at house number 3A Verdi Lane, Strathaven, Harare,\" police said in statement.",
                                    "title": "Robert Mugabe Jnr in court for destroying property worth US$12 000 - The Standard",
                                    "url": "https://thestandard.co.zw/index.php/local-news/article/200007722/robert-mugabe-jnr-in-court-for-destroying-property-worth-us12-000"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "Former Zimbabwean President Robert Mugabe's son Robert Mugabe Jnr (31) was arrested on Sunday and was detained at Avondale police station. He was escorted by detectives to the Harare Magistrates' Court on Monday, but prosecutors referred his matter back to the police station 'for further management'.",
                                    "title": "Robert Mugabe Jnr released so he can celebrate his late father's birthday",
                                    "url": "https://zambianobserver.com/robert-mugabe-jnr-released-so-he-can-celebrate-his-late-fathers-birthday/amp/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "The eldest son of former Zimbabwean dictator Robert Mugabe has been arrested for damaging a house at a party. Robert Mugabe Jnr, 31, is accused of causing $12,000 (£10,000) worth of damage to cars and other property while partying at his friend Sindiso Nkatazo's residence. The allegations relate to a party attended by Mugabe Jnr, known for his playboy antics, in an upmarket area of the capital, Harare, over the weekend.",
                                    "title": "Robert Mugabe's playboy son arrested for 'spree of destruction at wild party' - Daily Star",
                                    "url": "https://www.dailystar.co.uk/news/world-news/robert-mugabes-playboy-son-arrested-29272855.amp"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Robert Tinotenda Mugabe junior has been arrested on charges of causing $12,000 worth of damage to cars and property at a party in Zimbabwe's Harare at the weekend. His friend, Sindiso Nkatazo, made the complaint, police said.",
                                    "title": "Robert Mugabe's son arrested after property destruction at Harare party",
                                    "url": "https://www.thenationalnews.com/world/2023/02/20/robert-mugabes-son-arrested-after-property-destruction-at-harare-party/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "The eldest son of Robert Mugabe, Zimbabwe's former president, has been arrested over allegations he damaged property at a party. Robert Mugabe Jnr, 31, the second child of the late authoritarian leader and his wife, Grace, is accused of causing $12,000 (£10,000) worth of damage to cars and other property belonging to his friend Sindiso Nkatazo, also aged 31. The allegations relate to a party attended by Mugabe Jnr in an upmarket area of the capital, Harare, over the weekend, reports Zimbabwean news site ZimLive.com.",
                                    "title": "Robert Mugabe's son charged in Zimbabwe for damaging cars at Harare party | World News | Sky News",
                                    "url": "https://news.sky.com/story/amp/robert-mugabes-son-charged-in-zimbabwe-for-damaging-cars-at-harare-party-12816214"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "- The National Prosecuting Authority (NPA) on Monday stopped Robert Mugabe Jnr's prosecution on charges of malicious damage to property after a weekend rampage during which he allegedly damaged vehicles and other property in a drunken rage. The 31-year-old son of the late former president Robert Mugabe was arrested on Sunday after his friend Sindiso Nkatazo, 31, filed a police report accusing him of destroying property worth US$12,000 during a party in Harare's upmarket Strathaven neighbourhood.",
                                    "title": "State Prosecutor shields Robert Mugabe Jnr from prosecution over party rampage – The Zimbabwe Mail",
                                    "url": "https://www.thezimbabwemail.com/law-crime/state-prosecutor-shields-robert-mugabe-jnr-from-prosecution-over-party-rampage/"
                                },
                                {
                                    "date": "2017-12-08T00:00:00Z",
                                    "snippet": "A Zimbabwean court on Thursday freed a Mugabe-era finance minister on bail ahead of his trial on corruption charges, laid following his arrest at the height of last month's military takeover. Ignatius Chombo, a close ally of former president Robert Mugabe who resigned on November 21, was the first Mugabe loyalist to be charged with a crime. The Zimbabwe High Court freed him on $5 000-bail but ordered he report to police three times a day, surrender his passport and stay away from government offices and the central bank.",
                                    "title": "Top Africa stories: Mugabe, Mnangagwa, Libya | News24",
                                    "url": "https://www.news24.com/Africa/News/top-africa-stories-mugabe-mnangagwa-libya-20171208"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "Convicted of sedition, he spent the next ten years in prison. Robert Mugabe Junior, 31, one of three children of the former Zimbabwean leader, has been accused of destroying cars at a party last weekend in the country's capital Harare. The estimated value of the damaged property is $12,000 police said.",
                                    "title": "What Was Robert Mugabe's Son Arrested For?",
                                    "url": "https://sputnikglobe.com/20230220/what-was-robert-mugabes-son-arrested-for-1107633040.html?chat_room_id=1107633040"
                                },
                                {
                                    "date": "2020-09-13T00:00:00Z",
                                    "snippet": ": Mugabe, Africa's longest-serving dictator, who has been implicated in serious human rights abuses throughout his 37 years in charge. Like father, like mother, like sons.",
                                    "title": "Zim's disgraceful first family | News | Africa | M&G",
                                    "url": "https://mg.co.za/article/2017-08-18-00-zims-disgraceful-first-family"
                                },
                                {
                                    "date": "2019-09-14T00:00:00Z",
                                    "snippet": "(Reuters) Friends and enemies A young Mugabe was once jailed in the former British colony Rhodesia for his nationalist ideas. But he swept to power in the 1980 elections after a guerrilla war and sanctions forced the Rhodesian government to the negotiating table.",
                                    "title": "Zimbabwe's Mugabe honoured at state funeral, burial delayed - EntornoInteligente",
                                    "url": "https://www.entornointeligente.com/zimbabwes-mugabe-honoured-at-state-funeral-burial-delayed/"
                                },
                                {
                                    "date": "2023-02-21T00:00:00Z",
                                    "snippet": "Robert Mugabe Junior (31) was set free Monday following his arrest at the weekend. Mugabe was accused of damaging a friend's vehicle and property worth US$12,000 during a party held in Harare's Strathaven suburb. He spent the night in detention at Avondale Police Station before being taken to Harare magistrate court where he spent the day going up and down the corridors, from office to office before he was set free.",
                                    "title": "Zimbabwe: Mugabe Junior Set Free After Arrest - Says Lawyer - 'The State Decided to Give Parties the Opportunity to Negotiate' - allAfrica.com",
                                    "url": "https://allafrica.com/stories/202302210024.html"
                                },
                                {
                                    "date": "2023-06-15T00:00:00Z",
                                    "snippet": "Robert Mugabe Junior, son of late former President has been hit with fresh criminal charges of assault. In February he was dragged to court accused of malicious damage to property after he smashed his friend, Simbiso Nkatazo's vehicle.",
                                    "title": "Zimbabwe: Robert Mugabe Jnr At It Again! Slaps Friend's Relative for Urinating On His Car, Due in Court - allAfrica.com",
                                    "url": "https://allafrica.com/stories/202306150053.html"
                                }
                            ],
                            "name": "Robert Mugabe Jnr",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-property",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Tinotenda Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Tinotenda Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Robert Mugabe Jnr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabe, Jr."
                                }
                            ],
                            "associates": [
                                {
                                    "association": "parent",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Robert Gabriel Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++age&ucbcb=1"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Robert+Gabriel+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++age&ucbcb=1"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=what+is+Robert+Gabriel+Mugabe+Zimbabwe+birthdate&ucbcb=1"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Zimbabwe"
                                }
                            ],
                            "id": "NW48HUWBK4ZLS5P",
                            "last_updated_utc": "2024-09-10T22:15:55Z",
                            "name": "Robert Mugabe, Jr.",
                            "sources": [
                                "complyadvantage"
                            ],
                            "types": [
                                "pep"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep"
                                ],
                                "matching_name": "Robert Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Tinotenda Mugabe, Jr."
                                },
                                {
                                    "name": "Robert Jnr Mugabe"
                                },
                                {
                                    "name": "Robert Peter Mugabe, Jr."
                                }
                            ],
                            "associates": [
                                {
                                    "association": "parent",
                                    "name": "Grace Mugabe"
                                },
                                {
                                    "association": "parent",
                                    "name": "Robert Gabriel Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++family&ucbcb=1"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Netherlands"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://www.google.com/search?hl=en-us&q=Grace+Mugabe+Zimbabwe++family&ucbcb=1"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Netherlands"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Zambia"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "date-of-birth-enrichment",
                                    "tag": "date_of_birth",
                                    "value": "1992-04-11"
                                },
                                {
                                    "name": "Related URL",
                                    "source": "date-of-birth-enrichment",
                                    "tag": "related_url",
                                    "value": "https://www.pindula.co.zw/Robert_Mugabe_Junior"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Netherlands, United Kingdom, Zambia, Zimbabwe"
                                }
                            ],
                            "id": "A7BHR4MPWCOUO2T",
                            "last_updated_utc": "2023-11-06T11:27:28Z",
                            "media": [
                                {
                                    "snippet": ": \"Mugabe's son arrested for damaging property -",
                                    "title": "(no title)",
                                    "url": "https://zambianobserver.com/wp-json/wp/v2/posts/433252"
                                },
                                {
                                    "date": "2017-08-27T00:00:00Z",
                                    "snippet": "Zijn conclusie luidt dat het daarom van belang is om de economische samenhang binnen de EMU te versterken. Wat hebben Teodorin Nguema Obiang Mangue, Duduzane Zuma, Robert Peter Mugabe Jr. en Chatunga Bellarmine Mugabe gemeen? Het zijn allen zonen van puissant rijke Afrikaanse dictators",
                                    "title": "Follow the Money selecteert - Follow the Money - Platform voor onderzoeksjournalistiek",
                                    "url": "https://www.ftm.nl/artikelen/follow-the-money-selecteert-27aug2017?utm_campaign=sharebuttonnietleden&utm_medium=social"
                                },
                                {
                                    "date": "2023-02-20T00:00:00Z",
                                    "snippet": "A son of Robert Mugabe, Zimbabwe's former president, has been arrested and charged with damaging property after a party where he was accused of smashing up cars. Robert Tinotenda Mugabe Jr was accused of smashing up £10,000 worth of property at a party in the Strathaven suburb of the capital, Harare. The former dictator's son faces three charges of malicious damage to property and two charges of assaulting a police officer, his lawyer said.",
                                    "title": "Robert Mugabe's son charged with smashing up £10,000 worth of cars",
                                    "url": "https://www.telegraph.co.uk/world-news/2023/02/20/robert-mugabes-son-charged-smashing-10000-worth-cars/"
                                }
                            ],
                            "name": "Robert Jnr Mugabe",
                            "sources": [
                                "complyadvantage",
                                "complyadvantage-adverse-media",
                                "date-of-birth-enrichment"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-general-aml-cft",
                                "adverse-media-v2-other-minor",
                                "pep",
                                "pep-class-1"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep",
                                    "pep-class-1"
                                ],
                                "matching_name": "Robert Peter Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Tinotenda Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Jnr Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            },
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Robert Peter Mugabe Jr",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Brig Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Uganda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Uganda"
                                }
                            ],
                            "id": "L5R6GBGCNQUVIM4",
                            "last_updated_utc": "2024-04-17T03:22:39Z",
                            "media": [
                                {
                                    "date": "2024-04-16T00:00:00Z",
                                    "snippet": "A National Unity Platform (NUP) supporter, Muydin Kakooza aka Saanya who has been on remand since May 2021, on Monday jumped out of the dock to charge at army court's chairman Brig Robert Mugabe after being denied bail again for the third time. Kakooza is accused alongside 27 others including Yasin Ssekitoleko alias Machete, Robert Christopher Rugumayo, Patrick Mwase, Simon Kikaabe, Olivia Lutaaya, Abdu Matovu, Ronald Kijambo, Sharif Kalanzi, Joseph Muwonge, Mesach Kiwanuka, Abdalla Kintu, Umar Emma Kato, and Musa Kavuma of being in illegal possession of 13 pieces of explosive devices between November 2020 and May 2021 in areas of Jinja, Mbale, Kireka, Nakulabye, Kawempe, Natete, and Kampala Central.",
                                    "title": "NUP supporters protest continued detention as army court denies them bail again",
                                    "url": "https://observer.ug/index.php/news/headlines/81066-nup-supporters-protest-continued-detention-as-army-court-denies-them-bail-again"
                                }
                            ],
                            "name": "Brig Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor"
                                ],
                                "matching_name": "Brig Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Zimbabwe Robert Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Switzerland"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France, Mali, Rwanda, Switzerland"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "France"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Mali"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Rwanda"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "France, Mali, Rwanda, Switzerland"
                                }
                            ],
                            "id": "G02VX7RUNJTAYE5",
                            "last_updated_utc": "2024-05-09T04:38:05Z",
                            "media": [
                                {
                                    "snippet":"Le soutien longtemps inconditionnel des allis dAfrique australe ne sera peut-tre pas ernel. En Afrique du Sud, la faveur d accords conomiques (barrage dInga et contrats miniers) le prsident Jacob Zuma a longtemps reprsent un alli de taille, mais il est aujourdhui contest pour cause de corruption tandis quau Zimbabwe Robert Mugabe, le plus fidle des amis de Kinshasa, a du passer la main. En Angola, le prsident dos Santos na pas hsit faire fermer la frontire au plus fort de la crise du Kasa afin de bloquer lafflux des rfugis et son successeur Joao Loureno a prvenu quil ne tolrerait aucun dbordement.",
                                    "title": "(no title)",
                                    "url": "https://rwandaises.com/wp-json/wp/v2/posts/35749"
                                },
                                {
                                    "snippet": "Le Zimbabwe a requis l'immunité diplomatique pour Grace Mugabe, accusée d'agression Le Zimbabwe a requis l'immunité diplomatique pour Grace Mugabe, accusée d'agression L 'épouse du président du Zimbabwe Robert Mugabe est accusée d 'avoir agressé un mannequin dans un hôtel de la ville sud-africaine de Johannesburg, dimanche. Les autorités du Zimbabwe ont requis l'immunité diplomatique pour la première dame du pays Grace Mugabe, accusée d'avoir agressé dimanche un mannequin dans hôtel de Johannesburg, a annoncé mercredi le ministère sud-africain de la Police.",
                                    "title": "Le Zimbabwe a requis l'immunité diplomatique pour Grace Mugabe, accusée d'agression",
                                    "url": "http://www.europe1.fr/international/le-zimbabwe-a-requis-limmunite-diplomatique-pour-grace-mugabe-accusee-dagression-3412616"
                                },
                                {
                                    "date": "2017-11-19T00:00:00Z",
                                    "snippet": "La politique européenne est-elle inhumaine, comme l'accuse l'ONU? ZIMBABWE Robert Mugabe sera destitué, s'il ne démissionne pas d'ici à lundi. L'inamovible président zimbabwéen lâché de toutes parts.",
                                    "title": "TV5MONDE : Kiosque - LIBAN, ESCLAVAGE EN LIBYE, CHUTE DE MUGABE, COP23",
                                    "url": "http://www.tv5monde.com/cms/chaine-francophone/Revoir-nos-emissions/Kiosque/Episodes/p-33334-LIBAN-ESCLAVAGE-EN-LIBYE-CHUTE-DE-MUGABE-COP23.htm"
                                },
                                {
                                    "date": "2017-02-01T00:00:00Z",
                                    "snippet": "l'opposant Evan Mawarire interpellé Le pasteur Evan Mawarire, l'un des chefs de file de la fronde contre le président du Zimbabwe Robert Mugabe, a été arrêté mercredi à l'aéroport d' Harare, alors qu'il rentrait de plus de six mois d'exil, a-t-on appris auprès de sa soeur. \"Quand il est arrivé à l'aéroport, il a été escorté dans une pièce par trois hommes avant même de passer par l'immigration ou la douane\", a affirmé à l'AFP Telda Mawarire.",
                                    "title": "Zimbabwe: l'opposant Evan Mawarire interpellé | Slate Afrique",
                                    "url": "http://www.slateafrique.com/716696/zimbabwe-lopposant-evan-mawarire-interpelle-"
                                },
                                {
                                    "date": "2017-02-02T00:00:00Z",
                                    "snippet": "Harare Le pasteur Evan Mawarire, l'un des chefs de file de la fronde contre le président du Zimbabwe Robert Mugabe, a été arrêté mercredi à l'aéroport d' Harare, alors qu'il rentrait de plus de six mois d'exil, a-t-on appris auprès de sa soeur. \"Quand il est arrivé à l'aéroport, il a été escorté dans une pièce par trois hommes avant même de passer par l'immigration ou la douane\", a affirmé à l'AFP Telda Mawarire.",
                                    "title": "Zimbabwe: l'opposant Evan Mawarire interpellé à l'aéroport d'Harare",
                                    "url": "http://www.romandie.com/news/Zimbabwe-lopposant-Evan-Mawarire-interpelle-a-laeroport_ROM/771823.rom"
                                },
                                {
                                    "date": "2017-02-01T00:00:00Z",
                                    "snippet": "AFP/Archives Le pasteur Evan Mawarire, l'un des chefs de file de la fronde contre le président du Zimbabwe Robert Mugabe, a été arrêté mercredi à l'aéroport d' Harare, alors qu'il rentrait de plus de six mois d'exil, a-t-on appris auprès de sa soeur. \"Quand il est arrivé à l'aéroport, il a été escorté dans une pièce par trois hommes avant même de passer par l'immigration ou la douane\", a affirmé à l'AFP Telda Mawarire.",
                                    "title": "Zimbabwe: l'opposant Evan Mawarire interpellé à l'aéroport d'Harare | Courrier international",
                                    "url": "http://www.courrierinternational.com/depeche/zimbabwe-lopposant-evan-mawarire-interpelle-son-retour-dexil.afp.com.20170201.doc.lb5sx.xml"
                                }
                            ],
                            "name": "Zimbabwe Robert Mugabe",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-general-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-general-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "Zimbabwe Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "M. Robert"
                                }
                            ],
                            "fields": [
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
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1975"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "United States"
                                }
                            ],
                            "id": "2MO87E1L0GSM6A6",
                            "last_updated_utc": "2024-10-09T01:04:26Z",
                            "media": [
                                {
                                    "date": "2020-09-15T00:00:00Z",
                                    "snippet": "- Lopez, Crystal, 41, manufacture/delivery of a controlled substance penalty grade 1 greater than 4 grams but less than 200 grams - Strunc, Robert M., 33, manufacture/delivery of a controlled substance penalty grade 1 greater than 4 grams but less than 200 grams; possession of a controlled substance penalty grade 1 greater than 1 gram but less than 4 grams; parole violation - Tell, Polaris, 34, Evading arrest/detention with a vehicle; theft of property greater than $100 but less than $750",
                                    "title": "Ellis County Crime Blotter for the week of Aug. 31-Sept. 6",
                                    "url": "https://www.waxahachietx.com/story/news/crime/2020/09/15/ellis-county-crime-blotter-for-week-of-aug-31-sept-6/42629285/"
                                },
                                {
                                    "date": "2016-09-24T00:00:00Z",
                                    "snippet": "(Lewis, Sept. 19). Mihalak, Robert M., 41, transient, 24 months, taking a vehicle without permission-2, possession of methamphetamine, hit and run unattended vehicle. (Lewis, Sept. 19).",
                                    "title": "Vital Statistics - Columbian.com",
                                    "url": "https://www.columbian.com/news/2016/sep/24/vital-statistics-734/"
                                },
                                {
                                    "date": "2015-04-13T00:00:00Z",
                                    "snippet": "Fairchild, Terence L., 26, Coeur d'Alene, failure to appear for driving without privileges, $2,500 Fisher, Robert M., 19, Rathdrum, probation violation for resisting/obstructing law enforcement, $10,000 Goodson, Nicholas D., 26, Coeur d'Alene, failure to appear for malicious injury to property, no bond",
                                    "title": "Warrants | Coeur d'Alene Press",
                                    "url": "https://cdapress.com/news/2015/apr/13/warrants-5/"
                                }
                            ],
                            "name": "M. Robert",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-narcotics-aml-cft",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-other-serious"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "unknown"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-narcotics",
                                    "adverse-media-v2-narcotics-aml-cft",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-other-serious"
                                ],
                                "matching_name": "M Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "word_to_initial"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "M. Robert"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Canada"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Canada, Netherlands, United Kingdom, United States"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United Kingdom"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Netherlands"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "United States"
                                },
                                {
                                    "name": "Date of Birth",
                                    "source": "complyadvantage-adverse-media",
                                    "tag": "date_of_birth",
                                    "value": "1975"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Canada, Netherlands, United Kingdom, United States"
                                }
                            ],
                            "id": "DHEVRTFMMD2LJX4",
                            "last_updated_utc": "2024-10-03T10:56:42Z",
                            "media": [
                                {
                                    "date": "2021-09-27T00:00:00Z",
                                    "snippet": "Four of the men were arrested in 2017, but the one suspected of committing the murder died months before the arrests. Charges of desecration of the body have expired under the statute of limitations, leading to only the main instigator, Robert M., being sentenced on Monday. Remove the ads from your TribLIVE reading experience but still support the journalists who create the content with TribLIVE Ad-Free.",
                                    "title": "(no title)",
                                    "url": "https://triblive.com/news/world/man-in-poland-gets-25-year-sentence-for-murder-cannibalism/"
                                },
                                {
                                    "date": "2021-09-27T00:00:00Z",
                                    "snippet": "Monika Widacka, his defence lawyer, said they would appeal, saying the conviction was based upon the \"testimony of one person who testified many years later, had alcohol problems and has been diagnosed with a mental illness.\" On hearing the verdict, Robert M., who has always denied having any role in the murder, said :",
                                    "title": "Cannibal who ate man with four friends to seal 'pact of silence' over murder sentenced to 25 years",
                                    "url": "https://www.telegraph.co.uk/world-news/2021/09/27/cannibal-ate-man-along-five-friends-seal-pact-silence-murder/"
                                },
                                {
                                    "date": "2021-09-27T00:00:00Z",
                                    "snippet": "Judge Tomasz Banaś explained in court that Sylwester B., Rafał O. and Janusz S. had been found guilty of eating the victim's body, but discontinued this inquiry due to a statute of limitations. Robert M. is to spend the next 25 in prison however his lawyer says they will appeal against the ruling.",
                                    "title": "Evil cannibal ordered pal to behead victim before cooking body over fire for dinner - Daily Star",
                                    "url": "https://www.dailystar.co.uk/news/world-news/evil-cannibal-ordered-pal-behead-25084715"
                                },
                                {
                                    "date": "2023-09-01T00:00:00Z",
                                    "snippet": "Pawel J. claimed that the evidence against him had been fabricated, vehemently denying the witness's statements and saying, \"It's all lies, I've had enough of this.\" Both Pawel J. and Robert M., along with a third suspect, were also allegedly dispatched armed with axes to Groningen on December 7, 2021, to assault a real estate entrepreneur who owed one of their bosses a million euros. Police tipped off the entrepreneur, who promptly vacated his business premises.",
                                    "title": "Main suspect in Peter R. de Vries murder was trying to establish a Polish mafia | NL Times",
                                    "url": "https://nltimes.nl/2023/09/01/main-suspect-peter-r-de-vries-murder-trying-establish-polish-mafia"
                                },
                                {
                                    "date": "2021-09-27T00:00:00Z",
                                    "snippet": "Four of the men were arrested in 2017, but the one suspected of committing the murder died months before the arrests. Charges of desecration of the body have expired under the statute of limitations, leading to only the main instigator, Robert M., being sentenced on Monday.",
                                    "title": "Man in Poland gets 25-year sentence for murder, cannibalism | CTV News",
                                    "url": "https://www.ctvnews.ca/world/man-in-poland-gets-25-year-sentence-for-murder-cannibalism-1.5602130"
                                },
                                {
                                    "snippet": ": 1/7/05 SIMCOX, ROBERT M. #865980-NCCF KOSCIUSKO COUNTY SEXUAL MISCONDUCT WITH A MINOR -10 YRS DATE OF SENTENCE :",
                                    "title": "Microsoft Word - MARCH 2009 CLEMENCY PAROLE AGENDA",
                                    "url": "https://www.in.gov/idoc/files/Microsoft_Word_-_MARCH_2009_CLEMENCY_PAROLE__AGENDA.pdf"
                                },
                                {
                                    "date": "2023-09-23T00:00:00Z",
                                    "snippet": "3rd or subsequent offense, battery, two counts assault. Schweizer, Robert M., two counts wanton endangerment with a firearm. Harris, Jamad S., entry of auto/access device fraud.",
                                    "title": "Mon County grand jury returns nearly 140 indictments - Dominion Post",
                                    "url": "https://www.dominionpost.com/2023/09/23/mon-county-grand-jury-returns-nearly-140-indictments/"
                                },
                                {
                                    "date": "2019-09-09T00:00:00Z",
                                    "snippet": "Brown, Mickey W., 43, Cataldo, driving without privileges, $10,000. Laclair, Robert M., 44, Osburn, probation violation, $5,000. Gavin, Josie M., 19, Rathdrum, probation violation, $15,000.",
                                    "title": "Warrants | Coeur d'Alene Press",
                                    "url": "https://cdapress.com/news/2019/sep/09/warrants-5/"
                                }
                            ],
                            "name": "M. Robert",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-property",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "unknown"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-general",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-property",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "M Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "word_to_initial"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "M. Robert"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Belgium"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Belgium, Germany, International, Netherlands, Suriname, Switzerland"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Switzerland"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Germany"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Netherlands"
                                },
                                {
                                    "name": "Country",
                                    "source": "complyadvantage-adverse-media",
                                    "value": "Suriname"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Belgium, Germany, Netherlands, Suriname, Switzerland"
                                }
                            ],
                            "id": "26UBM5HIT4SHNEC",
                            "last_updated_utc": "2024-10-05T22:31:33Z",
                            "media": [
                                {
                                    "date": "2024-02-12T00:00:00Z",
                                    "snippet": "Pieter Omtzigt (toen partijloos, nu NSC) kwam namelijk uit een ánder debat gehold, om even te zeggen dat de versoepeling van de Transgenderwet wat hem betreft niet mocht gelden voor veroordeelde zedendelinquenten. Het amendement dat hij daarvoor indiende, onderbouwde hij met een vreemde verwijzing naar de zedenzaak rond Robert M., een cisgender man die in 2012 werd veroordeeld voor het misbruiken van zeker 83 kinderen op verschillende kinderdagverblijven. Nicki Pouw-Verweij (toen JA21, later BBB) zei over het wijzigen van de Transgenderwet dat die even zorgvuldig moest worden besproken als versoepelingen voor tbs'ers.",
                                    "title": "'Anouks transfobie schokkend? Wacht tot je politici hoort' - OneWorld",
                                    "url": "https://www.oneworld.nl/identiteit/anouks-transfobie-schokkend-wacht-tot-je-politici-hoort/"
                                },
                                {
                                    "snippet":" Robert M. bleef donderdag op de strafzitting ontkennen geweten te hebben dat hij bewust seksuele omgang met een minderjarig meisje heeft gehad. Ze zei aan mij dat zij 16 jaar was, zei de verdachte op vragen van kantonrechter Marie Mettendaf.",
                                    "title": "(no title)",
                                    "url": "https://www.familienieuws.com/wp-json/wp/v2/posts/31063"
                                },
                                {
                                    "date": "2020-06-20T00:00:00Z",
                                    "snippet": "Il résidait dans l'immeuble où Christian B. avait établi son entreprise. En 2019, alors âgé de 20 ans, Robert M. attire une fillette de 8 ans chez lui avant de la violer dans le grenier de l'immeuble. A ce moment-là, Christian B. ne travaille plus dans l'immeuble.",
                                    "title": "L'entourage de l'homme suspecté d'avoir tué Maddie McCann scruté: un ami condamné pour l'agression d'une fillette de 8 ans - RTL Info",
                                    "url": "https://www.rtl.be/info/monde/europe/l-entourage-de-l-homme-suspecte-d-avoir-tue-maddie-mccann-etudie-un-ami-condamne-pour-l-agression-d-une-fillette-de-8-ans-1226219.aspx"
                                },
                                {
                                    "date": "2017-04-13T00:00:00Z",
                                    "snippet": "Gegen ihn ermittelt die US-Justizbehörde, unter anderem wegen \"schwerer Gefährdung der öffentlichen Sicherheit\". Laut den bisherigen Erkenntnissen der Polizei soll Robert M. eine Terrorismus-Hotline im US-Bundesstaat Maryland angerufen und behauptet haben, von einem Terroristen namens Tyran D. zu wissen. Tyran D., der eigentlich Gamer ist, soll mit einer Pistole und mehreren Beuteln Sprengstoff bewaffnet sein, außerdem drei Geiseln bei sich haben, so M. gegenüber der Anti-Terror-Hotline.",
                                    "title": "Nach Schüssen auf Gamer bei Swatting drohen einem Täter bis zu 20 Jahre Haft - VICE",
                                    "url": "https://www.vice.com/amp/de/article/yp7gwg/nach-schussen-auf-gamer-bei-swatting-drohen-einem-tater-bis-zu-20-jahre-haft"
                                },
                                {
                                    "date": "2024-03-06T00:00:00Z",
                                    "snippet": "Een kwart van de kinderen die slachtoffer werden van misbruik door kinderoppas Robert M. vertoonde acht jaar daarna nog altijd aan seksueel misbruik gerelateerd gedrag. Dat blijkt uit het proefschrift The deepest wounds are the immeasurable ones van Vionna Tsang, dat woensdag is gepubliceerd.",
                                    "title": "Onderzoek Amsterdamse zedenzaak: zorgelijk seksueel gedrag nog acht jaar na misbruik - NRC",
                                    "url": "https://www.nrc.nl/nieuws/2024/03/06/onderzoek-amsterdamse-zedenzaak-zorgelijk-seksueel-gedrag-nog-acht-jaar-na-misbruik-a4192313"
                                },
                                {
                                    "date": "2024-06-25T00:00:00Z",
                                    "snippet": "Damit lag er knapp über der Grenze zur absoluten Fahruntüchtigkeit.\n \n \n \nRoberto U. fuhr in südliche Richtung, ebenso der 40-jährige Radfahrer Robert M. Letzterer saß mit 1,18 Promille sowie unter Drogeneinfluss im Sattel. In einem Waldstück, so ergaben die Ermittlungen, radelte Robert M. in Schlangenlinien mit etwa 25 km/h über die B 11.",
                                    "title": "Prozess in München: Autofahrer fährt E-Biker an und lässt den Sterbenden zurück - München - SZ.de",
                                    "url": "https://www.sueddeutsche.de/muenchen/muenchen-prozess-toedlicher-unfall-ebike-koenigsdorf-lux.F1vSAtg5R2r8tMMkoU9Eit"
                                },
                                {
                                    "date": "2024-06-19T00:00:00Z",
                                    "snippet": "De veroordeelde kindermisbruiker Robert M. heeft vanuit de gevangenis een excuusbrief verstuurd aan bijna alle ouders van zijn slachtoffers. Ook stuurde hij een brief naar de Volkskrant, die hem zonder medeweten van justitie opzocht in de penitentiaire inrichting in Vught.",
                                    "title": "Robert M. stuurde excuusbrief aan ouders | Hart van Nederland",
                                    "url": "https://www.hartvannederland.nl/112/artikelen/robert-m-stuurde-excuusbrief-aan-ouders"
                                },
                                {
                                    "date": "2024-06-19T00:00:00Z",
                                    "snippet": "Het toezicht op het bezoek aan de veroordeelde kindermisbruiker Robert M. is aangescherpt. Bezoekers worden voortaan vooraf gescreend.",
                                    "title": "Toezicht op contacten Robert M. aangescherpt | Hart van Nederland",
                                    "url": "https://www.hartvannederland.nl/112/artikelen/toezicht-op-contacten-robert-m-aangescherpt"
                                },
                                {
                                    "date": "2015-08-06T00:00:00Z",
                                    "snippet": "Il travaillait aussi comme baby-sitter depuis 2009, entrant en contact avec des parents via Internet. Arrêté le 7 décembre 2010, Robert M. avait reconnu les faits qui lui étaient reprochés. Son procès devant le tribunal d'Amsterdam s'était ouvert le 12 mars.",
                                    "title": "Une trentaine d'arrestations dans le milieu pédophile à travers le monde",
                                    "url": "https://www.arcinfo.ch/neuchatel-canton/val-de-travers-region/val-de-travers-commune/une-trentaine-d-arrestations-dans-le-milieu-pedophile-a-travers-le-monde-219968"
                                }
                            ],
                            "name": "M. Robert",
                            "sources": [
                                "complyadvantage-adverse-media"
                            ],
                            "types": [
                                "adverse-media",
                                "adverse-media-v2-fraud-linked",
                                "adverse-media-v2-other-minor",
                                "adverse-media-v2-terrorism",
                                "adverse-media-v2-violence-aml-cft",
                                "adverse-media-v2-violence-non-aml-cft"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "unknown"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "adverse-media",
                                    "adverse-media-fraud",
                                    "adverse-media-general",
                                    "adverse-media-terrorism",
                                    "adverse-media-v2-fraud-linked",
                                    "adverse-media-v2-other-minor",
                                    "adverse-media-v2-terrorism",
                                    "adverse-media-v2-violence-aml-cft",
                                    "adverse-media-v2-violence-non-aml-cft",
                                    "adverse-media-violent-crime"
                                ],
                                "matching_name": "M Robert",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "word_to_initial"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage Adverse Media"
                                ]
                            }
                        ],
                        "score": 0.2
                    },
                    {
                        "doc": {
                            "aka": [
                                {
                                    "name": "Robert Mugabe"
                                }
                            ],
                            "associates": [
                                {
                                    "association": "spouse",
                                    "name": "Grace Mugabe"
                                }
                            ],
                            "fields": [
                                {
                                    "name": "Country",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Original Country Text",
                                    "source": "complyadvantage",
                                    "value": "Zimbabwe"
                                },
                                {
                                    "name": "Locationurl",
                                    "source": "complyadvantage",
                                    "value": "https://fr.wikipedia.org/wiki/Grace_Mugabe"
                                },
                                {
                                    "locale": "en",
                                    "name": "Related Url",
                                    "source": "complyadvantage",
                                    "tag": "related_url",
                                    "value": "https://fr.wikipedia.org/wiki/Grace_Mugabe"
                                },
                                {
                                    "name": "Countries",
                                    "tag": "country_names",
                                    "value": "Zimbabwe"
                                }
                            ],
                            "id": "QFO48Z97SNZD7WS",
                            "last_updated_utc": "2024-08-23T07:09:39Z",
                            "name": "Robert Mugabe",
                            "sources": [
                                "complyadvantage"
                            ],
                            "types": [
                                "pep"
                            ]
                        },
                        "is_whitelisted": false,
                        "match_types": [
                            "name_fuzzy"
                        ],
                        "match_types_details": [
                            {
                                "aml_types": [
                                    "pep"
                                ],
                                "matching_name": "Robert Mugabe",
                                "name_matches": [
                                    {
                                        "match_types": [
                                            "edit_distance"
                                        ],
                                        "query_term": "roberto"
                                    },
                                    {
                                        "match_types": [
                                            "exact_match"
                                        ],
                                        "query_term": "mugabe"
                                    }
                                ],
                                "secondary_matches": [],
                                "sources": [
                                    "ComplyAdvantage PEP Data"
                                ]
                            }
                        ],
                        "score": 0.2
                    }
                ]
            }
        },
        "status": "success"
    })
}

pub fn incode_mx_ocr_response() -> serde_json::Value {
    serde_json::json!({
        "name": {
            "fullName": "BOB BOBIERTO BOB PALOMINOS",
            "machineReadableFullName": "BOB BIERTO SALVA PALOMIN",
            "firstName": "Bob Bobierto",
            "givenName": "Bob Bobierto",
            "givenNameMrz": "Bob SALVA",
            "paternalLastName": "BONTO",
            "maternalLastName": "BONGO",
            "lastNameMrz": "BOBIERTO PALOMIN"
        },
        "address": "AV MEXICANA 481 FRACC LAS LOMITAS 22810 ENSENADA, B.C.",
        "addressFields": {
            "street": "AV MEXICANA 481",
            "colony": "FRACC LAS LOMITAS",
            "postalCode": "22810",
            "city": "ENSENADA",
            "state": "B.C.",
            "stateCode": "02",
            "addressCountryCode": "MEX"
        },
        "fullAddress": false,
        "invalidAddress": false,
        "checkedAddress": "Avenida Mexicana 481, Fraccionamiento Las Lomitas, 22810 Ensenada, BC, México",
        "checkedAddressBean": {
            "street": "Avenida Mexicana 481",
            "colony": "Fraccionamiento Las Lomitas",
            "postalCode": "11231",
            "city": "Ensenada",
            "state": "BC",
            "stateName": "Baja California",
            "addressCountryCode": "MEX",
            "label": "Avenida Mexicana 481, Fraccionamiento Las Lomitas, 22810 Ensenada, BC, México",
            "latitude": 31.88348,
            "longitude": -116.58761,
            "zipColonyOptions": [
                {
                    "colony": "Ejido Ruiz Cortines",
                    "postalCode": "22810"
                },
                {
                    "colony": "Las Lomitas",
                    "postalCode": "22810"
                },
                {
                    "colony": "Lomas y Jardines de Valle Verde",
                    "postalCode": "22810"
                },
                {
                    "colony": "Popular Valle Verde 1",
                    "postalCode": "22810"
                },
                {
                    "colony": "Lázaro Cárdenas 1",
                    "postalCode": "22810"
                },
                {
                    "colony": "Lázaro Cárdenas 2",
                    "postalCode": "22810"
                },
                {
                    "colony": "Luis Donaldo Colosio",
                    "postalCode": "22810"
                },
                {
                    "colony": "Margaritas",
                    "postalCode": "22810"
                },
                {
                    "colony": "2 de Septiembre",
                    "postalCode": "22810"
                },
                {
                    "colony": "Arco iris",
                    "postalCode": "22810"
                },
                {
                    "colony": "Victoria",
                    "postalCode": "22810"
                },
                {
                    "colony": "Lomitas III",
                    "postalCode": "22810"
                },
                {
                    "colony": "Lomitas IV",
                    "postalCode": "22810"
                },
                {
                    "colony": "Villas del Cedro I",
                    "postalCode": "22810"
                },
                {
                    "colony": "Villas del Cedro II",
                    "postalCode": "22810"
                },
                {
                    "colony": "Villas del Cedro III",
                    "postalCode": "22810"
                }
            ]
        },
        "exteriorNumber": "481",
        "typeOfId": "VoterIdentification",
        "documentFrontSubtype": "VOTER_IDENTIFICATION_CARD",
        "documentBackSubtype": "VOTER_IDENTIFICATION_CARD",
        "birthDate": 89095680,
        "gender": "M",
        "claveDeElector": "CLAVE12345",
        "curp": "CURP980327HBCLLS04",
        "numeroEmisionCredencial": "00",
        "cic": "1234567",
        "ocr": "123124123",
        "expireAt": "1767139200000",
        "expirationDate": 2025,
        "issueDate": 2015,
        "registrationDate": 2015,
        "issuingCountry": "MEX",
        "birthPlace": "BC",
        "nationality": "MEX",
        "nationalityMrz": "MEX",
        "notExtracted": 0,
        "notExtractedDetails": [],
        "mrz1": "123123123",
        "mrz2": "123123123<00<<32054<0",
        "mrz3": "Monon<Bobierto<<Bob<Bobby",
        "fullNameMrz": "Bob Boberto Bobierto",
        "documentNumberCheckDigit": "5",
        "dateOfBirthCheckDigit": "1",
        "expirationDateCheckDigit": "4",
        "additionalAttrs": [],
        "ocrDataConfidence": {
            "birthDateConfidence": 1.0,
            "givenNameConfidence": 0.991,
            "firstNameConfidence": 0.991,
            "mothersSurnameConfidence": 1.0,
            "fathersSurnameConfidence": 1.0,
            "addressConfidence": 0.99466664,
            "countryCodeConfidence": 1.0,
            "genderConfidence": 1.0,
            "issueDateConfidence": 1.0,
            "expirationDateConfidence": 1.0,
            "expireAtConfidence": 1.0,
            "mrz1Confidence": 1.0,
            "mrz2Confidence": 1.0,
            "mrz3Confidence": 1.0,
            "documentNumberConfidence": 1.0,
            "backNumberConfidence": 1.0,
            "personalNumberConfidence": 1.0,
            "claveDeElectorConfidence": 1.0,
            "numeroEmisionCredencialConfidence": 1.0,
            "curpConfidence": 1.0,
            "registrationDateConfidence": 1.0,
            "nationalityConfidence": 1.0,
            "nationalityMrzConfidence": 1.0
        }
    })
}
