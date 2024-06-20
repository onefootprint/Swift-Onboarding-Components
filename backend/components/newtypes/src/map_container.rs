pub mod declare_map_container {
    #[macro_export]
    macro_rules! flat_api_object_map_type {
        ($name: ident <$key: ty, $value: ty>, description = $desc: literal, example = $example: literal) => {
            #[doc = $desc]
            #[derive(
                Debug,
                Clone,
                serde::Serialize,
                serde::Deserialize,
                derive_more::Deref,
                derive_more::DerefMut,
                macros::JsonResponder,
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
                    use paperclip::v2::models::DataType;
                    use paperclip::v2::models::DefaultSchemaRaw;
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
        };
    }

    #[macro_export]
    macro_rules! impl_response_type {
        ($name: tt) => {
            // Need special implementation of OperationModifier for responses
            impl paperclip::actix::OperationModifier for $name {
                fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
                    $crate::map_container::update_body_parameter::<Self>(op);
                }

                fn update_response(op: &mut paperclip::v2::models::DefaultOperationRaw) {
                    $crate::map_container::update_200_response::<Self>(op);
                }
            }
        };
    }

    #[macro_export]
    macro_rules! impl_request_type {
        ($name: ident) => {
            impl paperclip::actix::OperationModifier for $name {}
        };
    }

    pub use flat_api_object_map_type;
    pub use impl_request_type;
    pub use impl_response_type;
}

pub fn update_body_parameter<T: paperclip::v2::schema::Apiv2Schema>(
    op: &mut paperclip::v2::models::DefaultOperationRaw,
) {
    op.parameters.push(paperclip::v2::models::Either::Right(
        paperclip::v2::models::Parameter {
            description: None,
            in_: paperclip::v2::models::ParameterIn::Body,
            name: "body".into(),
            required: true,
            schema: Some({
                let mut def = <T as paperclip::v2::schema::Apiv2Schema>::schema_with_ref();
                def.retain_ref();
                def
            }),
            ..Default::default()
        },
    ));
}

pub fn update_200_response<T: paperclip::v2::schema::Apiv2Schema>(
    op: &mut paperclip::v2::models::DefaultOperationRaw,
) {
    op.responses.insert(
        "200".into(),
        paperclip::v2::models::Either::Right(paperclip::v2::models::Response {
            description: Some("OK".into()),
            schema: Some({
                let mut def = <T as paperclip::v2::schema::Apiv2Schema>::schema_with_ref();
                def.retain_ref();
                def
            }),
            ..Default::default()
        }),
    );
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
