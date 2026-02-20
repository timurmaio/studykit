require 'test_helper'

class UserGroupTest < ActiveSupport::TestCase
  test 'should not create user_group for same user and group' do
    user_group1 = create(:user_group)
    user_group2 = build(:user_group, user: user_group1.user, group: user_group1.group)
    assert_not user_group2.save
  end
end
