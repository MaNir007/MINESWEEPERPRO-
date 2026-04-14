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
    $stmt = $conn->prepare("SELECT level, total_mines_cleared FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo json_encode([
            "status" => "success", 
            "message" => "Dobrodošli natrag!", 
            "level" => (int)$row['level'],
            "coins" => (int)$row['total_mines_cleared']
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

// --- SPREMANJE PROGRESA I STATISTIKE ---
if ($action == 'save') {
    $user = trim($_POST['username'] ?? '');
    $lvl = (int)($_POST['level'] ?? 0);
    $won = (int)($_POST['won'] ?? 0);
    $mines_cleared = (int)($_POST['mines_cleared'] ?? 0);

    if (empty($user)) {
        echo json_encode(["status" => "error", "message" => "Nevažeći podaci."]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE users SET 
        level = GREATEST(level, ?),
        total_games_played = total_games_played + 1,
        total_games_won = total_games_won + ?,
        total_mines_cleared = total_mines_cleared + ?,
        high_score_mines = GREATEST(high_score_mines, ?)
        WHERE username = ?
    ");
    $stmt->bind_param("iiiis", $lvl, $won, $mines_cleared, $mines_cleared, $user);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "saved", "message" => "Napredak i statistika spremljeni!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Greška na serveru pri spremanju."]);
    }
}

// --- TRGOVINA (KUPNJA POWER-UPA) ---
if ($action == 'buy') {
    $user = trim($_POST['username'] ?? '');
    $cost = (int)($_POST['cost'] ?? 0);
    
    $stmt = $conn->prepare("SELECT total_mines_cleared FROM users WHERE username = ?");
    $stmt->bind_param("s", $user);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if ($res->num_rows > 0) {
        $row = $res->fetch_assoc();
        if ($row['total_mines_cleared'] >= $cost) {
            $upd = $conn->prepare("UPDATE users SET total_mines_cleared = total_mines_cleared - ? WHERE username = ?");
            $upd->bind_param("is", $cost, $user);
            if ($upd->execute()) {
                echo json_encode(["status" => "success", "new_balance" => $row['total_mines_cleared'] - $cost]);
                exit;
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Nedovoljno sredstava!"]);
            exit;
        }
    }
    echo json_encode(["status" => "error", "message" => "Greška na serveru."]);
    exit;
}

// --- LEADERBOARD ---
if ($action == 'leaderboard') {
    // Sortira po high_score_mines pa po levelu
    $result = $conn->query("SELECT username, level, high_score_mines, total_games_played, total_games_won FROM users ORDER BY level DESC, high_score_mines DESC LIMIT 10");
    $topPlayers = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $topPlayers[] = $row;
        }
    }
    echo json_encode(["status" => "success", "leaderboard" => $topPlayers]);
}

$conn->close();
?>