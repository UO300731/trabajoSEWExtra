<?php
session_start();

require_once "php/db.php";
require_once "php/Recurso.php";
require_once "php/Usuario.php";
require_once "php/Reserva.php";

$accion = $_GET['accion'] ?? '';

$recurso = new Recurso();
$usuario = new Usuario();
$reserva = new Reserva();

function userId() {
    return $_SESSION['user']['id_usuario'] ?? $_SESSION['user']['id'] ?? null;
}
?>

<!DOCTYPE HTML>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <title>Reservas</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="estilo/estilo.css">
    <link rel="stylesheet" href="estilo/layout.css">
</head>

<body>

<header>

    <h1><a href="index.html">Navarra Turismo</a></h1>

    <nav>
        <a href="index.html">Inicio</a>
        <a href="gastronomia.html">Gastronomía</a>
        <a href="rutas.html">Rutas</a>
        <a href="meteorologia.html">Meteorología</a>
        <a href="juego.html">Juego</a>
        <a href="reservas.php">Reservas</a>
        <a href="ayuda.html">Ayuda</a>
    </nav>

</header>

<main>

<section aria-label="Sesión de usuario">
    <nav>
        <ul>
            <?php if (!isset($_SESSION['user'])): ?>
                <li><a href="reservas.php?accion=login">Login</a></li>
                <li><a href="reservas.php?accion=registro">Registro</a></li>
            <?php else: ?>
                <li><span>Hola, <?= htmlspecialchars($_SESSION['user']['nombre']) ?></span></li>
                <li><a href="reservas.php?accion=mis">Mis reservas</a></li>
                <li><a href="reservas.php?accion=logout">Salir</a></li>
            <?php endif; ?>
        </ul>
    </nav>
</section>

<?php
/*  LOGOUT */
if ($accion === "logout") {
    session_destroy();
    header("Location: reservas.php");
    exit;
}

/* REGISTRO*/
if ($accion === "registro") {

    if ($_POST) {
        $ok = $usuario->registrar($_POST['nombre'], $_POST['email'], $_POST['pass']);
        echo $ok ? "<p>Usuario creado correctamente</p>" : "<p>Error en registro</p>";
    }
?>

<section>
    <h2>Registro</h2>

    <form method="post">
        <p><label>Nombre <input name="nombre" required></label></p>
        <p><label>Email <input name="email" type="email" required></label></p>
        <p><label>Password <input name="pass" type="password" required></label></p>
        <p><button>Registrar</button></p>
    </form>

    <p><a href="reservas.php">Volver</a></p>
</section>

<?php } ?>

<?php
/* LOGIN  */
if ($accion === "login") {

    if ($_POST) {
        $user = $usuario->login($_POST['email'], $_POST['pass']);

        if ($user) {
            $_SESSION['user'] = $user;
            header("Location: reservas.php");
            exit;
        } else {
            echo "<p>Login incorrecto</p>";
        }
    }
?>

<section>
    <h2>Login</h2>

    <form method="post">
        <p><label>Email <input name="email" type="email" required></label></p>
        <p><label>Password <input name="pass" type="password" required></label></p>
        <p><button>Entrar</button></p>
    </form>

    <p><a href="reservas.php">Volver</a></p>
</section>

<?php } ?>

<?php
/* MIS RESERVAS  */
if ($accion === "mis") {

    if (!isset($_SESSION['user'])) {
        header("Location: reservas.php?accion=login");
        exit;
    }

    $res = $reserva->getByUser(userId());
?>

<section>
    <h2>Mis reservas</h2>

    <?php foreach ($res as $r): ?>
        <article>
            <h3><?= htmlspecialchars($r['nombre_recurso']) ?></h3>

            <p>Plazas: <?= $r['num_plazas'] ?></p>
            <p>Total: <?= $r['precio_total'] ?> €</p>

            <p>Estado: <?= htmlspecialchars($r['estado'] ?? 'Activo') ?></p>

            <?php if ($r['id_estado'] != 3): ?>
                <p>
                    <a href="reservas.php?accion=anular&id=<?= $r['id_reserva'] ?>">
                        Anular
                    </a>
                </p>
            <?php else: ?>
                <p><strong>RESERVA ANULADA</strong></p>
            <?php endif; ?>
        </article>
    <?php endforeach; ?>

    <p><a href="reservas.php">Volver</a></p>
</section>

<?php } ?>

<?php
/* ANULAR */
if ($accion === "anular") {

    if (isset($_GET['id'])) {
        $reserva->anular($_GET['id']);
    }

    header("Location: reservas.php?accion=mis");
    exit;
}
?>

<?php
/*  RESERVAR  */
if ($accion === "reservar") {

    if (!isset($_SESSION['user'])) {
        header("Location: reservas.php?accion=login");
        exit;
    }

    $id = $_GET['id'] ?? null;
    $rec = $recurso->getById($id);

    $mensaje = "";

    if ($_POST) {

        $ok = $reserva->crear(
            userId(),
            $id,
            $_POST['plazas'],
            $rec['precio']
        );

        if ($ok) {
            header("Location: reservas.php?accion=mis");
            exit;
        } else {
            $mensaje = "No hay plazas suficientes";
        }
    }
?>

<section>
    <h2>Reservar recurso</h2>

    <p><?= htmlspecialchars($rec['nombre']) ?></p>
    <p><?= htmlspecialchars($rec['descripcion']) ?></p>

    <p>Fecha inicio: <?= htmlspecialchars($rec['fecha_inicio']) ?></p>
    <p>Fecha fin: <?= htmlspecialchars($rec['fecha_fin']) ?></p>

    <p>Precio: <?= $rec['precio'] ?> €</p>

    <p>Plazas libres: <?= $reserva->plazasLibres($id) ?></p>

    <?php if ($mensaje): ?>
        <p><strong><?= $mensaje ?></strong></p>
    <?php endif; ?>

    <form method="post">
        <p><label>Plazas <input type="number" name="plazas" min="1" required></label></p>
        <p><button>Confirmar</button></p>
    </form>

    <p><a href="reservas.php">Volver</a></p>
</section>

<?php } ?>

<?php
/* LISTADO*/
if ($accion === "") {

    $recursos = $recurso->getAll();
?>

<section>
    <h2>Recursos turísticos</h2>

    <?php foreach ($recursos as $r): ?>
        <article>
            <h3><?= htmlspecialchars($r['nombre']) ?></h3>

            <p><?= htmlspecialchars($r['descripcion']) ?></p>

            <p>Fecha inicio: <?= htmlspecialchars($r['fecha_inicio']) ?></p>
            <p>Fecha fin: <?= htmlspecialchars($r['fecha_fin']) ?></p>

            <p><?= $r['precio'] ?> €</p>

            <p>
                <a href="reservas.php?accion=reservar&id=<?= $r['id_recurso'] ?>">
                    Reservar
                </a>
            </p>
        </article>
    <?php endforeach; ?>

</section>

<?php } ?>

</main>

<footer>
    <p>Navarra Turismo</p>
</footer>

</body>
</html>