async function ghFetch(url, token, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${JSON.stringify(data)}`);
  }

  return data;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result; // data:<mime>;base64,XXXX
      const base64 = result.split(",")[1];
      resolve(base64);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function uint8ToBase64(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function getRef({ token, owner, repo, branch = 'main' }) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`,
    token
  );
}

async function getCommit({ token, owner, repo, commitSha }) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits/${commitSha}`,
    token
  );
}

async function createBlob({ token, owner, repo, base64Content }) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        content: base64Content,
        encoding: 'base64'
      })
    }
  );
}

async function createTree({ token, owner, repo, baseTree, entries }) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        base_tree: baseTree,
        tree: entries
      })
    }
  );
}

async function createCommit({ token, owner, repo, message, tree, parents }) {
  return ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/commits`,
    token,
    {
      method: 'POST',
      body: JSON.stringify({
        message,
        tree,
        parents
      })
    }
  );
}

async function updateRef({ token, owner, repo, branch = 'main', sha }) {
  return await ghFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`,
    token,
    {
      method: 'PATCH',
      body: JSON.stringify({
        sha,
        force: false
      })
    }
  );
}

  //TO DO to add-commit-push
  // get the current branch ref
  // get the base commit
  // create blobs for all files
  // create one new tree
  // create one commit
  // update the branch ref


/**
 * files = [
 *   { path: 'README.md', content: '# Hello\n' },
 *   { path: 'src/index.js', content: 'console.log("hi");\n' }
 * ]
 */
async function commitManyFiles({
  token,
  owner,
  repo,
  branch = 'main',
  message,
  files
}) {
    console.log("inside commit many files ewriugbaewurvfguesrvbfev jyhdr tfbedfxb")
    console.log(owner, repo)
  const ref = await getRef({ token, owner, repo, branch });
  const latestCommitSha = ref.object.sha;

  const commit = await getCommit({
    token,
    owner,
    repo,
    commitSha: latestCommitSha
  });
  const baseTreeSha = commit.tree.sha;

  const preparedFiles = await Promise.all(
    files.map(async (file) => ({
      path: file.name,
      base64Content: uint8ToBase64(file.content)
    }))
  );

  const blobResults = await Promise.all(
    preparedFiles.map(file =>
      createBlob({
        token,
        owner,
        repo,
        base64Content: file.base64Content
      })
    )
  );

  const treeEntries = preparedFiles.map((file, i) => ({
    path: file.path,
    mode: '100644',
    type: 'blob',
    sha: blobResults[i].sha
  }));

  const newTree = await createTree({
    token,
    owner,
    repo,
    baseTree: baseTreeSha,
    entries: treeEntries
  });

  const newCommit = await createCommit({
    token,
    owner,
    repo,
    message,
    tree: newTree.sha,
    parents: [latestCommitSha]
  });

  const updatedRef = await updateRef({
    token,
    owner,
    repo,
    branch,
    sha: newCommit.sha
  });

  return {
    latestCommitSha,
    baseTreeSha,
    newTreeSha: newTree.sha,
    newCommitSha: newCommit.sha,
    updatedRef
  };
}