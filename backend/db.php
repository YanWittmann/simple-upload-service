<?php

final class Database
{
    private const HOST = 'localhost';
    private const DB_NAME = 'your_database_name';
    private const USER = 'your_username';
    private const PASSWORD = 'your_password';
    private static $instance = null;

    public static function getConnection(): ?PDO
    {
        if (self::$instance === null) {
            self::$instance = new PDO(
                "mysql:host=" . self::HOST . ";dbname=" . self::DB_NAME,
                self::USER,
                self::PASSWORD,
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
            );
        }
        return self::$instance;
    }
}
