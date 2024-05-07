use aws_sdk_textract::types::IdentityDocument as SdkIdentityDocument;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "snake_case")]
pub enum AnalyzeIdResult {
    FoundDocumentMetadata(AnalyzeIdMetadata),
    NoIdentityDocument,
    FoundMultipleDocuments,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AnalyzeIdMetadata {
    pub values: HashMap<String, IdFieldValue>,
}

impl AnalyzeIdMetadata {
    pub fn scores(&self) -> HashMap<String, f32> {
        self.values
            .iter()
            .map(|(k, v)| (k.clone(), v.value_confidence))
            .collect()
    }

    pub fn dob(&self) -> Option<&IdFieldValue> {
        self.values.get("DATE_OF_BIRTH")
    }

    pub fn address(&self) -> Option<&IdFieldValue> {
        self.values.get("ADDRESS")
    }

    pub fn id_type(&self) -> Option<&IdFieldValue> {
        self.values.get("ID_TYPE")
    }

    pub fn state_code(&self) -> Option<&IdFieldValue> {
        self.values.get("STATE_IN_ADDRESS")
    }

    pub fn state_name(&self) -> Option<&IdFieldValue> {
        self.values.get("STATE_NAME")
    }

    pub fn city(&self) -> Option<&IdFieldValue> {
        self.values.get("CITY_IN_ADDRESS")
    }

    pub fn zip(&self) -> Option<&IdFieldValue> {
        self.values.get("ZIP_CODE_IN_ADDRESS")
    }

    pub fn first_name(&self) -> Option<&IdFieldValue> {
        self.values.get("FIRST_NAME")
    }

    pub fn middle_name(&self) -> Option<&IdFieldValue> {
        self.values.get("MIDDLE_NAME")
    }

    pub fn last_name(&self) -> Option<&IdFieldValue> {
        self.values.get("LAST_NAME")
    }

    pub fn document_number(&self) -> Option<&IdFieldValue> {
        self.values.get("DOCUMENT_NUMBER")
    }

    pub fn issue_date(&self) -> Option<&IdFieldValue> {
        self.values.get("DATE_OF_ISSUE")
    }

    pub fn expiration_date(&self) -> Option<&IdFieldValue> {
        self.values.get("EXPIRATION_DATE")
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IdFieldValue {
    pub value: String,
    pub value_confidence: f32,
}

impl From<&SdkIdentityDocument> for AnalyzeIdMetadata {
    fn from(value: &SdkIdentityDocument) -> Self {
        let mut values = HashMap::new();

        for f in value.identity_document_fields() {
            let Some((kind, value)) = || -> Option<(String, IdFieldValue)> {
                Some((
                    f.r#type()?.text().to_string(),
                    IdFieldValue {
                        value: f.value_detection()?.text().to_string(),
                        value_confidence: f.value_detection()?.confidence()?,
                    },
                ))
            }() else {
                continue;
            };

            values.insert(kind, value);
        }

        Self { values }
    }
}
