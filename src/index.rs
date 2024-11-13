use chrono::{DateTime, Utc};
use serde::Serialize;

#[derive(Serialize)]
pub struct FlightLogIndexEntry {
    pub date: DateTime<Utc>,
    pub name: String,
    pub duration_s: i64,
}

#[derive(Serialize)]
pub struct FlightLogIndex {
    pub entries: Vec<FlightLogIndexEntry>,
}
