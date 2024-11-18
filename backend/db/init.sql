CREATE DATABASE IF NOT EXISTS bustracker;

CREATE USER IF NOT EXISTS 'bustracker'@'%' IDENTIFIED BY 'bustracker123';

GRANT ALL PRIVILEGES ON bustracker.* TO 'bustracker'@'%';

FLUSH PRIVILEGES;

USE bustracker;

CREATE TABLE IF NOT EXISTS stops (
    email VARCHAR(255) NOT NULL,
    linha VARCHAR(255) NOT NULL,
    stop_name VARCHAR(255) NOT NULL,
    latitude DOUBLE NOT NULL,
    longitude DOUBLE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    PRIMARY KEY (email, stop_name, latitude, longitude, start_time, end_time)
);
