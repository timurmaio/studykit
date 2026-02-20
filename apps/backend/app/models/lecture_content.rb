class LectureContent < ApplicationRecord
  actable

  self.inheritance_column = '_type'
  alias_attribute :type, :actable_type

  belongs_to :lecture
  has_many :wikidata_items_to_lecture_contents
  has_many :wikidata_items, through: :wikidata_items_to_lecture_contents

  validates_presence_of :lecture, :serial_number

  # HACK
  # TODO: check that passed constant exists
  def self.build_specific(params)
    klass = params[:type].constantize
    klass.new params
  end
end
