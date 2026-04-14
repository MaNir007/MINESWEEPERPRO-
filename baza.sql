DROP DATABASE IF EXISTS minesweeper_db;
CREATE DATABASE IF NOT EXISTS minesweeper_db;
USE minesweeper_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    
    -- Trenutni progres u karijeri
    level INT DEFAULT 1,
    
    -- Statistika za Leaderboard (Najbolji rezultat u jednoj igri)
    high_score_mines INT DEFAULT 0,
    
    -- Ukupna statistika (za 'Achievements' sustav)
    total_mines_cleared INT DEFAULT 0,
    total_games_played INT DEFAULT 0,
    total_games_won INT DEFAULT 0,
    
    -- Sigurnost i vrijeme
    last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB; 

-- Opcionalno: Indeksiranje za brži Leaderboard
CREATE INDEX idx_high_score ON users(high_score_mines DESC);

-- Statistika za Daily Challenge (dnevno natjecanje za vrijeme)
CREATE TABLE IF NOT EXISTS daily_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    play_date DATE NOT NULL,
    time_seconds INT NOT NULL,
    apm INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY daily_user_attempt (username, play_date),
    FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Indeksiranje po danu i vremenu (brže učitavanje tablice)
CREATE INDEX idx_daily_date_time ON daily_scores(play_date, time_seconds ASC);