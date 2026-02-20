class CreateLectures < ActiveRecord::Migration[5.0]
  def change
    create_table :lectures do |t|
      t.string :title
      t.integer :course_id
      t.integer :serial_number

      t.timestamps
    end
  end
end
