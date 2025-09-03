import { CalloutContent } from '@/lib/types/content-blocks';
import { cn } from '@/lib/utils';

interface CalloutBlockProps {
  content: CalloutContent;
}

// 引言框組件
export function CalloutBlock({ content }: CalloutBlockProps) {
  const styleClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={cn(
      'p-4 rounded-lg border-l-4 flex items-start gap-3',
      styleClasses[content.style]
    )}>
      <span className="text-xl">{content.icon}</span>
      <p className="flex-1 font-medium">{content.text}</p>
    </div>
  );
}