import mysql.connector
from mysql.connector import connection
from typing import List, Dict, Any

from mysql.connector.abstracts import MySQLConnectionAbstract
from mysql.connector.pooling import PooledMySQLConnection


class BusStopDatabase:
    def __init__(self):
        self.host = "db"
        self.user = "bustracker"
        self.password = "bustracker123"
        self.database = "bustracker"
        self._create_database()
        self._create_tables()

    # Create MySQL database connection
    def _connect(self):
        return mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database,
        )

    # Create the database
    def _create_database(self):
        conn = mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
        )
        cursor = conn.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")
        conn.commit()
        cursor.close()
        conn.close()

    # Create necessary tables
    def _create_tables(self):
        conn = self._connect()
        cursor = conn.cursor()

        # Create `stops` table
        cursor.execute(
            f"""
            CREATE TABLE IF NOT EXISTS stops (
                email VARCHAR(255) NOT NULL,
                linha VARCHAR(255) NOT NULL,
                stop_name VARCHAR(255) NOT NULL,
                latitude DOUBLE NOT NULL,
                longitude DOUBLE NOT NULL,
                start_time TIME NOT NULL,
                end_time TIME NOT NULL,
                max_distance INT NOT NULL,
                PRIMARY KEY (email, stop_name, latitude, longitude, start_time, end_time, max_distance)
            );
            """
        )

        # Create `users` table
        cursor.execute(
            f"""
            CREATE TABLE IF NOT EXISTS users (
                email VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL
            );
            """
        )

        conn.commit()
        cursor.close()
        conn.close()

    # Insert a new bus stop into the `stops` table
    def insert_bus_stop(
        self,
        email: str,
        bus_line: str,
        stop_name: str,
        latitude: float,
        longitude: float,
        start_time: str,
        end_time: str,
        max_distance: int,
    ):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            f"""
            INSERT INTO stops (email, linha, stop_name, latitude, longitude, start_time, end_time, max_distance)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (email, bus_line, stop_name, latitude, longitude, start_time, end_time, max_distance),
        )

        conn.commit()
        cursor.close()
        conn.close()

    # Retrieve all bus stops from the `stops` table
    def get_all_bus_stops(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"SELECT * FROM stops")
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return results

    # Register a new user into the `users` table
    def register_user(self, email: str, username: str, hashed_password: str):
        conn = self._connect()
        cursor = conn.cursor()

        try:
            cursor.execute(
                f"""
                INSERT INTO users (email, username, hashed_password)
                VALUES (%s, %s, %s)
                """,
                (email, username, hashed_password),
            )
            conn.commit()
        except mysql.connector.IntegrityError:
            raise ValueError("Email already registered")
        finally:
            cursor.close()
            conn.close()

    # Retrieve a user by email from the `users` table
    def get_user(self, email: str) -> Dict[str, Any]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        cursor.close()
        conn.close()

        return user

    # Retrieve all users from the `users` table
    def get_all_users(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"SELECT * FROM users")
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return results

    # Delete a user from the `users` table
    def delete_user(self, email: str):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(f"DELETE FROM users WHERE email = %s", (email,))
        conn.commit()

        cursor.close()
        conn.close()

    # Update a user's information in the `users` table
    def update_user(
        self, email: str, username: str = None, hashed_password: str = None
    ):
        conn = self._connect()
        cursor = conn.cursor()

        if username:
            cursor.execute(
                f"""
                UPDATE users SET username = %s WHERE email = %s
                """,
                (username, email),
            )
        if hashed_password:
            cursor.execute(
                f"""
                UPDATE users SET hashed_password = %s WHERE email = %s
                """,
                (hashed_password, email),
            )

        conn.commit()
        cursor.close()
        conn.close()

    # Retrieve all bus stops registered by a specific user
    def get_stops_by_user(self, email: str) -> List[Dict[str, Any]]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM stops WHERE email = %s", (email,))
        stops = cursor.fetchall()

        cursor.close()
        conn.close()

        return stops

    # Delete a specific bus stop registered by a user
    def delete_stop(
            self,
            email: str,
            stop_name: str,
            latitude: float,
            longitude: float,
            start_time: str,
            end_time: str,
            max_distance: int,
    ):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            """
            DELETE FROM stops 
            WHERE email = %s 
              AND stop_name = %s 
              AND latitude = %s 
              AND longitude = %s 
              AND start_time = %s 
              AND end_time = %s
              AND max_distance = %s
            """,
            (email, stop_name, latitude, longitude, start_time, end_time, max_distance),
        )
        conn.commit()
        cursor.close()
        conn.close()
