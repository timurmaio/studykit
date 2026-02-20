Rails.application.routes.draw do
  scope :api do
    namespace :admin do
      resources :articles, :courses, :lectures, :lecture_contents, :sql_problems
      resources :users do
        post 'login', on: :collection, to: 'sessions#create'
      end
    end

    resources :articles, only: %i(index show)
    resources :sql_solutions, only: %i(show create)
    resources :courses do
      post 'join', on: :member
      delete 'leave', on: :member
      get 'participating', on: :member
      get 'participants/:user_id/statistics', on: :member, to: 'courses#statistics'
    end
    resources :lectures, only: %i(index show) do
      resources :lecture_contents, only: %i(show create update destroy), path: 'content'
    end
    resources :users, only: %i(show create update destroy) do
      post 'login', on: :collection, to: 'sessions#create'
    end
  end

  mount RailsAdmin::Engine => '/dskjghskdjf', as: 'rails_admin'
  # apipie
end
