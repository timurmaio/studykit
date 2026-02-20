class Group < ApplicationRecord
  belongs_to :course
  has_many :user_groups
  has_many :students, through: :user_groups, source: :user
end
