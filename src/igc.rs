use std::{
    fs::File,
    io::{BufRead, BufReader},
};

use chrono::{NaiveDate, NaiveTime};

#[derive(Debug)]
enum IgcHeaderEntry {
    Date { date: NaiveDate },
    Unsupported { record: String },
}
#[derive(Debug)]
struct IgcHeader {
    date: NaiveDate,
}

#[derive(Debug)]
struct IgcFix {
    ts: NaiveTime,
}

#[derive(Debug)]
pub struct IgcFile {
    header: Vec<IgcHeaderEntry>,
    fixes: Vec<IgcFix>,
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
        ts: NaiveTime::parse_from_str(&record[1..7], "%H%M%S").unwrap_or_else(|err| {
            panic!("Could not parse record timestamp from {}: {}", record, err)
        }),
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
