<?php
require_once "db.php";
class Usuario {
    private $db;
    public function __construct() {
        $this->db = (new DB())->conn;
    }
    public function registrar($nombre, $email, $pass) {
        $hash = password_hash($pass, PASSWORD_DEFAULT);
        try {
            return $this->db->query(
                "INSERT INTO usuarios (nombre,email,password_hash)
                 VALUES ('$nombre','$email','$hash')"
            );
        } catch (mysqli_sql_exception $e) {
            if ($e->getCode() === 1062) {
                return false;
            }
            throw $e;
        }
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