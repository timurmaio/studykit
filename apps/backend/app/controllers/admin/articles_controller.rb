class Admin::ArticlesController < Admin::ApplicationController
  before_action :set_article, only: %i(show update destroy)

  def index
    render json: Article.order(updated_at: :desc), host: request.base_url
  end

  def show
    render json: @article, host: request.base_url
  end

  def create
    article = Article.new article_params

    if article.save
      render json: article, status: :created, host: request.base_url
    else
      render json: { errors: article.errors }, status: :unprocessable_entity
    end
  end

  def update
    if @article.update(article_params)
      render json: @article, host: request.base_url
    else
      render json: { errors: @article.errors }, status: :unprocessable_entity
    end
  end

  def destroy
    @article.destroy
    head :no_content
  end

  private

  def set_article
    @article = Article.find params[:id]
  end

  def article_params
    params.require(:article).permit(:title, :body, :avatar)
  end
end
