class SqlCodeExecutor
  attr_accessor :execution_params, :executable

  def initialize(sql_solution)
    sql_problem = sql_solution.sql_problem
    sql_params = {
      sql_solution_id: sql_solution.id,
      code: sql_solution.code,
      initial_code: sql_problem.initial_code,
      solution_code: sql_problem.solution_code,
      check_function: sql_problem.check_function
    }
    json_params = sql_params.to_json
    self.execution_params = json_params
    self.executable = sql_problem.executable?
  end

  def call
    return unless executable

    # publish a message to the default exchange which then gets routed to this queue
    # persistent - save message to the disk
    queue.publish(execution_params, persistent: true)
    close_connections
  end

  private

  def queue
    # to do the things right it will be better to publish messages to exchange
    @queue ||= channel.queue('code_to_execute', durable: true, auto_delete: false)
  end

  # it is ok to have one connection per application
  # closing channel/connection after usage is a good idea
  def connection
    @connection ||= Bunny.new(
      host: ENV.fetch('RABBITMQ_HOST', 'rabbitmq'),
      user: ENV.fetch('RABBITMQ_USER', 'studykit'),
      password: ENV.fetch('RABBITMQ_PASS', 'studykit')
    ).tap(&:start)
  end

  # channels must not be shared between threads/workers
  # each channel has a thread pool (with single thread by default)

  # if we have 2 consumers standart options use round-robing algorithm
  # to dispatch messages between consumers
  # instead of this, with prefetch = 1 we tell rabbitmq not to give
  # new messages to worker, that does not acknowledged the previous one
  # this means that message will be delivered to the next free consumers
  def channel
    @channel ||= connection.create_channel.tap { |c| c.prefetch(1) }
  end

  def close_connections
    @channel.close
    @channel = nil
    @connection.close
    @connection = nil
  end
end
