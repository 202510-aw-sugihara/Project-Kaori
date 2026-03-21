-- ADMIN USER
INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at)
VALUES ('Admin', 'admin@example.com', '$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW', '09000000000', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- CUSTOMER USERS
INSERT INTO users (name, email, password_hash, phone, role, created_at, updated_at)
VALUES
('繝・せ繝医Θ繝ｼ繧ｶ繝ｼ1', 'user1@example.com', '$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW', '09011111111', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('繝・せ繝医Θ繝ｼ繧ｶ繝ｼ2', 'user2@example.com', '$2a$10$AJmLE8MK1Swf53hcADbYg.RTIqFvq9AvW6BGo2Bxr34fnzNHsczpW', '09022222222', 'customer', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PLANS
INSERT INTO plans (name, description, duration_minutes, price, capacity, is_active, created_at, updated_at)
VALUES
('12遞ｮ繝悶Ξ繝ｳ繝我ｽ馴ｨ・, '12遞ｮ鬘槭・鬥呎侭縺九ｉ驕ｸ繧薙〒鬥呎ｰｴ繧剃ｽ懈・縺吶ｋ蛻晏ｿ・・髄縺代さ繝ｼ繧ｹ', 60, 4000, 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('20遞ｮ繝悶Ξ繝ｳ繝我ｽ馴ｨ・, '譛域忰髯仙ｮ壹・20遞ｮ鬘槭・鬥呎侭縺九ｉ驕ｸ縺ｹ繧玖・逕ｱ蠎ｦ縺ｮ鬮倥＞莠ｺ豌励さ繝ｼ繧ｹ', 60, 4000, 6, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- PLAN TIME SLOTS
INSERT INTO plan_time_slots (plan_id, slot_date, start_time, end_time, capacity, reserved_count, is_open, created_at, updated_at)
VALUES
(1, '2026-04-01', '11:00:00', '12:00:00', 6, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-01', '13:00:00', '14:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-01', '15:00:00', '16:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-04-01', '11:00:00', '12:30:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-04-01', '15:00:00', '16:30:00', 6, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-11', '11:00:00', '12:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-11', '13:00:00', '14:00:00', 6, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-11', '15:00:00', '16:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-18', '11:00:00', '12:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-18', '13:00:00', '14:00:00', 6, 2, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-04-18', '15:00:00', '16:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-05-16', '11:00:00', '12:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-05-16', '13:00:00', '14:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-05-16', '15:00:00', '16:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-05-23', '11:00:00', '12:00:00', 6, 1, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-05-23', '13:00:00', '14:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '2026-05-23', '15:00:00', '16:00:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-04-25', '11:00:00', '12:30:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-04-25', '15:00:00', '16:30:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-05-30', '11:00:00', '12:30:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '2026-05-30', '15:00:00', '16:30:00', 6, 0, TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RESERVATIONS
INSERT INTO reservations (user_id, plan_id, plan_time_slot_id, reservation_date, start_time, status, participant_count, total_price, created_at, updated_at)
VALUES
(2, 1, 1, '2026-04-01', '11:00:00', 'confirmed', 2, 11000, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(3, 2, 5, '2026-04-01', '15:00:00', 'pending', 1, 7700, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- RESERVATION PARTICIPANTS
INSERT INTO reservation_participants (reservation_id, participant_name, participant_name_kana, age_group, allergy_note, created_at, updated_at)
VALUES
(1, '螻ｱ逕ｰ 螟ｪ驛・, '繝､繝槭ム 繧ｿ繝ｭ繧ｦ', '30莉｣', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(1, '螻ｱ逕ｰ 闃ｱ蟄・, '繝､繝槭ム 繝上リ繧ｳ', '30莉｣', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(2, '菴占陸 谺｡驛・, '繧ｵ繝医え 繧ｸ繝ｭ繧ｦ', '20莉｣', '鬥呎侭繧｢繝ｬ繝ｫ繧ｮ繝ｼ縺ｪ縺・, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


