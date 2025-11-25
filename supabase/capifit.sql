--
-- PostgreSQL database cluster dump
--

-- Started on 2025-11-24 23:49:18

\restrict 6Dy5bSHPIrFe7eYGNoPYKjnjyzvhNEGH8Fd7qSEMHz3hljJ8Fez86XNpekfTJrZ

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






\unrestrict 6Dy5bSHPIrFe7eYGNoPYKjnjyzvhNEGH8Fd7qSEMHz3hljJ8Fez86XNpekfTJrZ

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

\restrict ZZH3quH87PukvGCx6cUUzX6EwRvCu1ZJSLvPDqSz0S7JvVXU8oUE35hXUdJdLJM

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-24 23:49:25

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

-- Completed on 2025-11-24 23:49:42

--
-- PostgreSQL database dump complete
--

\unrestrict ZZH3quH87PukvGCx6cUUzX6EwRvCu1ZJSLvPDqSz0S7JvVXU8oUE35hXUdJdLJM

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict AlWIWnyb9iVW1MG0zlv0f3LDeJ0jb0JawdfN7LwA2BchpCdxOKxP0s4HntgPN3E

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-24 23:49:42

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
-- TOC entry 4706 (class 0 OID 0)
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
-- TOC entry 4707 (class 0 OID 0)
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
-- TOC entry 4708 (class 0 OID 0)
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
-- TOC entry 4709 (class 0 OID 0)
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
-- TOC entry 4710 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 1217 (class 1247 OID 16784)
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- TOC entry 1241 (class 1247 OID 16925)
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- TOC entry 1214 (class 1247 OID 16778)
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- TOC entry 1211 (class 1247 OID 16773)
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1259 (class 1247 OID 17028)
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
-- TOC entry 1271 (class 1247 OID 17101)
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1253 (class 1247 OID 17006)
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1262 (class 1247 OID 17038)
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- TOC entry 1247 (class 1247 OID 16967)
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
-- TOC entry 1301 (class 1247 OID 17312)
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
-- TOC entry 1292 (class 1247 OID 17272)
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
-- TOC entry 1295 (class 1247 OID 17287)
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- TOC entry 1307 (class 1247 OID 17358)
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
-- TOC entry 1304 (class 1247 OID 17325)
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
-- TOC entry 1286 (class 1247 OID 17241)
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- TOC entry 459 (class 1255 OID 16540)
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
-- TOC entry 4711 (class 0 OID 0)
-- Dependencies: 459
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- TOC entry 467 (class 1255 OID 16755)
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
-- TOC entry 414 (class 1255 OID 16539)
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
-- TOC entry 4714 (class 0 OID 0)
-- Dependencies: 414
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- TOC entry 433 (class 1255 OID 16538)
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
-- TOC entry 4716 (class 0 OID 0)
-- Dependencies: 433
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- TOC entry 497 (class 1255 OID 16597)
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
-- TOC entry 4732 (class 0 OID 0)
-- Dependencies: 497
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- TOC entry 477 (class 1255 OID 16618)
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
-- TOC entry 4734 (class 0 OID 0)
-- Dependencies: 477
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- TOC entry 448 (class 1255 OID 16599)
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
-- TOC entry 4736 (class 0 OID 0)
-- Dependencies: 448
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- TOC entry 408 (class 1255 OID 16609)
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
-- TOC entry 512 (class 1255 OID 16610)
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
-- TOC entry 420 (class 1255 OID 16620)
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
-- TOC entry 4765 (class 0 OID 0)
-- Dependencies: 420
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- TOC entry 461 (class 1255 OID 16387)
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
-- TOC entry 439 (class 1255 OID 20159)
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
-- TOC entry 431 (class 1255 OID 17869)
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
-- TOC entry 513 (class 1255 OID 22754)
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
-- TOC entry 525 (class 1255 OID 22615)
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
-- TOC entry 455 (class 1255 OID 19663)
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
-- TOC entry 411 (class 1255 OID 22611)
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
-- TOC entry 427 (class 1255 OID 26400)
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
-- TOC entry 413 (class 1255 OID 18126)
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
-- TOC entry 456 (class 1255 OID 22416)
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
-- TOC entry 507 (class 1255 OID 17853)
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
-- TOC entry 440 (class 1255 OID 17865)
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
-- TOC entry 421 (class 1255 OID 17867)
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
-- TOC entry 449 (class 1255 OID 17866)
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
-- TOC entry 436 (class 1255 OID 22482)
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
-- TOC entry 4793 (class 0 OID 0)
-- Dependencies: 436
-- Name: FUNCTION link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) IS 'Vincula um cliente ao profissional atual e opcionalmente atualiza seus dados de perfil (nome, telefone). 
Parâmetros: p_client_id (UUID), p_notes (TEXT), p_full_name (TEXT), p_phone (TEXT).
Retorna: UUID do vínculo criado.';


--
-- TOC entry 536 (class 1255 OID 24997)
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
-- TOC entry 479 (class 1255 OID 22483)
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
-- TOC entry 4796 (class 0 OID 0)
-- Dependencies: 479
-- Name: FUNCTION professional_can_link_client(p_client_id uuid); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION public.professional_can_link_client(p_client_id uuid) IS 'Vefica se o profissional atual pode vincular o cliente especificado. 
Retorna TRUE se pode vincular, FALSE caso contrário.';


--
-- TOC entry 508 (class 1255 OID 17868)
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
-- TOC entry 415 (class 1255 OID 17351)
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
-- TOC entry 545 (class 1255 OID 17431)
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
-- TOC entry 473 (class 1255 OID 17363)
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
-- TOC entry 428 (class 1255 OID 17309)
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
-- TOC entry 462 (class 1255 OID 17304)
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
-- TOC entry 510 (class 1255 OID 17359)
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
-- TOC entry 531 (class 1255 OID 17370)
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
-- TOC entry 521 (class 1255 OID 17303)
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
-- TOC entry 438 (class 1255 OID 17430)
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
-- TOC entry 482 (class 1255 OID 17301)
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
-- TOC entry 487 (class 1255 OID 17340)
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- TOC entry 469 (class 1255 OID 17423)
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- TOC entry 484 (class 1255 OID 17214)
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
-- TOC entry 500 (class 1255 OID 17140)
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
-- TOC entry 468 (class 1255 OID 17259)
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
-- TOC entry 429 (class 1255 OID 17215)
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
-- TOC entry 465 (class 1255 OID 17218)
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
-- TOC entry 486 (class 1255 OID 17238)
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
-- TOC entry 520 (class 1255 OID 17114)
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
-- TOC entry 470 (class 1255 OID 17113)
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
-- TOC entry 437 (class 1255 OID 17112)
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
-- TOC entry 474 (class 1255 OID 17196)
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


ALTER FUNCTION storage.get_level(name text) OWNER TO supabase_storage_admin;

--
-- TOC entry 498 (class 1255 OID 17212)
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
-- TOC entry 505 (class 1255 OID 17213)
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
-- TOC entry 519 (class 1255 OID 17236)
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
-- TOC entry 522 (class 1255 OID 17179)
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
-- TOC entry 541 (class 1255 OID 17142)
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
-- TOC entry 475 (class 1255 OID 17258)
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
-- TOC entry 424 (class 1255 OID 17260)
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
-- TOC entry 472 (class 1255 OID 17217)
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
-- TOC entry 412 (class 1255 OID 17261)
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
-- TOC entry 528 (class 1255 OID 17266)
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
-- TOC entry 480 (class 1255 OID 17237)
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
-- TOC entry 491 (class 1255 OID 17195)
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
-- TOC entry 489 (class 1255 OID 17262)
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
-- TOC entry 450 (class 1255 OID 17216)
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
-- TOC entry 490 (class 1255 OID 17129)
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
-- TOC entry 523 (class 1255 OID 17234)
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
-- TOC entry 451 (class 1255 OID 17233)
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
-- TOC entry 517 (class 1255 OID 17257)
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
-- TOC entry 496 (class 1255 OID 17130)
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
-- TOC entry 344 (class 1259 OID 16525)
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
-- TOC entry 4814 (class 0 OID 0)
-- Dependencies: 344
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- TOC entry 361 (class 1259 OID 16929)
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
-- TOC entry 4816 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- TOC entry 352 (class 1259 OID 16727)
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
-- TOC entry 4818 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- TOC entry 4819 (class 0 OID 0)
-- Dependencies: 352
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- TOC entry 343 (class 1259 OID 16518)
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
-- TOC entry 4821 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- TOC entry 356 (class 1259 OID 16816)
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
-- TOC entry 4823 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- TOC entry 355 (class 1259 OID 16804)
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
-- TOC entry 4825 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- TOC entry 354 (class 1259 OID 16791)
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
-- TOC entry 4827 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- TOC entry 4828 (class 0 OID 0)
-- Dependencies: 354
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- TOC entry 364 (class 1259 OID 17041)
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
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- TOC entry 363 (class 1259 OID 17011)
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
-- TOC entry 365 (class 1259 OID 17074)
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
-- TOC entry 362 (class 1259 OID 16979)
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
-- TOC entry 342 (class 1259 OID 16507)
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
-- TOC entry 4834 (class 0 OID 0)
-- Dependencies: 342
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- TOC entry 341 (class 1259 OID 16506)
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
-- TOC entry 4836 (class 0 OID 0)
-- Dependencies: 341
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- TOC entry 359 (class 1259 OID 16858)
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
-- TOC entry 4838 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- TOC entry 360 (class 1259 OID 16876)
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
-- TOC entry 4840 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- TOC entry 345 (class 1259 OID 16533)
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- TOC entry 4842 (class 0 OID 0)
-- Dependencies: 345
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- TOC entry 353 (class 1259 OID 16757)
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
    refresh_token_counter bigint
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- TOC entry 4844 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- TOC entry 4845 (class 0 OID 0)
-- Dependencies: 353
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- TOC entry 4846 (class 0 OID 0)
-- Dependencies: 353
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- TOC entry 4847 (class 0 OID 0)
-- Dependencies: 353
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- TOC entry 358 (class 1259 OID 16843)
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
-- TOC entry 4849 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- TOC entry 357 (class 1259 OID 16834)
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
-- TOC entry 4851 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- TOC entry 4852 (class 0 OID 0)
-- Dependencies: 357
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- TOC entry 340 (class 1259 OID 16495)
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
-- TOC entry 4854 (class 0 OID 0)
-- Dependencies: 340
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- TOC entry 4855 (class 0 OID 0)
-- Dependencies: 340
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- TOC entry 395 (class 1259 OID 17790)
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
-- TOC entry 394 (class 1259 OID 17774)
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
-- TOC entry 396 (class 1259 OID 17813)
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
-- TOC entry 379 (class 1259 OID 17482)
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
-- TOC entry 391 (class 1259 OID 17708)
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
-- TOC entry 380 (class 1259 OID 17496)
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
-- TOC entry 384 (class 1259 OID 17571)
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
-- TOC entry 381 (class 1259 OID 17519)
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
-- TOC entry 386 (class 1259 OID 17618)
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
-- TOC entry 392 (class 1259 OID 17735)
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
-- TOC entry 390 (class 1259 OID 17684)
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
-- TOC entry 389 (class 1259 OID 17668)
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
-- TOC entry 378 (class 1259 OID 17466)
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
-- TOC entry 398 (class 1259 OID 22388)
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
-- TOC entry 377 (class 1259 OID 17451)
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
-- TOC entry 393 (class 1259 OID 17760)
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
-- TOC entry 388 (class 1259 OID 17650)
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
-- TOC entry 387 (class 1259 OID 17634)
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
-- TOC entry 383 (class 1259 OID 17553)
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
-- TOC entry 385 (class 1259 OID 17598)
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
-- TOC entry 397 (class 1259 OID 20118)
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
    CONSTRAINT workout_sessions_status_check CHECK ((status = ANY (ARRAY['started'::text, 'paused'::text, 'completed'::text, 'abandoned'::text])))
);


ALTER TABLE public.workout_sessions OWNER TO postgres;

--
-- TOC entry 382 (class 1259 OID 17536)
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
-- TOC entry 376 (class 1259 OID 17434)
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
-- TOC entry 401 (class 1259 OID 22560)
-- Name: messages_2025_11_22; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_22 OWNER TO supabase_admin;

--
-- TOC entry 402 (class 1259 OID 22572)
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
-- TOC entry 403 (class 1259 OID 24982)
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
-- TOC entry 404 (class 1259 OID 25020)
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
-- TOC entry 405 (class 1259 OID 26290)
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
-- TOC entry 406 (class 1259 OID 27574)
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
-- TOC entry 407 (class 1259 OID 28690)
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
-- TOC entry 369 (class 1259 OID 17225)
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- TOC entry 373 (class 1259 OID 17289)
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
-- TOC entry 372 (class 1259 OID 17288)
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
-- TOC entry 346 (class 1259 OID 16546)
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
-- TOC entry 4892 (class 0 OID 0)
-- Dependencies: 346
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 370 (class 1259 OID 17246)
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
-- TOC entry 399 (class 1259 OID 22419)
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
-- TOC entry 348 (class 1259 OID 16588)
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
-- TOC entry 347 (class 1259 OID 16561)
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
-- TOC entry 4896 (class 0 OID 0)
-- Dependencies: 347
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- TOC entry 368 (class 1259 OID 17197)
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
-- TOC entry 366 (class 1259 OID 17144)
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
-- TOC entry 367 (class 1259 OID 17158)
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
-- TOC entry 400 (class 1259 OID 22429)
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
-- TOC entry 3793 (class 0 OID 0)
-- Name: messages_2025_11_22; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_22 FOR VALUES FROM ('2025-11-22 00:00:00') TO ('2025-11-23 00:00:00');


--
-- TOC entry 3794 (class 0 OID 0)
-- Name: messages_2025_11_23; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_23 FOR VALUES FROM ('2025-11-23 00:00:00') TO ('2025-11-24 00:00:00');


--
-- TOC entry 3795 (class 0 OID 0)
-- Name: messages_2025_11_24; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_24 FOR VALUES FROM ('2025-11-24 00:00:00') TO ('2025-11-25 00:00:00');


--
-- TOC entry 3796 (class 0 OID 0)
-- Name: messages_2025_11_25; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_25 FOR VALUES FROM ('2025-11-25 00:00:00') TO ('2025-11-26 00:00:00');


--
-- TOC entry 3797 (class 0 OID 0)
-- Name: messages_2025_11_26; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_26 FOR VALUES FROM ('2025-11-26 00:00:00') TO ('2025-11-27 00:00:00');


--
-- TOC entry 3798 (class 0 OID 0)
-- Name: messages_2025_11_27; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_27 FOR VALUES FROM ('2025-11-27 00:00:00') TO ('2025-11-28 00:00:00');


--
-- TOC entry 3799 (class 0 OID 0)
-- Name: messages_2025_11_28; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_28 FOR VALUES FROM ('2025-11-28 00:00:00') TO ('2025-11-29 00:00:00');


--
-- TOC entry 3809 (class 2604 OID 16510)
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- TOC entry 4638 (class 0 OID 16525)
-- Dependencies: 344
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4652 (class 0 OID 16929)
-- Dependencies: 361
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4643 (class 0 OID 16727)
-- Dependencies: 352
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.identities VALUES ('f2bb6acc-835a-414c-8856-836415b23896', 'f2bb6acc-835a-414c-8856-836415b23896', '{"sub": "f2bb6acc-835a-414c-8856-836415b23896", "email": "profissional@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-16 22:09:35.755205+00', '2025-11-16 22:09:35.755278+00', '2025-11-16 22:09:35.755278+00', DEFAULT, 'cc11d77e-c8e9-4594-b4b0-c3856a51f430');
INSERT INTO auth.identities VALUES ('c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', 'c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', '{"sub": "c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4", "email": "admin@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-16 22:10:09.627966+00', '2025-11-16 22:10:09.628014+00', '2025-11-16 22:10:09.628014+00', DEFAULT, '8350b6c2-fdb1-4d00-b40d-82a7a2b136ec');
INSERT INTO auth.identities VALUES ('855a9cc7-2c06-4650-a8b4-8d46e8921911', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '{"sub": "855a9cc7-2c06-4650-a8b4-8d46e8921911", "email": "cliente1@capifit.com", "email_verified": false, "phone_verified": false}', 'email', '2025-11-16 23:01:48.834197+00', '2025-11-16 23:01:48.834268+00', '2025-11-16 23:01:48.834268+00', DEFAULT, '4b48584f-9de4-470d-a0be-da58437d9dc2');


--
-- TOC entry 4637 (class 0 OID 16518)
-- Dependencies: 343
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4647 (class 0 OID 16816)
-- Dependencies: 356
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.mfa_amr_claims VALUES ('6757e519-3604-488a-bb6a-f553d9f19f47', '2025-11-23 02:28:08.646356+00', '2025-11-23 02:28:08.646356+00', 'password', '4f76eefe-0c48-4657-a073-97abccb53bf0');
INSERT INTO auth.mfa_amr_claims VALUES ('59e6f6b5-a5fa-4ec4-befd-719e36d435dc', '2025-11-23 13:59:41.566553+00', '2025-11-23 13:59:41.566553+00', 'password', 'b2004b67-3348-41aa-95da-b5a856517448');
INSERT INTO auth.mfa_amr_claims VALUES ('a66fe893-930d-47e7-a9c2-63c0d2a872c7', '2025-11-24 11:28:09.935442+00', '2025-11-24 11:28:09.935442+00', 'password', 'd182b846-7ca7-4c99-9bc6-61f5c57c7449');
INSERT INTO auth.mfa_amr_claims VALUES ('7a35a9cd-9dd5-45e4-9a28-261914267fe7', '2025-11-25 00:42:06.526627+00', '2025-11-25 00:42:06.526627+00', 'password', 'dc74121f-99eb-45de-af24-42f3f93923bb');


