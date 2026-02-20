class Lecture < ApplicationRecord
  belongs_to :course
  has_many :content, class_name: 'LectureContent'

  validates_presence_of :title, :course, :serial_number
end
