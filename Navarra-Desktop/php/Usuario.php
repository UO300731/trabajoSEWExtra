<?php
require_once "db.php";

class Usuario {

    private $db;

    public function __construct() {
        $this->db = (new DB())->conn;
    }

    public function registrar($nombre, $email, $pass) {

        $hash = password_hash($pass, PASSWORD_DEFAULT);

        return $this->db->query(
            "INSERT INTO usuarios (nombre,email,password_hash)
             VALUES ('$nombre','$email','$hash')"
        );
    }

    public function login($email, $pass) {

        $res = $this->db->query(
            "SELECT * FROM usuarios WHERE email='$email'"
        );

        $user = $res->fetch_assoc();

        if ($user && password_verify($pass, $user['password_hash'])) {
            return $user;
        }

        return false;
    }
}