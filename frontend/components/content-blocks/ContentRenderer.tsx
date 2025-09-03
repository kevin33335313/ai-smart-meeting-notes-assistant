'use client';

import { ContentBlock } from '@/lib/types/content-blocks';
import { Heading2Block } from './Heading2Block';
import { BulletListBlock } from './BulletListBlock';
import { ToggleListBlock } from './ToggleListBlock';
import { CalloutBlock } from './CalloutBlock';
import { CodeBlock } from './CodeBlock';

interface ContentRendererProps {
  blocks: ContentBlock[];
}

// 主要內容渲染器組件
export function ContentRenderer({ blocks }: ContentRendererProps) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        switch (block.type) {
          case 'heading_2':
            return <Heading2Block key={index} content={block.content} />;
          case 'bullet_list':
            return <BulletListBlock key={index} content={block.content} />;
          case 'toggle_list':
            return <ToggleListBlock key={index} content={block.content} />;
          case 'callout':
            return <CalloutBlock key={index} content={block.content} />;
          case 'code':
            return <CodeBlock key={index} content={block.content} />;
          default:
            return null;
        }
      })}
    </div>
  );
}