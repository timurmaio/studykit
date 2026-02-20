class Admin::ApplicationController < ApplicationController
  before_action :reject_non_admins!
end
