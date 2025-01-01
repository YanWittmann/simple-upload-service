/* USE your_database_name; */

CREATE TABLE upload_projects
(
    id         INT AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE upload_files
(
    id           INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    project_id   INT          NOT NULL,
    file_path    TEXT         NOT NULL,
    file_name    VARCHAR(255) NOT NULL,
    uploaded_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES upload_projects (id)
        ON DELETE CASCADE
);
