<?php

require "db.php";
$db = (new DB())->conn;

function importar($db, $tabla, $file) {

    $f = fopen($file, "r");
    fgetcsv($f);

    while ($row = fgetcsv($f)) {

        $row = array_map([$db, "real_escape_string"], $row);

        $sql = "INSERT INTO $tabla VALUES ('" . implode("','", $row) . "')";
        $db->query($sql);
    }

    fclose($f);
}

importar($db,"tipos_recurso","datos/tipos.csv");
importar($db,"estados_reserva","datos/estados.csv");
importar($db,"recursos","datos/recursos.csv");
importar($db,"usuarios","datos/usuarios.csv");
importar($db,"reservas","datos/reservas.csv");

echo "OK IMPORT";