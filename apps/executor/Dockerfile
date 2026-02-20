FROM ruby:3.2-slim

RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 && rm -rf /var/lib/apt/lists/*
RUN gem install webrick --no-document

WORKDIR /app

COPY apps/executor/app.rb ./app.rb

ENV EXECUTOR_HOST=0.0.0.0
ENV EXECUTOR_PORT=3200

CMD ["ruby", "app.rb"]
