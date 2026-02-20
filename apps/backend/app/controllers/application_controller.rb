class ApplicationController < ActionController::API
  include CanCan::ControllerAdditions
  include Authenticable

  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found
  rescue_from CanCan::AccessDenied, with: :render_forbidden
  rescue_from ActionController::ParameterMissing, with: :render_bad_request

  protected

  def render_not_found(error)
    klass_s = error.message.match(/Couldn't find (.+) with/).try(:[], 1)
    klass = klass_s.constantize.model_name.human.mb_chars.downcase.to_s if klass_s
    render json: { errors: [I18n.t('activerecord.exceptions.not_found', klass: klass)] },
           status: :not_found
  end

  def render_forbidden(_error)
    render json: { errors: [I18n.t('exceptions.forbidden')] }, status: :forbidden
  end

  def render_bad_request(error)
    render json: { errors: [error] }, status: :bad_request
  end
end
