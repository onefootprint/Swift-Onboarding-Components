pub mod declare_map_container {
    #[macro_export]
    macro_rules! impl_map_apiv2_schema {
        ($name: ident <$k: ty, $v: ty>, $description: tt, $json: tt) => {
            impl paperclip::v2::schema::Apiv2Schema for $name {
                fn name() -> Option<String> {
                    Some(stringify!($name).to_string())
                }

                fn description() -> &'static str {
                    $description
                }

                fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
                    use paperclip::v2::models::DataType;
                    use paperclip::v2::models::DefaultSchemaRaw;
                    let mut schema = DefaultSchemaRaw {
                        name: Self::name(),
                        example: Some(serde_json::json!($json)),
                        data_type: Some(DataType::Object),
                        ..Default::default()
                    };
                    schema
                        .properties
                        .insert("<key>".into(), Box::new(<$k>::raw_schema()));
                    schema
                        .properties
                        .insert("<value>".into(), Box::new(<$v>::raw_schema()));
                    schema.required.insert("<key>".into());
                    schema.required.insert("<value>".into());
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

    pub use impl_map_apiv2_schema;
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
