// This is a diesel-2.0 compatible version of https://github.com/CQCL/diesel-tracing
// When diesel-tracing is updated to support 2.0, we can use it instead.

use diesel::backend::Backend;
use diesel::connection::AnsiTransactionManager;
use diesel::connection::Connection;
use diesel::connection::ConnectionSealed;
use diesel::connection::DefaultLoadingMode;
use diesel::connection::Instrumentation;
use diesel::connection::LoadConnection;
use diesel::connection::SimpleConnection;
use diesel::connection::TransactionManager;
use diesel::deserialize::Queryable;
use diesel::expression::QueryMetadata;
use diesel::pg::GetPgMetadataCache;
use diesel::pg::Pg;
use diesel::pg::PgConnection;
use diesel::pg::PgRowByRowLoadingMode;
use diesel::query_builder::Query;
use diesel::query_builder::QueryBuilder;
use diesel::query_builder::QueryFragment;
use diesel::query_builder::QueryId;
use diesel::result::ConnectionError;
use diesel::result::ConnectionResult;
use diesel::result::QueryResult;
use diesel::select;
use diesel::RunQueryDsl;
use std::marker::PhantomData;
use tracing::debug;
use tracing::field;
use tracing::instrument;

// https://www.postgresql.org/docs/12/functions-info.html
// db.name
define_sql_function!(fn current_database() -> diesel::sql_types::Text);
// net.peer.ip
define_sql_function!(fn inet_server_addr() -> diesel::sql_types::Inet);
// net.peer.port
define_sql_function!(fn inet_server_port() -> diesel::sql_types::Integer);
// db.version
define_sql_function!(fn version() -> diesel::sql_types::Text);

#[derive(Queryable, Clone, Debug, PartialEq)]
struct PgConnectionInfo {
    current_database: String,
    inet_server_addr: ipnetwork::IpNetwork,
    inet_server_port: i32,
    version: String,
}

pub struct InstrumentedPgConnection {
    inner: PgConnection,
    info: PgConnectionInfo,
}

impl SimpleConnection for InstrumentedPgConnection {
    #[instrument(
        fields(
            db.name=%self.info.current_database,
            db.system="postgresql",
            db.version=%self.info.version,
            otel.kind="client",
            net.peer.ip=%self.info.inet_server_addr,
            net.peer.port=%self.info.inet_server_port,
            called_fn="batch_execute",
            db.statement=field::Empty,
        ),
        skip(self, query),
        err,
    )]
    fn batch_execute(&mut self, query: &str) -> QueryResult<()> {
        debug!("executing batch query");
        self.inner.batch_execute(query)?;
        let span = tracing::Span::current();
        span.record("db.statement", query);
        span.record("otel.name", query);

        Ok(())
    }
}

impl InstrumentedPgConnection {
    #[instrument(skip_all)]
    fn get_pg_connection_info(conn: &mut PgConnection) -> Result<PgConnectionInfo, ConnectionError> {
        let info: PgConnectionInfo = select((
            current_database(),
            inet_server_addr(),
            inet_server_port(),
            version(),
        ))
        .get_result(conn)
        .map_err(ConnectionError::CouldntSetupConfiguration)?;
        Ok(info)
    }
}

impl ConnectionSealed for InstrumentedPgConnection {}

impl Connection for InstrumentedPgConnection {
    type Backend = Pg;
    type TransactionManager = AnsiTransactionManager;

    #[instrument(
        fields(
            db.name=field::Empty,
            db.system="postgresql",
            db.version=field::Empty,
            otel.kind="client",
            net.peer.ip=field::Empty,
            net.peer.port=field::Empty,
        ),
        skip(database_url),
        err,
    )]
    fn establish(database_url: &str) -> ConnectionResult<InstrumentedPgConnection> {
        debug!("establishing postgresql connection");
        let mut conn = PgConnection::establish(database_url)?;

        debug!("querying postgresql connection information");
        let info = Self::get_pg_connection_info(&mut conn)?;

        let span = tracing::Span::current();
        span.record("db.name", info.current_database.as_str());
        span.record("db.version", info.version.as_str());
        span.record("net.peer.ip", format!("{}", info.inet_server_addr).as_str());
        span.record("net.peer.port", info.inet_server_port);

        Ok(InstrumentedPgConnection { inner: conn, info })
    }

    #[instrument(
        fields(
            db.name=%self.info.current_database,
            db.system="postgresql",
            db.version=%self.info.version,
            otel.kind="client",
            net.peer.ip=%self.info.inet_server_addr,
            net.peer.port=%self.info.inet_server_port,
        ),
        skip(self, f),
    )]
    fn transaction<T, E, F>(&mut self, f: F) -> Result<T, E>
    where
        F: FnOnce(&mut Self) -> Result<T, E>,
        E: From<diesel::result::Error>,
    {
        Self::TransactionManager::transaction(self, f)
    }

    #[instrument(
        fields(
            db.name=%self.info.current_database,
            db.system="postgresql",
            db.version=%self.info.version,
            otel.kind="client",
            net.peer.ip=%self.info.inet_server_addr,
            net.peer.port=%self.info.inet_server_port,
            called_fn="execute_returning_count",
            db.statement=%DebugQuery::new(source),
            otel.name=%DebugQuery::new(source),
            db.row_count=field::Empty,
        ),
        skip(self, source),
        err,
    )]
    fn execute_returning_count<T>(&mut self, source: &T) -> QueryResult<usize>
    where
        T: QueryFragment<Pg> + QueryId,
    {
        let result = self.inner.execute_returning_count(source);
        if let Ok(r) = &result {
            // Instrument the number of rows returned on a successful result
            let span = tracing::Span::current();
            span.record("db.row_count", r);
        }
        result
    }

    fn transaction_state(&mut self) -> &mut Self::TransactionManager {
        self.inner.transaction_state()
    }

    // Maybe we can use Diesel's built-in instrumentation eventually?
    fn instrumentation(&mut self) -> &mut dyn Instrumentation {
        self.inner.instrumentation()
    }

    fn set_instrumentation(&mut self, instrumentation: impl Instrumentation) {
        self.inner.set_instrumentation(instrumentation)
    }
}

