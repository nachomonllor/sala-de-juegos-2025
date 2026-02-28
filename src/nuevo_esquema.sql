-- 1) Esquema
create schema if not exists esquema_juegos;

---------------------------------------------------
-- 2) Usuarios
---------------------------------------------------
create table if not exists esquema_juegos.usuarios (
    id              bigserial primary key,
    supabase_uid    uuid not null unique,          -- UUID de Supabase Auth (FK a auth.users)
    email           text not null unique,
    nombre          text not null,
    apellido        text,
    fecha_nacimiento date,                          -- fecha de nacimiento del usuario
    es_admin        boolean not null default false,  -- para el guard de administrador
    fecha_registro  timestamptz not null default now(),
    constraint usuarios_supabase_uid_fkey
        foreign key (supabase_uid) references auth.users(id)
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
    id          bigserial primary key,
    usuario_id  bigint not null references esquema_juegos.usuarios(id) on delete cascade,
    room        text not null default 'global',  -- sala de chat (global, privada, etc.)
    mensaje     text not null,
    display_name text,                           -- nombre visible del usuario
    enviado_en  timestamptz not null default now()
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
('preguntados_dbz', 'Preguntados DBZ', 'Preguntas sobre personajes de Dragon Ball Z'),
('flow_free',    'Flow Free',      'Conectar pares de colores en un tablero'),
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


-- 1. Creamos la tabla ping_keep_alive en esquema_juegos
create table if not exists esquema_juegos.ping_keep_alive (
    id integer primary key default 1,
    ultimo_ping timestamptz not null default now(),
    origen text default 'App Sala de Juegos'
);

-- 2. Insertamos la fila inicial (el UPSERT posterior actualizará esta misma fila)
insert into esquema_juegos.ping_keep_alive (id, ultimo_ping, origen) 
values (1, now(), 'Inicialización Sala de Juegos')
on conflict (id) do nothing;


------------------------------------------------------------------------------------------------------------------------------------------
-------------------------- Tabla de conceptos de biología para el juego de preguntas (opcional,
---------- pero puede ser útil para el juego de preguntados_dbz o uno propio) --------------------------
------------------------------------------------------------------------------------------------------------------------------------------

-- Creamos la tabla
create table if not exists esquema_juegos.conceptos_biologia (
  id bigserial primary key,
  codigo text unique not null,
  concepto text not null,
  definicion text not null,
  unidad text
);

-- Insertamos los 25 conceptos iniciales
insert into esquema_juegos.conceptos_biologia (codigo, concepto, definicion, unidad) values
('metodo_cientifico', 'Método Científico', 'Procedimiento riguroso y lógico utilizado para construir conocimiento, basado en la observación, formulación de hipótesis y experimentación.', 'Unidad 1'),
('teo_endosimbiotica', 'Teoría Endosimbiótica', 'Explica el origen evolutivo de mitocondrias y cloroplastos a partir de bacterias procariontes fagocitadas.', 'Unidad 1'),
('carbohidratos', 'Carbohidratos', 'Macromoléculas orgánicas que actúan como la principal fuente de energía inmediata y estructura celular.', 'Unidad 1'),
('celula_eucarionte', 'Célula Eucarionte', 'Tipo de célula que posee un núcleo verdadero delimitado por una envoltura y organelas membranosas.', 'Unidad 2'),
('transporte_activo', 'Transporte Activo', 'Movimiento de sustancias a través de la membrana celular en contra de su gradiente de concentración, con gasto de energía.', 'Unidad 2'),
('enzimas', 'Enzimas', 'Proteínas que actúan como catalizadores biológicos, acelerando la velocidad de las reacciones metabólicas.', 'Unidad 2'),
('fotosintesis', 'Fotosíntesis', 'Proceso anabólico donde la energía lumínica se convierte en energía química, fijando el carbono inorgánico.', 'Unidad 2'),
('dogma_central', 'Dogma Central', 'Flujo de la información genética: el ADN se transcribe a ARN, y este se traduce a proteínas.', 'Unidad 3'),
('alelo', 'Alelo', 'Cada una de las formas alternativas que puede tener un gen y que ocupan el mismo locus en cromosomas homólogos.', 'Unidad 3'),
('meiosis', 'Meiosis', 'División celular reductiva que genera cuatro células hijas haploides, fundamental para la reproducción sexual.', 'Unidad 3'),
('pleiotropismo', 'Pleiotropismo', 'Fenómeno genético donde la expresión de un solo gen afecta múltiples rasgos fenotípicos aparentemente no relacionados.', 'Unidad 3'),
('leyes_mendel', 'Leyes de Mendel', 'Principios básicos de la herencia que describen la segregación y distribución independiente de los factores hereditarios.', 'Unidad 3'),
('deriva_genica', 'Deriva Génica', 'Fuerza evolutiva que produce cambios aleatorios en las frecuencias alélicas de una población, especialmente si es pequeña.', 'Unidad 4'),
('especiacion', 'Especiación', 'Proceso macroevolutivo mediante el cual una población original se divide y da lugar a nuevas especies reproductivamente aisladas.', 'Unidad 4'),
('mutacion', 'Mutación', 'Cambio permanente y heredable en la secuencia del ADN, siendo la fuente primaria de variabilidad genética.', 'Unidad 4'),
('seleccion_natural', 'Selección Natural', 'Mecanismo evolutivo donde los individuos con características más favorables tienen mayor éxito reproductivo y supervivencia.', 'Unidad 4'),
('sistema_binomial', 'Sistema Binomial', 'Nomenclatura taxonómica que designa a cada especie con dos nombres en latín: género y epíteto específico.', 'Unidad 5'),
('dominio_archaea', 'Dominio Archaea', 'Grupo de microorganismos procariontes, muchos de ellos extremófilos, con diferencias bioquímicas profundas respecto a las bacterias.', 'Unidad 5'),
('reino_fungi', 'Reino Fungi', 'Organismos eucariontes heterótrofos con pared celular de quitina, que se alimentan por absorción.', 'Unidad 5'),
('nicho_ecologico', 'Nicho Ecológico', 'El papel funcional que desempeña una especie dentro de su comunidad, incluyendo uso de recursos y tolerancias.', 'Unidad 6'),
('sucesion_ecologica', 'Sucesión Ecológica', 'Proceso de cambio direccional y gradual en la estructura de la comunidad a lo largo del tiempo temporal tras una perturbación.', 'Unidad 6'),
('red_trofica', 'Red Trófica', 'Conjunto interconectado de cadenas alimentarias que muestra cómo fluye la energía en un ecosistema.', 'Unidad 6'),
('bioma', 'Bioma', 'Gran región ecológica caracterizada por su clima, flora y fauna dominantes.', 'Unidad 6'),
('efecto_invernadero', 'Efecto Invernadero', 'Retención del calor en la atmósfera debido a gases que absorben radiación infrarroja, exacerbado por la actividad humana.', 'Unidad 6'),
('ciclos_biogeoquimicos', 'Ciclos Biogeoquímicos', 'Rutas circulares a través de las cuales elementos como el carbono o el nitrógeno se mueven entre los componentes bióticos y abióticos.', 'Unidad 6')
on conflict (codigo) do nothing;



----------------------------------------------------------------
----------------------------------------------------------------
----------------------------------------------------------------


insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('water_sort', 'Water Sort', 'Juego lógico de clasificar líquidos fluorescentes en tubos de ensayo')
on conflict (codigo) do nothing;


select * from esquema_juegos.juegos;

insert into esquema_juegos.juegos (codigo, nombre, descripcion) values ('pacman', 'Pac-Man Neon', 'Clásico juego arcade reconstruido en Angular') on conflict (codigo) do nothing;

commit;

insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('pacman', 'Pac-Man Neon', 'Clásico juego arcade reconstruido en Angular') 
on conflict (codigo) do nothing;


insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('snake', 'Snake Neon', 'El clásico juego de la serpiente con un toque retro-futurista.') 
on conflict (codigo) do nothing;

SELECT * FROM esquema_juegos.juegos;

insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('hanoi', 'Hanói Neon', 'Rompecabezas lógico de anillos apilables') 
on conflict (codigo) do nothing;

insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('nature_park', 'Nature Park', 'Prototipo del clásico Match-3 de bloques cayendo') 
on conflict (codigo) do nothing;

insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('mastermind', 'Hack-O-Matic', 'Juego de deducción lógica estilo Mastermind con temática Cyber-Neon') 
on conflict (codigo) do nothing;


insert into esquema_juegos.juegos (codigo, nombre, descripcion) 
values ('tetris', 'Auto-Tetris IA', 'Simulación de Tetris jugada por un algoritmo heurístico') 
on conflict (codigo) do nothing;
