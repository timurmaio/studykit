class CourseSerializer < BaseCourseSerializer
  belongs_to :owner
  has_many :lectures

  # TODO: remove god-like course object, which includes lectures, lecture_contents and etc.
  def lectures
    object.lectures.order(:serial_number)
  end

  # TODO: remove this shit
  attribute :solved_ids, if: :solved_ids?

  def solved_ids
    instance_options[:solved_ids]
  end

  def solved_ids?
    !solved_ids.nil?
  end
end
