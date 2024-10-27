use crate::datetime::Duration;

use serde::Serialize;

use crate::ui::FlightlogEntry;

#[derive(Serialize)]
pub struct FlightLog {
    pub entries: Vec<FlightlogEntry>,
}

impl FlightLog {
    pub fn new(entries: Vec<FlightlogEntry>) -> Self {
        Self { entries }
    }

    pub fn get_total_flight_duration(self) -> Duration {
        self.entries.into_iter().map(|e| e.flight.duration).sum()
    }
}