--
-- TOC entry 4646 (class 0 OID 16804)
-- Dependencies: 355
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4645 (class 0 OID 16791)
-- Dependencies: 354
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4655 (class 0 OID 17041)
-- Dependencies: 364
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4654 (class 0 OID 17011)
-- Dependencies: 363
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4656 (class 0 OID 17074)
-- Dependencies: 365
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4653 (class 0 OID 16979)
-- Dependencies: 362
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4636 (class 0 OID 16507)
-- Dependencies: 342
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 472, 'sukl5xr7lgey', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 11:20:45.773563+00', '2025-11-24 12:18:45.801953+00', '5pu3ehiefkmr', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 417, 'hmrxhxy7yaqg', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 13:05:46.081617+00', '2025-11-23 14:03:45.411167+00', 'r7hohdewvq6k', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 474, 'uconitlonf2f', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 12:18:45.820408+00', '2025-11-24 13:16:46.428135+00', 'sukl5xr7lgey', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 476, 'gosr5j3jjq74', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 13:25:38.220473+00', '2025-11-24 14:24:11.458492+00', 'wlgp4uwjnaxw', 'a66fe893-930d-47e7-a9c2-63c0d2a872c7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 478, '7o5wq4cxxpzb', '855a9cc7-2c06-4650-a8b4-8d46e8921911', false, '2025-11-24 14:24:11.469663+00', '2025-11-24 14:24:11.469663+00', 'gosr5j3jjq74', 'a66fe893-930d-47e7-a9c2-63c0d2a872c7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 421, 'jxft5wuct4ey', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 14:03:45.414283+00', '2025-11-23 15:01:45.741838+00', 'hmrxhxy7yaqg', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 480, 'rdrdtinua2u5', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 16:10:45.979637+00', '2025-11-24 17:08:46.105356+00', 'ycao74rxaxwm', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 482, 'dfwopv33uymx', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 18:06:46.090612+00', '2025-11-24 19:04:46.435134+00', '5542zmm7uljx', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 425, 'ujgdzwrnubtl', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 15:01:45.752235+00', '2025-11-23 15:59:44.983575+00', 'jxft5wuct4ey', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 484, 'ioxeezcph6ba', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 20:02:45.988089+00', '2025-11-24 21:00:45.985884+00', '7thktj5ebu5v', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 486, 'iu3wqt67qy3f', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 21:58:46.225516+00', '2025-11-24 22:56:46.161588+00', 'uliey232yf2y', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 429, 'x2ugfa5hgcqo', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 16:57:46.398033+00', '2025-11-23 17:55:46.104312+00', 'nzd2yhigieji', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 488, 'lwafywcgyz7x', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 23:54:46.270099+00', '2025-11-25 00:58:19.491344+00', 'sm34vvayqdte', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 401, 'vxx24vrkt2yo', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 05:21:45.907532+00', '2025-11-23 06:19:46.240759+00', 'lk3dy6b3k4yc', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 490, 'wfqxchbcoyf3', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-25 00:58:19.506298+00', '2025-11-25 01:56:33.791348+00', 'lwafywcgyz7x', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 492, 'vp3gxnnvxilv', '855a9cc7-2c06-4650-a8b4-8d46e8921911', false, '2025-11-25 01:56:33.79821+00', '2025-11-25 01:56:33.79821+00', 'wfqxchbcoyf3', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 405, '3czh7c45mrps', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 07:17:46.022434+00', '2025-11-23 08:15:46.149189+00', '7b2i7jbvcerd', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 407, '5vbdjaqezjup', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 08:15:46.158313+00', '2025-11-23 09:13:46.201431+00', '3czh7c45mrps', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 436, 'ogkepu5g6axr', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 18:54:22.133482+00', '2025-11-23 19:52:45.826094+00', 'gij5wybxacrh', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 438, 'oyet3p5w3kc7', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 19:52:45.842471+00', '2025-11-23 20:50:45.326255+00', 'ogkepu5g6axr', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 413, 'iblwitwxsivh', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 11:09:46.077845+00', '2025-11-23 12:07:45.937693+00', 'vgout43bqh7w', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 440, 'se2raojlwi7f', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 20:50:45.339072+00', '2025-11-23 21:48:46.150377+00', 'oyet3p5w3kc7', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 442, '27sy2b2bmpl2', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 21:48:46.170272+00', '2025-11-23 22:46:45.925919+00', 'se2raojlwi7f', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 420, 'dl3fddm2ru7o', '855a9cc7-2c06-4650-a8b4-8d46e8921911', false, '2025-11-23 13:59:41.548232+00', '2025-11-23 13:59:41.548232+00', NULL, '59e6f6b5-a5fa-4ec4-befd-719e36d435dc');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 473, 'wlgp4uwjnaxw', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 11:28:09.926139+00', '2025-11-24 13:25:38.214332+00', NULL, 'a66fe893-930d-47e7-a9c2-63c0d2a872c7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 475, 'tfdcwwntn24p', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 13:16:46.44437+00', '2025-11-24 14:14:46.300621+00', 'uconitlonf2f', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 477, 'rubmocugbt2y', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 14:14:46.329157+00', '2025-11-24 15:12:45.824765+00', 'tfdcwwntn24p', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 427, 'nzd2yhigieji', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 15:59:44.983954+00', '2025-11-23 16:57:46.376525+00', 'ujgdzwrnubtl', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 479, 'ycao74rxaxwm', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 15:12:45.839628+00', '2025-11-24 16:10:45.962997+00', 'rubmocugbt2y', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 395, '256ww4gbghgs', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 02:28:08.64035+00', '2025-11-23 03:25:34.347989+00', NULL, '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 481, '5542zmm7uljx', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 17:08:46.119737+00', '2025-11-24 18:06:46.073486+00', 'rdrdtinua2u5', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 433, 'gij5wybxacrh', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 17:55:46.124265+00', '2025-11-23 18:54:22.113734+00', 'x2ugfa5hgcqo', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 483, '7thktj5ebu5v', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 19:04:46.4462+00', '2025-11-24 20:02:45.971762+00', 'dfwopv33uymx', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 485, 'uliey232yf2y', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 21:00:46.007893+00', '2025-11-24 21:58:46.220023+00', 'ioxeezcph6ba', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 397, '2tsjys5oudf2', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 03:25:34.355938+00', '2025-11-23 04:23:46.070515+00', '256ww4gbghgs', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 487, 'sm34vvayqdte', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 22:56:46.180303+00', '2025-11-24 23:54:46.256949+00', 'iu3wqt67qy3f', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 489, '5uu6jdcs44b3', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 00:42:06.502314+00', '2025-11-25 01:39:16.905812+00', NULL, '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 400, 'lk3dy6b3k4yc', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 04:23:46.088043+00', '2025-11-23 05:21:45.896551+00', '2tsjys5oudf2', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 491, 'lcdkspig6ihy', 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-25 01:39:16.922832+00', '2025-11-25 02:37:45.792667+00', '5uu6jdcs44b3', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 493, 'dhsolr525qtf', 'f2bb6acc-835a-414c-8856-836415b23896', false, '2025-11-25 02:37:45.812331+00', '2025-11-25 02:37:45.812331+00', 'lcdkspig6ihy', '7a35a9cd-9dd5-45e4-9a28-261914267fe7');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 403, '7b2i7jbvcerd', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 06:19:46.262422+00', '2025-11-23 07:17:46.010385+00', 'vxx24vrkt2yo', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 445, 'u3llhra3muao', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 22:46:45.950164+00', '2025-11-23 23:44:46.160114+00', '27sy2b2bmpl2', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 447, 'cjemdvdwvxfm', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 23:44:46.178518+00', '2025-11-24 00:42:46.202465+00', 'u3llhra3muao', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 410, '43flibiu44ig', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 09:13:46.223663+00', '2025-11-23 10:11:46.023209+00', '5vbdjaqezjup', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 412, 'vgout43bqh7w', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 10:11:46.034722+00', '2025-11-23 11:09:46.057828+00', '43flibiu44ig', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 449, 'tr2gmjm542mv', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 00:42:46.217864+00', '2025-11-24 01:40:46.103803+00', 'cjemdvdwvxfm', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 415, 'r7hohdewvq6k', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-23 12:07:45.949311+00', '2025-11-23 13:05:46.065952+00', 'iblwitwxsivh', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 451, 'u7pvq6js4jwm', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 01:40:46.12921+00', '2025-11-24 02:38:46.212372+00', 'tr2gmjm542mv', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 453, 'jxk4o4jgg7yk', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 02:38:46.241734+00', '2025-11-24 03:36:45.934593+00', 'u7pvq6js4jwm', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 455, 'xo5obaxs77qc', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 03:36:45.955621+00', '2025-11-24 04:34:45.942921+00', 'jxk4o4jgg7yk', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 457, 'emliszl626o4', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 04:34:45.960324+00', '2025-11-24 05:32:46.21951+00', 'xo5obaxs77qc', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 459, 'bmizisgtzzes', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 05:32:46.23575+00', '2025-11-24 06:30:45.880291+00', 'emliszl626o4', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 461, 'hl52byhjvev6', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 06:30:45.905793+00', '2025-11-24 07:28:46.015479+00', 'bmizisgtzzes', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 463, 'eg43pamhcofr', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 07:28:46.038951+00', '2025-11-24 08:26:46.225441+00', 'hl52byhjvev6', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 465, 'hwnedo4ws4ai', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 08:26:46.250376+00', '2025-11-24 09:24:46.009274+00', 'eg43pamhcofr', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 467, '26ty4j5e6aip', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 09:24:46.028035+00', '2025-11-24 10:22:46.211089+00', 'hwnedo4ws4ai', '6757e519-3604-488a-bb6a-f553d9f19f47');
INSERT INTO auth.refresh_tokens VALUES ('00000000-0000-0000-0000-000000000000', 469, '5pu3ehiefkmr', '855a9cc7-2c06-4650-a8b4-8d46e8921911', true, '2025-11-24 10:22:46.227013+00', '2025-11-24 11:20:45.763587+00', '26ty4j5e6aip', '6757e519-3604-488a-bb6a-f553d9f19f47');


--
-- TOC entry 4650 (class 0 OID 16858)
-- Dependencies: 359
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4651 (class 0 OID 16876)
-- Dependencies: 360
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4639 (class 0 OID 16533)
-- Dependencies: 345
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


