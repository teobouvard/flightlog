use std::{fs::File, path::PathBuf};
mod igc;

use clap::{Parser, Subcommand};
use glob::{glob_with, MatchOptions};

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
        #[arg(value_name = "DIR")]
        input: PathBuf,
    },
}

fn cmd_compile(input: PathBuf) {
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
        let file = File::open(entry.unwrap()).expect("Could not open file");
        let contents = igc::read_igc(file);
        println!("{}", contents);
    }
}

fn main() {
    env_logger::init();
    let args = Args::parse();

    match args.command {
        Some(Commands::Compile { input }) => cmd_compile(input),
        None => panic!("No command provided"),
    }
}
