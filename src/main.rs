mod datetime;
mod flight;
mod flightlog;
mod igc;
mod ui;
use log::info;

use std::fs::File;
use std::path::PathBuf;

use chrono::NaiveDate;
use clap::{Parser, Subcommand};
use flightlog::FlightLog;
use glob::{glob_with, MatchOptions};
use ui::FlightlogEntry;

use crate::{flight::Flight, igc::IgcFile};

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
    let mut date_current = NaiveDate::default();
    let mut date_index = 0;
    let mut flights: Vec<FlightlogEntry> = vec![];

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
        info!("Processing {}", filename.display());
        let file = File::open(&filename).expect("Could not open file");

        let flight = Flight::new(IgcFile::new(file));
        if flight.date == date_current {
            date_index += 1;
        } else {
            date_current = flight.date;
            date_index = 0;
        }
        let entry = FlightlogEntry::new(date_index, flight);
        entry.render(&output);
        flights.push(entry);
    }

    let flightlog = FlightLog::new(flights);
    flightlog.render(&output);
    info!(
        "Total duration: {}",
        flightlog.get_total_flight_duration().to_seconds()
    );
}

fn main() {
    env_logger::init();
    let args = Args::parse();

    match args.command {
        Some(Commands::Compile { input, output }) => cmd_compile(input, output),
        None => panic!("No command provided"),
    }
}
