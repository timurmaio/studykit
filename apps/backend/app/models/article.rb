class Article < ApplicationRecord
  mount_base64_uploader :avatar, AvatarUploader

  validates_presence_of :title, :body
  validates_integrity_of :avatar
  validates_processing_of :avatar
end
