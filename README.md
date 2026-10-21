# 借空間 · 小小好鄰居

手機優先、單指操作的空間分配解謎原型。**按住一間房，向鄰居借空間，直到每個小家都舒服。**

目前是可玩性驗證版本 `0.1.0`，不是已驗證留存、收益或原創性的商業成品。

## 開始遊玩

需要 Node.js 20 或更新版本，無須安裝套件。

```bash
git clone https://github.com/ruienxie0104/sideproj_game.git
cd sideproj_game
npm run dev
```

開啟 [http://localhost:4173](http://localhost:4173)。也可把 `dist/` 放到一般靜態網站主機。請透過 HTTP/HTTPS 開啟；直接雙擊 HTML 的 `file://` 模式不支援 JavaScript modules。

### 用手機測試

電腦與手機連同一個可信任的 Wi-Fi，執行：

```bash
HOST=0.0.0.0 npm run dev
```

手機瀏覽器開啟 `http://電腦的區域網路IP:4173`。`localhost` 在手機上代表手機自己。只需電腦試玩時，使用預設的 `npm run dev`，僅綁定本機。

可用 `PORT=4174 npm run dev` 更換連接埠。手機主畫面安裝外觀有 manifest；尚未加入 service worker，不承諾離線可用。

## 怎麼玩

- 按住房間：向同層另一間房借寬度，向相鄰樓層借高度。
- 放開停止；輕點也能微調。房間太擠時表情不開心，空間足夠就微笑。
- 所有房間同時舒服，即完成關卡。已舒服的房間仍可能因為分享空間而變擁擠。
- 可復原最近 100 次調整、重新開始、查看提示。
- 點關卡標題可選擇全部 8 關；點 `?` 查看說明。
- 電腦用 Tab 選房間，按住空白鍵或 Enter；音效預設關閉。
- 最佳調整次數與目前關卡儲存在瀏覽器 `localStorage`，不跨裝置同步。

## 目前內容

8 個手工關卡、相鄰空間分享、長按與輕點、住戶回饋、提示、復原、選關、過關流程、本機紀錄，以及可選音效。沒有第三方執行期套件、外部字型、帳號、分析追蹤或付款功能。

## 開發與驗證

```bash
npm test       # 規則測試
npm run check # JavaScript 語法 + 規則測試
```

GitHub Actions 對推送和 PR 自動執行 `npm run check`。目前 14 項測試涵蓋八關的實際操作可解路徑、面積守恆、相鄰借用、尺寸下限、長幀限制、快照隔離與異常輸入。

**自動測試通過不等於手機實測通過。** 本次瀏覽器自動化被存取政策阻擋，尚未完成實際瀏覽器畫面、觸控、iOS Safari / Android Chrome、音效和輔助科技驗證。詳見 [驗證紀錄](docs/VALIDATION.md)。

## 專案結構

```text
dist/                可直接部署的靜態網站，同時是目前的前端原始碼
  engine.js          純規則、關卡與提示搜尋
  game.js            輸入、畫面、對話框、本機紀錄與音效
  index.html         介面與語意結構
  style.css          手機優先版面
scripts/serve.mjs    無相依的本機伺服器
tests/engine.test.js 規則與可解性測試
docs/               設計依據、試玩計畫、驗證狀態
```

## 接下來要驗證

先測「是否看懂空間流動」與「是否主動想再試一關」，再決定是否擴充機制和商業化。研究提出設計假設，沒有證明這個原型一定有趣。參見 [設計筆記](docs/DESIGN.md) 與 [試玩計畫](docs/PLAYTEST.md)。

本專案由最初的 `sideproj_game` README 建立，保留原有 Git 歷史。前一輪草稿仍保留在開發者本機的相鄰資料夾，未納入本專案。
