class SqlProblemContentSerializer < LectureContentSerializer
  attributes :body, :title, :sql_problem_id, :sql_solutions

  def sql_solutions
    if user_id.present?
      collection = object.sql_solutions.where(user_id: user_id)
      ActiveModel::Serializer::CollectionSerializer.new(collection,
                                                        each_serializer: SqlSolutionSerializer)
    else
      []
    end
  end

  def user_id
    instance_options[:user_id]
  end
end
