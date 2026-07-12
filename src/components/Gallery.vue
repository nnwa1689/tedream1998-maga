<template>
  <div class="unbound-canvas">
    
    <!-- 👁️ 概念前導：用極端的字體大小與極佳的留白開場 -->
    <header class="manifesto-header">
      <h1 class="huge-title">
        TED<br>
        DREAM<span class="dot">.</span>
      </h1>
      <p class="manifesto-text">
        An unconstrained archive of light, fragments, and honest code. 
        這裡不談規則，只記錄眼睛看見的真實。
      </p>
    </header>

    <!-- 🧱 破格流體區塊 (The Out-of-Bounds Flow) -->
    <div class="canvas-flow">
      
      <!-- 🚀 視覺一：重疊美學 (The Overlap) -->
      <section class="canvas-section layer-overlap">
        <!-- 巨大的背景襯線文字，會被上層的照片直接壓過去 -->
        <div class="bg-typography">PORTO</div>
        
        <div class="image-frame-floating">
          <img 
            src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80" 
            alt="Raw Capture" 
            class="raw-img"
          />
        </div>

        <div class="floating-label">
          <span class="num">[01]</span>
          <h3 class="name">Rowen & Thomas</h3>
          <p class="desc">底片無修正 / 2026 盛夏</p>
        </div>
      </section>

      <!-- 🚀 視覺二：極端對比 (The Monolith) -->
      <section class="canvas-section layer-monolith">
        <div class="image-frame-tall">
          <img 
            src="https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80" 
            alt="Stark Space" 
            class="raw-img"
          />
        </div>
        
        <!-- 故意將文字排在極度反直覺的左側下沉位置，與直幅照片形成強烈的拉扯感 -->
        <div class="displaced-meta">
          <h3 class="name">Sintra Monolith</h3>
          <p class="desc">空間與幾何的冷冽對話</p>
          <div class="technical-spec">Nikon Zfc — f/4.0 — 1/160s</div>
        </div>
      </section>

      <!-- 🚀 視覺三：水平橫切 (The Horizon Cut) -->
      <section class="canvas-section layer-horizon">
        <div class="image-frame-wide">
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1800&q=80" 
            alt="Cinematic Horizon" 
            class="raw-img"
          />
        </div>
        
        <!-- 穿透式的文字排版：利用 mix-blend-mode 讓文字在碰到黑色與白色網頁時自動反色 -->
        <div class="blended-title">
          <h2>HONEST FRAMES</h2>
        </div>
      </section>

    </div>
  </div>
</template>

<style scoped>
/* =========================================================================
   🎨 1. 骨架環境：走高冷的極簡主義（墨黑、純粹、毫無修飾）
   ========================================================================= */
.unbound-canvas {
  background-color: #0d0d0d; /* 換成極度深邃的黑，讓你的照片像發光體一樣跳出來 */
  color: #f5f5f3;
  min-height: 100vh;
  padding: 12vh 6vw;
  overflow-x: hidden;
  box-sizing: border-box;
}

/* =========================================================================
   ✍️ 2. 巨型視覺開場
   ========================================================================= */
