solution_code = <<-SQL
  CREATE OR REPLACE FUNCTION fibb(number BIGINT)
  RETURNS BIGINT AS $$
    WITH RECURSIVE fibonacci AS (
      SELECT
        1::BIGINT AS ord,
        1::BIGINT AS value,
        1::BIGINT AS next_value

      UNION ALL

      SELECT
        ord + 1 AS value,
        next_value,
        value + next_value
      FROM fibonacci
      WHERE ord < number
    )

    SELECT value
    FROM fibonacci
    ORDER BY value DESC
    LIMIT 1;
  $$ LANGUAGE SQL IMMUTABLE;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    # SELECT fibb(91); => 4660046610375530309
  end
RUBY

sql_problem = SqlProblem.create!(
  solution_code: solution_code,
  check_function: check_function,
  executable: false
)

description = <<-TEXT
**Внимание! Это задание проверяется вручную.**

Наверняка многие из вас писали рекурсивные алгоритмы на Паскале или Си. Но сегодня задача ещё интереснее! Напишите рекурсивное (если точнее, итеративный алгоритм вычисления при помощи рекурсивного запроса) вычисление n-го числа Фибоначчи. Оформите его в виде хранимой процедуры, котрорая вызывает SQL-запрос.

Уточнения:
- сигнатура функции *fibb(BIGINT) -> BIGINT*
- функция должна иметь тип **LANGUAGE SQL IMMUTABLE** (никаких *plpgsql* и *plpythonu*)
- функция должная вычислять 91 число Фибоначчи (и не загнуться при этом :))
- время работы в пределах 100ms

Пример работы:

```
SELECT fibb(91); => 4660046610375530309

```
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'Для самых крутых'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Числа Фибоначчи на SQL',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Hierarchical and recursive queries'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Stored Procedure')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'SELECT')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'ORDER BY')
    }
  ]
)
