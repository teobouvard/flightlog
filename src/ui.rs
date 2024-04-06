use std::fs;
use std::io::Write;
use std::path::Path;
use std::{fs::File, io::BufWriter, path::PathBuf};

use chrono::NaiveDate;
use once_cell::sync::Lazy;
use serde::Serialize;
use tera::{Context, Tera};

use crate::flight::Flight;

pub static TEMPLATES: Lazy<Tera> = Lazy::new(|| {
    let mut tera = Tera::new("src/templates/**/*.html").expect("Could not initialize templates");
    tera.autoescape_on(vec![]);
    tera
});

#[derive(Serialize, PartialEq, Eq, PartialOrd, Ord)]
pub struct IndexEntry {
    date: NaiveDate,
    link: PathBuf,
}

impl IndexEntry {
    pub fn new(date: NaiveDate, link: PathBuf) -> Self {
        Self { date, link }
    }
}

#[derive(Serialize)]
pub struct IndexPage {
    pub entries: Vec<IndexEntry>,
}

impl IndexPage {
    pub fn default() -> Self {
        Self { entries: vec![] }
    }

    pub fn render(&mut self, output: &Path) {
        let mut context = Context::new();
        self.entries.reverse();
        context.insert("index", &self);
        let result = TEMPLATES
            .render("index.html", &context)
            .expect("Could not render index template");
        let output_file = output.join("index.html");
        let handle = File::create(output_file).expect("Could not create output file");
        let mut writer = BufWriter::new(handle);
        writer
            .write_all(result.as_bytes())
            .expect("Coult not write rendered template");
    }
}

#[derive(Serialize)]
pub struct FlightPage {
    date_index: i8,
    flight: Flight,
}

impl FlightPage {
    pub fn new(date_index: i8, flight: Flight) -> Self {
        Self { date_index, flight }
    }

    pub fn get_link(&self) -> PathBuf {
        PathBuf::from(format!(
            "{}-{}",
            self.flight.date.format("%Y/%m/%d"),
            self.date_index
        ))
        .with_extension("html")
    }

    pub fn render(&self, output: &Path) {
        let mut context = Context::new();
        context.insert("flight", &self.flight);
        let result = TEMPLATES
            .render("flight.html", &context)
            .expect("Could not render flight template");

        let output_file = output.join(self.get_link());
        fs::create_dir_all(output_file.parent().expect("Invalid directory"))
            .expect("Could not create directory");
        let handle = File::create(&output_file).expect("Could not create output file");
        let mut writer = BufWriter::new(handle);
        writer
            .write_all(result.as_bytes())
            .expect("Coult not write flight page");
    }
}
