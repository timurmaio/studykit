solution_code = <<-SQL
  BEGIN;
    UPDATE t SET attr = attr + 50
    WHERE id = 1;
  COMMIT;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    # Семантика PostgreSQL отличается от семантики SQLite. Рассмотрим такой пример:
    # BEGIN;
    # UPDATE t SET attr = 200;
    # <Запускается транзакция пользователя>
    #
    # PG будет ждать, что произойдёт с этой транзакцией.
    # Если она закомитится, то в транзакцию пользователя подставится новое значение, иначе - старое.
    # SQLite скажет, что поле используется и откатит пользовательскую транзакцию.
    # В задании предполагается, что мы работаем именно с PG.
  end
RUBY

sql_problem = SqlProblem.create!(
  solution_code: solution_code,
  check_function: check_function,
  executable: false
)

description = <<-TEXT
**Внимание! Это задание проверяется вручную.**

Пусть таблица **t** имеет следующие записи к моменту запуска вашего скрипта:

```
id | attr
1  | 50
```

Напишите скрипт, который в транзакции с уровнем изоляции **READ COMMITTED** увеличит значение **attr** в два раза. При этом надо иметь в виду, что другие клиенты базы данных также могут работать с этой таблицей.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'Немного DML'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Обновление в транзакции',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Database Transaction'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'UPDATE')
    }
  ]
)
