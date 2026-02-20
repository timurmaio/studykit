solution_code = <<-SQL
  CREATE TRIGGER trig_bef_upd_boarding_passes
    BEFORE UPDATE OF seat_no ON boarding_passes
    FOR EACH ROW
    WHEN (OLD.seat_no IS DISTINCT FROM NEW.seat_no AND NEW.seat_no IS NULL)
    EXECUTE PROCEDURE proc_bef_upd_boarding_passes();

  CREATE OR REPLACE FUNCTION proc_bef_upd_boarding_passes()
    RETURNS TRIGGER AS $$
  DECLARE
    boarding_no INT;
  BEGIN
    DELETE FROM boarding_passes bp
    WHERE
      bp.ticket_no = OLD.ticket_no AND
      bp.flight_id = OLD.flight_id
    RETURNING bp.boarding_no INTO boarding_no;

    RAISE 'boarding_no: %', boarding_no;

    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
SQL

check_function = <<-RUBY
  def check(db, query, result)
    # look at the code
  end
RUBY

sql_problem = SqlProblem.create!(
  solution_code: solution_code,
  check_function: check_function,
  executable: false
)

description = <<-TEXT
**Внимание! Это задание проверяется вручную.**

Создайте триггер, который перед обновлением в таблице **boarding_passes** столбца **seat_no**, если значение изменилось на *NULL*, удаляет соответствующую строку из таблицы. Сохраните **boarding_no** из удаляемой строки.

После удаления выбросите исключение с текстом "boarding_no: <сохранённый ранее boarding_no>".

Если всё сделать правильно, ни команда **UPDATE**, ни удаление в триггере не сработают из-за выброшенного исключения.
TEXT

problem_content = SqlProblemContent.create!(
  lecture: Lecture.find_by!(title: 'Для самых крутых'),
  serial_number: SqlProblemContent.count + 1,
  title: 'Триггер с исключением',
  body: description,
  sql_problem: sql_problem
)

WikidataItemsToLectureContent.create!(
  [
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Database Trigger'),
      priority: 1
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'DELETE')
    },
    {
      lecture_content: problem_content.acting_as,
      wikidata_item: WikidataItem.find_by!(name: 'Stored Procedure')
    }
  ]
)
