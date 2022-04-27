table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    challenge (id) {
        id -> Uuid,
        user_id -> Varchar,
        sh_data -> Bytea,
        h_code -> Bytea,
        kind -> Challenge_kind,
        state -> Challenge_state,
        validated_at -> Nullable<Timestamp>,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    temp_tenant_user_tokens (h_token) {
        h_token -> Varchar,
        timestamp -> Timestamp,
        user_id -> Varchar,
        tenant_id -> Varchar,
        tenant_user_id -> Varchar,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    tenant_api_keys (api_key_id) {
        api_key_id -> Varchar,
        tenant_id -> Varchar,
        name -> Varchar,
        sh_api_key -> Bytea,
        is_enabled -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    tenants (id) {
        id -> Varchar,
        name -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    user_tenant_verifications (tenant_user_id) {
        tenant_user_id -> Varchar,
        tenant_id -> Varchar,
        user_id -> Varchar,
        status -> User_status,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    users (id) {
        id -> Varchar,
        e_private_key -> Bytea,
        public_key -> Bytea,
        e_first_name -> Nullable<Bytea>,
        e_last_name -> Nullable<Bytea>,
        e_dob -> Nullable<Bytea>,
        e_ssn -> Nullable<Bytea>,
        sh_ssn -> Nullable<Bytea>,
        e_street_address -> Nullable<Bytea>,
        e_city -> Nullable<Bytea>,
        e_state -> Nullable<Bytea>,
        e_email -> Nullable<Bytea>,
        is_email_verified -> Bool,
        sh_email -> Nullable<Bytea>,
        e_phone_number -> Nullable<Bytea>,
        is_phone_number_verified -> Bool,
        sh_phone_number -> Nullable<Bytea>,
        id_verified -> User_status,
    }
}

joinable!(challenge -> users (user_id));
joinable!(temp_tenant_user_tokens -> user_tenant_verifications (tenant_user_id));

allow_tables_to_appear_in_same_query!(
    challenge,
    temp_tenant_user_tokens,
    tenant_api_keys,
    tenants,
    user_tenant_verifications,
    users,
);
