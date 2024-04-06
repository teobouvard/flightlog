use serde::Serialize;

pub struct Duration {
    inner: chrono::Duration,
}

impl Duration {
    pub fn new(inner: chrono::Duration) -> Self {
        Self { inner }
    }

    pub fn from_seconds(secs: i64) -> Self {
        Self {
            inner: chrono::Duration::seconds(secs),
        }
    }
}

impl Serialize for Duration {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        let hours = self.inner.num_hours();
        let minutes = self.inner.num_minutes() % 60;
        let seconds = self.inner.num_seconds() % 60;
        serializer.serialize_str(&format!("{hours}h {minutes}m {seconds}s"))
    }
}
