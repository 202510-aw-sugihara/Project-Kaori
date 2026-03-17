CREATE TABLE users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE plans (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL,
  price INT NOT NULL,
  capacity INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL
);

CREATE TABLE plan_time_slots (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  plan_id BIGINT NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INT NOT NULL,
  reserved_count INT NOT NULL DEFAULT 0,
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT uq_plan_slot UNIQUE(plan_id, slot_date, start_time),
  CONSTRAINT fk_plan_time_slots_plan FOREIGN KEY (plan_id) REFERENCES plans(id)
);

CREATE TABLE reservations (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  plan_time_slot_id BIGINT NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  status VARCHAR(50) NOT NULL,
  participant_count INT NOT NULL,
  total_price INT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_reservations_plan FOREIGN KEY (plan_id) REFERENCES plans(id),
  CONSTRAINT fk_reservations_slot FOREIGN KEY (plan_time_slot_id) REFERENCES plan_time_slots(id)
);

CREATE TABLE reservation_participants (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reservation_id BIGINT NOT NULL,
  participant_name VARCHAR(100) NOT NULL,
  participant_name_kana VARCHAR(100),
  age_group VARCHAR(50),
  allergy_note VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL,
  deleted_at TIMESTAMP NULL,
  CONSTRAINT fk_participants_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);
