<?php

final class Database
{
    private const HOST = 'localhost';
    private const DB_NAME = 'upload';
    private const USER = "root";
    private const PASSWORD = "";
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
