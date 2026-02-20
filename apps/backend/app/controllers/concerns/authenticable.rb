module Authenticable
  extend ActiveSupport::Concern

  def current_user
    @current_user ||= User.find_by_token(token)
  end

  def token
    request.headers['Authorization']
  end

  def authenticate_with_token!
    unless current_user
      render json: { errors: [I18n.t('exceptions.unauthorized')] },
             status: :unauthorized
     end
  end

  def reject_non_admins!
    unless current_user&.admin?
      render json: { errors: [I18n.t('exceptions.forbidden')] },
             status: :forbidden
    end
  end
end
