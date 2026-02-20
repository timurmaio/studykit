initial_code = <<-SQL
  CREATE TABLE airports (
    airport_code CHAR(3) NOT NULL,
    airport_name TEXT NOT NULL,
    city TEXT NOT NULL
  );

  CREATE TABLE flights (
    flight_id INT NOT NULL,
    arrival_airport CHAR(3) NOT NULL,
    scheduled_arrival TIMESTAMPTZ NOT NULL
  );

  INSERT INTO airports (airport_code, airport_name, city)
  VALUES
    ('LED', 'Пулково', 'Санкт-Петербург'),
    ('SVO', 'Шереметьево', 'Москва'),
    ('VKO', 'Внуково', 'Москва'),
    ('KZN', 'Казань', 'Казань'),
    ('DME', 'Домодедово', 'Москва');

  INSERT INTO flights (flight_id, arrival_airport, scheduled_arrival)
  VALUES
    (1, 'LED', '2016-09-09 09:30:00.000000'),
    (31, 'KZN', '2016-09-09 10:35:00.000000'),
    (48, 'DME', '2015-09-13 11:50:00.000000'),
    (49, 'VKO', '2016-08-13 12:25:00.000000'),
    (50, 'SVO', '2016-09-09 23:59:59.999999'),
    (990, 'LED', '2016-09-10 12:20:00.000000'),
    (991, 'LED', '2016-09-13 11:20:00.000000'),
    (998, 'DME', '2016-09-13 11:50:00.000000'),
    (999, 'VKO', '2016-09-13 12:25:00.000000'),
    (1000, 'SVO', '2016-09-13 23:59:59.999999'),
    (1620, 'LED', '2016-09-15 00:00:00.000001'),
    (3315, 'LED', '2016-09-16 11:15:00.000000'),
    (13045, 'KZN', '2017-09-13 19:05:00.000000'),
    (13048, 'DME', '2017-09-13 11:50:00.000000'),
    (13049, 'VKO', '2016-10-13 12:25:00.000000'),
    (13050, 'SVO', '2016-09-15 00:00:00.000000');
SQL

solution_code = <<-SQL
  SELECT a.city, count(f.flight_id) AS flights
  FROM airports a
  LEFT JOIN
    (SELECT f1.flight_id, f1.arrival_airport
    FROM flights f1
    WHERE f1.scheduled_arrival BETWEEN '2016-09-10' AND '2016-09-15') f ON a.airport_code = f.arrival_airport
  GROUP BY a.city
  ORDER BY flights DESC;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    result[:rows] == [['Москва', 3], ['Санкт-Петербург', 2], ['Казань', 0]]
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
А теперь немного классики, запросы на получение данных.

Выберите города и количество рейсов, которые должны были прибыть туда за пять дней, с 10 сентября 2016 00:00:00 по 15 сентября 00:00:00. Упорядочите результат по количеству рейсов.

Учитывайте, что в городах может быть больше одного аэропорта (в Москве таких три).

Пример работы запроса:

```
city            flights
Москва          257
Санкт-Петербург 64
Новосибирск     36
```

Примечание. Оператор **OVERLAPS** не поддерживается. **timestamp with time zone** приводится к **DATE** автоматически, самому приводить типы не надо.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'Немного DML'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Рейсы в города',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'JOIN'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'GROUP BY')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'ORDER BY')
    }
  ]
)
