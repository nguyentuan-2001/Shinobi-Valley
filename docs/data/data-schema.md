# Hệ thống dữ liệu — Data Schema

Game sử dụng kiến trúc **Data Driven** — toàn bộ nội dung nằm trong JSON, không hardcode.

---

## crops.json

```json
{
  "id": "carrot",
  "name": "Cà rốt",
  "tier": "common",
  "seed_cost": 50,
  "growth_hours": 4,
  "multi_harvest": false,
  "harvest_count": 1,
  "regrow_hours": 0,
  "yield_min": 3,
  "yield_max": 5,
  "sell_price": 25,
  "unlock_level": 1,
  "needs_water_tile": false,
  "night_only": false,
  "special_tool": null,
  "crafting_tag": ["food"],

  "moisture_decay_per_hour": 12.5,
  "moisture_min": 50,
  "moisture_max": 100
}
```

**Các trường quan trọng:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | Định danh duy nhất |
| `tier` | enum | `common / mid / advanced / rare` |
| `seed_cost` | int | Giá mua hạt (đồng) |
| `growth_hours` | int | Giờ thực để chín lần đầu |
| `multi_harvest` | bool | Có thu hoạch nhiều lần không |
| `harvest_count` | int | Số lần thu hoạch tối đa |
| `regrow_hours` | int | Giờ thực để chín lại (nếu multi_harvest) |
| `yield_min / max` | int | Sản lượng ngẫu nhiên trong khoảng |
| `sell_price` | int | Giá bán mỗi đơn vị (đồng) |
| `unlock_level` | int | Level cần để trồng |
| `needs_water_tile` | bool | Cần ô đất cạnh nước (Hoa sen) |
| `night_only` | bool | Chỉ thu hoạch ban đêm (Hoa ánh trăng) |
| `special_tool` | string\|null | Công cụ đặc biệt cần thiết |
| `crafting_tag` | string[] | Nhóm nguyên liệu để filter khi craft |
| `moisture_decay_per_hour` | float | % giảm Độ ẩm mỗi giờ không tưới = `50 / growth_hours` |
| `moisture_min` | int | Sàn Độ ẩm tối thiểu, luôn = 50 |
| `moisture_max` | int | Trần Độ ẩm tối đa, luôn = 100 |

---

## items.json

```json
{
  "id": "iron_ore",
  "name": "Iron Ore",
  "type": "material",
  "rarity": "common",
  "sell_price": 40,
  "stack_max": 99,
  "description": "Quặng sắt khai thác từ mỏ đá.",
  "source": ["mine", "golem_drop"],
  "crafting_tag": ["metal", "smithing"]
}
```

**type enum:** `weapon / armor / tool / consumable / material / seed / fish / decoration / currency`

---

## weapons.json

```json
{
  "id": "iron_sword",
  "name": "Kiếm sắt",
  "type": "weapon",
  "weapon_class": "sword",
  "rank": "common",
  "atk": 20,
  "atk_multiplier": 1.0,
  "crit_bonus": 0,
  "attack_speed_bonus": 0,
  "skill_class": "swordsman",
  "buy_price": 500,
  "sell_price": 200,
  "craft_recipe": {
    "iron_ore": 5,
    "wood": 8
  },
  "unlock_level": 1,
  "enhancement_max": 10,
  "sub_stats": []
}
```

---

## armor.json

```json
{
  "id": "iron_chestplate",
  "name": "Giáp sắt",
  "slot": "chest",
  "rank": "epic",
  "def": 18,
  "hp_bonus": 0,
  "sub_stats": ["crit", "life_steal"],
  "craft_recipe": {
    "iron_ore": 15,
    "crystal": 5
  },
  "unlock_level": 30,
  "enhancement_max": 10
}
```

**slot enum:** `head / chest / hands / feet / ring / necklace`

---

## skills.json

```json
{
  "id": "quick_slash",
  "name": "Chém nhanh",
  "class": "swordsman",
  "skill_index": 1,
  "unlock_level": 1,
  "mp_cost": 10,
  "cooldown": 0,
  "damage_multiplier": 1.2,
  "hits": 1,
  "range": "melee",
  "aoe": false,
  "aoe_radius": 0,
  "effect": null,
  "effect_duration": 0,
  "type": "active"
}
```

**type enum:** `active / buff / debuff / passive / ultimate`
**effect enum:** `poison / bleed / slow / stun / burn / def_down / atk_up / null`

---

## monsters.json

