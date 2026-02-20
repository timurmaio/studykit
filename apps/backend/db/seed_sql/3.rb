initial_code = <<-SQL
  CREATE TABLE passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passport_number VARCHAR(20),
    name TEXT,
    contact_data JSONB
  );

  INSERT INTO passengers (passport_number, name, contact_data)
  VALUES
    ('8149 604011', 'VALERIY TIKHONOV', '{"phone": "+70127117011"}'),
    ('8499 420203', 'EVGENIYA ALEKSEEVA', '{"phone": "+70378089255"}'),
    ('1011 752484', 'ARTUR GERASIMOV', '{"phone": "+70760429203"}'),
    ('8149 604011', 'ALINA VOLKOVA', '{"email": "volkova.alina_03101973@postgrespro.ru", "phone": "+70582584031"}'),
    ('8149 604011', 'MAKSIM ZHUKOV', '{"email": "m-zhukov061972@postgrespro.ru", "phone": "+70149562185"}');
SQL

solution_code = <<-SQL
  DELETE FROM passengers
  WHERE id NOT IN (
    SELECT max(p.id)
    FROM passengers p
    GROUP BY p.passport_number
  );
SQL

check_function = <<-RUBY
  def check(db, query, result)
    t = db.execute_statement('SELECT * FROM passengers;')
    b_rows = t.size == 4
    passports = t[1..-1].map { |tuple| tuple[1] }.sort
    b_p = passports == ["1011 752484", "8149 604011", "8499 420203"]
    b_rows && b_p
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
Данные мы перенесли. Но, если один пассажир бронировал несколько билетов, в таблице **passengers** есть дубликаты. Их необходимо удалить. Отличить повторяющиеся записи можно по совпадающим **passport_number**.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'DDL в действии'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Удаление дубликатов',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'DELETE'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'GROUP BY')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    }
  ]
)
