lock '3.8.1'

set :application, 'studykit'
set :repo_url, 'git@github.com:timurma/studykit-backend.git'

# set :deploy_via,   :remote_cache
set :user,         'studykit'
set :deploy_to,    "/home/#{fetch(:user)}/#{fetch(:application)}"
set :linked_files, %w(.env)
set :linked_dirs,  %w(log tmp/pids tmp/cache tmp/sockets public/uploads)

set :puma_threads,            [1, 8]
set :puma_workers,            0
set :puma_bind,               "unix://#{shared_path}/tmp/sockets/#{fetch(:application)}-puma.sock"
set :puma_state,              "#{shared_path}/tmp/pids/puma.state"
set :puma_pid,                "#{shared_path}/tmp/pids/puma.pid"
set :puma_access_log,         "#{release_path}/log/puma_access.log"
set :puma_error_log,          "#{release_path}/log/puma_error.log"
set :puma_preload_app,        true
set :puma_worker_timeout,     nil
set :puma_init_active_record, true
