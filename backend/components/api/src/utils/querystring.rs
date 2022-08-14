use serde::de;
use serde::de::IntoDeserializer;

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
        .map(|x| I::deserialize(x.into_deserializer()))
        .collect::<Result<Vec<I>, _>>()?;
    Ok(ids)
}
