import { type Card } from "./CardManager";

// 기본 카드 상태 (모든 카드에 공통으로 적용될 초기 상태)
const defaultCardState = {
  is_animating: false,
  is_fading_in: false,
  is_fading_out: false,
  is_flipped: false,
  is_selected: false,
  is_tapped: false,
};

// 샘플 카드 데이터
export const cardList: Card[] = [
  {
    serial_number: "C001",
    name: "불의 검사",
    description: "공격 시 추가 데미지 +2",
    image_url:
      "https://s3-ap-northeast-1.amazonaws.com/rebirth-fy.com/wordpress/wp-content/uploads/2025/03/RB_IMS_002B_115RRR.png",
    atk: 5,
    hp: 4,
    type: "character",
    subtype: "member",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "C002",
    name: "물의 마법사",
    description: "방어력 +1",
    image_url: "/images/cards/water-mage.jpg",
    atk: 3,
    hp: 6,
    type: "character",
    subtype: "member",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "C003",
    name: "회복 요정",
    description: "턴 종료 시 HP 1 회복",
    image_url: "/images/cards/healing-fairy.jpg",
    atk: 2,
    hp: 3,
    type: "character",
    subtype: "spark",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  // 여기에 더 많은 카드 추가 (총 카드 수를 적절히 늘려주세요)
  {
    serial_number: "R001",
    name: "부활의 빛",
    description: "은퇴 영역에서 캐릭터 하나를 부활시킵니다",
    image_url: "/images/cards/rebirth-light.jpg",
    atk: 0,
    hp: 0,
    type: "re-birth",
    subtype: "spark",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P001",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P002",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P003",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P004",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P005",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P006",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P007",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P008",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P009",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P010",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  {
    serial_number: "P011",
    name: "충성스러운 파트너",
    description: "자신의 턴에 한 번, 데미지를 1 줄일 수 있습니다",
    image_url: "/images/cards/loyal-partner.jpg",
    atk: 1,
    hp: 3,
    type: "partner",
    subtype: "guard",
    zone: "deck",
    is_first_entry: false,
    state: { ...defaultCardState },
  },
  // 추가 카드들...
];

// 카드 ID로 카드 찾기 함수
export function findCardBySerialNumber(serialNumber: string): Card | undefined {
  return cardList.find((card) => card.serial_number === serialNumber);
}

// 카드 타입별로 필터링하는 함수
export function filterCardsByType(type: Card["type"]): Card[] {
  return cardList.filter((card) => card.type === type);
}