--
-- TOC entry 4644 (class 0 OID 16757)
-- Dependencies: 353
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.sessions VALUES ('59e6f6b5-a5fa-4ec4-befd-719e36d435dc', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-23 13:59:41.515969+00', '2025-11-23 13:59:41.515969+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36', '189.18.117.147', NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('a66fe893-930d-47e7-a9c2-63c0d2a872c7', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-24 11:28:09.911482+00', '2025-11-24 14:24:11.482945+00', NULL, 'aal1', NULL, '2025-11-24 14:24:11.48174', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '186.225.138.87', NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('6757e519-3604-488a-bb6a-f553d9f19f47', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-23 02:28:08.635205+00', '2025-11-25 01:56:33.809664+00', NULL, 'aal1', NULL, '2025-11-25 01:56:33.809571', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '189.18.117.147', NULL, NULL, NULL, NULL);
INSERT INTO auth.sessions VALUES ('7a35a9cd-9dd5-45e4-9a28-261914267fe7', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-25 00:42:06.472892+00', '2025-11-25 02:37:45.835964+00', NULL, 'aal1', NULL, '2025-11-25 02:37:45.834798', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36', '189.18.117.147', NULL, NULL, NULL, NULL);


--
-- TOC entry 4649 (class 0 OID 16843)
-- Dependencies: 358
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4648 (class 0 OID 16834)
-- Dependencies: 357
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- TOC entry 4634 (class 0 OID 16495)
-- Dependencies: 340
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', 'f2bb6acc-835a-414c-8856-836415b23896', 'authenticated', 'authenticated', 'profissional@capifit.com', '$2a$10$dk.qa.nLD7wm3wkqohwtMeYT1Qt1jW.ublImwK5/gVPVc4lFw3MJ2', '2025-11-16 22:09:35.759426+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-25 00:42:06.471588+00', '{"provider": "email", "providers": ["email"]}', '{"role": "professional", "phone": "(17) 98803-1873", "full_name": "Giuliano Moretti Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg", "email_verified": true}', NULL, '2025-11-16 22:09:35.744308+00', '2025-11-25 02:37:45.824177+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', 'c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', 'authenticated', 'authenticated', 'admin@capifit.com', '$2a$10$MZ6JN.1Cid87Ze/ntbc/cubpoNEYiaC77VBvw8etFf0ecZqQkdq2a', '2025-11-16 22:10:09.629885+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-16 23:47:16.875772+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-11-16 22:10:09.626622+00', '2025-11-16 23:47:16.880781+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);
INSERT INTO auth.users VALUES ('00000000-0000-0000-0000-000000000000', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'authenticated', 'authenticated', 'cliente1@capifit.com', '$2a$10$uaPNEUKZntO2G4Vnq.AwX.SEOlzGGVbAfDAgnxrsp7rzMU2pB15jK', '2025-11-16 23:01:48.838588+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-11-24 11:28:09.911368+00', '{"provider": "email", "providers": ["email"]}', '{"phone": "(17) 3236-6250", "full_name": "Cliente de Teste", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/855a9cc7-2c06-4650-a8b4-8d46e8921911/avatar-1764033213765.jpg?t=1764033215677", "email_verified": true}', NULL, '2025-11-16 23:01:48.823063+00', '2025-11-25 01:56:33.806315+00', NULL, NULL, '', '', NULL, DEFAULT, '', 0, NULL, '', NULL, false, NULL, false);


--
-- TOC entry 4682 (class 0 OID 17790)
-- Dependencies: 395
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4681 (class 0 OID 17774)
-- Dependencies: 394
-- Data for Name: biometric_data; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.biometric_data VALUES ('5eb3d01f-fa7e-4e75-aad5-a673dd06fb9b', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-23', 105.00, 185.00, -1.20, 0.00, '{"bmi": 30.68, "status": "draft", "fat_mass": 0, "protocol": "Pollock 3 Dobras", "lean_mass": 0, "skinfolds": {"calf": "", "chest": "", "thigh": "", "biceps": "", "triceps": "", "axillary": "", "abdominal": "", "suprailiac": "", "subscapular": ""}, "completion": 64, "circumferences": {"hips": "111.5", "chest": "117", "waist": "103.5", "abdomen": "107", "arm_left": "42", "shoulder": "0", "arm_right": "42", "calf_left": "43", "calf_right": "43", "thigh_left": "59.5", "thigh_right": "59.5"}}', '', '2025-11-23 03:46:21.675105+00');


--
-- TOC entry 4683 (class 0 OID 17813)
-- Dependencies: 396
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.chat_messages VALUES ('14d713e9-efa7-4d25-bcad-c1169d98e19c', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 01:32:07.223188+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:50:14.115595+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('e51efa21-50ff-400d-b40f-34a1a0657e57', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 01:32:32.281709+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:50:14.115595+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('60092841-e9e8-4a7f-a0b1-25737399e049', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 01:36:45.728603+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:50:14.115595+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('e4935403-f6ad-4ac4-877a-4f08a9e89ae9', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 02:37:22.078684+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:50:14.115595+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('d3cc9f2f-43a7-49ed-995f-8b3b3f4e30c5', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste 2', 'text', NULL, true, '2025-11-20 02:39:19.495489+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:50:14.115595+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('4a1f865e-9551-46a9-85dc-95b5a873c3e8', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'e', 'text', NULL, true, '2025-11-20 02:40:50.437949+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:50:14.115595+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('15e6af06-8602-4c8a-a2b6-0c64afe3e51b', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 02:54:23.535684+00', '2025-11-20 03:19:15.145+00', '2025-11-20 02:54:23.535684+00', '2025-11-20 03:01:41.374034+00');
INSERT INTO public.chat_messages VALUES ('d9d9dbff-8d68-4b6b-8594-0db7761b6279', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste novo agora', 'text', NULL, true, '2025-11-20 03:06:06.423213+00', '2025-11-20 03:19:15.145+00', '2025-11-20 03:06:06.423213+00', '2025-11-20 03:06:06.423213+00');
INSERT INTO public.chat_messages VALUES ('e31816cf-1dd2-4f0b-9b90-338e443d220e', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-20 03:26:55.120448+00', '2025-11-20 03:27:53.115+00', '2025-11-20 03:26:55.120448+00', '2025-11-20 03:26:55.120448+00');
INSERT INTO public.chat_messages VALUES ('3a67b39d-dbdb-4c12-847a-16982d174d96', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 03:35:11.365368+00', '2025-11-20 03:36:24.447+00', '2025-11-20 03:35:11.365368+00', '2025-11-20 03:35:11.365368+00');
INSERT INTO public.chat_messages VALUES ('3e33daea-8900-44e7-bf33-4e1de361f1fe', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'oi', 'text', NULL, true, '2025-11-20 03:35:34.712943+00', '2025-11-20 03:36:47.118+00', '2025-11-20 03:35:34.712943+00', '2025-11-20 03:35:34.712943+00');
INSERT INTO public.chat_messages VALUES ('9cc765a9-9f32-4fe8-b302-64eb23395d87', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'lasjkdflksadjf', 'text', NULL, true, '2025-11-20 03:36:04.676457+00', '2025-11-20 03:37:27.599+00', '2025-11-20 03:36:04.676457+00', '2025-11-20 03:36:04.676457+00');
INSERT INTO public.chat_messages VALUES ('85359bbf-637a-4bba-9883-390bdf87b2d9', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'atualizar', 'text', NULL, true, '2025-11-20 03:36:37.855963+00', '2025-11-20 03:38:12.293+00', '2025-11-20 03:36:37.855963+00', '2025-11-20 03:36:37.855963+00');
INSERT INTO public.chat_messages VALUES ('47a1635d-c398-41f2-b6da-c40e8657003a', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'nova tentativa', 'text', NULL, true, '2025-11-20 03:37:46.753817+00', '2025-11-20 03:38:54.107+00', '2025-11-20 03:37:46.753817+00', '2025-11-20 03:37:46.753817+00');
INSERT INTO public.chat_messages VALUES ('86b39be3-1095-4474-997e-bb4fb0fbe7ec', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 03:48:01.374031+00', '2025-11-20 03:49:56.249+00', '2025-11-20 03:48:01.374031+00', '2025-11-20 03:48:01.374031+00');
INSERT INTO public.chat_messages VALUES ('8d9f184e-9405-4af4-951d-c712af11e563', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste teste teste', 'text', NULL, true, '2025-11-20 03:48:28.158662+00', '2025-11-20 03:49:56.249+00', '2025-11-20 03:48:28.158662+00', '2025-11-20 03:48:28.158662+00');
INSERT INTO public.chat_messages VALUES ('e20933f2-3b82-46dc-914b-23c3567533f8', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'denovo', 'text', NULL, true, '2025-11-20 03:58:27.646202+00', '2025-11-20 03:59:37.497+00', '2025-11-20 03:58:27.646202+00', '2025-11-20 03:58:27.646202+00');
INSERT INTO public.chat_messages VALUES ('14d55ad1-751f-4fca-b004-13f7dd55d61c', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'agora sim', 'text', NULL, true, '2025-11-20 03:58:47.751526+00', '2025-11-20 04:00:42.042+00', '2025-11-20 03:58:47.751526+00', '2025-11-20 03:58:47.751526+00');
INSERT INTO public.chat_messages VALUES ('e9335b05-312d-4f55-a5e2-55c0c6c758d4', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste 112323', 'text', NULL, true, '2025-11-20 03:59:40.038155+00', '2025-11-20 04:00:42.042+00', '2025-11-20 03:59:40.038155+00', '2025-11-20 03:59:40.038155+00');
INSERT INTO public.chat_messages VALUES ('255be27c-4fa6-4d07-b440-f4cbd6a2eddb', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 04:09:56.752539+00', '2025-11-20 04:11:27.887+00', '2025-11-20 04:09:56.752539+00', '2025-11-20 04:09:56.752539+00');
INSERT INTO public.chat_messages VALUES ('0b920415-d78a-4216-aada-2570bbbae03d', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 04:10:15.298517+00', '2025-11-20 04:11:27.887+00', '2025-11-20 04:10:15.298517+00', '2025-11-20 04:10:15.298517+00');
INSERT INTO public.chat_messages VALUES ('dd1082cb-47b6-4950-b121-c392e2727572', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'nossa', 'text', NULL, true, '2025-11-20 04:10:32.350888+00', '2025-11-20 04:11:27.887+00', '2025-11-20 04:10:32.350888+00', '2025-11-20 04:10:32.350888+00');
INSERT INTO public.chat_messages VALUES ('f4a8a817-79c3-4361-8161-47d43154a66e', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'oi', 'text', NULL, true, '2025-11-20 04:10:50.418668+00', '2025-11-20 04:11:46.869+00', '2025-11-20 04:10:50.418668+00', '2025-11-20 04:10:50.418668+00');
INSERT INTO public.chat_messages VALUES ('999bc55a-5445-40b1-89e6-d657f717a491', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'oi', 'text', NULL, true, '2025-11-20 04:10:57.140345+00', '2025-11-20 04:12:19.021+00', '2025-11-20 04:10:57.140345+00', '2025-11-20 04:10:57.140345+00');
INSERT INTO public.chat_messages VALUES ('46aeafa4-a716-48f3-a427-258be5d33520', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 04:19:37.259014+00', '2025-11-20 04:21:04.272+00', '2025-11-20 04:19:37.259014+00', '2025-11-20 04:19:37.259014+00');
INSERT INTO public.chat_messages VALUES ('b1b51720-06ab-45f3-b07c-8a030e0d709b', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-20 04:20:14.46569+00', '2025-11-20 04:23:46.919+00', '2025-11-20 04:20:14.46569+00', '2025-11-20 04:20:14.46569+00');
INSERT INTO public.chat_messages VALUES ('4a8e8ae6-a750-40e7-981f-1611b0335c65', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste 65465465', 'text', NULL, true, '2025-11-20 04:22:57.142651+00', '2025-11-20 04:34:53.122+00', '2025-11-20 04:22:57.142651+00', '2025-11-20 04:22:57.142651+00');
INSERT INTO public.chat_messages VALUES ('7ecbb8dc-7e2e-455e-ae6b-e4ad3853ea7b', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 04:23:11.746771+00', '2025-11-20 04:34:53.122+00', '2025-11-20 04:23:11.746771+00', '2025-11-20 04:23:11.746771+00');
INSERT INTO public.chat_messages VALUES ('097ce301-f6a4-4eac-8970-44c6a75ad297', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 04:34:19.648699+00', '2025-11-20 05:08:39.045+00', '2025-11-20 04:34:19.648699+00', '2025-11-20 04:34:19.648699+00');
INSERT INTO public.chat_messages VALUES ('40c82ada-df5b-473f-b3f6-8142a7f32a73', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'agora sim', 'text', NULL, true, '2025-11-20 04:34:25.562658+00', '2025-11-20 05:08:39.045+00', '2025-11-20 04:34:25.562658+00', '2025-11-20 04:34:25.562658+00');
INSERT INTO public.chat_messages VALUES ('52d25452-ecf6-4ce5-9d90-0bdc4b82c95e', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-20 05:08:09.548816+00', '2025-11-20 05:13:44.52+00', '2025-11-20 05:08:09.548816+00', '2025-11-20 05:08:09.548816+00');
INSERT INTO public.chat_messages VALUES ('96241c6d-a977-43ee-9baa-aedbde0762be', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste som', 'text', NULL, true, '2025-11-20 05:13:18.357442+00', '2025-11-20 05:14:19.506+00', '2025-11-20 05:13:18.357442+00', '2025-11-20 05:13:18.357442+00');
INSERT INTO public.chat_messages VALUES ('ea26f2b9-6746-4c4d-9209-884d55f2db2c', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Teste', 'text', NULL, true, '2025-11-20 05:35:06.720121+00', '2025-11-21 16:01:44.056+00', '2025-11-20 05:35:06.720121+00', '2025-11-20 05:35:06.720121+00');
INSERT INTO public.chat_messages VALUES ('c548aeef-7e20-4df5-b29f-45f4566d1e13', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-21 15:59:07.618256+00', '2025-11-21 16:01:44.056+00', '2025-11-21 15:59:07.618256+00', '2025-11-21 15:59:07.618256+00');
INSERT INTO public.chat_messages VALUES ('3b02fc80-34e1-4057-9c2e-2c084a3c1f8a', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'olá', 'text', NULL, true, '2025-11-21 16:01:08.265304+00', '2025-11-21 16:02:22.909+00', '2025-11-21 16:01:08.265304+00', '2025-11-21 16:01:08.265304+00');
INSERT INTO public.chat_messages VALUES ('d7d75e9e-defc-4466-a83d-c8fd2dbd1c9d', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-21 21:59:22.566552+00', '2025-11-21 21:59:34.408031+00', '2025-11-21 21:59:22.566552+00', '2025-11-21 21:59:34.408031+00');
INSERT INTO public.chat_messages VALUES ('24a1a44b-1f24-4eb3-9fb0-6a032f870abb', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-21 21:59:51.542946+00', '2025-11-21 22:00:03.998836+00', '2025-11-21 21:59:51.542946+00', '2025-11-21 22:00:03.998836+00');
INSERT INTO public.chat_messages VALUES ('867782b6-0edf-41d9-80fa-637b1ee1619e', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-21 22:04:03.412034+00', '2025-11-21 22:04:44.638275+00', '2025-11-21 22:04:03.412034+00', '2025-11-21 22:04:44.638275+00');
INSERT INTO public.chat_messages VALUES ('63d1bd34-1987-4b50-b79b-0215048b5ca8', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-21 22:04:48.269587+00', '2025-11-21 22:05:18.437643+00', '2025-11-21 22:04:48.269587+00', '2025-11-21 22:05:18.437643+00');
INSERT INTO public.chat_messages VALUES ('2fad8445-949b-4bba-8682-be18f7c4dd30', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste teste', 'text', NULL, true, '2025-11-21 22:07:17.577345+00', '2025-11-21 22:07:32.78838+00', '2025-11-21 22:07:17.577345+00', '2025-11-21 22:07:32.78838+00');
INSERT INTO public.chat_messages VALUES ('d26f2168-5e0b-470b-b2c4-2e6c8a985b63', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-21 22:19:21.878077+00', '2025-11-21 22:19:29.573834+00', '2025-11-21 22:19:21.878077+00', '2025-11-21 22:19:29.573834+00');
INSERT INTO public.chat_messages VALUES ('ab3c77f0-01cc-4217-ac96-b39cf62a249d', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-21 22:19:34.050709+00', '2025-11-22 00:52:48.778759+00', '2025-11-21 22:19:34.050709+00', '2025-11-22 00:52:48.778759+00');
INSERT INTO public.chat_messages VALUES ('28e47950-26cd-4890-a019-472fe1c0c696', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Teste', 'text', NULL, true, '2025-11-21 22:52:56.944969+00', '2025-11-22 00:52:48.778759+00', '2025-11-21 22:52:56.944969+00', '2025-11-22 00:52:48.778759+00');
INSERT INTO public.chat_messages VALUES ('580704bd-e5ff-40e4-ad96-ee949134a15d', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-22 01:06:06.421018+00', '2025-11-22 01:06:28.474674+00', '2025-11-22 01:06:06.421018+00', '2025-11-22 01:06:28.474674+00');
INSERT INTO public.chat_messages VALUES ('fdd2c0aa-b5a0-4801-a0bf-0e090b9764a9', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'ola', 'text', NULL, true, '2025-11-22 02:15:42.312659+00', '2025-11-22 02:15:50.778888+00', '2025-11-22 02:15:42.312659+00', '2025-11-22 02:15:50.778888+00');
INSERT INTO public.chat_messages VALUES ('30f81727-273b-49b8-8e65-d94651ea5e53', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'Ola', 'text', NULL, true, '2025-11-22 17:00:52.025218+00', '2025-11-22 17:03:38.279725+00', '2025-11-22 17:00:52.025218+00', '2025-11-22 17:03:38.279725+00');
INSERT INTO public.chat_messages VALUES ('c5f34bbb-10ea-49a4-9496-b54ae6f8096c', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-22 19:35:28.107343+00', '2025-11-22 19:49:18.785744+00', '2025-11-22 19:35:28.107343+00', '2025-11-22 19:49:18.785744+00');
INSERT INTO public.chat_messages VALUES ('faa730df-5637-4b27-8140-f90d6ea5523f', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-22 19:49:02.642014+00', '2025-11-22 19:49:18.785744+00', '2025-11-22 19:49:02.642014+00', '2025-11-22 19:49:18.785744+00');
INSERT INTO public.chat_messages VALUES ('f1440bd7-bfaf-4f86-8366-e71180a74aec', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-22 19:49:26.800007+00', '2025-11-22 19:50:09.158335+00', '2025-11-22 19:49:26.800007+00', '2025-11-22 19:50:09.158335+00');
INSERT INTO public.chat_messages VALUES ('cf9a3fb3-b843-4692-9f8b-2f779e3bef88', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/1763866596076.jpg', true, '2025-11-23 02:55:48.714233+00', '2025-11-23 02:56:33.982284+00', '2025-11-23 02:55:48.714233+00', '2025-11-23 02:56:33.982284+00');
INSERT INTO public.chat_messages VALUES ('814b7bbf-fbdf-449d-8c51-abe16d640510', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/1763866616566.jpg', true, '2025-11-23 02:56:08.051489+00', '2025-11-23 02:56:33.982284+00', '2025-11-23 02:56:08.051489+00', '2025-11-23 02:56:33.982284+00');
INSERT INTO public.chat_messages VALUES ('616952d7-baed-4b21-8ddf-b224114e4063', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/1763866654309.jpg', true, '2025-11-23 02:56:45.888454+00', '2025-11-23 02:57:40.19283+00', '2025-11-23 02:56:45.888454+00', '2025-11-23 02:57:40.19283+00');
INSERT INTO public.chat_messages VALUES ('41fe353b-4fe4-4a8a-8bf7-e2d8b1085678', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/1763866672189.jpg', true, '2025-11-23 02:57:04.629344+00', '2025-11-23 02:57:40.19283+00', '2025-11-23 02:57:04.629344+00', '2025-11-23 02:57:40.19283+00');
INSERT INTO public.chat_messages VALUES ('18a5b65c-cfa9-41d5-ae20-e8ae4f2aff89', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/1763867007474.jpg', true, '2025-11-23 03:02:39.205656+00', '2025-11-23 03:07:46.041598+00', '2025-11-23 03:02:39.205656+00', '2025-11-23 03:07:46.041598+00');
INSERT INTO public.chat_messages VALUES ('b561aa17-7137-4919-af82-1c416a56d348', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/1763867104748.jpg', true, '2025-11-23 03:04:16.616256+00', '2025-11-23 03:07:46.041598+00', '2025-11-23 03:04:16.616256+00', '2025-11-23 03:07:46.041598+00');
INSERT INTO public.chat_messages VALUES ('be30decb-a73b-4151-b694-fbc9ae6c8890', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/e000cebb-9ebf-4d19-b283-c4374474fd9f-1763867321818.jpg', true, '2025-11-23 03:07:53.662334+00', '2025-11-23 03:08:12.760981+00', '2025-11-23 03:07:53.662334+00', '2025-11-23 03:08:12.760981+00');
INSERT INTO public.chat_messages VALUES ('19d08120-e305-4d5e-8aa6-e60865bd1952', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/5c01ec04-cbbd-4caf-b094-1f7b3d4b4cc9-1763867362286.jpg', true, '2025-11-23 03:08:33.916227+00', '2025-11-23 03:09:19.484996+00', '2025-11-23 03:08:33.916227+00', '2025-11-23 03:09:19.484996+00');
INSERT INTO public.chat_messages VALUES ('78baf37c-3b1e-454c-9163-ffb5abd42b59', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/f2bb6acc-835a-414c-8856-836415b23896/47320864-f8ef-46ae-91c8-1ee8493bdac4.jpg', true, '2025-11-23 03:14:03.226995+00', '2025-11-23 03:14:21.770897+00', '2025-11-23 03:14:03.226995+00', '2025-11-23 03:14:21.770897+00');
INSERT INTO public.chat_messages VALUES ('5dadaaaf-1eae-4e93-a95a-ca1dec5ff1d3', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'Imagem', 'image', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/855a9cc7-2c06-4650-a8b4-8d46e8921911/ed4bbbd4-2f72-4102-8999-c59e694b1c5c.png', true, '2025-11-23 03:14:44.535819+00', '2025-11-23 03:14:56.417045+00', '2025-11-23 03:14:44.535819+00', '2025-11-23 03:14:56.417045+00');
INSERT INTO public.chat_messages VALUES ('43f19d0b-aa93-41d1-8ccf-a733d2e41921', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'EI Programação Completa.pdf', 'file', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/chat-attachments/855a9cc7-2c06-4650-a8b4-8d46e8921911/e1a0ac6d-ceb3-46f7-bc0f-7d2f92327ed9.pdf', true, '2025-11-23 03:21:42.361464+00', '2025-11-23 03:21:53.211547+00', '2025-11-23 03:21:42.361464+00', '2025-11-23 03:21:53.211547+00');
INSERT INTO public.chat_messages VALUES ('70f8d40f-0210-44d0-b901-21beca7ae1ff', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-23 03:27:06.492317+00', '2025-11-23 03:27:23.175235+00', '2025-11-23 03:27:06.492317+00', '2025-11-23 03:27:23.175235+00');
INSERT INTO public.chat_messages VALUES ('ef9acc02-4605-408b-8cf5-7b907dc4d6fe', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'teste', 'text', NULL, true, '2025-11-23 03:32:06.323475+00', '2025-11-23 03:32:15.189672+00', '2025-11-23 03:32:06.323475+00', '2025-11-23 03:32:15.189672+00');
INSERT INTO public.chat_messages VALUES ('0ed75b49-be77-4a99-ab21-8b6fd1aa4d80', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 'text', NULL, true, '2025-11-23 03:32:27.069+00', '2025-11-23 03:32:33.625966+00', '2025-11-23 03:32:27.069+00', '2025-11-23 03:32:33.625966+00');
INSERT INTO public.chat_messages VALUES ('eff57bbb-b187-4a3a-9175-7ffff3b284df', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'Teste', 'text', NULL, true, '2025-11-23 14:02:06.94323+00', '2025-11-23 14:02:18.998654+00', '2025-11-23 14:02:06.94323+00', '2025-11-23 14:02:18.998654+00');
INSERT INTO public.chat_messages VALUES ('704038b3-8794-4447-bf2a-5bcd655d9a61', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'oi', 'text', NULL, true, '2025-11-25 01:40:12.085083+00', '2025-11-25 01:40:30.321896+00', '2025-11-25 01:40:12.085083+00', '2025-11-25 01:40:30.321896+00');


--
-- TOC entry 4666 (class 0 OID 17482)
-- Dependencies: 379
-- Data for Name: client_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_details VALUES ('855a9cc7-2c06-4650-a8b4-8d46e8921911', 'Teste', '{"smoker": false, "alcohol": "socially", "injuries": "Coluna Torácica ", "symptoms": ["Dor nas Costas", "Fraqueza"], "allergies": "teste", "surgeries": "", "occupation": "Agente administrativo", "work_hours": "8", "medications": "Fingolimode\nPuran\nRitalina", "sleep_hours": "8", "supplements": "", "weight_goal": "", "diet_history": "", "stress_level": "medium", "water_intake": "2", "sleep_quality": "average", "activity_level": "sedentary", "family_history": "Hipertensão", "food_aversions": "teste", "last_exam_date": "", "medical_history": "teste", "work_activities": ["Sentar na cadeira", "Ficar de pé", "Dirigir", "Caminhar"], "training_experience": "", "diagnosed_conditions": ["Asma", "Problemas Oculares", "Obesidade"], "physical_restrictions": ""}', NULL, 'Teste', '2025-11-22 18:47:34.796176+00', '2025-11-25 01:11:26.438836+00');


--
-- TOC entry 4678 (class 0 OID 17708)
-- Dependencies: 391
-- Data for Name: client_meal_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_meal_plans VALUES ('cfedeb31-b3eb-4a4c-a78c-483a7ab946d6', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'abc28005-3841-4e16-a20d-77496f245e47', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22', NULL, 'active', NULL, '2025-11-22 20:19:15.097806+00', '2025-11-22 20:19:15.097806+00');


--
-- TOC entry 4667 (class 0 OID 17496)
-- Dependencies: 380
-- Data for Name: client_professionals; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_professionals VALUES ('3d856e29-db71-401f-ab3a-ac02a9332c15', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', 'active', '2025-11-17 08:34:39.404+00', NULL, NULL);


--
-- TOC entry 4671 (class 0 OID 17571)
-- Dependencies: 384
-- Data for Name: client_workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.client_workouts VALUES ('92b549b0-33a0-4f66-8d74-2e12c4900544', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '03e89f3e-8752-4333-996b-a00717743216', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22', NULL, 'active', NULL, '2025-11-22 20:19:05.028327+00', '2025-11-22 20:19:05.028327+00');


--
-- TOC entry 4668 (class 0 OID 17519)
-- Dependencies: 381
-- Data for Name: exercises_library; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.exercises_library VALUES ('b3a7592c-33bb-4255-b167-225fe69aceb5', 'Supino Inclinado', 'Concentrado com 2 segundos de contração.', '{"Peito superior e Ombros"}', '{Halteres}', 'intermediate', 'https://www.youtube.com/watch?v=WP1VLAt8hbM', NULL, NULL, NULL, 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-16 23:25:34.674338+00', '2025-11-17 03:23:39.607973+00');
INSERT INTO public.exercises_library VALUES ('b42e4102-659a-4aea-89e6-a8f0914e85a9', 'Supino Reto', 'Concentrado com 2 segundos de contração.', '{"Peito e Ombros"}', '{Halteres}', 'beginner', 'https://youtu.be/72UUJVBuT7o', NULL, NULL, NULL, 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-16 23:17:43.822207+00', '2025-11-18 04:12:56.616597+00');


--
-- TOC entry 4673 (class 0 OID 17618)
-- Dependencies: 386
-- Data for Name: foods_library; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.foods_library VALUES ('b35d98b3-82e5-4d9e-9d40-367e10437118', 'Arroz Branco', 'Tio João', 'Carboidratos', 100.00, 128.00, 2.50, 28.10, 0.20, NULL, NULL, NULL, 'f2bb6acc-835a-414c-8856-836415b23896', true, '2025-11-17 09:46:55.077513+00', '2025-11-22 00:52:24.578733+00');


--
-- TOC entry 4679 (class 0 OID 17735)
-- Dependencies: 392
-- Data for Name: meal_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4677 (class 0 OID 17684)
-- Dependencies: 390
-- Data for Name: meal_plan_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.meal_plan_items VALUES ('47faad1e-c94f-465a-9447-5a9af166f5de', 'abc28005-3841-4e16-a20d-77496f245e47', 1, 1, 'Almoço', 'b35d98b3-82e5-4d9e-9d40-367e10437118', NULL, 100.00, 'teste');


--
-- TOC entry 4676 (class 0 OID 17668)
-- Dependencies: 389
-- Data for Name: meal_plans; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.meal_plans VALUES ('abc28005-3841-4e16-a20d-77496f245e47', 'Plano de Emagrecimento e ganho de massa muscular', 'teste', 'f2bb6acc-835a-414c-8856-836415b23896', 'teste', 2000.00, 150.00, 250.00, 65.00, false, '2025-11-17 09:47:42.611172+00', '2025-11-17 09:47:42.611172+00');


--
-- TOC entry 4665 (class 0 OID 17466)
-- Dependencies: 378
-- Data for Name: professional_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.professional_details VALUES ('f2bb6acc-835a-414c-8856-836415b23896', 'personal_trainer', 'teste', '{"raw_text": "teste"}', 100.00, NULL, true, '2025-11-22 19:09:25.500172+00', '2025-11-24 11:27:25.476318+00');


--
-- TOC entry 4685 (class 0 OID 22388)
-- Dependencies: 398
-- Data for Name: professional_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.professional_notifications VALUES ('e260d9d1-0428-4aa7-85a3-0f6fdca25159', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'completed_workout', 'Notificação sobre Cliente Teste 1: completed_workout', false, '2025-11-19 14:30:44.119259+00');
INSERT INTO public.professional_notifications VALUES ('110c114d-981a-40b1-90cd-838e52b2b8a8', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'completed_workout', 'Notificação sobre Cliente Teste 1: completed_workout', false, '2025-11-19 18:12:16.995594+00');
INSERT INTO public.professional_notifications VALUES ('dbe32dac-18de-47ac-bb1c-3fc386182803', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'completed_workout', 'Notificação sobre Cliente Teste 1: completed_workout', false, '2025-11-19 20:09:17.79557+00');
INSERT INTO public.professional_notifications VALUES ('fd5f1e02-78dd-4082-b7a7-69a5507029c9', 'f2bb6acc-835a-414c-8856-836415b23896', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'completed_workout', 'Notificação sobre Cliente Teste 1: completed_workout', false, '2025-11-19 20:27:22.21576+00');


--
-- TOC entry 4664 (class 0 OID 17451)
-- Dependencies: 377
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.profiles VALUES ('855a9cc7-2c06-4650-a8b4-8d46e8921911', 'cliente1@capifit.com', 'Cliente de Teste', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/855a9cc7-2c06-4650-a8b4-8d46e8921911/avatar-1764033213765.jpg?t=1764033215677', '(17) 3236-6250', 'client', '2025-11-16 23:01:48.822703+00', '2025-11-25 01:12:46.697475+00', 308, 1);
INSERT INTO public.profiles VALUES ('c7db0656-d6ed-41f7-a1f3-b59cfc0ff2b4', 'admin@capifit.com', 'Administrador', NULL, NULL, 'admin', '2025-11-16 22:10:09.626227+00', '2025-11-17 07:16:33.067738+00', 0, 1);
INSERT INTO public.profiles VALUES ('f2bb6acc-835a-414c-8856-836415b23896', 'profissional@capifit.com', 'Giuliano Moretti Santos Garcia', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg', '(17) 98803-1873', 'professional', '2025-11-16 22:09:35.743201+00', '2025-11-24 11:27:24.812452+00', 0, 1);


--
-- TOC entry 4680 (class 0 OID 17760)
-- Dependencies: 393
-- Data for Name: progress_photos; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.progress_photos VALUES ('68a6719e-bc9f-430f-b25e-206ebc779886', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/progress-photos/855a9cc7-2c06-4650-a8b4-8d46e8921911/1763926942710.jpg', '2025-11-23', 'Frente', '2025-11-23 19:41:34.403682+00');
INSERT INTO public.progress_photos VALUES ('6446aa0e-8319-489e-9c35-a8c76d26a290', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/progress-photos/855a9cc7-2c06-4650-a8b4-8d46e8921911/1763926975302.jpg', '2025-11-23', 'Lado', '2025-11-23 19:42:09.0885+00');


--
-- TOC entry 4675 (class 0 OID 17650)
-- Dependencies: 388
-- Data for Name: recipe_ingredients; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4674 (class 0 OID 17634)
-- Dependencies: 387
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4670 (class 0 OID 17553)
-- Dependencies: 383
-- Data for Name: workout_exercises; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workout_exercises VALUES ('38c07816-4958-4c7f-b55c-ca1866b3aaa0', '03e89f3e-8752-4333-996b-a00717743216', 'b42e4102-659a-4aea-89e6-a8f0914e85a9', 1, 1, 3, '8-12', NULL, 60, NULL);
INSERT INTO public.workout_exercises VALUES ('2b634120-bebe-40c2-85d8-60d1cbf883ee', '03e89f3e-8752-4333-996b-a00717743216', 'b42e4102-659a-4aea-89e6-a8f0914e85a9', 2, 1, 3, '8-12', NULL, 60, NULL);
INSERT INTO public.workout_exercises VALUES ('973a9eb0-530d-4f82-b5a5-e969a1ee6ce7', '03e89f3e-8752-4333-996b-a00717743216', 'b42e4102-659a-4aea-89e6-a8f0914e85a9', 3, 1, 3, '8-12', NULL, 60, NULL);
INSERT INTO public.workout_exercises VALUES ('5ceb77b6-8504-4f8b-9a19-df2f26cdc227', '03e89f3e-8752-4333-996b-a00717743216', 'b3a7592c-33bb-4255-b167-225fe69aceb5', 1, 2, 3, '8-12', NULL, 60, NULL);
INSERT INTO public.workout_exercises VALUES ('15f6ed2b-bad6-47b9-ad06-c37adbdad171', '03e89f3e-8752-4333-996b-a00717743216', 'b3a7592c-33bb-4255-b167-225fe69aceb5', 2, 2, 3, '8-12', NULL, 60, NULL);
INSERT INTO public.workout_exercises VALUES ('73104888-e3a8-458b-ae2e-9dcc544babf6', '03e89f3e-8752-4333-996b-a00717743216', 'b3a7592c-33bb-4255-b167-225fe69aceb5', 3, 2, 3, '8-12', NULL, 60, NULL);


--
-- TOC entry 4672 (class 0 OID 17598)
-- Dependencies: 385
-- Data for Name: workout_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 4684 (class 0 OID 20118)
-- Dependencies: 397
-- Data for Name: workout_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workout_sessions VALUES ('dd9347d2-fb81-433a-ab96-e8d234e679eb', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', '03e89f3e-8752-4333-996b-a00717743216', '92b549b0-33a0-4f66-8d74-2e12c4900544', '2025-11-22 20:20:03.482078+00', '2025-11-22 20:25:34.587+00', 331, 'completed', '2025-11-22 20:20:03.482078+00', '2025-11-22 20:24:46.233513+00');
INSERT INTO public.workout_sessions VALUES ('c65f1571-e095-4ac5-869d-5eb03b3984d4', '855a9cc7-2c06-4650-a8b4-8d46e8921911', 'f2bb6acc-835a-414c-8856-836415b23896', '03e89f3e-8752-4333-996b-a00717743216', '92b549b0-33a0-4f66-8d74-2e12c4900544', '2025-11-23 00:47:50.122028+00', '2025-11-23 00:49:16.67+00', 87, 'completed', '2025-11-23 00:47:50.122028+00', '2025-11-23 00:49:16.817515+00');


--
-- TOC entry 4669 (class 0 OID 17536)
-- Dependencies: 382
-- Data for Name: workouts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.workouts VALUES ('03e89f3e-8752-4333-996b-a00717743216', 'Treino de Hipertrofia - 4 semanas', 'Teste de Hipertrofia', 'f2bb6acc-835a-414c-8856-836415b23896', 'Hipertrofia', 4, 3, false, '2025-11-16 23:18:18.76594+00', '2025-11-20 02:23:57.610749+00');


--
-- TOC entry 4688 (class 0 OID 22560)
-- Dependencies: 401
-- Data for Name: messages_2025_11_22; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4689 (class 0 OID 22572)
-- Dependencies: 402
-- Data for Name: messages_2025_11_23; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4690 (class 0 OID 24982)
-- Dependencies: 403
-- Data for Name: messages_2025_11_24; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4691 (class 0 OID 25020)
-- Dependencies: 404
-- Data for Name: messages_2025_11_25; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4692 (class 0 OID 26290)
-- Dependencies: 405
-- Data for Name: messages_2025_11_26; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4693 (class 0 OID 27574)
-- Dependencies: 406
-- Data for Name: messages_2025_11_27; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4694 (class 0 OID 28690)
-- Dependencies: 407
-- Data for Name: messages_2025_11_28; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--



--
-- TOC entry 4660 (class 0 OID 17225)
-- Dependencies: 369
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
-- TOC entry 4663 (class 0 OID 17289)
-- Dependencies: 373
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

INSERT INTO realtime.subscription OVERRIDING SYSTEM VALUE VALUES (1130, 'f35c6e1a-c9a7-11f0-bd12-0a58a9feac02', 'public.chat_messages', '{}', '{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1764031326}], "aud": "authenticated", "exp": 1764041865, "iat": 1764038265, "iss": "https://mhjvgxukttoalvwntmyp.supabase.co/auth/v1", "sub": "f2bb6acc-835a-414c-8856-836415b23896", "role": "authenticated", "email": "profissional@capifit.com", "phone": "", "session_id": "7a35a9cd-9dd5-45e4-9a28-261914267fe7", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"role": "professional", "phone": "(17) 98803-1873", "full_name": "Giuliano Moretti Santos Garcia", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg", "email_verified": true}}', DEFAULT, '2025-11-25 02:39:22.853644');
INSERT INTO realtime.subscription OVERRIDING SYSTEM VALUE VALUES (1131, 'fb60bb7a-c9a7-11f0-b133-0a58a9feac02', 'public.chat_messages', '{}', '{"aal": "aal1", "amr": [{"method": "password", "timestamp": 1763864888}], "aud": "authenticated", "exp": 1764039393, "iat": 1764035793, "iss": "https://mhjvgxukttoalvwntmyp.supabase.co/auth/v1", "sub": "855a9cc7-2c06-4650-a8b4-8d46e8921911", "role": "authenticated", "email": "cliente1@capifit.com", "phone": "", "session_id": "6757e519-3604-488a-bb6a-f553d9f19f47", "app_metadata": {"provider": "email", "providers": ["email"]}, "is_anonymous": false, "user_metadata": {"phone": "(17) 3236-6250", "full_name": "Cliente de Teste", "avatar_url": "https://mhjvgxukttoalvwntmyp.supabase.co/storage/v1/object/public/avatars/855a9cc7-2c06-4650-a8b4-8d46e8921911/avatar-1764033213765.jpg?t=1764033215677", "email_verified": true}}', DEFAULT, '2025-11-25 02:39:36.303483');


--
-- TOC entry 4640 (class 0 OID 16546)
-- Dependencies: 346
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.buckets VALUES ('avatars', 'avatars', NULL, '2025-11-22 18:59:27.769694+00', '2025-11-22 18:59:27.769694+00', true, false, NULL, NULL, NULL, 'STANDARD');
INSERT INTO storage.buckets VALUES ('chat-attachments', 'chat-attachments', NULL, '2025-11-23 02:53:29.23728+00', '2025-11-23 02:53:29.23728+00', true, false, NULL, NULL, NULL, 'STANDARD');
INSERT INTO storage.buckets VALUES ('progress-photos', 'progress-photos', NULL, '2025-11-23 17:36:52.698866+00', '2025-11-23 17:36:52.698866+00', true, false, NULL, NULL, NULL, 'STANDARD');


--
-- TOC entry 4661 (class 0 OID 17246)
-- Dependencies: 370
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4686 (class 0 OID 22419)
-- Dependencies: 399
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4642 (class 0 OID 16588)
-- Dependencies: 348
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
-- TOC entry 4641 (class 0 OID 16561)
-- Dependencies: 347
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.objects VALUES ('1bfa62b7-5e7a-4757-a048-3763ad3b59db', 'avatars', 'f2bb6acc-835a-414c-8856-836415b23896/whatsapp-image-2024-06-23-at-21-13-13-1763838171965.jpeg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22 19:02:03.48467+00', '2025-11-22 19:02:03.48467+00', '2025-11-22 19:02:03.48467+00', '{"eTag": "\"eabb8260c34dafc13703e3f50551a749\"", "size": 62233, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:02:04.000Z", "contentLength": 62233, "httpStatusCode": 200}', DEFAULT, 'bbf1c16a-401e-47fa-b01c-ed14f4327a98', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('8a22d96f-d00a-46d6-98af-16e07699f666', 'avatars', 'f2bb6acc-835a-414c-8856-836415b23896/whatsapp-image-2024-06-23-at-21-13-13-1763838584583.jpeg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22 19:08:56.052624+00', '2025-11-22 19:08:56.052624+00', '2025-11-22 19:08:56.052624+00', '{"eTag": "\"eabb8260c34dafc13703e3f50551a749\"", "size": 62233, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:08:56.000Z", "contentLength": 62233, "httpStatusCode": 200}', DEFAULT, '232a7a1f-ad9f-4422-87af-3561532942d7', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('7e3dd404-e64e-48ba-ab2b-0ca8995ac76c', 'avatars', '855a9cc7-2c06-4650-a8b4-8d46e8921911/pexels-monstera-7114626-1763839252929.jpg', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-22 19:20:04.463884+00', '2025-11-22 19:20:04.463884+00', '2025-11-22 19:20:04.463884+00', '{"eTag": "\"d4eb1e0c26348b17203f17585dd73527\"", "size": 61522, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:20:05.000Z", "contentLength": 61522, "httpStatusCode": 200}', DEFAULT, 'b396a620-ffb9-4204-941b-f305bf572bf8', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '{}', 2);
INSERT INTO storage.objects VALUES ('589c20d1-facc-4a1c-bb8a-bb8a5cbe4122', 'avatars', 'f2bb6acc-835a-414c-8856-836415b23896/whatsapp-image-2024-06-23-at-21-13-13-1763839292539.jpeg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22 19:20:44.001008+00', '2025-11-22 19:20:44.001008+00', '2025-11-22 19:20:44.001008+00', '{"eTag": "\"eabb8260c34dafc13703e3f50551a749\"", "size": 62233, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:20:44.000Z", "contentLength": 62233, "httpStatusCode": 200}', DEFAULT, '283bd1ae-2a89-49e8-9da9-37a44e58c483', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('df10326f-f884-4e21-af56-0c6547d721cf', 'avatars', 'f2bb6acc-835a-414c-8856-836415b23896/avatar-1763839953050.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-22 19:31:44.95827+00', '2025-11-22 19:31:44.95827+00', '2025-11-22 19:31:44.95827+00', '{"eTag": "\"b50bde7d77a4189c68a03d590738b5e3\"", "size": 385313, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:31:45.000Z", "contentLength": 385313, "httpStatusCode": 200}', DEFAULT, 'bf16cb61-9942-467b-b13e-1b3e56cc3648', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('f8828f18-44b1-463d-9d99-4230b819de17', 'avatars', '855a9cc7-2c06-4650-a8b4-8d46e8921911/avatar-1763839984751.jpg', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-22 19:32:17.221811+00', '2025-11-22 19:32:17.221811+00', '2025-11-22 19:32:17.221811+00', '{"eTag": "\"066832fd3283bd4851d0c6a0164242d1\"", "size": 3355024, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-22T19:32:17.000Z", "contentLength": 3355024, "httpStatusCode": 200}', DEFAULT, '206fcce6-e6ba-45aa-8b09-3a9f595dcaec', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '{}', 2);
INSERT INTO storage.objects VALUES ('d1ccdc38-c7bf-4903-9e01-4d8d9e8be1a3', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/1763866596076.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 02:55:48.410421+00', '2025-11-23 02:55:48.410421+00', '2025-11-23 02:55:48.410421+00', '{"eTag": "\"5d1fe0dca40e8e9a68313b6cf0d26c94\"", "size": 684287, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T02:55:49.000Z", "contentLength": 684287, "httpStatusCode": 200}', DEFAULT, '3a0503a6-6c0b-4c3c-94f2-32e27e7ecd52', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('99d3141b-e684-418f-9baa-b0615cbbb413', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/1763866616566.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 02:56:07.783058+00', '2025-11-23 02:56:07.783058+00', '2025-11-23 02:56:07.783058+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T02:56:08.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, '6b554308-39d0-420a-819d-765779582317', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('778bfd58-8295-486b-a47a-d64ea19464ed', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/1763866654309.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 02:56:45.617209+00', '2025-11-23 02:56:45.617209+00', '2025-11-23 02:56:45.617209+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T02:56:46.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, 'de16beee-ab52-4b2f-9314-c6a9c2db3e56', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('2a6653e4-371a-4be2-885d-5a8b69386cc2', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/1763866672189.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 02:57:04.351697+00', '2025-11-23 02:57:04.351697+00', '2025-11-23 02:57:04.351697+00', '{"eTag": "\"71d195a5f444a683a8b338c1ef377e75\"", "size": 125839, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T02:57:05.000Z", "contentLength": 125839, "httpStatusCode": 200}', DEFAULT, 'da29116f-f25b-4683-842d-e36653d04868', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('3691d730-4574-482d-aca7-c201ab085835', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/1763867007474.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 03:02:38.935754+00', '2025-11-23 03:02:38.935754+00', '2025-11-23 03:02:38.935754+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:02:39.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, '71c8b272-c1fd-4bdc-9d83-026cb2d8b13f', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('784faf53-0a45-40fc-8d62-41c5c4d47c2e', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/1763867104748.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 03:04:16.31431+00', '2025-11-23 03:04:16.31431+00', '2025-11-23 03:04:16.31431+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:04:17.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, 'd6fbe2d1-0235-48cf-b706-31260144c26e', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('c91087e8-6f26-462a-af76-6883ba370b0a', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/e000cebb-9ebf-4d19-b283-c4374474fd9f-1763867321818.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 03:07:53.366636+00', '2025-11-23 03:07:53.366636+00', '2025-11-23 03:07:53.366636+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:07:54.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, 'acd27abe-bc27-40b2-b35e-0b07d8d13a31', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('9154ae50-ce4d-4345-bf74-f867346f8ebe', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/5c01ec04-cbbd-4caf-b094-1f7b3d4b4cc9-1763867362286.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 03:08:33.652393+00', '2025-11-23 03:08:33.652393+00', '2025-11-23 03:08:33.652393+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:08:34.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, '50b17db9-e70a-4df5-9eeb-29abded86c57', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('0c2c6234-7e99-4250-90e6-5d5b58bad172', 'chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896/47320864-f8ef-46ae-91c8-1ee8493bdac4.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 03:14:02.944852+00', '2025-11-23 03:14:02.944852+00', '2025-11-23 03:14:02.944852+00', '{"eTag": "\"d15680342363eda273c2e17cacd86d9f\"", "size": 89303, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:14:03.000Z", "contentLength": 89303, "httpStatusCode": 200}', DEFAULT, 'e56c4934-a36a-475e-b790-8bdac0559445', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('5699ebc4-b213-41ea-bde8-65f9dbed41ac', 'chat-attachments', '855a9cc7-2c06-4650-a8b4-8d46e8921911/ed4bbbd4-2f72-4102-8999-c59e694b1c5c.png', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-23 03:14:44.216515+00', '2025-11-23 03:14:44.216515+00', '2025-11-23 03:14:44.216515+00', '{"eTag": "\"a8e8e9363d00c607374b124b36196475-2\"", "size": 5419734, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:14:44.000Z", "contentLength": 5419734, "httpStatusCode": 200}', DEFAULT, '9a37d2e4-d2d0-4071-9177-137d5f01c01c', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '{}', 2);
INSERT INTO storage.objects VALUES ('82df2a66-a9fd-4fc3-b0ea-9299a04f999c', 'chat-attachments', '855a9cc7-2c06-4650-a8b4-8d46e8921911/e1a0ac6d-ceb3-46f7-bc0f-7d2f92327ed9.pdf', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-23 03:21:42.024144+00', '2025-11-23 03:21:42.024144+00', '2025-11-23 03:21:42.024144+00', '{"eTag": "\"ea5c7989cd0e23e058a36050b39d3916\"", "size": 206627, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T03:21:42.000Z", "contentLength": 206627, "httpStatusCode": 200}', DEFAULT, 'e6687598-a9b5-4f6e-8e1c-3eb183ce0b87', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '{}', 2);
INSERT INTO storage.objects VALUES ('562fe729-3c2b-45c5-a1ae-9ba1f6f1d0f7', 'progress-photos', '855a9cc7-2c06-4650-a8b4-8d46e8921911/1763926942710.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 19:41:33.929638+00', '2025-11-23 19:41:33.929638+00', '2025-11-23 19:41:33.929638+00', '{"eTag": "\"71d195a5f444a683a8b338c1ef377e75\"", "size": 125839, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T19:41:34.000Z", "contentLength": 125839, "httpStatusCode": 200}', DEFAULT, 'd1b24799-9a7d-4f91-b6a1-260e9440645c', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('cc926f47-d45a-4f95-8ff4-8336fc29ad54', 'progress-photos', '855a9cc7-2c06-4650-a8b4-8d46e8921911/1763926975302.jpg', 'f2bb6acc-835a-414c-8856-836415b23896', '2025-11-23 19:42:08.36942+00', '2025-11-23 19:42:08.36942+00', '2025-11-23 19:42:08.36942+00', '{"eTag": "\"0951650c87d4a74a7828563c433c95e2\"", "size": 2415518, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-23T19:42:09.000Z", "contentLength": 2415518, "httpStatusCode": 200}', DEFAULT, '924644b4-1c7d-441b-b5f0-bedfd78d31ea', 'f2bb6acc-835a-414c-8856-836415b23896', '{}', 2);
INSERT INTO storage.objects VALUES ('dd442ff9-fa09-45d2-8dca-f303060143de', 'avatars', '855a9cc7-2c06-4650-a8b4-8d46e8921911/avatar-1764033213765.jpg', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '2025-11-25 01:12:46.029563+00', '2025-11-25 01:12:46.029563+00', '2025-11-25 01:12:46.029563+00', '{"eTag": "\"1b28decba07dfae3af224285cd367566\"", "size": 571765, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-11-25T01:12:46.000Z", "contentLength": 571765, "httpStatusCode": 200}', DEFAULT, '8dc8624e-1c40-41da-bd82-e4f60a1b4dc4', '855a9cc7-2c06-4650-a8b4-8d46e8921911', '{}', 2);


--
-- TOC entry 4659 (class 0 OID 17197)
-- Dependencies: 368
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO storage.prefixes VALUES ('avatars', 'f2bb6acc-835a-414c-8856-836415b23896', DEFAULT, '2025-11-22 19:02:03.48467+00', '2025-11-22 19:02:03.48467+00');
INSERT INTO storage.prefixes VALUES ('avatars', '855a9cc7-2c06-4650-a8b4-8d46e8921911', DEFAULT, '2025-11-22 19:20:04.463884+00', '2025-11-22 19:20:04.463884+00');
INSERT INTO storage.prefixes VALUES ('chat-attachments', 'f2bb6acc-835a-414c-8856-836415b23896', DEFAULT, '2025-11-23 02:55:48.410421+00', '2025-11-23 02:55:48.410421+00');
INSERT INTO storage.prefixes VALUES ('chat-attachments', '855a9cc7-2c06-4650-a8b4-8d46e8921911', DEFAULT, '2025-11-23 03:14:44.216515+00', '2025-11-23 03:14:44.216515+00');
INSERT INTO storage.prefixes VALUES ('progress-photos', '855a9cc7-2c06-4650-a8b4-8d46e8921911', DEFAULT, '2025-11-23 19:41:33.929638+00', '2025-11-23 19:41:33.929638+00');


--
-- TOC entry 4657 (class 0 OID 17144)
-- Dependencies: 366
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4658 (class 0 OID 17158)
-- Dependencies: 367
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 4687 (class 0 OID 22429)
-- Dependencies: 400
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- TOC entry 3792 (class 0 OID 16658)
-- Dependencies: 349
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- TOC entry 4904 (class 0 OID 0)
-- Dependencies: 341
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 493, true);


--
-- TOC entry 4905 (class 0 OID 0)
-- Dependencies: 372
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1131, true);


--
-- TOC entry 4068 (class 2606 OID 16829)
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- TOC entry 4022 (class 2606 OID 16531)
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- TOC entry 4091 (class 2606 OID 16935)
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- TOC entry 4046 (class 2606 OID 16953)
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- TOC entry 4048 (class 2606 OID 16963)
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- TOC entry 4020 (class 2606 OID 16524)
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- TOC entry 4070 (class 2606 OID 16822)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- TOC entry 4066 (class 2606 OID 16810)
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- TOC entry 4058 (class 2606 OID 17003)
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- TOC entry 4060 (class 2606 OID 16797)
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- TOC entry 4104 (class 2606 OID 17062)
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- TOC entry 4106 (class 2606 OID 17060)
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- TOC entry 4108 (class 2606 OID 17058)
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- TOC entry 4101 (class 2606 OID 17022)
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- TOC entry 4112 (class 2606 OID 17084)
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- TOC entry 4114 (class 2606 OID 17086)
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- TOC entry 4095 (class 2606 OID 16988)
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4014 (class 2606 OID 16514)
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- TOC entry 4017 (class 2606 OID 16740)
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- TOC entry 4080 (class 2606 OID 16869)
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- TOC entry 4082 (class 2606 OID 16867)
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4087 (class 2606 OID 16883)
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- TOC entry 4025 (class 2606 OID 16537)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4053 (class 2606 OID 16761)
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4077 (class 2606 OID 16850)
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- TOC entry 4072 (class 2606 OID 16841)
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- TOC entry 4007 (class 2606 OID 16923)
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- TOC entry 4009 (class 2606 OID 16501)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4191 (class 2606 OID 17802)
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- TOC entry 4186 (class 2606 OID 17784)
-- Name: biometric_data biometric_data_client_id_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_data
    ADD CONSTRAINT biometric_data_client_id_date_key UNIQUE (client_id, date);


--
-- TOC entry 4188 (class 2606 OID 17782)
-- Name: biometric_data biometric_data_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_data
    ADD CONSTRAINT biometric_data_pkey PRIMARY KEY (id);


--
-- TOC entry 4195 (class 2606 OID 17824)
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- TOC entry 4142 (class 2606 OID 17490)
-- Name: client_details client_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_details
    ADD CONSTRAINT client_details_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 4176 (class 2606 OID 17719)
-- Name: client_meal_plans client_meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT client_meal_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4144 (class 2606 OID 17508)
-- Name: client_professionals client_professionals_client_id_professional_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT client_professionals_client_id_professional_id_key UNIQUE (client_id, professional_id);


--
-- TOC entry 4146 (class 2606 OID 17506)
-- Name: client_professionals client_professionals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT client_professionals_pkey PRIMARY KEY (id);


--
-- TOC entry 4158 (class 2606 OID 17582)
-- Name: client_workouts client_workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT client_workouts_pkey PRIMARY KEY (id);


--
-- TOC entry 4150 (class 2606 OID 17530)
-- Name: exercises_library exercises_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises_library
    ADD CONSTRAINT exercises_library_pkey PRIMARY KEY (id);


--
-- TOC entry 4164 (class 2606 OID 17628)
-- Name: foods_library foods_library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods_library
    ADD CONSTRAINT foods_library_pkey PRIMARY KEY (id);


--
-- TOC entry 4181 (class 2606 OID 17744)
-- Name: meal_logs meal_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT meal_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4174 (class 2606 OID 17692)
-- Name: meal_plan_items meal_plan_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT meal_plan_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4171 (class 2606 OID 17678)
-- Name: meal_plans meal_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT meal_plans_pkey PRIMARY KEY (id);


--
-- TOC entry 4140 (class 2606 OID 17476)
-- Name: professional_details professional_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_details
    ADD CONSTRAINT professional_details_pkey PRIMARY KEY (profile_id);


--
-- TOC entry 4208 (class 2606 OID 22397)
-- Name: professional_notifications professional_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_notifications
    ADD CONSTRAINT professional_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4138 (class 2606 OID 17460)
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4184 (class 2606 OID 17768)
-- Name: progress_photos progress_photos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_photos
    ADD CONSTRAINT progress_photos_pkey PRIMARY KEY (id);


--
-- TOC entry 4168 (class 2606 OID 17657)
-- Name: recipe_ingredients recipe_ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT recipe_ingredients_pkey PRIMARY KEY (id);


--
-- TOC entry 4166 (class 2606 OID 17644)
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- TOC entry 4156 (class 2606 OID 17560)
-- Name: workout_exercises workout_exercises_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT workout_exercises_pkey PRIMARY KEY (id);


--
-- TOC entry 4162 (class 2606 OID 17607)
-- Name: workout_logs workout_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT workout_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4202 (class 2606 OID 20130)
-- Name: workout_sessions workout_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_pkey PRIMARY KEY (id);


--
-- TOC entry 4153 (class 2606 OID 17547)
-- Name: workouts workouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);


--
-- TOC entry 4135 (class 2606 OID 17448)
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4216 (class 2606 OID 22568)
-- Name: messages_2025_11_22 messages_2025_11_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_22
    ADD CONSTRAINT messages_2025_11_22_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4219 (class 2606 OID 22580)
-- Name: messages_2025_11_23 messages_2025_11_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_23
    ADD CONSTRAINT messages_2025_11_23_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4222 (class 2606 OID 24990)
-- Name: messages_2025_11_24 messages_2025_11_24_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_24
    ADD CONSTRAINT messages_2025_11_24_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4225 (class 2606 OID 25028)
-- Name: messages_2025_11_25 messages_2025_11_25_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_25
    ADD CONSTRAINT messages_2025_11_25_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4228 (class 2606 OID 26298)
-- Name: messages_2025_11_26 messages_2025_11_26_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_26
    ADD CONSTRAINT messages_2025_11_26_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4231 (class 2606 OID 27582)
-- Name: messages_2025_11_27 messages_2025_11_27_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_27
    ADD CONSTRAINT messages_2025_11_27_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4234 (class 2606 OID 28698)
-- Name: messages_2025_11_28 messages_2025_11_28_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_28
    ADD CONSTRAINT messages_2025_11_28_pkey PRIMARY KEY (id, inserted_at);


--
-- TOC entry 4131 (class 2606 OID 17297)
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- TOC entry 4125 (class 2606 OID 17229)
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- TOC entry 4127 (class 2606 OID 22452)
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- TOC entry 4028 (class 2606 OID 16554)
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- TOC entry 4210 (class 2606 OID 22428)
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- TOC entry 4038 (class 2606 OID 16595)
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- TOC entry 4040 (class 2606 OID 16593)
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 4036 (class 2606 OID 16571)
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- TOC entry 4123 (class 2606 OID 17206)
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- TOC entry 4120 (class 2606 OID 17167)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- TOC entry 4118 (class 2606 OID 17152)
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- TOC entry 4213 (class 2606 OID 22438)
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- TOC entry 4023 (class 1259 OID 16532)
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- TOC entry 3997 (class 1259 OID 16750)
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3998 (class 1259 OID 16752)
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 3999 (class 1259 OID 16753)
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4056 (class 1259 OID 16831)
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- TOC entry 4089 (class 1259 OID 16939)
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- TOC entry 4044 (class 1259 OID 16919)
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- TOC entry 4906 (class 0 OID 0)
-- Dependencies: 4044
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- TOC entry 4049 (class 1259 OID 16747)
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- TOC entry 4092 (class 1259 OID 16936)
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- TOC entry 4093 (class 1259 OID 16937)
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- TOC entry 4064 (class 1259 OID 16942)
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- TOC entry 4061 (class 1259 OID 16803)
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- TOC entry 4062 (class 1259 OID 16948)
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- TOC entry 4102 (class 1259 OID 17073)
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- TOC entry 4099 (class 1259 OID 17026)
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- TOC entry 4109 (class 1259 OID 17099)
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4110 (class 1259 OID 17097)
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- TOC entry 4115 (class 1259 OID 17098)
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- TOC entry 4096 (class 1259 OID 16995)
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- TOC entry 4097 (class 1259 OID 16994)
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- TOC entry 4098 (class 1259 OID 16996)
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- TOC entry 4000 (class 1259 OID 16754)
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4001 (class 1259 OID 16751)
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- TOC entry 4010 (class 1259 OID 16515)
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- TOC entry 4011 (class 1259 OID 16516)
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- TOC entry 4012 (class 1259 OID 16746)
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- TOC entry 4015 (class 1259 OID 16833)
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- TOC entry 4018 (class 1259 OID 16938)
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- TOC entry 4083 (class 1259 OID 16875)
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- TOC entry 4084 (class 1259 OID 16940)
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- TOC entry 4085 (class 1259 OID 16890)
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- TOC entry 4088 (class 1259 OID 16889)
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- TOC entry 4050 (class 1259 OID 16941)
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- TOC entry 4051 (class 1259 OID 17111)
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- TOC entry 4054 (class 1259 OID 16832)
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- TOC entry 4075 (class 1259 OID 16857)
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- TOC entry 4078 (class 1259 OID 16856)
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- TOC entry 4073 (class 1259 OID 16842)
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- TOC entry 4074 (class 1259 OID 17004)
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- TOC entry 4063 (class 1259 OID 17001)
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- TOC entry 4055 (class 1259 OID 16830)
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- TOC entry 4002 (class 1259 OID 16910)
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- TOC entry 4907 (class 0 OID 0)
-- Dependencies: 4002
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- TOC entry 4003 (class 1259 OID 16748)
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- TOC entry 4004 (class 1259 OID 16505)
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- TOC entry 4005 (class 1259 OID 16965)
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- TOC entry 4192 (class 1259 OID 17850)
-- Name: idx_appointments_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_client ON public.appointments USING btree (client_id);


--
-- TOC entry 4193 (class 1259 OID 17849)
-- Name: idx_appointments_professional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_appointments_professional ON public.appointments USING btree (professional_id);


--
-- TOC entry 4189 (class 1259 OID 17848)
-- Name: idx_biometric_data_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_biometric_data_client ON public.biometric_data USING btree (client_id);


--
-- TOC entry 4196 (class 1259 OID 17852)
-- Name: idx_chat_messages_receiver; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_receiver ON public.chat_messages USING btree (receiver_id);


--
-- TOC entry 4197 (class 1259 OID 17851)
-- Name: idx_chat_messages_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_chat_messages_sender ON public.chat_messages USING btree (sender_id);


--
-- TOC entry 4177 (class 1259 OID 17844)
-- Name: idx_client_meal_plans_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_meal_plans_client ON public.client_meal_plans USING btree (client_id);


--
-- TOC entry 4147 (class 1259 OID 17836)
-- Name: idx_client_professionals_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_professionals_client ON public.client_professionals USING btree (client_id);


--
-- TOC entry 4148 (class 1259 OID 17837)
-- Name: idx_client_professionals_professional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_professionals_professional ON public.client_professionals USING btree (professional_id);


--
-- TOC entry 4159 (class 1259 OID 17840)
-- Name: idx_client_workouts_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_client_workouts_client ON public.client_workouts USING btree (client_id);


--
-- TOC entry 4178 (class 1259 OID 17845)
-- Name: idx_meal_logs_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_logs_client ON public.meal_logs USING btree (client_id);


--
-- TOC entry 4179 (class 1259 OID 17846)
-- Name: idx_meal_logs_logged_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_logs_logged_at ON public.meal_logs USING btree (logged_at);


--
-- TOC entry 4172 (class 1259 OID 17843)
-- Name: idx_meal_plan_items_plan; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_plan_items_plan ON public.meal_plan_items USING btree (meal_plan_id);


--
-- TOC entry 4169 (class 1259 OID 17842)
-- Name: idx_meal_plans_nutritionist; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_meal_plans_nutritionist ON public.meal_plans USING btree (nutritionist_id);


--
-- TOC entry 4203 (class 1259 OID 22413)
-- Name: idx_professional_notifications_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_client_id ON public.professional_notifications USING btree (client_id);


--
-- TOC entry 4204 (class 1259 OID 22414)
-- Name: idx_professional_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_created_at ON public.professional_notifications USING btree (created_at DESC);


--
-- TOC entry 4205 (class 1259 OID 22412)
-- Name: idx_professional_notifications_professional_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_professional_id ON public.professional_notifications USING btree (professional_id);


--
-- TOC entry 4206 (class 1259 OID 22415)
-- Name: idx_professional_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_professional_notifications_read ON public.professional_notifications USING btree (read);


--
-- TOC entry 4136 (class 1259 OID 17835)
-- Name: idx_profiles_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_profiles_role ON public.profiles USING btree (role);


--
-- TOC entry 4182 (class 1259 OID 17847)
-- Name: idx_progress_photos_client; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_progress_photos_client ON public.progress_photos USING btree (client_id);


--
-- TOC entry 4154 (class 1259 OID 17839)
-- Name: idx_workout_exercises_workout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_exercises_workout ON public.workout_exercises USING btree (workout_id);


--
-- TOC entry 4160 (class 1259 OID 17841)
-- Name: idx_workout_logs_client_workout; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_logs_client_workout ON public.workout_logs USING btree (client_workout_id);


--
-- TOC entry 4198 (class 1259 OID 20151)
-- Name: idx_workout_sessions_client_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_client_id ON public.workout_sessions USING btree (client_id);


--
-- TOC entry 4199 (class 1259 OID 20153)
-- Name: idx_workout_sessions_client_workout_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_client_workout_id ON public.workout_sessions USING btree (client_workout_id);


--
-- TOC entry 4200 (class 1259 OID 20152)
-- Name: idx_workout_sessions_professional_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workout_sessions_professional_id ON public.workout_sessions USING btree (professional_id);


--
-- TOC entry 4151 (class 1259 OID 17838)
-- Name: idx_workouts_professional; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_workouts_professional ON public.workouts USING btree (professional_id);


--
-- TOC entry 4129 (class 1259 OID 17449)
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- TOC entry 4133 (class 1259 OID 17450)
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4214 (class 1259 OID 22569)
-- Name: messages_2025_11_22_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_22_inserted_at_topic_idx ON realtime.messages_2025_11_22 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4217 (class 1259 OID 22581)
-- Name: messages_2025_11_23_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_23_inserted_at_topic_idx ON realtime.messages_2025_11_23 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4220 (class 1259 OID 24991)
-- Name: messages_2025_11_24_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_24_inserted_at_topic_idx ON realtime.messages_2025_11_24 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4223 (class 1259 OID 25029)
-- Name: messages_2025_11_25_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_25_inserted_at_topic_idx ON realtime.messages_2025_11_25 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4226 (class 1259 OID 26299)
-- Name: messages_2025_11_26_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_26_inserted_at_topic_idx ON realtime.messages_2025_11_26 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4229 (class 1259 OID 27583)
-- Name: messages_2025_11_27_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_27_inserted_at_topic_idx ON realtime.messages_2025_11_27 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4232 (class 1259 OID 28699)
-- Name: messages_2025_11_28_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_28_inserted_at_topic_idx ON realtime.messages_2025_11_28 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- TOC entry 4132 (class 1259 OID 17350)
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- TOC entry 4026 (class 1259 OID 16560)
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- TOC entry 4029 (class 1259 OID 16582)
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- TOC entry 4128 (class 1259 OID 22453)
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- TOC entry 4116 (class 1259 OID 17178)
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- TOC entry 4030 (class 1259 OID 17224)
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- TOC entry 4031 (class 1259 OID 17143)
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- TOC entry 4032 (class 1259 OID 17231)
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- TOC entry 4121 (class 1259 OID 17232)
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- TOC entry 4033 (class 1259 OID 16583)
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- TOC entry 4034 (class 1259 OID 17230)
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- TOC entry 4211 (class 1259 OID 22444)
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- TOC entry 4235 (class 0 OID 0)
-- Name: messages_2025_11_22_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_22_inserted_at_topic_idx;


--
-- TOC entry 4236 (class 0 OID 0)
-- Name: messages_2025_11_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_22_pkey;


--
-- TOC entry 4237 (class 0 OID 0)
-- Name: messages_2025_11_23_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_23_inserted_at_topic_idx;


--
-- TOC entry 4238 (class 0 OID 0)
-- Name: messages_2025_11_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_23_pkey;


--
-- TOC entry 4239 (class 0 OID 0)
-- Name: messages_2025_11_24_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_24_inserted_at_topic_idx;


--
-- TOC entry 4240 (class 0 OID 0)
-- Name: messages_2025_11_24_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_24_pkey;


--
-- TOC entry 4241 (class 0 OID 0)
-- Name: messages_2025_11_25_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_25_inserted_at_topic_idx;


--
-- TOC entry 4242 (class 0 OID 0)
-- Name: messages_2025_11_25_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_25_pkey;


--
-- TOC entry 4243 (class 0 OID 0)
-- Name: messages_2025_11_26_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_26_inserted_at_topic_idx;


--
-- TOC entry 4244 (class 0 OID 0)
-- Name: messages_2025_11_26_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_26_pkey;


--
-- TOC entry 4245 (class 0 OID 0)
-- Name: messages_2025_11_27_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_27_inserted_at_topic_idx;


--
-- TOC entry 4246 (class 0 OID 0)
-- Name: messages_2025_11_27_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_27_pkey;


--
-- TOC entry 4247 (class 0 OID 0)
-- Name: messages_2025_11_28_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_28_inserted_at_topic_idx;


--
-- TOC entry 4248 (class 0 OID 0)
-- Name: messages_2025_11_28_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_28_pkey;


--
-- TOC entry 4311 (class 2620 OID 18128)
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: supabase_auth_admin
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- TOC entry 4331 (class 2620 OID 20160)
-- Name: workout_sessions calculate_workout_session_duration; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER calculate_workout_session_duration BEFORE UPDATE ON public.workout_sessions FOR EACH ROW WHEN (((new.ended_at IS NOT NULL) AND (old.ended_at IS NULL))) EXECUTE FUNCTION public.calculate_session_duration();


--
-- TOC entry 4330 (class 2620 OID 17862)
-- Name: appointments handle_appointments_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4322 (class 2620 OID 17856)
-- Name: client_details handle_client_details_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_client_details_updated_at BEFORE UPDATE ON public.client_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4329 (class 2620 OID 17864)
-- Name: client_meal_plans handle_client_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_client_meal_plans_updated_at BEFORE UPDATE ON public.client_meal_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4325 (class 2620 OID 17863)
-- Name: client_workouts handle_client_workouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_client_workouts_updated_at BEFORE UPDATE ON public.client_workouts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4323 (class 2620 OID 17857)
-- Name: exercises_library handle_exercises_library_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_exercises_library_updated_at BEFORE UPDATE ON public.exercises_library FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4326 (class 2620 OID 17861)
-- Name: foods_library handle_foods_library_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_foods_library_updated_at BEFORE UPDATE ON public.foods_library FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4328 (class 2620 OID 17859)
-- Name: meal_plans handle_meal_plans_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_meal_plans_updated_at BEFORE UPDATE ON public.meal_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4333 (class 2620 OID 22417)
-- Name: professional_notifications handle_notifications_created_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_notifications_created_at BEFORE INSERT ON public.professional_notifications FOR EACH ROW EXECUTE FUNCTION public.handle_notifications_updated_at();


--
-- TOC entry 4321 (class 2620 OID 17855)
-- Name: professional_details handle_professional_details_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_professional_details_updated_at BEFORE UPDATE ON public.professional_details FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4320 (class 2620 OID 17854)
-- Name: profiles handle_profiles_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4327 (class 2620 OID 17860)
-- Name: recipes handle_recipes_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_recipes_updated_at BEFORE UPDATE ON public.recipes FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4332 (class 2620 OID 20154)
-- Name: workout_sessions handle_workout_sessions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_workout_sessions_updated_at BEFORE UPDATE ON public.workout_sessions FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4324 (class 2620 OID 17858)
-- Name: workouts handle_workouts_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER handle_workouts_updated_at BEFORE UPDATE ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


--
-- TOC entry 4319 (class 2620 OID 17302)
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- TOC entry 4312 (class 2620 OID 17239)
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- TOC entry 4313 (class 2620 OID 17269)
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4314 (class 2620 OID 17220)
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- TOC entry 4315 (class 2620 OID 17268)
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- TOC entry 4317 (class 2620 OID 17235)
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- TOC entry 4318 (class 2620 OID 17270)
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- TOC entry 4316 (class 2620 OID 17131)
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- TOC entry 4251 (class 2606 OID 16734)
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4256 (class 2606 OID 16823)
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4255 (class 2606 OID 16811)
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- TOC entry 4254 (class 2606 OID 16798)
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4262 (class 2606 OID 17063)
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4263 (class 2606 OID 17068)
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4264 (class 2606 OID 17092)
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4265 (class 2606 OID 17087)
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4261 (class 2606 OID 16989)
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4249 (class 2606 OID 16767)
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- TOC entry 4258 (class 2606 OID 16870)
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4259 (class 2606 OID 16943)
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- TOC entry 4260 (class 2606 OID 16884)
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4252 (class 2606 OID 17106)
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- TOC entry 4253 (class 2606 OID 16762)
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4257 (class 2606 OID 16851)
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- TOC entry 4300 (class 2606 OID 17808)
-- Name: appointments fk_appointment_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4301 (class 2606 OID 17803)
-- Name: appointments fk_appointment_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT fk_appointment_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4299 (class 2606 OID 17785)
-- Name: biometric_data fk_biometric_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.biometric_data
    ADD CONSTRAINT fk_biometric_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4302 (class 2606 OID 17830)
-- Name: chat_messages fk_chat_receiver; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4303 (class 2606 OID 17825)
-- Name: chat_messages fk_chat_sender; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4273 (class 2606 OID 17509)
-- Name: client_professionals fk_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4292 (class 2606 OID 17720)
-- Name: client_meal_plans fk_client_meal_plan_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT fk_client_meal_plan_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4293 (class 2606 OID 17730)
-- Name: client_meal_plans fk_client_meal_plan_nutritionist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT fk_client_meal_plan_nutritionist FOREIGN KEY (nutritionist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4294 (class 2606 OID 17725)
-- Name: client_meal_plans fk_client_meal_plan_plan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_meal_plans
    ADD CONSTRAINT fk_client_meal_plan_plan FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;


--
-- TOC entry 4272 (class 2606 OID 17491)
-- Name: client_details fk_client_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_details
    ADD CONSTRAINT fk_client_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4279 (class 2606 OID 17583)
-- Name: client_workouts fk_client_workout_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT fk_client_workout_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4280 (class 2606 OID 17593)
-- Name: client_workouts fk_client_workout_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT fk_client_workout_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4281 (class 2606 OID 17588)
-- Name: client_workouts fk_client_workout_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_workouts
    ADD CONSTRAINT fk_client_workout_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4275 (class 2606 OID 17531)
-- Name: exercises_library fk_exercise_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.exercises_library
    ADD CONSTRAINT fk_exercise_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4284 (class 2606 OID 17629)
-- Name: foods_library fk_food_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.foods_library
    ADD CONSTRAINT fk_food_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4289 (class 2606 OID 17698)
-- Name: meal_plan_items fk_meal_item_food; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT fk_meal_item_food FOREIGN KEY (food_id) REFERENCES public.foods_library(id) ON DELETE SET NULL;


--
-- TOC entry 4290 (class 2606 OID 17693)
-- Name: meal_plan_items fk_meal_item_plan; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT fk_meal_item_plan FOREIGN KEY (meal_plan_id) REFERENCES public.meal_plans(id) ON DELETE CASCADE;


--
-- TOC entry 4291 (class 2606 OID 17703)
-- Name: meal_plan_items fk_meal_item_recipe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plan_items
    ADD CONSTRAINT fk_meal_item_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- TOC entry 4295 (class 2606 OID 17745)
-- Name: meal_logs fk_meal_log_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT fk_meal_log_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4296 (class 2606 OID 17750)
-- Name: meal_logs fk_meal_log_food; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT fk_meal_log_food FOREIGN KEY (food_id) REFERENCES public.foods_library(id) ON DELETE SET NULL;


--
-- TOC entry 4297 (class 2606 OID 17755)
-- Name: meal_logs fk_meal_log_recipe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_logs
    ADD CONSTRAINT fk_meal_log_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE SET NULL;


--
-- TOC entry 4288 (class 2606 OID 17679)
-- Name: meal_plans fk_meal_plan_nutritionist; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.meal_plans
    ADD CONSTRAINT fk_meal_plan_nutritionist FOREIGN KEY (nutritionist_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4274 (class 2606 OID 17514)
-- Name: client_professionals fk_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.client_professionals
    ADD CONSTRAINT fk_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4271 (class 2606 OID 17477)
-- Name: professional_details fk_professional_profile; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_details
    ADD CONSTRAINT fk_professional_profile FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4270 (class 2606 OID 17461)
-- Name: profiles fk_profile_user; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT fk_profile_user FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- TOC entry 4298 (class 2606 OID 17769)
-- Name: progress_photos fk_progress_photo_client; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progress_photos
    ADD CONSTRAINT fk_progress_photo_client FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4285 (class 2606 OID 17645)
-- Name: recipes fk_recipe_creator; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT fk_recipe_creator FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4286 (class 2606 OID 17663)
-- Name: recipe_ingredients fk_recipe_ingredient_food; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT fk_recipe_ingredient_food FOREIGN KEY (food_id) REFERENCES public.foods_library(id) ON DELETE CASCADE;


--
-- TOC entry 4287 (class 2606 OID 17658)
-- Name: recipe_ingredients fk_recipe_ingredient_recipe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recipe_ingredients
    ADD CONSTRAINT fk_recipe_ingredient_recipe FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- TOC entry 4277 (class 2606 OID 17566)
-- Name: workout_exercises fk_workout_exercise_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT fk_workout_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES public.exercises_library(id) ON DELETE CASCADE;


--
-- TOC entry 4278 (class 2606 OID 17561)
-- Name: workout_exercises fk_workout_exercise_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_exercises
    ADD CONSTRAINT fk_workout_exercise_workout FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4282 (class 2606 OID 17608)
-- Name: workout_logs fk_workout_log_client_workout; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT fk_workout_log_client_workout FOREIGN KEY (client_workout_id) REFERENCES public.client_workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4283 (class 2606 OID 17613)
-- Name: workout_logs fk_workout_log_exercise; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_logs
    ADD CONSTRAINT fk_workout_log_exercise FOREIGN KEY (workout_exercise_id) REFERENCES public.workout_exercises(id) ON DELETE CASCADE;


--
-- TOC entry 4276 (class 2606 OID 17548)
-- Name: workouts fk_workout_professional; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workouts
    ADD CONSTRAINT fk_workout_professional FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4308 (class 2606 OID 22403)
-- Name: professional_notifications professional_notifications_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_notifications
    ADD CONSTRAINT professional_notifications_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- TOC entry 4309 (class 2606 OID 22398)
-- Name: professional_notifications professional_notifications_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.professional_notifications
    ADD CONSTRAINT professional_notifications_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4304 (class 2606 OID 20131)
-- Name: workout_sessions workout_sessions_client_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4305 (class 2606 OID 20146)
-- Name: workout_sessions workout_sessions_client_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_client_workout_id_fkey FOREIGN KEY (client_workout_id) REFERENCES public.client_workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4306 (class 2606 OID 20136)
-- Name: workout_sessions workout_sessions_professional_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_professional_id_fkey FOREIGN KEY (professional_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- TOC entry 4307 (class 2606 OID 20141)
-- Name: workout_sessions workout_sessions_workout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workout_sessions
    ADD CONSTRAINT workout_sessions_workout_id_fkey FOREIGN KEY (workout_id) REFERENCES public.workouts(id) ON DELETE CASCADE;


--
-- TOC entry 4250 (class 2606 OID 16572)
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4269 (class 2606 OID 17207)
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4266 (class 2606 OID 17153)
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4267 (class 2606 OID 17173)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- TOC entry 4268 (class 2606 OID 17168)
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- TOC entry 4310 (class 2606 OID 22439)
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- TOC entry 4485 (class 0 OID 16525)
-- Dependencies: 344
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4499 (class 0 OID 16929)
-- Dependencies: 361
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4490 (class 0 OID 16727)
-- Dependencies: 352
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4484 (class 0 OID 16518)
-- Dependencies: 343
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4494 (class 0 OID 16816)
-- Dependencies: 356
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4493 (class 0 OID 16804)
-- Dependencies: 355
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4492 (class 0 OID 16791)
-- Dependencies: 354
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4500 (class 0 OID 16979)
-- Dependencies: 362
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4483 (class 0 OID 16507)
-- Dependencies: 342
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4497 (class 0 OID 16858)
-- Dependencies: 359
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4498 (class 0 OID 16876)
-- Dependencies: 360
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4486 (class 0 OID 16533)
-- Dependencies: 345
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4491 (class 0 OID 16757)
-- Dependencies: 353
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4496 (class 0 OID 16843)
-- Dependencies: 358
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4495 (class 0 OID 16834)
-- Dependencies: 357
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4482 (class 0 OID 16495)
-- Dependencies: 340
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4558 (class 3256 OID 26243)
-- Name: professional_details Anyone can view professional details; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view professional details" ON public.professional_details FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4557 (class 3256 OID 26242)
-- Name: profiles Authenticated users can view profiles; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4625 (class 3256 OID 26423)
-- Name: biometric_data Biometrics Insert Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Biometrics Insert Policy" ON public.biometric_data FOR INSERT TO authenticated WITH CHECK (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = biometric_data.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4626 (class 3256 OID 26424)
-- Name: biometric_data Biometrics Modify Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Biometrics Modify Policy" ON public.biometric_data TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = biometric_data.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4549 (class 3256 OID 26422)
-- Name: biometric_data Biometrics Select Policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Biometrics Select Policy" ON public.biometric_data FOR SELECT TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = biometric_data.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4545 (class 3256 OID 26373)
-- Name: chat_messages Insert Messages Logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Insert Messages Logic" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK ((auth.uid() = sender_id));


--
-- TOC entry 4537 (class 3256 OID 26269)
-- Name: client_details Insert client details logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Insert client details logic" ON public.client_details FOR INSERT TO authenticated WITH CHECK (((auth.uid() = profile_id) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = client_details.profile_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4629 (class 3256 OID 27553)
-- Name: progress_photos Progress Photos Delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Progress Photos Delete" ON public.progress_photos FOR DELETE TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = progress_photos.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4628 (class 3256 OID 27552)
-- Name: progress_photos Progress Photos Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Progress Photos Insert" ON public.progress_photos FOR INSERT TO authenticated WITH CHECK (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = progress_photos.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4627 (class 3256 OID 27551)
-- Name: progress_photos Progress Photos Select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Progress Photos Select" ON public.progress_photos FOR SELECT TO authenticated USING (((client_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = progress_photos.client_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4546 (class 3256 OID 26374)
-- Name: chat_messages Update Messages Logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Update Messages Logic" ON public.chat_messages FOR UPDATE TO authenticated USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- TOC entry 4587 (class 3256 OID 26268)
-- Name: client_details Update client details logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Update client details logic" ON public.client_details FOR UPDATE TO authenticated USING (((auth.uid() = profile_id) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = client_details.profile_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4624 (class 3256 OID 26190)
-- Name: profiles Users can update own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING ((auth.uid() = id));


--
-- TOC entry 4544 (class 3256 OID 26372)
-- Name: chat_messages View Messages Logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View Messages Logic" ON public.chat_messages FOR SELECT TO authenticated USING (((auth.uid() = sender_id) OR (auth.uid() = receiver_id)));


--
-- TOC entry 4559 (class 3256 OID 26244)
-- Name: client_details View client details logic; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "View client details logic" ON public.client_details FOR SELECT TO authenticated USING (((auth.uid() = profile_id) OR (EXISTS ( SELECT 1
   FROM public.client_professionals cp
  WHERE ((cp.client_id = client_details.profile_id) AND (cp.professional_id = auth.uid()) AND (cp.status = 'active'::text))))));


--
-- TOC entry 4524 (class 0 OID 17790)
-- Dependencies: 395
-- Name: appointments; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4623 (class 3256 OID 18093)
-- Name: appointments appointments_delete_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_delete_participants ON public.appointments FOR DELETE USING (((professional_id = auth.uid()) OR (client_id = auth.uid())));


--
-- TOC entry 4621 (class 3256 OID 18091)
-- Name: appointments appointments_insert_with_active_link; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_insert_with_active_link ON public.appointments FOR INSERT WITH CHECK ((((professional_id = auth.uid()) AND public.professional_has_client_access(client_id)) OR ((client_id = auth.uid()) AND public.client_has_professional_access(professional_id))));


--
-- TOC entry 4542 (class 3256 OID 18090)
-- Name: appointments appointments_select_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_select_participants ON public.appointments FOR SELECT USING (((professional_id = auth.uid()) OR (client_id = auth.uid())));


--
-- TOC entry 4622 (class 3256 OID 18092)
-- Name: appointments appointments_update_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY appointments_update_participants ON public.appointments FOR UPDATE USING (((professional_id = auth.uid()) OR (client_id = auth.uid())));


--
-- TOC entry 4523 (class 0 OID 17774)
-- Dependencies: 394
-- Name: biometric_data; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.biometric_data ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4525 (class 0 OID 17813)
-- Dependencies: 396
-- Name: chat_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4508 (class 0 OID 17482)
-- Dependencies: 379
-- Name: client_details; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_details ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4560 (class 3256 OID 18029)
-- Name: client_details client_details_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_details_delete_own ON public.client_details FOR DELETE USING ((profile_id = auth.uid()));


--
-- TOC entry 4520 (class 0 OID 17708)
-- Dependencies: 391
-- Name: client_meal_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_meal_plans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4619 (class 3256 OID 18077)
-- Name: client_meal_plans client_meal_plans_delete_assigning_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_delete_assigning_nutritionist ON public.client_meal_plans FOR DELETE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4617 (class 3256 OID 18075)
-- Name: client_meal_plans client_meal_plans_insert_nutritionist_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_insert_nutritionist_only ON public.client_meal_plans FOR INSERT WITH CHECK (((nutritionist_id = auth.uid()) AND public.professional_has_client_access(client_id)));


--
-- TOC entry 4616 (class 3256 OID 18074)
-- Name: client_meal_plans client_meal_plans_select_client_or_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_select_client_or_nutritionist ON public.client_meal_plans FOR SELECT USING (((client_id = auth.uid()) OR (nutritionist_id = auth.uid())));


--
-- TOC entry 4618 (class 3256 OID 18076)
-- Name: client_meal_plans client_meal_plans_update_assigning_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_meal_plans_update_assigning_nutritionist ON public.client_meal_plans FOR UPDATE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4509 (class 0 OID 17496)
-- Dependencies: 380
-- Name: client_professionals; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_professionals ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4564 (class 3256 OID 18033)
-- Name: client_professionals client_professionals_delete_professional_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_delete_professional_only ON public.client_professionals FOR DELETE USING ((professional_id = auth.uid()));


--
-- TOC entry 4562 (class 3256 OID 18031)
-- Name: client_professionals client_professionals_insert_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_insert_participants ON public.client_professionals FOR INSERT WITH CHECK ((((client_id = auth.uid()) AND public.is_client()) OR ((professional_id = auth.uid()) AND public.is_professional())));


--
-- TOC entry 4561 (class 3256 OID 18030)
-- Name: client_professionals client_professionals_select_participants; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_select_participants ON public.client_professionals FOR SELECT USING (((client_id = auth.uid()) OR (professional_id = auth.uid())));


--
-- TOC entry 4563 (class 3256 OID 18032)
-- Name: client_professionals client_professionals_update_professional_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_professionals_update_professional_only ON public.client_professionals FOR UPDATE USING ((professional_id = auth.uid()));


--
-- TOC entry 4555 (class 3256 OID 22710)
-- Name: client_professionals client_view_own_link; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_view_own_link ON public.client_professionals FOR SELECT USING ((auth.uid() = client_id));


--
-- TOC entry 4513 (class 0 OID 17571)
-- Dependencies: 384
-- Name: client_workouts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.client_workouts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4533 (class 3256 OID 19767)
-- Name: client_workouts client_workouts_delete_assigning_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_delete_assigning_professional ON public.client_workouts FOR DELETE TO authenticated USING ((professional_id = auth.uid()));


--
-- TOC entry 4531 (class 3256 OID 19765)
-- Name: client_workouts client_workouts_insert_professional_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_insert_professional_only ON public.client_workouts FOR INSERT TO authenticated WITH CHECK (((professional_id = auth.uid()) AND public.professional_has_client_access(client_id)));


--
-- TOC entry 4530 (class 3256 OID 19764)
-- Name: client_workouts client_workouts_select_client_or_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_select_client_or_professional ON public.client_workouts FOR SELECT TO authenticated USING (((client_id = auth.uid()) OR (professional_id = auth.uid())));


--
-- TOC entry 4532 (class 3256 OID 19766)
-- Name: client_workouts client_workouts_update_assigning_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY client_workouts_update_assigning_professional ON public.client_workouts FOR UPDATE TO authenticated USING ((professional_id = auth.uid())) WITH CHECK ((professional_id = auth.uid()));


--
-- TOC entry 4510 (class 0 OID 17519)
-- Dependencies: 381
-- Name: exercises_library; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.exercises_library ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4568 (class 3256 OID 18037)
-- Name: exercises_library exercises_library_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_delete_creator ON public.exercises_library FOR DELETE USING ((created_by = auth.uid()));


--
-- TOC entry 4566 (class 3256 OID 18035)
-- Name: exercises_library exercises_library_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_insert_professionals_only ON public.exercises_library FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4565 (class 3256 OID 18034)
-- Name: exercises_library exercises_library_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_select_own_or_public ON public.exercises_library FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));


--
-- TOC entry 4567 (class 3256 OID 18036)
-- Name: exercises_library exercises_library_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY exercises_library_update_creator ON public.exercises_library FOR UPDATE USING ((created_by = auth.uid()));


--
-- TOC entry 4515 (class 0 OID 17618)
-- Dependencies: 386
-- Name: foods_library; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.foods_library ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4600 (class 3256 OID 18057)
-- Name: foods_library foods_library_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_delete_creator ON public.foods_library FOR DELETE USING ((created_by = auth.uid()));


--
-- TOC entry 4598 (class 3256 OID 18055)
-- Name: foods_library foods_library_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_insert_professionals_only ON public.foods_library FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4597 (class 3256 OID 18054)
-- Name: foods_library foods_library_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_select_own_or_public ON public.foods_library FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));


--
-- TOC entry 4599 (class 3256 OID 18056)
-- Name: foods_library foods_library_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY foods_library_update_creator ON public.foods_library FOR UPDATE USING ((created_by = auth.uid()));


--
-- TOC entry 4521 (class 0 OID 17735)
-- Dependencies: 392
-- Name: meal_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4541 (class 3256 OID 18081)
-- Name: meal_logs meal_logs_delete_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_delete_client_only ON public.meal_logs FOR DELETE USING ((client_id = auth.uid()));


--
-- TOC entry 4620 (class 3256 OID 18079)
-- Name: meal_logs meal_logs_insert_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_insert_client_only ON public.meal_logs FOR INSERT WITH CHECK ((client_id = auth.uid()));


--
-- TOC entry 4612 (class 3256 OID 18078)
-- Name: meal_logs meal_logs_select_client_or_linked_nutritionist; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_select_client_or_linked_nutritionist ON public.meal_logs FOR SELECT USING (((client_id = auth.uid()) OR public.professional_has_client_access(client_id)));


--
-- TOC entry 4540 (class 3256 OID 18080)
-- Name: meal_logs meal_logs_update_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_logs_update_client_only ON public.meal_logs FOR UPDATE USING ((client_id = auth.uid()));


--
-- TOC entry 4519 (class 0 OID 17684)
-- Dependencies: 390
-- Name: meal_plan_items; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4615 (class 3256 OID 18073)
-- Name: meal_plan_items meal_plan_items_delete_plan_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_delete_plan_owner ON public.meal_plan_items FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))));


--
-- TOC entry 4613 (class 3256 OID 18071)
-- Name: meal_plan_items meal_plan_items_insert_plan_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_insert_plan_owner ON public.meal_plan_items FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))));


--
-- TOC entry 4554 (class 3256 OID 20117)
-- Name: meal_plan_items meal_plan_items_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_select_policy ON public.meal_plan_items FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.client_meal_plans
  WHERE ((client_meal_plans.meal_plan_id = meal_plan_items.meal_plan_id) AND (client_meal_plans.client_id = auth.uid()) AND (client_meal_plans.status = 'active'::text))))));


--
-- TOC entry 4614 (class 3256 OID 18072)
-- Name: meal_plan_items meal_plan_items_update_plan_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plan_items_update_plan_owner ON public.meal_plan_items FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.meal_plans
  WHERE ((meal_plans.id = meal_plan_items.meal_plan_id) AND (meal_plans.nutritionist_id = auth.uid())))));


--
-- TOC entry 4518 (class 0 OID 17668)
-- Dependencies: 389
-- Name: meal_plans; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4611 (class 3256 OID 18069)
-- Name: meal_plans meal_plans_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_delete_creator ON public.meal_plans FOR DELETE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4609 (class 3256 OID 18067)
-- Name: meal_plans meal_plans_insert_nutritionists_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_insert_nutritionists_only ON public.meal_plans FOR INSERT WITH CHECK (((nutritionist_id = auth.uid()) AND public.is_professional()));


--
-- TOC entry 4539 (class 3256 OID 20094)
-- Name: meal_plans meal_plans_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_select_policy ON public.meal_plans FOR SELECT USING (((nutritionist_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_meal_plans
  WHERE ((client_meal_plans.meal_plan_id = meal_plans.id) AND (client_meal_plans.client_id = auth.uid()) AND (client_meal_plans.status = 'active'::text))))));


--
-- TOC entry 4610 (class 3256 OID 18068)
-- Name: meal_plans meal_plans_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY meal_plans_update_creator ON public.meal_plans FOR UPDATE USING ((nutritionist_id = auth.uid()));


--
-- TOC entry 4582 (class 3256 OID 22411)
-- Name: professional_notifications prof_delete_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_delete_own_notifications ON public.professional_notifications FOR DELETE USING ((auth.uid() = professional_id));


--
-- TOC entry 4580 (class 3256 OID 22409)
-- Name: professional_notifications prof_insert_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_insert_own_notifications ON public.professional_notifications FOR INSERT WITH CHECK ((auth.uid() = professional_id));


--
-- TOC entry 4581 (class 3256 OID 22410)
-- Name: professional_notifications prof_update_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_update_own_notifications ON public.professional_notifications FOR UPDATE USING ((auth.uid() = professional_id));


--
-- TOC entry 4579 (class 3256 OID 22408)
-- Name: professional_notifications prof_view_own_notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY prof_view_own_notifications ON public.professional_notifications FOR SELECT USING ((auth.uid() = professional_id));


--
-- TOC entry 4507 (class 0 OID 17466)
-- Dependencies: 378
-- Name: professional_details; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.professional_details ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4592 (class 3256 OID 18025)
-- Name: professional_details professional_details_delete_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY professional_details_delete_own ON public.professional_details FOR DELETE USING ((profile_id = auth.uid()));


--
-- TOC entry 4590 (class 3256 OID 18023)
-- Name: professional_details professional_details_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY professional_details_insert_own ON public.professional_details FOR INSERT WITH CHECK (((profile_id = auth.uid()) AND public.is_professional()));


--
-- TOC entry 4591 (class 3256 OID 18024)
-- Name: professional_details professional_details_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY professional_details_update_own ON public.professional_details FOR UPDATE USING ((profile_id = auth.uid()));


--
-- TOC entry 4527 (class 0 OID 22388)
-- Dependencies: 398
-- Name: professional_notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.professional_notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4506 (class 0 OID 17451)
-- Dependencies: 377
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4589 (class 3256 OID 18021)
-- Name: profiles profiles_delete_admin_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_delete_admin_only ON public.profiles FOR DELETE USING (public.is_admin());


--
-- TOC entry 4553 (class 3256 OID 19603)
-- Name: profiles profiles_delete_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_delete_policy ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());


--
-- TOC entry 4588 (class 3256 OID 18019)
-- Name: profiles profiles_insert_admin_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_insert_admin_only ON public.profiles FOR INSERT WITH CHECK (public.is_admin());


--
-- TOC entry 4552 (class 3256 OID 19601)
-- Name: profiles profiles_insert_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_insert_policy ON public.profiles FOR INSERT TO authenticated WITH CHECK (public.is_admin());


--
-- TOC entry 4556 (class 3256 OID 22711)
-- Name: profiles profiles_view_linked_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY profiles_view_linked_professional ON public.profiles FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.client_professionals
  WHERE ((client_professionals.professional_id = profiles.id) AND (client_professionals.client_id = auth.uid())))));


--
-- TOC entry 4522 (class 0 OID 17760)
-- Dependencies: 393
-- Name: progress_photos; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4517 (class 0 OID 17650)
-- Dependencies: 388
-- Name: recipe_ingredients; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4608 (class 3256 OID 18065)
-- Name: recipe_ingredients recipe_ingredients_delete_recipe_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_delete_recipe_owner ON public.recipe_ingredients FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND (recipes.created_by = auth.uid())))));


--
-- TOC entry 4606 (class 3256 OID 18063)
-- Name: recipe_ingredients recipe_ingredients_insert_recipe_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_insert_recipe_owner ON public.recipe_ingredients FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND (recipes.created_by = auth.uid())))));


--
-- TOC entry 4605 (class 3256 OID 18062)
-- Name: recipe_ingredients recipe_ingredients_select_via_recipe; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_select_via_recipe ON public.recipe_ingredients FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND ((recipes.created_by = auth.uid()) OR (recipes.is_public = true))))));


--
-- TOC entry 4607 (class 3256 OID 18064)
-- Name: recipe_ingredients recipe_ingredients_update_recipe_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipe_ingredients_update_recipe_owner ON public.recipe_ingredients FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.recipes
  WHERE ((recipes.id = recipe_ingredients.recipe_id) AND (recipes.created_by = auth.uid())))));


--
-- TOC entry 4516 (class 0 OID 17634)
-- Dependencies: 387
-- Name: recipes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4604 (class 3256 OID 18061)
-- Name: recipes recipes_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_delete_creator ON public.recipes FOR DELETE USING ((created_by = auth.uid()));


--
-- TOC entry 4602 (class 3256 OID 18059)
-- Name: recipes recipes_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_insert_professionals_only ON public.recipes FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4601 (class 3256 OID 18058)
-- Name: recipes recipes_select_own_or_public; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_select_own_or_public ON public.recipes FOR SELECT USING (((created_by = auth.uid()) OR (is_public = true)));


--
-- TOC entry 4603 (class 3256 OID 18060)
-- Name: recipes recipes_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY recipes_update_creator ON public.recipes FOR UPDATE USING ((created_by = auth.uid()));


--
-- TOC entry 4512 (class 0 OID 17553)
-- Dependencies: 383
-- Name: workout_exercises; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4578 (class 3256 OID 18045)
-- Name: workout_exercises workout_exercises_delete_workout_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_delete_workout_owner ON public.workout_exercises FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))));


--
-- TOC entry 4576 (class 3256 OID 18043)
-- Name: workout_exercises workout_exercises_insert_workout_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_insert_workout_owner ON public.workout_exercises FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))));


--
-- TOC entry 4543 (class 3256 OID 20116)
-- Name: workout_exercises workout_exercises_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_select_policy ON public.workout_exercises FOR SELECT USING (((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))) OR (EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.workout_id = workout_exercises.workout_id) AND (client_workouts.client_id = auth.uid()) AND (client_workouts.status = 'active'::text))))));


--
-- TOC entry 4577 (class 3256 OID 18044)
-- Name: workout_exercises workout_exercises_update_workout_owner; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_exercises_update_workout_owner ON public.workout_exercises FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.workouts
  WHERE ((workouts.id = workout_exercises.workout_id) AND (workouts.professional_id = auth.uid())))));


--
-- TOC entry 4514 (class 0 OID 17598)
-- Dependencies: 385
-- Name: workout_logs; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4596 (class 3256 OID 18053)
-- Name: workout_logs workout_logs_delete_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_delete_client_only ON public.workout_logs FOR DELETE USING ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND (client_workouts.client_id = auth.uid())))));


--
-- TOC entry 4594 (class 3256 OID 18051)
-- Name: workout_logs workout_logs_insert_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_insert_client_only ON public.workout_logs FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND (client_workouts.client_id = auth.uid())))));


--
-- TOC entry 4593 (class 3256 OID 18050)
-- Name: workout_logs workout_logs_select_client_or_linked_professional; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_select_client_or_linked_professional ON public.workout_logs FOR SELECT USING ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND ((client_workouts.client_id = auth.uid()) OR (client_workouts.professional_id = auth.uid()))))));


--
-- TOC entry 4595 (class 3256 OID 18052)
-- Name: workout_logs workout_logs_update_client_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_logs_update_client_only ON public.workout_logs FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.id = workout_logs.client_workout_id) AND (client_workouts.client_id = auth.uid())))));


