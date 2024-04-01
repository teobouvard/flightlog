use std::{
    fmt::Display,
    fs::{self, File},
    io::{self, BufWriter},
    path::PathBuf,
};

use chrono::NaiveDate;
use serde::Serialize;

use crate::igc::{IgcFile, IgcFix};

#[derive(Serialize)]
pub struct Flight {
    pub date: NaiveDate,
    pub points: Vec<IgcFix>,
}

impl Flight {
    pub fn new(track: IgcFile) -> Self {
        Flight {
            date: track.get_date().expect("Missing date header"),
            points: track.fixes,
        }
    }

    pub fn write_json(&self, output: PathBuf) -> io::Result<()> {
        fs::create_dir_all(output.parent().expect("Invalid directory"))?;
        let handle = File::create(output)?;
        let writer = BufWriter::new(handle);
        serde_json::to_writer(writer, self)?;
        Ok(())
    }
}

impl Display for Flight {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.date)
    }
}
