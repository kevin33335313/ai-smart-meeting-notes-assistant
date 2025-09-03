interface Heading2BlockProps {
  content: { text: string };
}

export function Heading2Block({ content }: Heading2BlockProps) {
  return <h2 className="text-2xl font-bold mb-4">{content.text}</h2>;
}