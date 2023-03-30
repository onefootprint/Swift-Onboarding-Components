use proc_macro::TokenStream;
use quote::quote;
use syn::spanned::Spanned;
use syn::{parse_macro_input, ItemFn, Meta};
use syn::{parse_quote, AttributeArgs};
use test_case_core::TestCase;

extern crate proc_macro;

#[proc_macro_attribute]
/// Wraps a function that takes in a `TestPgConnection` and turns it into a rust `#[test]` function
/// that takes no arguments with the same name
pub fn db_test(args: proc_macro::TokenStream, stream: proc_macro::TokenStream) -> proc_macro::TokenStream {
    let ItemFn {
        attrs,
        vis: _,
        sig,
        block,
    } = parse_macro_input!(stream as ItemFn);

    let args = parse_macro_input!(args as AttributeArgs);

    let retain = if let Some(a) = args.first() {
        matches!(a, syn::NestedMeta::Meta(Meta::Path(nv)) if nv.is_ident("retain"))
    } else {
        false
    };

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
            run_test_txn(#fn_name::#fn_name, #retain);
        }
    };
    out.into()
}

#[proc_macro_attribute]
#[proc_macro_error::proc_macro_error]
/// Wraps a function that takes in a `TestPgConn` and parameterizes it with the given set of data.
///
/// In general, db_test_case consists of four elements:
///
/// 1. _(Required)_ Arguments passed to test body
/// 2. _(Optional)_ Expected result
/// 3. _(Optional)_ Test case description
/// 4. _(Required)_ Test body
///
///  When _expected result_ is provided, it is compared against the actual value generated with _test body_ using `assert_eq!`.
/// _Test cases_ that don't provide _expected result_ should contain custom assertions within _test body_ or return `Result` similar to `#[test]` macro.
pub fn db_test_case(
    args: proc_macro::TokenStream,
    input: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    // Most of this is copy-paste from the test-case-macros crate. We just have our own method
    // to render the db test cases
    let test_case = parse_macro_input!(args as TestCase);
    let mut item = parse_macro_input!(input as ItemFn);

    // This is a trick to provide attribute-proc-macro-like syntax for every test case.
    // In the first invocation of db_test_case, extract all other #[db_test_case(...)] attributes
    // and parse them
    let mut test_cases = vec![test_case];
    let mut attrs_to_remove = vec![];
    let legal_test_case_names = [parse_quote!(db_test_case), parse_quote!(macros::db_test_case)];

    for (idx, attr) in item.attrs.iter().enumerate() {
        if legal_test_case_names.contains(&attr.path) {
            let test_case = match attr.parse_args::<TestCase>() {
                Ok(test_case) => test_case,
                Err(err) => {
                    return syn::Error::new(
                        attr.span(),
                        format!("cannot parse db_test_case arguments: {err}"),
                    )
                    .to_compile_error()
                    .into()
                }
            };
            test_cases.push(test_case);
            attrs_to_remove.push(idx);
        }
    }

    // Remove the other invocations of db_test_case in the attributes for the test function
    for i in attrs_to_remove.into_iter().rev() {
        item.attrs.swap_remove(i);
    }

    render_db_test_cases(&test_cases, item)
}

#[allow(unused_mut)]
fn render_db_test_cases(test_cases: &[TestCase], mut test_fn: ItemFn) -> TokenStream {
    // Extract the first input to the test function, assuming it is the &mut TestPgConnection.
    // This value doesn't need to be provided by each TestCase since we will populate it ourselves
    let span = test_fn.sig.inputs.span();
    let err = syn::Error::new(span, "First db_test_case arg must be an &mut TestPgConn")
        .to_compile_error()
        .into();
    let mut inputs_iter = test_fn.sig.inputs.into_iter();
    let Some(conn_input) = inputs_iter.next() else {
        return err;
    };
    test_fn.sig.inputs = inputs_iter.collect();

    // Render each test case to call the test_fn with the provided argument
    let mut rendered_test_cases = vec![];
    for test_case in test_cases {
        rendered_test_cases.push(test_case.render(test_fn.clone()));
    }

    let test_fn_sig = test_fn.sig.clone();
    let test_fn_stmts = test_fn.block.stmts;
    let mod_name = test_fn.sig.ident;

    let output = quote! {
        // This function will be called by each individual test case and wraps the test_fn_stmts
        // inside a closure that also accepts the conn as an argument
        #test_fn_sig {
            run_test_txn(move |#conn_input| {
                #(#test_fn_stmts)*
            }, false)
        }

        #[cfg(test)]
        mod #mod_name {
            #[allow(unused_imports)]
            use super::*;

            #(#rendered_test_cases)*
        }
    };

    output.into()
}

#[proc_macro_attribute]
/// Wraps a function that takes in a `TestDbPool` and turns it into a rust `#[test]` function
/// that takes no arguments with the same name
pub fn test_db_pool(
    args: proc_macro::TokenStream,
    stream: proc_macro::TokenStream,
) -> proc_macro::TokenStream {
    let ItemFn {
        attrs,
        vis: _,
        sig,
        block,
    } = parse_macro_input!(stream as ItemFn);
    let args = parse_macro_input!(args as AttributeArgs);

    let retain = if let Some(a) = args.first() {
        matches!(a, syn::NestedMeta::Meta(Meta::Path(nv)) if nv.is_ident("retain"))
    } else {
        false
    };

    let stmts = &block.stmts;
    let fn_name = &sig.ident;

    let out = quote! {
        mod #fn_name {
            use super::*;
            #(#attrs)* pub(super) #sig {
                #(#stmts)*
            }
        }

        #[tokio::test]
        async fn #fn_name() {
            let test_db_pool = TestDbPool::new(#retain);
            #fn_name::#fn_name(test_db_pool).await;
        }
    };
    out.into()
}
