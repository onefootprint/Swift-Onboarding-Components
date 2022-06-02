alter table tenants add required_data data_kind[] not null default ARRAY[
    'FirstName', 
    'LastName', 
    'Dob', 
    'Ssn', 
    'StreetAddress', 
    'StreetAddress2', 
    'City', 
    'State', 
    'Zip', 
    'Country', 
    'Email', 
    'PhoneNumber']::data_kind[];