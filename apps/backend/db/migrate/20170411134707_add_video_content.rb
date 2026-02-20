class AddVideoContent < ActiveRecord::Migration[5.0]
  def change
    create_table :video_contents do |t|
      t.string :url
    end
  end
end
