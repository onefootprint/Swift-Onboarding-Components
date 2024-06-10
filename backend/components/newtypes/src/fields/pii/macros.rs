#[macro_export]
/// quickly define pii
macro_rules! pii {
    ($lit:expr) => {
        PiiString::from($lit)
    };
}

#[macro_export]
/// quickly format pii
macro_rules! format_pii {
        ($f: tt, $($valn:expr),*) => {
            PiiString::from(format!($f, $($valn.leak(),)*))
        };
    }

pub use {
    format_pii,
    pii,
};

#[cfg(test)]
mod tests {
    use super::super::PiiString;

    #[test]
    fn test_pii_macros() {
        assert_eq!(pii!("hi").leak(), "hi");

        let hello = pii!("hello");
        let world = pii!("world");
        let hello2 = format_pii!("world {}", hello);
        assert_eq!(hello2.leak(), "world hello");
        let hello_world = format_pii!("message = {},{}", hello, world);
        assert_eq!(hello_world.leak(), "message = hello,world");
    }
}
