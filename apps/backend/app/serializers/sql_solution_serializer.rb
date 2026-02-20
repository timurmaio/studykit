class SqlSolutionSerializer < ActiveModel::Serializer
  attributes :id, :sql_problem_id, :user_id, :code, :succeed
end
