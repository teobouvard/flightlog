use std::{
    fs::{self, File},
    io::{BufWriter, Write},
    path::PathBuf,
};
mod flight;
mod igc;

use clap::{Parser, Subcommand};
use glob::{glob_with, MatchOptions};
use tera::{Context, Tera};

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
    let mut tera = Tera::new("src/templates/**/*.html").expect("Could not initialize templates");
    tera.autoescape_on(vec![]);

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
        let mut context = Context::new();
        context.insert("data", &flight.to_json().expect("Could not write JSON"));
        let result = tera
            .render("flight.html", &context)
            .expect("Could not render template");
        let output_file = output.join(filename.with_extension("html"));
        fs::create_dir_all(output_file.parent().expect("Invalid directory"))
            .expect("Could not create directory");
        let handle = File::create(output_file).expect("Could not create output file");
        let mut writer = BufWriter::new(handle);
        writer
            .write_all(result.as_bytes())
            .expect("Coult not write rendered template");
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
