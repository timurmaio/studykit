class CreateSqlProblems < ActiveRecord::Migration[5.0]
  def change
    create_table :sql_problems do |t|
      t.string :initial_code
      t.string :solution_code
      t.string :check_function

      t.timestamps
    end
  end
end
