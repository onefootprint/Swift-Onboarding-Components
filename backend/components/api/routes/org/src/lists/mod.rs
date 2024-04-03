use paperclip::actix::web;
mod create;
mod delete;
mod get;
mod list;
mod list_entry;
mod patch;
mod timeline;

pub fn routes(config: &mut web::ServiceConfig) {
    config
        .service(create::create_list)
        .service(list::list_for_tenant)
        .service(get::get_detail)
        .service(delete::deactivate_list)
        .service(patch::patch)
        .service(timeline::timeline)
        .service(list_entry::create::create_list_entry)
        .service(list_entry::list::entries_for_list)
        .service(list_entry::delete::deactivate_list_entry);
}
