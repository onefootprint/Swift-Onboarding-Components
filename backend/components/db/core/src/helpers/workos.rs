use newtypes::WorkosAuthMethod;

pub trait WorkosAuthIdentity {
    fn supports_auth_method(&self, auth_method: WorkosAuthMethod) -> bool;
}
