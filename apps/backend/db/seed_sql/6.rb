initial_code = <<-SQL
  CREATE TABLE passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passport_number VARCHAR(20),
    name TEXT,
    contact_data JSONB
  );

  CREATE TABLE tickets (
    ticket_no CHAR(13) NOT NULL,
    book_ref CHAR(6) NOT NULL,
    passenger_id VARCHAR(20) NOT NULL,
    passenger_name TEXT NOT NULL,
    contact_data JSONB,
    passenger_ref INT REFERENCES passengers(id) ON DELETE SET NULL ON UPDATE CASCADE
  );

  INSERT INTO passengers (passport_number, name, contact_data)
  VALUES
    ('8499 420203', 'EVGENIYA ALEKSEEVA', '{"phone": "+70378089255"}'),
    ('1011 752484', 'ARTUR GERASIMOV', '{"phone": "+70760429203"}'),
    ('8149 604011', 'MAKSIM ZHUKOV', '{"email": "m-zhukov061972@postgrespro.ru", "phone": "+70149562185"}');

  INSERT INTO tickets (ticket_no, book_ref, passenger_id, passenger_name, contact_data)
  VALUES
    ('0005432000987', '06B046', '8149 604011', 'VALERIY TIKHONOV', '{"phone": "+70127117011"}'),
    ('0005432000988', '06B046', '8499 420203', 'EVGENIYA ALEKSEEVA', '{"phone": "+70378089255"}'),
    ('0005432000989', 'E170C3', '1011 752484', 'ARTUR GERASIMOV', '{"phone": "+70760429203"}'),
    ('0005432000990', 'E170C3', '8149 604011', 'ALINA VOLKOVA', '{"email": "volkova.alina_03101973@postgrespro.ru", "phone": "+70582584031"}'),
    ('0005432000991', 'F313DD', '8149 604011', 'MAKSIM ZHUKOV', '{"email": "m-zhukov061972@postgrespro.ru", "phone": "+70149562185"}');
SQL

solution_code = <<-SQL
  UPDATE tickets
  SET passenger_ref = (
        SELECT p.id
        FROM passengers p
        WHERE p.passport_number = passenger_id
      ),
      passenger_id = 'OK';
SQL

check_function = <<-RUBY
  def check(db, query, result)
    t = db.execute_statement('SELECT * FROM tickets;')
    b_rows = t.size == 6

    passenger_ids = t[1..-1].map { |tuple| tuple[2] }.uniq
    b_p = passenger_ids == ["OK"]

    b_r1 = t[1][3] == 'VALERIY TIKHONOV' &&
           t[1][5] == 3
    b_r2 = t[2][3] == 'EVGENIYA ALEKSEEVA' &&
           t[2][5] == 1
    b_r3 = t[5][3] == 'MAKSIM ZHUKOV' &&
           t[5][5] == 3

    b_rows && b_p && b_r1 && b_r2 && b_r3
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
Мы почти завершили нормализацию таблицы **tickets**. Она теперь выглядит примерно так:

```
CREATE TABLE tickets (
  ticket_no CHAR(13) NOT NULL,
  book_ref CHAR(6) NOT NULL,
  passenger_id VARCHAR(20) NOT NULL,
  passenger_name TEXT NOT NULL,
  contact_data JSONB,
  passenger_ref INT <-- пустой столбец
);
```
Теперь заполним столбец **passenger_ref** ссылками (значениями из таблицы **tickets**) на **id** пассажиров. При этом, на всякий случай, для тех пассажиров, которых мы уже обновили, запишем "*OK*" вместо номера паспорта **passenger_id**.

*Примечание.* Проверяющая система работает на SQLite (да-да, их синтаксис так сильно похож с PostgreSQL). Её не удалось заставить правильно обрабатывать обновления кортежами в таком формате:

```SET (a, b) = (x, y)```

Поэтому используйте другой вариант:

```SET a = x, b = y```
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'DDL в действии'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Внешние ключи',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'UPDATE'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    }
  ]
)
