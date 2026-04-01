const repoInfo = document.getElementById("repoInfo");
const backBtn = document.getElementById("backBtn");

const params = new URLSearchParams(location.search);
const owner = params.get("owner");
const repo = params.get("repo");

// const imagesSection = document.getElementById("images");

async function drawBlobToCanvas(blob, canvas) {
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = url;
    });

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
  } finally {
    URL.revokeObjectURL(url);
  }
}


async function getImgLinks() {

  const gallery = getGallery(repo)

  if (!!gallery) {
    return gallery;
  }

  const headers = {
    'X-GitHub-Api-Version': '2026-03-10',
  };

  if (hasEncryptedPAT()) {
    const user_passphrase = prompt("Please enter the pass phrase for the user");
    const dec_pat = await retrieveAndDecryptPAT(user_passphrase);
    headers["Authorization"] = `Bearer ${dec_pat}`
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/`, {
    method: "GET",
    headers
  })

  const data = await response.json()

  const imgEntries = []
  data.forEach(entry => {
    imgEntries.push({"link": entry.download_url, "name": entry.name})
  });
  setGallery(repo, imgEntries);
  return imgEntries;
}

if (!owner || !repo) {
  repoInfo.textContent = "Missing owner or repo.";
} else {
  repoInfo.textContent = `Showing gallery for ${owner}/${repo}`;
}

backBtn.addEventListener("click", () => {
  location.href = "gallery.html";
});

document.addEventListener("DOMContentLoaded", async () => {
  const repo_passphrase = prompt("Please enter the pass phrase for the repo");
  const imgEntries = await getImgLinks();
  await setupThumbnailCarousel(imgEntries, repo_passphrase);

  // for (const imgEntry of imgEntries) {
  //   if (!imgEntry.name.endsWith(".hub.enc")) continue;

  //   const [decryptedBlob] = await decryptFiles([imgEntry.link], repo_passphrase);

  //   await setupThumbnailCarousel(imgEntries, repo_passphrase);

  //   const canvas = document.createElement("canvas");
  //   imagesSection.appendChild(canvas);

  //   await drawBlobToCanvas(decryptedBlob, canvas);
  // }
});