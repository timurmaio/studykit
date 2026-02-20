class Ability
  include CanCan::Ability

  def initialize(user)
    # guest users - they are students by default
    user ||= User.new

    if user.admin?
      can :manage, :all
    elsif user.teacher?
      can(:manage, Course) { |course| course.owner == user }
      can(:manage, Lecture) { |lecture| lecture.course.owner == user }
      can(:manage, LectureContent) { |lecture_content| lecture_content.lecture.course.owner == user }

      # TODO: check in better way
      can(:manage, SqlSolution) { |sql_solution| (sql_solution.user.courses & user.owned_courses).size > 0 }
      can(:read, LectureContent) { |lecture_content| user.participate_in?(lecture_content.lecture.course) }
    elsif user.student?
      can(:read, SqlSolution) { |sql_solution| sql_solution.user == user }
      can(:read, LectureContent) { |lecture_content| user.participate_in?(lecture_content.lecture.course) }
    end
    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities
  end
end
