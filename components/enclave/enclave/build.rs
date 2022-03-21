// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

fn main() {
    #[cfg(feature = "nitro")]
    println!("cargo:rustc-link-lib=dylib=aws-c-common");
    #[cfg(feature = "nitro")]
    println!("cargo:rustc-link-lib=dylib=aws-nitro-enclaves-sdk-c");
}
