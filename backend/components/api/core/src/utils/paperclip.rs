
#[macro_export]
macro_rules! api_headers_schema {
    (
        pub mod $group:ident {
            $(
                $(#[doc = $doc:expr])*
                #[required = $required:literal]
                $name:ident = $header:literal;
            )*
        }
    ) => {
        pub mod $group {
            use paperclip::v2::models::Parameter;
            use paperclip::v2::models::DefaultSchemaRaw;

            $(
                $(#[doc = $doc])*
                pub const $name: &'static str = $header;
            )*

            pub fn schema() -> Vec<Parameter<DefaultSchemaRaw>> {
                schema_opts(false)
            }

            paste::paste! {
                pub fn schema_opts(mark_all_optional: bool) -> Vec<Parameter<DefaultSchemaRaw>> {
                    vec![
                        $(
                            Parameter {
                                name: $header.to_owned(),
                                in_: paperclip::v2::models::ParameterIn::Header,
                                description: Some(
                                    vec![$(
                                        $doc.trim(),
                                    )*].join(" ")
                                ),
                                data_type: {
                                    use paperclip::v2::schema::TypedData;
                                    Some(String::data_type())
                                },
                                format: {
                                    use paperclip::v2::schema::TypedData;
                                    String::format()
                                },
                                required: $required && !mark_all_optional,
                                ..Default::default()
                            },
                        )*
                    ]
                }

            }
        }

    };
}

#[cfg(test)]
mod tests {
    #[test]
    fn test_header() {
        api_headers_schema! {
            pub mod test_group {
                /// test description
                #[required = true]
                TEST_HEADER = "x-fp-test";

                /// test description 2
                /// multline
                #[required = true]
                TEST_HEADER2 = "x-fp-test-2";
            }
        }

        assert_eq!(test_group::TEST_HEADER, "x-fp-test");
        assert_eq!(test_group::TEST_HEADER2, "x-fp-test-2");
        assert_eq!(
            test_group::schema().first().unwrap().description.clone().unwrap(),
            "test description".to_string()
        );
        assert_eq!(
            test_group::schema()
                .into_iter()
                .nth(1)
                .unwrap()
                .description
                .unwrap(),
            "test description 2 multline".to_string()
        );
    }
}