impl LoadConnection<DefaultLoadingMode> for InstrumentedPgConnection {
    type Cursor<'conn, 'query> = <PgConnection as LoadConnection<DefaultLoadingMode>>::Cursor<'conn, 'query>;
    type Row<'conn, 'query> = <PgConnection as LoadConnection<DefaultLoadingMode>>::Row<'conn, 'query>;

    #[instrument(
        fields(
            db.name=%self.info.current_database,
            db.system="postgresql",
            db.version=%self.info.version,
            otel.kind="client",
            net.peer.ip=%self.info.inet_server_addr,
            net.peer.port=%self.info.inet_server_port,
            called_fn="load",
            db.statement=%DebugQuery::new(&source),
            otel.name=%DebugQuery::new(&source),
            db.row_count=field::Empty,
        ),
        skip(self, source),
        err,
    )]
    fn load<'conn, 'query, T>(&'conn mut self, source: T) -> QueryResult<Self::Cursor<'conn, 'query>>
    where
        T: Query + QueryFragment<Pg> + QueryId + 'query,
        Self::Backend: QueryMetadata<T::SqlType>,
    {
        let result = <PgConnection as LoadConnection<DefaultLoadingMode>>::load(&mut self.inner, source);
        if let Ok(r) = &result {
            // Instrument the number of rows returned on a successful result
            let span = tracing::Span::current();
            span.record("db.row_count", r.len());
        }
        result
    }
}

impl LoadConnection<PgRowByRowLoadingMode> for InstrumentedPgConnection {
    type Cursor<'conn, 'query> =
        <PgConnection as LoadConnection<PgRowByRowLoadingMode>>::Cursor<'conn, 'query>;
    type Row<'conn, 'query> = <PgConnection as LoadConnection<PgRowByRowLoadingMode>>::Row<'conn, 'query>;

    #[instrument(
        fields(
            db.name=%self.info.current_database,
            db.system="postgresql",
            db.version=%self.info.version,
            otel.kind="client",
            net.peer.ip=%self.info.inet_server_addr,
            net.peer.port=%self.info.inet_server_port,
            called_fn="LoadConnection<PgRowByRowLoadingMode>::load",
            db.statement=%DebugQuery::new(&source),
            otel.name=%DebugQuery::new(&source),
        ),
        skip(self, source),
        err,
    )]
    fn load<'conn, 'query, T>(&'conn mut self, source: T) -> QueryResult<Self::Cursor<'conn, 'query>>
    where
        T: Query + QueryFragment<Pg> + QueryId + 'query,
        Self::Backend: QueryMetadata<T::SqlType>,
    {
        <PgConnection as LoadConnection<PgRowByRowLoadingMode>>::load(&mut self.inner, source)
    }
}

impl GetPgMetadataCache for InstrumentedPgConnection {
    fn get_metadata_cache(&mut self) -> &mut diesel::pg::PgMetadataCache {
        self.inner.get_metadata_cache()
    }
}

/// A struct that implements `fmt::Display` to show the SQL representation of a query.
///
/// This differs from diesel's implementation of DebugQuery - we purposefully omit showing the raw
/// values (binds) in the DB query.
pub struct DebugQuery<'a, T: 'a, DB> {
    query: &'a T,
    _marker: PhantomData<DB>,
}

impl<'a, T, DB> DebugQuery<'a, T, DB> {
    pub(crate) fn new(query: &'a T) -> Self {
        DebugQuery {
            query,
            _marker: PhantomData,
        }
    }
}

impl<'a, T, DB> std::fmt::Display for DebugQuery<'a, T, DB>
where
    DB: Backend + Default,
    DB::QueryBuilder: Default,
    T: QueryFragment<DB>,
{
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let mut query_builder = DB::QueryBuilder::default();
        let backend = DB::default();
        match QueryFragment::<DB>::to_sql(self.query, &mut query_builder, &backend) {
            Ok(_) => {
                write!(f, "{}", query_builder.finish())
            }
            Err(e) => {
                write!(f, "Error building query: {}", e)
            }
        }
    }
}