--
-- TOC entry 4526 (class 0 OID 20118)
-- Dependencies: 397
-- Name: workout_sessions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4574 (class 3256 OID 20158)
-- Name: workout_sessions workout_sessions_delete_client_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_delete_client_own ON public.workout_sessions FOR DELETE USING ((auth.uid() = client_id));


--
-- TOC entry 4571 (class 3256 OID 20155)
-- Name: workout_sessions workout_sessions_insert_client_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_insert_client_own ON public.workout_sessions FOR INSERT WITH CHECK ((auth.uid() = client_id));


--
-- TOC entry 4572 (class 3256 OID 20156)
-- Name: workout_sessions workout_sessions_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_select_policy ON public.workout_sessions FOR SELECT USING (((auth.uid() = client_id) OR (auth.uid() = professional_id)));


--
-- TOC entry 4573 (class 3256 OID 20157)
-- Name: workout_sessions workout_sessions_update_client_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workout_sessions_update_client_own ON public.workout_sessions FOR UPDATE USING ((auth.uid() = client_id)) WITH CHECK ((auth.uid() = client_id));


--
-- TOC entry 4511 (class 0 OID 17536)
-- Dependencies: 382
-- Name: workouts; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4575 (class 3256 OID 18041)
-- Name: workouts workouts_delete_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_delete_creator ON public.workouts FOR DELETE USING ((professional_id = auth.uid()));


