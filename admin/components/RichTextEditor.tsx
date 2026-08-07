"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useState } from "react";

/**
 * The article editor.
 *
 * TipTap, headless — so it inherits the admin's Tailwind rather than fighting
 * an imported stylesheet, and the editing surface can carry the exact
 * `.article-body` rules the public page uses. What an author sees is what
 * ships.
 *
 * The toolbar is deliberately short. Tables, colours, font pickers and text
 * alignment are all ways for a non-technical author to break the article
 * typography, and none of them earn their place in a company blog.
 *
 * Output is HTML, written into a hidden input so the surrounding form submits
 * it as an ordinary field. It is sanitised server-side on save — see
 * `server/src/services/sanitise.ts`. Never trusted as given.
 */
export default function RichTextEditor({
  name,
  defaultValue = "",
  error,
}: {
  name: string;
  defaultValue?: string;
  error?: string;
}) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    // Server-rendering a contenteditable causes a hydration mismatch, and Next
    // warns about it explicitly.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        // Nothing in a company blog needs a code block.
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ["http", "https", "mailto", "tel"],
      }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "article-body focus:outline-none",
        "data-placeholder": "Start writing…",
      },
    },
    onUpdate: ({ editor: e }) => setHtml(e.getHTML()),
  });

  return (
    <div>
      <span className="block text-sm font-semibold text-ink-800">Article</span>

      {/* What the form actually submits. */}
      <input type="hidden" name={name} value={html} />

      <div
        className={`mt-1.5 overflow-hidden rounded-lg border ${
          error ? "border-red-400" : "border-ink-200"
        }`}
      >
        <Toolbar editor={editor} />
        <div className="bg-white px-5 py-4">
          <EditorContent editor={editor} />
        </div>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      ) : (
        <p className="mt-1.5 text-xs text-ink-400">
          Formatting is limited on purpose, so articles stay consistent. Links to other sites open
          in a new tab automatically.
        </p>
      )}
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) {
    return <div className="h-11 border-b border-ink-100 bg-ink-50" />;
  }

  const button = (
    label: string,
    onClick: () => void,
    active = false,
    title?: string
  ) => (
    <button
      key={label}
      type="button"
      onClick={onClick}
      title={title ?? label}
      aria-pressed={active}
      className={`h-8 min-w-8 rounded px-2 text-xs font-semibold transition-colors ${
        active ? "bg-brand-500 text-white" : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
      }`}
    >
      {label}
    </button>
  );

  function setLink() {
    const previous = editor!.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");

    if (url === null) return;
    if (url === "") {
      editor!.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor!.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-ink-100 bg-ink-50 px-2 py-1.5">
      {button("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Bold")}
      {button("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Italic")}

      <span className="mx-1 h-5 w-px bg-ink-200" />

      {button("H2", () => editor.chain().focus().toggleHeading({ level: 2 }).run(), editor.isActive("heading", { level: 2 }))}
      {button("H3", () => editor.chain().focus().toggleHeading({ level: 3 }).run(), editor.isActive("heading", { level: 3 }))}

      <span className="mx-1 h-5 w-px bg-ink-200" />

      {button("• List", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"))}
      {button("1. List", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"))}
      {button("Quote", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"))}

      <span className="mx-1 h-5 w-px bg-ink-200" />

      {button("Link", setLink, editor.isActive("link"))}
      {button("Clear", () => editor.chain().focus().unsetAllMarks().clearNodes().run(), false, "Remove formatting")}

      <span className="ml-auto flex gap-1">
        {button("↶", () => editor.chain().focus().undo().run(), false, "Undo")}
        {button("↷", () => editor.chain().focus().redo().run(), false, "Redo")}
      </span>
    </div>
  );
}