.manifesto-header {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.huge-title {
  font-family: var(--font-serif, serif);
  font-size: clamp(4rem, 12vw, 10rem); /* 隨螢幕大小極端縮放的字體 */
  font-weight: 300;
  line-height: 0.85;
  letter-spacing: -0.04em;
  margin: 0;
}

.huge-title .dot {
  color: #3a86ff; /* 一抹乾淨的科技藍點綴 */
}

.manifesto-text {
  font-family: var(--font-sans, sans-serif);
  font-size: 0.95rem;
  line-height: 1.8;
  max-width: 450px;
  opacity: 0.5;
  align-self: flex-end; /* 推到最右邊，打破對齊規律 */
}

/* =========================================================================
   🧱 3. 自由流體流（徹底擺脫 Grid 限制，改用相對定位與層級）
   ========================================================================= */
.canvas-flow {
  display: flex;
  flex-direction: column;
  gap: 35vh; /* 巨大的空間斷層 */
}

.canvas-section {
  position: relative;
  width: 100%;
}

/* ─── 視覺一：重疊版型 ─── */
.layer-overlap {
  height: 80vh;
}

/* 巨型背景字 */
.bg-typography {
  position: absolute;
  top: -10%;
  right: 5vw;
  font-family: var(--font-sans, sans-serif);
  font-size: 16vw;
  font-weight: 900;
  color: rgba(255, 255, 255, 0.02); /* 極淡的隱形浮雕感 */
  z-index: 1;
}

.image-frame-floating {
  position: absolute;
  top: 10%;
  left: 10vw;
  width: 55vw;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  z-index: 2;
}

.floating-label {
  position: absolute;
  bottom: 0;
  right: 12vw;
  z-index: 3;
}

/* ─── 視覺二：極端立柱版型 ─── */
.layer-monolith {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding-right: 5vw;
}

.image-frame-tall {
  width: 32vw;
  aspect-ratio: 3 / 4;
  overflow: hidden;
}

.displaced-meta {
  position: absolute;
  bottom: -10vh;
  left: 15vw; /* 故意跟右邊的照片拉開極遠距離，產生視覺懸空 */
  max-width: 300px;
}

/* ─── 視覺三：水平橫切版型 ─── */
.layer-horizon {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-frame-wide {
  width: 100%;
  aspect-ratio: 21 / 9; /* 極具電影感的極寬比例 */
  overflow: hidden;
}

/* 🎯 頂級視覺密碼：利用 CSS 混合模式，讓字體在穿越圖片邊界時自動反轉顏色 */
.blended-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  mix-blend-mode: difference; /* 💡 核心：這會讓文字與底下的圖片顏色產生化學反應 */
  z-index: 4;
  pointer-events: none;
}

.blended-title h2 {
  font-family: var(--font-sans, sans-serif);
  font-size: 6vw;
  font-weight: 800;
  letter-spacing: 0.3em;
  color: #ffffff; /* 在黑底上是白的，在白照片上會自動變成黑的 */
  margin: 0;
}

/* =========================================================================
   📸 4. 影像基礎（拋棄任何多餘的平滑 hover，改用高對比的紀實感）
   ========================================================================= */
.raw-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.05) brightness(0.95); /* 略帶濃郁與硬朗的色調 */
  transition: filter 0.6s ease;
}

.canvas-section:hover .raw-img {
  filter: contrast(1.1) brightness(1); /* 移入時微微發亮 */
}

/* =========================================================================
   ✍Header. 5. 技術與文藝兼具的細節排版
   ========================================================================= */
.num {
  font-family: var(--font-sans, sans-serif);
  font-size: 0.75rem;
  color: #3a86ff;
  display: block;
  margin-bottom: 8px;
}

.name {
  font-family: var(--font-serif, serif);
  font-size: 1.5rem;
  font-weight: 400;
  margin: 0 0 8px 0;
}

.desc {
  font-family: var(--font-sans, sans-serif);
  font-size: 0.8rem;
  color: #888;
  margin: 0;
}

.technical-spec {
  font-family: var(--font-sans, sans-serif);
  font-size: 0.7rem;
  color: #444;
  margin-top: 16px;
  letter-spacing: 0.05em;
}

/* =========================================================================
   📱 6. 手機版自然降級
   ========================================================================= */
@media (max-width: 768px) {
  .unbound-canvas { padding: 60px 24px; }
  .manifesto-header { min-height: auto; gap: 40px; margin-bottom: 100px; }
  .canvas-flow { gap: 120px; }
  .layer-overlap, .layer-monolith { height: auto; display: flex; flex-direction: column; padding: 0; }
  .image-frame-floating, .image-frame-tall, .image-frame-wide { position: static; width: 100% !important; aspect-ratio: 3 / 2 !important; }
  .floating-label, .displaced-meta { position: static; margin-top: 20px; }
  .bg-typography { display: none; }
  .blended-title h2 { font-size: 8vw; }
}
</style>