--
-- TOC entry 4569 (class 3256 OID 18039)
-- Name: workouts workouts_insert_professionals_only; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_insert_professionals_only ON public.workouts FOR INSERT WITH CHECK (public.is_professional());


--
-- TOC entry 4538 (class 3256 OID 18225)
-- Name: workouts workouts_select_policy; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_select_policy ON public.workouts FOR SELECT USING (((professional_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM public.client_workouts
  WHERE ((client_workouts.workout_id = workouts.id) AND (client_workouts.client_id = auth.uid()) AND (client_workouts.status = 'active'::text))))));


--
-- TOC entry 4570 (class 3256 OID 18040)
-- Name: workouts workouts_update_creator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY workouts_update_creator ON public.workouts FOR UPDATE USING ((professional_id = auth.uid()));


--
-- TOC entry 4505 (class 0 OID 17434)
-- Dependencies: 376
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4584 (class 3256 OID 26160)
-- Name: objects Authenticated users can upload avatar; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Authenticated users can upload avatar" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- TOC entry 4536 (class 3256 OID 26194)
-- Name: objects Avatar Auth Update; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar Auth Update" ON storage.objects FOR UPDATE USING ((auth.uid() = owner)) WITH CHECK ((bucket_id = 'avatars'::text));


--
-- TOC entry 4535 (class 3256 OID 26193)
-- Name: objects Avatar Auth Upload; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar Auth Upload" ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'avatars'::text) AND (auth.role() = 'authenticated'::text)));


