import { useState } from 'react';
import { ContentBlock } from '@/lib/types/content-blocks';

interface BlockRendererProps {
  blocks: any;
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  // 安全檢查
  if (!blocks) {
    return <div>無內容</div>;
  }
  
  if (!Array.isArray(blocks)) {
    console.error('blocks is not an array:', blocks);
    return <div>內容格式錯誤</div>;
  }
  
  if (blocks.length === 0) {
    return <div>無內容區塊</div>;
  }

  const renderBlock = (block: any, index: number): JSX.Element => {
    // 確保 block 是有效物件
    if (!block || typeof block !== 'object') {
      console.warn('Invalid block at index', index, ':', block);
      return <div key={index}>無效區塊</div>;
    }

    if (!block.type) {
      console.warn('Block missing type at index', index, ':', block);
      return <div key={index}>缺少類型</div>;
    }

    const content = block.content || {};
    
    try {
      switch (block.type) {
        case 'heading_2':
          return <Heading2Block key={index} content={content} index={index} />;
        case 'callout':
          return <CalloutBlock key={index} content={content} />;
        case 'bullet_list':
          return <BulletListBlock key={index} content={content} />;
        case 'toggle_list':
          return <ToggleListBlock key={index} content={content} />;
        case 'code':
          return <CodeBlock key={index} content={content} />;
        default:
          return <div key={index}>未知類型: {String(block.type)}</div>;
      }
    } catch (error) {
      console.error('Error rendering block at index', index, ':', error);
      return <div key={index}>渲染錯誤</div>;
    }
  };
  
  return (
    <div className="prose prose-lg max-w-none">
      <div className="space-y-6">
        {blocks.map((block: any, index: number) => renderBlock(block, index))}
      </div>
    </div>
  );
}

function Heading2Block({ content, index }: { content: any, index?: number }) {
  const text = typeof content?.text === 'string' ? content.text : JSON.stringify(content?.text || '無標題');
  const headingId = `heading-${index}`;
  
  return (
    <div className="mb-8 mt-12 first:mt-0">
      <h2 
        id={headingId}
        className="text-2xl font-bold text-gray-900 leading-tight mb-4 pb-2 border-b border-gray-200 scroll-mt-24"
      >
        {text}
      </h2>
    </div>
  );
}

function CalloutBlock({ content }: { content: any }) {
  const styleClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800 shadow-blue-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 shadow-amber-100',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100'
  };
  
  const text = typeof content?.text === 'string' ? content.text : JSON.stringify(content?.text || '無內容');
  const icon = typeof content?.icon === 'string' ? content.icon : '📝';
  
  return (
    <div className={`p-5 rounded-xl border-l-4 flex items-start gap-4 shadow-sm ${styleClasses[content?.style] || styleClasses.info} mb-6`}>
      <span className="text-2xl flex-shrink-0 mt-0.5">{icon}</span>
      <div className="flex-1 leading-relaxed font-medium">{text}</div>
    </div>
  );
}

function BulletListBlock({ content }: { content: any }) {
  const items = content?.items || [];
  
  // 檢查項目是否為子標題（雙星號格式）
  const isSubheading = (text: string) => {
    return text.startsWith('**') && text.includes('**') && text.length > 4;
  };
  
  // 移除雙星號並返回純文本
  const cleanSubheading = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '$1');
  };
  
  return (
    <div className="mb-6">
      <ul className="space-y-3">
        {items.map((item: any, i: number) => {
          const text = typeof item === 'string' ? item : JSON.stringify(item);
          
          if (isSubheading(text)) {
            return (
              <li key={i} className="mt-6 first:mt-0">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                  {cleanSubheading(text)}
                </h4>
              </li>
            );
          }
          
          return (
            <li key={i} className="flex items-start gap-3 text-gray-700 leading-relaxed ml-6">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2.5 flex-shrink-0"></span>
              <span>{text}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ToggleListBlock({ content }: { content: any }) {
  const summary = typeof content?.summary === 'string' ? content.summary : JSON.stringify(content?.summary || '摘要');
  
  // 處理 details 欄位的嵌套結構
  const renderDetails = () => {
    if (typeof content?.details === 'string') {
      return <p className="text-gray-600 leading-relaxed">{content.details}</p>;
    }
    
    // 如果 details 是陣列，嘗試解析為 content blocks
    if (Array.isArray(content?.details)) {
      return (
        <div className="space-y-3">
          {content.details.map((block: any, index: number) => {
            if (block?.type === 'bullet_list' && block?.content?.items) {
              return (
                <ul key={index} className="space-y-2 ml-2">
                  {block.content.items.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              );
            }
            return <div key={index} className="text-sm text-gray-500">{JSON.stringify(block)}</div>;
          })}
        </div>
      );
    }
    
    return <p className="text-gray-500">{JSON.stringify(content?.details || '無詳細內容')}</p>;
  };
  
  return (
    <div className="mb-6">
      <details className="border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <summary className="cursor-pointer font-medium p-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center gap-2">
          <span className="text-gray-600">▶</span>
          {summary}
        </summary>
        <div className="p-4 bg-white border-t border-gray-100">{renderDetails()}</div>
      </details>
    </div>
  );
}

function CodeBlock({ content }: { content: any }) {
  const text = typeof content?.text === 'string' ? content.text : JSON.stringify(content?.text || '');
  const language = content?.language || 'text';
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('複製失敗:', error);
    }
  };
  
  return (
    <div className="mb-6">
      <div className="bg-gray-900 rounded-t-lg px-4 py-2 flex items-center justify-between">
        <span className="text-gray-300 text-sm font-mono">{language}</span>
        <button 
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-200 text-sm transition-colors" 
          title="複製代碼"
        >
          {copied ? '✓ 已複製' : '複製'}
        </button>
      </div>
      <pre className="bg-gray-800 text-gray-100 p-4 rounded-b-lg overflow-x-auto font-mono text-sm leading-relaxed">
        <code>{text}</code>
      </pre>
    </div>
  );
}