import PropTypes from 'prop-types';
import { Textarea } from "@/components/ui/textarea";

const RichTextEditor = ({ value = "", onChange }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <Textarea
      placeholder="Write your course description here..."
      value={value}
      onChange={handleChange}
      className="min-h-[200px]"
    />
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

export default RichTextEditor; 