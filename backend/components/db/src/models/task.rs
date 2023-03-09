use chrono::{DateTime, Utc};
use diesel::prelude::*;
use newtypes::{TaskId, TaskStatus};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Queryable)]
#[diesel(table_name = task)]
pub struct Task {
    pub id: TaskId,
    pub created_at: DateTime<Utc>,
    pub _created_at: DateTime<Utc>,
    pub _updated_at: DateTime<Utc>,
    pub scheduled_for: DateTime<Utc>,
    pub task_data: serde_json::Value,
    pub status: TaskStatus,
    pub num_attempts: i32,
}
