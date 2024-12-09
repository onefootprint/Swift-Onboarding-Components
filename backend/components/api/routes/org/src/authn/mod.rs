use paperclip::actix::web;

mod assume_role;
mod docs_token;
mod google_oauth;
mod login;
mod logout;
mod magic_link;
mod roles;
mod saml_sso;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(login::handler)
        .service(logout::handler)
        .service(docs_token::post)
        .service(magic_link::handler)
        .service(google_oauth::handler)
        .service(roles::get)
        .service(assume_role::post)
        .service(saml_sso::handler);
}
