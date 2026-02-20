initial_code = <<-SQL
  CREATE TABLE aircrafts (
    aircraft_code CHAR(3) NOT NULL,
    model TEXT NOT NULL
  );

  INSERT INTO aircrafts (aircraft_code, model)
  VALUES
    ('773', 'Boeing 777-300'),
    ('777', 'Boeing 777-300'),
    ('763', 'Boeing 767-300'),
    ('767', 'Boeing 767-300'),
    ('SJ1', 'Sukhoi SuperJet-100'),
    ('SU1', 'Sukhoi SuperJet-100'),
    ('320', 'Airbus A320-200'),
    ('322', 'Airbus A320-200'),
    ('321', 'Airbus A321-200'),
    ('311', 'Airbus A321-200'),
    ('319', 'Airbus A319-100'),
    ('311', 'Airbus A319-100'),
    ('733', 'Boeing 737-300'),
    ('737', 'Boeing 737-300'),
    ('CN1', 'Cessna 208 Caravan'),
    ('CN8', 'Cessna 208 Caravan'),
    ('CR2', 'Bombardier CRJ-200'),
    ('CJ2', 'Bombardier CRJ-200');
SQL

solution_code = <<-SQL
  CREATE VIEW random_aircrafts AS
    SELECT DISTINCT a.model
    FROM aircrafts a
    ORDER BY random()
    LIMIT 5;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    # how to check data ?
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function,
  executable: false
)

description = <<-TEXT
**Внимание! Это задание проверяется вручную.**

Создайте представление **random_aircrafts**, которое каждый раз возвращает пять случайных и различных моделей самолётов. Предполагается, что в таблице есть повторяющиеся (по названию) модели. Повторения выводить не надо (т.е. пять различных между собой моделей).

Пример работы:

```
SELECT * from random_aircrafts;

model
Airbus A321-200
Boeing 737-300
Bombardier CRJ-200
Boeing 767-300
Airbus A320-200
```
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'Немного DML'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Представление со случайными данными',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'VIEW'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'ORDER BY')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'CREATE')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    }
  ]
)
