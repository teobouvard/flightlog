use std::fmt::Display;

use chrono::NaiveDate;
use serde::Serialize;

use crate::datetime::Duration;
use crate::igc::{IgcFile, IgcFix};

#[derive(Serialize)]
pub struct Flight {
    pub date: NaiveDate,
    pub track: Vec<IgcFix>,
    pub duration: Duration,
    pub track_duration: Duration,
}

impl Flight {
    pub fn new(track: IgcFile) -> Self {
        Flight {
            date: track.get_date().expect("Missing date header"),
            track: track.fixes.clone(),
            duration: Flight::duration(&track),
            track_duration: track.duration(),
        }
    }

    pub fn duration(track: &IgcFile) -> Duration {
        const MIN_FLYING_SPEED: f32 = 2.0;
        Duration::from_seconds(
            track
                .fixes
                .windows(2)
                .map(|pair| match pair {
                    [a, b] if Flight::speed_on_trajectory(a, b) > MIN_FLYING_SPEED => {
                        (b.ts - a.ts).num_seconds()
                    }
                    _ => 0,
                })
                .sum(),
        )
    }

    pub fn speed_on_trajectory(start: &IgcFix, end: &IgcFix) -> f32 {
        let time = (end.ts - start.ts).num_seconds() as f32;
        let distance_h = Flight::haversine_distance(start, end);
        let distance_v = (end.alt - start.alt).abs() as f32;
        (distance_v * distance_v + distance_h * distance_h) / time
    }

    pub fn haversine_distance(start: &IgcFix, end: &IgcFix) -> f32 {
        const EARTH_RADIUS_METER: f32 = 6_371_000.0;
        let φ1 = start.lat.to_radians();
        let φ2 = end.lat.to_radians();
        let δφ = (end.lat - start.lat).to_radians();
        let δλ = (end.lon - start.lon).to_radians();

        let a = (δφ / 2.0).sin() * (δφ / 2.0).sin()
            + φ1.cos() * φ2.cos() * (δλ / 2.0).sin() * (δλ / 2.0).sin();
        let c = 2.0 * (a.sqrt()).asin();

        EARTH_RADIUS_METER * c
    }
}

impl Display for Flight {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.date)
    }
}
