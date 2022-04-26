use crate::schema;
use diesel::prelude::*;
use deadpool_diesel::postgres::Pool;
use crate::models::user_tenant_verifications::*;
use crate::models::temp_tenant_user_tokens::{NewTempTenantUserToken, TempTenantUserToken};
use crate::models::types::Status;
use crate::models::users::*;
use crate::errors::DbError;
use crypto::{sha256, random::gen_random_alphanumeric_code, hex::ToHex};

pub async fn init(pool: &Pool, user: NewUser, tenant_id: String) -> Result<(UserTenantVerification, String), DbError> {
    let conn = pool.get().await?;

    let token = format!("vtok_{}", gen_random_alphanumeric_code(34));
    let h_token = sha256(&token.as_bytes()).encode_hex();

    let user_tenant_record =
        conn.interact(move |conn| {
            conn.build_transaction().run(|| -> Result<UserTenantVerification, DbError> {
            // initialize new user vault
            let user : User = 
            diesel::insert_into(schema::users::table)
                    .values(&user)
                    .get_result::<User>(conn)?;

            // associate new user with tenant
            let user_tenant = NewUserTenantVerification {
                tenant_id: tenant_id.clone(),
                user_id: user.id.clone(),
                status: Status::Incomplete
            };
            let user_tenant_record : UserTenantVerification = diesel::insert_into(
                schema::user_tenant_verifications::table)
                    .values(&user_tenant)
                    .get_result::<UserTenantVerification>(conn)?;
                    
            // grant temporary credentials to tenant to modify user
            let temp_tenant_user_token = NewTempTenantUserToken {
                h_token: h_token,
                user_id: user.id,
                tenant_id: tenant_id,
                tenant_user_id: user_tenant_record.tenant_user_id.clone(),
            };
            diesel::insert_into(
                schema::temp_tenant_user_tokens::table)
                    .values(&temp_tenant_user_token)
                    .get_result::<TempTenantUserToken>(conn)?;

            Ok(user_tenant_record)
    })}).await??;
    // Return tenant-scoped user id
    Ok((user_tenant_record, token))
}

pub async fn update(pool: &Pool, update: UpdateUser) -> Result<usize, DbError> {
    let conn = pool.get().await?;

    let size = conn.interact(move |conn| {
        diesel::update(schema::users::table.filter(schema::users::id.eq(update.id.clone())))
        .set(update)
        .execute(conn)
    }).await??;

    Ok(size)
}

pub async fn get(pool: &Pool, user_id: String) -> Result<User, DbError> {
    let conn = pool.get().await?;

    let user: User = conn.interact(move |conn| {
        schema::users::table.filter(schema::users::id.eq(user_id)).first(conn)
    })
    .await??;

    Ok(user)
}

pub async fn lookup(pool: &Pool, auth_token: String, tenant_user_id: String) -> Result<PartialUser, DbError>  {
    let conn = pool.get().await?;

    let hashed_token : String = sha256(&auth_token.as_bytes()).encode_hex();

    let tenant_user: TempTenantUserToken = conn.interact(move |conn| {
        schema::temp_tenant_user_tokens::table.filter(
            schema::temp_tenant_user_tokens::h_token.eq(hashed_token)).first(conn)
    })
    .await??;

    if tenant_user.tenant_user_id != tenant_user_id {
        return Err(DbError::InvalidTenantAuth())
    }

    let user = get(pool, tenant_user.user_id).await?;

    let partial_user = PartialUser {
        id: user.id,
        public_key: user.public_key
    };

    Ok(partial_user)
}