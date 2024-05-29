use crate::models::tenant_user::TenantUser;
use crate::TxnPgConn;
use newtypes::OrgMemberEmail;

pub fn create(conn: &mut TxnPgConn) -> TenantUser {
    let email = OrgMemberEmail("flerp@onefootprint.com".to_owned());
    TenantUser::get_and_update_or_create(conn, email, None, None).expect("Couldn't create user")
}
