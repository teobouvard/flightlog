use std::fs;
use std::io::Write;
use std::path::Path;
use std::{fs::File, io::BufWriter, path::PathBuf};

use serde::Serialize;

use crate::flight::Flight;

#[derive(Serialize)]
pub struct FlightlogEntry {
    pub date_index: i8,
    pub flight: Flight,
}

impl FlightlogEntry {
    pub fn new(date_index: i8, flight: Flight) -> Self {
        Self { date_index, flight }
    }

    pub fn get_filename(&self) -> PathBuf {
        PathBuf::from(format!(
            "{}-{}",
            self.flight.date.format("%Y/%m/%d"),
            self.date_index
        ))
        .with_extension("json")
    }

    pub fn render(&self, output: &Path) {
        let output_file = output.join(self.get_filename());
        fs::create_dir_all(output_file.parent().expect("Invalid directory"))
            .expect("Could not create directory");
        let handle = File::create(&output_file).expect("Could not create output file");
        let mut writer = BufWriter::new(handle);
        writer
            .write_all(
                serde_json::to_string(&self)
                    .expect("Could not serialize flight entry")
                    .as_bytes(),
            )
            .expect("Could not write flight entry");
    }
}
