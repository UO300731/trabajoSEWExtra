<?php

class DB {
    public $conn;

    public function __construct() {

        $this->conn = new mysqli(
            "localhost",
            "DBUSER2026",
            "DBPWD2026",
            "UO300731_navarra_DB"
        );

        if ($this->conn->connect_error) {
            die("Error conexión: " . $this->conn->connect_error);
        }

        $this->conn->set_charset("utf8mb4");
    }
}