-- Drop existing views that may depend on the public schema
DO $$
DECLARE
    SQL text;
BEGIN
    SELECT string_agg('DROP VIEW ' || t.oid::regclass || ';', ' ')
    INTO SQL
    FROM pg_class t
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE t.relkind = 'v'
    AND n.nspname = 'public';

    IF SQL IS NOT NULL THEN
        EXECUTE SQL;
    ELSE
        RAISE NOTICE 'No views found. Nothing dropped.';
    END IF;
END
$$;

-- Drop the classifications table if it already exists
DROP TABLE IF EXISTS public.classifications CASCADE;

-- Create the classifications table
CREATE TABLE classifications (
    id SERIAL PRIMARY KEY,
    classification CHARACTER VARYING UNIQUE NOT NULL,
    count INT NOT NULL
);

-- Insert initial rows into the classifications table
INSERT INTO classifications (classification, count) VALUES ('Protected (Safe)', 0);
INSERT INTO classifications (classification, count) VALUES ('Protected (Other Phishing/Scam API or Project)', 0);
INSERT INTO classifications (classification, count) VALUES ('Phishing/Scam', 0);
INSERT INTO classifications (classification, count) VALUES ('Malware', 0);
INSERT INTO classifications (classification, count) VALUES ('Spam', 0);
INSERT INTO classifications (classification, count) VALUES ('Other', 0);


-- Users Table Creation
DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username CHARACTER VARYING(32) UNIQUE NOT NULL,
    first_name CHARACTER VARYING(64) NOT NULL,
    last_name CHARACTER VARYING(64) NOT NULL,
    email CHARACTER VARYING(256) UNIQUE NOT NULL,
    phone CHARACTER VARYING(16) UNIQUE,
    password CHARACTER VARYING(256) NOT NULL,
    hashed_token CHARACTER VARYING(256),
    created_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL
);

-- Domains Table Creation
DROP TABLE IF EXISTS public.domains CASCADE;
CREATE TABLE public.domains (
    id SERIAL PRIMARY KEY,
    domain CHARACTER VARYING UNIQUE NOT NULL,
    date_reported TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    reported_by INT NOT NULL,
    reason CHARACTER VARYING,
    classification INT NOT NULL,
    record_created_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    record_updated_at TIMESTAMP WITHOUT TIME zone DEFAULT now() NOT NULL,
    CONSTRAINT fk_reported_by_user FOREIGN KEY (reported_by) REFERENCES public.users(id),
    CONSTRAINT fk_items_classification FOREIGN KEY (classification) REFERENCES classifications(id)
);