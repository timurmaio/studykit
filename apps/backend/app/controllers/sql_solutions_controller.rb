class SqlSolutionsController < ApplicationController
  before_action :authenticate_with_token!, only: %i(show create)
  before_action :set_sql_solution, only: [:show]

  def_param_group :sql_solution do
    param :sql_solution, Hash do
      param :sql_problem_id, Integer, required: true, desc: 'id той проблемы, на которую присылается решение'
      param :code, String, required: true
    end
  end

  api!
  example '
  {
    "id": 1,
    "sql_problem_id": 1,
    "user_id": 3,
    "code": "select 1;",
    "succeed": null
  }
  '
  example '
  {
    "id": 1,
    "sql_problem_id": 1,
    "user_id": 3,
    "code": "select 1;",
    "succeed": false
  }
  '
  error code: 401
  error code: 404
  def show
    authorize!(:read, @sql_solution)
    render json: @sql_solution
  end

  api!
  example '
  {
    "sql_solution":{
      "sql_problem_id": 1,
      "code": "select 1;"
    }
  }
  {
    "id": 1,
    "sql_problem_id": 1,
    "user_id": 3,
    "code": "select 1;",
    "succeed": null
  }
  '
  example '
  {
    "sql_solution":{
      "sql_problem_id": 1
    }
  }
  {
    "errors": [
      "Code can\'t be blank"
    ]
  }
  '
  error code: 401
  error code: 422
  def create
    sql_solution = current_user.sql_solutions.build sql_solution_params

    if sql_solution.save
      SqlCodeExecutor.new(sql_solution).call
      render json: sql_solution, status: :created
    else
      render json: { errors: sql_solution.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def set_sql_solution
    @sql_solution = current_user.sql_solutions.find params[:id]
  end

  def sql_solution_params
    params.require(:sql_solution).permit(:sql_problem_id, :code)
  end
end
