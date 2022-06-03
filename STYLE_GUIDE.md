# Style Guide
This is is a living doc that will grow and change us this codebase matures. 
Right now, as we build v1 we're keen on pushing out features and while consistency and style are important, it should be used to make use move 
faster -- not slow us down!

## Code Reviews
At our current stage, code reviews should be primarily focused on:
1. Architecture + Functionality: "does this solve the right problem & is this designed to handle known product behavior" 
2. Correctness: "are there bugs, failure modes, or edge cases that were missed?"

While code-style (consistency & readability) is important it can also be subjective so this guide is here to remove some of that subjectivity. 
So when making style comments, let's make sure they are using our own consistent standards defined below.

## Rust
### Code style
- use `rustfmt`
- use `clippy`
- short files with more modules (folders)
- Functions:
  - try to minimize the number of functions declared outside of impl blocks unless they are standalone business logic (like api handlers)
  - if writing a dangling functions, it should be housed in module that groups common functionality
  - prefer functions implemented on structures/enums instead
  - group functions to common logic structures, for example: `send_email` should be impled on `EmailClient`
  - example: `my_fab_func(&self, thing: &Thing)` vs `my_fab_func(car: &Car, thing: &Thing)`
- APIs:
  - modules separate endpoints
    - module structure mimics url path structure, i.e. `users/biometric` is implemented in `users/biometric.rs`
    - mod.rs houses the route declarations
    - index.rs houses the handler for the root path (if it exists)
    - url paths with multiple subpaths defined in their own folder (i.e. handlers for POST user/biometric/init and POST user/biometric should be written inside user/biometric/init.rs and user/biometric/index.rs, respectively)
  - 1 module for 1 url path segment (multiple http methods in same module)
  - name handlers `[method]`, for example `user::biometric::init::post` corresponds to `POST /user/biometric/init`
  - request/response structs in the same module above the handler or in a `types.rs` if they are going to be used in more places
- Newtypes:
  - anything returned by our API and used inside the Database model should be a Newtype
  - use Newtypes to represent structured primitives (like a String that represents an encrypted token for example)
- Matches:
  - if there are >2 branches use a match, otherwise if/else
  - don't match on primitive types like true/false
- Nested:
  - try to avoid deeply nested logic as it's hard to reason about and read
  - prefer match-guards/if-guards ifs: instead of large if/else blocks, check a condition that returns out early
- Conditions
  - try to avoid conditionals when you can use `.map`/`.ok_or`
- Loops vs Iters
 - Most rust libraries use functional approach of iters to manipulate lists
 - unless too complicated, an iter-approach is preferred 
- Avoid clones where possible
  - less about efficiency, clones make things more verbose
  - prefer to pass in by ref: `&str` and `&[u8]` where possible


## `/infra`
TBD
