const https = require('https');
const fs = require('fs');
const file = fs.createWriteStream('./public/img-album-taxes.jpg');

https.get('https://mainslow.wfolio.pro/disk/28-03-2026-bizpride-99hp2n', (res) => {
    let body = '';
    res.on('data', d => body += d);
    res.on('end', () => {
        const match = body.match(/<meta property="og:image"\s+content="([^"]+)"/i);
        if (match && match[1]) {
            console.log('Downloading image from:', match[1]);
            https.get(match[1], (imgRes) => {
                imgRes.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log('Image downloaded successfully.');
                });
            }).on('error', (err) => {
                console.error('Error downloading the image:', err.message);
            });
        } else {
            console.log('No image found in meta tags, using fallback extraction.');
            // Fallback: search for first big jpg image
            const fmatch = body.match(/(https:\/\/[^"]+\.jpg)/);
            if (fmatch) {
                console.log('Fallback image from:', fmatch[1]);
                https.get(fmatch[1], (imgRes) => {
                    imgRes.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        console.log('Fallback Image downloaded successfully.');
                    });
                });
            } else {
                console.log('No image URL found at all.');
            }
        }
    });
}).on('error', (err) => {
    console.error('Error fetching the URL:', err.message);
});
