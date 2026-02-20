class SolutionUpdater
  include Sneakers::Worker
  from_queue 'executed_code'

  def work(message)
    body = JSON.parse message
    solution = SqlSolution.find body['sql_solution_id']
    solution.update(succeed: body['succeed'])
    ack!
  end
end