```json
{
  "id": "wild_rabbit",
  "name": "Thỏ hoang",
  "map": "grassland",
  "type": "normal",
  "level": 2,
  "hp": 80,
  "atk": 8,
  "def": 2,
  "move_speed": 90,
  "exp": 15,
  "drop_table": [
    { "item": "monster_core", "chance": 0.8, "qty_min": 1, "qty_max": 2 },
    { "item": "rabbit_fur",   "chance": 0.5, "qty_min": 1, "qty_max": 1 }
  ],
  "drop_gold_min": 10,
  "drop_gold_max": 25,
  "is_boss": false
}
```

---

## npc.json

```json
{
  "id": "seed_seller",
  "name": "Người bán hạt giống",
  "location": "village",
  "shop_type": "seed",
  "quest_giver": false,
  "dialogue_default": "Hôm nay bạn muốn trồng gì?",
  "unlock_level": 1,
  "relationship_max": 10
}
```

---

## quests.json

```json
{
  "id": "q001_first_harvest",
  "name": "Thu hoạch đầu tiên",
  "giver": "village_chief",
  "type": "gather",
  "objective": {
    "item": "carrot",
    "quantity": 5
  },
  "reward": {
    "gold": 200,
    "exp": 100,
    "item": "iron_hoe"
  },
  "prerequisite_quest": null,
  "unlock_level": 1,
  "story_quest": true
}
```

---

## recipes.json

```json
{
  "id": "craft_iron_sword",
  "result_item": "iron_sword",
  "result_rank": "common",
  "result_qty": 1,
  "type": "fixed",
  "station": "blacksmith",
  "station_level": 1,
  "ingredients": [
    { "item": "iron_ore", "qty": 5 },
    { "item": "wood",     "qty": 8 }
  ],
  "craft_time": 0,
  "unlock_level": 1
}
```

**type enum:** `fixed / random`
**station enum:** `blacksmith / alchemist / kitchen / loom / field`

---

## fish.json

```json
{
  "id": "salmon",
  "name": "Cá Hồi",
  "rarity": "rare",
  "sell_price": 150,
  "location": ["river", "cave_pool"],
  "catch_time_min": 15,
  "catch_time_max": 30,
  "sweet_zone_size": 0.25,
  "luck_required": 0,
  "night_only": false
}
```

**Các trường quan trọng:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | Định danh duy nhất |
| `rarity` | enum | `common / uncommon / rare / epic / legendary` |
| `sell_price` | int | Giá bán (đồng) |
| `location` | string[] | Địa điểm có thể câu được |
| `catch_time_min / max` | int | Thời gian chờ cắn câu (giây) |
| `sweet_zone_size` | float | Kích thước vùng giật đúng lúc (0–1) |
| `luck_required` | int | Chỉ số may mắn tối thiểu cần có |
| `night_only` | bool | Chỉ xuất hiện ban đêm |

---

## professions.json

```json
{
  "id": "farmer",
  "name": "Nông Dân",
  "max_level": 10,
  "xp_per_level": 100,
  "unlock_condition": "plant_10_crops",
  "xp_sources": [
    { "action": "water_tile", "xp": 1 },
    { "action": "plant_crop", "xp": 2 },
    { "action": "harvest_crop", "xp": 5 },
    { "action": "use_fertilizer", "xp": 3 }
  ],
  "level_rewards": [
    { "level": 1, "effect": "moisture_decay_multiplier", "value": 0.9 },
    { "level": 3, "effect": "seed_cost_discount", "value": 0.1 },
    { "level": 5, "effect": "moisture_decay_multiplier", "value": 0.75 },
    { "level": 7, "effect": "harvest_yield_bonus_chance", "value": 0.1 },
    { "level": 10, "effect": "moisture_decay_multiplier", "value": 0.5 }
  ]
}
```

**Các trường quan trọng:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | Định danh nghề nghiệp |
| `max_level` | int | Cấp độ nghề tối đa |
| `xp_per_level` | int | XP cần để lên mỗi cấp |
| `unlock_condition` | string | Điều kiện mở khóa nghề |
| `xp_sources` | array | Các hành động và lượng XP nghề tương ứng |
| `level_rewards` | array | Hiệu ứng nhận được khi đạt cấp độ nhất định |

---

## gacha.json

```json
{
  "id": "standard_pool",
  "name": "Hòm Vũ Khí Chuẩn",
  "currency": "silver",
  "cost_per_pull": 500,
  "cost_10_pull": 4500,
  "free_daily_pull": true,
  "rates": {
    "common": 0.55,
    "rare": 0.28,
    "epic": 0.12,
    "legendary": 0.04,
    "mythic": 0.01
  },
  "pity": {
    "guaranteed_rare_at": 10,
    "soft_pity_starts": 40,
    "soft_pity_legendary_bonus_per_pull": 0.02,
    "hard_pity_legendary_at": 60,
    "hard_pity_mythic_at": 120
  }
}
```

