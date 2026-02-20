class CreateSqlSolutions < ActiveRecord::Migration[5.0]
  def change
    create_table :sql_solutions do |t|
      t.integer :sql_problem_id
      t.integer :user_id
      t.string :code
      t.boolean :succeed

      t.timestamps
    end
  end
end
