class LectureContentSerializer < ActiveModel::Serializer
  def self.serializer_for(model, _options)
    "#{model.class}Serializer".constantize
  end

  attributes :id, :type, :lecture_id, :serial_number

  def id
    object.acting_as.id
  end
end
