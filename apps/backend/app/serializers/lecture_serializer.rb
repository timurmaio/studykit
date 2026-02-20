class LectureSerializer < ActiveModel::Serializer
  attributes :id, :title, :serial_number, :course_id, :content

  def content
    collection = object.content.order(:serial_number).map(&:specific)
    ActiveModel::Serializer::CollectionSerializer.new(collection,
                                                      each_serializer: LectureContentSerializer)
  end
end
