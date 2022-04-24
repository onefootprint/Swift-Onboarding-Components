table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    challenge (id) {
        id -> Uuid,
        user_id -> Uuid,
        sh_data -> Bytea,
        code -> Int4,
        kind -> Challenge_kind,
        state -> Challenge_state,
        validated_at -> Nullable<Timestamp>,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    fp_user (id) {
        id -> Uuid,
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
        is_email_verified -> Nullable<Bool>,
        sh_email -> Nullable<Bytea>,
        e_phone_number -> Nullable<Bytea>,
        is_phone_number_verified -> Nullable<Bool>,
        sh_phone_number -> Nullable<Bytea>,
        id_verified -> User_status,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    temp_tenant_user_token (token_hash) {
        token_hash -> Varchar,
        timestamp -> Timestamp,
        user_id -> Uuid,
        tenant_id -> Uuid,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    tenant (id) {
        id -> Uuid,
        name -> Text,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    tenant_publishable_api_key (tenant_id) {
        tenant_id -> Uuid,
        name -> Varchar,
        api_key -> Varchar,
        api_key_hash -> Nullable<Bytea>,
        is_enabled -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

table! {
    use diesel::sql_types::*;
    use crate::models::types::*;

    user_tenant_verification (verification_id) {
        verification_id -> Uuid,
        tenant_id -> Uuid,
        user_id -> Uuid,
        status -> User_status,
    }
}

joinable!(challenge -> fp_user (user_id));

allow_tables_to_appear_in_same_query!(
    challenge,
    fp_user,
    temp_tenant_user_token,
    tenant,
    tenant_publishable_api_key,
    user_tenant_verification,
);
