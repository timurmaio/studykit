class AddExecutableToSqlProblems < ActiveRecord::Migration[5.0]
  def change
    add_column :sql_problems, :executable, :boolean, default: true
  end
end
