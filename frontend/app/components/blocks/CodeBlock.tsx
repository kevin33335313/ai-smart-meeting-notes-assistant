interface CodeBlockProps {
  content: { language: string; text: string };
}

export function CodeBlock({ content }: CodeBlockProps) {
  return (
    <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
      <code>{content.text}</code>
    </pre>
  );
}