initial_code = <<-SQL
  CREATE TABLE tickets (
    ticket_no CHAR(13) NOT NULL,
    book_ref CHAR(6) NOT NULL,
    passenger_id VARCHAR(20) NOT NULL,
    passenger_name TEXT NOT NULL,
    contact_data JSONB,
    passenger_ref INT REFERENCES passengers(id) ON DELETE SET NULL ON UPDATE CASCADE
  );
SQL

solution_code = <<-SQL
  ALTER TABLE tickets
  DROP COLUMN passenger_id,
  DROP COLUMN passenger_name,
  DROP COLUMN contact_data;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    # there must be only ticket_no, book_ref and passenger_ref columns
  end
RUBY

sql_problem = SqlProblem.create!(
  initial_code: initial_code,
  solution_code: solution_code,
  check_function: check_function,
  executable: false
)

description = <<-TEXT
**Внимание! Это первое задание, которое проверяется вручную.**

Проверка вручную означает, что ваше решение прочитает один из разработчиков *Studykit* и поставит отметку правильно или неправильно. Если хотите, чтобы задачу проверили ещё быстрее, напишите https://t.me/tpltn А задачу невозможно проверить автоматически, потому что SQLite не позволяет удалять столбцы.

Задача. Удалим те столбцы, которые мы вынесли в таблицу пассажиров (имя пассажира, номер паспорта и контакты). В таблице билетов они называются **passenger_id**, **passenger_name** и **contact_data**.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'DDL в действии'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Удаление ненужных столбцов',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'DROP'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'ALTER')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'TABLE')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'COLUMN')
    }
  ]
)
