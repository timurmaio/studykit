class CodeExecutorWorker
  include Sneakers::Worker
  from_queue 'code_to_execute'

  def work(message)
    payload = JSON.parse(message)
    sql_solution = SqlSolution.find(payload['sql_solution_id'])
    succeed = SqlSolutionChecker.new(sql_solution).call

    executed_code_queue.publish({
      sql_solution_id: sql_solution.id,
      succeed: succeed
    }.to_json, persistent: true)

    ack!
  rescue StandardError
    ack!
  end

  private

  def executed_code_queue
    @executed_code_queue ||= channel.queue('executed_code', durable: true, auto_delete: false)
  end

  def connection
    @connection ||= Bunny.new(
      host: ENV.fetch('RABBITMQ_HOST', 'rabbitmq'),
      user: ENV.fetch('RABBITMQ_USER', 'studykit'),
      password: ENV.fetch('RABBITMQ_PASS', 'studykit')
    ).tap(&:start)
  end

  def channel
    @channel ||= connection.create_channel.tap { |c| c.prefetch(1) }
  end
end
