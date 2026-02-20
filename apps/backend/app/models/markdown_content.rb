class MarkdownContent < ApplicationRecord
  acts_as :lecture_content

  validates_presence_of :title, :body
end
