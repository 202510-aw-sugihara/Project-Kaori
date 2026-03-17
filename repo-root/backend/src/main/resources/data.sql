-- ADMIN USER
INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at)
VALUES ('管理者', 'admin@example.com', '$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW', '09000000000', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CUSTOMER USERS
INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at)
VALUES
('テストユーザー1', 'user1@example.com', '$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW', '09011111111', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('テストユーザー2', 'user2@example.com', '$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW', '09022222222', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PLANS
INSERT INTO plans (name, description, duration_minutes, price, capacity, is_active, created_at, updated_at)
VALUES
('12種ブレンド体験', '12種類の香料から選んで香水を作成する初心者向けコース', 60, 5500, 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20種ブレンド体験', '20種類の香料から選べる自由度の高い人気コース', 90, 7700, 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PLAN TIME SLOTS
INSERT INTO plan_time_slots (plan_id, slot_date, start_time, end_time, capacity, reserved_count, is_open, created_at, updated_at)
VALUES
(1, '2026-04-01', '11:00:00', '12:00:00', 6, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-01', '13:00:00', '14:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-01', '15:00:00', '16:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-04-01', '11:00:00', '12:30:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-04-01', '15:00:00', '16:30:00', 6, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RESERVATIONS
INSERT INTO reservations (user_id, plan_id, plan_time_slot_id, reservation_date, start_time, status, participant_count, total_price, created_at, updated_at)
VALUES
(2, 1, 1, '2026-04-01', '11:00:00', 'confirmed', 2, 11000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 5, '2026-04-01', '15:00:00', 'pending', 1, 7700, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RESERVATION PARTICIPANTS
INSERT INTO reservation_participants (reservation_id, participant_name, participant_name_kana, age_group, allergy_note, created_at, updated_at)
VALUES
(1, '山田 太郎', 'ヤマダ タロウ', '30代', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '山田 花子', 'ヤマダ ハナコ', '30代', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '佐藤 次郎', 'サトウ ジロウ', '20代', '香料アレルギーなし', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
