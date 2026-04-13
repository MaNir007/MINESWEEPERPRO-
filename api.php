<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // Omogućuje requeste s različitih portova ako zatreba

// Konfiguracija baze - izdvojena radi preglednosti
$config = [
    "host" => "localhost",
    "user" => "root",
    "pass" => "",
    "name" => "minesweeper_db"
];

// Pokušaj povezivanja uz hvatanje grešaka (Exception handling)
try {
    $conn = new mysqli($config['host'], $config['user'], $config['pass'], $config['name']);
    if ($conn->connect_error) {
        throw new Exception("Baza podataka nije dostupna.");
    }
} catch (Exception $e) {
    die(json_encode(["status" => "error", "message" => $e->getMessage()]));
}

$action = $_GET['action'] ?? '';

// --- PRIJAVA / REGISTRACIJA ---
if ($action == 'login') {
    $user = trim($_POST['username'] ?? '');

    if (empty($user)) {
        echo json_encode(["status" => "error", "message" => "Korisničko ime je obavezno."]);
        exit;
    }

    // Koristimo Prepared Statement za sigurnost
    $stmt = $conn->prepare("SELECT level FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            "status" => "success", 
            "message" => "Dobrodošli natrag!", 
            "level" => (int)$row['level']
        ]);
    } else {
        // Novi igrač - nivo 1
        $ins = $conn->prepare("INSERT INTO users (username, level) VALUES (?, 1)");
        $ins->bind_param("s", $user);
        if ($ins->execute()) {
            echo json_encode(["status" => "created", "level" => 1]);
        } else {
            echo json_encode(["status" => "error", "message" => "Greška pri kreiranju računa."]);
        }
    }
}

// --- SPREMANJE PROGRESA ---
if ($action == 'save') {
    $user = trim($_POST['username'] ?? '');
    $lvl = (int)($_POST['level'] ?? 0);

    if (empty($user) || $lvl <= 0) {
        echo json_encode(["status" => "error", "message" => "Nevažeći podaci."]);
        exit;
    }

    // NAPREDNO: Ne dozvoli smanjivanje nivoa u bazi (anti-cheat osnovno)
    // Spremamo samo ako je novi nivo veći od starog
    $stmt = $conn->prepare("UPDATE users SET level = ? WHERE username = ? AND level < ?");
    $stmt->bind_param("isi", $lvl, $user, $lvl);
    
    if ($stmt->execute()) {
        $affected = $stmt->affected_rows;
        echo json_encode([
            "status" => "saved", 
            "updated" => $affected > 0,
            "message" => $affected > 0 ? "Napredak spremljen!" : "Nivo je već isti ili veći."
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Greška na serveru pri spremanju."]);
    }
}

$conn->close();
?>