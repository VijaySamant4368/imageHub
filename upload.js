
// Administration: Read and Write is required for Repo Creation
// Contents: Read and Write is required for Add-Commit-Push

if (!hasEncryptedPAT()) {
  alert("No encrypted PAT found. Upload is disabled.");
  location.href = "index.html";
}

const uploadForm = document.getElementById("uploadForm");
const isNewRepo = document.getElementById("isNewRepo");
const repoPassWrap = document.getElementById("repoPassWrap");
const ownerName = document.getElementById("ownerName");
const repoName = document.getElementById("repoName");
const repoPassphrase = document.getElementById("repoPassphrase");
const commitMessage = document.getElementById("msg");
const imageFiles = document.getElementById("imageFiles");
const uploadLog = document.getElementById("uploadLog");

uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const owner = ownerName.value.trim();
  const repo = repoName.value.trim();
  const files = Array.from(imageFiles.files);
  const msg = commitMessage.value.trim() || `Add ${files.length} images`

  if (!owner || !repo) {
    alert("Owner name and repo name are required.");
    return;
  }

  console.log(files);
  alert(files);

  const preparedFiles = await Promise.all(
    files.map(async (file) => ({
      name: `${file.name}.hub.enc`,
      content: await encryptFile(file, repoPassphrase.value),
    }))
  );

  const formData = {
    isNewRepo: isNewRepo.checked,
    owner,
    repo,
    repoPassphrase: repoPassphrase.value,
    files: preparedFiles,
  };

  alert("Before adding")

  if (isNewRepo.checked) {
    const repos = getRepos();
    const exists = repos.some(
      (item) => item.owner === owner && item.repo === repo,
    );

    if (!exists) {
      repos.push({ owner, repo });
      setRepos(repos);
    }
    alert("Before deleteing")
  }
  deleteGallery(repo);

  console.log(formData);
  uploadLog.textContent = JSON.stringify(formData, null, 2);
  alert("Form submitted. Check log below and console.");
  const passphrase = prompt("Please enter your pass phrase:");
  const dec_pat = await retrieveAndDecryptPAT(passphrase)

  if (formData.isNewRepo) {
    await ghFetch(
      "https://api.github.com/user/repos",
      dec_pat,
      {
        method: 'POST',
        body: JSON.stringify({
          name: formData.repo,
          private: false,
          auto_init: true
        })
      }
    );
  }

  //Initial Commit
  if (formData.isNewRepo) {
    await ghFetch(
      `https://api.github.com/repos/${formData.owner}/${formData.repo}/contents/.hub.config`,
      dec_pat,
      {
        method: 'PUT',
        body: JSON.stringify({
          message: "Add .hub.config",
          content: btoa("Configurations\n"),
          branch: "main"
        })
      }
    );
  }

  // TO DO to add-commit-push
  // get the current branch ref
  // get the base commit
  // create blobs for all files
  // create one new tree
  // create one commit
  // update the branch ref

  commitManyFiles(
    {
      token: dec_pat,
      owner,
      repo,
      branch: 'main',
      message: msg,
      files: preparedFiles
    }
  );

  console.log("DONE")

});
