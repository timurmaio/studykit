require 'test_helper'

class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:user)
    @token = @user.issue_token
  end

  test 'should create user' do
    assert_difference('User.count') do
      user_params = { user: attributes_for(:user, email: 'another_user@example.org') }
      post users_url, params: user_params
    end

    assert_response :created
  end

  test 'should not create user with same email' do
    assert_no_difference('User.count') do
      user_params = { user: attributes_for(:user, email: @user.email.upcase) }
      post users_url, params: user_params
    end

    assert_response :unprocessable_entity
  end

  test 'should destroy user' do
    assert_difference('User.count', -1) do
      delete user_url(@user), headers: { 'Authorization' => @token }
    end

    assert_response :no_content
  end
end
