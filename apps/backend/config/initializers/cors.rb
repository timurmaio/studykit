class LocalCors
  ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3001',
    'http://127.0.0.1:3001'
  ].freeze

  def initialize(app)
    @app = app
  end

  def call(env)
    headers = cors_headers(env)

    if env['REQUEST_METHOD'] == 'OPTIONS'
      return [204, headers, []]
    end

    status, response_headers, response = @app.call(env)
    headers.each { |key, value| response_headers[key] = value }
    [status, response_headers, response]
  end

  private

  def cors_headers(env)
    origin = env['HTTP_ORIGIN']
    return {} unless ALLOWED_ORIGINS.include?(origin)

    {
      'Access-Control-Allow-Origin' => origin,
      'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
      'Access-Control-Allow-Headers' => env['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'] || 'Authorization, Content-Type, Accept',
      'Access-Control-Allow-Credentials' => 'true',
      'Vary' => 'Origin'
    }
  end
end

Rails.application.config.middleware.insert_before 0, LocalCors
