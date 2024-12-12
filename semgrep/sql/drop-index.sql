# ruleid: drop-index
DROP INDEX foo;

# ruleid: drop-index
DROP INDEX
foo;

# ok: drop-index
DROP INDEX CONCURRENTLY foo;

# ok: drop-index
DROP INDEX
   CONCURRENTLY foo;
