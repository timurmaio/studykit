class CreateWikidataItemsToLectureContents < ActiveRecord::Migration[5.0]
  def change
    create_table :wikidata_items_to_lecture_contents do |t|
      t.integer :wikidata_item_id
      t.integer :lecture_content_id
      t.integer :priority
    end
  end
end
