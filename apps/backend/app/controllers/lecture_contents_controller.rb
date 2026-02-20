class LectureContentsController < ApplicationController
  before_action :set_lecture
  before_action :set_lecture_content, only: %i(show update destroy)
  before_action :authenticate_with_token!, only: %i(show create update destroy)

  def_param_group :lecture_content do
    param :lecture_content, Hash do
      param :type, %w(MarkdownContent VideoContent SqlProblemContent), required: true
      param :serial_number, Integer, required: true
      param :title, String, desc: 'MarkdownContent only'
      param :body, String, desc: 'MarkdownContent only'
      param :url, String, desc: 'VideoContent only'
      param :sql_problem_id, Integer, desc: 'SqlProblemContent only'
    end
  end

  api!
  example '
  {
    "id": 8,
    "type": "SqlProblemContent",
    "course_id": 1,
    "serial_number": 111,
    "title": "Выберите всех пользователей",
    "body": "Hey, you need to select all users",
    "sql_problem_id": 1,
    "sql_solutions": [
      {
        "id": 1,
        "sql_problem_id": 1,
        "user_id": 3,
        "code": "select 1;",
        "succeed": null
      }
    ]
  }
  '
  error code: 403, desc: 'User does not have access to read lecture content (ex: non-participating in it\'s course)'
  def show
    authorize!(:read, @lecture_content)
    render json: @lecture_content.specific, user_id: current_user.id
  end

  api!
  param_group :lecture_content
  example '
  {
    "lecture_content":{
      "type": "MarkdownContent"
      "serial_number": 5,
      "title": "New content",
      "body": "*md goes here*",
    }
  }
  {
    "id": 6,
    "type": "MarkdownContent",
    "course_id": 1,
    "serial_number": 5,
    "body": "New content",
    "title": "*md goes here*"
  }
  '
  error code: 403, desc: 'Do not have access to edit course'
  error code: 422, desc: 'Invalid course content'
  def create
    lecture_content = @lecture.content.build_specific lecture_content_params
    authorize!(:create, lecture_content)

    if lecture_content.save
      render json: lecture_content, status: :created
    else
      render json: { errors: lecture_content.errors }, status: :unprocessable_entity
    end
  end

  def update
    @lecture_content = @lecture_content.specific
    authorize!(:update, @lecture_content)

    if @lecture_content.update(lecture_content_params)
      render json: @lecture_content
    else
      render json: { errors: @lecture_content.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize!(:destroy, @lecture_content)
    @lecture_content.destroy
    head :no_content
  end

  private

  def set_lecture
    @lecture = Lecture.find params[:lecture_id]
  end

  def set_lecture_content
    @lecture_content = @lecture.content.find params[:id]
  end

  def lecture_content_params
    params.require(:lecture_content).permit(:type, :serial_number,
                                            :title, :body,
                                            :url,
                                            :sql_problem_id)
  end
end
