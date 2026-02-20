class WikidataItemsToLectureContent < ApplicationRecord
  belongs_to :wikidata_item
  belongs_to :lecture_content

  validates_presence_of :wikidata_item, :lecture_content
end
