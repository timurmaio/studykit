class ArticleSerializer < ActiveModel::Serializer
  attributes :id, :title, :body, :avatar, :created_at, :updated_at

  def avatar
    "#{instance_options[:host]}#{object.avatar.url}" if object.avatar?
  end
end
