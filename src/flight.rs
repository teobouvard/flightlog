use std::fmt::Display;

use chrono::{DateTime, NaiveDate, NaiveDateTime, Utc};
use geojson::GeoJson;
use geojson::Value::LineString;
use serde::Serialize;

use crate::datetime::Duration;
use crate::igc::{IgcFile, IgcFix};

#[derive(Clone, Serialize)]
pub enum TrackState {
    Landed,
    Gliding,
    Climbing,
}

#[derive(Serialize)]
pub struct Flight {
    pub date: NaiveDate,
    pub takeoff: DateTime<Utc>,
    pub geojson: GeoJson,
    pub duration: Duration,
    pub track_duration: Duration,
    pub states: Vec<TrackState>,
}

impl Flight {
    const MIN_FLYING_SPEED: f64 = 2.0;
    pub fn new(track: IgcFile) -> Self {
        Flight {
            date: track.get_date().expect("Missing date header"),
            takeoff: Flight::takeoff(&track),
            geojson: Flight::geojson(&track),
            duration: Flight::duration(&track),
            track_duration: track.duration(),
            states: Flight::states(&track),
        }
    }

    pub fn geojson(track: &IgcFile) -> GeoJson {
        LineString(
            track
                .fixes
                .iter()
                .map(|fix| vec![fix.lon, fix.lat, fix.alt as f64])
                .collect(),
        )
        .into()
    }

    pub fn takeoff(track: &IgcFile) -> DateTime<Utc> {
        DateTime::from_naive_utc_and_offset(
            NaiveDateTime::new(
                track.get_date().unwrap(),
                track
                    .fixes
                    .windows(2)
                    .find_map(|pair| match pair {
                        [a, b] if Flight::speed_on_trajectory(a, b) > Flight::MIN_FLYING_SPEED => {
                            Some(a.ts)
                        }
                        _ => None,
                    })
                    .unwrap_or(track.fixes.first().unwrap().ts),
            ),
            Utc,
        )
    }

    pub fn duration(track: &IgcFile) -> Duration {
        Duration::from_seconds(
            track
                .fixes
                .windows(2)
                .map(|pair| match pair {
                    [a, b] if Flight::speed_on_trajectory(a, b) > Flight::MIN_FLYING_SPEED => {
                        (b.ts - a.ts).num_seconds()
                    }
                    _ => 0,
                })
                .sum(),
        )
    }

    pub fn states(track: &IgcFile) -> Vec<TrackState> {
        let mut altitudes_diff: Vec<i32> = track
            .fixes
            .windows(2)
            .map(|pair| match pair {
                [a, b] => b.alt - a.alt,
                _ => 0,
            })
            .collect::<Vec<_>>();
        altitudes_diff.insert(0, 0);
        altitudes_diff.push(0);

        let mut squared_speeds = track
            .fixes
            .windows(2)
            .map(|pair| match pair {
                [a, b] => Flight::speed_on_trajectory(a, b),
                _ => 0.0,
            })
            .collect::<Vec<_>>();
        squared_speeds.insert(0, 0.0);
        squared_speeds.push(0.0);

        let mut states: Vec<TrackState> = std::iter::repeat(TrackState::Gliding)
            .take(track.fixes.len())
            .collect();

        for (i, _) in track.fixes.iter().enumerate() {
            if altitudes_diff[i] > 0 {
                states[i] = TrackState::Climbing;
            }
            if squared_speeds[i] < 1.0 {
                states[i] = TrackState::Landed;
            }
        }

        states
    }

    pub fn speed_on_trajectory(start: &IgcFix, end: &IgcFix) -> f64 {
        let time = (end.ts - start.ts).num_seconds() as f64;
        let distance_h = start.distance(end);
        let distance_v = (end.alt - start.alt).abs() as f64;
        (distance_v * distance_v + distance_h * distance_h) / time
    }
}

impl Display for Flight {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.date)
    }
}
