use std::{
    fmt::{self, Display},
    fs::File,
    io::{BufRead, BufReader},
};

use chrono::{NaiveDate, NaiveTime};

#[derive(Debug)]
pub enum IgcHeaderEntry {
    Date { date: NaiveDate },
    Unsupported { record: String },
}

#[derive(Debug)]
pub struct IgcFix {
    pub ts: NaiveTime,
    pub lat: f32,
    pub lon: f32,
    pub alt: i32,
}

#[derive(Debug)]
pub struct IgcFile {
    pub header: Vec<IgcHeaderEntry>,
    pub fixes: Vec<IgcFix>,
}

impl Display for IgcFile {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{} fixes", self.fixes.len())
    }
}

fn read_igc_record_h(record: String) -> IgcHeaderEntry {
    let header_subtype = &record[3..6];
    match header_subtype {
        "DTE" => IgcHeaderEntry::Date {
            date: NaiveDate::parse_from_str(&record[7..], "%y%m%d").unwrap_or_else(|err| {
                panic!("Could not parse date from header {}: {}", record, err)
            }),
        },
        _ => IgcHeaderEntry::Unsupported { record },
    }
}

fn read_igc_record_b(record: String) -> IgcFix {
    IgcFix {
        ts: NaiveTime::parse_from_str(&record[1..7], "%H%M%S")
            .unwrap_or_else(|err| panic!("Could not parse timestamp from {}: {}", record, err)),
        lat: 0.0,
        lon: 0.0,
        alt: record[30..35]
            .parse()
            .unwrap_or_else(|err| panic!("Could not parse altitude from {}: {}", record, err)),
    }
}

pub fn read_igc(file: File) -> IgcFile {
    let mut header = vec![];
    let mut fixes = vec![];

    for line in BufReader::new(file).lines() {
        let record = line.expect("Could not read line");
        let record_type = record.chars().next();
        match record_type {
            Some('B') => fixes.push(read_igc_record_b(record)),
            Some('H') => header.push(read_igc_record_h(record)),
            _ => log::debug!("unhandled record {}", record),
        }
    }

    IgcFile { header, fixes }
}
