use crate::schema::super_admin_request;
use crate::NonNullVec;
use crate::PgConn;
use crate::TxnPgConn;
use api_errors::FpResult;
use chrono::DateTime;
use chrono::Utc;
use db_schema::schema::tenant;
use db_schema::schema::tenant_user;
use diesel::prelude::*;
use newtypes::InsightEventId;
use newtypes::OrgMemberEmail;
use newtypes::SuperAdminAccessRequestId;
use newtypes::TenantId;
use newtypes::TenantScope;
use newtypes::TenantUserId;

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = super_admin_request)]
pub struct SuperAdminRequest {
    pub id: SuperAdminAccessRequestId,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub tenant_user_id: TenantUserId,
    pub reason: Option<String>,
    pub insight_event_id: InsightEventId,

    // request details
    pub tenant_id: TenantId,
    #[diesel(deserialize_as = NonNullVec<TenantScope>)]
    pub scopes: Vec<TenantScope>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,

    // approval details
    pub responder_tenant_user_id: Option<TenantUserId>,
    pub responded_at: Option<DateTime<Utc>>,
    pub approved: Option<bool>,
    pub responder_insight_event_id: Option<InsightEventId>,
}

#[derive(Insertable, Debug, Clone)]
#[diesel(table_name = super_admin_request)]
pub struct NewSuperAdminRequest {
    pub tenant_user_id: TenantUserId,
    pub reason: Option<String>,
    pub insight_event_id: InsightEventId,

    pub tenant_id: TenantId,
    #[diesel(deserialize_as = NonNullVec<TenantScope>)]
    pub scopes: Vec<TenantScope>,
    pub created_at: DateTime<Utc>,
    pub expires_at: DateTime<Utc>,
}


impl SuperAdminRequest {
    #[tracing::instrument("SuperAdminRequest::create", skip(conn))]
    pub fn create(conn: &mut TxnPgConn, request: NewSuperAdminRequest) -> FpResult<Self> {
        let res: SuperAdminRequest = diesel::insert_into(super_admin_request::table)
            .values(request)
            .get_result(conn.conn())?;

        Ok(res)
    }

    #[tracing::instrument("SuperAdminRequest::list_approved", skip(conn))]
    pub fn list_approved(
        conn: &mut PgConn,
        tenant_user_id: &TenantUserId,
        tenant_id: &TenantId,
    ) -> FpResult<Vec<Self>> {
        let res = super_admin_request::table
            .filter(super_admin_request::tenant_user_id.eq(tenant_user_id))
            .filter(super_admin_request::tenant_id.eq(tenant_id))
            .filter(super_admin_request::approved.eq(true))
            .filter(super_admin_request::expires_at.gt(Utc::now()))
            .get_results(conn)?;

        Ok(res)
    }

    #[tracing::instrument("SuperAdminRequest::respond", skip(conn))]
    pub fn respond(
        conn: &mut TxnPgConn,
        id: &SuperAdminAccessRequestId,
        responder_tenant_user_id: TenantUserId,
        responder_insight_event_id: InsightEventId,
        approved: bool,
    ) -> FpResult<Self> {
        let now = Utc::now();
        let res = diesel::update(super_admin_request::table)
            .filter(super_admin_request::id.eq(id))
            .set((
                super_admin_request::responder_tenant_user_id.eq(responder_tenant_user_id),
                super_admin_request::responded_at.eq(now),
                super_admin_request::approved.eq(approved),
                super_admin_request::responder_insight_event_id.eq(responder_insight_event_id),
            ))
            .get_result(conn.conn())?;

        Ok(res)
    }
}

#[derive(Debug, Clone)]
pub struct SuperAdminRequestListArgs {
    pub tenant_user_id: Option<TenantUserId>,
    pub approved: Option<bool>,
}

pub type TenantName = String;
pub type SuperAdminRequestList = Vec<(
    SuperAdminRequest,
    TenantName,
    OrgMemberEmail,
    Option<OrgMemberEmail>,
)>;

impl SuperAdminRequest {
    #[tracing::instrument("SuperAdminRequest::list", skip(conn))]
    pub fn list(conn: &mut PgConn, args: SuperAdminRequestListArgs) -> FpResult<SuperAdminRequestList> {
        let tenant_user_alias = alias!(tenant_user as tenant_user_alias);

        let mut query = super_admin_request::table
            .order_by(super_admin_request::created_at.desc())
            .inner_join(tenant_user::table.on(tenant_user::id.eq(super_admin_request::tenant_user_id)))
            .inner_join(tenant::table.on(tenant::id.eq(super_admin_request::tenant_id)))
            .left_join(
                tenant_user_alias.on(tenant_user_alias
                    .field(tenant_user::id)
                    .nullable()
                    .eq(super_admin_request::responder_tenant_user_id)),
            )
            .select((
                super_admin_request::all_columns,
                tenant::name,
                tenant_user::email,
                tenant_user_alias.field(tenant_user::email).nullable(),
            ))
            .into_boxed();

        if let Some(approved) = args.approved {
            query = query.filter(super_admin_request::approved.eq(approved));
        }

        if let Some(tenant_user_id) = args.tenant_user_id {
            query = query.filter(super_admin_request::tenant_user_id.eq(tenant_user_id));
        }

        let res = query.load(conn)?;

        Ok(res)
    }
}
