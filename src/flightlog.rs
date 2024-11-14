use chrono::Datelike;
use serde::Serialize;

use crate::{
    datetime::Duration,
    entry::FlightlogEntry,
    hours::{MonthlyDuration, YearMonth},
    index::{FlightLogIndex, FlightLogIndexEntry},
};
use std::{
    collections::HashMap,
    fs::{self, File},
    io::{BufWriter, Write},
    path::Path,
};

#[derive(Serialize)]
pub struct FlightLog {
    pub entries: Vec<FlightlogEntry>,
}

impl FlightLog {
    pub fn new(entries: Vec<FlightlogEntry>) -> Self {
        Self { entries }
    }

    pub fn get_total_flight_duration(&self) -> Duration {
        self.entries.iter().map(|e| e.flight.duration).sum()
    }

    pub fn get_flight_duration_by_month(entries: &Vec<FlightlogEntry>) -> Vec<MonthlyDuration> {
        let mut monthly_hours: HashMap<YearMonth, Duration> = HashMap::new();

        for entry in entries {
            let key = YearMonth {
                year: entry.flight.date.year(),
                month: entry.flight.date.month(),
            };
            let duration = entry.flight.duration;
            *monthly_hours.entry(key).or_insert(Duration::zero()) += duration;
        }

        let mut durations = monthly_hours
            .into_iter()
            .map(|(period, duration)| MonthlyDuration {
                period,
                seconds: duration.to_seconds(),
            })
            .collect::<Vec<_>>();

        durations.sort_by_key(|k| k.period);
        durations
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
                    duration_s: entry.flight.duration.to_seconds(),
                })
                .collect::<Vec<_>>(),
            monthly_flight_duration: FlightLog::get_flight_duration_by_month(&self.entries),
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
