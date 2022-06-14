use paperclip::actix::web;

pub mod complete;
pub mod d2p;
pub mod init;

pub fn routes() -> web::Scope {
    web::scope("/onboarding")
        .service(web::resource("").route(web::post().to(init::handler)))
        .service(complete::handler)
        .service(complete::handler)
        .service(d2p::routes())
}
