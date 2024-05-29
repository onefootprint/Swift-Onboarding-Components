use image::{
    self,
    ImageOutputFormat,
};
use newtypes::{
    Base64Data,
    Base64EncodedString,
};
use std::io::Cursor;

/// All images are assumed to be in `./images/ and are jpgs`
#[allow(unused)]
pub fn load_image_and_encode_as_b64(path: &str) -> Base64EncodedString {
    let image_dir = std::fs::canonicalize("./src/tests/fixtures/images").unwrap();
    let path = image_dir.join(std::path::Path::new(path));
    let base_img = image::open(path).expect("could not open image");
    let mut image_data: Vec<u8> = Vec::new();
    base_img
        .write_to(&mut Cursor::new(&mut image_data), ImageOutputFormat::Jpeg(100))
        .unwrap();

    Base64Data::into_string_standard(image_data)
}
