mod datetime;
mod flight;
mod igc;
mod ui;

use std::fs::File;
use std::path::PathBuf;

use chrono::NaiveDate;
use clap::{Parser, Subcommand};
use glob::{glob_with, MatchOptions};
use ui::{FlightPage, IndexEntry};

use crate::{flight::Flight, igc::IgcFile, ui::IndexPage};

#[derive(Parser)]
#[command(version, arg_required_else_help = true)]
struct Args {
    #[command(subcommand)]
    command: Option<Commands>,
}

#[derive(Subcommand, Clone)]
enum Commands {
    /// Compile tracklogs into JSON flight collection
    Compile {
        /// Input directory containing IGC files
        #[arg(value_name = "IGC_DIR")]
        input: PathBuf,

        /// Output directory
        #[arg(short, long, value_name = "JSON_DIR")]
        output: PathBuf,
    },
}

fn cmd_compile(input: PathBuf, output: PathBuf) {
    let mut index = IndexPage::default();
    let mut date_current = NaiveDate::default();
    let mut date_index = 0;

    for entry in glob_with(
        input
            .join("**/*.igc")
            .to_str()
            .expect("Invalid input directory"),
        MatchOptions {
            case_sensitive: false,
            ..Default::default()
        },
    )
    .expect("Invalid search pattern")
    {
        let filename = entry.unwrap();
        let file = File::open(&filename).expect("Could not open file");

        let flight = Flight::new(IgcFile::new(file));
        if flight.date == date_current {
            date_index += 1;
        } else {
            date_current = flight.date;
            date_index = 0;
        }
        let page = FlightPage::new(date_index, flight);
        page.render(&output);

        let entry = IndexEntry::new(date_current, page.get_link());
        index.entries.push(entry);
    }

    index.render(&output);
}

fn main() {
    env_logger::init();
    let args = Args::parse();

    match args.command {
        Some(Commands::Compile { input, output }) => cmd_compile(input, output),
        None => panic!("No command provided"),
    }
}
