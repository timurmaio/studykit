class RenameCourseContent < ActiveRecord::Migration[5.0]
  def change
    rename_column :lecture_contents, :lecture_id, :course_id
    rename_table :lecture_contents, :course_contents
    drop_table :lectures
  end
end
