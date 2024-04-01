use std::fmt::Display;

use chrono::NaiveDate;
use serde::Serialize;

use crate::igc::IgcFile;

#[derive(Serialize)]
pub struct Flight {
    pub date: NaiveDate,
}

impl Flight {
    pub fn new(track: IgcFile) -> Self {
        Flight {
            date: track.get_date().expect("Missing date header"),
        }
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string(&self)
    }
}

impl Display for Flight {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.date)
    }
}
