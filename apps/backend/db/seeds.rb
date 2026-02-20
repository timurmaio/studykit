admin_email = ENV['ADMIN_EMAIL'].presence || 'admin@example.com'
admin_password = ENV['ADMIN_PASSWORD'].presence || 'change_me_please'

legacy_admin = User.find_by(email: 'admin')
target_admin = User.find_by(email: admin_email)

if target_admin.nil? && legacy_admin
  legacy_admin.update!(email: admin_email, password: admin_password, role: 'admin')
end

if User.find_by(email: admin_email).nil?
  User.create!(
    first_name: 'Тимур',
    last_name: 'Платонов',
    email: admin_email,
    password: admin_password,
    role: 'admin'
  )
else
  User.find_by(email: admin_email).update!(password: admin_password, role: 'admin')
end

if WikidataItem.count == 0
  WikidataItem.create!(
    [
      { name: 'Database index',                     wikidata_id: 'Q580427'   },
      { name: 'SELECT',                             wikidata_id: 'Q1164001'  },
      { name: 'INSERT',                             wikidata_id: 'Q1076017'  },
      { name: 'DELETE',                             wikidata_id: 'Q1153781'  },
      { name: 'ALTER',                              wikidata_id: 'Q3490806'  },
      { name: 'UPDATE',                             wikidata_id: 'Q1076005'  },
      { name: 'HAVING',                             wikidata_id: 'Q1972511'  },
      { name: 'JOIN',                               wikidata_id: 'Q2003535'  },
      { name: 'CREATE',                             wikidata_id: 'Q696955'   },
      { name: 'ORDER BY',                           wikidata_id: 'Q3299754'  },
      { name: 'DROP',                               wikidata_id: 'Q3490119'  },
      { name: 'VIEW',                               wikidata_id: 'Q1329910'  },
      { name: 'TABLE',                              wikidata_id: 'Q278425'   },
      { name: 'Hierarchical and recursive queries', wikidata_id: 'Q5753091'  },
      { name: 'GROUP BY',                           wikidata_id: 'Q13222055' },
      { name: 'Stored Procedure',                   wikidata_id: 'Q846619'   },
      { name: 'Foreign Key',                        wikidata_id: 'Q1056760'  },
      { name: 'COLUMN',                             wikidata_id: 'Q2102543'  },
      { name: 'Database Transaction',               wikidata_id: 'Q848010'   },
      { name: 'Aggregate Function',                 wikidata_id: 'Q4115063'  },
      { name: 'Database Trigger',                   wikidata_id: 'Q835769'   }
    ]
  )
end

if Course.count == 0
  c = Course.create!(
    title: 'Базы данных',
    description: 'На этом курсе можно пройти тесты по БД PostgreSQL',
    owner: User.find_by!(email: admin_email)
  )

  Lecture.create!(
    [
      { title: 'Введение',         serial_number: 1, course: c },
      { title: 'DDL в действии',   serial_number: 2, course: c },
      { title: 'Немного DML',      serial_number: 3, course: c },
      { title: 'Для самых крутых', serial_number: 4, course: c }
    ]
  )
end

db_course = Course.find_by!(title: 'Базы данных')
if !db_course.avatar?
  db_course.remote_avatar_url = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80'
  db_course.save!
end

if LectureContent.count == 0
  Dir[Rails.root.join('db/seed_md/*.rb')].sort.each { |file| load file }
  Dir[Rails.root.join('db/seed_sql/*.rb')].sort.each { |file| load file }
end

rust_owner = User.find_by!(email: admin_email)
rust_course = Course.find_or_create_by!(title: 'Основы Rust') do |course|
  course.description = 'Простой курс по Rust из 10 коротких лекций'
  course.owner = rust_owner
end

rust_lectures = [
  'Что такое Rust',
  'Установка и запуск',
  'Переменные и типы',
  'Ссылки и владение',
  'Функции и модули',
  'Структуры и enum',
  'Коллекции',
  'Обработка ошибок',
  'Cargo и зависимости',
  'Мини-проект: CLI'
]

rust_lectures.each_with_index do |title, index|
  lecture = Lecture.find_or_create_by!(course: rust_course, title: title) do |item|
    item.serial_number = index + 1
  end

  lecture.update(serial_number: index + 1) if lecture.serial_number != index + 1

  next if lecture.content.exists?

  MarkdownContent.create!(
    lecture: lecture,
    serial_number: 1,
    title: title,
    body: <<~TEXT
      Краткая лекция: #{title}.

      В этой части мы разбираем базовую идею темы и даем простой пример.
      После прочтения можно переходить к следующей лекции.
    TEXT
  )
end

if !rust_course.avatar?
  rust_course.remote_avatar_url = 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=80'
  rust_course.save!
end

rust_quizzes = [
  {
    lecture_title: 'Ссылки и владение',
    title: 'Тест: ownership',
    body: "Проверьте понимание ownership. Отправьте SQL-запрос, который вернет одно поле со значением `ownership`.\n\nПример формата: `SELECT 'ownership' AS answer;`",
    expected: 'ownership'
  },
  {
    lecture_title: 'Структуры и enum',
    title: 'Тест: enum Result',
    body: "Отправьте SQL-запрос, который вернет одно поле со значением `result`.\n\nПример: `SELECT 'result' AS answer;`",
    expected: 'result'
  },
  {
    lecture_title: 'Обработка ошибок',
    title: 'Тест: borrow checker',
    body: "Отправьте SQL-запрос, который вернет одно поле со значением `borrow`.\n\nПример: `SELECT 'borrow' AS answer;`",
    expected: 'borrow'
  }
]

rust_quizzes.each do |quiz|
  lecture = Lecture.find_by!(course: rust_course, title: quiz[:lecture_title])

  next if SqlProblemContent.find_by(lecture: lecture, title: quiz[:title])

  sql_problem = SqlProblem.create!(
    initial_code: nil,
    solution_code: "SELECT '#{quiz[:expected]}' AS answer;",
    check_function: <<~RUBY,
      def check(db, query, result)
        return false if result.nil? || result.empty?
        return false if result[0].nil? || result[0].empty?

        value = result[0][0].to_s.strip.downcase
        value == '#{quiz[:expected]}'
      end
    RUBY
    executable: true
  )

  serial_number = lecture.content.maximum(:serial_number).to_i + 1

  SqlProblemContent.create!(
    lecture: lecture,
    serial_number: serial_number,
    title: quiz[:title],
    body: quiz[:body],
    sql_problem: sql_problem
  )
end
