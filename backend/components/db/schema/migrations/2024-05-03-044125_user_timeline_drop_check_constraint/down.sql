ALTER TABLE user_timeline
    ADD CONSTRAINT seqno_not_null CHECK(user_timeline IS NOT NULL) NOT VALID;