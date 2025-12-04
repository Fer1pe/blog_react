// src/Components/RichTextEditor/index.js
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Importa o CSS do tema 'snow'

// Módulos de formatação que serão exibidos na barra de ferramentas
const modules = {
  toolbar: [
    [{ 'header': [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ['link', 'image'],
    ['clean']
  ],
};

// Formatos permitidos
const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike', 'blockquote',
  'list', 'bullet',
  'link', 'image'
];


export default function RichTextEditor({ value, onChange, placeholder }) {
  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      placeholder={placeholder}
    />
  );
}