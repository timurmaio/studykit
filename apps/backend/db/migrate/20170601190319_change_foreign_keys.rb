class ChangeForeignKeys < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :sql_solutions, :users
    add_foreign_key :sql_solutions, :users, on_update: :cascade, on_delete: :cascade

    remove_foreign_key :sql_solutions, :sql_problems
    add_foreign_key :sql_solutions, :sql_problems, on_update: :cascade, on_delete: :cascade

    remove_foreign_key :sql_problem_contents, :sql_problems
    add_foreign_key :sql_problem_contents, :sql_problems, on_update: :cascade, on_delete: :cascade
  end
end
