FactoryGirl.define do
  factory :user do
    first_name 'Name'
    last_name 'LastName'
    email { Faker::Internet.safe_email }
    password 'password'
  end
end
