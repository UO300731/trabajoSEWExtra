<?php

require_once "db.php";

class Recurso {

    private $db;

    public function __construct() {
        $this->db = (new DB())->conn;
    }

    public function getAll() {

        $sql = "
            SELECT r.*, t.nombre AS tipo
            FROM recursos r
            INNER JOIN tipos_recurso t ON t.id_tipo = r.id_tipo
        ";

        return $this->db->query($sql)->fetch_all(MYSQLI_ASSOC);
    }

    public function getById($id) {

        $sql = "
            SELECT *
            FROM recursos
            WHERE id_recurso = $id
        ";

        return $this->db->query($sql)->fetch_assoc();
    }

    public function getPlazas($id) {

        $sql = "
            SELECT plazas_totales
            FROM recursos
            WHERE id_recurso = $id
        ";

        return (int)$this->db->query($sql)->fetch_assoc()['plazas_totales'];
    }
}