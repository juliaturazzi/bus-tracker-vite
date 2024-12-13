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

    def _connect(self):
        return mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
            database=self.database,
        )

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

    def _create_tables(self):
        conn = self._connect()
        cursor = conn.cursor()

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

        cursor.execute(
            f"""
            CREATE TABLE IF NOT EXISTS users (
                email VARCHAR(255) PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                is_verified BOOLEAN NOT NULL DEFAULT FALSE,
                verification_token VARCHAR(255),
                reset_token VARCHAR(255)  -- New column for password reset
            );
            """
        )

        conn.commit()
        cursor.close()
        conn.close()

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

    def get_all_bus_stops(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"SELECT * FROM stops")
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return results

    def register_user(self, email: str, username: str, hashed_password: str, verification_token: str):
        conn = self._connect()
        cursor = conn.cursor()

        try:
            cursor.execute(
                f"""
                INSERT INTO users (email, username, hashed_password, verification_token)
                VALUES (%s, %s, %s, %s)
                """,
                (email, username, hashed_password, verification_token),
            )
            conn.commit()
        except mysql.connector.IntegrityError:
            raise ValueError("Email já registrado")
        finally:
            cursor.close()
            conn.close()

    def verify_user(self, token: str) -> bool:
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            f"SELECT email FROM users WHERE verification_token = %s AND is_verified = FALSE",
            (token,),
        )
        result = cursor.fetchone()

        if not result:
            cursor.close()
            conn.close()
            return False

        email = result[0]

        cursor.execute(
            f"""
            UPDATE users 
            SET is_verified = TRUE, verification_token = NULL 
            WHERE email = %s
            """,
            (email,),
        )
        conn.commit()
        cursor.close()
        conn.close()
        return True

    def update_verification_token(self, email: str, new_token: str):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            f"""
            UPDATE users 
            SET verification_token = %s 
            WHERE email = %s
            """,
            (new_token, email),
        )
        conn.commit()
        cursor.close()
        conn.close()


    def get_user(self, email: str) -> Dict[str, Any]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(f"SELECT * FROM users WHERE email = %s", (email,))
        result = cursor.fetchone()
        cursor.close()
        conn.close()
        return result

    def get_all_users(self) -> List[Dict[str, Any]]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(f"SELECT * FROM users")
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return results

    def delete_user(self, email: str):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(f"DELETE FROM users WHERE email = %s", (email,))
        conn.commit()

        cursor.close()
        conn.close()

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

    def get_stops_by_user(self, email: str) -> List[Dict[str, Any]]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM stops WHERE email = %s", (email,))
        stops = cursor.fetchall()

        cursor.close()
        conn.close()

        return stops

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


    def set_reset_token(self, email: str, reset_token: str):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE users 
            SET reset_token = %s 
            WHERE email = %s
            """,
            (reset_token, email),
        )
        conn.commit()
        cursor.close()
        conn.close()

    def get_user_by_reset_token(self, reset_token: str) -> Dict[str, Any]:
        conn = self._connect()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT * FROM users 
            WHERE reset_token = %s
            """,
            (reset_token,),
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        return user

    def clear_reset_token(self, email: str):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            """
            UPDATE users 
            SET reset_token = NULL 
            WHERE email = %s
            """,
            (email,),
        )
        conn.commit()
        cursor.close()
        conn.close()
