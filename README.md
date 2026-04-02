# ImageHub

Small utility to store and view encrypted images in GitHub repos.

[Live link](https://vijaysamant4368.github.io/imageHub/)

## What it does

* Upload images to a repo (encrypted)
* Save repos locally for quick access
* Browse images in a simple gallery
* Uses a GitHub Personal Access Token (PAT)

## Setup

Just open the HTML files in a browser.

No build step, no dependencies.

## Usage

1. Go to **Access** and save your GitHub PAT
2. Go to **Upload** to push images to a repo
3. Go to **Gallery** to view saved repos

## GitHub PAT permissions

Your token needs:

* **Repository administration (admin)**
  Used to create new repositories when uploading to a new repo.

* **Repository contents (contents)**
  Used to read, create, and update files (i.e. upload and fetch images).

## Notes

* Images are encrypted before upload
* PAT is stored locally (not sent anywhere else)
* This is a simple client-side tool (no backend)
* I’ve tried to obscure the PAT as much as possible, but requests are still sent with the raw token. If a browser extension or environment can inspect network requests, it can access the PAT.

## Security Flow

### PAT flow

1. You enter your GitHub PAT and a passphrase on the **Access** page  
2. The PAT is encrypted in the browser using the passphrase  
3. The encrypted PAT is stored in local storage  
4. When an API request is needed:
   - The passphrase is used to decrypt the PAT in memory
   - The decrypted PAT is attached to the GitHub API request  
5. The raw PAT is never stored directly, but it does exist briefly in memory during requests  


### Image flow

**Upload:**

1. You select images on the **Upload** page  
2. A repo passphrase is provided  
3. Each image is encrypted in the browser using that passphrase  
4. The encrypted data is uploaded to GitHub as files  
5. A commit is created with those encrypted files  

**View:**

1. You open a repo from the **Gallery**  
2. The app fetches encrypted image files from GitHub  
3. You enter the repo passphrase  
4. Files are decrypted in the browser  
5. Decrypted images are rendered on screen  


## Structure

* `index.html` – home/dashboard
* `login.html` – store PAT
* `upload.html` – upload images
* `gallery.html` – repo list
* `gallery-view.html` – view images

## Why

I thought it would be fun.
