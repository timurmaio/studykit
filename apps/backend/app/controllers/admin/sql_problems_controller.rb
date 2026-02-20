class Admin::SqlProblemsController < Admin::ApplicationController
  before_action :set_sql_problem, only: %i(show)

  def index
    render json: SqlProblem.order(updated_at: :desc)
  end

  def show
    render json: @sql_problem
  end

  private

  def set_sql_problem
    @sql_problem = SqlProblem.find params[:id]
  end
end
