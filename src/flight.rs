use std::fmt::Display;

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
}

impl Display for Flight {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.date)
    }
}
