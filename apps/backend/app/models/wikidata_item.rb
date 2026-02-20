class WikidataItem < ApplicationRecord
  validates_presence_of :name, :wikidata_id
end
