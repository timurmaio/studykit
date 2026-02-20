class User < ApplicationRecord
  mount_base64_uploader :avatar, AvatarUploader

  enum role: [:student, :admin, :teacher]

  has_many :owned_courses, class_name: 'Course', foreign_key: 'owner_id'
  has_many :sql_solutions
  has_many :user_groups
  has_many :groups, through: :user_groups
  has_many :courses, through: :groups

  validates_presence_of :first_name, :last_name, :email, :password_digest, :role
  validates_uniqueness_of :email, case_sensitive: false
  validates_inclusion_of :role, in: roles.keys
  validates_integrity_of :avatar
  validates_processing_of :avatar

  def self.find_by_email(email)
    return nil if email.nil?
    find_by('LOWER(email) = ?', email.downcase)
  end

  def self.find_by_token(token)
    decoded_token = JWT.decode(token, Rails.application.secrets.secret_key_base, true, algorithm: 'HS256')
    payload = decoded_token.first
    User.find_by(id: payload['user_id'])
  rescue JWT::ExpiredSignature, JWT::DecodeError
    nil
  end

  def password
    @password ||= BCrypt::Password.new(password_digest)
  end

  def password=(new_password)
    if new_password.blank?
      self.password_digest = nil
      return password_digest
    end

    @password = BCrypt::Password.create(new_password)
    self.password_digest = @password
  end

  def issue_token
    exp = 3.months.from_now.to_i
    payload = { user_id: id, exp: exp }
    JWT.encode(payload, Rails.application.secrets.secret_key_base, 'HS256')
  end

  def try_join_course(course)
    UserGroup.new(user: self, group: course.group).save
  end

  def try_leave_course(course)
    user_group = UserGroup.find_by(user: self, group: course.group)
    return false if user_group.blank?
    user_group.destroy
    user_group.destroyed?
  end

  def participate_in?(course)
    UserGroup.find_by(user: self, group: course.group).present?
  end
end
