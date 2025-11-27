--
-- PostgreSQL database cluster dump
--

-- Started on 2025-11-26 22:24:04

\restrict 4BcZgL7yYXCOZFfE87udFqudLULbzEMVhJbwbXOaEhfhnxxxoXjjkdg4UsKCfwF

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE anon;
ALTER ROLE anon WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE authenticated;
ALTER ROLE authenticated WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE authenticator;
ALTER ROLE authenticator WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:K0XiXva+N5dNvgFp6WVLqQ==$PWF5SCNwqQxNXtvjjs4IKB6bdxkUk5gu2zOphzXJxZk=:F5h5K5QnqqU9BP81FhSvajvdks/jY+vMCktY8uWgAWc=';
CREATE ROLE dashboard_user;
ALTER ROLE dashboard_user WITH NOSUPERUSER INHERIT CREATEROLE CREATEDB NOLOGIN REPLICATION NOBYPASSRLS;
CREATE ROLE pgbouncer;
ALTER ROLE pgbouncer WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:l4cSyliC3ZxkiHIsPE9LXQ==$GY5iprnWIipWbCA965yQTOH14lBCsQqMP7t7+7sHjWA=:H1zJVtz7cN3WwYtRPGVByPnxPhFltQktD2WK5jpsezM=';
CREATE ROLE postgres;
ALTER ROLE postgres WITH NOSUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:iVNmPH7qBA7xq1QhFb7vBA==$D15uPDrZbpthLvWs7NreYHatjmdwll1ynEBpAlg166Q=:k3dcpBn1+kn8nhbhO0Ui8OloMBhNpRJNIgx1OwIYu8U=';
CREATE ROLE service_role;
ALTER ROLE service_role WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION BYPASSRLS;
CREATE ROLE supabase_admin;
ALTER ROLE supabase_admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:A92zz+rehRR1bECkVipNiw==$gfkQowYntSiJklDwaUjW+KO40csMWalrdU09Kstt9ww=:aH+ovCtuTKNRnxujQoMBpH95X5fJ4bl5T5LRn3S4NgA=';
CREATE ROLE supabase_auth_admin;
ALTER ROLE supabase_auth_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:sqMVTl9aLgHEir9zU+43dA==$OxHQHi0UrL8INKzIpXgAMsDSHfPOSNmCYR7Hf4dLixI=:FbwajVj8nF4Ky1y7mWWMxsDmkgGvPDuylvcUc8+JXOc=';
CREATE ROLE supabase_etl_admin;
ALTER ROLE supabase_etl_admin WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN REPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:48lZ8I8MLNJRhDPujJQqzw==$WDBiStkEHGIar9qea7oKYDwJnCGlt1x9FdkkEXIC/5g=:VHX2x9bnXapTmrPhItjk0yrPaNfyvAEDVZEmvVtQYp8=';
CREATE ROLE supabase_read_only_user;
ALTER ROLE supabase_read_only_user WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN NOREPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:qOuYXBifWLdUYBFGEU1JTQ==$28CaaARfukrqdm+rIK7Al9RTFc1tfp2MkNUjjOeJrP0=:2o/gf/0NTZCa6VRAUm56BSO5y3syvkz2y99sp9i58g4=';
CREATE ROLE supabase_realtime_admin;
ALTER ROLE supabase_realtime_admin WITH NOSUPERUSER NOINHERIT NOCREATEROLE NOCREATEDB NOLOGIN NOREPLICATION NOBYPASSRLS;
CREATE ROLE supabase_replication_admin;
ALTER ROLE supabase_replication_admin WITH NOSUPERUSER INHERIT NOCREATEROLE NOCREATEDB LOGIN REPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:wCq/1ucIFaDDuwppuo38QA==$0F1aO6QCWQnFwY6oGcutzXjiN2LUHzkzwkhhuHXeGy0=:sTuXJHpfZO4Gk0kS7ONwvShozzQut8eOUD8Qi4GIKr8=';
CREATE ROLE supabase_storage_admin;
ALTER ROLE supabase_storage_admin WITH NOSUPERUSER NOINHERIT CREATEROLE NOCREATEDB LOGIN NOREPLICATION NOBYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:gtahgpc/IvGsXV71qGgpsg==$++rLiqgBRoBW06wczH3G5/gSORLv5WHT5IYiURAurxw=:6mI2lgbEYn0MVB0iADKLrrJt40VVrsUGc/h5d8sBy60=';

--
-- User Configurations
--

--
-- User Config "anon"
--

ALTER ROLE anon SET statement_timeout TO '3s';

--
-- User Config "authenticated"
--

ALTER ROLE authenticated SET statement_timeout TO '8s';

--
-- User Config "authenticator"
--

ALTER ROLE authenticator SET session_preload_libraries TO 'safeupdate';
ALTER ROLE authenticator SET statement_timeout TO '8s';
ALTER ROLE authenticator SET lock_timeout TO '8s';

--
-- User Config "postgres"
--

ALTER ROLE postgres SET search_path TO E'\\$user', 'public', 'extensions';

--
-- User Config "supabase_admin"
--

ALTER ROLE supabase_admin SET search_path TO '$user', 'public', 'auth', 'extensions';
ALTER ROLE supabase_admin SET log_statement TO 'none';

--
-- User Config "supabase_auth_admin"
--

ALTER ROLE supabase_auth_admin SET search_path TO 'auth';
ALTER ROLE supabase_auth_admin SET idle_in_transaction_session_timeout TO '60000';
ALTER ROLE supabase_auth_admin SET log_statement TO 'none';

--
-- User Config "supabase_read_only_user"
--

ALTER ROLE supabase_read_only_user SET default_transaction_read_only TO 'on';

--
-- User Config "supabase_storage_admin"
--

ALTER ROLE supabase_storage_admin SET search_path TO 'storage';
ALTER ROLE supabase_storage_admin SET log_statement TO 'none';


--
-- Role memberships
--

GRANT anon TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT anon TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticated TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT authenticated TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticator TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT authenticator TO supabase_storage_admin WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT pg_create_subscription TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_monitor TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_monitor TO supabase_etl_admin WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_monitor TO supabase_read_only_user WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO supabase_etl_admin WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_read_all_data TO supabase_read_only_user WITH INHERIT TRUE GRANTED BY supabase_admin;
GRANT pg_signal_backend TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT service_role TO authenticator WITH INHERIT FALSE GRANTED BY supabase_admin;
GRANT service_role TO postgres WITH ADMIN OPTION, INHERIT TRUE GRANTED BY supabase_admin;
GRANT supabase_realtime_admin TO postgres WITH INHERIT TRUE GRANTED BY supabase_admin;






\unrestrict 4BcZgL7yYXCOZFfE87udFqudLULbzEMVhJbwbXOaEhfhnxxxoXjjkdg4UsKCfwF

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict XgS0RB1odcZAjHbwg7BHWkktkTyMTbjHrhcQG0W2YecWI91vl8ctKFt8tkOupd2

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-26 22:24:11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Completed on 2025-11-26 22:24:29

--
-- PostgreSQL database dump complete
--

\unrestrict XgS0RB1odcZAjHbwg7BHWkktkTyMTbjHrhcQG0W2YecWI91vl8ctKFt8tkOupd2

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict Bc5pYVO33JyJp6ZrMFCcERfGN4itgj6IQ2fBoxNwiHryEUB68vo0WybrSHpGkGR

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-26 22:24:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 37 (class 2615 OID 16494)
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- TOC entry 23 (class 2615 OID 16388)
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- TOC entry 35 (class 2615 OID 16624)
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- TOC entry 34 (class 2615 OID 16613)
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- TOC entry 12 (class 2615 OID 16386)
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- TOC entry 13 (class 2615 OID 16605)
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- TOC entry 38 (class 2615 OID 16542)
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- TOC entry 32 (class 2615 OID 16653)
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- TOC entry 6 (class 3079 OID 16689)
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- TOC entry 4774 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- TOC entry 2 (class 3079 OID 16389)
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- TOC entry 4775 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- TOC entry 4 (class 3079 OID 16443)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- TOC entry 4776 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- TOC entry 5 (class 3079 OID 16654)
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- TOC entry 4777 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- TOC entry 3 (class 3079 OID 16432)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- TOC entry 4778 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1234 (class 1247 OID 16784)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- TOC entry 1258 (class 1247 OID 16925)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- TOC entry 1231 (class 1247 OID 16778)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1228 (class 1247 OID 16773)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1276 (class 1247 OID 17028)
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1288 (class 1247 OID 17101)
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1270 (class 1247 OID 17006)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1279 (class 1247 OID 17038)
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1264 (class 1247 OID 16967)
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1318 (class 1247 OID 17312)
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- TOC entry 1309 (class 1247 OID 17272)
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- TOC entry 1312 (class 1247 OID 17287)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- TOC entry 1324 (class 1247 OID 17358)
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- TOC entry 1321 (class 1247 OID 17325)
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- TOC entry 1303 (class 1247 OID 17241)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- TOC entry 472 (class 1255 OID 16540)
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- TOC entry 4779 (class 0 OID 0)
-- Dependencies: 472
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 480 (class 1255 OID 16755)
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- TOC entry 425 (class 1255 OID 16539)
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- TOC entry 4782 (class 0 OID 0)
-- Dependencies: 425
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 446 (class 1255 OID 16538)
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- TOC entry 4784 (class 0 OID 0)
-- Dependencies: 446
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 511 (class 1255 OID 16597)
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- TOC entry 4800 (class 0 OID 0)
-- Dependencies: 511
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 491 (class 1255 OID 16618)
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- TOC entry 4802 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 461 (class 1255 OID 16599)
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- TOC entry 4804 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 419 (class 1255 OID 16609)
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- TOC entry 528 (class 1255 OID 16610)
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- TOC entry 432 (class 1255 OID 16620)
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 432
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 474 (class 1255 OID 16387)
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- TOC entry 489 (class 1255 OID 29913)
-- Name: calculate_capipoints(integer, text, integer, numeric); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_capipoints(duration_seconds integer, activity_type text, calories integer, distance_meters numeric) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    duration_min numeric;
    intensity_factor numeric;
    steps_est numeric;
    base_cp numeric;
BEGIN
    duration_min := duration_seconds / 60.0;
    
    -- Determine Intensity Factor
    CASE 
        WHEN activity_type ILIKE '%crossfit%' OR activity_type ILIKE '%hiit%' THEN intensity_factor := 1.5;
        WHEN activity_type ILIKE '%run%' OR activity_type ILIKE '%cycling%' THEN intensity_factor := 1.4;
        WHEN activity_type ILIKE '%weightlifting%' OR activity_type ILIKE '%strength%' THEN intensity_factor := 1.2;
        WHEN activity_type ILIKE '%yoga%' OR activity_type ILIKE '%pilates%' THEN intensity_factor := 0.8;
        WHEN activity_type ILIKE '%walk%' THEN intensity_factor := 0.5;
        ELSE intensity_factor := 1.0;
    END CASE;

    -- Estimate steps if not provided (simplified logic)
    IF activity_type ILIKE '%run%' OR activity_type ILIKE '%walk%' THEN
        -- Approx 1000 steps per km
        steps_est := (distance_meters / 1000.0) * 1000; 
    ELSE
        steps_est := 0;
    END IF;

    -- Formula: (Duration_min * Intensity) + (Calories / 10) + (Steps / 100)
    base_cp := (duration_min * intensity_factor) + (COALESCE(calories, 0) / 10.0) + (steps_est / 100.0);
    
    RETURN ROUND(base_cp, 2);
END;
$$;


ALTER FUNCTION public.calculate_capipoints(duration_seconds integer, activity_type text, calories integer, distance_meters numeric) OWNER TO postgres;

