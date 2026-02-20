initial_code = <<-SQL
  CREATE TABLE bookings (
    book_ref CHAR(6) NOT NULL,
    total_amount numeric(10,2) NOT NULL
  );

  INSERT INTO bookings (book_ref, total_amount)
  VALUES
    ('000068', 10000.00),
    ('000012', 30000.00),
    ('0002F3', 60000.00),
    ('0002E0', 80000.00),
    ('0002DB', 100000.00),
    ('000181', 130000.00),
    ('00000F', 260000.00);

  CREATE TABLE tickets (
    ticket_no CHAR(13) NOT NULL,
    book_ref CHAR(6) NOT NULL
  );

  INSERT INTO tickets (ticket_no, book_ref)
  VALUES
    ('0005432000987', '00000F'),

    ('0005432000989', '000068'),
    ('0005432000996', '0002DB'),
    ('0005432000997', '000181'),

    ('0005432000990', '000012'),
    ('0005432000991', '000012'),
    ('0005432000992', '0002E0'),
    ('0005432000994', '0002F3'),
    ('0005432000995', '0002F3');

  CREATE TABLE ticket_flights (
    ticket_no CHAR(13) NOT NULL,
    flight_id INT NOT NULL
  );

  INSERT INTO ticket_flights (ticket_no, flight_id)
  VALUES
    ('0005432000987', 30621),
    ('0005432000987', 30622),

    ('0005432000989', 30623),
    ('0005432000989', 30624),
    ('0005432000996', 30625),
    ('0005432000997', 30626),

    ('0005432000990', 30627),
    ('0005432000990', 30628),
    ('0005432000991', 30629),

    ('0005432000992', 30630),
    ('0005432000992', 30631),

    ('0005432000994', 30632),
    ('0005432000994', 30633),
    ('0005432000995', 30634),
    ('0005432000995', 30635);
SQL

solution_code = <<-SQL
  SELECT avg(t2.total_amount)
  FROM (
    SELECT b.total_amount
    FROM bookings b
    JOIN tickets t ON b.book_ref = t.book_ref
    JOIN (
            SELECT tf2.ticket_no
            FROM ticket_flights tf2
            GROUP BY tf2.ticket_no
            HAVING count(*) > 1
         ) tf ON t.ticket_no = tf.ticket_no
    WHERE b.total_amount NOT IN (
      (SELECT max(b2.total_amount) FROM bookings b2),
      (SELECT min(b3.total_amount) FROM bookings b3)
    )
    GROUP BY b.book_ref, b.total_amount
  ) t2;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    b_rows = result[:rows_size] == 1
    avg = result[:rows].first.first
    b_res = avg > 56666 && avg < 56667
    b_rows && b_res
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function
)

description = <<-TEXT
Выбрать среднюю цену бронирования на билеты, по которым есть несколько рейсов (т.е. на один билет несколько рейсов. Например, билет туда-обратно, или билет, включающий пересадки). При этом, не учитывать самые дешёвые и самые дорогие бронирования (среди всех бронирований).

Подсказка: бронирования могут быть на несколько билетов, каждый билет из такого бронирования может быть на несколько рейсов. Бронирование, которое включает несколько таких билетов в результат должно попасть только один раз!

Например,
```
Бронирование1 -> Билет1 -> (Рейс1, Рейс2)
Бронирование1 -> Билет2 -> (Рейс3, Рейс4)
```

для расчёта среднего, *Бронирование1* берите только один раз.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'Немного DML'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Цены на бронирования',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'HAVING'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Aggregate Function')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'GROUP BY')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'JOIN')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    }
  ]
)
