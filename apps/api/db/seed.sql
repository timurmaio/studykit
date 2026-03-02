-- StudyKit Seed Data
-- Idempotent - safe to run multiple times
-- Uses pgcrypto for password hashing (compatible with Rails crypt)

-- Admin user (password: admin123)
-- Uses same hashing as Rails: crypt('admin123', gen_salt('bf'))
DO $$
DECLARE
    admin_exists BOOLEAN;
    admin_email VARCHAR := 'admin@example.com';
    admin_password VARCHAR := 'admin123';
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = admin_email) INTO admin_exists;
    
    IF NOT admin_exists THEN
        INSERT INTO users (first_name, last_name, email, password_digest, role, created_at, updated_at)
        VALUES (
            'Admin',
            'User',
            admin_email,
            crypt(admin_password, gen_salt('bf')),
            2,
            NOW(),
            NOW()
        );
    ELSE
        UPDATE users 
        SET password_digest = crypt(admin_password, gen_salt('bf')),
            role = 2,
            updated_at = NOW()
        WHERE email = admin_email;
    END IF;
END $$;

-- Wikidata items (for demo course tagging)
INSERT INTO wikidata_items (name, wikidata_id, created_at, updated_at) VALUES
    ('Database index', 'Q580427', NOW(), NOW()),
    ('SELECT', 'Q1164001', NOW(), NOW()),
    ('INSERT', 'Q1076017', NOW(), NOW()),
    ('DELETE', 'Q1153781', NOW(), NOW()),
    ('ALTER', 'Q3490806', NOW(), NOW()),
    ('UPDATE', 'Q1076005', NOW(), NOW()),
    ('HAVING', 'Q1972511', NOW(), NOW()),
    ('JOIN', 'Q2003535', NOW(), NOW()),
    ('CREATE', 'Q696955', NOW(), NOW()),
    ('ORDER BY', 'Q3299754', NOW(), NOW()),
    ('DROP', 'Q3490119', NOW(), NOW()),
    ('VIEW', 'Q1329910', NOW(), NOW()),
    ('TABLE', 'Q278425', NOW(), NOW()),
    ('Hierarchical and recursive queries', 'Q5753091', NOW(), NOW()),
    ('GROUP BY', 'Q13222055', NOW(), NOW()),
    ('Stored Procedure', 'Q846619', NOW(), NOW()),
    ('Foreign Key', 'Q1056760', NOW(), NOW()),
    ('COLUMN', 'Q2102543', NOW(), NOW()),
    ('Database Transaction', 'Q848010', NOW(), NOW()),
    ('Aggregate Function', 'Q4115063', NOW(), NOW()),
    ('Database Trigger', 'Q835769', NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Demo course: Базы данных
DO $$
DECLARE
    v_course_id INTEGER;
    admin_id INTEGER;
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@example.com' LIMIT 1;

    SELECT id INTO v_course_id FROM courses WHERE title = 'Базы данных' LIMIT 1;
    IF v_course_id IS NULL THEN
        INSERT INTO courses (title, description, owner_id, created_at, updated_at)
        VALUES (
            'Базы данных',
            'На этом курсе можно пройти тесты по БД PostgreSQL',
            admin_id,
            NOW(),
            NOW()
        )
        RETURNING id INTO v_course_id;
    END IF;

    UPDATE courses
    SET avatar = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        updated_at = NOW()
    WHERE id = v_course_id;

    IF NOT EXISTS (SELECT 1 FROM groups g WHERE g.course_id = v_course_id) THEN
        INSERT INTO groups (course_id, created_at, updated_at)
        VALUES (v_course_id, NOW(), NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM lectures l WHERE l.course_id = v_course_id AND l.serial_number = 1) THEN
        INSERT INTO lectures (title, course_id, serial_number, created_at, updated_at)
        VALUES ('Введение', v_course_id, 1, NOW(), NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM lectures l WHERE l.course_id = v_course_id AND l.serial_number = 2) THEN
        INSERT INTO lectures (title, course_id, serial_number, created_at, updated_at)
        VALUES ('DDL в действии', v_course_id, 2, NOW(), NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM lectures l WHERE l.course_id = v_course_id AND l.serial_number = 3) THEN
        INSERT INTO lectures (title, course_id, serial_number, created_at, updated_at)
        VALUES ('Немного DML', v_course_id, 3, NOW(), NOW());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM lectures l WHERE l.course_id = v_course_id AND l.serial_number = 4) THEN
        INSERT INTO lectures (title, course_id, serial_number, created_at, updated_at)
        VALUES ('Для самых крутых', v_course_id, 4, NOW(), NOW());
    END IF;
END $$;

-- Create a sample markdown lecture content for "Введение"
DO $$
DECLARE
    intro_lecture_id INTEGER;
    ddl_lecture_id INTEGER;
    dml_lecture_id INTEGER;
    advanced_lecture_id INTEGER;
    content_id INTEGER;
    sql_problem_id INTEGER;
