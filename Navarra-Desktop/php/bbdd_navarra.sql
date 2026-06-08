-- ============================================================
-- bbdd_navarra.sql
-- Base de datos para la central de reservas turísticas de Navarra
-- Usuario: DBUSER2026  |  Password: DBPWD2026
-- ============================================================

CREATE DATABASE IF NOT EXISTS UO300731_navarra_DB
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE UO300731_navarra_DB;

-- ------------------------------------------------------------
-- Tabla 1: tipos_recurso
-- Catálogo normalizado de tipos de recurso turístico
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tipos_recurso (
    id_tipo     INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(60)  NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    PRIMARY KEY (id_tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 2: recursos
-- Recursos turísticos reservables de Navarra
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recursos (
    id_recurso      INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    id_tipo         INT           UNSIGNED NOT NULL,
    nombre          VARCHAR(120)  NOT NULL,
    descripcion     TEXT          NOT NULL,
    plazas_totales  SMALLINT      UNSIGNED NOT NULL DEFAULT 20,
    fecha_inicio    DATETIME      NOT NULL,
    fecha_fin       DATETIME      NOT NULL,
    precio          DECIMAL(8,2)  UNSIGNED NOT NULL DEFAULT 0.00,
    activo          TINYINT(1)    NOT NULL DEFAULT 1,
    PRIMARY KEY (id_recurso),
    CONSTRAINT fk_recursos_tipo
        FOREIGN KEY (id_tipo) REFERENCES tipos_recurso(id_tipo)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 3: estados_reserva
-- Catálogo normalizado de estados posibles de una reserva
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS estados_reserva (
    id_estado   TINYINT     UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre      VARCHAR(30) NOT NULL,
    PRIMARY KEY (id_estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 4: usuarios
-- Registro de usuarios del sistema
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario      INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    nombre          VARCHAR(80)  NOT NULL,
    email           VARCHAR(180) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20)           DEFAULT NULL,
    fecha_registro  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario),
    UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabla 5: reservas
-- Reservas de recursos turísticos por parte de usuarios
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reservas (
    id_reserva      INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    id_usuario      INT          UNSIGNED NOT NULL,
    id_recurso      INT          UNSIGNED NOT NULL,
    id_estado       TINYINT      UNSIGNED NOT NULL DEFAULT 1,
    num_plazas      SMALLINT     UNSIGNED NOT NULL DEFAULT 1,
    precio_total    DECIMAL(10,2) NOT NULL,
    fecha_reserva   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_anulacion DATETIME              DEFAULT NULL,
    PRIMARY KEY (id_reserva),
    CONSTRAINT fk_reservas_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reservas_recurso
        FOREIGN KEY (id_recurso) REFERENCES recursos(id_recurso)
        ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_reservas_estado
        FOREIGN KEY (id_estado) REFERENCES estados_reserva(id_estado)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- DATOS INICIALES
-- ============================================================

INSERT INTO tipos_recurso (id_tipo, nombre, descripcion) VALUES
(1, 'Museo',        'Museos y centros de interpretación cultural'),
(2, 'Ruta',         'Rutas turísticas guiadas a pie o en bicicleta'),
(3, 'Restaurante',  'Experiencias gastronómicas y cenas temáticas'),
(4, 'Hotel',        'Alojamiento turístico con servicios incluidos'),
(5, 'Espectáculo',  'Eventos culturales, festivales y actuaciones');

INSERT INTO estados_reserva (id_estado, nombre) VALUES
(1, 'Pendiente'),
(2, 'Confirmada'),
(3, 'Anulada');

INSERT INTO recursos
    (id_recurso, id_tipo, nombre, descripcion, plazas_totales,
     fecha_inicio, fecha_fin, precio, activo)
VALUES
(1, 1, 'Museo de Navarra',
 'Visita guiada al Museo de Navarra en Pamplona, con colecciones de arqueología, arte medieval y pintura.',
 30, '2026-07-01 10:00:00', '2026-12-31 18:00:00', 8.00, 1),

(2, 2, 'Ruta del Camino Francés',
 'Etapa guiada del Camino de Santiago a su paso por Navarra, desde Roncesvalles hasta Pamplona.',
 20, '2026-06-01 08:00:00', '2026-10-31 20:00:00', 15.00, 1),

(3, 3, 'Cena de pintxos en el Casco Viejo',
 'Recorrido gastronómico nocturno por los mejores bares de pintxos del casco antiguo de Pamplona.',
 15, '2026-06-15 20:00:00', '2026-12-31 23:59:00', 35.00, 1),

(4, 4, 'Parador de Olite',
 'Noche en el Parador Nacional del Castillo de Olite con desayuno incluido y visita al castillo medieval.',
 10, '2026-07-15 14:00:00', '2026-12-31 12:00:00', 120.00, 1),

(5, 5, 'Sanfermines — Encierro y Fiestas',
 'Pack de actividades durante los Sanfermines: tribuna para el encierro, entrada a la plaza y visita cultural.',
 50, '2026-07-06 06:00:00', '2026-07-14 23:59:00', 75.00, 1),

(6, 2, 'Ruta por las Bardenas Reales',
 'Excursión en 4x4 por el parque natural de las Bardenas Reales, Patrimonio de la Biosfera de la UNESCO.',
 12, '2026-05-01 09:00:00', '2026-10-31 19:00:00', 45.00, 1),

(7, 1, 'Ciudadela de Pamplona',
 'Visita guiada a la ciudadela renacentista de Pamplona, una de las mejor conservadas de Europa.',
 25, '2026-04-01 10:00:00', '2026-11-30 17:00:00', 5.00, 1);
