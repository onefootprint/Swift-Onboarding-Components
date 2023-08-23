
CREATE TABLE zip_code (
        code TEXT NOT NULL PRIMARY KEY, 
        city TEXT NOT NULL, 
        state TEXT, 
        state_code TEXT, 
        latitude double precision NOT NULL, 
        longitude double precision NOT NULL
);