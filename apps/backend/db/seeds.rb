if User.find_by(email: 'admin').nil?
  User.create!(
    first_name: 'Тимур',
    last_name: 'Платонов',
    email: 'admin',
    password: 'admin',
    role: 'admin'
  )
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
    owner: User.find_by!(email: 'admin')
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

if LectureContent.count == 0
  Dir[Rails.root.join('db/seed_md/*.rb')].sort.each { |file| load file }
  Dir[Rails.root.join('db/seed_sql/*.rb')].sort.each { |file| load file }
end
