use newtypes::DataKind;

/// This trait can be used to guard access
trait VaultPermissions {
    fn can_decrypt(data_kind: DataKind) -> bool;
    fn can_update(data_kind: DataKind) -> bool;
    fn can_add(data_kind: DataKind) -> bool;
    fn can_view_security_logs() -> bool;
}
