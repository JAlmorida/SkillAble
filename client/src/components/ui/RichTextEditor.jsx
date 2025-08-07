import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { ChevronDown, Bold, Italic, Underline as UnderlineIcon, Highlighter, List, ListOrdered, Quote, Code, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify, Undo, Redo, Minus, CornerDownLeft, Image as ImageIcon, Table as TableIcon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import React, { useEffect } from 'react';

// Add custom styles for the editor
const editorStyles = `
  .ProseMirror {
    min-height: 200px;
    padding: 1rem;
    outline: none;
    cursor: text;
    border: none;
    background: transparent;
  }
  
  .ProseMirror:focus {
    outline: none;
  }
  
  .ProseMirror p.is-editor-empty:first-child::before {
    color: #adb5bd;
    content: "Start typing...";
    float: left;
    height: 0;
    pointer-events: none;
  }
  
  .ProseMirror h1 {
    font-size: 2em;
    font-weight: bold;
    margin: 0.67em 0;
  }
  
  .ProseMirror h2 {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0.75em 0;
  }
  
  .ProseMirror h3 {
    font-size: 1.17em;
    font-weight: bold;
    margin: 0.83em 0;
  }
  
  .ProseMirror p {
    margin: 0.5em 0;
  }
  
  .ProseMirror ul, .ProseMirror ol {
    padding-left: 1.5em;
  }
  
  .ProseMirror blockquote {
    border-left: 3px solid #ddd;
    margin: 0.5em 0;
    padding-left: 1em;
  }
  
  .ProseMirror code {
    background-color: #f1f1f1;
    padding: 0.2em 0.4em;
    border-radius: 3px;
  }
  
  .ProseMirror pre {
    background-color: #f1f1f1;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
  }
`;

const MenuBar = ({ editor, onImageUpload }) => {
  const inputRef = React.useRef(null);

  const handleImageUpload = () => {
    inputRef.current?.click();
  };

  const addImage = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64data = e.target?.result;
        if (base64data) {
          editor.chain().focus().setImage({ src: base64data }).run();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="h-8 w-8 p-0"
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="h-8 w-8 p-0"
      >
        <Redo className="h-4 w-4" />
      </Button>

      {/* Headings Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            Heading <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <Heading1 className="h-4 w-4 mr-2" />
            Heading 1
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <Heading2 className="h-4 w-4 mr-2" />
            Heading 2
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <Heading3 className="h-4 w-4 mr-2" />
            Heading 3
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              editor.chain().focus().setParagraph().run();
            }}
            className={editor.isActive('paragraph') ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            Paragraph
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Alignment */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <AlignLeft className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <AlignLeft className="h-4 w-4 mr-2" />
            Left
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <AlignCenter className="h-4 w-4 mr-2" />
            Center
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <AlignRight className="h-4 w-4 mr-2" />
            Right
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={editor.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 dark:bg-blue-900' : ''}
          >
            <AlignJustify className="h-4 w-4 mr-2" />
            Justify
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <span className="line-through text-sm">S</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('highlight') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <Highlighter className="h-4 w-4" />
      </Button>

      {/* Lists */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('orderedList') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>

      {/* Block Elements */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('blockquote') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`h-8 w-8 p-0 ${editor.isActive('codeBlock') ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="h-8 w-8 p-0"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="h-8 w-8 p-0"
      >
        <CornerDownLeft className="h-4 w-4" />
      </Button>

      {/* Color Picker */}
      <input
        type="color"
        onInput={(event) => editor.chain().focus().setColor(event.target.value).run()}
        defaultValue="#000000"
        className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
        title="Text Color"
      />

      {/* Tables */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <TableIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
            Insert Table
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnBefore().run()} disabled={!editor.can().addColumnBefore()}>
            Add Column Before
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addColumnAfter().run()} disabled={!editor.can().addColumnAfter()}>
            Add Column After
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteColumn().run()} disabled={!editor.can().deleteColumn()}>
            Delete Column
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowBefore().run()} disabled={!editor.can().addRowBefore()}>
            Add Row Before
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().addRowAfter().run()} disabled={!editor.can().addRowAfter()}>
            Add Row After
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteRow().run()} disabled={!editor.can().deleteRow()}>
            Delete Row
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => editor.chain().focus().deleteTable().run()} disabled={!editor.can().deleteTable()}>
            Delete Table
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Image Upload */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleImageUpload}
        className="h-8 w-8 p-0"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <input
        type="file"
        onChange={addImage}
        ref={inputRef}
        className="hidden"
        accept="image/jpeg,image/gif,image/png,image/webp"
      />
    </div>
  );
};

const RichTextEditor = ({ input, setInput }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        allowBase64: true,
        inline: true
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight,
      Table.configure({
        resizable: true
      }),
      TableCell,
      TableHeader,
      TableRow,
      Color,
      TextStyle,
    ],
    content: input.description,
    onUpdate: ({ editor }) => {
      setInput({ ...input, description: editor.getHTML() });
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
    editable: true,
  });

  // Update editor content when input.description changes
  useEffect(() => {
    if (editor && input.description !== editor.getHTML()) {
      editor.commands.setContent(input.description || '');
    }
  }, [editor, input.description]);

  // Handle editor focus and click events
  useEffect(() => {
    if (editor) {
      const handleClick = (event) => {
        // Focus the editor when clicking anywhere in the content area
        if (event.target.closest('.ProseMirror')) {
          editor.commands.focus();
        }
      };
      
      const editorElement = editor.view.dom;
      editorElement.addEventListener('click', handleClick);
      
      return () => {
        editorElement.removeEventListener('click', handleClick);
      };
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-lg bg-white dark:bg-gray-900 overflow-hidden">
      <style>{editorStyles}</style>
      <MenuBar editor={editor} />
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="min-h-[200px] cursor-text"
          style={{ 
            minHeight: '200px',
            cursor: 'text'
          }}
        />
      </div>
    </div>
  );
};

export default RichTextEditor;