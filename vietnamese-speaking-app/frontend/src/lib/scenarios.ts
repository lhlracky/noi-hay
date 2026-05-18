export interface Scenario {
  id: string
  titleVi: string
  titleZh: string
  icon: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  category: string
  description: string
  vocabulary: Array<{ vi: string; zh: string; phonetic: string }>
  dialogues: Array<{
    role: 'ai' | 'user'
    text: string
    zh: string
    audioHint?: string
  }>
}

export const scenarios: Scenario[] = [
  {
    id: 'greeting',
    titleVi: 'Chào hỏi',
    titleZh: '打招呼',
    icon: '👋',
    level: 'A1',
    category: '日常',
    description: '学习越南语最基本的问候方式',
    vocabulary: [
      { vi: 'Xin chào', zh: '你好', phonetic: 'sin 照' },
      { vi: 'Tạm biệt', zh: '再见', phonetic: '达姆 别' },
      { vi: 'Cảm ơn', zh: '谢谢', phonetic: '感恩' },
      { vi: 'Xin lỗi', zh: '对不起', phonetic: 'sin 垒' },
      { vi: 'Không có gì', zh: '不客气', phonetic: '空 哥 依' },
    ],
    dialogues: [
      { role: 'ai', text: 'Xin chào! Bạn khỏe không?', zh: '你好！你好吗？' },
      { role: 'user', text: 'Xin chào! Tôi khỏe, cảm ơn.', zh: '你好！我很好，谢谢。' },
      { role: 'ai', text: 'Rất vui được gặp bạn!', zh: '很高兴见到你！' },
      { role: 'user', text: 'Tôi cũng vậy!', zh: '我也是！' },
      { role: 'ai', text: 'Bạn tên gì?', zh: '你叫什么名字？' },
      { role: 'user', text: 'Tôi tên là..., rất vui được biết bạn.', zh: '我叫...，很高兴认识你。' },
    ]
  },
  {
    id: 'restaurant',
    titleVi: 'Nhà hàng',
    titleZh: '餐厅点餐',
    icon: '🍜',
    level: 'A1',
    category: '餐饮',
    description: '在越南餐厅点餐的常用对话',
    vocabulary: [
      { vi: 'Thực đơn', zh: '菜单', phonetic: '特克 多' },
      { vi: 'Phở', zh: '河粉', phonetic: '佛' },
      { vi: 'Bún chả', zh: '烤肉米粉', phonetic: '奔 察' },
      { vi: 'Nước mắm', zh: '鱼露', phonetic: '诺克 姆' },
      { vi: 'Tính tiền', zh: '买单', phonetic: '丁 田' },
    ],
    dialogues: [
      { role: 'ai', text: 'Chào anh/chị! Anh/chị muốn gọi gì?', zh: '您好！您想点什么？' },
      { role: 'user', text: 'Cho tôi một phở bò.', zh: '给我一碗牛肉河粉。' },
      { role: 'ai', text: 'Dạ, anh muốn phở tái hay chín?', zh: '好的，您要生牛肉还是熟牛肉？' },
      { role: 'user', text: 'Phở tái, và một cốc nước cam.', zh: '生牛肉河粉，再加一杯橙汁。' },
      { role: 'ai', text: 'Dạ, xin chờ một chút nhé!', zh: '好的，请稍等！' },
      { role: 'user', text: 'Cảm ơn! Cho tôi tính tiền.', zh: '谢谢！请帮我买单。' },
    ]
  },
  {
    id: 'taxi',
    titleVi: 'Đi taxi',
    titleZh: '打车出行',
    icon: '🚕',
    level: 'A1',
    category: '交通',
    description: '打车、告诉目的地、询问价格',
    vocabulary: [
      { vi: 'Taxi', zh: '出租车', phonetic: '塔克西' },
      { vi: 'Bao nhiêu tiền?', zh: '多少钱？', phonetic: '包 妞 田' },
      { vi: 'Đi đến...', zh: '去...', phonetic: '低 登...' },
      { vi: 'Dừng lại', zh: '停车', phonetic: '等 拉衣' },
      { vi: 'Sân bay', zh: '机场', phonetic: '山 拜' },
    ],
    dialogues: [
      { role: 'ai', text: 'Anh muốn đi đâu?', zh: '您想去哪里？' },
      { role: 'user', text: 'Đi đến khách sạn, làm ơn.', zh: '请去酒店。' },
      { role: 'ai', text: 'Dạ, anh ở khách sạn nào?', zh: '好的，您住哪个酒店？' },
      { role: 'user', text: 'Khách sạn Sofitel, gần hồ Hoàn Kiếm.', zh: '索菲特酒店，靠近还剑湖。' },
      { role: 'ai', text: 'Dạ, khoảng 20 phút. Giá khoảng 150 nghìn.', zh: '好的，大约20分钟。价格大约15万盾。' },
      { role: 'user', text: 'Được, cảm ơn. Dừng lại ở đây nhé!', zh: '好的，谢谢。请在这里停车！' },
    ]
  },
  {
    id: 'shopping',
    titleVi: 'Mua sắm',
    titleZh: '市场购物',
    icon: '🛒',
    level: 'A2',
    category: '购物',
    description: '在越南市场询价、砍价',
    vocabulary: [
      { vi: 'Bao nhiêu?', zh: '多少？', phonetic: '包 妞' },
      { vi: 'Đắt quá!', zh: '太贵了！', phonetic: '达特 瓜' },
      { vi: 'Rẻ hơn', zh: '便宜点', phonetic: '惹 很' },
      { vi: 'Được rồi', zh: '好吧', phonetic: '得克 诺衣' },
      { vi: 'Màu sắc', zh: '颜色', phonetic: '冒 萨克' },
    ],
    dialogues: [
      { role: 'ai', text: 'Chị ơi, xem đi! Áo đẹp lắm!', zh: '小姐姐，看看！衣服很漂亮！' },
      { role: 'user', text: 'Cái này bao nhiêu tiền?', zh: '这个多少钱？' },
      { role: 'ai', text: 'Dạ, hai trăm nghìn một cái.', zh: '20万盾一件。' },
      { role: 'user', text: 'Đắt quá! Rẻ hơn được không?', zh: '太贵了！能便宜点吗？' },
      { role: 'ai', text: 'Dạ, chị mua hai cái, bốn trăm nghìn thôi.', zh: '买两件的话，40万盾就好。' },
      { role: 'user', text: 'Được rồi, cho tôi hai cái.', zh: '好吧，给我两件。' },
    ]
  },
  {
    id: 'hotel',
    titleVi: 'Khách sạn',
    titleZh: '酒店入住',
    icon: '🏨',
    level: 'A2',
    category: '住宿',
    description: '酒店预订、入住、退房',
    vocabulary: [
      { vi: 'Phòng', zh: '房间', phonetic: '风' },
      { vi: 'Đặt trước', zh: '预订', phonetic: '达特 金' },
      { vi: 'Chìa khóa', zh: '钥匙', phonetic: '其阿 卡' },
      { vi: 'Check-in', zh: '入住', phonetic: '切克因' },
      { vi: 'Check-out', zh: '退房', phonetic: '切克奥特' },
    ],
    dialogues: [
      { role: 'ai', text: 'Chào anh! Anh đã đặt phòng chưa?', zh: '您好！您预订房间了吗？' },
      { role: 'user', text: 'Rồi, tôi đặt phòng cho hai người.', zh: '是的，我预订了两人间。' },
      { role: 'ai', text: 'Dạ, anh cho tôi xem hộ chiếu được không?', zh: '好的，能给我看一下护照吗？' },
      { role: 'user', text: 'Đây, hộ chiếu của tôi.', zh: '这是我的护照。' },
      { role: 'ai', text: 'Dạ, phòng 302. Đây là chìa khóa.', zh: '好的，302房间。这是钥匙。' },
      { role: 'user', text: 'Cảm ơn! Wifi mật khẩu là gì?', zh: '谢谢！Wifi密码是什么？' },
    ]
  },
  {
    id: 'doctor',
    titleVi: 'Bệnh viện',
    titleZh: '看医生',
    icon: '🏥',
    level: 'B1',
    category: '医疗',
    description: '描述症状、看诊、买药',
    vocabulary: [
      { vi: 'Đau', zh: '痛', phonetic: '道' },
      { vi: 'Sốt', zh: '发烧', phonetic: '索特' },
      { vi: 'Thuốc', zh: '药', phonetic: '图克' },
      { vi: 'Bác sĩ', zh: '医生', phonetic: '巴克 西' },
      { vi: 'Khám bệnh', zh: '看病', phonetic: '卡姆 病' },
    ],
    dialogues: [
      { role: 'ai', text: 'Anh bị sao vậy?', zh: '你怎么了？' },
      { role: 'user', text: 'Tôi bị đau đầu và sốt.', zh: '我头疼而且发烧。' },
      { role: 'ai', text: 'Bao lâu rồi? Có ho không?', zh: '多久了？咳嗽吗？' },
      { role: 'user', text: 'Hai ngày rồi. Ho nhẹ.', zh: '两天了。轻微咳嗽。' },
      { role: 'ai', text: 'Để tôi khám. Anh bị cảm cúm nhẹ.', zh: '让我检查一下。你得了轻度流感。' },
      { role: 'user', text: 'Có cần uống thuốc gì không?', zh: '需要吃什么药吗？' },
    ]
  },
]

export function getScenario(id: string): Scenario | undefined {
  return scenarios.find(s => s.id === id)
}
