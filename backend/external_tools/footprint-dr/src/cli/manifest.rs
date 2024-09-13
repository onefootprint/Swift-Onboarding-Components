use serde::Deserialize;
use serde::Serialize;
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize)]
pub struct Manifest {
    pub version: i64,
    /// Maps DI names present in the vault at this version to the base name of key where the
    /// encrypted value is stored.
    pub fields: HashMap<Field, BlobBaseName>,
}


#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    PartialOrd,
    Ord,
    derive_more::Display,
    derive_more::From,
    derive_more::Deref,
    Serialize,
    Deserialize,
)]
/// Represents a vault "field" or data identifier, such as id.ssn9.
pub struct Field(String);

#[derive(
    Debug,
    Clone,
    Eq,
    PartialEq,
    Hash,
    derive_more::Display,
    derive_more::From,
    derive_more::Deref,
    Deserialize,
)]
pub struct BlobBaseName(String);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_deserialize() {
        let manifest = r#"{
            "version": 1,
            "fields": {
                "id.ssn9": "1699552698-wMrwv9X6rUlSkqXEirAqhempgxm-rnI6Uc_M1Upix4w",
                "id.first_name": "1699557633-8LlTXARTzGRkpkf9Txay72_mfo573zFE7j4Egs6N5hE"
            }
        }"#;

        let manifest: Manifest = serde_json::from_str(manifest).unwrap();

        assert_eq!(manifest.version, 1);
        assert_eq!(
            manifest.fields,
            HashMap::from([
                (
                    "id.ssn9".to_owned().into(),
                    "1699552698-wMrwv9X6rUlSkqXEirAqhempgxm-rnI6Uc_M1Upix4w"
                        .to_string()
                        .into()
                ),
                (
                    "id.first_name".to_owned().into(),
                    "1699557633-8LlTXARTzGRkpkf9Txay72_mfo573zFE7j4Egs6N5hE"
                        .to_string()
                        .into()
                ),
            ])
        );
    }
}
