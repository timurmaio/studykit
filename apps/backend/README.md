# README

## Установка RabbitMQ

0. В системе должен быть установлен *Erlang OTP*
1. Добавляем источник для *apt* и ставим пакет **rabbitmq-server**
2. ```sudo rabbitmq-plugins enable rabbitmq_management```
3. http://localhost:15672/


## Запуск Sneakers Worker

Для обмена сообщениями между *executor* и *backend* нужно выполнить:
```WORKERS=SolutionUpdater RAILS_ENV=production bundle exec rake sneakers:run```


## ImageMagick для конвертации картинок

```sudo apt install imagemagick```


## Благодарности

 - [Postgres Professional](https://postgrespro.ru/) за демонстрационную базу данных, на основе которой сделаны задания
 - [Stepik](https://stepik.org/) за кучу идей как по построению дистанционного обучения и курсов, так и по проверке задач на SQL-программирование
