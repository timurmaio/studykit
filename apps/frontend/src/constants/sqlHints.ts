export const SQL_HINTS: Record<number, string> = {
  1: `CREATE TABLE passengers (
  id SERIAL PRIMARY KEY,
  passport_number VARCHAR(20),
  name TEXT,
  contact_data JSONB
);`,
  2: `BEGIN;
UPDATE t SET attr = attr + 50
WHERE id = 1;
COMMIT;`,
  3: `CREATE VIEW random_aircrafts AS
SELECT DISTINCT a.model
FROM aircrafts a
ORDER BY random()
LIMIT 5;`,
  4: `CREATE TRIGGER trig_bef_upd_boarding_passes
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
$$ LANGUAGE plpgsql;`,
  5: `CREATE OR REPLACE FUNCTION fibb(number BIGINT)
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
$$ LANGUAGE SQL IMMUTABLE;`,
  6: `INSERT INTO passengers (passport_number, name, contact_data)
SELECT t.passenger_id, t.passenger_name, t.contact_data
FROM tickets t;`,
  7: `DELETE FROM passengers
WHERE id NOT IN (
  SELECT max(p.id)
  FROM passengers p
  GROUP BY p.passport_number
);`,
  8: `ALTER TABLE tickets
ADD COLUMN passenger_ref INT REFERENCES passengers(id) ON DELETE SET NULL ON UPDATE CASCADE;`,
  9: `CREATE INDEX passport_number_idx ON passengers(passport_number) WHERE passport_number IS NOT NULL;`,
  10: `UPDATE tickets
SET passenger_ref = (
      SELECT p.id
      FROM passengers p
      WHERE p.passport_number = passenger_id
    ),
    passenger_id = 'OK';`,
  11: `ALTER TABLE tickets
DROP COLUMN passenger_id,
DROP COLUMN passenger_name,
DROP COLUMN contact_data;`,
  12: `SELECT a.city, count(f.flight_id) AS flights
FROM airports a
LEFT JOIN
  (SELECT f1.flight_id, f1.arrival_airport
   FROM flights f1
   WHERE f1.scheduled_arrival BETWEEN '2016-09-10' AND '2016-09-15') f ON a.airport_code = f.arrival_airport
GROUP BY a.city
ORDER BY flights DESC;`,
  13: `SELECT avg(t2.total_amount)
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
) t2;`,
  14: `SELECT 'ownership' AS answer;`,
  15: `SELECT 'result' AS answer;`,
  16: `SELECT 'borrow' AS answer;`,
};
