# 🌱 Elemental Farm – Phaser 3 Game Dev Checklist

## ✅ 1. Basic Farm Setup
- [ ] Create Phaser project structure (Vite/Webpack or barebones)
- [ ] Set up a 3x3 or 5x5 grid with clickable tiles
- [ ] Store tile state (empty, planted, growing, harvestable)
- [ ] Display background + hover effect for each tile

---

## 🧪 2. Elemental Crops
- [ ] Define crop types (Earth, Fire, Water, Air)
  - [ ] Name
  - [ ] Elemental requirements
  - [ ] Growth time
  - [ ] Balance effects
- [ ] Create crop sprites or placeholders
- [ ] Show crop icons in grid tiles when planted

---

## 🌟 3. Elemental Balance System
- [ ] Create elemental balance object:
  ```js
  { earth: 5, fire: 5, water: 5, air: 5 }
  ```
- [ ] Display balance bars/meters in UI
- [ ] Update balance when crops are planted
- [ ] Add visual feedback when balance is off (flashing, glow, warning)

---

## 🌾 4. Planting System
- [ ] On tile click → open "Plant Crop" modal/overlay
- [ ] List crop options with icons and element info
- [ ] On confirm:
  - [ ] Plant crop
  - [ ] Update tile state
  - [ ] Adjust elemental balance
- [ ] Prevent planting if balance too low

---

## 🌿 5. Crop Growth
- [ ] Attach timers to planted crops
- [ ] Implement 3 stages:
  - [ ] Planted
  - [ ] Growing
  - [ ] Mature (Harvestable)
- [ ] Check if required element levels are met before progressing
- [ ] Show current stage on tile visually

---

## 🌻 6. Harvesting System
- [ ] Click mature crop → harvest it
- [ ] Award player currency/resources
- [ ] Trigger cooldown on tile (can’t plant same crop immediately)
- [ ] Display cooldown indicator (gray, clock icon, etc.)

---

## 🔁 7. Crop Rotation / Cooldown
- [ ] Track last crop + cooldown per tile
- [ ] Prevent same crop from being planted on cooldown tile
- [ ] Show tooltip or overlay: "Cooldown: 2 turns remaining"
- [ ] Bonus: Allow some crops to replenish depleted elements

---

## 🧰 8. UI & Feedback
- [ ] Element balance display (bars or icons)
- [ ] Crop tooltips ("Needs more Water!", "Growing", "Ready to Harvest")
- [ ] Visual feedback on:
  - [ ] Planting
  - [ ] Growth stage changes
  - [ ] Elemental imbalance

---

## ✨ Optional Polish
- [ ] Add ambient sounds / background music
- [ ] Day/Night cycle (visual only)
- [ ] "How to Play" modal
- [ ] Floating text or sparkles on harvest
- [ ] Score, leaderboard, or win condition
