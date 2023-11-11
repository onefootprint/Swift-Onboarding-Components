use paperclip::actix::web;
mod create;
mod list;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(list::list_rules_for_playbook)
        .service(create::create_rule);
}
