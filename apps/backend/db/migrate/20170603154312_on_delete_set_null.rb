class OnDeleteSetNull < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :sql_solutions, :users
    add_foreign_key :sql_solutions, :users, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :sql_solutions, :sql_problems
    add_foreign_key :sql_solutions, :sql_problems, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :sql_problem_contents, :sql_problems
    add_foreign_key :sql_problem_contents, :sql_problems, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :groups, :courses
    add_foreign_key :groups, :courses, on_update: :cascade, on_delete: :nullify

    add_foreign_key :wikidata_items_to_lecture_contents, :wikidata_items, on_update: :cascade, on_delete: :nullify
    add_foreign_key :wikidata_items_to_lecture_contents, :lecture_contents, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :user_groups, :users
    add_foreign_key :user_groups, :users, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :user_groups, :groups
    add_foreign_key :user_groups, :groups, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :course_categories, :courses
    add_foreign_key :course_categories, :courses, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :course_categories, :categories
    add_foreign_key :course_categories, :categories, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :lectures, :courses
    add_foreign_key :lectures, :courses, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :lecture_contents, :lectures
    add_foreign_key :lecture_contents, :lectures, on_update: :cascade, on_delete: :nullify

    remove_foreign_key :courses, column: :owner_id
    add_foreign_key :courses, :users, column: :owner_id, on_update: :cascade, on_delete: :nullify
  end
end
