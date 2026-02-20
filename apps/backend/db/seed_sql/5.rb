initial_code = <<-SQL
  CREATE TABLE passengers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    passport_number VARCHAR(20),
    name TEXT,
    contact_data JSONB
  );

  INSERT INTO passengers (passport_number, name, contact_data)
  VALUES
    (NULL, 'VALERIY TIKHONOV', '{"phone": "+70127117011"}'),
    ('1011 752484', 'ARTUR GERASIMOV', '{"phone": "+70760429203"}'),
    ('8149 604011', 'MAKSIM ZHUKOV', '{"email": "m-zhukov061972@postgrespro.ru", "phone": "+70149562185"}');
SQL

solution_code = <<-SQL
  CREATE INDEX passport_number_idx ON passengers(passport_number) WHERE passport_number IS NOT NULL;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    t = db.execute_statement('PRAGMA index_list(passengers);')
    b_rows = t.size == 2
    b_r1 = t[1][1] == 'passport_number_idx'

    # does not exist on old debian 8 sqlite3
    # && t[1][4] == 1

    t2 = db.execute_statement("SELECT * FROM sqlite_master WHERE type = 'index';")
    b_rows2 = t2.size == 2
    idx_query = t2[1][4].downcase
    b_r2 = idx_query.include?('is') && idx_query.include?('not') && idx_query.include?('null')

    b_rows && b_r1 && b_rows2 && b_r2
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
Мы хотим указать внешние ссылки. Но для быстрого поиска пассажира по номеру его паспорта надо сделать индекс по этому полю.

Сделайте такой индекс с именем **passport_number_idx**. Пустые (*NULL*) значения включать в индекс не нужно.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'DDL в действии'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Индекс на столбец',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Database index'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'CREATE')
    }
  ]
)
