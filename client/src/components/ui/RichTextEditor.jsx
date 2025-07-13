import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({input, setInput}) => {
  const handleChange = (content) => {
    setInput({...input, description:content});
  };

  // Detect dark mode (adjust if you use a different method)
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <ReactQuill
      theme="snow"
      value={input.description}
      onChange={handleChange}
      className={isDark ? 'quill-dark' : ''}
    />
  );
};
export default RichTextEditor;