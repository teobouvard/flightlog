use serde::Serialize;

#[derive(Serialize, Copy, Clone, PartialOrd, Ord, Eq, Hash, PartialEq)]
pub struct YearMonth {
    pub year: i32,
    pub month: u32,
}

#[derive(Serialize)]
pub struct MonthlyDuration {
    pub period: YearMonth,
    pub seconds: i64,
}