--
-- TOC entry 4534 (class 3256 OID 26192)
-- Name: objects Avatar Public Select; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar Public Select" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- TOC entry 4583 (class 3256 OID 26159)
-- Name: objects Avatar images are publicly accessible; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- TOC entry 4547 (class 3256 OID 26398)
-- Name: objects Give me access to chat files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Give me access to chat files" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'chat-attachments'::text));


--
-- TOC entry 4548 (class 3256 OID 26399)
-- Name: objects Let me upload chat files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Let me upload chat files" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'chat-attachments'::text));


--
-- TOC entry 4551 (class 3256 OID 27550)
-- Name: objects Upload Progress Photos; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Upload Progress Photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'progress-photos'::text));


--
-- TOC entry 4586 (class 3256 OID 26162)
-- Name: objects Users can delete their own avatar; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE USING (((auth.uid() = owner) AND (bucket_id = 'avatars'::text)));


--
-- TOC entry 4585 (class 3256 OID 26161)
-- Name: objects Users can update their own avatar; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING ((auth.uid() = owner)) WITH CHECK ((bucket_id = 'avatars'::text));


--
-- TOC entry 4550 (class 3256 OID 27549)
-- Name: objects View Progress Photos; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "View Progress Photos" ON storage.objects FOR SELECT TO authenticated USING ((bucket_id = 'progress-photos'::text));


