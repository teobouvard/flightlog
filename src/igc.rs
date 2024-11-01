use geo::prelude::*;
use geo::Point;
use std::{
    fmt::{self, Display},
    fs::File,
    io::{BufRead, BufReader},
    num::ParseFloatError,
};

use chrono::{NaiveDate, NaiveTime};
use serde::Serialize;

use crate::datetime::Duration;

#[derive(Debug)]
pub enum IgcHeaderEntry {
    Date { date: NaiveDate },
    Unsupported,
}

#[derive(Debug, Serialize, Clone)]
pub struct IgcFix {
    pub ts: NaiveTime,
    pub lat: f64,
    pub lon: f64,
    pub alt: i32,
}

impl IgcFix {
    pub fn distance(&self, other: &IgcFix) -> f64 {
        Point::new(self.lon, self.lat).haversine_distance(&Point::new(other.lon, other.lat))
    }
}

#[derive(Debug)]
pub struct IgcFile {
    pub header: Vec<IgcHeaderEntry>,
    pub fixes: Vec<IgcFix>,
}

impl IgcFile {
    pub fn new(file: File) -> Self {
        let mut header = vec![];
        let mut fixes = vec![];

        for line in BufReader::new(file).lines() {
            let record = line.expect("Could not read line");
            let record_type = record.chars().next();
            match record_type {
                Some('B') => fixes.push(Self::read_igc_record_b(record)),
                Some('H') => header.push(Self::read_igc_record_h(record)),
                _ => log::debug!("unhandled record {}", record),
            }
        }

        Self { header, fixes }
    }

    pub fn get_date(&self) -> Option<NaiveDate> {
        self.header
            .iter()
            .find_map(|header| match header {
                IgcHeaderEntry::Date { date } => Some(date),
                _ => None,
            })
            .copied()
    }

    pub fn duration(&self) -> Duration {
        Duration::new(self.fixes.last().unwrap().ts - self.fixes.first().unwrap().ts)
    }

    fn read_igc_record_h(record: String) -> IgcHeaderEntry {
        let header_parts = record.split_once(':');
        match header_parts {
            Some(("HFDTEDATE", date)) => IgcHeaderEntry::Date {
                date: NaiveDate::parse_and_remainder(date, "%d%m%y")
                    .unwrap_or_else(|err| {
                        panic!("Could not parse date from header {}: {}", record, err)
                    })
                    .0,
            },
            None => {
                if let Some(date) = record.strip_prefix("HFDTE") {
                    return IgcHeaderEntry::Date {
                        date: NaiveDate::parse_and_remainder(date, "%d%m%y")
                            .unwrap_or_else(|err| {
                                panic!("Could not parse date from header {}: {}", record, err)
                            })
                            .0,
                    };
                } else {
                    IgcHeaderEntry::Unsupported
                }
            }
            _ => IgcHeaderEntry::Unsupported,
        }
    }

    fn read_lat_degrees(record: &str) -> Result<f64, ParseFloatError> {
        let degrees: f64 = record[0..2].parse()?;
        let milliminutes: f64 = record[2..7].parse()?;
        let total_degrees = degrees + (milliminutes / 60_000.0);
        match record.chars().last() {
            Some('N') => Ok(total_degrees),
            Some('S') => Ok(-total_degrees),
            _ => panic!("invalid latitude"),
        }
    }

    fn read_lon_degrees(record: &str) -> Result<f64, ParseFloatError> {
        let degrees: f64 = record[0..3].parse()?;
        let milliminutes: f64 = record[3..8].parse()?;
        let total_degrees = degrees + (milliminutes / 60_000.0);
        match record.chars().last() {
            Some('E') => Ok(total_degrees),
            Some('W') => Ok(-total_degrees),
            _ => panic!("invalid longitude"),
        }
    }

    fn read_igc_record_b(record: String) -> IgcFix {
        IgcFix {
            ts: NaiveTime::parse_from_str(&record[1..7], "%H%M%S")
                .unwrap_or_else(|err| panic!("Could not parse timestamp from {}: {}", record, err)),
            lat: Self::read_lat_degrees(&record[7..15])
                .unwrap_or_else(|err| panic!("Could not parse latitude from {}: {}", record, err)),
            lon: Self::read_lon_degrees(&record[15..24])
                .unwrap_or_else(|err| panic!("Could not parse longitude from {}: {}", record, err)),
            alt: record[30..35]
                .parse()
                .unwrap_or_else(|err| panic!("Could not parse altitude from {}: {}", record, err)),
        }
    }
}

impl Display for IgcFile {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} fixes", self.fixes.len())
    }
}
