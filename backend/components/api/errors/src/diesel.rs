use crate::FpError;
use crate::FpErrorCode;
use crate::FpErrorTrait;
use diesel::result::DatabaseErrorKind;
use http::StatusCode;
use itertools::Itertools;

#[derive(Debug, thiserror::Error)]
pub enum DieselError {
    #[error("Database error: {0}")]
    Other(diesel::result::Error),
    #[error("There was a problem talking to the DB: {0:?}")]
    OtherDieselDbError(DatabaseErrorKind, String),
    #[error("The DB connection has been closed.")]
    ConnectionClosed(String),
    #[error("Data not found")]
    DataNotFound,
    #[error("Operation not allowed: foreign key constraint violation")]
    ForeignKeyViolation(String),
    #[error("Operation not allowed: unique constraint violation")]
    UniqueConstraintViolation(String),
    #[error("Operation not allowed: check constraint violation")]
    CheckConstraintViolation(String),
}

impl From<diesel::result::Error> for FpError {
    #[track_caller]
    fn from(value: diesel::result::Error) -> Self {
        DieselError::from(value).into()
    }
}

impl From<diesel::result::Error> for DieselError {
    fn from(value: diesel::result::Error) -> Self {
        match value {
            diesel::result::Error::NotFound => Self::DataNotFound,
            diesel::result::Error::DatabaseError(db_error, info) => {
                // Postgres provides lots of optional information for these errors - serialize it to a string
                // and include it in the Debug implementation fo DbError for better analysis
                let error_str = vec![
                    Some(format!("message: {}", info.message())),
                    info.details().map(|i| format!("details: {i}")),
                    info.hint().map(|i| format!("hint: {i}")),
                    info.table_name().map(|i| format!("table_name: {i}")),
                    info.column_name().map(|i| format!("column_name: {i}")),
                    info.constraint_name().map(|i| format!("constraint_name: {i}")),
                    info.statement_position()
                        .map(|i| format!("statement_position: {i}")),
                ]
                .into_iter()
                .flatten()
                .join("\n");
                match db_error {
                    DatabaseErrorKind::ClosedConnection => Self::ConnectionClosed(error_str),
                    DatabaseErrorKind::ForeignKeyViolation => Self::ForeignKeyViolation(error_str),
                    DatabaseErrorKind::CheckViolation => Self::CheckConstraintViolation(error_str),
                    DatabaseErrorKind::UniqueViolation => Self::UniqueConstraintViolation(error_str),
                    _ => Self::OtherDieselDbError(db_error, error_str),
                }
            }
            _ => Self::Other(value),
        }
    }
}


impl FpErrorTrait for DieselError {
    fn message(&self) -> String {
        self.to_string()
    }

    fn status_code(&self) -> StatusCode {
        match self {
            Self::Other(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::OtherDieselDbError(_, _) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::ConnectionClosed(_) => StatusCode::INTERNAL_SERVER_ERROR,
            Self::DataNotFound => StatusCode::NOT_FOUND,
            Self::ForeignKeyViolation(_) => StatusCode::BAD_REQUEST,
            Self::CheckConstraintViolation(_) => StatusCode::BAD_REQUEST,
            Self::UniqueConstraintViolation(_) => StatusCode::BAD_REQUEST,
        }
    }

    fn code(&self) -> Option<FpErrorCode> {
        match self {
            Self::UniqueConstraintViolation(_) => Some(FpErrorCode::DbUniqueConstraintViolation),
            Self::DataNotFound => Some(FpErrorCode::DbDataNotFound),
            Self::ConnectionClosed(_) => Some(FpErrorCode::DbConnectionClosed),
            Self::Other(diesel::result::Error::BrokenTransactionManager) => {
                Some(FpErrorCode::DbBrokenTransactionManager)
            }
            Self::Other(diesel::result::Error::DatabaseError(DatabaseErrorKind::ReadOnlyTransaction, _)) => {
                Some(FpErrorCode::DbReadOnlyTransaction)
            }
            _ => None,
        }
    }
}

pub trait FpDbOptionalExtension<T, FpError> {
    fn optional(self) -> Result<Option<T>, FpError>;
}

impl<T> FpDbOptionalExtension<T, FpError> for Result<T, FpError> {
    fn optional(self) -> Result<Option<T>, FpError> {
        match self {
            Ok(v) => Ok(Some(v)),
            Err(e) if e.code() == Some(FpErrorCode::DbDataNotFound) => Ok(None),
            Err(e) => Err(e),
        }
    }
}
