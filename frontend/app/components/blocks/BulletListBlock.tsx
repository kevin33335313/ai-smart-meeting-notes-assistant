interface BulletListBlockProps {
  content: { items: string[] };
}

export function BulletListBlock({ content }: BulletListBlockProps) {
  return (
    <ul className="list-disc pl-6 space-y-2">
      {content.items.map((item, i) => (
        <li key={i} className="text-gray-700">{item}</li>
      ))}
    </ul>
  );
}