require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'should have email' do
    user = build(:user, email: nil)
    assert_not user.save
  end
end
