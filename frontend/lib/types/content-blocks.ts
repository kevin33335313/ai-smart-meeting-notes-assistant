// 內容區塊類型定義
export type BlockType = 'heading_2' | 'bullet_list' | 'toggle_list' | 'callout' | 'code';

// 各種內容類型
export interface Heading2Content {
  text: string;
}

export interface BulletListContent {
  items: string[];
}

export interface ToggleListContent {
  summary: string;
  details: string;
}

export interface CalloutContent {
  icon: string;
  style: 'info' | 'warning' | 'success';
  text: string;
}

export interface CodeContent {
  language: string;
  text: string;
}

// 內容區塊聯合類型
export type ContentBlockContent = 
  | Heading2Content 
  | BulletListContent 
  | ToggleListContent 
  | CalloutContent 
  | CodeContent;

// 內容區塊介面
export interface ContentBlock {
  type: BlockType;
  content: ContentBlockContent;
}

// 會議筆記結構
export interface MeetingNotes {
  blocks: ContentBlock[];
}