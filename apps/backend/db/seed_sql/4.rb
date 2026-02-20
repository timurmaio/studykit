initial_code = <<-SQL
  CREATE TABLE tickets (
    ticket_no CHAR(13) NOT NULL,
    book_ref CHAR(6) NOT NULL,
    passenger_id VARCHAR(20) NOT NULL,
    passenger_name TEXT NOT NULL,
    contact_data JSONB
  );

  CREATE TABLE passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  ALTER TABLE tickets
  ADD COLUMN passenger_ref INT REFERENCES passengers(id) ON DELETE SET NULL ON UPDATE CASCADE;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    t = db.execute_statement('PRAGMA foreign_key_list(tickets);')
    b_rows = t.size == 2
    b_r1 = t[1][2] == 'passengers' &&
           t[1][3] == 'passenger_ref' &&
           t[1][4] == 'id' &&
           t[1][5].upcase == 'CASCADE' &&
           t[1][6].upcase == 'SET NULL'
    b_rows && b_r1
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
Теперь сделаем так, чтобы в таблице **tickets** были ссылки на новую таблицу **passengers**. Для этого создадим столбец **passenger_ref** и объявим его внешней ссылкой для таблицы пассажиров.

При удалении записей из таблицы **passengers** данные в **tickets** должны сохраняться с обнулением, при обновлении - должны обновляться.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'DDL в действии'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Создание столбца - внешнего ключа',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'ALTER'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'TABLE')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'COLUMN')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Foreign Key')
    }
  ]
)
