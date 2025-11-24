-- 1) Esquema
create schema if not exists esquema_juegos;

---------------------------------------------------
-- 2) Usuarios
---------------------------------------------------
create table if not exists esquema_juegos.usuarios (
    id              bigserial primary key,
    firebase_uid    text unique,          -- opcional, si usás Firebase Auth
    email           text not null unique,
    nombre          text not null,
    apellido        text,
    es_admin        boolean not null default false,  -- para el guard de administrador
    fecha_registro  timestamptz not null default now()
);

---------------------------------------------------
-- 3) Catálogo de juegos (Ahorcado, Mayor/Menor, etc.)
---------------------------------------------------
create table if not exists esquema_juegos.juegos (
    id          smallserial primary key,
    codigo      text not null unique,     -- ej: 'ahorcado', 'mayor_menor', 'preguntados', 'juego_propio'
    nombre      text not null,
    descripcion text
);

---------------------------------------------------
-- 4) Encuestas
---------------------------------------------------

-- Cabecera de encuestas (podés tener más de una)
create table if not exists esquema_juegos.encuestas (
    id          bigserial primary key,
    titulo      text not null,
    descripcion text,
    activa      boolean not null default true,
    creada_en   timestamptz not null default now()
);

-- Preguntas de cada encuesta
create table if not exists esquema_juegos.preguntas_encuesta (
    id           bigserial primary key,
    encuesta_id  bigint not null references esquema_juegos.encuestas(id) on delete cascade,
    texto        text not null,
    tipo_control text,                    -- textbox, checkbox, radiobutton, etc.
    es_requerida boolean not null default true,
    orden        integer not null default 0
);

-- Opciones para preguntas de tipo radio/checkbox/select
create table if not exists esquema_juegos.opciones_pregunta (
    id           bigserial primary key,
    pregunta_id  bigint not null references esquema_juegos.preguntas_encuesta(id) on delete cascade,
    texto        text not null,
    valor        text not null,
    orden        integer not null default 0
);

-- Respuesta completa a una encuesta (nombre, edad, teléfono, etc.)
create table if not exists esquema_juegos.respuestas_encuesta (
    id              bigserial primary key,
    encuesta_id     bigint not null references esquema_juegos.encuestas(id) on delete cascade,
    usuario_id      bigint references esquema_juegos.usuarios(id) on delete set null,
    nombre_apellido text not null,
    edad            integer not null,
    telefono        text not null,
    completada_en   timestamptz not null default now(),
    constraint chk_edad_valida
        check (edad between 18 and 99),
    constraint chk_telefono_valido
        check (telefono ~ '^[0-9]{1,10}$')  -- solo números, hasta 10 caracteres
);

-- Respuestas por pregunta (detalle)
create table if not exists esquema_juegos.respuestas_pregunta (
    id                     bigserial primary key,
    respuesta_encuesta_id  bigint not null references esquema_juegos.respuestas_encuesta(id) on delete cascade,
    pregunta_id            bigint not null references esquema_juegos.preguntas_encuesta(id) on delete cascade,
    opcion_id              bigint references esquema_juegos.opciones_pregunta(id) on delete set null,
    valor_texto            text,          -- para respuestas abiertas
    constraint uq_respuesta unique (respuesta_encuesta_id, pregunta_id)
);

---------------------------------------------------
-- 5) Log de logins
---------------------------------------------------
create table if not exists esquema_juegos.log_logins (
    id            bigserial primary key,
    usuario_id    bigint not null references esquema_juegos.usuarios(id) on delete cascade,
    fecha_ingreso timestamptz not null default now(),
    exito         boolean not null default true,
    ip            text,
    user_agent    text
);

---------------------------------------------------
-- 6) Chat
---------------------------------------------------
create table if not exists esquema_juegos.mensajes_chat (
    id         bigserial primary key,
    usuario_id bigint not null references esquema_juegos.usuarios(id) on delete cascade,
    mensaje    text not null,
    enviado_en timestamptz not null default now()
);

---------------------------------------------------
-- 7) Resultados de los juegos / partidas
---------------------------------------------------
create table if not exists esquema_juegos.partidas (
    id            bigserial primary key,
    usuario_id    bigint not null references esquema_juegos.usuarios(id) on delete cascade,
    juego_id      smallint not null references esquema_juegos.juegos(id),
    puntaje       integer,                -- lo que guardás al finalizar el juego
    gano          boolean,                -- opcional, por si querés saber si ganó o perdió
    datos_extra   jsonb,                  -- info específica del juego (palabra, intentos, etc.)
    fecha_partida timestamptz not null default now()
);

---------------------------------------------------
-- 8) Datos iniciales de juegos (opcional pero útil)
---------------------------------------------------
insert into esquema_juegos.juegos (codigo, nombre, descripcion) values
('ahorcado',     'Ahorcado',       'Juego del ahorcado'),
('mayor_menor',  'Mayor o Menor',  'Cartas: adivinar si la siguiente es mayor o menor'),
('preguntados',  'Preguntados',    'Preguntas con imágenes de una API'),
('juego_propio', 'Juego propio',   'Tu juego personalizado')
on conflict (codigo) do nothing;

alter table esquema_juegos.usuarios
    rename column firebase_uid to supabase_uid;

alter table esquema_juegos.usuarios
    alter column supabase_uid type uuid
    using supabase_uid::uuid;

alter table esquema_juegos.usuarios
    alter column supabase_uid set not null;

alter table esquema_juegos.usuarios
    add constraint usuarios_supabase_uid_fkey
        foreign key (supabase_uid) references auth.users(id);
