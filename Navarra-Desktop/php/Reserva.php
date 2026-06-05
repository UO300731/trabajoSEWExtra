<?php

require_once "db.php";
require_once "Recurso.php";

class Reserva {

    private $db;

    public function __construct() {
        $this->db = (new DB())->conn;
    }

    /* =========================
       PLAZAS OCUPADAS
    ========================== */
    public function plazasOcupadas($id_recurso) {

        $sql = "
            SELECT COALESCE(SUM(num_plazas),0) AS ocupadas
            FROM reservas
            WHERE id_recurso = $id_recurso
            AND id_estado <> 3
        ";

        return (int)$this->db->query($sql)->fetch_assoc()['ocupadas'];
    }

    /* =========================
       PLAZAS TOTALES
    ========================== */
    public function plazasTotales($id_recurso) {

        $sql = "
            SELECT plazas_totales
            FROM recursos
            WHERE id_recurso = $id_recurso
        ";

        return (int)$this->db->query($sql)->fetch_assoc()['plazas_totales'];
    }

    /* =========================
       PLAZAS LIBRES
    ========================== */
    public function plazasLibres($id_recurso) {

        return $this->plazasTotales($id_recurso)
             - $this->plazasOcupadas($id_recurso);
    }

    /* =========================
       CREAR RESERVA (CON CONTROL REAL)
    ========================== */
    public function crear($id_usuario, $id_recurso, $num_plazas, $precio_unitario) {

        $libres = $this->plazasLibres($id_recurso);

        if ($num_plazas > $libres) {
            return false;
        }

        $precio_total = $num_plazas * $precio_unitario;

        $sql = "
            INSERT INTO reservas
            (id_usuario, id_recurso, id_estado, num_plazas, precio_total)
            VALUES
            ($id_usuario, $id_recurso, 1, $num_plazas, $precio_total)
        ";

        return $this->db->query($sql);
    }

    /* =========================
       RESERVAS POR USUARIO
    ========================== */
    public function getByUser($id_usuario) {

        $sql = "
    SELECT r.id_reserva,
           r.num_plazas,
           r.precio_total,
           r.id_estado,
           e.nombre AS estado,
           re.nombre AS nombre_recurso
    FROM reservas r
    INNER JOIN recursos re ON re.id_recurso = r.id_recurso
    INNER JOIN estados_reserva e ON e.id_estado = r.id_estado
    WHERE r.id_usuario = $id_usuario
";

        return $this->db->query($sql)->fetch_all(MYSQLI_ASSOC);
    }

    /* =========================
       ANULAR
    ========================== */
    public function anular($id_reserva) {

        $sql = "
            UPDATE reservas
            SET id_estado = 3,
                fecha_anulacion = NOW()
            WHERE id_reserva = $id_reserva
        ";

        return $this->db->query($sql);
    }
}