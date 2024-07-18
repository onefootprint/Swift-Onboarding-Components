#[macro_export]
macro_rules! api_headers_schema {
    (
        $(#[doc = $g_doc:expr])*
        pub struct $group:ident {
            required: {
                $(

                    $(#[doc = $r_doc:expr])+
                    $(#[alias = $r_alias:literal])*
                    #[example = $example:literal]
                    $r_name:ident: $r_typ:ty = $r_header:literal;
                )*
            }

            optional: {
                $(

                    $(#[doc = $o_doc:expr])+
                    $(#[alias = $o_alias:literal])*
                    $(#[example = $o_example:literal])?
                    $o_name:ident: $o_typ:ty = $o_header:literal;
                )*
            }

        }
    ) => {

        paste::paste! {
            $(#[doc = $g_doc])*
            #[derive(Debug, Clone)]
            pub struct $group {
                $(
                    pub [<$r_name:lower>]: $r_typ,
                )*

                $(

                    pub [<$o_name:lower>]: Option<$o_typ>,
                )*
            }

            impl $group {
                $(
                    $(#[doc = $r_doc])*
                    pub const [<$r_name:snake:upper _HEADER_NAME>]:&'static str = $r_header;

                    #[allow(unused)]
                    $(#[doc = $r_doc])*
                    pub fn [<raw_get_$r_name>](req: & actix_web::http::header::HeaderMap) -> Option<&str> {
                        req.get($r_header)
                        $(
                            .or(req.get($r_alias))
                        )*
                        .and_then(|h| h.to_str().ok())
                    }

                    #[allow(unused)]
                    $(#[doc = $r_doc])*
                    pub fn [<raw_get_all_$r_name>](req: &actix_web::http::header::HeaderMap) -> Vec<& actix_web::http::header::HeaderValue> {
                        req.get_all($r_header)
                        $(
                            .chain(req.get_all($r_alias))
                        )*
                        .collect()
                    }
                )*

                $(
                    $(#[doc = $o_doc])*
                    pub const [<$o_name:snake:upper _HEADER_NAME>]:&'static str = $o_header;

                    #[allow(unused)]
                    $(#[doc = $o_doc])*
                    pub fn [<raw_get_$o_name>](req: & actix_web::http::header::HeaderMap) -> Option<& str> {
                        req.get($o_header)
                        $(
                            .or(req.get($o_alias))
                        )*
                        .and_then(|h| h.to_str().ok())
                    }

                    #[allow(unused)]
                    $(#[doc = $o_doc])*
                    pub fn [<raw_get_all_$o_name>](req: &actix_web::http::header::HeaderMap) -> Vec<& actix_web::http::header::HeaderValue> {
                        req.get_all($o_header)
                        $(
                            .chain(req.get_all($o_alias))
                        )*
                        .collect()
                    }

                    #[allow(unused)]
                    pub fn [<get_ $o_name>](&self) -> Result<$o_typ, $crate::FpError> {
                        self.$o_name.clone().ok_or($crate::FpError::from($crate::ApiCoreError::MissingRequiredHeader($o_header)))
                    }
                )*

                pub fn schema() -> Vec<paperclip::v2::models::Parameter<paperclip::v2::models::DefaultSchemaRaw>> {
                    vec![
                        $(
                            paperclip::v2::models::Parameter {
                                name: $r_header.to_owned(),
                                in_: paperclip::v2::models::ParameterIn::Header,
                                description: Some(
                                    vec![$(
                                        $r_doc.trim(),
                                    )*].join(" ")
                                ),
                                schema: Some(paperclip::v2::models::DefaultSchemaRaw{
                                    name: Some($r_header.to_owned()),
                                    data_type: Some(paperclip::v2::models::DataType::String),
                                    example: Some(serde_json::Value::String($example.to_owned())),
                                    ..Default::default()
                                }),
                                data_type: {
                                    use paperclip::v2::schema::TypedData;
                                    Some(String::data_type())
                                },
                                format: {
                                    use paperclip::v2::schema::TypedData;
                                    String::format()
                                },
                                required: true,
                                ..Default::default()
                            },
                        )*

                        $(
                            paperclip::v2::models::Parameter {
                                name: $o_header.to_owned(),
                                in_: paperclip::v2::models::ParameterIn::Header,
                                description: Some(
                                    vec![$(
                                        $o_doc.trim(),
                                    )*].join(" ")
                                ),
                                $(
                                    schema: Some(paperclip::v2::models::DefaultSchemaRaw{
                                        name: Some($o_header.to_owned()),
                                        data_type: Some(paperclip::v2::models::DataType::String),
                                        example: Some(serde_json::Value::String($o_example.to_owned())),
                                        ..Default::default()
                                    }),
                                )*
                                data_type: {
                                    use paperclip::v2::schema::TypedData;
                                    Some(String::data_type())
                                },
                                format: {
                                    use paperclip::v2::schema::TypedData;
                                    String::format()
                                },
                                required: false,
                                ..Default::default()
                            },
                        )*
                    ]
                }
            }

            impl paperclip::v2::schema::Apiv2Schema for  $group {
                fn header_parameter_schema() -> Vec<paperclip::v2::models::Parameter<paperclip::v2::models::DefaultSchemaRaw>> {
                    $group::schema()
                }
            }

            impl paperclip::actix::OperationModifier for $group { }

            impl actix_web::FromRequest for $group {
                type Error = $crate::ApiError;
                type Future = std::pin::Pin<Box<dyn std::future::Future<Output = Result<Self, Self::Error>>>>;
                fn from_request(req: &actix_web::HttpRequest, _payload: &mut actix_web::dev::Payload) -> Self::Future {

                    fn get_header<'b>(name: &str, req: &'b actix_web::http::header::HeaderMap) -> Option<&'b str> {
                        req.get(name).and_then(|h| h.to_str().ok())
                    }
                    use std::str::FromStr;

                    $(
                        let [<$r_name _res>] = get_header($r_header, req.headers())
                        $(
                            .or(get_header($r_alias, req.headers()))
                        )*
                        .map($r_typ::from_str).transpose().map_err($crate::FpError::from);
                    )*
                    $(
                        let [<$o_name _res>] = get_header($o_header, req.headers())
                        $(
                            .or(get_header($o_alias, req.headers()))
                        )*
                        .map($o_typ::from_str).transpose().map_err($crate::FpError::from);
                    )*
                    Box::pin(async move {
                        Ok(Self {
                            $(
                                $r_name: [<$r_name _res>]?.ok_or($crate::ApiCoreError::MissingRequiredHeader($r_header))?,
                            )*
                            $(
                                $o_name: [<$o_name _res>]?,
                            )*
                        })
                    })
                }
            }


        }


    };
}

#[cfg(test)]
mod tests {
    use actix_web::FromRequest;
    use serde_json::json;

    api_headers_schema! {
        /// Test headers
        pub struct TestGroupParams {
            required: {
                /// test description
                #[example = "foo"]
                test_header: String = "x-fp-test";

                /// test description
                #[example = "bar"]
                test_header2: String = "x-fp-test-2";
            }
            optional: {
                /// test description 3
                /// multline 3
                test_header3: String = "x-fp-test-3";

                /// test description 4
                test_header4: String = "x-fp-test-4";
            }
        }
    }
    #[test]
    fn test_header() {
        assert_eq!(TestGroupParams::TEST_HEADER_HEADER_NAME, "x-fp-test");
        assert_eq!(TestGroupParams::TEST_HEADER2_HEADER_NAME, "x-fp-test-2");
        assert_eq!(TestGroupParams::TEST_HEADER3_HEADER_NAME, "x-fp-test-3");
        assert_eq!(TestGroupParams::TEST_HEADER4_HEADER_NAME, "x-fp-test-4");

        let test_header = TestGroupParams::schema().first().unwrap().clone();
        assert_eq!(
            test_header.description.clone().unwrap(),
            "test description".to_string()
        );
        assert_eq!(test_header.schema.unwrap().example.unwrap(), json!("foo"));

        let test_header2 = TestGroupParams::schema().into_iter().nth(1).unwrap();
        assert_eq!(test_header2.schema.unwrap().example.unwrap(), json!("bar"));

        let test_header3 = TestGroupParams::schema().into_iter().nth(2).unwrap();
        assert_eq!(
            test_header3.description.unwrap(),
            "test description 3 multline 3".to_string()
        );
    }

    #[actix_web::test]
    async fn test_from_request() {
        let (req, mut payload) = actix_web::test::TestRequest::default()
            .insert_header(("x-fp-test", "hello world"))
            .insert_header(("x-fp-test-2", "hello world2"))
            .insert_header(("x-fp-test-4", "hello world4"))
            .to_http_parts();

        let s = TestGroupParams::from_request(&req, &mut payload).await.unwrap();

        assert_eq!(s.test_header, "hello world".to_string());
        assert_eq!(s.test_header2, "hello world2".to_string());

        assert_eq!(s.test_header3, None);
        assert_eq!(s.test_header4, Some("hello world4".into()));
    }
}