--
-- TOC entry 426 (class 1255 OID 29914)
-- Name: calculate_final_xp(numeric, numeric, timestamp with time zone, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_final_xp(base_cp numeric, trust_score numeric, workout_date timestamp with time zone, activity_type text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    final_xp numeric;
    multiplier numeric := 1.0;
    dow integer;
BEGIN
    -- Apply Trust Score
    final_xp := base_cp * trust_score;

    -- Apply Behavioral Multipliers
    
    -- Weekend Warrior (Sat=6, Sun=0)
    dow := EXTRACT(DOW FROM workout_date);
    IF dow = 0 OR dow = 6 THEN
        multiplier := multiplier + 0.10; -- +10%
    END IF;

    -- Leg Day Bonus
    IF activity_type ILIKE '%leg%' OR activity_type ILIKE '%perna%' OR activity_type ILIKE '%squat%' THEN
        multiplier := multiplier + 0.20; -- +20%
    END IF;

    -- Apply Multiplier
    final_xp := final_xp * multiplier;

    -- Cap for manual entries (Trust Score <= 0.5)
    IF trust_score <= 0.5 AND final_xp > 500 THEN
        final_xp := 500;
    END IF;

    RETURN FLOOR(final_xp)::integer;
END;
$$;


ALTER FUNCTION public.calculate_final_xp(base_cp numeric, trust_score numeric, workout_date timestamp with time zone, activity_type text) OWNER TO postgres;

--
-- TOC entry 531 (class 1255 OID 29940)
-- Name: calculate_level(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_level(xp integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Simple formula: Level = sqrt(XP / 100)
    -- Example: 100 XP = Lvl 1, 400 XP = Lvl 2, 2500 XP = Lvl 5, 10000 XP = Lvl 10
    IF xp < 100 THEN RETURN 1; END IF;
    RETURN FLOOR(SQRT(xp / 100.0));
END;
$$;


ALTER FUNCTION public.calculate_level(xp integer) OWNER TO postgres;

--
-- TOC entry 452 (class 1255 OID 20159)
-- Name: calculate_session_duration(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_session_duration() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Se ended_at está sendo definido, calcular duration_seconds
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at))::INTEGER;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.calculate_session_duration() OWNER TO postgres;

--
-- TOC entry 444 (class 1255 OID 17869)
-- Name: client_has_professional_access(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.client_has_professional_access(professional_uuid uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.client_professionals 
    WHERE client_id = auth.uid() 
    AND professional_id = professional_uuid 
    AND status = 'active'
  );
END;
$$;


ALTER FUNCTION public.client_has_professional_access(professional_uuid uuid) OWNER TO postgres;

--
-- TOC entry 529 (class 1255 OID 22754)
-- Name: count_total_unread_messages(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.count_total_unread_messages(user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  total_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count
  FROM public.chat_messages
  WHERE receiver_id = user_id AND is_read = false;

  RETURN COALESCE(total_count, 0);
END;
$$;


ALTER FUNCTION public.count_total_unread_messages(user_id uuid) OWNER TO postgres;

--
-- TOC entry 542 (class 1255 OID 22615)
-- Name: count_unread_messages(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.count_unread_messages(user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.chat_messages
  WHERE receiver_id = user_id AND is_read = false;
  
  RETURN COALESCE(unread_count, 0);
END;
$$;


ALTER FUNCTION public.count_unread_messages(user_id uuid) OWNER TO postgres;

--
-- TOC entry 468 (class 1255 OID 19663)
-- Name: find_client_by_email(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.find_client_by_email(client_email text) RETURNS TABLE(id uuid, email text, full_name text, role text, created_at timestamp with time zone, existing_link_id uuid, existing_link_status text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar se o usuário atual é profissional ou admin
  IF NOT (is_professional() OR is_admin()) THEN
    RAISE EXCEPTION 'Apenas profissionais podem buscar clientes';
  END IF;
  
  -- Retornar cliente encontrado com informações de vínculo existente
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at,
    cp.id as existing_link_id,
    cp.status as existing_link_status
  FROM public.profiles p
  LEFT JOIN public.client_professionals cp ON (
    cp.client_id = p.id 
    AND cp.professional_id = auth.uid()
  )
  WHERE p.email = client_email 
    AND p.role = 'client'
  LIMIT 1;
  
  RETURN;
END;
$$;


ALTER FUNCTION public.find_client_by_email(client_email text) OWNER TO postgres;

--
-- TOC entry 422 (class 1255 OID 22611)
-- Name: get_conversation(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) RETURNS TABLE(id uuid, sender_id uuid, receiver_id uuid, content text, message_type text, file_url text, is_read boolean, read_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.chat_messages
  WHERE (sender_id = user_id AND receiver_id = other_user_id)
     OR (sender_id = other_user_id AND receiver_id = user_id)
  ORDER BY created_at ASC;
END;
$$;


ALTER FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) OWNER TO postgres;

--
-- TOC entry 440 (class 1255 OID 26400)
-- Name: get_conversation(uuid, uuid, integer, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer DEFAULT 100, offset_count integer DEFAULT 0) RETURNS TABLE(id uuid, sender_id uuid, receiver_id uuid, content text, message_type text, file_url text, is_read boolean, read_at timestamp with time zone, created_at timestamp with time zone, updated_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cm.id, cm.sender_id, cm.receiver_id, cm.content, cm.message_type, 
    cm.file_url, cm.is_read, cm.read_at, cm.created_at, cm.updated_at
  FROM public.chat_messages cm
  WHERE (cm.sender_id = user1_id AND cm.receiver_id = user2_id)
     OR (cm.sender_id = user2_id AND cm.receiver_id = user1_id)
  ORDER BY cm.created_at ASC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;


ALTER FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) OWNER TO postgres;

--
-- TOC entry 438 (class 1255 OID 29941)
-- Name: get_rank_title(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_rank_title(level integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF level <= 5 THEN RETURN 'Novato de Sofá';
    ELSIF level <= 10 THEN RETURN 'Caminhante de Fim de Semana';
    ELSIF level <= 20 THEN RETURN 'Rato de Academia';
    ELSIF level <= 30 THEN RETURN 'Maratonista de Dados';
    ELSIF level <= 50 THEN RETURN 'Ciborgue Fitness';
    ELSE RETURN 'Lenda Viva';
    END IF;
END;
$$;


ALTER FUNCTION public.get_rank_title(level integer) OWNER TO postgres;

--
-- TOC entry 424 (class 1255 OID 18126)
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
BEGIN
  -- Insere o novo usuário na tabela profiles com role padrão 'client'
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    'client'
  );
  
  -- Retorna o novo registro (boa prática)
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- TOC entry 469 (class 1255 OID 22416)
-- Name: handle_notifications_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_notifications_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.created_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_notifications_updated_at() OWNER TO postgres;

--
-- TOC entry 523 (class 1255 OID 17853)
-- Name: handle_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.handle_updated_at() OWNER TO postgres;

--
-- TOC entry 453 (class 1255 OID 17865)
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;


ALTER FUNCTION public.is_admin() OWNER TO postgres;

--
-- TOC entry 433 (class 1255 OID 17867)
-- Name: is_client(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_client() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'client'
  );
END;
$$;


ALTER FUNCTION public.is_client() OWNER TO postgres;

--
-- TOC entry 462 (class 1255 OID 17866)
-- Name: is_professional(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.is_professional() RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'professional'
  );
END;
$$;


ALTER FUNCTION public.is_professional() OWNER TO postgres;

--
-- TOC entry 449 (class 1255 OID 22482)
-- Name: link_client_and_update_profile(uuid, text, text, text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text DEFAULT NULL::text, p_full_name text DEFAULT NULL::text, p_phone text DEFAULT NULL::text) RETURNS uuid
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_link_id UUID;
  v_updated_profile BOOLEAN := FALSE;
BEGIN
  -- 1. Validar se o cliente existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_client_id AND role = 'client') THEN
    RAISE EXCEPTION 'Cliente não encontrado ou não é um cliente válido';
  END IF;

  -- 2. Validar se já existe vínculo ativo
  IF EXISTS (
    SELECT 1 FROM public.client_professionals 
    WHERE client_id = p_client_id 
      AND professional_id = auth.uid() 
      AND status = 'active'
  ) THEN
    RAISE EXCEPTION 'Cliente já está vinculado a este profissional';
  END IF;

  -- 3. Criar o vínculo
  INSERT INTO public.client_professionals (client_id, professional_id, status, notes, started_at)
  VALUES (p_client_id, auth.uid(), 'active', p_notes, NOW())
  RETURNING id INTO v_link_id;

  -- 4. Atualizar dados do perfil se fornecidos (e não vazios)
  -- NULLIF garante que strings vazias não apaguem dados existentes
  -- COALESCE garante que não sobrescrevemos com NULL se o parâmetro não vier
  IF p_full_name IS NOT NULL AND NULLIF(TRIM(p_full_name), '') IS NOT NULL THEN
    UPDATE public.profiles
    SET full_name = TRIM(p_full_name),
        updated_at = NOW()
    WHERE id = p_client_id;
    v_updated_profile := TRUE;
  END IF;

  IF p_phone IS NOT NULL AND NULLIF(TRIM(p_phone), '') IS NOT NULL THEN
    UPDATE public.profiles
    SET phone = TRIM(p_phone),
        updated_at = NOW()
    WHERE id = p_client_id;
    v_updated_profile := TRUE;
  END IF;

  -- 5. Log da operação (opcional, para auditoria)
  IF v_updated_profile THEN
    -- Aqui poderíamos inserir em uma tabela de logs se necessário
    -- Por enquanto, apenas continuamos
  END IF;

  -- 6. Retornar o ID do vínculo criado
  RETURN v_link_id;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, fazer rollback e propagar a exceção
    RAISE;
END;
$$;


ALTER FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) OWNER TO postgres;

--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 449
-- Name: FUNCTION link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) IS 'Vincula um cliente ao profissional atual e opcionalmente atualiza seus dados de perfil (nome, telefone). 
Parâmetros: p_client_id (UUID), p_notes (TEXT), p_full_name (TEXT), p_phone (TEXT).
Retorna: UUID do vínculo criado.';


--
-- TOC entry 553 (class 1255 OID 24997)
-- Name: mark_conversation_as_read(uuid, uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) RETURNS integer
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  marked_count INTEGER;
BEGIN
  UPDATE public.chat_messages
  SET is_read = true,
      read_at = NOW(),
      updated_at = NOW()
  WHERE receiver_id = current_user_id 
    AND sender_id = other_user_id 
    AND is_read = false;
  
  GET DIAGNOSTICS marked_count = ROW_COUNT;
  
  RETURN marked_count;
END;
$$;


ALTER FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) OWNER TO postgres;

--
-- TOC entry 493 (class 1255 OID 22483)
-- Name: professional_can_link_client(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.professional_can_link_client(p_client_id uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar se o profissional atual pode vincular este cliente
  -- Regras: profissional só pode vincular clientes que não estão ativos com ele
  
  -- 1. Verificar se o cliente existe e é um cliente
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_client_id AND role = 'client') THEN
    RETURN FALSE;
  END IF;
  
  -- 2. Verificar se já não existe vínculo ativo
  IF EXISTS (
    SELECT 1 FROM public.client_professionals 
    WHERE client_id = p_client_id 
      AND professional_id = auth.uid() 
      AND status = 'active'
  ) THEN
    RETURN FALSE;
  END IF;
  
  -- 3. Verificar se o profissional é realmente um profissional
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('professional', 'admin')) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION public.professional_can_link_client(p_client_id uuid) OWNER TO postgres;

--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION professional_can_link_client(p_client_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.professional_can_link_client(p_client_id uuid) IS 'Vefica se o profissional atual pode vincular o cliente especificado. 
Retorna TRUE se pode vincular, FALSE caso contrário.';


--
-- TOC entry 524 (class 1255 OID 17868)
-- Name: professional_has_client_access(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.professional_has_client_access(client_uuid uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.client_professionals 
    WHERE professional_id = auth.uid() 
    AND client_id = client_uuid 
    AND status = 'active'
  );
END;
$$;


ALTER FUNCTION public.professional_has_client_access(client_uuid uuid) OWNER TO postgres;

--
-- TOC entry 518 (class 1255 OID 29915)
-- Name: trigger_calculate_xp(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_calculate_xp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    cp numeric;
BEGIN
    -- Only calculate if status is completed
    IF NEW.status = 'completed' THEN
        cp := public.calculate_capipoints(
            NEW.duration_seconds,
            NEW.activity_type,
            NEW.calories_burned,
            NEW.distance_meters
        );
        
        NEW.normalized_effort := cp;
        
        NEW.final_xp := public.calculate_final_xp(
            cp,
            NEW.trust_score,
            NEW.ended_at,
            NEW.activity_type
        );
        
        -- Update User Profile XP (Simple increment, ideally should handle updates correctly to avoid double counting)
        -- For this example, we assume a separate process or more complex trigger handles profile aggregation
        -- or we just update it here for simplicity.
        UPDATE public.profiles
        SET current_xp = current_xp + (NEW.final_xp - COALESCE(OLD.final_xp, 0))
        WHERE id = NEW.client_id;
        
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_calculate_xp() OWNER TO postgres;

--
-- TOC entry 515 (class 1255 OID 29942)
-- Name: trigger_update_level(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_update_level() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.level := public.calculate_level(NEW.current_xp);
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.trigger_update_level() OWNER TO postgres;

--
-- TOC entry 427 (class 1255 OID 17351)
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 562 (class 1255 OID 17431)
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- TOC entry 486 (class 1255 OID 17363)
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- TOC entry 441 (class 1255 OID 17309)
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- TOC entry 475 (class 1255 OID 17304)
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- TOC entry 526 (class 1255 OID 17359)
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- TOC entry 548 (class 1255 OID 17370)
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- TOC entry 538 (class 1255 OID 17303)
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- TOC entry 451 (class 1255 OID 17430)
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    -- Generate a new UUID for the id
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- TOC entry 496 (class 1255 OID 17301)
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- TOC entry 501 (class 1255 OID 17340)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- TOC entry 482 (class 1255 OID 17423)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- TOC entry 498 (class 1255 OID 17214)
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


ALTER FUNCTION storage.add_prefixes(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 514 (class 1255 OID 17140)
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- TOC entry 481 (class 1255 OID 17259)
-- Name: delete_leaf_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_rows_deleted integer;
BEGIN
    LOOP
        WITH candidates AS (
            SELECT DISTINCT
                t.bucket_id,
                unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        ),
        uniq AS (
             SELECT
                 bucket_id,
                 name,
                 storage.get_level(name) AS level
             FROM candidates
             WHERE name <> ''
             GROUP BY bucket_id, name
        ),
        leaf AS (
             SELECT
                 p.bucket_id,
                 p.name,
                 p.level
             FROM storage.prefixes AS p
                  JOIN uniq AS u
                       ON u.bucket_id = p.bucket_id
                           AND u.name = p.name
                           AND u.level = p.level
             WHERE NOT EXISTS (
                 SELECT 1
                 FROM storage.objects AS o
                 WHERE o.bucket_id = p.bucket_id
                   AND o.level = p.level + 1
                   AND o.name COLLATE "C" LIKE p.name || '/%'
             )
             AND NOT EXISTS (
                 SELECT 1
                 FROM storage.prefixes AS c
                 WHERE c.bucket_id = p.bucket_id
                   AND c.level = p.level + 1
                   AND c.name COLLATE "C" LIKE p.name || '/%'
             )
        )
        DELETE
        FROM storage.prefixes AS p
            USING leaf AS l
        WHERE p.bucket_id = l.bucket_id
          AND p.name = l.name
          AND p.level = l.level;

        GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;
        EXIT WHEN v_rows_deleted = 0;
    END LOOP;
END;
$$;


ALTER FUNCTION storage.delete_leaf_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 442 (class 1255 OID 17215)
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


ALTER FUNCTION storage.delete_prefix(_bucket_id text, _name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 478 (class 1255 OID 17218)
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


ALTER FUNCTION storage.delete_prefix_hierarchy_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 500 (class 1255 OID 17238)
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- TOC entry 537 (class 1255 OID 17114)
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 483 (class 1255 OID 17113)
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 450 (class 1255 OID 17112)
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 487 (class 1255 OID 17196)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 512 (class 1255 OID 17212)
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


ALTER FUNCTION storage.get_prefix(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 521 (class 1255 OID 17213)
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


ALTER FUNCTION storage.get_prefixes(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 536 (class 1255 OID 17236)
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- TOC entry 539 (class 1255 OID 17179)
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 558 (class 1255 OID 17142)
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- TOC entry 488 (class 1255 OID 17258)
-- Name: lock_top_prefixes(text[], text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket text;
    v_top text;
BEGIN
    FOR v_bucket, v_top IN
        SELECT DISTINCT t.bucket_id,
            split_part(t.name, '/', 1) AS top
        FROM unnest(bucket_ids, names) AS t(bucket_id, name)
        WHERE t.name <> ''
        ORDER BY 1, 2
        LOOP
            PERFORM pg_advisory_xact_lock(hashtextextended(v_bucket || '/' || v_top, 0));
        END LOOP;
END;
$$;


ALTER FUNCTION storage.lock_top_prefixes(bucket_ids text[], names text[]) OWNER TO supabase_storage_admin;

--
-- TOC entry 436 (class 1255 OID 17260)
-- Name: objects_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 485 (class 1255 OID 17217)
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_insert_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 423 (class 1255 OID 17261)
-- Name: objects_update_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    -- NEW - OLD (destinations to create prefixes for)
    v_add_bucket_ids text[];
    v_add_names      text[];

    -- OLD - NEW (sources to prune)
    v_src_bucket_ids text[];
    v_src_names      text[];
BEGIN
    IF TG_OP <> 'UPDATE' THEN
        RETURN NULL;
    END IF;

    -- 1) Compute NEW−OLD (added paths) and OLD−NEW (moved-away paths)
    WITH added AS (
        SELECT n.bucket_id, n.name
        FROM new_rows n
        WHERE n.name <> '' AND position('/' in n.name) > 0
        EXCEPT
        SELECT o.bucket_id, o.name FROM old_rows o WHERE o.name <> ''
    ),
    moved AS (
         SELECT o.bucket_id, o.name
         FROM old_rows o
         WHERE o.name <> ''
         EXCEPT
         SELECT n.bucket_id, n.name FROM new_rows n WHERE n.name <> ''
    )
    SELECT
        -- arrays for ADDED (dest) in stable order
        COALESCE( (SELECT array_agg(a.bucket_id ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        COALESCE( (SELECT array_agg(a.name      ORDER BY a.bucket_id, a.name) FROM added a), '{}' ),
        -- arrays for MOVED (src) in stable order
        COALESCE( (SELECT array_agg(m.bucket_id ORDER BY m.bucket_id, m.name) FROM moved m), '{}' ),
        COALESCE( (SELECT array_agg(m.name      ORDER BY m.bucket_id, m.name) FROM moved m), '{}' )
    INTO v_add_bucket_ids, v_add_names, v_src_bucket_ids, v_src_names;

    -- Nothing to do?
    IF (array_length(v_add_bucket_ids, 1) IS NULL) AND (array_length(v_src_bucket_ids, 1) IS NULL) THEN
        RETURN NULL;
    END IF;

    -- 2) Take per-(bucket, top) locks: ALL prefixes in consistent global order to prevent deadlocks
    DECLARE
        v_all_bucket_ids text[];
        v_all_names text[];
    BEGIN
        -- Combine source and destination arrays for consistent lock ordering
        v_all_bucket_ids := COALESCE(v_src_bucket_ids, '{}') || COALESCE(v_add_bucket_ids, '{}');
        v_all_names := COALESCE(v_src_names, '{}') || COALESCE(v_add_names, '{}');

        -- Single lock call ensures consistent global ordering across all transactions
        IF array_length(v_all_bucket_ids, 1) IS NOT NULL THEN
            PERFORM storage.lock_top_prefixes(v_all_bucket_ids, v_all_names);
        END IF;
    END;

    -- 3) Create destination prefixes (NEW−OLD) BEFORE pruning sources
    IF array_length(v_add_bucket_ids, 1) IS NOT NULL THEN
        WITH candidates AS (
            SELECT DISTINCT t.bucket_id, unnest(storage.get_prefixes(t.name)) AS name
            FROM unnest(v_add_bucket_ids, v_add_names) AS t(bucket_id, name)
            WHERE name <> ''
        )
        INSERT INTO storage.prefixes (bucket_id, name)
        SELECT c.bucket_id, c.name
        FROM candidates c
        ON CONFLICT DO NOTHING;
    END IF;

    -- 4) Prune source prefixes bottom-up for OLD−NEW
    IF array_length(v_src_bucket_ids, 1) IS NOT NULL THEN
        -- re-entrancy guard so DELETE on prefixes won't recurse
        IF current_setting('storage.gc.prefixes', true) <> '1' THEN
            PERFORM set_config('storage.gc.prefixes', '1', true);
        END IF;

        PERFORM storage.delete_leaf_prefixes(v_src_bucket_ids, v_src_names);
    END IF;

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.objects_update_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 545 (class 1255 OID 17266)
-- Name: objects_update_level_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_level_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Set the new level
        NEW."level" := "storage"."get_level"(NEW."name");
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_level_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 494 (class 1255 OID 17237)
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.objects_update_prefix_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 505 (class 1255 OID 17195)
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- TOC entry 503 (class 1255 OID 17262)
-- Name: prefixes_delete_cleanup(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_delete_cleanup() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    v_bucket_ids text[];
    v_names      text[];
BEGIN
    IF current_setting('storage.gc.prefixes', true) = '1' THEN
        RETURN NULL;
    END IF;

    PERFORM set_config('storage.gc.prefixes', '1', true);

    SELECT COALESCE(array_agg(d.bucket_id), '{}'),
           COALESCE(array_agg(d.name), '{}')
    INTO v_bucket_ids, v_names
    FROM deleted AS d
    WHERE d.name <> '';

    PERFORM storage.lock_top_prefixes(v_bucket_ids, v_names);
    PERFORM storage.delete_leaf_prefixes(v_bucket_ids, v_names);

    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.prefixes_delete_cleanup() OWNER TO supabase_storage_admin;

--
-- TOC entry 463 (class 1255 OID 17216)
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


ALTER FUNCTION storage.prefixes_insert_trigger() OWNER TO supabase_storage_admin;

--
-- TOC entry 504 (class 1255 OID 17129)
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 540 (class 1255 OID 17234)
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 464 (class 1255 OID 17233)
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- TOC entry 534 (class 1255 OID 17257)
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    sort_col text;
    sort_ord text;
    cursor_op text;
    cursor_expr text;
    sort_expr text;
BEGIN
    -- Validate sort_order
    sort_ord := lower(sort_order);
    IF sort_ord NOT IN ('asc', 'desc') THEN
        sort_ord := 'asc';
    END IF;

    -- Determine cursor comparison operator
    IF sort_ord = 'asc' THEN
        cursor_op := '>';
    ELSE
        cursor_op := '<';
    END IF;
    
    sort_col := lower(sort_column);
    -- Validate sort column  
    IF sort_col IN ('updated_at', 'created_at') THEN
        cursor_expr := format(
            '($5 = '''' OR ROW(date_trunc(''milliseconds'', %I), name COLLATE "C") %s ROW(COALESCE(NULLIF($6, '''')::timestamptz, ''epoch''::timestamptz), $5))',
            sort_col, cursor_op
        );
        sort_expr := format(
            'COALESCE(date_trunc(''milliseconds'', %I), ''epoch''::timestamptz) %s, name COLLATE "C" %s',
            sort_col, sort_ord, sort_ord
        );
    ELSE
        cursor_expr := format('($5 = '''' OR name COLLATE "C" %s $5)', cursor_op);
        sort_expr := format('name COLLATE "C" %s', sort_ord);
    END IF;

    RETURN QUERY EXECUTE format(
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    NULL::uuid AS id,
                    updated_at,
                    created_at,
                    NULL::timestamptz AS last_accessed_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
            UNION ALL
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name,
                    id,
                    updated_at,
                    created_at,
                    last_accessed_at,
                    metadata
                FROM storage.objects
                WHERE name COLLATE "C" LIKE $1 || '%%'
                    AND bucket_id = $2
                    AND level = $4
                    AND %s
                ORDER BY %s
                LIMIT $3
            )
        ) obj
        ORDER BY %s
        LIMIT $3
        $sql$,
        cursor_expr,    -- prefixes WHERE
        sort_expr,      -- prefixes ORDER BY
        cursor_expr,    -- objects WHERE
        sort_expr,      -- objects ORDER BY
        sort_expr       -- final ORDER BY
    )
    USING prefix, bucket_name, limits, levels, start_after, sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- TOC entry 510 (class 1255 OID 17130)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 352 (class 1259 OID 16525)
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 369 (class 1259 OID 16929)
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 360 (class 1259 OID 16727)
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 360
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 351 (class 1259 OID 16518)
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 351
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 364 (class 1259 OID 16816)
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 363 (class 1259 OID 16804)
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 362 (class 1259 OID 16791)
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 362
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- TOC entry 372 (class 1259 OID 17041)
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- TOC entry 371 (class 1259 OID 17011)
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- TOC entry 373 (class 1259 OID 17074)
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- TOC entry 370 (class 1259 OID 16979)
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 350 (class 1259 OID 16507)
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- TOC entry 4908 (class 0 OID 0)
-- Dependencies: 350
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 349 (class 1259 OID 16506)
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- TOC entry 4910 (class 0 OID 0)
-- Dependencies: 349
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 367 (class 1259 OID 16858)
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 4912 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 368 (class 1259 OID 16876)
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- TOC entry 4914 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 353 (class 1259 OID 16533)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- TOC entry 4916 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 361 (class 1259 OID 16757)
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- TOC entry 4918 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 4919 (class 0 OID 0)
-- Dependencies: 361
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 4920 (class 0 OID 0)
-- Dependencies: 361
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- TOC entry 4921 (class 0 OID 0)
-- Dependencies: 361
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- TOC entry 366 (class 1259 OID 16843)
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- TOC entry 4923 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 365 (class 1259 OID 16834)
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- TOC entry 4925 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 4926 (class 0 OID 0)
-- Dependencies: 365
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 348 (class 1259 OID 16495)
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- TOC entry 4928 (class 0 OID 0)
-- Dependencies: 348
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 4929 (class 0 OID 0)
-- Dependencies: 348
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 416 (class 1259 OID 29858)
-- Name: achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    icon_url text,
    xp_reward integer DEFAULT 0,
    criteria jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.achievements OWNER TO postgres;

--
-- TOC entry 403 (class 1259 OID 17790)
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    client_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    appointment_type text NOT NULL,
    scheduled_start timestamp with time zone NOT NULL,
    scheduled_end timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    meeting_url text,
    location text,
    price numeric(10,2),
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT appointments_appointment_type_check CHECK ((appointment_type = ANY (ARRAY['consultation'::text, 'assessment'::text, 'follow_up'::text]))),
    CONSTRAINT appointments_status_check CHECK ((status = ANY (ARRAY['scheduled'::text, 'confirmed'::text, 'completed'::text, 'cancelled'::text, 'no_show'::text])))
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- TOC entry 402 (class 1259 OID 17774)
-- Name: biometric_data; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.biometric_data (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    date date NOT NULL,
    weight numeric(5,2),
    height numeric(5,2),
    body_fat_percentage numeric(5,2),
    muscle_mass numeric(5,2),
    measurements jsonb,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.biometric_data OWNER TO postgres;

--
-- TOC entry 404 (class 1259 OID 17813)
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chat_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    sender_id uuid NOT NULL,
    receiver_id uuid NOT NULL,
    content text NOT NULL,
    message_type text DEFAULT 'text'::text,
    file_url text,
    is_read boolean DEFAULT false,
    sent_at timestamp with time zone DEFAULT now() NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT chat_messages_message_type_check CHECK ((message_type = ANY (ARRAY['text'::text, 'image'::text, 'file'::text, 'voice'::text])))
);


ALTER TABLE public.chat_messages OWNER TO postgres;

--
-- TOC entry 387 (class 1259 OID 17482)
-- Name: client_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_details (
    profile_id uuid NOT NULL,
    goals text,
    anamnesis_data jsonb,
    emergency_contact jsonb,
    health_restrictions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.client_details OWNER TO postgres;

--
-- TOC entry 399 (class 1259 OID 17708)
-- Name: client_meal_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_meal_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    meal_plan_id uuid NOT NULL,
    nutritionist_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT client_meal_plans_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'paused'::text, 'cancelled'::text])))
);


ALTER TABLE public.client_meal_plans OWNER TO postgres;

--
-- TOC entry 388 (class 1259 OID 17496)
-- Name: client_professionals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_professionals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    notes text,
    CONSTRAINT client_professionals_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'paused'::text])))
);


ALTER TABLE public.client_professionals OWNER TO postgres;

--
-- TOC entry 392 (class 1259 OID 17571)
-- Name: client_workouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.client_workouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    workout_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status text DEFAULT 'active'::text NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT client_workouts_status_check CHECK ((status = ANY (ARRAY['active'::text, 'completed'::text, 'paused'::text, 'cancelled'::text])))
);


ALTER TABLE public.client_workouts OWNER TO postgres;

--
-- TOC entry 389 (class 1259 OID 17519)
-- Name: exercises_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.exercises_library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    muscle_groups text[],
    equipment_needed text[],
    difficulty_level text,
    video_url text,
    gif_url text,
    instructions text[],
    tips text[],
    created_by uuid NOT NULL,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT exercises_library_difficulty_level_check CHECK ((difficulty_level = ANY (ARRAY['beginner'::text, 'intermediate'::text, 'advanced'::text])))
);


ALTER TABLE public.exercises_library OWNER TO postgres;

--
-- TOC entry 394 (class 1259 OID 17618)
-- Name: foods_library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.foods_library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    brand text,
    category text,
    serving_size numeric(6,2) NOT NULL,
    calories_per_serving numeric(6,2) NOT NULL,
    protein numeric(5,2) NOT NULL,
    carbs numeric(5,2) NOT NULL,
    fat numeric(5,2) NOT NULL,
    fiber numeric(5,2),
    sugar numeric(5,2),
    sodium numeric(6,2),
    created_by uuid NOT NULL,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.foods_library OWNER TO postgres;

--
-- TOC entry 400 (class 1259 OID 17735)
-- Name: meal_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    food_id uuid,
    recipe_id uuid,
    quantity numeric(6,2) NOT NULL,
    meal_name text NOT NULL,
    logged_at timestamp with time zone DEFAULT now() NOT NULL,
    notes text,
    CONSTRAINT meal_logs_check CHECK ((((food_id IS NOT NULL) AND (recipe_id IS NULL)) OR ((food_id IS NULL) AND (recipe_id IS NOT NULL))))
);


ALTER TABLE public.meal_logs OWNER TO postgres;

--
-- TOC entry 398 (class 1259 OID 17684)
-- Name: meal_plan_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_plan_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    meal_plan_id uuid NOT NULL,
    day_number integer NOT NULL,
    meal_order integer NOT NULL,
    meal_name text NOT NULL,
    food_id uuid,
    recipe_id uuid,
    quantity numeric(6,2) NOT NULL,
    notes text,
    CONSTRAINT meal_plan_items_check CHECK ((((food_id IS NOT NULL) AND (recipe_id IS NULL)) OR ((food_id IS NULL) AND (recipe_id IS NOT NULL))))
);


ALTER TABLE public.meal_plan_items OWNER TO postgres;

--
-- TOC entry 397 (class 1259 OID 17668)
-- Name: meal_plans; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.meal_plans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    nutritionist_id uuid NOT NULL,
    objective text,
    daily_calories_target numeric(6,2),
    daily_protein_target numeric(5,2),
    daily_carbs_target numeric(5,2),
    daily_fat_target numeric(5,2),
    is_template boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.meal_plans OWNER TO postgres;

--
-- TOC entry 386 (class 1259 OID 17466)
-- Name: professional_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professional_details (
    profile_id uuid NOT NULL,
    specialty text NOT NULL,
    bio text,
    certifications jsonb,
    consultation_price numeric(10,2),
    subscription_price numeric(10,2),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT professional_details_specialty_check CHECK ((specialty = ANY (ARRAY['personal_trainer'::text, 'nutritionist'::text])))
);


ALTER TABLE public.professional_details OWNER TO postgres;

--
-- TOC entry 406 (class 1259 OID 22388)
-- Name: professional_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.professional_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    professional_id uuid NOT NULL,
    client_id uuid,
    type text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.professional_notifications OWNER TO postgres;

--
-- TOC entry 385 (class 1259 OID 17451)
-- Name: profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profiles (
    id uuid NOT NULL,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    phone text,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    current_xp integer DEFAULT 0,
    level integer DEFAULT 1,
    CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'professional'::text, 'client'::text])))
);


ALTER TABLE public.profiles OWNER TO postgres;

--
-- TOC entry 401 (class 1259 OID 17760)
-- Name: progress_photos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progress_photos (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    photo_url text NOT NULL,
    date date NOT NULL,
    notes text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.progress_photos OWNER TO postgres;

--
-- TOC entry 396 (class 1259 OID 17650)
-- Name: recipe_ingredients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipe_ingredients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipe_id uuid NOT NULL,
    food_id uuid NOT NULL,
    quantity numeric(6,2) NOT NULL,
    notes text
);


ALTER TABLE public.recipe_ingredients OWNER TO postgres;

--
-- TOC entry 395 (class 1259 OID 17634)
-- Name: recipes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recipes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    instructions text[],
    prep_time_minutes integer,
    cook_time_minutes integer,
    servings integer NOT NULL,
    calories_per_serving numeric(6,2),
    protein_per_serving numeric(5,2),
    carbs_per_serving numeric(5,2),
    fat_per_serving numeric(5,2),
    image_url text,
    created_by uuid NOT NULL,
    is_public boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.recipes OWNER TO postgres;

--
-- TOC entry 417 (class 1259 OID 29871)
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    unlocked_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_achievements OWNER TO postgres;

--
-- TOC entry 415 (class 1259 OID 28702)
-- Name: workout_execution_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_execution_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workout_session_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    workout_exercise_id uuid,
    weight numeric,
    reps integer,
    notes text,
    completed_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workout_execution_logs OWNER TO postgres;

--
-- TOC entry 391 (class 1259 OID 17553)
-- Name: workout_exercises; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_exercises (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    workout_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    day_number integer NOT NULL,
    order_index integer NOT NULL,
    sets integer NOT NULL,
    reps text,
    weight numeric(6,2),
    rest_time_seconds integer,
    notes text
);


ALTER TABLE public.workout_exercises OWNER TO postgres;

--
-- TOC entry 393 (class 1259 OID 17598)
-- Name: workout_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_workout_id uuid NOT NULL,
    workout_exercise_id uuid NOT NULL,
    performed_at timestamp with time zone DEFAULT now() NOT NULL,
    sets_completed integer,
    reps_completed text,
    weight_used numeric(6,2),
    duration_minutes integer,
    feedback text,
    difficulty_rating integer,
    CONSTRAINT workout_logs_difficulty_rating_check CHECK (((difficulty_rating >= 1) AND (difficulty_rating <= 5)))
);


ALTER TABLE public.workout_logs OWNER TO postgres;

--
-- TOC entry 405 (class 1259 OID 20118)
-- Name: workout_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workout_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    client_id uuid NOT NULL,
    professional_id uuid NOT NULL,
    workout_id uuid NOT NULL,
    client_workout_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    duration_seconds integer,
    status text DEFAULT 'started'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT 'manual'::text,
    external_id text,
    trust_score numeric(3,2) DEFAULT 0.5,
    normalized_effort numeric(10,2),
    calories_burned integer,
    distance_meters numeric(10,2),
    heart_rate_avg integer,
    elevation_gain numeric(10,2),
    final_xp integer DEFAULT 0,
    activity_type text DEFAULT 'strength'::text,
    CONSTRAINT workout_sessions_status_check CHECK ((status = ANY (ARRAY['started'::text, 'paused'::text, 'completed'::text, 'abandoned'::text])))
);


ALTER TABLE public.workout_sessions OWNER TO postgres;

--
-- TOC entry 390 (class 1259 OID 17536)
-- Name: workouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workouts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    professional_id uuid NOT NULL,
    objective text,
    duration_weeks integer DEFAULT 4,
    days_per_week integer,
    is_template boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workouts OWNER TO postgres;

--
-- TOC entry 384 (class 1259 OID 17434)
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- TOC entry 409 (class 1259 OID 22572)
-- Name: messages_2025_11_23; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_23 OWNER TO supabase_admin;

--
-- TOC entry 410 (class 1259 OID 24982)
-- Name: messages_2025_11_24; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_24 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_24 OWNER TO supabase_admin;

--
-- TOC entry 411 (class 1259 OID 25020)
-- Name: messages_2025_11_25; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_25 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_25 OWNER TO supabase_admin;

--
-- TOC entry 412 (class 1259 OID 26290)
-- Name: messages_2025_11_26; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_26 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_26 OWNER TO supabase_admin;

--
-- TOC entry 413 (class 1259 OID 27574)
-- Name: messages_2025_11_27; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_27 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_27 OWNER TO supabase_admin;

--
-- TOC entry 414 (class 1259 OID 28690)
-- Name: messages_2025_11_28; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_28 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_28 OWNER TO supabase_admin;

--
-- TOC entry 418 (class 1259 OID 29966)
-- Name: messages_2025_11_29; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_29 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_29 OWNER TO supabase_admin;

--
-- TOC entry 377 (class 1259 OID 17225)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- TOC entry 381 (class 1259 OID 17289)
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- TOC entry 380 (class 1259 OID 17288)
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 354 (class 1259 OID 16546)
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- TOC entry 4969 (class 0 OID 0)
-- Dependencies: 354
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 378 (class 1259 OID 17246)
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- TOC entry 407 (class 1259 OID 22419)
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- TOC entry 356 (class 1259 OID 16588)
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- TOC entry 355 (class 1259 OID 16561)
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- TOC entry 4973 (class 0 OID 0)
-- Dependencies: 355
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 376 (class 1259 OID 17197)
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE storage.prefixes OWNER TO supabase_storage_admin;

--
-- TOC entry 374 (class 1259 OID 17144)
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- TOC entry 375 (class 1259 OID 17158)
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- TOC entry 408 (class 1259 OID 22429)
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- TOC entry 3819 (class 0 OID 0)
-- Name: messages_2025_11_23; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_23 FOR VALUES FROM ('2025-11-23 00:00:00') TO ('2025-11-24 00:00:00');


--
-- TOC entry 3820 (class 0 OID 0)
-- Name: messages_2025_11_24; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_24 FOR VALUES FROM ('2025-11-24 00:00:00') TO ('2025-11-25 00:00:00');


--
-- TOC entry 3821 (class 0 OID 0)
-- Name: messages_2025_11_25; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_25 FOR VALUES FROM ('2025-11-25 00:00:00') TO ('2025-11-26 00:00:00');


--
-- TOC entry 3822 (class 0 OID 0)
-- Name: messages_2025_11_26; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_26 FOR VALUES FROM ('2025-11-26 00:00:00') TO ('2025-11-27 00:00:00');


--
-- TOC entry 3823 (class 0 OID 0)
-- Name: messages_2025_11_27; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_27 FOR VALUES FROM ('2025-11-27 00:00:00') TO ('2025-11-28 00:00:00');


--
-- TOC entry 3824 (class 0 OID 0)
-- Name: messages_2025_11_28; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_28 FOR VALUES FROM ('2025-11-28 00:00:00') TO ('2025-11-29 00:00:00');


--
-- TOC entry 3825 (class 0 OID 0)
-- Name: messages_2025_11_29; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_29 FOR VALUES FROM ('2025-11-29 00:00:00') TO ('2025-11-30 00:00:00');


--
-- TOC entry 3835 (class 2604 OID 16510)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4703 (class 0 OID 16525)
-- Dependencies: 352
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '27b7b094-aa51-4fd1-8373-12b38a8f3081', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"provider":"email","user_email":"cliente1@capifit.com","user_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","user_phone":""}}', '2025-11-26 20:31:24.797302+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', 'a3bed560-f94d-4ac4-8218-11497fe01675', '{"action":"login","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-26 20:31:56.966449+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '2e291c98-6024-43c4-85dd-d77ba00f355f', '{"action":"token_refreshed","actor_id":"f2bb6acc-835a-414c-8856-836415b23896","actor_name":"Giuliano Moretti Santos Garcia","actor_username":"profissional@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 20:33:37.806889+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', 'e0e55b30-9c00-4442-aae9-1a34ec106ce4', '{"action":"token_revoked","actor_id":"f2bb6acc-835a-414c-8856-836415b23896","actor_name":"Giuliano Moretti Santos Garcia","actor_username":"profissional@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 20:33:37.807873+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '8fffe8a9-4469-44e1-96af-a90977313a69', '{"action":"user_modified","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"user"}', '2025-11-26 20:34:22.092678+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '804dccfb-ee3c-4bc9-bd47-08705d46c5db', '{"action":"user_modified","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"user"}', '2025-11-26 20:34:28.045696+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '92e8854e-5909-41dd-b10d-6d59dc1dae8c', '{"action":"token_refreshed","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 21:30:58.718129+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '146639f6-f8ae-44a3-85a9-60526d5ea330', '{"action":"token_revoked","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 21:30:58.738343+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '19bb9cc1-e5bd-4835-babb-7277d657a8b5', '{"action":"token_refreshed","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 22:29:58.719735+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '5078ffbe-10db-466e-a836-49602526743c', '{"action":"token_revoked","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 22:29:58.737046+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '9c4a9f1a-eb57-415b-8e56-95b0b17caae5', '{"action":"token_refreshed","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 23:28:58.671182+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '05070fef-d0ad-423e-b1d8-6bd3ab465bf0', '{"action":"token_revoked","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-26 23:28:58.682701+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', 'b71b01d6-4e7c-44b8-99ff-c3feb1b51dd3', '{"action":"token_refreshed","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-27 00:27:58.781461+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '44c6326d-8d9d-46f0-8f24-70112c47dfb0', '{"action":"token_revoked","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-27 00:27:58.793083+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '0f2717da-d298-4d36-91cf-19bc9708ee74', '{"action":"token_refreshed","actor_id":"f2bb6acc-835a-414c-8856-836415b23896","actor_name":"Giuliano Moretti Santos Garcia","actor_username":"profissional@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-27 00:33:54.731436+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', 'cc4bc628-9390-4297-868a-68c341ccd2a1', '{"action":"token_revoked","actor_id":"f2bb6acc-835a-414c-8856-836415b23896","actor_name":"Giuliano Moretti Santos Garcia","actor_username":"profissional@capifit.com","actor_via_sso":false,"log_type":"token"}', '2025-11-27 00:33:54.733863+00', '');
INSERT INTO auth.audit_log_entries VALUES ('00000000-0000-0000-0000-000000000000', '58acd0c4-76b2-4ee9-8fcc-2babc3b49e82', '{"action":"login","actor_id":"bf547c35-e240-45db-bdb1-5a1fc4bc8081","actor_name":"Vinicius Santos Garcia","actor_username":"cliente1@capifit.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-11-27 00:36:47.517482+00', '');


--
-- TOC entry 4717 (class 0 OID 16929)
-- Dependencies: 369
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4708 (class 0 OID 16727)
-- Dependencies: 360
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.identities VALUES ('f2bb6acc-835a-414c-8856-836415b23896', 'f2bb6acc-835a-414c-8856-836415b23896', '{"sub": "f2bb6acc-835a-414c-8856-836415b23896", "email": "profissional@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-16 22:09:35.755205+00', '2025-11-16 22:09:35.755278+00', '2025-11-16 22:09:35.755278+00', DEFAULT, 'cc11d77e-c8e9-4594-b4b0-c3856a51f430');
INSERT INTO auth.identities VALUES ('c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', 'c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', '{"sub": "c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4", "email": "admin@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-16 22:10:09.627966+00', '2025-11-16 22:10:09.628014+00', '2025-11-16 22:10:09.628014+00', DEFAULT, '8350b6c2-fdb1-4d00-b40d-82a7a2b136ec');
INSERT INTO auth.identities VALUES ('7171a1a8-524b-4cee-9040-886c74afe93f', '7171a1a8-524b-4cee-9040-886c74afe93f', '{"sub": "7171a1a8-524b-4cee-9040-886c74afe93f", "email": "cliente@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-26 19:46:42.702055+00', '2025-11-26 19:46:42.702118+00', '2025-11-26 19:46:42.702118+00', DEFAULT, '170c593d-e246-41a9-94a9-55a03695be80');
INSERT INTO auth.identities VALUES ('bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', '{"sub": "bf547c35-e240-45db-bdb1-5a1fc4bc8081", "email": "cliente1@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-26 20:31:24.794343+00', '2025-11-26 20:31:24.794402+00', '2025-11-26 20:31:24.794402+00', DEFAULT, '0ae678b6-2e44-4ae5-b55b-98a1b648dff8');


--
-- TOC entry 4702 (class 0 OID 16518)
-- Dependencies: 351
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4712 (class 0 OID 16816)
-- Dependencies: 364
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.mfa_amr_claims VALUES ('7a35a9cd-9dd5-45e4-9a28-261914267fe7', '2025-11-25 00:42:06.526627+00', '2025-11-25 00:42:06.526627+00', 'password', 'dc74121f-99eb-45de-af24-42f3f93923bb');
INSERT INTO auth.mfa_amr_claims VALUES ('ac6a24ea-f306-4b38-9ad1-25a810c9ac8e', '2025-11-25 13:51:14.609092+00', '2025-11-25 13:51:14.609092+00', 'password', '4409ff24-a60b-49a1-93c6-92054b4d3c62');
INSERT INTO auth.mfa_amr_claims VALUES ('1469c7d9-444a-4b80-9a8d-f48d60fabe6d', '2025-11-25 15:13:20.666442+00', '2025-11-25 15:13:20.666442+00', 'password', 'd2585960-ac3d-46db-8634-d8ca8d553011');
INSERT INTO auth.mfa_amr_claims VALUES ('01d70851-717a-4a8a-9eac-bcd489016b50', '2025-11-26 20:31:56.996108+00', '2025-11-26 20:31:56.996108+00', 'password', '1c310da8-afc6-4de1-830b-10888e676ac9');
INSERT INTO auth.mfa_amr_claims VALUES ('84e9bdc1-fbe6-49cc-937d-3da77dce8110', '2025-11-27 00:36:47.561542+00', '2025-11-27 00:36:47.561542+00', 'password', 'ef1440d3-c15b-41bc-9799-a00897f89d52');


--
-- TOC entry 4711 (class 0 OID 16804)
-- Dependencies: 363
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4710 (class 0 OID 16791)
-- Dependencies: 362
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4720 (class 0 OID 17041)
-- Dependencies: 372
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4719 (class 0 OID 17011)
-- Dependencies: 371
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4721 (class 0 OID 17074)
-- Dependencies: 373
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4718 (class 0 OID 16979)
-- Dependencies: 370
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4701 (class 0 OID 16507)
-- Dependencies: 350
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 588, 'xqehb3ee4pkc', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 16:23:58.812572+00', '2025-11-26 17:22:57.884588+00', '6dre2goty27t', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 521, 's2pthtkh36xq', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 14:13:45.916162+00', '2025-11-25 15:11:46.105918+00', 'gloeoixdat4k', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 590, 'sd4irvgshocj', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 17:22:57.886733+00', '2025-11-26 19:35:36.707652+00', 'xqehb3ee4pkc', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 523, 'j4s2hiq3pi5z', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 15:11:46.12337+00', '2025-11-25 16:09:45.76842+00', 's2pthtkh36xq', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 525, '6474rtc7tuu2', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 15:48:58.525427+00', '2025-11-25 16:47:58.623841+00', 'b7cs64irlaeu', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 592, 'vzh73qrlp3te', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', true, '2025-11-26 20:31:56.976047+00', '2025-11-26 21:30:58.739537+00', NULL, '01d70851-717a-4a8a-9eac-bcd489016b50');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 527, '6leckaizjxtg', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 16:47:58.634811+00', '2025-11-25 17:46:57.760403+00', '6474rtc7tuu2', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 594, 'jkkd7tabp76v', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', true, '2025-11-26 21:30:58.757296+00', '2025-11-26 22:29:58.738809+00', 'vzh73qrlp3te', '01d70851-717a-4a8a-9eac-bcd489016b50');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 531, '6uoaxxudmgys', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 18:05:45.754815+00', '2025-11-25 19:03:45.989184+00', 'gliqxrtodb4y', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 533, 'xjptzk2ep6nf', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 18:45:57.982492+00', '2025-11-25 19:44:57.996594+00', '2svt32wo2um3', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 596, 'cb3hp46qu2de', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', true, '2025-11-26 23:28:58.692924+00', '2025-11-27 00:27:58.794403+00', '6bqmgduohhjl', '01d70851-717a-4a8a-9eac-bcd489016b50');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 580, 'sv3dz52jvxh6', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 09:33:45.87417+00', '2025-11-27 00:33:54.734495+00', 'ltrz2ubldeg4', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 537, 'heub6m753n4w', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 20:01:46.075526+00', '2025-11-25 20:59:45.684903+00', 'wwvfy4qq5xim', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 598, 'trkgmoolhmw4', 'f2bb6acc-835a-414c-8856-836415b23896', false, '2025-11-27 00:33:54.736442+00', '2025-11-27 00:33:54.736442+00', 'sv3dz52jvxh6', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 542, '3dcfw3ylfgm7', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 20:59:45.695267+00', '2025-11-25 21:57:46.122644+00', 'heub6m753n4w', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 544, 'qbewgtlbnl4e', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 21:42:35.013645+00', '2025-11-25 22:41:58.1931+00', 'pgd4hanazdzr', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 548, '2w2qnu2jujmh', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 22:55:45.700976+00', '2025-11-25 23:53:46.064833+00', 'uopds6smq3tm', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 550, 'k5wsusy4ooud', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 23:53:46.075789+00', '2025-11-26 00:51:45.872542+00', '2w2qnu2jujmh', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 552, 'rba6ctrn3cmn', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 00:39:58.587045+00', '2025-11-26 01:38:58.785583+00', 'pjuy4pjlp65o', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 556, 'jxqrr3izhgmw', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 01:49:45.801402+00', '2025-11-26 02:47:46.205178+00', '6i5mfrpabdel', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 558, '3fskl7owd5qs', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 02:37:58.596533+00', '2025-11-26 03:36:58.816359+00', 'i4vp7qo7hfnw', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 562, 'cg7mgxup372t', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 03:45:45.956277+00', '2025-11-26 04:43:45.749141+00', 'zq4jpqdcpoqc', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 564, 'pogyvf7sgqmy', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 04:35:59.040387+00', '2025-11-26 05:34:58.998356+00', 'kcpy7sthmlfj', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 568, 'lyq7cmytc3cq', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 05:41:45.825091+00', '2025-11-26 06:39:45.788+00', '3hbayi4zsnnh', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 570, 'opruolh2uqez', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 06:33:58.844566+00', '2025-11-26 07:32:58.990086+00', 'gqgyifyo247m', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 574, 'h7dn42ka7fqd', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 07:37:45.767171+00', '2025-11-26 08:35:45.696634+00', 'bnclg5twnjmz', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 514, 'ejqyboj37zhi', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 12:17:45.813568+00', '2025-11-25 13:15:45.828094+00', 'h5palvruwp6g', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 576, 'fbks2k7ikwi5', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 08:31:58.780069+00', '2025-11-26 09:30:58.894381+00', '6fhiyydvsj37', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 582, 'pzlklshdewgd', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 10:29:58.421924+00', '2025-11-26 11:28:59.113568+00', 'rq4w6impc73f', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 584, 'awq7gknmnjyx', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 12:27:58.716615+00', '2025-11-26 13:26:58.718372+00', 'jtv2uer73x5b', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 586, 'pfpqcg2raxkr', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 14:25:59.081459+00', '2025-11-26 15:24:58.794477+00', 'vn3pc5krhlsg', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 517, 'gloeoixdat4k', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 13:15:45.849801+00', '2025-11-25 14:13:45.898598+00', 'ejqyboj37zhi', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 520, 'zmgbdcipfu6c', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 13:51:14.607041+00', '2025-11-25 14:49:57.713857+00', NULL, 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 591, '7lqg3p23uamd', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 19:35:36.717745+00', '2025-11-26 20:33:37.808491+00', 'sd4irvgshocj', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 522, 'b7cs64irlaeu', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 14:49:57.723094+00', '2025-11-25 15:48:58.505653+00', 'zmgbdcipfu6c', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 593, 'efpbcnsixyqo', 'f2bb6acc-835a-414c-8856-836415b23896', false, '2025-11-26 20:33:37.81061+00', '2025-11-26 20:33:37.81061+00', '7lqg3p23uamd', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 526, '5obf4fdc2bkv', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 16:09:45.784003+00', '2025-11-25 17:07:46.046385+00', 'j4s2hiq3pi5z', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 595, '6bqmgduohhjl', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', true, '2025-11-26 22:29:58.752194+00', '2025-11-26 23:28:58.68393+00', 'jkkd7tabp76v', '01d70851-717a-4a8a-9eac-bcd489016b50');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 528, 'gliqxrtodb4y', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 17:07:46.057883+00', '2025-11-25 18:05:45.739053+00', '5obf4fdc2bkv', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 597, 'jp2znqv7uch2', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', false, '2025-11-27 00:27:58.801768+00', '2025-11-27 00:27:58.801768+00', 'cb3hp46qu2de', '01d70851-717a-4a8a-9eac-bcd489016b50');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 530, '2svt32wo2um3', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 17:46:57.777589+00', '2025-11-25 18:45:57.977783+00', '6leckaizjxtg', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 599, '53ccskwaoszn', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', false, '2025-11-27 00:36:47.549712+00', '2025-11-27 00:36:47.549712+00', NULL, '84e9bdc1-fbe6-49cc-937d-3da77dce8110');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 534, 'wwvfy4qq5xim', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 19:03:45.997695+00', '2025-11-25 20:01:46.054576+00', '6uoaxxudmgys', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 524, '72wubkndk4ec', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 15:13:20.643847+00', '2025-11-25 20:28:26.007221+00', NULL, '1469c7d9-444a-4b80-9a8d-f48d60fabe6d');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 536, 'uq7bpeekj6ar', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 19:44:58.00335+00', '2025-11-25 20:43:58.317936+00', 'xjptzk2ep6nf', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 489, '5uu6jdcs44b3', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 00:42:06.502314+00', '2025-11-25 01:39:16.905812+00', NULL, '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 541, 'pgd4hanazdzr', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 20:43:58.32275+00', '2025-11-25 21:42:35.004076+00', 'uq7bpeekj6ar', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 491, 'lcdkspig6ihy', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 01:39:16.922832+00', '2025-11-25 02:37:45.792667+00', '5uu6jdcs44b3', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 493, 'dhsolr525qtf', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 02:37:45.812331+00', '2025-11-25 03:35:45.957172+00', 'lcdkspig6ihy', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 545, 'uopds6smq3tm', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 21:57:46.134934+00', '2025-11-25 22:55:45.694204+00', '3dcfw3ylfgm7', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 547, '33w7odkng7hn', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 22:41:58.211443+00', '2025-11-25 23:40:58.702437+00', 'qbewgtlbnl4e', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 495, 'lheffctvybx2', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 03:35:45.97652+00', '2025-11-25 04:33:17.69149+00', 'dhsolr525qtf', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 538, '2wf53eezsqhy', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 20:28:26.024224+00', '2025-11-26 00:07:34.721666+00', '72wubkndk4ec', '1469c7d9-444a-4b80-9a8d-f48d60fabe6d');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 551, 'lmlo7fyvruhf', 'f2bb6acc-835a-414c-8856-836415b23896', false, '2025-11-26 00:07:34.732848+00', '2025-11-26 00:07:34.732848+00', '2wf53eezsqhy', '1469c7d9-444a-4b80-9a8d-f48d60fabe6d');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 497, 'khiscc5kfcq2', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 04:33:17.716039+00', '2025-11-25 05:31:45.767585+00', 'lheffctvybx2', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 549, 'pjuy4pjlp65o', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 23:40:58.714379+00', '2025-11-26 00:39:58.572268+00', '33w7odkng7hn', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 499, 'h2dkekqckkvk', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 05:31:45.780535+00', '2025-11-25 06:29:45.83441+00', 'khiscc5kfcq2', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 553, '6i5mfrpabdel', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 00:51:45.882846+00', '2025-11-26 01:49:45.798343+00', 'k5wsusy4ooud', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 555, 'i4vp7qo7hfnw', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 01:38:58.807933+00', '2025-11-26 02:37:58.577376+00', 'rba6ctrn3cmn', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 501, 'wnvnody6kdut', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 06:29:45.859257+00', '2025-11-25 07:27:46.025942+00', 'h2dkekqckkvk', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 503, 'zysy5yk6fm2q', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 07:27:46.043471+00', '2025-11-25 08:25:45.901371+00', 'wnvnody6kdut', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 559, 'zq4jpqdcpoqc', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 02:47:46.214174+00', '2025-11-26 03:45:45.945978+00', 'jxqrr3izhgmw', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 561, 'kcpy7sthmlfj', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 03:36:58.833777+00', '2025-11-26 04:35:59.018787+00', '3fskl7owd5qs', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 505, 'ewlvtzob4git', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 08:25:45.917658+00', '2025-11-25 09:23:46.109211+00', 'zysy5yk6fm2q', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 507, '2exfrfagyq2h', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 09:23:46.124999+00', '2025-11-25 10:21:45.875113+00', 'ewlvtzob4git', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 565, '3hbayi4zsnnh', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 04:43:45.76219+00', '2025-11-26 05:41:45.821897+00', 'cg7mgxup372t', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 567, 'gqgyifyo247m', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 05:34:59.014831+00', '2025-11-26 06:33:58.824134+00', 'pogyvf7sgqmy', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 509, 'hgxxpgziijxf', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 10:21:45.894801+00', '2025-11-25 11:19:45.935226+00', '2exfrfagyq2h', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 571, 'bnclg5twnjmz', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 06:39:45.791224+00', '2025-11-26 07:37:45.765799+00', 'lyq7cmytc3cq', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 511, 'h5palvruwp6g', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 11:19:45.953174+00', '2025-11-25 12:17:45.809456+00', 'hgxxpgziijxf', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 573, '6fhiyydvsj37', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 07:32:59.009611+00', '2025-11-26 08:31:58.757447+00', 'opruolh2uqez', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 577, 'ltrz2ubldeg4', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 08:35:45.698586+00', '2025-11-26 09:33:45.872089+00', 'h7dn42ka7fqd', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 579, 'rq4w6impc73f', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 09:30:58.908554+00', '2025-11-26 10:29:58.400843+00', 'fbks2k7ikwi5', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 583, 'jtv2uer73x5b', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 11:28:59.128499+00', '2025-11-26 12:27:58.699209+00', 'pzlklshdewgd', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 585, 'vn3pc5krhlsg', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 13:26:58.737323+00', '2025-11-26 14:25:59.063198+00', 'awq7gknmnjyx', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 587, '6dre2goty27t', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-26 15:24:58.810754+00', '2025-11-26 16:23:58.796066+00', 'pfpqcg2raxkr', 'ac6a24ea-f306-4b38-9ad1-25a810c9ac8e');


--
-- TOC entry 4715 (class 0 OID 16858)
-- Dependencies: 367
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4716 (class 0 OID 16876)
-- Dependencies: 368
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4704 (class 0 OID 16533)
-- Dependencies: 353
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.schema_migrations VALUES ('20171026211738');
INSERT INTO auth.schema_migrations VALUES ('20171026211808');
INSERT INTO auth.schema_migrations VALUES ('20171026211834');
INSERT INTO auth.schema_migrations VALUES ('20180103212743');
INSERT INTO auth.schema_migrations VALUES ('20180108183307');
INSERT INTO auth.schema_migrations VALUES ('20180119214651');
INSERT INTO auth.schema_migrations VALUES ('20180125194653');
INSERT INTO auth.schema_migrations VALUES ('00');
INSERT INTO auth.schema_migrations VALUES ('20210710035447');
INSERT INTO auth.schema_migrations VALUES ('20210722035447');
INSERT INTO auth.schema_migrations VALUES ('20210730183235');
INSERT INTO auth.schema_migrations VALUES ('20210909172000');
INSERT INTO auth.schema_migrations VALUES ('20210927181326');
INSERT INTO auth.schema_migrations VALUES ('20211122151130');
INSERT INTO auth.schema_migrations VALUES ('20211124214934');
INSERT INTO auth.schema_migrations VALUES ('20211202183645');
INSERT INTO auth.schema_migrations VALUES ('20220114185221');
INSERT INTO auth.schema_migrations VALUES ('20220114185340');
INSERT INTO auth.schema_migrations VALUES ('20220224000811');
INSERT INTO auth.schema_migrations VALUES ('20220323170000');
INSERT INTO auth.schema_migrations VALUES ('20220429102000');
INSERT INTO auth.schema_migrations VALUES ('20220531120530');
INSERT INTO auth.schema_migrations VALUES ('20220614074223');
INSERT INTO auth.schema_migrations VALUES ('20220811173540');
INSERT INTO auth.schema_migrations VALUES ('20221003041349');
INSERT INTO auth.schema_migrations VALUES ('20221003041400');
INSERT INTO auth.schema_migrations VALUES ('20221011041400');
INSERT INTO auth.schema_migrations VALUES ('20221020193600');
INSERT INTO auth.schema_migrations VALUES ('20221021073300');
INSERT INTO auth.schema_migrations VALUES ('20221021082433');
INSERT INTO auth.schema_migrations VALUES ('20221027105023');
INSERT INTO auth.schema_migrations VALUES ('20221114143122');
INSERT INTO auth.schema_migrations VALUES ('20221114143410');
INSERT INTO auth.schema_migrations VALUES ('20221125140132');
INSERT INTO auth.schema_migrations VALUES ('20221208132122');
INSERT INTO auth.schema_migrations VALUES ('20221215195500');
INSERT INTO auth.schema_migrations VALUES ('20221215195800');
INSERT INTO auth.schema_migrations VALUES ('20221215195900');
INSERT INTO auth.schema_migrations VALUES ('20230116124310');
INSERT INTO auth.schema_migrations VALUES ('20230116124412');
INSERT INTO auth.schema_migrations VALUES ('20230131181311');
INSERT INTO auth.schema_migrations VALUES ('20230322519590');
INSERT INTO auth.schema_migrations VALUES ('20230402418590');
INSERT INTO auth.schema_migrations VALUES ('20230411005111');
INSERT INTO auth.schema_migrations VALUES ('20230508135423');
INSERT INTO auth.schema_migrations VALUES ('20230523124323');
INSERT INTO auth.schema_migrations VALUES ('20230818113222');
INSERT INTO auth.schema_migrations VALUES ('20230914180801');
INSERT INTO auth.schema_migrations VALUES ('20231027141322');
INSERT INTO auth.schema_migrations VALUES ('20231114161723');
INSERT INTO auth.schema_migrations VALUES ('20231117164230');
INSERT INTO auth.schema_migrations VALUES ('20240115144230');
INSERT INTO auth.schema_migrations VALUES ('20240214120130');
INSERT INTO auth.schema_migrations VALUES ('20240306115329');
INSERT INTO auth.schema_migrations VALUES ('20240314092811');
INSERT INTO auth.schema_migrations VALUES ('20240427152123');
INSERT INTO auth.schema_migrations VALUES ('20240612123726');
INSERT INTO auth.schema_migrations VALUES ('20240729123726');
INSERT INTO auth.schema_migrations VALUES ('20240802193726');
INSERT INTO auth.schema_migrations VALUES ('20240806073726');
INSERT INTO auth.schema_migrations VALUES ('20241009103726');
INSERT INTO auth.schema_migrations VALUES ('20250717082212');
INSERT INTO auth.schema_migrations VALUES ('20250731150234');
INSERT INTO auth.schema_migrations VALUES ('20250804100000');
INSERT INTO auth.schema_migrations VALUES ('20250901200500');
INSERT INTO auth.schema_migrations VALUES ('20250903112500');
INSERT INTO auth.schema_migrations VALUES ('20250904133000');
INSERT INTO auth.schema_migrations VALUES ('20250925093508');
INSERT INTO auth.schema_migrations VALUES ('20251007112900');
INSERT INTO auth.schema_migrations VALUES ('20251104100000');
INSERT INTO auth.schema_migrations VALUES ('20251111201300');


--
-- TOC entry 4709 (class 0 OID 16757)
-- Dependencies: 361
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.sessions VALUES ('ac6a24ea-f306-4b38-9ad1-25a810c9ac8e', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-25 13:51:14.597842+00', '2025-11-26 20:33:37.813893+00', NULL, 'aal1', NULL, '2025-11-26 20:33:37.813792', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '186.225.138.87', NULL, NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('01d70851-717a-4a8a-9eac-bcd489016b50', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', '2025-11-26 20:31:56.967628+00', '2025-11-27 00:27:58.82026+00', NULL, 'aal1', NULL, '2025-11-27 00:27:58.819543', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '186.225.138.87', NULL, NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('7a35a9cd-9dd5-45e4-9a28-261914267fe7', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-25 00:42:06.472892+00', '2025-11-27 00:33:54.741821+00', NULL, 'aal1', NULL, '2025-11-27 00:33:54.74172', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '189.68.174.182', NULL, NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('84e9bdc1-fbe6-49cc-937d-3da77dce8110', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', '2025-11-27 00:36:47.533356+00', '2025-11-27 00:36:47.533356+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '189.68.174.182', NULL, NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('1469c7d9-444a-4b80-9a8d-f48d60fabe6d', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-25 15:13:20.604576+00', '2025-11-26 00:07:34.747574+00', NULL, 'aal1', NULL, '2025-11-26 00:07:34.747462', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '189.68.174.182', NULL, NULL, NULL, NULL, NULL);


--
-- TOC entry 4714 (class 0 OID 16843)
-- Dependencies: 366
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4713 (class 0 OID 16834)
-- Dependencies: 365
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4699 (class 0 OID 16495)
-- Dependencies: 348
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', 'f2bb6acc-835a-414c-8856-836415b23896', 'authenticated', 'authenticated', 'profissional@capifit.com', '$2a$10$dk.qa.nLD7wm3wkqohwtMeYT1Qt1jW.ublImwK5/gVPVc4lFw3MJ2', '2025-11-16 22:09:35.759426+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 15:13:20.603843+00', '{"provider": "email", "providers": ["email"]}', '{"role": "professional", "phone": "(17) 98803-1873", "full_name": "Giuliano Moretti Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg", "email_verified": true}', NULL, '2025-11-16 22:09:35.744308+00', '2025-11-27 00:33:54.739731+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', 'c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', 'authenticated', 'authenticated', 'admin@capifit.com', '$2a$10$MZ6JN.1Cid87Ze/ntbc/cubpoNEYiaC77VBvw8etFf0ecZqQkdq2a', '2025-11-16 22:10:09.629885+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-16 23:47:16.875772+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-16 22:10:09.626622+00', '2025-11-16 23:47:16.880781+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', '7171a1a8-524b-4cee-9040-886c74afe93f', 'authenticated', 'authenticated', 'cliente@capifit.com', '$2a$10$jE025Etdhl6forKhm4vtKOjVSH7WmlQ2MSAF1M196DXtkcVspFxI.', '2025-11-26 19:46:42.713604+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-26 19:46:42.693884+00', '2025-11-26 19:46:42.715755+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'authenticated', 'authenticated', 'cliente1@capifit.com', '$2a$10$RSBXDZVWHGGH.3hUsUjMde1XkU3ufrE2Gpp2EFvd8yMjN4TKNe8DS', '2025-11-26 20:31:24.801059+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-27 00:36:47.533249+00', '{"provider": "email", "providers": ["email"]}', '{"phone": "(17) 3236-6250", "full_name": "Vinicius Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/bf547c35-e240-45db-bdb1-5a1fc4bc8081/avatar-1764189260243.jpg?t=1764189261462", "email_verified": true}', NULL, '2025-11-26 20:31:24.783033+00', '2025-11-27 00:36:47.560058+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);


--
-- TOC entry 4760 (class 0 OID 29858)
-- Dependencies: 416
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.achievements VALUES ('93805202-9c72-45e3-9e10-2baca8eaed17', 'LEG_DAY_KING', 'Rei do Leg Day', 'Complete 5 treinos de perna.', NULL, 500, '{"type": "count", "target": 5, "keyword": "leg", "activity_type": "strength"}', '2025-11-25 16:58:25.490365+00');
INSERT INTO public.achievements VALUES ('4a485e79-431b-4a54-9b42-73fd1369faf8', 'WEEKEND_WARRIOR', 'Guerreiro de Fim de Semana', 'Queime mais de 1000 calorias no fim de semana.', NULL, 300, '{"days": ["Saturday", "Sunday"], "type": "calories", "target": 1000}', '2025-11-25 16:58:25.490365+00');
INSERT INTO public.achievements VALUES ('a2c11a14-c54c-4cdf-a0d2-ed8ee643b477', 'DATA_MARATHON', 'Maratonista de Dados', 'Conecte 3 apps externos.', NULL, 1000, '{"type": "connection", "target": 3}', '2025-11-25 16:58:25.490365+00');
INSERT INTO public.achievements VALUES ('74800002-4630-445e-bc45-2bf8dab8bf9b', 'STREAK_7', 'Consistência de Ferro', 'Mantenha uma ofensiva de 7 dias.', NULL, 700, '{"type": "streak", "target": 7}', '2025-11-25 16:58:25.490365+00');


--
-- TOC entry 4747 (class 0 OID 17790)
-- Dependencies: 403
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4746 (class 0 OID 17774)
-- Dependencies: 402
-- Data for Name: biometric_data; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4748 (class 0 OID 17813)
-- Dependencies: 404
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.chat_messages VALUES ('1698f0c8-e3c6-4770-8b88-6e768afcb89b', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, false, '2025-11-27 01:09:07.935024+00', NULL, '2025-11-27 01:09:07.935024+00', '2025-11-27 01:09:07.935024+00');
INSERT INTO public.chat_messages VALUES ('0f662767-b09d-45e1-a227-3850baee61b0', 'f2bb6acc-835a-414c-8856-836415b23896', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'teste', 'text', NULL, false, '2025-11-27 01:10:12.611267+00', NULL, '2025-11-27 01:10:12.611267+00', '2025-11-27 01:10:12.611267+00');


--
-- TOC entry 4731 (class 0 OID 17482)
-- Dependencies: 387
-- Data for Name: client_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_details VALUES ('bf547c35-e240-45db-bdb1-5a1fc4bc8081', '', '{"smoker": false, "alcohol": "never", "injuries": "", "symptoms": ["Fraqueza"], "allergies": "", "surgeries": "", "occupation": "Auxiliar Administrativo", "work_hours": "", "medications": "", "sleep_hours": "4", "supplements": "", "diet_history": "", "stress_level": "", "water_intake": "2", "sleep_quality": "average", "activity_level": "sedentary", "family_history": "", "food_aversions": "", "work_activities": ["Sentar na cadeira"], "diagnosed_conditions": ["Anemia"]}', NULL, '', '2025-11-26 20:34:28.304168+00', '2025-11-26 20:34:27.949+00');


--
-- TOC entry 4743 (class 0 OID 17708)
-- Dependencies: 399
-- Data for Name: client_meal_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_meal_plans VALUES ('3b816525-e335-4f8f-827b-ba6902e1b23c', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'abc28005-3841-4e16-a20d-77496f245e47', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-26', NULL, 'active', NULL, '2025-11-26 20:35:16.909971+00', '2025-11-26 20:35:16.909971+00');


--
-- TOC entry 4732 (class 0 OID 17496)
-- Dependencies: 388
-- Data for Name: client_professionals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_professionals VALUES ('c1f5351e-9f2d-4330-86fe-d58a92e22300', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'f2bb6acc-835a-414c-8856-836415b23896', 'active', '2025-11-26 20:31:46.338+00', NULL, NULL);


--
-- TOC entry 4736 (class 0 OID 17571)
-- Dependencies: 392
-- Data for Name: client_workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_workouts VALUES ('4bec07c2-2fa3-4aaf-b34f-609a4ea41276', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', '03e89f3e-8752-4333-996b-a00717743216', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-26', NULL, 'active', NULL, '2025-11-26 20:34:56.836914+00', '2025-11-26 20:34:56.836914+00');


--
-- TOC entry 4733 (class 0 OID 17519)
-- Dependencies: 389
-- Data for Name: exercises_library; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.exercises_library VALUES ('b3a7592c-33bb-4255-b167-225fe69aceb5', 'Supino Inclinado', 'Concentrado com 2 segundos de contração.', '{"Peito superior e Ombros"}', '{Halteres}', 'intermediate', 'https://www.youtube.com/watch?v=WP1VLAt8hbM', NULL, NULL, NULL, 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-16 23:25:34.674338+00', '2025-11-17 03:23:39.607973+00');
INSERT INTO public.exercises_library VALUES ('b42e4102-659a-4aea-89e6-a8f0914e85a9', 'Supino Reto', 'Concentrado com 2 segundos de contração.', '{"Peito e Ombros"}', '{Halteres}', 'beginner', 'https://youtu.be/72UUJVBuT7o', NULL, NULL, NULL, 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-16 23:17:43.822207+00', '2025-11-18 04:12:56.616597+00');


--
-- TOC entry 4738 (class 0 OID 17618)
-- Dependencies: 394
-- Data for Name: foods_library; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.foods_library VALUES ('b35d98b3-82e5-4d9e-9d40-367e10437118', 'Arroz Branco', 'Tio João', 'Carboidratos', 100.00, 128.00, 2.50, 28.10, 0.20, NULL, NULL, NULL, 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-17 09:46:55.077513+00', '2025-11-22 00:52:24.578733+00');


--
-- TOC entry 4744 (class 0 OID 17735)
-- Dependencies: 400
-- Data for Name: meal_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4742 (class 0 OID 17684)
-- Dependencies: 398
-- Data for Name: meal_plan_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.meal_plan_items VALUES ('47faad1e-c94f-465a-9447-5a9af166f5de', 'abc28005-3841-4e16-a20d-77496f245e47', 1, 1, 'Almoço', 'b35d98b3-82e5-4d9e-9d40-367e10437118', NULL, 100.00, 'teste');


--
-- TOC entry 4741 (class 0 OID 17668)
-- Dependencies: 397
-- Data for Name: meal_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.meal_plans VALUES ('abc28005-3841-4e16-a20d-77496f245e47', 'Plano de Emagrecimento e ganho de massa muscular', 'teste', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 2000.00, 150.00, 250.00, 65.00, false, '2025-11-17 09:47:42.611172+00', '2025-11-17 09:47:42.611172+00');


--
-- TOC entry 4730 (class 0 OID 17466)
-- Dependencies: 386
-- Data for Name: professional_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.professional_details VALUES ('f2bb6acc-835a-414c-8856-836415b23896', 'personal_trainer', 'teste', '{"raw_text": "teste"}', 100.00, NULL, true, '2025-11-22 19:09:25.500172+00', '2025-11-24 11:27:25.476318+00');


--
-- TOC entry 4750 (class 0 OID 22388)
-- Dependencies: 406
-- Data for Name: professional_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4729 (class 0 OID 17451)
-- Dependencies: 385
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.profiles VALUES ('bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'cliente1@capifit.com', 'Vinicius Santos Garcia', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/bf547c35-e240-45db-bdb1-5a1fc4bc8081/avatar-1764189260243.jpg?t=1764189261462', '(17) 3236-6250', 'client', '2025-11-26 20:31:24.782035+00', '2025-11-27 01:12:55.996996+00', 201, 1);
INSERT INTO public.profiles VALUES ('c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', 'admin@capifit.com', 'Administrador', NULL, NULL, 'admin', '2025-11-16 22:10:09.626227+00', '2025-11-17 07:16:33.067738+00', 0, 1);
INSERT INTO public.profiles VALUES ('f2bb6acc-835a-414c-8856-836415b23896', 'profissional@capifit.com', 'Giuliano Moretti Santos Garcia', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg', '(17) 98803-1873', 'professional', '2025-11-16 22:09:35.743201+00', '2025-11-24 11:27:24.812452+00', 0, 1);
INSERT INTO public.profiles VALUES ('7171a1a8-524b-4cee-9040-886c74afe93f', 'cliente@capifit.com', NULL, NULL, NULL, 'client', '2025-11-26 19:46:42.693554+00', '2025-11-26 19:46:42.693554+00', 0, 1);


--
-- TOC entry 4745 (class 0 OID 17760)
-- Dependencies: 401
-- Data for Name: progress_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4740 (class 0 OID 17650)
-- Dependencies: 396
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4739 (class 0 OID 17634)
-- Dependencies: 395
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4761 (class 0 OID 29871)
-- Dependencies: 417
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4759 (class 0 OID 28702)
-- Dependencies: 415
-- Data for Name: workout_execution_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workout_execution_logs VALUES ('1081fb2a-2d58-4860-b5d1-43d3465a89f2', '0690fdab-eeba-40be-bf90-ad00aab3efeb', 'b3a7592c-33bb-4255-b167-225fe69aceb5', 'f06daea9-e0be-480d-aa9c-2cf79c3c30c6', 20, 10, '', '2025-11-26 20:36:15.104+00');
INSERT INTO public.workout_execution_logs VALUES ('ac37a499-a210-4a43-84f4-bec2943f7c63', '0690fdab-eeba-40be-bf90-ad00aab3efeb', 'b42e4102-659a-4aea-89e6-a8f0914e85a9', '9d9d40fd-8b25-46d6-8d5a-4cd0937c1517', 20, 10, '', '2025-11-26 20:36:21.121+00');
INSERT INTO public.workout_execution_logs VALUES ('a0dd6a9b-ddfa-43ec-8268-2e6e324b56b8', '7126abe6-23ed-4adb-837f-c36d9e5d73bb', 'b3a7592c-33bb-4255-b167-225fe69aceb5', 'f06daea9-e0be-480d-aa9c-2cf79c3c30c6', 20, 10, '', '2025-11-27 01:13:24.556+00');
INSERT INTO public.workout_execution_logs VALUES ('a3a72348-793a-4576-a388-70d9c3661162', '7126abe6-23ed-4adb-837f-c36d9e5d73bb', 'b42e4102-659a-4aea-89e6-a8f0914e85a9', '9d9d40fd-8b25-46d6-8d5a-4cd0937c1517', 20, 10, '', '2025-11-27 01:13:31.564+00');


--
-- TOC entry 4735 (class 0 OID 17553)
-- Dependencies: 391
-- Data for Name: workout_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workout_exercises VALUES ('f06daea9-e0be-480d-aa9c-2cf79c3c30c6', '03e89f3e-8752-4333-996b-a00717743216', 'b3a7592c-33bb-4255-b167-225fe69aceb5', 1, 99, 3, '10', 0.00, 60, '');
INSERT INTO public.workout_exercises VALUES ('9d9d40fd-8b25-46d6-8d5a-4cd0937c1517', '03e89f3e-8752-4333-996b-a00717743216', 'b42e4102-659a-4aea-89e6-a8f0914e85a9', 1, 99, 3, '10', 0.00, 60, '');


--
-- TOC entry 4737 (class 0 OID 17598)
-- Dependencies: 393
-- Data for Name: workout_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4749 (class 0 OID 20118)
-- Dependencies: 405
-- Data for Name: workout_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workout_sessions VALUES ('0690fdab-eeba-40be-bf90-ad00aab3efeb', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'f2bb6acc-835a-414c-8856-836415b23896', '03e89f3e-8752-4333-996b-a00717743216', '4bec07c2-2fa3-4aaf-b34f-609a4ea41276', '2025-11-26 20:36:06.989907+00', '2025-11-26 20:37:10.726+00', 64, 'completed', '2025-11-26 20:36:06.989907+00', '2025-11-26 20:37:11.520881+00', 'manual', NULL, 0.50, 1.28, NULL, NULL, NULL, NULL, 0, 'strength');
INSERT INTO public.workout_sessions VALUES ('7126abe6-23ed-4adb-837f-c36d9e5d73bb', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', 'f2bb6acc-835a-414c-8856-836415b23896', '03e89f3e-8752-4333-996b-a00717743216', '4bec07c2-2fa3-4aaf-b34f-609a4ea41276', '2025-11-27 01:12:25.222898+00', '2025-11-27 01:13:47.404+00', 82, 'completed', '2025-11-27 01:12:25.222898+00', '2025-11-27 01:12:55.450276+00', 'manual', NULL, 0.50, 1.64, NULL, NULL, NULL, NULL, 0, 'strength');


--
-- TOC entry 4734 (class 0 OID 17536)
-- Dependencies: 390
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workouts VALUES ('03e89f3e-8752-4333-996b-a00717743216', 'Treino de Hipertrofia - 4 semanas', 'Teste de Hipertrofia', 'f2bb6acc-835a-414c-8856-836415b23896', 'Hipertrofia', 4, 3, false, '2025-11-16 23:18:18.76594+00', '2025-11-20 02:23:57.610749+00');


--
-- TOC entry 4753 (class 0 OID 22572)
-- Dependencies: 409
-- Data for Name: messages_2025_11_23; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4754 (class 0 OID 24982)
-- Dependencies: 410
-- Data for Name: messages_2025_11_24; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4755 (class 0 OID 25020)
-- Dependencies: 411
-- Data for Name: messages_2025_11_25; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4756 (class 0 OID 26290)
-- Dependencies: 412
-- Data for Name: messages_2025_11_26; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4757 (class 0 OID 27574)
-- Dependencies: 413
-- Data for Name: messages_2025_11_27; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4758 (class 0 OID 28690)
-- Dependencies: 414
-- Data for Name: messages_2025_11_28; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4762 (class 0 OID 29966)
-- Dependencies: 418
-- Data for Name: messages_2025_11_29; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4725 (class 0 OID 17225)
-- Dependencies: 377
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

INSERT INTO realtime.schema_migrations VALUES (20211116024918, '2025-11-16 15:22:37');
INSERT INTO realtime.schema_migrations VALUES (20211116045059, '2025-11-16 15:22:39');
INSERT INTO realtime.schema_migrations VALUES (20211116050929, '2025-11-16 15:22:41');
INSERT INTO realtime.schema_migrations VALUES (20211116051442, '2025-11-16 15:22:43');
INSERT INTO realtime.schema_migrations VALUES (20211116212300, '2025-11-16 15:22:45');
INSERT INTO realtime.schema_migrations VALUES (20211116213355, '2025-11-16 15:22:46');
INSERT INTO realtime.schema_migrations VALUES (20211116213934, '2025-11-16 15:22:48');
INSERT INTO realtime.schema_migrations VALUES (20211116214523, '2025-11-16 15:22:50');
INSERT INTO realtime.schema_migrations VALUES (20211122062447, '2025-11-16 15:22:52');
INSERT INTO realtime.schema_migrations VALUES (20211124070109, '2025-11-16 15:22:54');
INSERT INTO realtime.schema_migrations VALUES (20211202204204, '2025-11-16 15:22:55');
INSERT INTO realtime.schema_migrations VALUES (20211202204605, '2025-11-16 15:22:57');
INSERT INTO realtime.schema_migrations VALUES (20211210212804, '2025-11-16 15:23:02');
INSERT INTO realtime.schema_migrations VALUES (20211228014915, '2025-11-16 15:23:04');
INSERT INTO realtime.schema_migrations VALUES (20220107221237, '2025-11-16 15:23:05');
INSERT INTO realtime.schema_migrations VALUES (20220228202821, '2025-11-16 15:23:07');
INSERT INTO realtime.schema_migrations VALUES (20220312004840, '2025-11-16 15:23:09');
INSERT INTO realtime.schema_migrations VALUES (20220603231003, '2025-11-16 15:23:11');
INSERT INTO realtime.schema_migrations VALUES (20220603232444, '2025-11-16 15:23:13');
INSERT INTO realtime.schema_migrations VALUES (20220615214548, '2025-11-16 15:23:15');
INSERT INTO realtime.schema_migrations VALUES (20220712093339, '2025-11-16 15:23:17');
INSERT INTO realtime.schema_migrations VALUES (20220908172859, '2025-11-16 15:23:18');
INSERT INTO realtime.schema_migrations VALUES (20220916233421, '2025-11-16 15:23:20');
INSERT INTO realtime.schema_migrations VALUES (20230119133233, '2025-11-16 15:23:22');
INSERT INTO realtime.schema_migrations VALUES (20230128025114, '2025-11-16 15:23:24');
INSERT INTO realtime.schema_migrations VALUES (20230128025212, '2025-11-16 15:23:26');
INSERT INTO realtime.schema_migrations VALUES (20230227211149, '2025-11-16 15:23:27');
INSERT INTO realtime.schema_migrations VALUES (20230228184745, '2025-11-16 15:23:29');
INSERT INTO realtime.schema_migrations VALUES (20230308225145, '2025-11-16 15:23:30');
INSERT INTO realtime.schema_migrations VALUES (20230328144023, '2025-11-16 15:23:32');
INSERT INTO realtime.schema_migrations VALUES (20231018144023, '2025-11-16 15:23:34');
INSERT INTO realtime.schema_migrations VALUES (20231204144023, '2025-11-16 15:23:37');
INSERT INTO realtime.schema_migrations VALUES (20231204144024, '2025-11-16 15:23:38');
INSERT INTO realtime.schema_migrations VALUES (20231204144025, '2025-11-16 15:23:40');
INSERT INTO realtime.schema_migrations VALUES (20240108234812, '2025-11-16 15:23:42');
INSERT INTO realtime.schema_migrations VALUES (20240109165339, '2025-11-16 15:23:43');
INSERT INTO realtime.schema_migrations VALUES (20240227174441, '2025-11-16 15:23:46');
INSERT INTO realtime.schema_migrations VALUES (20240311171622, '2025-11-16 15:23:48');
INSERT INTO realtime.schema_migrations VALUES (20240321100241, '2025-11-16 15:23:52');
INSERT INTO realtime.schema_migrations VALUES (20240401105812, '2025-11-16 15:23:57');
INSERT INTO realtime.schema_migrations VALUES (20240418121054, '2025-11-16 15:23:59');
INSERT INTO realtime.schema_migrations VALUES (20240523004032, '2025-11-16 15:24:05');
INSERT INTO realtime.schema_migrations VALUES (20240618124746, '2025-11-16 15:24:07');
INSERT INTO realtime.schema_migrations VALUES (20240801235015, '2025-11-16 15:24:08');
INSERT INTO realtime.schema_migrations VALUES (20240805133720, '2025-11-16 15:24:10');
INSERT INTO realtime.schema_migrations VALUES (20240827160934, '2025-11-16 15:24:12');
INSERT INTO realtime.schema_migrations VALUES (20240919163303, '2025-11-16 15:24:14');
INSERT INTO realtime.schema_migrations VALUES (20240919163305, '2025-11-16 15:24:15');
INSERT INTO realtime.schema_migrations VALUES (20241019105805, '2025-11-16 15:24:17');
INSERT INTO realtime.schema_migrations VALUES (20241030150047, '2025-11-16 15:24:23');
INSERT INTO realtime.schema_migrations VALUES (20241108114728, '2025-11-16 15:24:25');
INSERT INTO realtime.schema_migrations VALUES (20241121104152, '2025-11-16 15:24:27');
INSERT INTO realtime.schema_migrations VALUES (20241130184212, '2025-11-16 15:24:29');
INSERT INTO realtime.schema_migrations VALUES (20241220035512, '2025-11-16 15:24:31');
INSERT INTO realtime.schema_migrations VALUES (20241220123912, '2025-11-16 15:24:32');
INSERT INTO realtime.schema_migrations VALUES (20241224161212, '2025-11-16 15:24:34');
INSERT INTO realtime.schema_migrations VALUES (20250107150512, '2025-11-16 15:24:36');
INSERT INTO realtime.schema_migrations VALUES (20250110162412, '2025-11-16 15:24:37');
INSERT INTO realtime.schema_migrations VALUES (20250123174212, '2025-11-16 15:24:39');
INSERT INTO realtime.schema_migrations VALUES (20250128220012, '2025-11-16 15:24:40');
INSERT INTO realtime.schema_migrations VALUES (20250506224012, '2025-11-16 15:24:42');
INSERT INTO realtime.schema_migrations VALUES (20250523164012, '2025-11-16 15:24:43');
INSERT INTO realtime.schema_migrations VALUES (20250714121412, '2025-11-16 15:24:45');
INSERT INTO realtime.schema_migrations VALUES (20250905041441, '2025-11-16 15:24:47');
INSERT INTO realtime.schema_migrations VALUES (20251103001201, '2025-11-16 15:24:48');


--
-- TOC entry 4728 (class 0 OID 17289)
-- Dependencies: 381
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

INSERT INTO realtime.subscription OVERRIDING SYSTEM VALUE VALUES (1337, '8601db78-cb07-11f0-bb50-0a58a9feac02', 'public.chat_messages', '{}', '{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1764189116}], "aud": "authenticated", "exp": 1764206878, "iat": 1764203278, "iss": "https://mhjvgxukttoalvwntmyp.supabase.co/auth/v1", "sub": "bf547c35-e240-45db-bdb1-5a1fc4bc8081", "role": "authenticated", "email": "cliente1@capifit.com", "phone": "", "session_id": "01d70851-717a-4a8a-9eac-bcd489016b50", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"phone": "(17) 3236-6250", "full_name": "Vinicius Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/bf547c35-e240-45db-bdb1-5a1fc4bc8081/avatar-1764189260243.jpg?t=1764189261462", "email_verified": true}}', DEFAULT, '2025-11-27 00:28:01.585747');
INSERT INTO realtime.subscription OVERRIDING SYSTEM VALUE VALUES (1347, '9c6e8cb4-cb2d-11f0-82e6-0a58a9feac02', 'public.chat_messages', '{}', '{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1764031326}], "aud": "authenticated", "exp": 1764207234, "iat": 1764203634, "iss": "https://mhjvgxukttoalvwntmyp.supabase.co/auth/v1", "sub": "f2bb6acc-835a-414c-8856-836415b23896", "role": "authenticated", "email": "profissional@capifit.com", "phone": "", "session_id": "7a35a9cd-9dd5-45e4-9a28-261914267fe7", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"role": "professional", "phone": "(17) 98803-1873", "full_name": "Giuliano Moretti Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg", "email_verified": true}}', DEFAULT, '2025-11-27 01:08:40.734477');
INSERT INTO realtime.subscription OVERRIDING SYSTEM VALUE VALUES (1357, 'bc175018-cb2e-11f0-a212-0a58a9feac02', 'public.chat_messages', '{}', '{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1764203807}], "aud": "authenticated", "exp": 1764207407, "iat": 1764203807, "iss": "https://mhjvgxukttoalvwntmyp.supabase.co/auth/v1", "sub": "bf547c35-e240-45db-bdb1-5a1fc4bc8081", "role": "authenticated", "email": "cliente1@capifit.com", "phone": "", "session_id": "84e9bdc1-fbe6-49cc-937d-3da77dce8110", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"phone": "(17) 3236-6250", "full_name": "Vinicius Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/bf547c35-e240-45db-bdb1-5a1fc4bc8081/avatar-1764189260243.jpg?t=1764189261462", "email_verified": true}}', DEFAULT, '2025-11-27 01:16:43.345202');


--
-- TOC entry 4705 (class 0 OID 16546)
-- Dependencies: 354
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.buckets VALUES ('avatars', 'avatars', NULL, '2025-11-22 18:59:27.769694+00', '2025-11-22 18:59:27.769694+00', true, false, NULL, NULL, NULL, 'STANDARD');
INSERT INTO storage.buckets VALUES ('chat-attachments', 'chat-attachments', NULL, '2025-11-23 02:53:29.23728+00', '2025-11-23 02:53:29.23728+00', true, false, NULL, NULL, NULL, 'STANDARD');
INSERT INTO storage.buckets VALUES ('progress-photos', 'progress-photos', NULL, '2025-11-23 17:36:52.698866+00', '2025-11-23 17:36:52.698866+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- TOC entry 4726 (class 0 OID 17246)
-- Dependencies: 378
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4751 (class 0 OID 22419)
-- Dependencies: 407
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4707 (class 0 OID 16588)
-- Dependencies: 356
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.migrations VALUES (0, 'create-migrations-table', 'e18db593bcde2aca2a408c4d1100f6abba2195df', '2025-11-16 15:22:33.808268');
INSERT INTO storage.migrations VALUES (1, 'initialmigration', '6ab16121fbaa08bbd11b712d05f358f9b555d777', '2025-11-16 15:22:33.816098');
INSERT INTO storage.migrations VALUES (2, 'storage-schema', '5c7968fd083fcea04050c1b7f6253c9771b99011', '2025-11-16 15:22:33.819839');
INSERT INTO storage.migrations VALUES (3, 'pathtoken-column', '2cb1b0004b817b29d5b0a971af16bafeede4b70d', '2025-11-16 15:22:33.855635');
INSERT INTO storage.migrations VALUES (4, 'add-migrations-rls', '427c5b63fe1c5937495d9c635c263ee7a5905058', '2025-11-16 15:22:33.934357');
INSERT INTO storage.migrations VALUES (5, 'add-size-functions', '79e081a1455b63666c1294a440f8ad4b1e6a7f84', '2025-11-16 15:22:33.938766');
INSERT INTO storage.migrations VALUES (6, 'change-column-name-in-get-size', 'f93f62afdf6613ee5e7e815b30d02dc990201044', '2025-11-16 15:22:33.945503');
INSERT INTO storage.migrations VALUES (7, 'add-rls-to-buckets', 'e7e7f86adbc51049f341dfe8d30256c1abca17aa', '2025-11-16 15:22:33.949288');
INSERT INTO storage.migrations VALUES (8, 'add-public-to-buckets', 'fd670db39ed65f9d08b01db09d6202503ca2bab3', '2025-11-16 15:22:33.952771');
INSERT INTO storage.migrations VALUES (9, 'fix-search-function', '3a0af29f42e35a4d101c259ed955b67e1bee6825', '2025-11-16 15:22:33.956657');
INSERT INTO storage.migrations VALUES (10, 'search-files-search-function', '68dc14822daad0ffac3746a502234f486182ef6e', '2025-11-16 15:22:33.961376');
INSERT INTO storage.migrations VALUES (11, 'add-trigger-to-auto-update-updated_at-column', '7425bdb14366d1739fa8a18c83100636d74dcaa2', '2025-11-16 15:22:33.966287');
INSERT INTO storage.migrations VALUES (12, 'add-automatic-avif-detection-flag', '8e92e1266eb29518b6a4c5313ab8f29dd0d08df9', '2025-11-16 15:22:33.97698');
INSERT INTO storage.migrations VALUES (13, 'add-bucket-custom-limits', 'cce962054138135cd9a8c4bcd531598684b25e7d', '2025-11-16 15:22:33.981208');
INSERT INTO storage.migrations VALUES (14, 'use-bytes-for-max-size', '941c41b346f9802b411f06f30e972ad4744dad27', '2025-11-16 15:22:33.9852');
INSERT INTO storage.migrations VALUES (15, 'add-can-insert-object-function', '934146bc38ead475f4ef4b555c524ee5d66799e5', '2025-11-16 15:22:34.009661');
INSERT INTO storage.migrations VALUES (16, 'add-version', '76debf38d3fd07dcfc747ca49096457d95b1221b', '2025-11-16 15:22:34.013262');
INSERT INTO storage.migrations VALUES (17, 'drop-owner-foreign-key', 'f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101', '2025-11-16 15:22:34.016532');
INSERT INTO storage.migrations VALUES (18, 'add_owner_id_column_deprecate_owner', 'e7a511b379110b08e2f214be852c35414749fe66', '2025-11-16 15:22:34.02112');
INSERT INTO storage.migrations VALUES (19, 'alter-default-value-objects-id', '02e5e22a78626187e00d173dc45f58fa66a4f043', '2025-11-16 15:22:34.027228');
INSERT INTO storage.migrations VALUES (20, 'list-objects-with-delimiter', 'cd694ae708e51ba82bf012bba00caf4f3b6393b7', '2025-11-16 15:22:34.030617');
INSERT INTO storage.migrations VALUES (21, 's3-multipart-uploads', '8c804d4a566c40cd1e4cc5b3725a664a9303657f', '2025-11-16 15:22:34.038277');
INSERT INTO storage.migrations VALUES (22, 's3-multipart-uploads-big-ints', '9737dc258d2397953c9953d9b86920b8be0cdb73', '2025-11-16 15:22:34.056557');
INSERT INTO storage.migrations VALUES (23, 'optimize-search-function', '9d7e604cddc4b56a5422dc68c9313f4a1b6f132c', '2025-11-16 15:22:34.067839');
INSERT INTO storage.migrations VALUES (24, 'operation-function', '8312e37c2bf9e76bbe841aa5fda889206d2bf8aa', '2025-11-16 15:22:34.071591');
INSERT INTO storage.migrations VALUES (25, 'custom-metadata', 'd974c6057c3db1c1f847afa0e291e6165693b990', '2025-11-16 15:22:34.075204');
INSERT INTO storage.migrations VALUES (26, 'objects-prefixes', 'ef3f7871121cdc47a65308e6702519e853422ae2', '2025-11-16 15:22:34.079326');
INSERT INTO storage.migrations VALUES (27, 'search-v2', '33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2', '2025-11-16 15:22:34.092804');
INSERT INTO storage.migrations VALUES (28, 'object-bucket-name-sorting', 'ba85ec41b62c6a30a3f136788227ee47f311c436', '2025-11-16 15:22:34.466681');
INSERT INTO storage.migrations VALUES (29, 'create-prefixes', 'a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b', '2025-11-16 15:22:34.473076');
INSERT INTO storage.migrations VALUES (30, 'update-object-levels', '6c6f6cc9430d570f26284a24cf7b210599032db7', '2025-11-16 15:22:34.479315');
INSERT INTO storage.migrations VALUES (31, 'objects-level-index', '33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8', '2025-11-16 15:22:34.48598');
INSERT INTO storage.migrations VALUES (32, 'backward-compatible-index-on-objects', '2d51eeb437a96868b36fcdfb1ddefdf13bef1647', '2025-11-16 15:22:34.493353');
INSERT INTO storage.migrations VALUES (33, 'backward-compatible-index-on-prefixes', 'fe473390e1b8c407434c0e470655945b110507bf', '2025-11-16 15:22:34.501016');
INSERT INTO storage.migrations VALUES (34, 'optimize-search-function-v1', '82b0e469a00e8ebce495e29bfa70a0797f7ebd2c', '2025-11-16 15:22:34.50278');
INSERT INTO storage.migrations VALUES (35, 'add-insert-trigger-prefixes', '63bb9fd05deb3dc5e9fa66c83e82b152f0caf589', '2025-11-16 15:22:34.508724');
INSERT INTO storage.migrations VALUES (36, 'optimise-existing-functions', '81cf92eb0c36612865a18016a38496c530443899', '2025-11-16 15:22:34.512504');
INSERT INTO storage.migrations VALUES (37, 'add-bucket-name-length-trigger', '3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1', '2025-11-16 15:22:34.51845');
INSERT INTO storage.migrations VALUES (38, 'iceberg-catalog-flag-on-buckets', '19a8bd89d5dfa69af7f222a46c726b7c41e462c5', '2025-11-16 15:22:34.523271');
INSERT INTO storage.migrations VALUES (39, 'add-search-v2-sort-support', '39cf7d1e6bf515f4b02e41237aba845a7b492853', '2025-11-16 15:22:34.531829');
INSERT INTO storage.migrations VALUES (40, 'fix-prefix-race-conditions-optimized', 'fd02297e1c67df25a9fc110bf8c8a9af7fb06d1f', '2025-11-16 15:22:34.536603');
INSERT INTO storage.migrations VALUES (41, 'add-object-level-update-trigger', '44c22478bf01744b2129efc480cd2edc9a7d60e9', '2025-11-16 15:22:34.544831');
INSERT INTO storage.migrations VALUES (42, 'rollback-prefix-triggers', 'f2ab4f526ab7f979541082992593938c05ee4b47', '2025-11-16 15:22:34.549226');
INSERT INTO storage.migrations VALUES (43, 'fix-object-level', 'ab837ad8f1c7d00cc0b7310e989a23388ff29fc6', '2025-11-16 15:22:34.555618');
INSERT INTO storage.migrations VALUES (44, 'vector-bucket-type', '99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3', '2025-11-19 12:23:34.410833');
INSERT INTO storage.migrations VALUES (45, 'vector-buckets', '049e27196d77a7cb76497a85afae669d8b230953', '2025-11-19 12:23:34.433589');
INSERT INTO storage.migrations VALUES (46, 'buckets-objects-grants', 'fedeb96d60fefd8e02ab3ded9fbde05632f84aed', '2025-11-19 12:23:34.488659');
INSERT INTO storage.migrations VALUES (47, 'iceberg-table-metadata', '649df56855c24d8b36dd4cc1aeb8251aa9ad42c2', '2025-11-19 12:23:34.495051');
INSERT INTO storage.migrations VALUES (48, 'iceberg-catalog-ids', '2666dff93346e5d04e0a878416be1d5fec345d6f', '2025-11-19 12:23:34.499393');


--
-- TOC entry 4706 (class 0 OID 16561)
-- Dependencies: 355
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.objects VALUES ('df10326f-f884-4e21-af56-0c6547d721cf', 'avatars', 'f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22 19:31:44.95827+00', '2025-11-22 19:31:44.95827+00', '2025-11-22 19:31:44.95827+00', '{"eTag": "\"b50bde7d77a4189c68a03d590738b5e3\"", "size": 385313, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:31:45.000Z", "contentLength": 385313, "httpStatusCode": 200}', DEFAULT, 'bf16cb61-9942-467b-b13e-1b3e56cc3648', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('45bc2558-8e8b-4a8f-af43-409a7f795d6c', 'avatars', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081/avatar-1764189260243.jpg', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', '2025-11-26 20:34:21.523619+00', '2025-11-26 20:34:21.523619+00', '2025-11-26 20:34:21.523619+00', '{"eTag": "\"7d951db06cc55618a32288428f1e9762\"", "size": 34741, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-26T20:34:22.000Z", "contentLength": 34741, "httpStatusCode": 200}', DEFAULT, '48441b3e-1882-4bf1-9df0-f90947781053', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', '{}', 2);


--
-- TOC entry 4724 (class 0 OID 17197)
-- Dependencies: 376
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.prefixes VALUES ('avatars', 'f2bb6acc-835a-414c-8856-836415b23896', DEFAULT, '2025-11-22 19:02:03.48467+00', '2025-11-22 19:02:03.48467+00');
INSERT INTO storage.prefixes VALUES ('avatars', 'bf547c35-e240-45db-bdb1-5a1fc4bc8081', DEFAULT, '2025-11-26 20:34:21.523619+00', '2025-11-26 20:34:21.523619+00');


--
-- TOC entry 4722 (class 0 OID 17144)
-- Dependencies: 374
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4723 (class 0 OID 17158)
-- Dependencies: 375
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4752 (class 0 OID 22429)
-- Dependencies: 408
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 3818 (class 0 OID 16658)
-- Dependencies: 357
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- TOC entry 4981 (class 0 OID 0)
-- Dependencies: 349
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 599, true);


--
-- TOC entry 4982 (class 0 OID 0)
-- Dependencies: 380
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1357, true);


--
-- TOC entry 4108 (class 2606 OID 16829)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4062 (class 2606 OID 16531)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4131 (class 2606 OID 16935)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4086 (class 2606 OID 16953)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4088 (class 2606 OID 16963)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4060 (class 2606 OID 16524)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4110 (class 2606 OID 16822)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4106 (class 2606 OID 16810)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4098 (class 2606 OID 17003)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4100 (class 2606 OID 16797)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4144 (class 2606 OID 17062)
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- TOC entry 4146 (class 2606 OID 17060)
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- TOC entry 4148 (class 2606 OID 17058)
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4141 (class 2606 OID 17022)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4152 (class 2606 OID 17084)
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- TOC entry 4154 (class 2606 OID 17086)
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- TOC entry 4135 (class 2606 OID 16988)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4054 (class 2606 OID 16514)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4057 (class 2606 OID 16740)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4120 (class 2606 OID 16869)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4122 (class 2606 OID 16867)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4127 (class 2606 OID 16883)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4065 (class 2606 OID 16537)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4093 (class 2606 OID 16761)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4117 (class 2606 OID 16850)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4112 (class 2606 OID 16841)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4047 (class 2606 OID 16923)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4049 (class 2606 OID 16501)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4275 (class 2606 OID 29870)
-- Name: achievements achievements_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_code_key UNIQUE (code);


--
-- TOC entry 4277 (class 2606 OID 29868)
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 4231 (class 2606 OID 17802)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 4226 (class 2606 OID 17784)
-- Name: biometric_data biometric_data_client_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_data
    ADD CONSTRAINT biometric_data_client_id_date_key UNIQUE (client_id, date);


--
-- TOC entry 4228 (class 2606 OID 17782)
-- Name: biometric_data biometric_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_data
    ADD CONSTRAINT biometric_data_pkey PRIMARY KEY (id);


--
-- TOC entry 4235 (class 2606 OID 17824)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4182 (class 2606 OID 17490)
-- Name: client_details client_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_details
    ADD CONSTRAINT client_details_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 4216 (class 2606 OID 17719)
-- Name: client_meal_plans client_meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT client_meal_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4184 (class 2606 OID 17508)
-- Name: client_professionals client_professionals_client_id_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT client_professionals_client_id_professional_id_key UNIQUE (client_id, professional_id);


--
-- TOC entry 4186 (class 2606 OID 17506)
-- Name: client_professionals client_professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT client_professionals_pkey PRIMARY KEY (id);


--
-- TOC entry 4198 (class 2606 OID 17582)
-- Name: client_workouts client_workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT client_workouts_pkey PRIMARY KEY (id);


--
-- TOC entry 4190 (class 2606 OID 17530)
-- Name: exercises_library exercises_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises_library
    ADD CONSTRAINT exercises_library_pkey PRIMARY KEY (id);


--
-- TOC entry 4204 (class 2606 OID 17628)
-- Name: foods_library foods_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods_library
    ADD CONSTRAINT foods_library_pkey PRIMARY KEY (id);


--
-- TOC entry 4221 (class 2606 OID 17744)
-- Name: meal_logs meal_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT meal_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4214 (class 2606 OID 17692)
-- Name: meal_plan_items meal_plan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT meal_plan_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4211 (class 2606 OID 17678)
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4180 (class 2606 OID 17476)
-- Name: professional_details professional_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_details
    ADD CONSTRAINT professional_details_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 4248 (class 2606 OID 22397)
-- Name: professional_notifications professional_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_notifications
    ADD CONSTRAINT professional_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4178 (class 2606 OID 17460)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4224 (class 2606 OID 17768)
-- Name: progress_photos progress_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_photos
    ADD CONSTRAINT progress_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4208 (class 2606 OID 17657)
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- TOC entry 4206 (class 2606 OID 17644)
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- TOC entry 4279 (class 2606 OID 29877)
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- TOC entry 4281 (class 2606 OID 29879)
-- Name: user_achievements user_achievements_user_id_achievement_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id);


--
-- TOC entry 4273 (class 2606 OID 28710)
-- Name: workout_execution_logs workout_execution_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_execution_logs
    ADD CONSTRAINT workout_execution_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4196 (class 2606 OID 17560)
-- Name: workout_exercises workout_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 4202 (class 2606 OID 17607)
-- Name: workout_logs workout_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT workout_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4242 (class 2606 OID 20130)
-- Name: workout_sessions workout_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4193 (class 2606 OID 17547)
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- TOC entry 4175 (class 2606 OID 17448)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4256 (class 2606 OID 22580)
-- Name: messages_2025_11_23 messages_2025_11_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_23
    ADD CONSTRAINT messages_2025_11_23_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4259 (class 2606 OID 24990)
-- Name: messages_2025_11_24 messages_2025_11_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_24
    ADD CONSTRAINT messages_2025_11_24_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4262 (class 2606 OID 25028)
-- Name: messages_2025_11_25 messages_2025_11_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_25
    ADD CONSTRAINT messages_2025_11_25_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4265 (class 2606 OID 26298)
-- Name: messages_2025_11_26 messages_2025_11_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_26
    ADD CONSTRAINT messages_2025_11_26_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4268 (class 2606 OID 27582)
-- Name: messages_2025_11_27 messages_2025_11_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_27
    ADD CONSTRAINT messages_2025_11_27_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4271 (class 2606 OID 28698)
-- Name: messages_2025_11_28 messages_2025_11_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_28
    ADD CONSTRAINT messages_2025_11_28_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4284 (class 2606 OID 29974)
-- Name: messages_2025_11_29 messages_2025_11_29_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_29
    ADD CONSTRAINT messages_2025_11_29_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4171 (class 2606 OID 17297)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4165 (class 2606 OID 17229)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4167 (class 2606 OID 22452)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4068 (class 2606 OID 16554)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4250 (class 2606 OID 22428)
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- TOC entry 4078 (class 2606 OID 16595)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4080 (class 2606 OID 16593)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4076 (class 2606 OID 16571)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4163 (class 2606 OID 17206)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 4160 (class 2606 OID 17167)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4158 (class 2606 OID 17152)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4253 (class 2606 OID 22438)
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- TOC entry 4063 (class 1259 OID 16532)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 4037 (class 1259 OID 16750)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4038 (class 1259 OID 16752)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4039 (class 1259 OID 16753)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4096 (class 1259 OID 16831)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4129 (class 1259 OID 16939)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4084 (class 1259 OID 16919)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 4983 (class 0 OID 0)
-- Dependencies: 4084
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4089 (class 1259 OID 16747)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4132 (class 1259 OID 16936)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4133 (class 1259 OID 16937)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4104 (class 1259 OID 16942)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4101 (class 1259 OID 16803)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4102 (class 1259 OID 16948)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4142 (class 1259 OID 17073)
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- TOC entry 4139 (class 1259 OID 17026)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4149 (class 1259 OID 17099)
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4150 (class 1259 OID 17097)
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4155 (class 1259 OID 17098)
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- TOC entry 4136 (class 1259 OID 16995)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4137 (class 1259 OID 16994)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4138 (class 1259 OID 16996)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4040 (class 1259 OID 16754)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4041 (class 1259 OID 16751)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4050 (class 1259 OID 16515)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4051 (class 1259 OID 16516)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4052 (class 1259 OID 16746)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4055 (class 1259 OID 16833)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4058 (class 1259 OID 16938)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4123 (class 1259 OID 16875)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4124 (class 1259 OID 16940)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4125 (class 1259 OID 16890)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4128 (class 1259 OID 16889)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4090 (class 1259 OID 16941)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4091 (class 1259 OID 17111)
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- TOC entry 4094 (class 1259 OID 16832)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4115 (class 1259 OID 16857)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4118 (class 1259 OID 16856)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4113 (class 1259 OID 16842)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4114 (class 1259 OID 17004)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4103 (class 1259 OID 17001)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4095 (class 1259 OID 16830)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4042 (class 1259 OID 16910)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 4984 (class 0 OID 0)
-- Dependencies: 4042
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4043 (class 1259 OID 16748)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4044 (class 1259 OID 16505)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4045 (class 1259 OID 16965)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4232 (class 1259 OID 17850)
-- Name: idx_appointments_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_client ON public.appointments USING btree (client_id);


--
-- TOC entry 4233 (class 1259 OID 17849)
-- Name: idx_appointments_professional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_professional ON public.appointments USING btree (professional_id);


--
-- TOC entry 4229 (class 1259 OID 17848)
-- Name: idx_biometric_data_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_biometric_data_client ON public.biometric_data USING btree (client_id);


--
-- TOC entry 4236 (class 1259 OID 17852)
-- Name: idx_chat_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_receiver ON public.chat_messages USING btree (receiver_id);


--
-- TOC entry 4237 (class 1259 OID 17851)
-- Name: idx_chat_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id);


--
-- TOC entry 4217 (class 1259 OID 17844)
-- Name: idx_client_meal_plans_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_meal_plans_client ON public.client_meal_plans USING btree (client_id);


--
-- TOC entry 4187 (class 1259 OID 17836)
-- Name: idx_client_professionals_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_professionals_client ON public.client_professionals USING btree (client_id);


--
-- TOC entry 4188 (class 1259 OID 17837)
-- Name: idx_client_professionals_professional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_professionals_professional ON public.client_professionals USING btree (professional_id);


--
-- TOC entry 4199 (class 1259 OID 17840)
-- Name: idx_client_workouts_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_workouts_client ON public.client_workouts USING btree (client_id);


--
-- TOC entry 4218 (class 1259 OID 17845)
-- Name: idx_meal_logs_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_logs_client ON public.meal_logs USING btree (client_id);


--
-- TOC entry 4219 (class 1259 OID 17846)
-- Name: idx_meal_logs_logged_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_logs_logged_at ON public.meal_logs USING btree (logged_at);


--
-- TOC entry 4212 (class 1259 OID 17843)
-- Name: idx_meal_plan_items_plan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_plan_items_plan ON public.meal_plan_items USING btree (meal_plan_id);


--
-- TOC entry 4209 (class 1259 OID 17842)
-- Name: idx_meal_plans_nutritionist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_plans_nutritionist ON public.meal_plans USING btree (nutritionist_id);


--
-- TOC entry 4243 (class 1259 OID 22413)
-- Name: idx_professional_notifications_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_client_id ON public.professional_notifications USING btree (client_id);


--
-- TOC entry 4244 (class 1259 OID 22414)
-- Name: idx_professional_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_created_at ON public.professional_notifications USING btree (created_at DESC);


--
-- TOC entry 4245 (class 1259 OID 22412)
-- Name: idx_professional_notifications_professional_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_professional_id ON public.professional_notifications USING btree (professional_id);


--
-- TOC entry 4246 (class 1259 OID 22415)
-- Name: idx_professional_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_read ON public.professional_notifications USING btree (read);


--
-- TOC entry 4176 (class 1259 OID 17835)
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- TOC entry 4222 (class 1259 OID 17847)
-- Name: idx_progress_photos_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_photos_client ON public.progress_photos USING btree (client_id);


--
-- TOC entry 4194 (class 1259 OID 17839)
-- Name: idx_workout_exercises_workout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_exercises_workout ON public.workout_exercises USING btree (workout_id);


--
-- TOC entry 4200 (class 1259 OID 17841)
-- Name: idx_workout_logs_client_workout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_logs_client_workout ON public.workout_logs USING btree (client_workout_id);


--
-- TOC entry 4238 (class 1259 OID 20151)
-- Name: idx_workout_sessions_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_client_id ON public.workout_sessions USING btree (client_id);


--
-- TOC entry 4239 (class 1259 OID 20153)
-- Name: idx_workout_sessions_client_workout_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_client_workout_id ON public.workout_sessions USING btree (client_workout_id);


--
-- TOC entry 4240 (class 1259 OID 20152)
-- Name: idx_workout_sessions_professional_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_professional_id ON public.workout_sessions USING btree (professional_id);


--
-- TOC entry 4191 (class 1259 OID 17838)
-- Name: idx_workouts_professional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workouts_professional ON public.workouts USING btree (professional_id);


--
-- TOC entry 4169 (class 1259 OID 17449)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4173 (class 1259 OID 17450)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4254 (class 1259 OID 22581)
-- Name: messages_2025_11_23_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_23_inserted_at_topic_idx ON realtime.messages_2025_11_23 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4257 (class 1259 OID 24991)
-- Name: messages_2025_11_24_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_24_inserted_at_topic_idx ON realtime.messages_2025_11_24 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4260 (class 1259 OID 25029)
-- Name: messages_2025_11_25_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_25_inserted_at_topic_idx ON realtime.messages_2025_11_25 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4263 (class 1259 OID 26299)
-- Name: messages_2025_11_26_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_26_inserted_at_topic_idx ON realtime.messages_2025_11_26 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4266 (class 1259 OID 27583)
-- Name: messages_2025_11_27_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_27_inserted_at_topic_idx ON realtime.messages_2025_11_27 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4269 (class 1259 OID 28699)
-- Name: messages_2025_11_28_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_28_inserted_at_topic_idx ON realtime.messages_2025_11_28 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4282 (class 1259 OID 29975)
-- Name: messages_2025_11_29_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_29_inserted_at_topic_idx ON realtime.messages_2025_11_29 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4172 (class 1259 OID 17350)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4066 (class 1259 OID 16560)
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4069 (class 1259 OID 16582)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 4168 (class 1259 OID 22453)
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4156 (class 1259 OID 17178)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4070 (class 1259 OID 17224)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 4071 (class 1259 OID 17143)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4072 (class 1259 OID 17231)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 4161 (class 1259 OID 17232)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 4073 (class 1259 OID 16583)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4074 (class 1259 OID 17230)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 4251 (class 1259 OID 22444)
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- TOC entry 4285 (class 0 OID 0)
-- Name: messages_2025_11_23_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_23_inserted_at_topic_idx;


--
-- TOC entry 4286 (class 0 OID 0)
-- Name: messages_2025_11_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_23_pkey;


--
-- TOC entry 4287 (class 0 OID 0)
-- Name: messages_2025_11_24_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_24_inserted_at_topic_idx;


--
-- TOC entry 4288 (class 0 OID 0)
-- Name: messages_2025_11_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_24_pkey;


--
-- TOC entry 4289 (class 0 OID 0)
-- Name: messages_2025_11_25_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_25_inserted_at_topic_idx;


--
-- TOC entry 4290 (class 0 OID 0)
-- Name: messages_2025_11_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_25_pkey;


--
-- TOC entry 4291 (class 0 OID 0)
-- Name: messages_2025_11_26_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_26_inserted_at_topic_idx;


--
-- TOC entry 4292 (class 0 OID 0)
-- Name: messages_2025_11_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_26_pkey;


--
-- TOC entry 4293 (class 0 OID 0)
-- Name: messages_2025_11_27_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_27_inserted_at_topic_idx;


--
-- TOC entry 4294 (class 0 OID 0)
-- Name: messages_2025_11_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_27_pkey;


--
-- TOC entry 4295 (class 0 OID 0)
-- Name: messages_2025_11_28_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_28_inserted_at_topic_idx;


--
-- TOC entry 4296 (class 0 OID 0)
-- Name: messages_2025_11_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_28_pkey;


--
-- TOC entry 4297 (class 0 OID 0)
-- Name: messages_2025_11_29_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_29_inserted_at_topic_idx;


--
-- TOC entry 4298 (class 0 OID 0)
-- Name: messages_2025_11_29_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_29_pkey;


--
-- TOC entry 4366 (class 2620 OID 18128)
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- TOC entry 4387 (class 2620 OID 20160)
-- Name: workout_sessions calculate_workout_session_duration; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calculate_workout_session_duration BEFORE UPDATE ON public.workout_sessions FOR EACH ROW WHEN (((new.ended_at IS NOT NULL) AND (old.ended_at IS NULL))) EXECUTE FUNCTION public.calculate_session_duration();


--
-- TOC entry 4386 (class 2620 OID 17862)
-- Name: appointments handle_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4378 (class 2620 OID 17856)
-- Name: client_details handle_client_details_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_client_details_updated_at BEFORE UPDATE ON public.client_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4385 (class 2620 OID 17864)
-- Name: client_meal_plans handle_client_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_client_meal_plans_updated_at BEFORE UPDATE ON public.client_meal_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4381 (class 2620 OID 17863)
-- Name: client_workouts handle_client_workouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_client_workouts_updated_at BEFORE UPDATE ON public.client_workouts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4379 (class 2620 OID 17857)
-- Name: exercises_library handle_exercises_library_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_exercises_library_updated_at BEFORE UPDATE ON public.exercises_library FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4382 (class 2620 OID 17861)
-- Name: foods_library handle_foods_library_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_foods_library_updated_at BEFORE UPDATE ON public.foods_library FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4384 (class 2620 OID 17859)
-- Name: meal_plans handle_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4390 (class 2620 OID 22417)
-- Name: professional_notifications handle_notifications_created_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_notifications_created_at BEFORE INSERT ON public.professional_notifications FOR EACH ROW EXECUTE FUNCTION public.handle_notifications_updated_at();


--
-- TOC entry 4377 (class 2620 OID 17855)
-- Name: professional_details handle_professional_details_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_professional_details_updated_at BEFORE UPDATE ON public.professional_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4375 (class 2620 OID 17854)
-- Name: profiles handle_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4383 (class 2620 OID 17860)
-- Name: recipes handle_recipes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4388 (class 2620 OID 20154)
-- Name: workout_sessions handle_workout_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4380 (class 2620 OID 17858)
-- Name: workouts handle_workouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4389 (class 2620 OID 29916)
-- Name: workout_sessions set_workout_xp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER set_workout_xp BEFORE INSERT OR UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION public.trigger_calculate_xp();


--
-- TOC entry 4376 (class 2620 OID 29943)
-- Name: profiles update_profile_level; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_profile_level BEFORE INSERT OR UPDATE OF current_xp ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.trigger_update_level();


--
-- TOC entry 4374 (class 2620 OID 17302)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 4367 (class 2620 OID 17239)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 4368 (class 2620 OID 17269)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4369 (class 2620 OID 17220)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 4370 (class 2620 OID 17268)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 4372 (class 2620 OID 17235)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 4373 (class 2620 OID 17270)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4371 (class 2620 OID 17131)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 4301 (class 2606 OID 16734)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4306 (class 2606 OID 16823)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4305 (class 2606 OID 16811)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4304 (class 2606 OID 16798)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4312 (class 2606 OID 17063)
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4313 (class 2606 OID 17068)
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4314 (class 2606 OID 17092)
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4315 (class 2606 OID 17087)
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4311 (class 2606 OID 16989)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4299 (class 2606 OID 16767)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4308 (class 2606 OID 16870)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4309 (class 2606 OID 16943)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4310 (class 2606 OID 16884)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4302 (class 2606 OID 17106)
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4303 (class 2606 OID 16762)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4307 (class 2606 OID 16851)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4350 (class 2606 OID 17808)
-- Name: appointments fk_appointment_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4351 (class 2606 OID 17803)
-- Name: appointments fk_appointment_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4349 (class 2606 OID 17785)
-- Name: biometric_data fk_biometric_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_data
    ADD CONSTRAINT fk_biometric_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4352 (class 2606 OID 17830)
-- Name: chat_messages fk_chat_receiver; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4353 (class 2606 OID 17825)
-- Name: chat_messages fk_chat_sender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4323 (class 2606 OID 17509)
-- Name: client_professionals fk_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4342 (class 2606 OID 17720)
-- Name: client_meal_plans fk_client_meal_plan_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT fk_client_meal_plan_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4343 (class 2606 OID 17730)
-- Name: client_meal_plans fk_client_meal_plan_nutritionist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT fk_client_meal_plan_nutritionist FOREIGN KEY (nutritionist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4344 (class 2606 OID 17725)
-- Name: client_meal_plans fk_client_meal_plan_plan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT fk_client_meal_plan_plan FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;


--
-- TOC entry 4322 (class 2606 OID 17491)
-- Name: client_details fk_client_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_details
    ADD CONSTRAINT fk_client_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4329 (class 2606 OID 17583)
-- Name: client_workouts fk_client_workout_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT fk_client_workout_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4330 (class 2606 OID 17593)
-- Name: client_workouts fk_client_workout_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT fk_client_workout_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4331 (class 2606 OID 17588)
-- Name: client_workouts fk_client_workout_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT fk_client_workout_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4325 (class 2606 OID 17531)
-- Name: exercises_library fk_exercise_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises_library
    ADD CONSTRAINT fk_exercise_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4334 (class 2606 OID 17629)
-- Name: foods_library fk_food_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods_library
    ADD CONSTRAINT fk_food_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4339 (class 2606 OID 17698)
-- Name: meal_plan_items fk_meal_item_food; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT fk_meal_item_food FOREIGN KEY (food_id) REFERENCES public.foods_library(id) ON DELETE SET NULL;


--
-- TOC entry 4340 (class 2606 OID 17693)
-- Name: meal_plan_items fk_meal_item_plan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT fk_meal_item_plan FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;


--
-- TOC entry 4341 (class 2606 OID 17703)
-- Name: meal_plan_items fk_meal_item_recipe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT fk_meal_item_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- TOC entry 4345 (class 2606 OID 17745)
-- Name: meal_logs fk_meal_log_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT fk_meal_log_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4346 (class 2606 OID 17750)
-- Name: meal_logs fk_meal_log_food; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT fk_meal_log_food FOREIGN KEY (food_id) REFERENCES public.foods_library(id) ON DELETE SET NULL;


--
-- TOC entry 4347 (class 2606 OID 17755)
-- Name: meal_logs fk_meal_log_recipe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT fk_meal_log_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- TOC entry 4338 (class 2606 OID 17679)
-- Name: meal_plans fk_meal_plan_nutritionist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT fk_meal_plan_nutritionist FOREIGN KEY (nutritionist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4324 (class 2606 OID 17514)
-- Name: client_professionals fk_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT fk_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4321 (class 2606 OID 17477)
-- Name: professional_details fk_professional_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_details
    ADD CONSTRAINT fk_professional_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4320 (class 2606 OID 17461)
-- Name: profiles fk_profile_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT fk_profile_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4348 (class 2606 OID 17769)
-- Name: progress_photos fk_progress_photo_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_photos
    ADD CONSTRAINT fk_progress_photo_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4335 (class 2606 OID 17645)
-- Name: recipes fk_recipe_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT fk_recipe_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4336 (class 2606 OID 17663)
-- Name: recipe_ingredients fk_recipe_ingredient_food; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT fk_recipe_ingredient_food FOREIGN KEY (food_id) REFERENCES public.foods_library(id) ON DELETE CASCADE;


--
-- TOC entry 4337 (class 2606 OID 17658)
-- Name: recipe_ingredients fk_recipe_ingredient_recipe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT fk_recipe_ingredient_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- TOC entry 4327 (class 2606 OID 17566)
-- Name: workout_exercises fk_workout_exercise_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT fk_workout_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES public.exercises_library(id) ON DELETE CASCADE;


--
-- TOC entry 4328 (class 2606 OID 17561)
-- Name: workout_exercises fk_workout_exercise_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT fk_workout_exercise_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4332 (class 2606 OID 17608)
-- Name: workout_logs fk_workout_log_client_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT fk_workout_log_client_workout FOREIGN KEY (client_workout_id) REFERENCES public.client_workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4333 (class 2606 OID 17613)
-- Name: workout_logs fk_workout_log_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT fk_workout_log_exercise FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id) ON DELETE CASCADE;


--
-- TOC entry 4326 (class 2606 OID 17548)
-- Name: workouts fk_workout_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT fk_workout_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4358 (class 2606 OID 22403)
-- Name: professional_notifications professional_notifications_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_notifications
    ADD CONSTRAINT professional_notifications_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4359 (class 2606 OID 22398)
-- Name: professional_notifications professional_notifications_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_notifications
    ADD CONSTRAINT professional_notifications_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4364 (class 2606 OID 29885)
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id) ON DELETE CASCADE;


--
-- TOC entry 4365 (class 2606 OID 29880)
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4361 (class 2606 OID 28716)
-- Name: workout_execution_logs workout_execution_logs_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_execution_logs
    ADD CONSTRAINT workout_execution_logs_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises_library(id) ON DELETE CASCADE;


--
-- TOC entry 4362 (class 2606 OID 28721)
-- Name: workout_execution_logs workout_execution_logs_workout_exercise_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_execution_logs
    ADD CONSTRAINT workout_execution_logs_workout_exercise_id_fkey FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id) ON DELETE SET NULL;


--
-- TOC entry 4363 (class 2606 OID 28711)
-- Name: workout_execution_logs workout_execution_logs_workout_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_execution_logs
    ADD CONSTRAINT workout_execution_logs_workout_session_id_fkey FOREIGN KEY (workout_session_id) REFERENCES public.workout_sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4354 (class 2606 OID 20131)
-- Name: workout_sessions workout_sessions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4355 (class 2606 OID 20146)
-- Name: workout_sessions workout_sessions_client_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_client_workout_id_fkey FOREIGN KEY (client_workout_id) REFERENCES public.client_workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4356 (class 2606 OID 20136)
-- Name: workout_sessions workout_sessions_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4357 (class 2606 OID 20141)
-- Name: workout_sessions workout_sessions_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4300 (class 2606 OID 16572)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4319 (class 2606 OID 17207)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4316 (class 2606 OID 17153)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4317 (class 2606 OID 17173)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4318 (class 2606 OID 17168)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 4360 (class 2606 OID 22439)
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- TOC entry 4542 (class 0 OID 16525)
-- Dependencies: 352
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4556 (class 0 OID 16929)
-- Dependencies: 369
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4547 (class 0 OID 16727)
-- Dependencies: 360
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4541 (class 0 OID 16518)
-- Dependencies: 351
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4551 (class 0 OID 16816)
-- Dependencies: 364
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4550 (class 0 OID 16804)
-- Dependencies: 363
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4549 (class 0 OID 16791)
-- Dependencies: 362
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4557 (class 0 OID 16979)
-- Dependencies: 370
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4540 (class 0 OID 16507)
-- Dependencies: 350
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4554 (class 0 OID 16858)
-- Dependencies: 367
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4555 (class 0 OID 16876)
-- Dependencies: 368
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4543 (class 0 OID 16533)
-- Dependencies: 353
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4548 (class 0 OID 16757)
-- Dependencies: 361
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4553 (class 0 OID 16843)
-- Dependencies: 366
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4552 (class 0 OID 16834)
-- Dependencies: 365
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4539 (class 0 OID 16495)
-- Dependencies: 348
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4618 (class 3256 OID 26243)
-- Name: professional_details Anyone can view professional details; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view professional details" ON public.professional_details FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4617 (class 3256 OID 26242)
-- Name: profiles Authenticated users can view profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4687 (class 3256 OID 26423)
-- Name: biometric_data Biometrics Insert Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Biometrics Insert Policy" ON public.biometric_data FOR INSERT TO authenticated WITH CHECK (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = biometric_data.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4688 (class 3256 OID 26424)
-- Name: biometric_data Biometrics Modify Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Biometrics Modify Policy" ON public.biometric_data TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = biometric_data.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4609 (class 3256 OID 26422)
-- Name: biometric_data Biometrics Select Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Biometrics Select Policy" ON public.biometric_data FOR SELECT TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = biometric_data.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4620 (class 3256 OID 29890)
-- Name: achievements Everyone can view achievements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);


--
-- TOC entry 4605 (class 3256 OID 26373)
-- Name: chat_messages Insert Messages Logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Insert Messages Logic" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK ((auth.uid() = sender_id));


--
-- TOC entry 4597 (class 3256 OID 26269)
-- Name: client_details Insert client details logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Insert client details logic" ON public.client_details FOR INSERT TO authenticated WITH CHECK (((auth.uid() = profile_id) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = client_details.profile_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4694 (class 3256 OID 28728)
-- Name: workout_execution_logs Professionals can view execution logs of their clients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Professionals can view execution logs of their clients" ON public.workout_execution_logs FOR SELECT USING ((auth.uid() IN ( SELECT workout_sessions.professional_id
   FROM public.workout_sessions
  WHERE (workout_sessions.id = workout_execution_logs.workout_session_id))));


--
-- TOC entry 4691 (class 3256 OID 27553)
-- Name: progress_photos Progress Photos Delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Progress Photos Delete" ON public.progress_photos FOR DELETE TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = progress_photos.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4690 (class 3256 OID 27552)
-- Name: progress_photos Progress Photos Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Progress Photos Insert" ON public.progress_photos FOR INSERT TO authenticated WITH CHECK (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = progress_photos.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4689 (class 3256 OID 27551)
-- Name: progress_photos Progress Photos Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Progress Photos Select" ON public.progress_photos FOR SELECT TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = progress_photos.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4606 (class 3256 OID 26374)
-- Name: chat_messages Update Messages Logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Update Messages Logic" ON public.chat_messages FOR UPDATE TO authenticated USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- TOC entry 4649 (class 3256 OID 26268)
-- Name: client_details Update client details logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Update client details logic" ON public.client_details FOR UPDATE TO authenticated USING (((auth.uid() = profile_id) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = client_details.profile_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4693 (class 3256 OID 28727)
-- Name: workout_execution_logs Users can insert their own execution logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert their own execution logs" ON public.workout_execution_logs FOR INSERT WITH CHECK ((auth.uid() IN ( SELECT workout_sessions.client_id
   FROM public.workout_sessions
  WHERE (workout_sessions.id = workout_execution_logs.workout_session_id))));


--
-- TOC entry 4686 (class 3256 OID 26190)
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- TOC entry 4621 (class 3256 OID 29891)
-- Name: user_achievements Users can view own achievements; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING ((auth.uid() = user_id));


--
-- TOC entry 4692 (class 3256 OID 28726)
-- Name: workout_execution_logs Users can view their own execution logs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view their own execution logs" ON public.workout_execution_logs FOR SELECT USING ((auth.uid() IN ( SELECT workout_sessions.client_id
   FROM public.workout_sessions
  WHERE (workout_sessions.id = workout_execution_logs.workout_session_id))));


--
-- TOC entry 4604 (class 3256 OID 26372)
-- Name: chat_messages View Messages Logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View Messages Logic" ON public.chat_messages FOR SELECT TO authenticated USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- TOC entry 4619 (class 3256 OID 26244)
-- Name: client_details View client details logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View client details logic" ON public.client_details FOR SELECT TO authenticated USING (((auth.uid() = profile_id) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = client_details.profile_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4588 (class 0 OID 29858)
-- Dependencies: 416
-- Name: achievements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4581 (class 0 OID 17790)
-- Dependencies: 403
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4685 (class 3256 OID 18093)
-- Name: appointments appointments_delete_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_delete_participants ON public.appointments FOR DELETE USING (((professional_id = auth.uid()) OR (client_id = auth.uid())));


--
-- TOC entry 4683 (class 3256 OID 18091)
-- Name: appointments appointments_insert_with_active_link; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_insert_with_active_link ON public.appointments FOR INSERT WITH CHECK ((((professional_id = auth.uid()) AND public.professional_has_client_access(client_id)) OR ((client_id = auth.uid()) AND public.client_has_professional_access(professional_id))));


--
-- TOC entry 4602 (class 3256 OID 18090)
-- Name: appointments appointments_select_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_select_participants ON public.appointments FOR SELECT USING (((professional_id = auth.uid()) OR (client_id = auth.uid())));


--
-- TOC entry 4684 (class 3256 OID 18092)
-- Name: appointments appointments_update_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_update_participants ON public.appointments FOR UPDATE USING (((professional_id = auth.uid()) OR (client_id = auth.uid())));


--
-- TOC entry 4580 (class 0 OID 17774)
-- Dependencies: 402
-- Name: biometric_data; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4582 (class 0 OID 17813)
-- Dependencies: 404
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4565 (class 0 OID 17482)
-- Dependencies: 387
-- Name: client_details; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_details ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4622 (class 3256 OID 18029)
-- Name: client_details client_details_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_details_delete_own ON public.client_details FOR DELETE USING ((profile_id = auth.uid()));


--
-- TOC entry 4577 (class 0 OID 17708)
-- Dependencies: 399
-- Name: client_meal_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_meal_plans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4681 (class 3256 OID 18077)
-- Name: client_meal_plans client_meal_plans_delete_assigning_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_delete_assigning_nutritionist ON public.client_meal_plans FOR DELETE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4679 (class 3256 OID 18075)
-- Name: client_meal_plans client_meal_plans_insert_nutritionist_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_insert_nutritionist_only ON public.client_meal_plans FOR INSERT WITH CHECK (((nutritionist_id = auth.uid()) AND public.professional_has_client_access(client_id)));


--
-- TOC entry 4678 (class 3256 OID 18074)
-- Name: client_meal_plans client_meal_plans_select_client_or_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_select_client_or_nutritionist ON public.client_meal_plans FOR SELECT USING (((client_id = auth.uid()) OR (nutritionist_id = auth.uid())));


--
-- TOC entry 4680 (class 3256 OID 18076)
-- Name: client_meal_plans client_meal_plans_update_assigning_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_update_assigning_nutritionist ON public.client_meal_plans FOR UPDATE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4566 (class 0 OID 17496)
-- Dependencies: 388
-- Name: client_professionals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_professionals ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4626 (class 3256 OID 18033)
-- Name: client_professionals client_professionals_delete_professional_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_delete_professional_only ON public.client_professionals FOR DELETE USING ((professional_id = auth.uid()));


--
-- TOC entry 4624 (class 3256 OID 18031)
-- Name: client_professionals client_professionals_insert_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_insert_participants ON public.client_professionals FOR INSERT WITH CHECK ((((client_id = auth.uid()) AND public.is_client()) OR ((professional_id = auth.uid()) AND public.is_professional())));


--
-- TOC entry 4623 (class 3256 OID 18030)
-- Name: client_professionals client_professionals_select_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_select_participants ON public.client_professionals FOR SELECT USING (((client_id = auth.uid()) OR (professional_id = auth.uid())));


--
-- TOC entry 4625 (class 3256 OID 18032)
-- Name: client_professionals client_professionals_update_professional_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_update_professional_only ON public.client_professionals FOR UPDATE USING ((professional_id = auth.uid()));


--
-- TOC entry 4615 (class 3256 OID 22710)
-- Name: client_professionals client_view_own_link; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_view_own_link ON public.client_professionals FOR SELECT USING ((auth.uid() = client_id));


--
-- TOC entry 4570 (class 0 OID 17571)
-- Dependencies: 392
-- Name: client_workouts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_workouts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4593 (class 3256 OID 19767)
-- Name: client_workouts client_workouts_delete_assigning_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_delete_assigning_professional ON public.client_workouts FOR DELETE TO authenticated USING ((professional_id = auth.uid()));


--
-- TOC entry 4591 (class 3256 OID 19765)
-- Name: client_workouts client_workouts_insert_professional_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_insert_professional_only ON public.client_workouts FOR INSERT TO authenticated WITH CHECK (((professional_id = auth.uid()) AND public.professional_has_client_access(client_id)));


--
-- TOC entry 4590 (class 3256 OID 19764)
-- Name: client_workouts client_workouts_select_client_or_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_select_client_or_professional ON public.client_workouts FOR SELECT TO authenticated USING (((client_id = auth.uid()) OR (professional_id = auth.uid())));


--
-- TOC entry 4592 (class 3256 OID 19766)
-- Name: client_workouts client_workouts_update_assigning_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_update_assigning_professional ON public.client_workouts FOR UPDATE TO authenticated USING ((professional_id = auth.uid())) WITH CHECK ((professional_id = auth.uid()));


--
-- TOC entry 4567 (class 0 OID 17519)
-- Dependencies: 389
-- Name: exercises_library; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4630 (class 3256 OID 18037)
-- Name: exercises_library exercises_library_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_delete_creator ON public.exercises_library FOR DELETE USING ((created_by = auth.uid()));


--
-- TOC entry 4628 (class 3256 OID 18035)
-- Name: exercises_library exercises_library_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_insert_professionals_only ON public.exercises_library FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4627 (class 3256 OID 18034)
-- Name: exercises_library exercises_library_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_select_own_or_public ON public.exercises_library FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));


--
-- TOC entry 4629 (class 3256 OID 18036)
-- Name: exercises_library exercises_library_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_update_creator ON public.exercises_library FOR UPDATE USING ((created_by = auth.uid()));


--
-- TOC entry 4572 (class 0 OID 17618)
-- Dependencies: 394
-- Name: foods_library; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.foods_library ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4662 (class 3256 OID 18057)
-- Name: foods_library foods_library_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_delete_creator ON public.foods_library FOR DELETE USING ((created_by = auth.uid()));


--
-- TOC entry 4660 (class 3256 OID 18055)
-- Name: foods_library foods_library_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_insert_professionals_only ON public.foods_library FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4659 (class 3256 OID 18054)
-- Name: foods_library foods_library_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_select_own_or_public ON public.foods_library FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));


--
-- TOC entry 4661 (class 3256 OID 18056)
-- Name: foods_library foods_library_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_update_creator ON public.foods_library FOR UPDATE USING ((created_by = auth.uid()));


--
-- TOC entry 4578 (class 0 OID 17735)
-- Dependencies: 400
-- Name: meal_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4601 (class 3256 OID 18081)
-- Name: meal_logs meal_logs_delete_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_delete_client_only ON public.meal_logs FOR DELETE USING ((client_id = auth.uid()));


--
-- TOC entry 4682 (class 3256 OID 18079)
-- Name: meal_logs meal_logs_insert_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_insert_client_only ON public.meal_logs FOR INSERT WITH CHECK ((client_id = auth.uid()));


--
-- TOC entry 4674 (class 3256 OID 18078)
-- Name: meal_logs meal_logs_select_client_or_linked_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_select_client_or_linked_nutritionist ON public.meal_logs FOR SELECT USING (((client_id = auth.uid()) OR public.professional_has_client_access(client_id)));


--
-- TOC entry 4600 (class 3256 OID 18080)
-- Name: meal_logs meal_logs_update_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_update_client_only ON public.meal_logs FOR UPDATE USING ((client_id = auth.uid()));


--
-- TOC entry 4576 (class 0 OID 17684)
-- Dependencies: 398
-- Name: meal_plan_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4677 (class 3256 OID 18073)
-- Name: meal_plan_items meal_plan_items_delete_plan_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_delete_plan_owner ON public.meal_plan_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))));


--
-- TOC entry 4675 (class 3256 OID 18071)
-- Name: meal_plan_items meal_plan_items_insert_plan_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_insert_plan_owner ON public.meal_plan_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))));


--
-- TOC entry 4614 (class 3256 OID 20117)
-- Name: meal_plan_items meal_plan_items_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_select_policy ON public.meal_plan_items FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.client_meal_plans
  WHERE ((client_meal_plans.meal_plan_id = meal_plan_items.meal_plan_id) AND (client_meal_plans.client_id = auth.uid()) AND (client_meal_plans.status = 'active'::text))))));


--
-- TOC entry 4676 (class 3256 OID 18072)
-- Name: meal_plan_items meal_plan_items_update_plan_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_update_plan_owner ON public.meal_plan_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))));


--
-- TOC entry 4575 (class 0 OID 17668)
-- Dependencies: 397
-- Name: meal_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4673 (class 3256 OID 18069)
-- Name: meal_plans meal_plans_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_delete_creator ON public.meal_plans FOR DELETE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4671 (class 3256 OID 18067)
-- Name: meal_plans meal_plans_insert_nutritionists_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_insert_nutritionists_only ON public.meal_plans FOR INSERT WITH CHECK (((nutritionist_id = auth.uid()) AND public.is_professional()));


--
-- TOC entry 4599 (class 3256 OID 20094)
-- Name: meal_plans meal_plans_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_select_policy ON public.meal_plans FOR SELECT USING (((nutritionist_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_meal_plans
  WHERE ((client_meal_plans.meal_plan_id = meal_plans.id) AND (client_meal_plans.client_id = auth.uid()) AND (client_meal_plans.status = 'active'::text))))));


--
-- TOC entry 4672 (class 3256 OID 18068)
-- Name: meal_plans meal_plans_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_update_creator ON public.meal_plans FOR UPDATE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4644 (class 3256 OID 22411)
-- Name: professional_notifications prof_delete_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_delete_own_notifications ON public.professional_notifications FOR DELETE USING ((auth.uid() = professional_id));


--
-- TOC entry 4642 (class 3256 OID 22409)
-- Name: professional_notifications prof_insert_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_insert_own_notifications ON public.professional_notifications FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- TOC entry 4643 (class 3256 OID 22410)
-- Name: professional_notifications prof_update_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_update_own_notifications ON public.professional_notifications FOR UPDATE USING ((auth.uid() = professional_id));


--
-- TOC entry 4641 (class 3256 OID 22408)
-- Name: professional_notifications prof_view_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_view_own_notifications ON public.professional_notifications FOR SELECT USING ((auth.uid() = professional_id));


--
-- TOC entry 4564 (class 0 OID 17466)
-- Dependencies: 386
-- Name: professional_details; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4654 (class 3256 OID 18025)
-- Name: professional_details professional_details_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY professional_details_delete_own ON public.professional_details FOR DELETE USING ((profile_id = auth.uid()));


--
-- TOC entry 4652 (class 3256 OID 18023)
-- Name: professional_details professional_details_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY professional_details_insert_own ON public.professional_details FOR INSERT WITH CHECK (((profile_id = auth.uid()) AND public.is_professional()));


--
-- TOC entry 4653 (class 3256 OID 18024)
-- Name: professional_details professional_details_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY professional_details_update_own ON public.professional_details FOR UPDATE USING ((profile_id = auth.uid()));


--
-- TOC entry 4584 (class 0 OID 22388)
-- Dependencies: 406
-- Name: professional_notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.professional_notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4563 (class 0 OID 17451)
-- Dependencies: 385
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4651 (class 3256 OID 18021)
-- Name: profiles profiles_delete_admin_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_delete_admin_only ON public.profiles FOR DELETE USING (public.is_admin());


--
-- TOC entry 4613 (class 3256 OID 19603)
-- Name: profiles profiles_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_delete_policy ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());


--
-- TOC entry 4650 (class 3256 OID 18019)
-- Name: profiles profiles_insert_admin_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_insert_admin_only ON public.profiles FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4612 (class 3256 OID 19601)
-- Name: profiles profiles_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_insert_policy ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- TOC entry 4616 (class 3256 OID 22711)
-- Name: profiles profiles_view_linked_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_view_linked_professional ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.client_professionals
  WHERE ((client_professionals.professional_id = profiles.id) AND (client_professionals.client_id = auth.uid())))));


--
-- TOC entry 4579 (class 0 OID 17760)
-- Dependencies: 401
-- Name: progress_photos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4574 (class 0 OID 17650)
-- Dependencies: 396
-- Name: recipe_ingredients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4670 (class 3256 OID 18065)
-- Name: recipe_ingredients recipe_ingredients_delete_recipe_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_delete_recipe_owner ON public.recipe_ingredients FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND (recipes.created_by = auth.uid())))));


--
-- TOC entry 4668 (class 3256 OID 18063)
-- Name: recipe_ingredients recipe_ingredients_insert_recipe_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_insert_recipe_owner ON public.recipe_ingredients FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND (recipes.created_by = auth.uid())))));


--
-- TOC entry 4667 (class 3256 OID 18062)
-- Name: recipe_ingredients recipe_ingredients_select_via_recipe; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_select_via_recipe ON public.recipe_ingredients FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND ((recipes.created_by = auth.uid()) OR (recipes.is_public = true))))));


--
-- TOC entry 4669 (class 3256 OID 18064)
-- Name: recipe_ingredients recipe_ingredients_update_recipe_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_update_recipe_owner ON public.recipe_ingredients FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND (recipes.created_by = auth.uid())))));


--
-- TOC entry 4573 (class 0 OID 17634)
-- Dependencies: 395
-- Name: recipes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4666 (class 3256 OID 18061)
-- Name: recipes recipes_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_delete_creator ON public.recipes FOR DELETE USING ((created_by = auth.uid()));


--
-- TOC entry 4664 (class 3256 OID 18059)
-- Name: recipes recipes_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_insert_professionals_only ON public.recipes FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4663 (class 3256 OID 18058)
-- Name: recipes recipes_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_select_own_or_public ON public.recipes FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));


--
-- TOC entry 4665 (class 3256 OID 18060)
-- Name: recipes recipes_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_update_creator ON public.recipes FOR UPDATE USING ((created_by = auth.uid()));


--
-- TOC entry 4589 (class 0 OID 29871)
-- Dependencies: 417
-- Name: user_achievements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4587 (class 0 OID 28702)
-- Dependencies: 415
-- Name: workout_execution_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_execution_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4569 (class 0 OID 17553)
-- Dependencies: 391
-- Name: workout_exercises; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4640 (class 3256 OID 18045)
-- Name: workout_exercises workout_exercises_delete_workout_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_delete_workout_owner ON public.workout_exercises FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))));


--
-- TOC entry 4638 (class 3256 OID 18043)
-- Name: workout_exercises workout_exercises_insert_workout_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_insert_workout_owner ON public.workout_exercises FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))));


--
-- TOC entry 4603 (class 3256 OID 20116)
-- Name: workout_exercises workout_exercises_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_select_policy ON public.workout_exercises FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.workout_id = workout_exercises.workout_id) AND (client_workouts.client_id = auth.uid()) AND (client_workouts.status = 'active'::text))))));


--
-- TOC entry 4639 (class 3256 OID 18044)
-- Name: workout_exercises workout_exercises_update_workout_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_update_workout_owner ON public.workout_exercises FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))));


--
-- TOC entry 4571 (class 0 OID 17598)
-- Dependencies: 393
-- Name: workout_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4658 (class 3256 OID 18053)
-- Name: workout_logs workout_logs_delete_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_delete_client_only ON public.workout_logs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND (client_workouts.client_id = auth.uid())))));


--
-- TOC entry 4656 (class 3256 OID 18051)
-- Name: workout_logs workout_logs_insert_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_insert_client_only ON public.workout_logs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND (client_workouts.client_id = auth.uid())))));


--
-- TOC entry 4655 (class 3256 OID 18050)
-- Name: workout_logs workout_logs_select_client_or_linked_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_select_client_or_linked_professional ON public.workout_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND ((client_workouts.client_id = auth.uid()) OR (client_workouts.professional_id = auth.uid()))))));


--
-- TOC entry 4657 (class 3256 OID 18052)
-- Name: workout_logs workout_logs_update_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_update_client_only ON public.workout_logs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND (client_workouts.client_id = auth.uid())))));


--
-- TOC entry 4583 (class 0 OID 20118)
-- Dependencies: 405
-- Name: workout_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4636 (class 3256 OID 20158)
-- Name: workout_sessions workout_sessions_delete_client_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_delete_client_own ON public.workout_sessions FOR DELETE USING ((auth.uid() = client_id));


--
-- TOC entry 4633 (class 3256 OID 20155)
-- Name: workout_sessions workout_sessions_insert_client_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_insert_client_own ON public.workout_sessions FOR INSERT WITH CHECK ((auth.uid() = client_id));


--
-- TOC entry 4634 (class 3256 OID 20156)
-- Name: workout_sessions workout_sessions_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_select_policy ON public.workout_sessions FOR SELECT USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- TOC entry 4635 (class 3256 OID 20157)
-- Name: workout_sessions workout_sessions_update_client_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_update_client_own ON public.workout_sessions FOR UPDATE USING ((auth.uid() = client_id)) WITH CHECK ((auth.uid() = client_id));


--
-- TOC entry 4568 (class 0 OID 17536)
-- Dependencies: 390
-- Name: workouts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4637 (class 3256 OID 18041)
-- Name: workouts workouts_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_delete_creator ON public.workouts FOR DELETE USING ((professional_id = auth.uid()));


--
-- TOC entry 4631 (class 3256 OID 18039)
-- Name: workouts workouts_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_insert_professionals_only ON public.workouts FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4598 (class 3256 OID 18225)
-- Name: workouts workouts_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_select_policy ON public.workouts FOR SELECT USING (((professional_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.workout_id = workouts.id) AND (client_workouts.client_id = auth.uid()) AND (client_workouts.status = 'active'::text))))));


--
-- TOC entry 4632 (class 3256 OID 18040)
-- Name: workouts workouts_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_update_creator ON public.workouts FOR UPDATE USING ((professional_id = auth.uid()));


--
-- TOC entry 4562 (class 0 OID 17434)
-- Dependencies: 384
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4646 (class 3256 OID 26160)
-- Name: objects Authenticated users can upload avatar; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Authenticated users can upload avatar" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- TOC entry 4596 (class 3256 OID 26194)
-- Name: objects Avatar Auth Update; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar Auth Update" ON storage.objects FOR UPDATE USING ((auth.uid() = owner)) WITH CHECK ((bucket_id = 'avatars'::text));


--
-- TOC entry 4595 (class 3256 OID 26193)
-- Name: objects Avatar Auth Upload; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- TOC entry 4594 (class 3256 OID 26192)
-- Name: objects Avatar Public Select; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar Public Select" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- TOC entry 4645 (class 3256 OID 26159)
-- Name: objects Avatar images are publicly accessible; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- TOC entry 4607 (class 3256 OID 26398)
-- Name: objects Give me access to chat files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give me access to chat files" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'chat-attachments'::text));


--
-- TOC entry 4608 (class 3256 OID 26399)
-- Name: objects Let me upload chat files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Let me upload chat files" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'chat-attachments'::text));


--
-- TOC entry 4611 (class 3256 OID 27550)
-- Name: objects Upload Progress Photos; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Upload Progress Photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'progress-photos'::text));


--
-- TOC entry 4648 (class 3256 OID 26162)
-- Name: objects Users can delete their own avatar; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (((auth.uid() = owner) AND (bucket_id = 'avatars'::text)));


--
-- TOC entry 4647 (class 3256 OID 26161)
-- Name: objects Users can update their own avatar; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING ((auth.uid() = owner)) WITH CHECK ((bucket_id = 'avatars'::text));


--
-- TOC entry 4610 (class 3256 OID 27549)
-- Name: objects View Progress Photos; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "View Progress Photos" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'progress-photos'::text));


--
-- TOC entry 4544 (class 0 OID 16546)
-- Dependencies: 354
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4561 (class 0 OID 17246)
-- Dependencies: 378
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4585 (class 0 OID 22419)
-- Dependencies: 407
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4546 (class 0 OID 16588)
-- Dependencies: 356
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4545 (class 0 OID 16561)
-- Dependencies: 355
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4560 (class 0 OID 17197)
-- Dependencies: 376
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4558 (class 0 OID 17144)
-- Dependencies: 374
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4559 (class 0 OID 17158)
-- Dependencies: 375
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4586 (class 0 OID 22429)
-- Dependencies: 408
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4695 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- TOC entry 4696 (class 6104 OID 22584)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- TOC entry 4698 (class 6106 OID 22732)
-- Name: supabase_realtime chat_messages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.chat_messages;


--
-- TOC entry 4697 (class 6106 OID 22585)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 4768 (class 0 OID 0)
-- Dependencies: 37
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- TOC entry 4769 (class 0 OID 0)
-- Dependencies: 23
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- TOC entry 4770 (class 0 OID 0)
-- Dependencies: 39
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 4771 (class 0 OID 0)
-- Dependencies: 13
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- TOC entry 4772 (class 0 OID 0)
-- Dependencies: 38
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- TOC entry 4773 (class 0 OID 0)
-- Dependencies: 32
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- TOC entry 4780 (class 0 OID 0)
-- Dependencies: 472
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- TOC entry 4781 (class 0 OID 0)
-- Dependencies: 480
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- TOC entry 4783 (class 0 OID 0)
-- Dependencies: 425
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- TOC entry 4785 (class 0 OID 0)
-- Dependencies: 446
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- TOC entry 4786 (class 0 OID 0)
-- Dependencies: 479
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- TOC entry 4787 (class 0 OID 0)
-- Dependencies: 522
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- TOC entry 4788 (class 0 OID 0)
-- Dependencies: 506
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- TOC entry 4789 (class 0 OID 0)
-- Dependencies: 492
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- TOC entry 4790 (class 0 OID 0)
-- Dependencies: 495
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4791 (class 0 OID 0)
-- Dependencies: 465
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4792 (class 0 OID 0)
-- Dependencies: 541
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- TOC entry 4793 (class 0 OID 0)
-- Dependencies: 513
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- TOC entry 4794 (class 0 OID 0)
-- Dependencies: 457
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4795 (class 0 OID 0)
-- Dependencies: 435
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4796 (class 0 OID 0)
-- Dependencies: 517
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- TOC entry 4797 (class 0 OID 0)
-- Dependencies: 428
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- TOC entry 4798 (class 0 OID 0)
-- Dependencies: 566
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- TOC entry 4799 (class 0 OID 0)
-- Dependencies: 563
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- TOC entry 4801 (class 0 OID 0)
-- Dependencies: 511
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- TOC entry 4803 (class 0 OID 0)
-- Dependencies: 491
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4805 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- TOC entry 4806 (class 0 OID 0)
-- Dependencies: 434
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4807 (class 0 OID 0)
-- Dependencies: 555
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- TOC entry 4808 (class 0 OID 0)
-- Dependencies: 527
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4809 (class 0 OID 0)
-- Dependencies: 561
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4810 (class 0 OID 0)
-- Dependencies: 516
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- TOC entry 4811 (class 0 OID 0)
-- Dependencies: 470
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- TOC entry 4812 (class 0 OID 0)
-- Dependencies: 466
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- TOC entry 4813 (class 0 OID 0)
-- Dependencies: 549
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4814 (class 0 OID 0)
-- Dependencies: 421
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4815 (class 0 OID 0)
-- Dependencies: 551
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4816 (class 0 OID 0)
-- Dependencies: 439
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4817 (class 0 OID 0)
-- Dependencies: 559
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4818 (class 0 OID 0)
-- Dependencies: 557
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4819 (class 0 OID 0)
-- Dependencies: 476
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- TOC entry 4820 (class 0 OID 0)
-- Dependencies: 471
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- TOC entry 4821 (class 0 OID 0)
-- Dependencies: 455
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4822 (class 0 OID 0)
-- Dependencies: 544
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4823 (class 0 OID 0)
-- Dependencies: 547
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- TOC entry 4824 (class 0 OID 0)
-- Dependencies: 473
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4825 (class 0 OID 0)
-- Dependencies: 550
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 546
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4827 (class 0 OID 0)
-- Dependencies: 565
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- TOC entry 4828 (class 0 OID 0)
-- Dependencies: 484
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- TOC entry 4829 (class 0 OID 0)
-- Dependencies: 445
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 552
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 419
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 528
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 432
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 477
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- TOC entry 4836 (class 0 OID 0)
-- Dependencies: 533
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 420
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4838 (class 0 OID 0)
-- Dependencies: 443
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- TOC entry 4839 (class 0 OID 0)
-- Dependencies: 454
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4840 (class 0 OID 0)
-- Dependencies: 507
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- TOC entry 4841 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- TOC entry 4842 (class 0 OID 0)
-- Dependencies: 554
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- TOC entry 4843 (class 0 OID 0)
-- Dependencies: 499
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- TOC entry 4844 (class 0 OID 0)
-- Dependencies: 508
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- TOC entry 4845 (class 0 OID 0)
-- Dependencies: 556
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- TOC entry 4846 (class 0 OID 0)
-- Dependencies: 437
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4847 (class 0 OID 0)
-- Dependencies: 474
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- TOC entry 4848 (class 0 OID 0)
-- Dependencies: 489
-- Name: FUNCTION calculate_capipoints(duration_seconds integer, activity_type text, calories integer, distance_meters numeric); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_capipoints(duration_seconds integer, activity_type text, calories integer, distance_meters numeric) TO anon;
GRANT ALL ON FUNCTION public.calculate_capipoints(duration_seconds integer, activity_type text, calories integer, distance_meters numeric) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_capipoints(duration_seconds integer, activity_type text, calories integer, distance_meters numeric) TO service_role;


--
-- TOC entry 4849 (class 0 OID 0)
-- Dependencies: 426
-- Name: FUNCTION calculate_final_xp(base_cp numeric, trust_score numeric, workout_date timestamp with time zone, activity_type text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_final_xp(base_cp numeric, trust_score numeric, workout_date timestamp with time zone, activity_type text) TO anon;
GRANT ALL ON FUNCTION public.calculate_final_xp(base_cp numeric, trust_score numeric, workout_date timestamp with time zone, activity_type text) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_final_xp(base_cp numeric, trust_score numeric, workout_date timestamp with time zone, activity_type text) TO service_role;


--
-- TOC entry 4850 (class 0 OID 0)
-- Dependencies: 531
-- Name: FUNCTION calculate_level(xp integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_level(xp integer) TO anon;
GRANT ALL ON FUNCTION public.calculate_level(xp integer) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_level(xp integer) TO service_role;


--
-- TOC entry 4851 (class 0 OID 0)
-- Dependencies: 452
-- Name: FUNCTION calculate_session_duration(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_session_duration() TO anon;
GRANT ALL ON FUNCTION public.calculate_session_duration() TO authenticated;
GRANT ALL ON FUNCTION public.calculate_session_duration() TO service_role;


--
-- TOC entry 4852 (class 0 OID 0)
-- Dependencies: 444
-- Name: FUNCTION client_has_professional_access(professional_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.client_has_professional_access(professional_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.client_has_professional_access(professional_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.client_has_professional_access(professional_uuid uuid) TO service_role;


--
-- TOC entry 4853 (class 0 OID 0)
-- Dependencies: 529
-- Name: FUNCTION count_total_unread_messages(user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.count_total_unread_messages(user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.count_total_unread_messages(user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.count_total_unread_messages(user_id uuid) TO service_role;


--
-- TOC entry 4854 (class 0 OID 0)
-- Dependencies: 542
-- Name: FUNCTION count_unread_messages(user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.count_unread_messages(user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.count_unread_messages(user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.count_unread_messages(user_id uuid) TO service_role;


--
-- TOC entry 4855 (class 0 OID 0)
-- Dependencies: 468
-- Name: FUNCTION find_client_by_email(client_email text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.find_client_by_email(client_email text) TO anon;
GRANT ALL ON FUNCTION public.find_client_by_email(client_email text) TO authenticated;
GRANT ALL ON FUNCTION public.find_client_by_email(client_email text) TO service_role;


--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION get_conversation(user_id uuid, other_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) TO service_role;


--
-- TOC entry 4857 (class 0 OID 0)
-- Dependencies: 440
-- Name: FUNCTION get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) TO anon;
GRANT ALL ON FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) TO service_role;


--
-- TOC entry 4858 (class 0 OID 0)
-- Dependencies: 438
-- Name: FUNCTION get_rank_title(level integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_rank_title(level integer) TO anon;
GRANT ALL ON FUNCTION public.get_rank_title(level integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_rank_title(level integer) TO service_role;


--
-- TOC entry 4859 (class 0 OID 0)
-- Dependencies: 424
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 469
-- Name: FUNCTION handle_notifications_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_notifications_updated_at() TO anon;
GRANT ALL ON FUNCTION public.handle_notifications_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.handle_notifications_updated_at() TO service_role;


--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 523
-- Name: FUNCTION handle_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_updated_at() TO anon;
GRANT ALL ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.handle_updated_at() TO service_role;


--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 453
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- TOC entry 4863 (class 0 OID 0)
-- Dependencies: 433
-- Name: FUNCTION is_client(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_client() TO anon;
GRANT ALL ON FUNCTION public.is_client() TO authenticated;
GRANT ALL ON FUNCTION public.is_client() TO service_role;


--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 462
-- Name: FUNCTION is_professional(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_professional() TO anon;
GRANT ALL ON FUNCTION public.is_professional() TO authenticated;
GRANT ALL ON FUNCTION public.is_professional() TO service_role;


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 449
-- Name: FUNCTION link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) TO anon;
GRANT ALL ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) TO authenticated;
GRANT ALL ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) TO service_role;


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 553
-- Name: FUNCTION mark_conversation_as_read(current_user_id uuid, other_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) TO service_role;


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION professional_can_link_client(p_client_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.professional_can_link_client(p_client_id uuid) TO anon;
GRANT ALL ON FUNCTION public.professional_can_link_client(p_client_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.professional_can_link_client(p_client_id uuid) TO service_role;


--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 524
-- Name: FUNCTION professional_has_client_access(client_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.professional_has_client_access(client_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.professional_has_client_access(client_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.professional_has_client_access(client_uuid uuid) TO service_role;


--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 518
-- Name: FUNCTION trigger_calculate_xp(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_calculate_xp() TO anon;
GRANT ALL ON FUNCTION public.trigger_calculate_xp() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_calculate_xp() TO service_role;


--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 515
-- Name: FUNCTION trigger_update_level(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_update_level() TO anon;
GRANT ALL ON FUNCTION public.trigger_update_level() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_update_level() TO service_role;


--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 427
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4874 (class 0 OID 0)
-- Dependencies: 562
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- TOC entry 4875 (class 0 OID 0)
-- Dependencies: 486
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- TOC entry 4876 (class 0 OID 0)
-- Dependencies: 441
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- TOC entry 4877 (class 0 OID 0)
-- Dependencies: 475
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- TOC entry 4878 (class 0 OID 0)
-- Dependencies: 526
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 548
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 538
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- TOC entry 4881 (class 0 OID 0)
-- Dependencies: 451
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 496
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 501
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 482
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 448
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 431
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 490
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 351
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 372
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 371
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 373
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- TOC entry 4909 (class 0 OID 0)
-- Dependencies: 350
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- TOC entry 4911 (class 0 OID 0)
-- Dependencies: 349
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- TOC entry 4913 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- TOC entry 4915 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- TOC entry 4917 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- TOC entry 4922 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- TOC entry 4924 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- TOC entry 4927 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- TOC entry 4930 (class 0 OID 0)
-- Dependencies: 348
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- TOC entry 4931 (class 0 OID 0)
-- Dependencies: 347
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- TOC entry 4932 (class 0 OID 0)
-- Dependencies: 346
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- TOC entry 4933 (class 0 OID 0)
-- Dependencies: 416
-- Name: TABLE achievements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.achievements TO anon;
GRANT ALL ON TABLE public.achievements TO authenticated;
GRANT ALL ON TABLE public.achievements TO service_role;


--
-- TOC entry 4934 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE appointments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointments TO anon;
GRANT ALL ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO service_role;


--
-- TOC entry 4935 (class 0 OID 0)
-- Dependencies: 402
-- Name: TABLE biometric_data; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.biometric_data TO anon;
GRANT ALL ON TABLE public.biometric_data TO authenticated;
GRANT ALL ON TABLE public.biometric_data TO service_role;


--
-- TOC entry 4936 (class 0 OID 0)
-- Dependencies: 404
-- Name: TABLE chat_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_messages TO anon;
GRANT ALL ON TABLE public.chat_messages TO authenticated;
GRANT ALL ON TABLE public.chat_messages TO service_role;


--
-- TOC entry 4937 (class 0 OID 0)
-- Dependencies: 387
-- Name: TABLE client_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_details TO anon;
GRANT ALL ON TABLE public.client_details TO authenticated;
GRANT ALL ON TABLE public.client_details TO service_role;


--
-- TOC entry 4938 (class 0 OID 0)
-- Dependencies: 399
-- Name: TABLE client_meal_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_meal_plans TO anon;
GRANT ALL ON TABLE public.client_meal_plans TO authenticated;
GRANT ALL ON TABLE public.client_meal_plans TO service_role;


--
-- TOC entry 4939 (class 0 OID 0)
-- Dependencies: 388
-- Name: TABLE client_professionals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_professionals TO anon;
GRANT ALL ON TABLE public.client_professionals TO authenticated;
GRANT ALL ON TABLE public.client_professionals TO service_role;


--
-- TOC entry 4940 (class 0 OID 0)
-- Dependencies: 392
-- Name: TABLE client_workouts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_workouts TO anon;
GRANT ALL ON TABLE public.client_workouts TO authenticated;
GRANT ALL ON TABLE public.client_workouts TO service_role;


--
-- TOC entry 4941 (class 0 OID 0)
-- Dependencies: 389
-- Name: TABLE exercises_library; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.exercises_library TO anon;
GRANT ALL ON TABLE public.exercises_library TO authenticated;
GRANT ALL ON TABLE public.exercises_library TO service_role;


--
-- TOC entry 4942 (class 0 OID 0)
-- Dependencies: 394
-- Name: TABLE foods_library; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.foods_library TO anon;
GRANT ALL ON TABLE public.foods_library TO authenticated;
GRANT ALL ON TABLE public.foods_library TO service_role;


--
-- TOC entry 4943 (class 0 OID 0)
-- Dependencies: 400
-- Name: TABLE meal_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meal_logs TO anon;
GRANT ALL ON TABLE public.meal_logs TO authenticated;
GRANT ALL ON TABLE public.meal_logs TO service_role;


--
-- TOC entry 4944 (class 0 OID 0)
-- Dependencies: 398
-- Name: TABLE meal_plan_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meal_plan_items TO anon;
GRANT ALL ON TABLE public.meal_plan_items TO authenticated;
GRANT ALL ON TABLE public.meal_plan_items TO service_role;


--
-- TOC entry 4945 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE meal_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meal_plans TO anon;
GRANT ALL ON TABLE public.meal_plans TO authenticated;
GRANT ALL ON TABLE public.meal_plans TO service_role;


--
-- TOC entry 4946 (class 0 OID 0)
-- Dependencies: 386
-- Name: TABLE professional_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.professional_details TO anon;
GRANT ALL ON TABLE public.professional_details TO authenticated;
GRANT ALL ON TABLE public.professional_details TO service_role;


--
-- TOC entry 4947 (class 0 OID 0)
-- Dependencies: 406
-- Name: TABLE professional_notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.professional_notifications TO anon;
GRANT ALL ON TABLE public.professional_notifications TO authenticated;
GRANT ALL ON TABLE public.professional_notifications TO service_role;


--
-- TOC entry 4948 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- TOC entry 4949 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE progress_photos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.progress_photos TO anon;
GRANT ALL ON TABLE public.progress_photos TO authenticated;
GRANT ALL ON TABLE public.progress_photos TO service_role;


--
-- TOC entry 4950 (class 0 OID 0)
-- Dependencies: 396
-- Name: TABLE recipe_ingredients; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recipe_ingredients TO anon;
GRANT ALL ON TABLE public.recipe_ingredients TO authenticated;
GRANT ALL ON TABLE public.recipe_ingredients TO service_role;


--
-- TOC entry 4951 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE recipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recipes TO anon;
GRANT ALL ON TABLE public.recipes TO authenticated;
GRANT ALL ON TABLE public.recipes TO service_role;


--
-- TOC entry 4952 (class 0 OID 0)
-- Dependencies: 417
-- Name: TABLE user_achievements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_achievements TO anon;
GRANT ALL ON TABLE public.user_achievements TO authenticated;
GRANT ALL ON TABLE public.user_achievements TO service_role;


--
-- TOC entry 4953 (class 0 OID 0)
-- Dependencies: 415
-- Name: TABLE workout_execution_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_execution_logs TO anon;
GRANT ALL ON TABLE public.workout_execution_logs TO authenticated;
GRANT ALL ON TABLE public.workout_execution_logs TO service_role;


--
-- TOC entry 4954 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE workout_exercises; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_exercises TO anon;
GRANT ALL ON TABLE public.workout_exercises TO authenticated;
GRANT ALL ON TABLE public.workout_exercises TO service_role;


--
-- TOC entry 4955 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE workout_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_logs TO anon;
GRANT ALL ON TABLE public.workout_logs TO authenticated;
GRANT ALL ON TABLE public.workout_logs TO service_role;


--
-- TOC entry 4956 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE workout_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_sessions TO anon;
GRANT ALL ON TABLE public.workout_sessions TO authenticated;
GRANT ALL ON TABLE public.workout_sessions TO service_role;


--
-- TOC entry 4957 (class 0 OID 0)
-- Dependencies: 390
-- Name: TABLE workouts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workouts TO anon;
GRANT ALL ON TABLE public.workouts TO authenticated;
GRANT ALL ON TABLE public.workouts TO service_role;


--
-- TOC entry 4958 (class 0 OID 0)
-- Dependencies: 384
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- TOC entry 4959 (class 0 OID 0)
-- Dependencies: 409
-- Name: TABLE messages_2025_11_23; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_23 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_23 TO dashboard_user;


--
-- TOC entry 4960 (class 0 OID 0)
-- Dependencies: 410
-- Name: TABLE messages_2025_11_24; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_24 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_24 TO dashboard_user;


--
-- TOC entry 4961 (class 0 OID 0)
-- Dependencies: 411
-- Name: TABLE messages_2025_11_25; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_25 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_25 TO dashboard_user;


--
-- TOC entry 4962 (class 0 OID 0)
-- Dependencies: 412
-- Name: TABLE messages_2025_11_26; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_26 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_26 TO dashboard_user;


--
-- TOC entry 4963 (class 0 OID 0)
-- Dependencies: 413
-- Name: TABLE messages_2025_11_27; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_27 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_27 TO dashboard_user;


--
-- TOC entry 4964 (class 0 OID 0)
-- Dependencies: 414
-- Name: TABLE messages_2025_11_28; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_28 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_28 TO dashboard_user;


--
-- TOC entry 4965 (class 0 OID 0)
-- Dependencies: 418
-- Name: TABLE messages_2025_11_29; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_29 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_29 TO dashboard_user;


--
-- TOC entry 4966 (class 0 OID 0)
-- Dependencies: 377
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- TOC entry 4967 (class 0 OID 0)
-- Dependencies: 381
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- TOC entry 4968 (class 0 OID 0)
-- Dependencies: 380
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- TOC entry 4970 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- TOC entry 4971 (class 0 OID 0)
-- Dependencies: 378
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- TOC entry 4972 (class 0 OID 0)
-- Dependencies: 407
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- TOC entry 4974 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- TOC entry 4975 (class 0 OID 0)
-- Dependencies: 376
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- TOC entry 4976 (class 0 OID 0)
-- Dependencies: 374
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- TOC entry 4977 (class 0 OID 0)
-- Dependencies: 375
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- TOC entry 4978 (class 0 OID 0)
-- Dependencies: 408
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- TOC entry 4979 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- TOC entry 4980 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- TOC entry 2630 (class 826 OID 16603)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2631 (class 826 OID 16604)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2629 (class 826 OID 16602)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2640 (class 826 OID 16682)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2639 (class 826 OID 16681)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- TOC entry 2638 (class 826 OID 16680)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2643 (class 826 OID 16637)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2642 (class 826 OID 16636)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2641 (class 826 OID 16635)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2635 (class 826 OID 16617)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2637 (class 826 OID 16616)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2636 (class 826 OID 16615)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2622 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2623 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2621 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2625 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2620 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2624 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2633 (class 826 OID 16607)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2634 (class 826 OID 16608)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2632 (class 826 OID 16606)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2628 (class 826 OID 16545)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2627 (class 826 OID 16544)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2626 (class 826 OID 16543)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 3811 (class 3466 OID 16621)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- TOC entry 3816 (class 3466 OID 16700)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- TOC entry 3810 (class 3466 OID 16619)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- TOC entry 3817 (class 3466 OID 16703)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- TOC entry 3812 (class 3466 OID 16622)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- TOC entry 3813 (class 3466 OID 16623)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

-- Completed on 2025-11-26 22:26:13

--
-- PostgreSQL database dump complete
--

\unrestrict Bc5pYVO33JyJp6ZrMFCcERfGN4itgj6IQ2fBoxNwiHryEUB68vo0WybrSHpGkGR

-- Completed on 2025-11-26 22:26:13

--
-- PostgreSQL database cluster dump complete
--

