export interface Card {
  serial_number: string;
  name: string;
  description: string;
  image_url: string;
  atk: number;
  hp: number;
  type: "character" | "re-birth" | "partner";
  subtype: "member" | "spark" | "guard" | "cancel";
  zone:
    | "deck"
    | "hand"
    | "entry"
    | "member1"
    | "member2"
    | "member3"
    | "waiting"
    | "retire"
    | "re-birth"
    | "energy"
    | "partner";
  is_first_entry: boolean;
  state: {
    is_animating: boolean;
    is_fading_in: boolean;
    is_fading_out: boolean;
    is_flipped: boolean;
    is_selected: boolean;
    is_tapped: boolean;
  };
}
