use chrono::{DateTime, Utc};
use serde::Serialize;
use std::{
    fs::{self, File},
    io::{BufWriter, Write},
    path::Path,
};

use crate::datetime::Duration;
use crate::ui::FlightlogEntry;

#[derive(Serialize)]
pub struct FlightLogIndexEntry {
    pub date: DateTime<Utc>,
    pub name: String,
}

#[derive(Serialize)]
pub struct FlightLogIndex {
    pub entries: Vec<FlightLogIndexEntry>,
}

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

    pub fn render(&self, output: &Path) {
        let index = FlightLogIndex {
            entries: self
                .entries
                .iter()
                .map(|entry| FlightLogIndexEntry {
                    date: entry.flight.takeoff,
                    name: format!(
                        "{}-{}",
                        entry.flight.date.format("%Y-%m-%d"),
                        entry.date_index
                    ),
                })
                .collect::<Vec<_>>(),
        };
        let output_file = output.join("index.json");
        fs::create_dir_all(output_file.parent().expect("Invalid directory"))
            .expect("Could not create directory");
        let handle = File::create(&output_file).expect("Could not create output file");
        let mut writer = BufWriter::new(handle);
        writer
            .write_all(
                serde_json::to_string(&index)
                    .expect("Could not serialize index")
                    .as_bytes(),
            )
            .expect("Could not write index");
    }
}
