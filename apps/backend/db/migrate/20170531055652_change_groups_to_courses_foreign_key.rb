class ChangeGroupsToCoursesForeignKey < ActiveRecord::Migration[5.0]
  def change
    remove_foreign_key :groups, :courses
    add_foreign_key :groups, :courses, on_update: :cascade, on_delete: :cascade
  end
end
