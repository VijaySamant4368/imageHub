const loginText = document.getitem;
savePatBtn.addEventListener("click", async () => {
  const pat = patInput.value.trim();

  if (!pat) {
    alert("Enter a PAT first.");
    return;
  }

  const passphrase = prompt("Enter a pass phrase:");
  if (!passphrase) {
    alert("Pass phrase is required.");
    return;
  }

  try {
    await encryptAndSavePAT(pat, passphrase);
    patInput.value = "";
    location.href = "index.html";
  } catch (error) {
    console.error(error);
    alert("Failed to encrypt and save PAT.");
  }
});

browseBtn.addEventListener("click", () => {
  location.href = "index.html";
});
