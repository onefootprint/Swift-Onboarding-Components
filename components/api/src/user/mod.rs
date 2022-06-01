use crate::identify::clean_email;
use newtypes::DataKind;
use paperclip::actix::web;

pub mod access_events;
pub mod biometric;
pub mod data;
pub mod decrypt;
pub mod detail;
pub mod email_verify;

pub fn routes() -> web::Scope {
    web::scope("/user")
        .service(web::resource("").route(web::get().to(detail::handler)))
        .service(data::handler)
        .service(email_verify::handler)
        .service(decrypt::handler)
        .service(access_events::handler)
        .service(biometric::init)
        .service(biometric::complete)
}

pub fn clean_for_storage(data_kind: DataKind, data_str: String) -> String {
    match data_kind {
        DataKind::Email => clean_email(data_str),
        _ => data_str,
    }
}

pub fn clean_for_fingerprint(data_str: String) -> String {
    data_str.to_lowercase().trim().to_string()
}
