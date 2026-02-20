class SqlSolution < ApplicationRecord
  belongs_to :sql_problem
  belongs_to :user

  validates_presence_of :sql_problem, :user, :code
end
