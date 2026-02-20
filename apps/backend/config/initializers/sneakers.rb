Sneakers.configure(amqp: "amqp://#{ENV['RABBITMQ_USER']}:#{ENV['RABBITMQ_PASS']}@#{ENV['RABBITMQ_HOST']}:5672",
                   prefetch: 1,
                   workers: 1,
                   daemonize: false,
                   log: File.join('log', 'sneakers.log'),
                   pid_path: File.join('tmp', 'pids', 'sneakers.pid'),
                   threads: 1)

Sneakers.logger.level = Logger::WARN
