FactoryGirl.define do
  factory :user_group do
    user
    group { create(:course).group }
  end
end
