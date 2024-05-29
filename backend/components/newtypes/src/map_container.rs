pub mod declare_map_container {
    #[macro_export]
    macro_rules! flat_api_object_map_type {
        ($name: ident <$key: ty, $value: ty>, description = $desc: literal, example = $example: literal) => {
            #[doc = $desc]
            #[derive(
                Debug, Clone, serde::Serialize, serde::Deserialize, derive_more::Deref, derive_more::DerefMut,
            )]
            pub struct $name {
                #[serde(flatten)]
                pub map: std::collections::HashMap<$key, $value>,
            }

            impl IntoIterator for $name {
                type IntoIter = std::collections::hash_map::IntoIter<$key, $value>;
                type Item = ($key, $value);

                fn into_iter(self) -> Self::IntoIter {
                    self.map.into_iter()
                }
            }

            impl From<std::collections::HashMap<$key, $value>> for $name {
                fn from(v: std::collections::HashMap<$key, $value>) -> $name {
                    $name { map: v }
                }
            }

            #[allow(clippy::from_over_into)]
            impl Into<std::collections::HashMap<$key, $value>> for $name {
                fn into(self) -> std::collections::HashMap<$key, $value> {
                    self.map
                }
            }

            impl paperclip::v2::schema::Apiv2Schema for $name {
                fn name() -> Option<String> {
                    Some(stringify!($name).to_string())
                }

                fn description() -> &'static str {
                    $desc
                }

                fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
                    use paperclip::v2::models::{
                        DataType,
                        DefaultSchemaRaw,
                    };
                    let mut schema = DefaultSchemaRaw {
                        name: Self::name(),
                        example: serde_json::from_str::<serde_json::Value>($example)
                            .ok()
                            .or_else(|| Some($example.into())),
                        ..Default::default()
                    };
                    schema.data_type = Some(DataType::Object);
                    // This isn't any json-schema standard, but to give more information on what
                    // this dictionary object looks like, serialize a '<key>' and '<value>'
                    // property to display the respective schemas
                    schema
                        .properties
                        .insert("<key>".into(), Box::new(<$key>::raw_schema()));
                    schema
                        .properties
                        .insert("<value>".into(), Box::new(<$value>::raw_schema()));
                    // Not really true, just depends how these are being rendered
                    schema.required.insert("<key>".into());
                    schema.required.insert("<value>".into());

                    schema.name = Self::name();
                    schema
                }
            }
            impl paperclip::actix::OperationModifier for $name {}
        };
    }

    pub use flat_api_object_map_type;
}

#[cfg(test)]
mod tests {
    use super::declare_map_container::flat_api_object_map_type;
    use std::collections::HashMap;

    flat_api_object_map_type!(GetFields<String, String>, description="test", example="example");

    #[test]
    fn test_map_container() {
        let map = HashMap::new();
        let _ = GetFields::from(map);
    }
}
