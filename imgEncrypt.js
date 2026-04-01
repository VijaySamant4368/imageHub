// uses FNV     https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
// Parameters chosen from: https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function#FNV_hash_parameters
// imul is precision based multiplication for 32 bit number
// h>>>0 changes 32 bit signed float to 32 bit unsigned float
function phraseToSeed(phrase) {
    let h = 2166136261;
    for (let i = 0; i<phrase.length; i++) {
        h = Math.imul(h, 16777619);
        h ^= phrase.charCodeAt(i);
    }
    const seed = (h >>> 0) / 4294967295;

    const x_0 = seed;
    const r = 3.8 + seed*0.19;
    return {x_0, r}
}

function generateChaoticSeries(x_0, r, n) {
    const series = [];
    let x = x_0;
    for (let _ = 0; _<n; _++) {
        x = r * x * (1-x);
        series.push(Math.floor(x*10000)%256);
    }
    return series;
}

function nextChaoticItem(x_0, r) {
    return r * x_0 * (1-x_0);
}

async function encryptFile(file, phrase) {
    const {x_0, r} = phraseToSeed(phrase);
    const files = [file]
    const encryptedFiles = [];
    for (const file of files) {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        let x = x_0;
        for (let i = 0; i < bytes.length; i++) {
            x = nextChaoticItem(x, r);
            bytes[i] ^= Math.floor((x)*10000)%256;
        }
        encryptedFiles.push(bytes);
    }
    return encryptedFiles[0];
}

async function decryptFiles(urls, phrase) {
    const {x_0, r} = phraseToSeed(phrase);
    const decrypted_files = [];
    for (const url of urls) {
        const response = await fetch(url);
        const encryptedBuffer = await response.arrayBuffer();
        const encryptedBytes = new Uint8Array(encryptedBuffer);
        let x = x_0;
        const decryptedBytes = new Uint8Array(encryptedBytes.length);
        for (let i = 0; i < encryptedBytes.length; i++) {
            x = nextChaoticItem(x, r);
            decryptedBytes[i] = encryptedBytes[i] ^ Math.floor((x)*10000)%256;
        }
        decrypted_files.push(new Blob([decryptedBytes], { type: "application/octet-stream" }));
    }
    return decrypted_files;
}


















































