BEGIN
    SELECT l.id INTO intro_lecture_id
    FROM lectures l
    JOIN courses c ON c.id = l.course_id
    WHERE c.title = 'Базы данных' AND l.serial_number = 1
    LIMIT 1;

    SELECT l.id INTO ddl_lecture_id
    FROM lectures l
    JOIN courses c ON c.id = l.course_id
    WHERE c.title = 'Базы данных' AND l.serial_number = 2
    LIMIT 1;

    SELECT l.id INTO dml_lecture_id
    FROM lectures l
    JOIN courses c ON c.id = l.course_id
    WHERE c.title = 'Базы данных' AND l.serial_number = 3
    LIMIT 1;

    SELECT l.id INTO advanced_lecture_id
    FROM lectures l
    JOIN courses c ON c.id = l.course_id
    WHERE c.title = 'Базы данных' AND l.serial_number = 4
    LIMIT 1;

    -- Markdown for lecture 1
    IF intro_lecture_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM lecture_contents WHERE lecture_id = intro_lecture_id
    ) THEN
        INSERT INTO markdown_contents (title, body)
        VALUES (
            'Введение в базы данных',
            '# Добро пожаловать на курс по базам данных!

## Что вы изучите

На этом курсе вы познакомитесь с основами реляционных баз данных и языка SQL.

### Темы курса

- Создание таблиц (DDL)
- Основные операции с данными (DML)
- Запросы с JOIN
- Агрегатные функции

### Как проходить курс

1. Читайте лекционный материал
2. Выполняйте практические задания
3. Проверяйте свои решения

Удачи в изучении!'
        ) RETURNING id INTO content_id;

        INSERT INTO lecture_contents (actable_type, lecture_id, actable_id, serial_number, created_at, updated_at)
        VALUES ('MarkdownContent', intro_lecture_id, content_id, 1, NOW(), NOW());
    END IF;

    -- Markdown for lecture 2
    IF ddl_lecture_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM lecture_contents WHERE lecture_id = ddl_lecture_id AND actable_type = 'MarkdownContent'
    ) THEN
        INSERT INTO markdown_contents (title, body)
        VALUES (
            'DDL basics',
            'В этой лекции изучаем DDL-команды: CREATE, ALTER, DROP и структуру таблиц.'
        ) RETURNING id INTO content_id;

        INSERT INTO lecture_contents (actable_type, lecture_id, actable_id, serial_number, created_at, updated_at)
        VALUES ('MarkdownContent', ddl_lecture_id, content_id, 1, NOW(), NOW());
    END IF;

    -- SQL practice for lecture 2
    IF ddl_lecture_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM lecture_contents WHERE lecture_id = ddl_lecture_id AND actable_type = 'SqlProblemContent'
    ) THEN
        INSERT INTO sql_problems (initial_code, solution_code, check_function, executable, created_at, updated_at)
        VALUES (
            'CREATE TABLE users (id INTEGER, name TEXT); INSERT INTO users VALUES (1, ''Ann''), (2, ''Bob''), (3, ''Sam'');',
            'SELECT * FROM users;',
            NULL,
            TRUE,
            NOW(),
            NOW()
        ) RETURNING id INTO sql_problem_id;

        INSERT INTO sql_problem_contents (title, body, sql_problem_id, created_at, updated_at)
        VALUES (
            'Выберите всех пользователей',
            'Напишите SQL-запрос, который вернет все записи из таблицы users.',
            sql_problem_id,
            NOW(),
            NOW()
        ) RETURNING id INTO content_id;

        INSERT INTO lecture_contents (actable_type, lecture_id, actable_id, serial_number, created_at, updated_at)
        VALUES ('SqlProblemContent', ddl_lecture_id, content_id, 2, NOW(), NOW());
    END IF;

    -- Markdown for lecture 3
    IF dml_lecture_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM lecture_contents WHERE lecture_id = dml_lecture_id AND actable_type = 'MarkdownContent'
    ) THEN
        INSERT INTO markdown_contents (title, body)
        VALUES (
            'DML basics',
            'В этой лекции разбираем INSERT, UPDATE и DELETE на простых примерах.'
        ) RETURNING id INTO content_id;

        INSERT INTO lecture_contents (actable_type, lecture_id, actable_id, serial_number, created_at, updated_at)
        VALUES ('MarkdownContent', dml_lecture_id, content_id, 1, NOW(), NOW());
    END IF;

    -- SQL practice for lecture 3
    IF dml_lecture_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM lecture_contents WHERE lecture_id = dml_lecture_id AND actable_type = 'SqlProblemContent'
    ) THEN
        INSERT INTO sql_problems (initial_code, solution_code, check_function, executable, created_at, updated_at)
        VALUES (
            'CREATE TABLE numbers (value INTEGER); INSERT INTO numbers VALUES (1), (2), (3), (4), (5);',
            'SELECT value FROM numbers WHERE value > 3;',
            NULL,
            TRUE,
            NOW(),
            NOW()
        ) RETURNING id INTO sql_problem_id;

        INSERT INTO sql_problem_contents (title, body, sql_problem_id, created_at, updated_at)
        VALUES (
            'Фильтрация данных',
            'Верните все значения из таблицы numbers, которые больше 3.',
            sql_problem_id,
            NOW(),
            NOW()
        ) RETURNING id INTO content_id;

        INSERT INTO lecture_contents (actable_type, lecture_id, actable_id, serial_number, created_at, updated_at)
        VALUES ('SqlProblemContent', dml_lecture_id, content_id, 2, NOW(), NOW());
    END IF;

    -- Markdown for lecture 4
    IF advanced_lecture_id IS NOT NULL AND NOT EXISTS (
      SELECT 1 FROM lecture_contents WHERE lecture_id = advanced_lecture_id
    ) THEN
        INSERT INTO markdown_contents (title, body)
        VALUES (
            'Продвинутые запросы',
            'Здесь мы готовимся к тесту: JOIN, GROUP BY, агрегаты и подзапросы.'
        ) RETURNING id INTO content_id;

        INSERT INTO lecture_contents (actable_type, lecture_id, actable_id, serial_number, created_at, updated_at)
        VALUES ('MarkdownContent', advanced_lecture_id, content_id, 1, NOW(), NOW());
    END IF;
END $$;
