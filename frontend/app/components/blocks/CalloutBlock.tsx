import { CalloutContent } from '@/lib/types/content-blocks';

interface CalloutBlockProps {
  content: CalloutContent;
}

export function CalloutBlock({ content }: CalloutBlockProps) {
  const styleClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 flex items-start gap-3 ${styleClasses[content.style]}`}>
      <span className="text-xl flex-shrink-0">{content.icon}</span>
      <div className="flex-1">{content.text}</div>
    </div>
  );
}