require 'test_helper'

class LectureContentsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:user)
    @token = @user.issue_token
    @md_content = create(:markdown_content)
  end

  test 'should show content for participating user' do
    assert @user.try_join_course(@md_content.lecture.course)

    url = lecture_lecture_content_url(@md_content.lecture, @md_content.acting_as)
    get url, headers: { 'Authorization' => @token }

    assert_response :ok
  end

  test 'should not show content for non-participating user' do
    url = lecture_lecture_content_url(@md_content.lecture, @md_content.acting_as)
    get url, headers: { 'Authorization' => @token }

    assert_response :forbidden
  end
end
