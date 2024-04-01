use std::{fs::File, path::PathBuf};
mod flight;
mod igc;

use clap::{Parser, Subcommand};
use glob::{glob_with, MatchOptions};

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
        let output_file = output.join(filename.with_extension("json"));
        flight
            .write_json(output_file)
            .expect("Could not write JSON file");
    }
}

fn main() {
    env_logger::init();
    let args = Args::parse();

    match args.command {
        Some(Commands::Compile { input, output }) => cmd_compile(input, output),
        None => panic!("No command provided"),
    }
}
