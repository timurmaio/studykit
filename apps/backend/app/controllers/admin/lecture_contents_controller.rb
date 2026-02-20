class Admin::LectureContentsController < Admin::ApplicationController
  before_action :set_lecture_content, only: %i(show update destroy)

  def index
    render json: LectureContent.order(updated_at: :desc).map(&:specific)
  end

  def show
    render json: @lecture_content.specific
  end

  def create
    lecture_content = LectureContent.build_specific lecture_content_params

    if lecture_content.save
      render json: lecture_content, status: :created
    else
      render json: { errors: lecture_content.errors }, status: :unprocessable_entity
    end
  end

  def update
    @lecture_content = @lecture_content.specific
    if @lecture_content.update(lecture_content_params)
      render json: @lecture_content
    else
      render json: { errors: @lecture_content.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @lecture_content.destroy
    head :no_content
  end

  private

  def set_lecture_content
    @lecture_content = LectureContent.find params[:id]
  end

  def lecture_content_params
    params.require(:lecture_content).permit(:lecture_id, :type, :serial_number,
                                            :title, :body,
                                            :url,
                                            :sql_problem_id)
  end
end
