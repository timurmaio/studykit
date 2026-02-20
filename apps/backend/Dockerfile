FROM ruby:2.3.3

# Jessie EOL - используем snapshot.debian.org с игнорированием подписей
RUN echo 'deb http://snapshot.debian.org/archive/debian/20170801T000000Z jessie main' > /etc/apt/sources.list && \
    echo 'deb http://snapshot.debian.org/archive/debian/20170801T000000Z jessie-updates main' >> /etc/apt/sources.list && \
    echo 'deb http://snapshot.debian.org/archive/debian-security/20170801T000000Z jessie/updates main' >> /etc/apt/sources.list

RUN apt-get update -qq -o Acquire::Check-Valid-Until=false && \
    apt-get install -y --allow-unauthenticated nodejs postgresql-client libpq-dev sqlite3

WORKDIR /app

COPY Gemfile Gemfile.lock ./

# Используем Bundler из Gemfile.lock для совместимости с Rails 5.0.3
RUN gem install bundler -v 1.14.6 && bundler _1.14.6_ install

COPY . .

RUN mkdir -p tmp/pids

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3000"]
