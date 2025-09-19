export interface Message {
  id: string;
  text: string;
  type: 'sent' | 'received';
  timestamp?: string;
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export interface MemeMetadata {
  contactName: string;
  timestamp: string;
  phoneNumber: string;
  platform: string;
}

export interface MemeState {
  messages: Message[];
  metadata: MemeMetadata;
}

export interface TemplateConfig {
  defaultState: MemeState;
  maxTextLength: number;
  allowedFormats: string[];
}