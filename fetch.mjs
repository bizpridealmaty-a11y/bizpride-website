import https from 'node:https';
https.get('https://disk.yandex.ru/i/i2AMh4MNIwK9IA', res => {
    let d = '';
    res.on('data', c => d += c);
    res.on('end', () => {
        let m = d.match(/<meta\s+property=\"og:image\"\s+content=\"([^"]+)\"/);
        if (m) {
            let url = m[1].replace(/&amp;/g, '&');
            console.log(url);
        } else {
            console.log('NONE');
        }
    });
});
