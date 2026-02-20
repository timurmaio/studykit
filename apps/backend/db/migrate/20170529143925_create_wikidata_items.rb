class CreateWikidataItems < ActiveRecord::Migration[5.0]
  def change
    create_table :wikidata_items do |t|
      t.string :name
      t.string :wikidata_id

      t.timestamps
    end
  end
end
