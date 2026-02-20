class SessionsController < ApplicationController
  def_param_group :user do
    param :user, Hash, desc: 'User login info', required: true do
      param :email, String, desc: 'Email for login', required: true
      param :password, String, desc: 'Password for login', required: true
    end
  end

  api!
  param_group :user
  example '
  {
    "user": {
      "email": "tpltn",
      "password": "password"
    }
  }
  {
    "id": 3,
    "first_name": "tim",
    "last_name": "plat",
    "email": "tpltn",
    "avatar": null,
    "role": "teacher",
    "jwt_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJleHAiOjE0OTI1MzU5MjV9.LlADZ2zGNu8wfeN8w0Y8bC6Xby_YUh4KVo1CnPTo_Nc"
  }
  '
  example '
  {
    "user": {
      "email": "",
      "password": "123"
    }
  }
  {
    "errors": "User with specified email not found"
  }
  '
  example '
  {
    "user": {
      "email": "tpltn",
      "password": null
  }
  }
  {
    "errors": "Incorrect password"
  }
  '
  error code: 401, desc: 'Incorrect password'
  error code: 404, desc: 'User with specified credentials not found'
  def create
    user = User.find_by_email login_params[:email]
    if user
      if user.password == login_params[:password]
        token = user.issue_token
        render json: user, jwt_token: token, host: request.base_url
      else
        render json: { errors: 'Incorrect password' }, status: :unauthorized
      end
    else
      render json: { errors: 'User with specified email not found' }, status: :not_found
    end
  end

  private

  def login_params
    params.require(:user).permit(:email, :password)
  end
end
