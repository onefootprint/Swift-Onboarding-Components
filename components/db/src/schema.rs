table! {
    use diesel::sql_types::*;
    use crate::types::*;

    tenants (id) {
        id -> Uuid,
        name -> Text,
    }
}
