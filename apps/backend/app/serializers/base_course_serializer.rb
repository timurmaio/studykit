class BaseCourseSerializer < ActiveModel::Serializer
  attributes :id, :title, :description, :avatar, :created_at

  def avatar
    "#{instance_options[:host]}#{object.avatar.url}" if object.avatar?
  end

  def created_at
    object.created_at.to_s(:db)
  end
end
