const imagesSection = document.getElementById("images");

const state = {
  items: [], // { blob, name }
  currentIndex: 0,
};

function ensureCarouselUI() {
  let overlay = document.getElementById("carouselOverlay");
  if (overlay) return;

  overlay = document.createElement("div");
  overlay.id = "carouselOverlay";
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.background = "rgba(0,0,0,0.85)";
  overlay.style.display = "none";
  overlay.style.alignItems = "center";
  overlay.style.justifyContent = "center";
  overlay.style.zIndex = "9999";

  const prevBtn = document.createElement("button");
  prevBtn.id = "carouselPrev";
  prevBtn.textContent = "◀";
  prevBtn.style.position = "absolute";
  prevBtn.style.left = "20px";
  prevBtn.style.top = "50%";
  prevBtn.style.transform = "translateY(-50%)";
  prevBtn.style.fontSize = "24px";
  prevBtn.style.padding = "10px 14px";
  prevBtn.style.cursor = "pointer";

  const nextBtn = document.createElement("button");
  nextBtn.id = "carouselNext";
  nextBtn.textContent = "▶";
  nextBtn.style.position = "absolute";
  nextBtn.style.right = "20px";
  nextBtn.style.top = "50%";
  nextBtn.style.transform = "translateY(-50%)";
  nextBtn.style.fontSize = "24px";
  nextBtn.style.padding = "10px 14px";
  nextBtn.style.cursor = "pointer";

  const closeBtn = document.createElement("button");
  closeBtn.id = "carouselClose";
  closeBtn.textContent = "✕";
  closeBtn.style.position = "absolute";
  closeBtn.style.top = "20px";
  closeBtn.style.right = "20px";
  closeBtn.style.fontSize = "24px";
  closeBtn.style.padding = "10px 14px";
  closeBtn.style.cursor = "pointer";

  const canvas = document.createElement("canvas");
  canvas.id = "carouselCanvas";
  canvas.style.display = "block";
  canvas.style.background = "white";
  canvas.style.maxHeight = "90vh";

  overlay.appendChild(prevBtn);
  overlay.appendChild(canvas);
  overlay.appendChild(nextBtn);
  overlay.appendChild(closeBtn);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      closeCarousel();
    }
  });

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });

  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeCarousel();
  });

  document.addEventListener("keydown", async (e) => {
    if (overlay.style.display === "none") return;

    if (e.key === "Escape") closeCarousel();
    if (e.key === "ArrowLeft") await showPrev();
    if (e.key === "ArrowRight") await showNext();
  });
}

async function blobToImage(blob) {
  const url = URL.createObjectURL(blob);
  try {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });
    return img;
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function drawScaled(blob, canvas, targetWidth) {
  const img = await blobToImage(blob);
  const scale = targetWidth / img.naturalWidth;
  const targetHeight = Math.round(img.naturalHeight * scale);

  canvas.width = Math.round(targetWidth);
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

async function drawThumbnail(blob, canvas) {
  const maxThumbWidth = Math.floor(window.innerWidth / 5);
  await drawScaled(blob, canvas, maxThumbWidth);

  canvas.style.width = `${canvas.width}px`;
  canvas.style.height = `${canvas.height}px`;
  canvas.style.display = "block";
  canvas.style.cursor = "pointer";
}

async function drawFull(blob, canvas) {
  const img = await blobToImage(blob);

  // As requested:
  // width = max(original width, 90% of window width)
  const targetWidth = Math.max(img.naturalWidth, Math.floor(window.innerWidth * 0.9));
  const scale = targetWidth / img.naturalWidth;
  const targetHeight = Math.round(img.naturalHeight * scale);

  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  canvas.style.width = `${targetWidth}px`;
  canvas.style.height = `${targetHeight}px`;
}

function layoutThumbnailContainer() {
  imagesSection.style.display = "grid";
  imagesSection.style.gridTemplateColumns = "repeat(4, auto)";
  imagesSection.style.justifyContent = "center";
  imagesSection.style.alignItems = "start";
  imagesSection.style.gap = "16px";
}

async function renderThumbnails() {
  layoutThumbnailContainer();
  imagesSection.innerHTML = "";

  for (let i = 0; i < state.items.length; i++) {
    const item = state.items[i];
    const canvas = document.createElement("canvas");
    canvas.dataset.index = String(i);

    await drawThumbnail(item.blob, canvas);

    canvas.addEventListener("click", () => openCarousel(i));
    imagesSection.appendChild(canvas);
  }
}

async function openCarousel(index) {
  state.currentIndex = index;
  const overlay = document.getElementById("carouselOverlay");
  const canvas = document.getElementById("carouselCanvas");

  overlay.style.display = "flex";
  await drawFull(state.items[state.currentIndex].blob, canvas);
}

function closeCarousel() {
  const overlay = document.getElementById("carouselOverlay");
  overlay.style.display = "none";
}

async function showPrev() {
  state.currentIndex =
    (state.currentIndex - 1 + state.items.length) % state.items.length;

  const canvas = document.getElementById("carouselCanvas");
  await drawFull(state.items[state.currentIndex].blob, canvas);
}

async function showNext() {
  state.currentIndex = (state.currentIndex + 1) % state.items.length;

  const canvas = document.getElementById("carouselCanvas");
  await drawFull(state.items[state.currentIndex].blob, canvas);
}

async function setupThumbnailCarousel(imgEntries, repo_passphrase) {
  ensureCarouselUI();

  state.items = [];

  for (const imgEntry of imgEntries) {
    if (!imgEntry.name.endsWith(".hub.enc")) continue;

    try {
      const [decryptedBlob] = await decryptFiles([imgEntry.link], repo_passphrase);
      state.items.push({
        blob: decryptedBlob,
        name: imgEntry.name,
      });
    } catch (err) {
      console.error(`Failed to decrypt ${imgEntry.name}`, err);
    }
  }

  await renderThumbnails();
}

window.addEventListener("resize", async () => {
  if (state.items.length > 0) {
    await renderThumbnails();

    const overlay = document.getElementById("carouselOverlay");
    if (overlay && overlay.style.display !== "none") {
      const canvas = document.getElementById("carouselCanvas");
      await drawFull(state.items[state.currentIndex].blob, canvas);
    }
  }
});