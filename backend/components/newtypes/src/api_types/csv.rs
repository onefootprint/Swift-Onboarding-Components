use crate::{api_schema_helper::string_api_data_type_alias, DataAttribute, KvDataKey};
use derive_more::Deref;
use serde::de::IntoDeserializer;
use serde::de::{self, DeserializeOwned};
use serde::{Deserialize, Serialize};

/// Comma separated list of type `T`
#[derive(Debug, Clone, Hash, PartialEq, Eq, Serialize, Deserialize, Default, Deref)]
pub struct Csv<T>(#[serde(deserialize_with = "deserialize_stringified_list")] pub Vec<T>)
where
    T: DeserializeOwned;

string_api_data_type_alias!(Csv<KvDataKey>);
string_api_data_type_alias!(Csv<DataAttribute>);

/// serde_urlencoded, used by actix's web::Query, isn't very good at deserializing Vecs:
/// https://github.com/nox/serde_urlencoded/issues/6
pub fn deserialize_stringified_list<'de, D, I>(deserializer: D) -> Result<Vec<I>, D::Error>
where
    D: serde::Deserializer<'de>,
    I: de::DeserializeOwned,
{
    let s: Option<String> = serde::Deserialize::deserialize(deserializer)?;
    let s = if let Some(s) = s {
        s
    } else {
        return Ok(vec![]);
    };
    let ids = s
        .split(',')
        .into_iter()
        .map(|x| I::deserialize(x.trim().into_deserializer()))
        .collect::<Result<Vec<I>, _>>()?;
    Ok(ids)
}

#[cfg(test)]
mod tests {
    use super::Csv;

    use crate::DataAttribute;
    #[test]
    fn test_data_kinds() {
        #[derive(serde::Serialize, serde::Deserialize)]
        struct Test {
            fields: Csv<DataAttribute>,
        }
        let test = r#"{ "fields": "last_name, first_name, address_line1,city" }"#;
        let test: Test = serde_json::from_str(test).unwrap();

        assert_eq!(
            test.fields.0,
            vec![
                DataAttribute::LastName,
                DataAttribute::FirstName,
                DataAttribute::AddressLine1,
                DataAttribute::City
            ]
        );
    }
}
