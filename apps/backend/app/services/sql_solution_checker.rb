require 'json'
require 'open3'
require 'securerandom'
require 'tmpdir'

class SqlSolutionChecker
  class SqliteCliDatabase
    attr_reader :db_path

    def initialize(db_path)
      @db_path = db_path
    end

    def execute_statement(sql)
      return [] if sql.to_s.strip.empty?

      stdout, stderr, status = Open3.capture3('sqlite3', '-batch', '-noheader', @db_path, sql)
      raise(StandardError, stderr.to_s.strip) unless status.success?

      stdout.lines.map do |line|
        line.chomp.split('|').map { |cell| cast(cell) }
      end
    end

    private

    def cast(value)
      return nil if value.nil?
      return value.to_i if value.match?(/\A-?\d+\z/)
      return value.to_f if value.match?(/\A-?\d+\.\d+\z/)

      value
    end
  end

  def initialize(sql_solution)
    @sql_solution = sql_solution
    @sql_problem = sql_solution.sql_problem
  end

  def call
    return nil unless @sql_problem.executable?

    db = with_db
    db.execute_statement(@sql_problem.initial_code)
    result = db.execute_statement(@sql_solution.code)
    return check_with_function(db, result) if @sql_problem.check_function.present?

    check_with_solution_sql(result)
  rescue StandardError
    false
  ensure
    cleanup_db(db)
  end

  private

  def check_with_function(db, result)
    checker_context = Object.new
    checker_context.instance_eval(@sql_problem.check_function)
    return false unless checker_context.respond_to?(:check)

    !!checker_context.check(db, @sql_solution.code, result)
  end

  def check_with_solution_sql(result)
    expected_db = with_db
    expected_db.execute_statement(@sql_problem.initial_code)
    expected = expected_db.execute_statement(@sql_problem.solution_code)
    result == expected
  ensure
    cleanup_db(expected_db)
  end

  def cleanup_db(db)
    return if db.nil? || db.db_path.nil?

    File.delete(db.db_path) if File.exist?(db.db_path)
  rescue StandardError
    nil
  end

  def with_db
    db_path = File.join(Dir.tmpdir, "sql_checker_#{SecureRandom.hex(6)}.sqlite3")
    File.open(db_path, 'w') {}
    SqliteCliDatabase.new(db_path)
  end
end
