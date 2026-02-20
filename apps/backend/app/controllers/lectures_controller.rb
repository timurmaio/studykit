class LecturesController < ApplicationController
  before_action :set_lecture, only: %i(show update destroy)
  before_action :authenticate_with_token!, only: %i(create update destroy)

  def index
    render json: Lecture.order(updated_at: :desc)
  end

  def show
    render json: @lecture
  end

  def create
    lecture = Lecture.new lecture_params
    authorize!(:create, lecture)

    if lecture.save
      render json: lecture, status: :created
    else
      render json: { errors: lecture.errors }, status: :unprocessable_entity
    end
  end

  def update
    authorize!(:update, @lecture)

    if @lecture.update(lecture_params)
      render json: @lecture
    else
      render json: { errors: @lecture.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    authorize!(:destroy, @lecture)
    @lecture.destroy
    head :no_content
  end

  private

  def set_lecture
    @lecture = Lecture.find params[:id]
  end

  def lecture_params
    params.require(:lecture).permit(:title, :serial_number, :course_id)
  end
end