--
-- TOC entry 4487 (class 0 OID 16546)
-- Dependencies: 346
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4504 (class 0 OID 17246)
-- Dependencies: 370
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4528 (class 0 OID 22419)
-- Dependencies: 399
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4489 (class 0 OID 16588)
-- Dependencies: 348
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4488 (class 0 OID 16561)
-- Dependencies: 347
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4503 (class 0 OID 17197)
-- Dependencies: 368
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4501 (class 0 OID 17144)
-- Dependencies: 366
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4502 (class 0 OID 17158)
-- Dependencies: 367
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4529 (class 0 OID 22429)
-- Dependencies: 400
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4630 (class 6104 OID 16426)
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- TOC entry 4631 (class 6104 OID 22584)
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- TOC entry 4633 (class 6106 OID 22732)
-- Name: supabase_realtime chat_messages; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.chat_messages;


--
-- TOC entry 4632 (class 6106 OID 22585)
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- TOC entry 4700 (class 0 OID 0)
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
-- TOC entry 4701 (class 0 OID 0)
-- Dependencies: 23
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- TOC entry 4702 (class 0 OID 0)
-- Dependencies: 39
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 4703 (class 0 OID 0)
-- Dependencies: 13
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- TOC entry 4704 (class 0 OID 0)
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
-- TOC entry 4705 (class 0 OID 0)
-- Dependencies: 32
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- TOC entry 4712 (class 0 OID 0)
-- Dependencies: 459
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- TOC entry 4713 (class 0 OID 0)
-- Dependencies: 467
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- TOC entry 4715 (class 0 OID 0)
-- Dependencies: 414
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- TOC entry 4717 (class 0 OID 0)
-- Dependencies: 433
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- TOC entry 4718 (class 0 OID 0)
-- Dependencies: 466
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- TOC entry 4719 (class 0 OID 0)
-- Dependencies: 506
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- TOC entry 4720 (class 0 OID 0)
-- Dependencies: 492
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- TOC entry 4721 (class 0 OID 0)
-- Dependencies: 478
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- TOC entry 4722 (class 0 OID 0)
-- Dependencies: 481
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4723 (class 0 OID 0)
-- Dependencies: 452
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4724 (class 0 OID 0)
-- Dependencies: 524
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- TOC entry 4725 (class 0 OID 0)
-- Dependencies: 499
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- TOC entry 4726 (class 0 OID 0)
-- Dependencies: 444
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4727 (class 0 OID 0)
-- Dependencies: 423
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4728 (class 0 OID 0)
-- Dependencies: 502
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- TOC entry 4729 (class 0 OID 0)
-- Dependencies: 416
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- TOC entry 4730 (class 0 OID 0)
-- Dependencies: 549
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- TOC entry 4731 (class 0 OID 0)
-- Dependencies: 546
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- TOC entry 4733 (class 0 OID 0)
-- Dependencies: 497
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- TOC entry 4735 (class 0 OID 0)
-- Dependencies: 477
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4737 (class 0 OID 0)
-- Dependencies: 448
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- TOC entry 4738 (class 0 OID 0)
-- Dependencies: 422
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4739 (class 0 OID 0)
-- Dependencies: 538
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- TOC entry 4740 (class 0 OID 0)
-- Dependencies: 511
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4741 (class 0 OID 0)
-- Dependencies: 544
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- TOC entry 4742 (class 0 OID 0)
-- Dependencies: 501
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- TOC entry 4743 (class 0 OID 0)
-- Dependencies: 457
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- TOC entry 4744 (class 0 OID 0)
-- Dependencies: 453
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- TOC entry 4745 (class 0 OID 0)
-- Dependencies: 532
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4746 (class 0 OID 0)
-- Dependencies: 410
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4747 (class 0 OID 0)
-- Dependencies: 534
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4748 (class 0 OID 0)
-- Dependencies: 426
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4749 (class 0 OID 0)
-- Dependencies: 542
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4750 (class 0 OID 0)
-- Dependencies: 540
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- TOC entry 4751 (class 0 OID 0)
-- Dependencies: 463
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- TOC entry 4752 (class 0 OID 0)
-- Dependencies: 458
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- TOC entry 4753 (class 0 OID 0)
-- Dependencies: 442
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- TOC entry 4754 (class 0 OID 0)
-- Dependencies: 527
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- TOC entry 4755 (class 0 OID 0)
-- Dependencies: 530
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- TOC entry 4756 (class 0 OID 0)
-- Dependencies: 460
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4757 (class 0 OID 0)
-- Dependencies: 533
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4758 (class 0 OID 0)
-- Dependencies: 529
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4759 (class 0 OID 0)
-- Dependencies: 548
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- TOC entry 4760 (class 0 OID 0)
-- Dependencies: 471
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- TOC entry 4761 (class 0 OID 0)
-- Dependencies: 432
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- TOC entry 4762 (class 0 OID 0)
-- Dependencies: 535
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- TOC entry 4763 (class 0 OID 0)
-- Dependencies: 408
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4764 (class 0 OID 0)
-- Dependencies: 512
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4766 (class 0 OID 0)
-- Dependencies: 420
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4767 (class 0 OID 0)
-- Dependencies: 464
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- TOC entry 4768 (class 0 OID 0)
-- Dependencies: 516
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- TOC entry 4769 (class 0 OID 0)
-- Dependencies: 409
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4770 (class 0 OID 0)
-- Dependencies: 430
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- TOC entry 4771 (class 0 OID 0)
-- Dependencies: 441
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- TOC entry 4772 (class 0 OID 0)
-- Dependencies: 493
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- TOC entry 4773 (class 0 OID 0)
-- Dependencies: 443
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- TOC entry 4774 (class 0 OID 0)
-- Dependencies: 537
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- TOC entry 4775 (class 0 OID 0)
-- Dependencies: 485
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- TOC entry 4776 (class 0 OID 0)
-- Dependencies: 494
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- TOC entry 4777 (class 0 OID 0)
-- Dependencies: 539
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- TOC entry 4778 (class 0 OID 0)
-- Dependencies: 425
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- TOC entry 4779 (class 0 OID 0)
-- Dependencies: 461
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO postgres;


