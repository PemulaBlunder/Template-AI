-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 04 Jan 2026 pada 15.28
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `tubes`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `game_key` varchar(50) NOT NULL,
  `game_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `games`
--

INSERT INTO `games` (`id`, `game_key`, `game_name`, `created_at`) VALUES
(1, 'tetris', 'Tetris', '2026-01-04 12:49:16'),
(2, 'snake', 'Snake Game', '2026-01-04 12:49:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `scores`
--

CREATE TABLE `scores` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `scores`
--

INSERT INTO `scores` (`id`, `user_id`, `game_id`, `score`, `created_at`) VALUES
(1, 2, 1, 106, '2026-01-04 13:26:11'),
(2, 1, 1, 218, '2026-01-04 13:38:10'),
(3, 1, 1, 216, '2026-01-04 13:38:47'),
(4, 1, 2, 10, '2026-01-04 14:04:21'),
(5, 1, 2, 70, '2026-01-04 14:05:16');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT 'uploads/users/default.png',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `photo`, `created_at`) VALUES
(1, 'aisoujbdiuasdgiausgd', 'ian.teuku05@gmail.com', '$2y$10$Ef2/K.MbKWLHeMLAXRrRT.P3r9hyKnMogWoaF3PErXLSuNq90iC8i', 'uploads/users/695a5d92d2c49.jpeg', '2025-12-30 13:57:48'),
(2, 'woii', 'ian.teuku06@gmail.com', '$2y$10$2trT7fp0wzubCQdjnXQDFeMv.HIT5tHwc2nZR.no03gbTkHkEWQ7i', 'uploads/users/69599cee9db96.png', '2026-01-02 11:10:01');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `game_key` (`game_key`);

--
-- Indeks untuk tabel `scores`
--
ALTER TABLE `scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `game_id` (`game_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `scores`
--
ALTER TABLE `scores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `scores`
--
ALTER TABLE `scores`
  ADD CONSTRAINT `scores_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `scores_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