**Các trường quan trọng:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | Định danh pool gacha |
| `currency` | string | Loại tiền tệ dùng để quay |
| `cost_per_pull` | int | Giá 1 lần quay |
| `cost_10_pull` | int | Giá 10 lần quay (thường giảm giá) |
| `free_daily_pull` | bool | Có lượt quay miễn phí hàng ngày không |
| `rates` | object | Tỷ lệ ra theo độ hiếm |
| `pity` | object | Cơ chế pity đảm bảo vật phẩm theo số lần quay |

---

## events.json

```json
{
  "id": "spring_festival",
  "name": "Lễ Hội Mùa Xuân",
  "duration_days": 7,
  "currency": "event_token",
  "activities": ["plant_special_crop", "defeat_event_boss", "fishing_contest"],
  "rewards": [
    { "tokens": 100, "reward": "exclusive_skin" },
    { "tokens": 50, "reward": "rare_seed_pack" }
  ],
  "event_boss": {
    "name": "Linh Dương Mùa Xuân",
    "level": 25,
    "spawn_location": "grassland",
    "respawn_hours": 6
  }
}
```

**Các trường quan trọng:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `id` | string | Định danh sự kiện |
| `duration_days` | int | Thời gian sự kiện diễn ra (ngày) |
| `currency` | string | Đơn vị tiền tệ riêng của sự kiện |
| `activities` | string[] | Danh sách hoạt động có thể tham gia |
| `rewards` | array | Phần thưởng đổi bằng token sự kiện |
| `event_boss` | object | Thông tin boss xuất hiện trong sự kiện |

---

## save_state.json

```json
{
  "player_id": "p001",
  "gender": "male",
  "farm_tiles": [
    {
      "x": 0, "y": 0,
      "state": "planted",
      "crop_id": "carrot",
      "planted_at_timestamp": 1720000000,
      "moisture": 85.5,
      "fertilizer_applied": "basic",
      "harvest_count_remaining": 1
    }
  ],
  "animals": [
    {
      "type": "chicken",
      "pen_slot": 0,
      "last_fed_timestamp": 1720000000,
      "last_product_timestamp": 1720000000
    }
  ],
  "buildings_built": ["chicken_coop", "silo", "greenhouse"],
  "farm_decorations": []
}
```

**Các trường quan trọng:**

| Trường | Kiểu | Mô tả |
|---|---|---|
| `player_id` | string | ID người chơi |
| `gender` | enum | `male / female` — chọn 1 lần lúc tạo tài khoản/nhân vật, chỉ đổi model+animation, không đổi được sau (hoặc đổi mất phí, tùy quyết định sau), không ảnh hưởng stat/cốt truyện |
| `farm_tiles` | array | Trạng thái từng ô đất trong nông trại |
| `farm_tiles[].state` | enum | `empty / tilled / planted / ready / withered` |
| `farm_tiles[].moisture` | float | Độ ẩm hiện tại của ô đất (50–100) |
| `farm_tiles[].fertilizer_applied` | string\|null | Loại phân bón đang áp dụng |
| `farm_tiles[].harvest_count_remaining` | int | Số lần thu hoạch còn lại |
| `animals` | array | Danh sách gia súc đang nuôi |
| `buildings_built` | string[] | Các công trình đã xây dựng trên nông trại |
| `farm_decorations` | array | Các vật trang trí đã đặt trên nông trại |

---

## Tham chiếu nhanh — Bảng chỉ số quái theo map

| Map | Level quái | HP | ATK | DEF | EXP | Gold drop |
|---|---|---|---|---|---|---|
| Đồng Cỏ | 1–8 | 60–150 | 6–15 | 1–4 | 10–30 | 5–25đ |
| Rừng Tre | 8–18 | 200–450 | 18–35 | 6–14 | 40–90 | 25–70đ |
| Hang Động | 18–30 | 500–900 | 35–60 | 15–28 | 100–180 | 70–150đ |
| Núi Tuyết | 28–42 | 900–1800 | 60–100 | 28–48 | 180–300 | 150–350đ |
| Rừng Thiêng | 40–55 | 2000–4000 | 110–180 | 50–90 | 320–600 | 350–700đ |
| Rừng Cổ | 52–68 | 4500–8000 | 190–280 | 95–150 | 650–1200 | 700–1500đ |
| Boss cuối | 75 | 150.000 | 500 | 250 | 50.000 | 100.000đ + drop |
