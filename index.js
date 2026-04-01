const homeText = document.getElementById("homeText");
const loginBtn = document.getElementById("loginBtn");
const uploadBtn = document.getElementById("uploadBtn");
const galleryBtn = document.getElementById("galleryBtn");
const logBox = document.getElementById("logBox");

if (hasEncryptedPAT()) {
  homeText.textContent = "Encrypted PAT found in local storage.";
  loginBtn.textContent = "Reset Pass Phrase";
  uploadBtn.classList.remove("hidden");
} else {
  homeText.textContent = "No encrypted PAT found. You can still browse.";
  loginBtn.textContent = "Go to login";
  uploadBtn.classList.add("hidden");
}

loginBtn.addEventListener("click", async () => {
  location.href = "login.html";
});

uploadBtn.addEventListener("click", () => {
  location.href = "upload.html";
});

galleryBtn.addEventListener("click", () => {
  location.href = "gallery.html";
});
