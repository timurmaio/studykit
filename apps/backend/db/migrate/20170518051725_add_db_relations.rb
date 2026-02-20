class AddDbRelations < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :user_groups, :users
    add_foreign_key :user_groups, :groups

    add_foreign_key :groups, :courses

    add_foreign_key :courses, :users, column: :owner_id

    add_foreign_key :course_categories, :courses
    add_foreign_key :course_categories, :categories

    add_foreign_key :lectures, :courses

    add_foreign_key :sql_problem_contents, :sql_problems

    add_foreign_key :sql_solutions, :sql_problems
    add_foreign_key :sql_solutions, :users

    add_foreign_key :lecture_contents, :lectures
  end
end
