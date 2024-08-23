use newtypes::map_container::update_200_response;
use paperclip::v2::schema::Apiv2Schema;
use std::collections::BTreeMap;

pub struct ResponseWithHeaders<TBody, THeaders> {
    pub body: TBody,
    pub headers: THeaders,
}

pub trait Apiv2Headers {
    fn header_schema() -> BTreeMap<String, paperclip::v2::models::Header>;
    fn headers(self) -> Vec<(String, String)>;
}

impl<TBody, THeaders> actix_web::Responder for ResponseWithHeaders<TBody, THeaders>
where
    TBody: actix_web::Responder,
    THeaders: Apiv2Headers,
{
    type Body = actix_web::body::EitherBody<<TBody as actix_web::Responder>::Body>;

    fn respond_to(self, req: &actix_web::HttpRequest) -> actix_web::HttpResponse<Self::Body> {
        let mut response = self.body.customize();
        for (header, value) in self.headers.headers() {
            response = response.insert_header((header, value));
        }
        response.respond_to(req)
    }
}

impl<TBody, THeaders> Apiv2Schema for ResponseWithHeaders<TBody, THeaders>
where
    TBody: Apiv2Schema,
    THeaders: Apiv2Headers,
{
    fn name() -> Option<String> {
        TBody::name()
    }

    fn description() -> &'static str {
        TBody::description()
    }

    fn required() -> bool {
        TBody::required()
    }

    fn raw_schema() -> paperclip::v2::models::DefaultSchemaRaw {
        TBody::raw_schema()
    }

    fn schema_with_ref() -> paperclip::v2::models::DefaultSchemaRaw {
        TBody::schema_with_ref()
    }

    fn security_scheme() -> Option<paperclip::v2::models::SecurityScheme> {
        TBody::security_scheme()
    }

    fn header_parameter_schema(
    ) -> Vec<paperclip::v2::models::Parameter<paperclip::v2::models::DefaultSchemaRaw>> {
        TBody::header_parameter_schema()
    }
}

impl<TBody, THeaders> paperclip::actix::OperationModifier for ResponseWithHeaders<TBody, THeaders>
where
    TBody: Apiv2Schema + paperclip::actix::OperationModifier,
    THeaders: Apiv2Headers,
{
    fn update_parameter(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        TBody::update_parameter(op);
    }

    fn update_response(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        let headers = THeaders::header_schema();
        update_200_response::<TBody>(op, headers)
    }

    fn update_definitions(
        map: &mut std::collections::BTreeMap<String, paperclip::v2::models::DefaultSchemaRaw>,
    ) {
        TBody::update_definitions(map);
    }

    fn update_security(op: &mut paperclip::v2::models::DefaultOperationRaw) {
        TBody::update_security(op);
    }

    fn update_security_definitions(
        map: &mut std::collections::BTreeMap<String, paperclip::v2::models::SecurityScheme>,
    ) {
        TBody::update_security_definitions(map);
    }
}
