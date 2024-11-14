use chrono::{DateTime, Utc};
use serde::Serialize;

use crate::hours::MonthlyDuration;

#[derive(Serialize)]
pub struct FlightLogIndexEntry {
    pub date: DateTime<Utc>,
    pub name: String,
    pub duration_s: i64,
}

#[derive(Serialize)]
pub struct FlightLogIndex {
    pub entries: Vec<FlightLogIndexEntry>,
    pub monthly_flight_duration: Vec<MonthlyDuration>,
}
