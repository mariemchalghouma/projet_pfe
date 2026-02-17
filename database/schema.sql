-- Driver Tracking Database Schema
-- PostgreSQL database initialization script

-- Create users table (administrators)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

 

-- Create trips table
CREATE TABLE IF NOT EXISTS trips (
  id SERIAL PRIMARY KEY,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  start_location VARCHAR(255),
  end_location VARCHAR(255),
  start_lat DECIMAL(10, 8),
  start_lng DECIMAL(11, 8),
  end_lat DECIMAL(10, 8),
  end_lng DECIMAL(11, 8),
  distance DECIMAL(10, 2),
  duration INTEGER,
  status VARCHAR(50) DEFAULT 'in_progress',
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data (optional)

-- Sample admin user (password: admin123)
-- Note: This is a hashed version of 'admin123' using bcrypt
INSERT INTO users (email, password, name) VALUES
('admin@example.com', '$2b$10$YourHashedPasswordHere', 'Administrateur')
ON CONFLICT (email) DO NOTHING;

-- Sample drivers
INSERT INTO drivers (first_name, last_name, phone, email, license_number, status) VALUES
('Ahmed', 'Benali', '+212612345678', 'ahmed.benali@example.com', 'DL123456', 'available'),
('Fatima', 'Zahra', '+212623456789', 'fatima.zahra@example.com', 'DL234567', 'available'),
('Mohammed', 'Alami', '+212634567890', 'mohammed.alami@example.com', 'DL345678', 'busy')
ON CONFLICT (email) DO NOTHING;

-- Sample vehicles
INSERT INTO vehicles (plate_number, model, year, status) VALUES
('12345-A-67', 'Renault Clio', 2020, 'active'),
('23456-B-78', 'Peugeot 208', 2021, 'active'),
('34567-C-89', 'Dacia Logan', 2019, 'maintenance')
ON CONFLICT (plate_number) DO NOTHING;
