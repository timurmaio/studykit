class AddMarkdownContent < ActiveRecord::Migration[5.0]
  def up
    remove_column :lecture_contents, :title
    remove_column :lecture_contents, :body
    add_column :lecture_contents, :actable_id, :integer
    rename_column :lecture_contents, :type, :actable_type

    create_table :markdown_contents do |t|
      t.string :title
      t.string :body
    end
  end

  def down
    add_column :lecture_contents, :title, :string
    add_column :lecture_contents, :body, :string
    remove_column :lecture_contents, :actable_id
    rename_column :lecture_contents, :actable_type, :type
    drop_table :markdown_contents
  end
end
