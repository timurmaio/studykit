class UserSerializer < ActiveModel::Serializer
  attributes :id, :first_name, :last_name, :email, :avatar, :role
  attribute :jwt_token, if: :token_present?

  def jwt_token
    instance_options[:jwt_token]
  end

  def token_present?
    jwt_token.present?
  end

  def avatar
    "#{instance_options[:host]}#{object.avatar.url}" if object.avatar?
  end
end
