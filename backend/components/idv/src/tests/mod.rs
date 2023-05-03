pub mod fixtures;

pub fn assert_have_same_elements<T>(l: Vec<T>, r: Vec<T>)
where
    T: Eq + std::fmt::Debug + Clone,
{
    if !(l.iter().all(|i| r.contains(i)) && r.iter().all(|i| l.contains(i)) && l.len() == r.len()) {
        panic!(
            "{}",
            format!("\nleft={:?} does not equal\nright={:?}\n", l.to_vec(), r.to_vec())
        )
    }
}
