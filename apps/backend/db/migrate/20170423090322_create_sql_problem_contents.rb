class CreateSqlProblemContents < ActiveRecord::Migration[5.0]
  def change
    create_table :sql_problem_contents do |t|
      t.string :title
      t.string :body
      t.integer :sql_problem_id
      t.timestamps
    end
  end
end
