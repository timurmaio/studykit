class CreateCourses < ActiveRecord::Migration[5.0]
  def change
    create_table :courses do |t|
      t.string :avatar
      t.string :title
      t.string :description
      t.integer :owner_id

      t.timestamps
    end
  end
end
