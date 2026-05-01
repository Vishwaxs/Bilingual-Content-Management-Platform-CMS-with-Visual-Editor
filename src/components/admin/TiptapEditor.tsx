import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { Button } from '@/components/ui/button';
import { Bold, Italic, Underline as UnderlineIcon, Heading2, List, ListOrdered, Link as LinkIcon, Image as ImageIcon, Undo, Redo } from 'lucide-react';
import { useCallback, useEffect } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const TiptapEditor = ({ content, onChange, placeholder }: TiptapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false }),
      Underline,
      Image,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-3 focus:outline-none font-body text-foreground',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter URL');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor) return;
    const url = prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  if (!editor) return null;

  const btnClass = (active: boolean) =>
    `h-8 w-8 p-0 ${active ? 'bg-accent text-accent-foreground' : ''}`;

  return (
    <div className="border rounded-md overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 border-b bg-muted/50">
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className={btnClass(editor.isActive('link'))} onClick={setLink}>
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={btnClass(false)} onClick={addImage}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button type="button" variant="ghost" size="icon" className={btnClass(false)} onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className={btnClass(false)} onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
