use paperclip::actix::web;
mod create;
mod delete;
mod list;
mod list_entry;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(create::create_list)
        .service(list::list_for_tenant)
        .service(list_entry::create::create_list_entry)
        .service(list_entry::list::entries_for_list)
        .service(delete::deactivate_list);
}
