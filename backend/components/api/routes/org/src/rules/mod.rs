use paperclip::actix::web;
mod create;
mod delete;
mod evaluate;
mod list;
mod update;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(list::list_rules_for_playbook)
        .service(create::create_rule)
        .service(update::update_rule)
        .service(delete::delete)
        .service(evaluate::evaluate_rule);
}
