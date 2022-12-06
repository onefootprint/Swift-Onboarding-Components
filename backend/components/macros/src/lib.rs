use quote::quote;
use syn::{parse_macro_input, ItemFn};

extern crate proc_macro;

#[proc_macro_attribute]
/// Wraps a function that takes in a `TestPgConnection` and turns it into a rust `#[test]` function
/// that takes no arguments with the same name
pub fn db_test(
    _args_stream: proc_macro::TokenStream,
    stream: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let ItemFn {
        attrs,
        vis: _,
        sig,
        block,
    } = parse_macro_input!(stream as ItemFn);

    let stmts = &block.stmts;
    let fn_name = &sig.ident;

    // Wrap the defined function inside of a module. This allows us to create a new test function
    // with the same name as the user-provided function that has the #[test] attribute and proxies
    // execution to the run_test_txn function
    let out = quote! {
        mod #fn_name {
            use super::*;
            #(#attrs)* pub(super) #sig {
                #(#stmts)*
            }
        }

        #[test]
        fn #fn_name() {
            run_test_txn(#fn_name::#fn_name);
        }
    };
    out.into()
}
