-- Registra los cuatro juegos nuevos para que se puedan guardar sus partidas.
insert into esquema_juegos.juegos (codigo, nombre, descripcion) values
  ('gemelos', 'Gemelos', 'Bloques del mismo color que se eliminan al tocarse por un lado, con gravedad y giro del tablero'),
  ('cerrar_circuito', 'Cerrar el Circuito', 'Girar cables para llevar la energía de la batería a todas las bombillas'),
  ('tangram', 'Tangram', 'Cubrir la silueta con las 7 piezas clásicas'),
  ('anillos', 'Anillos', 'Girar anillos enganchados para que caigan todos menos los dorados');
