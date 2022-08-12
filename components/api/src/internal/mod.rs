use paperclip::actix::web;

pub mod identify;
pub mod onboarding;
pub mod user;

// Routes accessible only to internal applications - my1fp, bifrost
pub fn routes() -> web::Scope {
    web::scope("/hosted")
        .service(user::routes())
        .service(identify::routes())
        .service(onboarding::routes())
}

pub fn old_routes() -> web::Scope {
    web::scope("/internal")
        .service(user::routes())
        .service(identify::routes())
        .service(onboarding::routes())
}
