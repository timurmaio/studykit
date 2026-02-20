class Course < ApplicationRecord
  mount_base64_uploader :avatar, AvatarUploader

  belongs_to :owner, class_name: 'User'
  has_many :lectures
  has_one :group
  has_many :students, through: :group

  validates_presence_of :title, :description, :owner
  validates_integrity_of :avatar
  validates_processing_of :avatar

  after_create :create_group!

  scope :owned_by, ->(user_id) { where(owner_id: user_id) }

  scope :participated_by, ->(user_id) {
    joins(:group, group: :user_groups).where(user_groups: { user_id: user_id })
  }
end
