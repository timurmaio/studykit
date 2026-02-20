class Admin::CoursesController < Admin::ApplicationController
  before_action :set_course, only: %i(show update destroy)

  def index
    render json: Course.order(updated_at: :desc), host: request.base_url
  end

  def show
    render json: @course, host: request.base_url
  end

  def create
    course = Course.new course_params

    if course.save
      render json: course, status: :created, host: request.base_url
    else
      render json: { errors: course.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @course.update(course_params)
      render json: @course, host: request.base_url
    else
      render json: { errors: @course.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @course.destroy
    head :no_content
  end

  private

  def set_course
    @course = Course.find params[:id]
  end

  def course_params
    params.require(:course).permit(:title, :description, :owner_id, :avatar)
  end
end
