use std::{fs::File, path::PathBuf};
mod igc;

use clap::Parser;

#[derive(Parser, Debug)]
#[command(version)]
struct Args {
    /// Input IGC file
    #[arg(value_name = "FILE")]
    input: PathBuf,
}

fn main() {
    env_logger::init();
    let args = Args::parse();

    let file = File::open(args.input).expect("Could not find input file");
    let contents = igc::read_igc(file);
    println!("{}", contents);
}
