import https from 'node:https';

https.get('https://disk.yandex.ru/i/i2AMh4MNIwK9IA', res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const m = data.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        if (m) console.log(m[1].replace(/amp;/g, ''));
    });
});
