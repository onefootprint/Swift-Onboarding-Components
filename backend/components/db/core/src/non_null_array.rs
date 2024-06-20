use diesel::sql_types::Array;
use diesel::sql_types::Nullable;
use diesel::Queryable;

/// In postgres, all Array fields can have null values.
/// In practice, most things in our application don't want arrays with null values. For fields
/// where we use Vec<T> instead of Vec<Option<T>>, we'll never write null values and want to only
/// read non-null values.
/// This util can be used to deserialize postgres's Arrays of nullable T into a normal Vec<T>.
/// This should be used on the Queryable model as a field-level attribute on your Vec<T>. For
/// example:
/// ```ignore
/// #[derive(Queryable)]
/// #[diesel(table_name = my_model)]
/// pub struct MyModel {
///     #[diesel(deserialize_as = NonNullVec<String>)]
///     pub my_field: Vec<String>,
/// }
/// ```
/// Note, only in diesel_cli 2.0.0 did diesel start correctly representing these fields in schema.rs
/// as Array<Nullable<T>>.
/// https://diesel.rs/guides/migration_guide.html#2-0-0-nullability-of-array-elements
pub struct NonNullVec<T>(Vec<T>);

impl<DB, T, DT> Queryable<Array<Nullable<DT>>, DB> for NonNullVec<T>
where
    DB: diesel::backend::Backend,
    Vec<Option<T>>: diesel::deserialize::FromSql<Array<Nullable<DT>>, DB>,
{
    type Row = Vec<Option<T>>;

    fn build(s: Vec<Option<T>>) -> diesel::deserialize::Result<Self> {
        let s = s
            .into_iter()
            .map(|s| -> diesel::deserialize::Result<_> { s.ok_or(Box::new(NullValueInArray)) })
            .collect::<diesel::deserialize::Result<Vec<T>>>()?;
        Ok(Self(s))
    }
}

impl<T> From<NonNullVec<T>> for Vec<T> {
    fn from(value: NonNullVec<T>) -> Self {
        value.0
    }
}

/// Same as NonNullVec, but for an optional Vec
/// In postgres, all Array fields can have null values.
/// In practice, most things in our application don't want arrays with null values. For fields
/// where we use Vec<T> instead of Vec<Option<T>>, we'll never write null values and want to only
/// read non-null values.
/// This util can be used to deserialize postgres's Arrays of nullable T into a normal Vec<T>.
/// This should be used on the Queryable model as a field-level attribute on your Vec<T>. For
/// example:
/// ```ignore
/// #[derive(Queryable)]
/// #[diesel(table_name = my_model)]
/// pub struct MyModel {
///     #[diesel(deserialize_as = OptionalNonNullVec<String>)]
///     pub my_field: Option<Vec<String>>,
/// }
/// ```
pub struct OptionalNonNullVec<T>(Option<NonNullVec<T>>);

impl<DB, T, DT: 'static> Queryable<Nullable<Array<Nullable<DT>>>, DB> for OptionalNonNullVec<T>
where
    DB: diesel::backend::Backend,
    Vec<Option<T>>: diesel::deserialize::FromSql<Array<Nullable<DT>>, DB>,
{
    type Row = Option<Vec<Option<T>>>;

    fn build(s: Option<Vec<Option<T>>>) -> diesel::deserialize::Result<Self> {
        let Some(s) = s else {
            return Ok(Self(None));
        };
        let result = <NonNullVec<T> as Queryable<Array<Nullable<DT>>, DB>>::build(s)?;
        Ok(Self(Some(result)))
    }
}

impl<T> From<OptionalNonNullVec<T>> for Option<Vec<T>> {
    fn from(value: OptionalNonNullVec<T>) -> Self {
        value.0.map(|x| x.into())
    }
}

/// Expected more fields then present in the current row while deserializing results
#[derive(Debug, Clone, Copy)]
pub struct NullValueInArray;

impl std::fmt::Display for NullValueInArray {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Unexpected end of row")
    }
}

impl std::error::Error for NullValueInArray {}
