initial_code = <<-SQL
  CREATE TABLE tickets (
    ticket_no CHAR(13) NOT NULL,
    book_ref CHAR(6) NOT NULL,
    passenger_id VARCHAR(20) NOT NULL,
    passenger_name TEXT NOT NULL,
    contact_data JSONB
  );

  CREATE TABLE passengers (
    id SERIAL PRIMARY KEY,
    passport_number VARCHAR(20),
    name TEXT,
    contact_data JSONB
  );

  INSERT INTO tickets (ticket_no, book_ref, passenger_id, passenger_name, contact_data)
  VALUES
    ('0005432000987', '06B046', '8149 604011', 'VALERIY TIKHONOV', '{"phone": "+70127117011"}'),
    ('0005432000988', '06B046', '8499 420203', 'EVGENIYA ALEKSEEVA', '{"phone": "+70378089255"}'),
    ('0005432000989', 'E170C3', '1011 752484', 'ARTUR GERASIMOV', '{"phone": "+70760429203"}'),
    ('0005432000990', 'E170C3', '4849 400049', 'ALINA VOLKOVA', '{"email": "volkova.alina_03101973@postgrespro.ru", "phone": "+70582584031"}'),
    ('0005432000991', 'F313DD', '6615 976589', 'MAKSIM ZHUKOV', '{"email": "m-zhukov061972@postgrespro.ru", "phone": "+70149562185"}');
SQL

solution_code = <<-SQL
  INSERT INTO passengers (passport_number, name, contact_data)
  SELECT t.passenger_id, t.passenger_name, t.contact_data
  FROM tickets t;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    t = db.execute_statement('SELECT * FROM passengers;')
    b_rows = t.size == 6
    b_r1 = t[1][1] == '8149 604011' &&
           t[1][2] == 'VALERIY TIKHONOV' &&
           t[1][3] == '{"phone": "+70127117011"}'
    b_r5 = t[5][1] == '6615 976589' &&
           t[5][2] == 'MAKSIM ZHUKOV' &&
           t[5][3] == '{"email": "m-zhukov061972@postgrespro.ru", "phone": "+70149562185"}'
    b_rows && b_r1 && b_r5
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
Отлично! Теперь надо перенести данные пассажиров из таблицы **tickets** в таблицу **passengers**. Понятно, что данные будут с дубликатами, но об этом мы позаботимся чуть позже.

```
  CREATE TABLE tickets (
    ticket_no CHAR(13) NOT NULL PRIMARY KEY,
    book_ref CHAR(6) NOT NULL,
    passenger_id VARCHAR(20) NOT NULL,
    passenger_name TEXT NOT NULL,
    contact_data JSONB
  );
```
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'DDL в действии'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Перенос данных',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'INSERT'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    }
  ]
)
