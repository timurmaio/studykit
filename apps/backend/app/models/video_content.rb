class VideoContent < ApplicationRecord
  acts_as :lecture_content

  validates_presence_of :url
end
