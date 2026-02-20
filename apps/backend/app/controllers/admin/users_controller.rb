class Admin::UsersController < Admin::ApplicationController
  before_action :set_user, only: %i(show update destroy)

  def index
    render json: User.order(updated_at: :desc), host: request.base_url
  end

  def show
    render json: @user, host: request.base_url
  end

  def create
    user = User.new user_params

    if user.save
      render json: user, status: :created, host: request.base_url
    else
      render json: { errors: user.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @user.update(user_params)
      render json: @user, host: request.base_url
    else
      render json: { errors: @user.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = User.find params[:id]
  end

  def user_params
    params.require(:user).permit(:first_name,
                                 :last_name,
                                 :email,
                                 :password,
                                 :avatar,
                                 :role)
  end
end
