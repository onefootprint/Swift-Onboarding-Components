use paperclip::actix::web;
mod evaluate;
mod list;
mod update;


pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(list::list_rules_for_playbook)
        .service(update::multi_update_rules)
        .service(evaluate::evaluate_rule);
}
