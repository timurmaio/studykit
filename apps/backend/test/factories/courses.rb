FactoryGirl.define do
  factory :course do
    avatar nil
    title 'New course'
    description 'Course description'
    association :owner, factory: :user
  end
end
