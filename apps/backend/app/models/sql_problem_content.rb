class SqlProblemContent < ApplicationRecord
  acts_as :lecture_content

  belongs_to :sql_problem
  has_many :sql_solutions, through: :sql_problem

  validates_presence_of :title, :body, :sql_problem
end
