# ImageHub

Small utility to store and view encrypted images in GitHub repos.

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

## Structure

* `index.html` – home/dashboard
* `login.html` – store PAT
* `upload.html` – upload images
* `gallery.html` – repo list
* `gallery-view.html` – view images

## Why

I thought it would be fun.
