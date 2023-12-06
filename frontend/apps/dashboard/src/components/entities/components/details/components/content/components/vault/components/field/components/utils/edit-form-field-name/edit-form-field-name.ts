import type { DataIdentifier } from '@onefootprint/types';

// Gets the name of the DI without period and characters preceding.
// Avoids the form auto-nesting 'id.first_name' as {id: { first_name: value }}.
// Instead, it'll be stored as {first_name: value}.
const editFormFieldName = (field: DataIdentifier) => field.split('.')[1];

export default editFormFieldName;
