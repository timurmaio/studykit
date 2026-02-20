require 'json'
require 'webrick'
require 'open3'
require 'tempfile'
require 'timeout'

class SqliteCliDatabase
  attr_reader :db_path

  def initialize(db_path)
    @db_path = db_path
  end

  def execute_statement(sql)
    return [] if sql.to_s.strip.empty?

    stdout, stderr, status = Open3.capture3('sqlite3', '-batch', '-header', db_path, sql)
    raise(StandardError, stderr.to_s.strip) unless status.success?

    stdout.lines.map do |line|
      line.chomp.split('|').map { |cell| cast(cell) }
    end
  end

  private

  def cast(value)
    return nil if value.nil?
    return value.to_i if value =~ /\A-?\d+\z/
    return value.to_f if value =~ /\A-?\d+\.\d+\z/

    value
  end
end

def evaluate(payload)
  return nil if payload['executable'] == false

  db_file = Tempfile.new('executor_v2')
  db_path = db_file.path
  db_file.close
  db = SqliteCliDatabase.new(db_path)

  begin
    db.execute_statement(payload['initialCode'])
    result_rows = db.execute_statement(payload['code'])
    result = {
      rows: result_rows,
      rows_size: result_rows.size
    }

    check_function = payload['checkFunction']
    if check_function.to_s.strip.empty?
      expected = db.execute_statement(payload['solutionCode'])
      return result_rows == expected
    end

    checker = Object.new
    checker.instance_eval(check_function)
    return false unless checker.respond_to?(:check)

    Timeout.timeout(5) do
      !!checker.check(db, payload['code'], result)
    end
  rescue StandardError
    false
  ensure
    File.delete(db_path) if File.exist?(db_path)
  end
end

server = WEBrick::HTTPServer.new(
  Port: ENV.fetch('EXECUTOR_PORT', '3200').to_i,
  BindAddress: ENV.fetch('EXECUTOR_HOST', '0.0.0.0'),
  AccessLog: [],
  Logger: WEBrick::Log.new($stdout)
)

server.mount_proc '/health' do |_, res|
  res['Content-Type'] = 'application/json'
  res.body = { status: 'ok' }.to_json
end

server.mount_proc '/execute' do |req, res|
  unless req.request_method == 'POST'
    res.status = 405
    res.body = { error: 'Method not allowed' }.to_json
    next
  end

  begin
    payload = JSON.parse(req.body)
  rescue JSON::ParserError
    res.status = 400
    res.body = { error: 'Invalid payload' }.to_json
    next
  end

  unless payload['solutionId'].to_i.positive? && payload['code'].is_a?(String)
    res.status = 400
    res.body = { error: 'Invalid payload' }.to_json
    next
  end

  succeed = evaluate(payload)
  res['Content-Type'] = 'application/json'
  res.body = {
    solutionId: payload['solutionId'],
    succeed: succeed
  }.to_json
end

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

puts 'Executor v2 started'
server.start
