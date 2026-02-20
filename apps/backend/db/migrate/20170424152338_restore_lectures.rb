class RestoreLectures < ActiveRecord::Migration[5.0]
  def change
    create_table :lectures do |t|
      t.string :title
      t.integer :course_id
      t.integer :serial_number

      t.timestamps
    end

    rename_column :course_contents, :course_id, :lecture_id
    rename_table :course_contents, :lecture_contents
  end
end
