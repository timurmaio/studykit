class ArticlesController < ApplicationController
  before_action :set_article, only: [:show]

  def index
    render json: Article.order(updated_at: :desc), host: request.base_url
  end

  def show
    render json: @article, host: request.base_url
  end

  private

  def set_article
    @article = Article.find params[:id]
  end
end
