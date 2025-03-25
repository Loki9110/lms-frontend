import { useState, useEffect } from 'react';

// Simple textarea-based editor as fallback
const RichTextEditor = (props) => {
  const { input, setInput, value, onChange } = props;
  const [content, setContent] = useState('');
  
  // Sync with external value or input
  useEffect(() => {
    if (value !== undefined) {
      setContent(value);
    } else if (input?.description) {
      setContent(input.description);
    }
  }, [value, input]);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    if (onChange) {
      // For direct value/onChange usage
      onChange(newContent);
    } else if (setInput) {
      // For the input/setInput pattern
      setInput({ ...input, description: newContent });
    }
  };
  
  return (
    <div className="rich-text-editor">
      <textarea
        className="w-full min-h-[200px] p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={content}
        onChange={handleChange}
        placeholder="Enter description..."
      />
      <p className="text-xs text-gray-500 mt-1">
        Rich text editor temporarily disabled. Simple text input is available.
      </p>
    </div>
  );
};

export default RichTextEditor;