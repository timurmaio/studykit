class CourseStatisticsCounter
  attr_accessor :course, :user

  def initialize(course, user)
    self.course = course
    self.user = user
  end

  def call
    {
      solved_problems: solved_problems,
      problems: problems
    }
  end

  private

  def solved_problems
    problem_ids = sql_problem_contents.map { |content| content.sql_problem.id }
    succeed_ids = user.sql_solutions.where(succeed: true).map(&:sql_problem_id)
    (problem_ids & succeed_ids).size
  end

  def problems
    sql_problem_contents.size
  end

  def sql_problem_contents
    @sql_problem_contents ||= course.lectures.map do |lecture|
      lecture.content.map(&:specific).select { |content| content.is_a?(SqlProblemContent) }
    end.flatten
  end
end
