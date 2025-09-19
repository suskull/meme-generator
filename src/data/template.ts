import { MemeState, TemplateConfig } from '../types';

export const DEFAULT_MEME_STATE: MemeState = {
  messages: [
    {
      id: '1',
      text: 'b ơi, t bị phân vân',
      type: 'received'
    },
    {
      id: '2',
      text: 'Làm sao',
      type: 'sent'
    },
    {
      id: '3',
      text: 'nếu như bạn có 45k thì b sẽ làm gì?',
      type: 'received'
    },
    {
      id: '4',
      text: '1. Đi mua vietlot\n2. Đi Neko massage\n3. Trả n.ợ đồng nghiệp tiền bún cá trưa hôm qua',
      type: 'received'
    },
    {
      id: '5',
      text: 'Quên chưa trả tiền bún cá nhỉ',
      type: 'sent'
    },
    {
      id: '6',
      text: 'Gửi stk',
      type: 'sent'
    },
    {
      id: '7',
      text: 'hahaha, không có gì đâu. Đồng nghiệp với nhau mà 1008567447 vcb',
      type: 'received',
      image: {
        url: '/assets/images/default-qr.png',
        alt: 'QR Code for bank transfer',
        width: 150,
        height: 150
      }
    }
  ],
  metadata: {
    contactName: 'Bánh',
    timestamp: '24 Jul 11:49 PM',
    phoneNumber: '1466',
    platform: 'SMS'
  }
};

export const TEMPLATE_CONFIG: TemplateConfig = {
  defaultState: DEFAULT_MEME_STATE,
  maxTextLength: 500,
  allowedFormats: ['png', 'jpg', 'jpeg']
};