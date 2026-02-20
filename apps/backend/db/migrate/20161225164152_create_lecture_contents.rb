class CreateLectureContents < ActiveRecord::Migration[5.0]
  def change
    create_table :lecture_contents do |t|
      t.string :type
      t.string :title
      t.integer :lecture_id
      t.string :body
      t.integer :serial_number

      t.timestamps
    end
  end
end