--
-- TOC entry 4780 (class 0 OID 0)
-- Dependencies: 439
-- Name: FUNCTION calculate_session_duration(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_session_duration() TO anon;
GRANT ALL ON FUNCTION public.calculate_session_duration() TO authenticated;
GRANT ALL ON FUNCTION public.calculate_session_duration() TO service_role;


--
-- TOC entry 4781 (class 0 OID 0)
-- Dependencies: 431
-- Name: FUNCTION client_has_professional_access(professional_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.client_has_professional_access(professional_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.client_has_professional_access(professional_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.client_has_professional_access(professional_uuid uuid) TO service_role;


--
-- TOC entry 4782 (class 0 OID 0)
-- Dependencies: 513
-- Name: FUNCTION count_total_unread_messages(user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.count_total_unread_messages(user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.count_total_unread_messages(user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.count_total_unread_messages(user_id uuid) TO service_role;


--
-- TOC entry 4783 (class 0 OID 0)
-- Dependencies: 525
-- Name: FUNCTION count_unread_messages(user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.count_unread_messages(user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.count_unread_messages(user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.count_unread_messages(user_id uuid) TO service_role;


--
-- TOC entry 4784 (class 0 OID 0)
-- Dependencies: 455
-- Name: FUNCTION find_client_by_email(client_email text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.find_client_by_email(client_email text) TO anon;
GRANT ALL ON FUNCTION public.find_client_by_email(client_email text) TO authenticated;
GRANT ALL ON FUNCTION public.find_client_by_email(client_email text) TO service_role;


--
-- TOC entry 4785 (class 0 OID 0)
-- Dependencies: 411
-- Name: FUNCTION get_conversation(user_id uuid, other_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_conversation(user_id uuid, other_user_id uuid) TO service_role;


--
-- TOC entry 4786 (class 0 OID 0)
-- Dependencies: 427
-- Name: FUNCTION get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) TO anon;
GRANT ALL ON FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_conversation(user1_id uuid, user2_id uuid, limit_count integer, offset_count integer) TO service_role;


--
-- TOC entry 4787 (class 0 OID 0)
-- Dependencies: 413
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- TOC entry 4788 (class 0 OID 0)
-- Dependencies: 456
-- Name: FUNCTION handle_notifications_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_notifications_updated_at() TO anon;
GRANT ALL ON FUNCTION public.handle_notifications_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.handle_notifications_updated_at() TO service_role;


--
-- TOC entry 4789 (class 0 OID 0)
-- Dependencies: 507
-- Name: FUNCTION handle_updated_at(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_updated_at() TO anon;
GRANT ALL ON FUNCTION public.handle_updated_at() TO authenticated;
GRANT ALL ON FUNCTION public.handle_updated_at() TO service_role;


--
-- TOC entry 4790 (class 0 OID 0)
-- Dependencies: 440
-- Name: FUNCTION is_admin(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_admin() TO anon;
GRANT ALL ON FUNCTION public.is_admin() TO authenticated;
GRANT ALL ON FUNCTION public.is_admin() TO service_role;


--
-- TOC entry 4791 (class 0 OID 0)
-- Dependencies: 421
-- Name: FUNCTION is_client(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_client() TO anon;
GRANT ALL ON FUNCTION public.is_client() TO authenticated;
GRANT ALL ON FUNCTION public.is_client() TO service_role;


--
-- TOC entry 4792 (class 0 OID 0)
-- Dependencies: 449
-- Name: FUNCTION is_professional(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.is_professional() TO anon;
GRANT ALL ON FUNCTION public.is_professional() TO authenticated;
GRANT ALL ON FUNCTION public.is_professional() TO service_role;


--
-- TOC entry 4794 (class 0 OID 0)
-- Dependencies: 436
-- Name: FUNCTION link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) TO anon;
GRANT ALL ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) TO authenticated;
GRANT ALL ON FUNCTION public.link_client_and_update_profile(p_client_id uuid, p_notes text, p_full_name text, p_phone text) TO service_role;


--
-- TOC entry 4795 (class 0 OID 0)
-- Dependencies: 536
-- Name: FUNCTION mark_conversation_as_read(current_user_id uuid, other_user_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) TO anon;
GRANT ALL ON FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.mark_conversation_as_read(current_user_id uuid, other_user_id uuid) TO service_role;


--
-- TOC entry 4797 (class 0 OID 0)
-- Dependencies: 479
-- Name: FUNCTION professional_can_link_client(p_client_id uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.professional_can_link_client(p_client_id uuid) TO anon;
GRANT ALL ON FUNCTION public.professional_can_link_client(p_client_id uuid) TO authenticated;
GRANT ALL ON FUNCTION public.professional_can_link_client(p_client_id uuid) TO service_role;


--
-- TOC entry 4798 (class 0 OID 0)
-- Dependencies: 508
-- Name: FUNCTION professional_has_client_access(client_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.professional_has_client_access(client_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.professional_has_client_access(client_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.professional_has_client_access(client_uuid uuid) TO service_role;


--
-- TOC entry 4799 (class 0 OID 0)
-- Dependencies: 415
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4800 (class 0 OID 0)
-- Dependencies: 545
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- TOC entry 4801 (class 0 OID 0)
-- Dependencies: 473
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- TOC entry 4802 (class 0 OID 0)
-- Dependencies: 428
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- TOC entry 4803 (class 0 OID 0)
-- Dependencies: 462
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- TOC entry 4804 (class 0 OID 0)
-- Dependencies: 510
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- TOC entry 4805 (class 0 OID 0)
-- Dependencies: 531
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- TOC entry 4806 (class 0 OID 0)
-- Dependencies: 521
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- TOC entry 4807 (class 0 OID 0)
-- Dependencies: 438
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- TOC entry 4808 (class 0 OID 0)
-- Dependencies: 482
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- TOC entry 4809 (class 0 OID 0)
-- Dependencies: 487
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- TOC entry 4810 (class 0 OID 0)
-- Dependencies: 469
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- TOC entry 4811 (class 0 OID 0)
-- Dependencies: 435
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- TOC entry 4812 (class 0 OID 0)
-- Dependencies: 419
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4813 (class 0 OID 0)
-- Dependencies: 476
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- TOC entry 4815 (class 0 OID 0)
-- Dependencies: 344
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- TOC entry 4817 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- TOC entry 4820 (class 0 OID 0)
-- Dependencies: 352
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- TOC entry 4822 (class 0 OID 0)
-- Dependencies: 343
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- TOC entry 4824 (class 0 OID 0)
-- Dependencies: 356
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- TOC entry 4826 (class 0 OID 0)
-- Dependencies: 355
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- TOC entry 4829 (class 0 OID 0)
-- Dependencies: 354
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 364
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 363
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- TOC entry 4832 (class 0 OID 0)
-- Dependencies: 365
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- TOC entry 4833 (class 0 OID 0)
-- Dependencies: 362
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- TOC entry 4835 (class 0 OID 0)
-- Dependencies: 342
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- TOC entry 4837 (class 0 OID 0)
-- Dependencies: 341
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- TOC entry 4839 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- TOC entry 4841 (class 0 OID 0)
-- Dependencies: 360
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- TOC entry 4843 (class 0 OID 0)
-- Dependencies: 345
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- TOC entry 4848 (class 0 OID 0)
-- Dependencies: 353
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- TOC entry 4850 (class 0 OID 0)
-- Dependencies: 358
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- TOC entry 4853 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- TOC entry 4856 (class 0 OID 0)
-- Dependencies: 340
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- TOC entry 4857 (class 0 OID 0)
-- Dependencies: 339
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- TOC entry 4858 (class 0 OID 0)
-- Dependencies: 338
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- TOC entry 4859 (class 0 OID 0)
-- Dependencies: 395
-- Name: TABLE appointments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.appointments TO anon;
GRANT ALL ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO service_role;


--
-- TOC entry 4860 (class 0 OID 0)
-- Dependencies: 394
-- Name: TABLE biometric_data; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.biometric_data TO anon;
GRANT ALL ON TABLE public.biometric_data TO authenticated;
GRANT ALL ON TABLE public.biometric_data TO service_role;


--
-- TOC entry 4861 (class 0 OID 0)
-- Dependencies: 396
-- Name: TABLE chat_messages; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.chat_messages TO anon;
GRANT ALL ON TABLE public.chat_messages TO authenticated;
GRANT ALL ON TABLE public.chat_messages TO service_role;


--
-- TOC entry 4862 (class 0 OID 0)
-- Dependencies: 379
-- Name: TABLE client_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_details TO anon;
GRANT ALL ON TABLE public.client_details TO authenticated;
GRANT ALL ON TABLE public.client_details TO service_role;


--
-- TOC entry 4863 (class 0 OID 0)
-- Dependencies: 391
-- Name: TABLE client_meal_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_meal_plans TO anon;
GRANT ALL ON TABLE public.client_meal_plans TO authenticated;
GRANT ALL ON TABLE public.client_meal_plans TO service_role;


--
-- TOC entry 4864 (class 0 OID 0)
-- Dependencies: 380
-- Name: TABLE client_professionals; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_professionals TO anon;
GRANT ALL ON TABLE public.client_professionals TO authenticated;
GRANT ALL ON TABLE public.client_professionals TO service_role;


--
-- TOC entry 4865 (class 0 OID 0)
-- Dependencies: 384
-- Name: TABLE client_workouts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.client_workouts TO anon;
GRANT ALL ON TABLE public.client_workouts TO authenticated;
GRANT ALL ON TABLE public.client_workouts TO service_role;


--
-- TOC entry 4866 (class 0 OID 0)
-- Dependencies: 381
-- Name: TABLE exercises_library; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.exercises_library TO anon;
GRANT ALL ON TABLE public.exercises_library TO authenticated;
GRANT ALL ON TABLE public.exercises_library TO service_role;


--
-- TOC entry 4867 (class 0 OID 0)
-- Dependencies: 386
-- Name: TABLE foods_library; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.foods_library TO anon;
GRANT ALL ON TABLE public.foods_library TO authenticated;
GRANT ALL ON TABLE public.foods_library TO service_role;


--
-- TOC entry 4868 (class 0 OID 0)
-- Dependencies: 392
-- Name: TABLE meal_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meal_logs TO anon;
GRANT ALL ON TABLE public.meal_logs TO authenticated;
GRANT ALL ON TABLE public.meal_logs TO service_role;


--
-- TOC entry 4869 (class 0 OID 0)
-- Dependencies: 390
-- Name: TABLE meal_plan_items; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meal_plan_items TO anon;
GRANT ALL ON TABLE public.meal_plan_items TO authenticated;
GRANT ALL ON TABLE public.meal_plan_items TO service_role;


--
-- TOC entry 4870 (class 0 OID 0)
-- Dependencies: 389
-- Name: TABLE meal_plans; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.meal_plans TO anon;
GRANT ALL ON TABLE public.meal_plans TO authenticated;
GRANT ALL ON TABLE public.meal_plans TO service_role;


--
-- TOC entry 4871 (class 0 OID 0)
-- Dependencies: 378
-- Name: TABLE professional_details; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.professional_details TO anon;
GRANT ALL ON TABLE public.professional_details TO authenticated;
GRANT ALL ON TABLE public.professional_details TO service_role;


--
-- TOC entry 4872 (class 0 OID 0)
-- Dependencies: 398
-- Name: TABLE professional_notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.professional_notifications TO anon;
GRANT ALL ON TABLE public.professional_notifications TO authenticated;
GRANT ALL ON TABLE public.professional_notifications TO service_role;


--
-- TOC entry 4873 (class 0 OID 0)
-- Dependencies: 377
-- Name: TABLE profiles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profiles TO anon;
GRANT ALL ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;


--
-- TOC entry 4874 (class 0 OID 0)
-- Dependencies: 393
-- Name: TABLE progress_photos; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.progress_photos TO anon;
GRANT ALL ON TABLE public.progress_photos TO authenticated;
GRANT ALL ON TABLE public.progress_photos TO service_role;


--
-- TOC entry 4875 (class 0 OID 0)
-- Dependencies: 388
-- Name: TABLE recipe_ingredients; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recipe_ingredients TO anon;
GRANT ALL ON TABLE public.recipe_ingredients TO authenticated;
GRANT ALL ON TABLE public.recipe_ingredients TO service_role;


--
-- TOC entry 4876 (class 0 OID 0)
-- Dependencies: 387
-- Name: TABLE recipes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.recipes TO anon;
GRANT ALL ON TABLE public.recipes TO authenticated;
GRANT ALL ON TABLE public.recipes TO service_role;


--
-- TOC entry 4877 (class 0 OID 0)
-- Dependencies: 383
-- Name: TABLE workout_exercises; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_exercises TO anon;
GRANT ALL ON TABLE public.workout_exercises TO authenticated;
GRANT ALL ON TABLE public.workout_exercises TO service_role;


--
-- TOC entry 4878 (class 0 OID 0)
-- Dependencies: 385
-- Name: TABLE workout_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_logs TO anon;
GRANT ALL ON TABLE public.workout_logs TO authenticated;
GRANT ALL ON TABLE public.workout_logs TO service_role;


--
-- TOC entry 4879 (class 0 OID 0)
-- Dependencies: 397
-- Name: TABLE workout_sessions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workout_sessions TO anon;
GRANT ALL ON TABLE public.workout_sessions TO authenticated;
GRANT ALL ON TABLE public.workout_sessions TO service_role;


--
-- TOC entry 4880 (class 0 OID 0)
-- Dependencies: 382
-- Name: TABLE workouts; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.workouts TO anon;
GRANT ALL ON TABLE public.workouts TO authenticated;
GRANT ALL ON TABLE public.workouts TO service_role;


--
-- TOC entry 4881 (class 0 OID 0)
-- Dependencies: 376
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- TOC entry 4882 (class 0 OID 0)
-- Dependencies: 401
-- Name: TABLE messages_2025_11_22; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_22 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_22 TO dashboard_user;


--
-- TOC entry 4883 (class 0 OID 0)
-- Dependencies: 402
-- Name: TABLE messages_2025_11_23; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_23 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_23 TO dashboard_user;


--
-- TOC entry 4884 (class 0 OID 0)
-- Dependencies: 403
-- Name: TABLE messages_2025_11_24; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_24 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_24 TO dashboard_user;


--
-- TOC entry 4885 (class 0 OID 0)
-- Dependencies: 404
-- Name: TABLE messages_2025_11_25; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_25 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_25 TO dashboard_user;


--
-- TOC entry 4886 (class 0 OID 0)
-- Dependencies: 405
-- Name: TABLE messages_2025_11_26; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_26 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_26 TO dashboard_user;


--
-- TOC entry 4887 (class 0 OID 0)
-- Dependencies: 406
-- Name: TABLE messages_2025_11_27; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_27 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_27 TO dashboard_user;


--
-- TOC entry 4888 (class 0 OID 0)
-- Dependencies: 407
-- Name: TABLE messages_2025_11_28; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_28 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_28 TO dashboard_user;


--
-- TOC entry 4889 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- TOC entry 4890 (class 0 OID 0)
-- Dependencies: 373
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- TOC entry 4891 (class 0 OID 0)
-- Dependencies: 372
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- TOC entry 4893 (class 0 OID 0)
-- Dependencies: 346
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- TOC entry 4894 (class 0 OID 0)
-- Dependencies: 370
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- TOC entry 4895 (class 0 OID 0)
-- Dependencies: 399
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- TOC entry 4897 (class 0 OID 0)
-- Dependencies: 347
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- TOC entry 4898 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE prefixes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.prefixes TO service_role;
GRANT ALL ON TABLE storage.prefixes TO authenticated;
GRANT ALL ON TABLE storage.prefixes TO anon;


--
-- TOC entry 4899 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- TOC entry 4900 (class 0 OID 0)
-- Dependencies: 367
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- TOC entry 4901 (class 0 OID 0)
-- Dependencies: 400
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- TOC entry 4902 (class 0 OID 0)
-- Dependencies: 349
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- TOC entry 4903 (class 0 OID 0)
-- Dependencies: 350
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- TOC entry 2604 (class 826 OID 16603)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2605 (class 826 OID 16604)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2603 (class 826 OID 16602)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2614 (class 826 OID 16682)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2613 (class 826 OID 16681)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- TOC entry 2612 (class 826 OID 16680)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- TOC entry 2617 (class 826 OID 16637)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2616 (class 826 OID 16636)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2615 (class 826 OID 16635)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2609 (class 826 OID 16617)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2611 (class 826 OID 16616)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2610 (class 826 OID 16615)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2596 (class 826 OID 16490)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2597 (class 826 OID 16491)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2595 (class 826 OID 16489)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2599 (class 826 OID 16493)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2594 (class 826 OID 16488)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2598 (class 826 OID 16492)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2607 (class 826 OID 16607)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- TOC entry 2608 (class 826 OID 16608)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- TOC entry 2606 (class 826 OID 16606)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- TOC entry 2602 (class 826 OID 16545)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2601 (class 826 OID 16544)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2600 (class 826 OID 16543)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 3785 (class 3466 OID 16621)
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- TOC entry 3790 (class 3466 OID 16700)
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- TOC entry 3784 (class 3466 OID 16619)
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- TOC entry 3791 (class 3466 OID 16703)
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- TOC entry 3786 (class 3466 OID 16622)
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- TOC entry 3787 (class 3466 OID 16623)
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

-- Completed on 2025-11-24 23:51:21

--
-- PostgreSQL database dump complete
--

\unrestrict AlWIWnyb9iVW1MG0zlv0f3LDeJ0jb0JawdfN7LwA2BchpCdxOKxP0s4HntgPN3E

-- Completed on 2025-11-24 23:51:21

--
-- PostgreSQL database cluster dump complete
--

