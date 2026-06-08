<?php

class DB {

    public $conn;
    private $dbname = "UO300731_navarra_DB";

    public function __construct() {

        $this->conn = new mysqli(
            "localhost",
            "DBUSER2026",
            "DBPWD2026"
        );

        if ($this->conn->connect_error) {
            die("Error conexión: " . $this->conn->connect_error);
        }

        $this->conn->set_charset("utf8mb4");

        if (!$this->existeBaseDatos()) {
            $this->crearBaseDatos();
        }

        $this->conn->select_db($this->dbname);
    }

    private function existeBaseDatos() {

        $result = $this->conn->query(
            "SHOW DATABASES LIKE '{$this->dbname}'"
        );

        return $result->num_rows > 0;
    }

    private function crearBaseDatos() {

		$sql = file_get_contents(__DIR__ . "/bbdd_navarra.sql");
		if ($sql === false) {
			die("No se pudo leer el archivo SQL");
		}

		if (!$this->conn->multi_query($sql)) {
			die("Error SQL: " . $this->conn->error);
		}

		do {
			if ($result = $this->conn->store_result()) {
				$result->free();
			}
		} while ($this->conn->more_results() && $this->conn->next_result());

		require_once __DIR__ . "/importar.php";
}
}