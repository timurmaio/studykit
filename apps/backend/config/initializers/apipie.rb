Apipie.configure do |config|
  config.app_name                = 'Studykit'
  config.doc_base_url            = '/apipie'
  config.validate                = false
  # config.api_base_url            = '/api'
  # config.api_controllers_matcher = "#{Rails.root}/app/controllers/**/*.rb"

  # HACK: fix concerns autoload
  config.api_controllers_matcher = Dir["#{Rails.root}/app/controllers/*"].map do |f|
    if f.include?('concerns')
      nil
    elsif f.include?('.rb')
      f
    else
      "#{f}/*.rb"
    end
  end.compact
end
