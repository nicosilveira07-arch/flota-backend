--
-- PostgreSQL database dump
--

\restrict QDbo6saTYXXrGQ8iYeK2EZXOlUZv1ZI112Q46w3dVrRYETzo9dq4BxAmqbgmoxZ

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: historial_vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historial_vehiculos (
    id integer NOT NULL,
    vehiculo_id integer,
    usuario_id integer,
    usuario text,
    accion text NOT NULL,
    observacion text,
    km_salida integer,
    km_llegada integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.historial_vehiculos OWNER TO postgres;

--
-- Name: historial_vehiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historial_vehiculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_vehiculos_id_seq OWNER TO postgres;

--
-- Name: historial_vehiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historial_vehiculos_id_seq OWNED BY public.historial_vehiculos.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificaciones (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    mensaje text NOT NULL,
    leida boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.notificaciones OWNER TO postgres;

--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_seq OWNER TO postgres;

--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: operativos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.operativos (
    id integer NOT NULL,
    vehiculo_id integer,
    usuario_id integer,
    km_salida integer,
    km_llegada integer,
    destino character varying(255),
    observaciones_salida text,
    observaciones_llegada text,
    fecha_salida timestamp without time zone,
    fecha_llegada timestamp without time zone,
    estado character varying(20)
);


ALTER TABLE public.operativos OWNER TO postgres;

--
-- Name: operativos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.operativos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.operativos_id_seq OWNER TO postgres;

--
-- Name: operativos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.operativos_id_seq OWNED BY public.operativos.id;


--
-- Name: reservas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas (
    id integer NOT NULL,
    vehiculo_id integer,
    usuario_id integer,
    fecha date,
    hora_desde time without time zone,
    hora_hasta time without time zone,
    motivo text,
    estado character varying(20),
    motivo_rechazo text,
    aprobado_por integer,
    created_at timestamp without time zone DEFAULT now(),
    rechazado_por integer,
    fecha_inicio timestamp without time zone,
    fecha_fin timestamp without time zone
);


ALTER TABLE public.reservas OWNER TO postgres;

--
-- Name: reservas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_id_seq OWNER TO postgres;

--
-- Name: reservas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reservas_id_seq OWNED BY public.reservas.id;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100),
    email character varying(100),
    password character varying(255),
    rol character varying(20),
    activo boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    apellido character varying(100),
    cedula integer,
    foto text
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: vehiculos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehiculos (
    id integer NOT NULL,
    matricula character varying(20),
    marca character varying(50),
    modelo character varying(50),
    anio integer,
    km_actual integer,
    estado character varying(20),
    observaciones text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    tipo character varying(50),
    imagen text,
    motivo_radiado text
);


ALTER TABLE public.vehiculos OWNER TO postgres;

--
-- Name: vehiculos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehiculos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehiculos_id_seq OWNER TO postgres;

--
-- Name: vehiculos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehiculos_id_seq OWNED BY public.vehiculos.id;


--
-- Name: historial_vehiculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_vehiculos ALTER COLUMN id SET DEFAULT nextval('public.historial_vehiculos_id_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: operativos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operativos ALTER COLUMN id SET DEFAULT nextval('public.operativos_id_seq'::regclass);


--
-- Name: reservas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas ALTER COLUMN id SET DEFAULT nextval('public.reservas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Name: vehiculos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos ALTER COLUMN id SET DEFAULT nextval('public.vehiculos_id_seq'::regclass);


--
-- Data for Name: historial_vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historial_vehiculos (id, vehiculo_id, usuario_id, usuario, accion, observacion, km_salida, km_llegada, created_at) FROM stdin;
195	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 12:29:21.261727
196	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:29:25.189985
197	20	26	PAMELA	RESERVA_PENDIENTE	Reserva creada (2026-05-30 14:33-18:37)	\N	\N	2026-05-30 12:31:08.383349
198	20	25	Diego	RESERVA_RECHAZADA	scxasd	\N	\N	2026-05-30 12:31:59.815212
199	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 12:32:22.219904
200	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:32:25.09879
201	22	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 12:32:28.896935
202	22	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:32:32.275059
203	20	26	PAMELA	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 12:33:02.505561
204	20	26	PAMELA	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:33:04.628638
205	20	23	Nicolás	RESERVA_PENDIENTE	Reserva creada (2026-05-30 18:57-21:51)	\N	\N	2026-05-30 12:51:34.696534
206	20	23	Nicolás	RESERVA_RECHAZADA	prueba	\N	\N	2026-05-30 12:52:05.701351
207	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 12:58:14.243815
208	24	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | asd	\N	\N	2026-05-30 12:58:26.360489
209	24	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:58:30.058136
210	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:58:31.075476
211	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | asd	\N	\N	2026-05-30 12:58:37.923246
212	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 12:58:41.370863
213	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 13:01:33.880425
214	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 13:01:38.317579
215	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 13:07:25.144326
216	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 13:07:34.264616
217	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 13:07:38.044649
218	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 13:07:48.504167
221	29	23	Nicolás	CREADO	Vehículo creado	\N	\N	2026-05-30 14:59:33.232047
222	29	23	Nicolás	OPERATIVO_INICIADO	Destino: Villa | KM salida: 1 | otros	\N	\N	2026-05-30 15:00:31.876289
223	29	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 15:00:45.306928
224	20	23	Nicolás	OPERATIVO_INICIADO	Destino: villa | KM salida: 1 | 	\N	\N	2026-05-30 15:02:19.470594
225	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 15:02:22.675906
226	20	23	Nicolás	OPERATIVO_INICIADO	Destino: asd | KM salida: 1 | 	\N	\N	2026-05-30 15:04:45.693219
227	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 15:04:48.575218
228	20	23	Nicolás	OPERATIVO_INICIADO	Destino: sd | KM salida: 1 | 	\N	\N	2026-05-30 18:24:45.30733
229	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 18:24:48.095531
232	20	23	Nicolás	OPERATIVO_INICIADO	Destino: x | KM salida: 1 | asd	\N	\N	2026-05-30 19:18:19.295452
233	20	23	Nicolás	OPERATIVO_FINALIZADO	KM llegada: 1	\N	\N	2026-05-30 19:18:22.966537
\.


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificaciones (id, usuario_id, mensaje, leida, created_at) FROM stdin;
\.


--
-- Data for Name: operativos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.operativos (id, vehiculo_id, usuario_id, km_salida, km_llegada, destino, observaciones_salida, observaciones_llegada, fecha_salida, fecha_llegada, estado) FROM stdin;
32	29	23	1	1	Villa	\N	\N	2026-05-30 15:00:31.857264	2026-05-30 15:00:45.305507	FINALIZADO
33	20	23	1	1	villa	\N	\N	2026-05-30 15:02:19.464335	2026-05-30 15:02:22.674287	FINALIZADO
34	20	23	1	1	asd	\N	\N	2026-05-30 15:04:45.689931	2026-05-30 15:04:48.57069	FINALIZADO
35	20	23	1	1	sd	\N	\N	2026-05-30 18:24:45.294616	2026-05-30 18:24:48.093977	FINALIZADO
36	20	23	1	1	x	\N	asd	2026-05-30 19:18:19.289555	2026-05-30 19:18:22.964839	FINALIZADO
22	20	23	1	1	asd	\N	asd	2026-05-30 12:29:21.244495	2026-05-30 12:29:25.18745	FINALIZADO
23	20	23	1	1	asd	\N	\N	2026-05-30 12:32:22.215131	2026-05-30 12:32:25.097235	FINALIZADO
24	22	23	1	1	asd	\N	das	2026-05-30 12:32:28.895368	2026-05-30 12:32:32.270426	FINALIZADO
27	24	23	1	1	asd	\N	\N	2026-05-30 12:58:26.356115	2026-05-30 12:58:30.053649	FINALIZADO
26	20	23	1	1	asd	\N	\N	2026-05-30 12:58:14.236693	2026-05-30 12:58:31.073845	FINALIZADO
28	20	23	1	1	asd	\N	as	2026-05-30 12:58:37.918855	2026-05-30 12:58:41.369381	FINALIZADO
29	20	23	1	1	asd	\N	a	2026-05-30 13:01:33.877085	2026-05-30 13:01:38.315703	FINALIZADO
30	20	23	1	1	asd	\N	\N	2026-05-30 13:07:25.137337	2026-05-30 13:07:34.260138	FINALIZADO
31	20	23	1	1	asd	\N	\N	2026-05-30 13:07:38.039998	2026-05-30 13:07:48.502558	FINALIZADO
\.


--
-- Data for Name: reservas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas (id, vehiculo_id, usuario_id, fecha, hora_desde, hora_hasta, motivo, estado, motivo_rechazo, aprobado_por, created_at, rechazado_por, fecha_inicio, fecha_fin) FROM stdin;
41	20	23	2026-05-30	18:57:00	21:51:00	or de	RECHAZADA	prueba	\N	2026-05-30 12:51:34.67317	23	\N	\N
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nombre, email, password, rol, activo, created_at, apellido, cedula, foto) FROM stdin;
25	Diego	\N	$2b$10$8ETLsTxBzKVLIw.C1kwpreDcYfu6VNCTHkLVdOP1QR40r2g86uMvq	pistero	t	2026-05-26 15:31:56.664763	Mores	12345678	\N
28	Root	root@system.com	$2b$10$gw4G5B1s2IzvKoe9TJSSgeWT1NMVi0GgRRhlic5hQ4UwncabSTlDK	administrador	t	2026-05-30 19:17:20.949416	System	123456789	\N
23	Nicolás	\N	$2b$10$g19rl8GAk3rudZaLh5TyT.KIk3YUM6P4smIvnsZ8.0k.vzKdK/DfS	ingeniero	t	2026-05-26 15:22:22.622091	SILVEIRA	51436444	\N
\.


--
-- Data for Name: vehiculos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehiculos (id, matricula, marca, modelo, anio, km_actual, estado, observaciones, created_at, tipo, imagen, motivo_radiado) FROM stdin;
29	MIN2452	kawasaki	kx125	2020	1	LIBRE	\N	2026-05-30 14:59:33.229951	MOTO	http://localhost:4000/uploads/vehiculos/1780167407452.webp	\N
20	ABC1234	Toyota	Hilux	2022	1	LIBRE	\N	2026-05-23 13:45:40.421935	CAMIONETA	http://localhost:4000/uploads/vehiculos/1780167728673.jpg	\N
22	ABC1234	HONDA	CIVIC	2024	1	LIBRE	\N	2026-05-24 21:47:46.612613	AUTO	https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEiXBU_WngdwuoCz4z3htMl-MXZlHFKJYgS5peqSJ5gFfFeCXYrX5paFqUq6HF4Z0T3jdC0YWBkkVIvMs8-7SlkPR-I7ohb-wecvzA2CWuWWkMUimCArGtuQOIxSZiunZU8A1eGf_PjT7vw/s640/Honda-Civic-2017-Uruguay+%25287%2529.jpg	\N
24	SBA1111	HONDA	TORNADO	2020	1	LIBRE	\N	2026-05-25 06:44:25.638909	MOTO	https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Honda_Tornado.jpg/960px-Honda_Tornado.jpg	\N
\.


--
-- Name: historial_vehiculos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historial_vehiculos_id_seq', 233, true);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 22, true);


--
-- Name: operativos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.operativos_id_seq', 36, true);


--
-- Name: reservas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_id_seq', 41, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 28, true);


--
-- Name: vehiculos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehiculos_id_seq', 30, true);


--
-- Name: historial_vehiculos historial_vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_vehiculos
    ADD CONSTRAINT historial_vehiculos_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: operativos operativos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operativos
    ADD CONSTRAINT operativos_pkey PRIMARY KEY (id);


--
-- Name: reservas reservas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: vehiculos vehiculos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehiculos
    ADD CONSTRAINT vehiculos_pkey PRIMARY KEY (id);


--
-- Name: historial_vehiculos historial_vehiculos_vehiculo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historial_vehiculos
    ADD CONSTRAINT historial_vehiculos_vehiculo_id_fkey FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos(id) ON DELETE CASCADE;


--
-- Name: notificaciones notificaciones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: operativos operativos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operativos
    ADD CONSTRAINT operativos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: operativos operativos_vehiculo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.operativos
    ADD CONSTRAINT operativos_vehiculo_id_fkey FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos(id);


--
-- Name: reservas reservas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: reservas reservas_vehiculo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas
    ADD CONSTRAINT reservas_vehiculo_id_fkey FOREIGN KEY (vehiculo_id) REFERENCES public.vehiculos(id);


--
-- PostgreSQL database dump complete
--

\unrestrict QDbo6saTYXXrGQ8iYeK2EZXOlUZv1ZI112Q46w3dVrRYETzo9dq4BxAmqbgmoxZ

