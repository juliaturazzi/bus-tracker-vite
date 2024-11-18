import mysql.connector


class BusStopDatabase:
    def __init__(self):
        self.host = "db"
        self.user = "bustracker"
        self.password = "bustracker123"
        self.database = "bustracker"
        self._create_database()
        self._create_table()

    # create MySQL db conection
    def _connect(self):
        return mysql.connector.connect(
            host=self.host,
            user=self.user,
            password=self.password,
        )

    # create database
    def _create_database(self):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {self.database}")

        conn.commit()
        cursor.close()
        conn.close()

    # create stops table
    def _create_table(self):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            f"""
        CREATE TABLE IF NOT EXISTS bustracker.stops (
            email VARCHAR(255) NOT NULL,
            linha VARCHAR(255) NOT NULL,
            stop_name VARCHAR(255) NOT NULL,
            latitude DOUBLE NOT NULL,
            longitude DOUBLE NOT NULL,
            start_time TIME not null,
            end_time TIME not null,
            PRIMARY KEY (email, stop_name, latitude, longitude, start_time, end_time)
        );
        """
        )

        conn.commit()
        cursor.close()
        conn.close()

    # insert new bus stop into stops table
    def insert_bus_stop(
            self, email, bus_line, stop_name, latitude, longitude, start_time, end_time
    ):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(
            f"""
        INSERT INTO {self.database}.stops (email, linha, stop_name, latitude, longitude, start_time, end_time)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
            (email, bus_line, stop_name, latitude, longitude, start_time, end_time),
        )

        conn.commit()
        cursor.close()
        conn.close()

    # retrieve all bus stops from stops table
    def get_all_bus_stops(self):
        conn = self._connect()
        cursor = conn.cursor()

        cursor.execute(f"SELECT * FROM {self.database}.stops")
        results = cursor.fetchall()

        cursor.close()
        conn.close()

        return results
