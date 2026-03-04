import fs from 'fs';
fetch('https://bizpride.kz/')
    .then(r => r.text())
    .then(html => {
        const match = html.match(/href="(\/_astro\/[^\"]+\.css)"/);
        if (match) {
            console.log('Found CSS at: ' + match[1]);
            return fetch('https://bizpride.kz' + match[1]);
        } else {
            console.log('No CSS found');
            process.exit(1);
        }
    })
    .then(r => r.text())
    .then(css => {
        fs.writeFileSync('live_css.txt', css);
        console.log("CSS saved to live_css.txt");
        console.log("Contains negative offset:", css.includes('left:-15%') || css.includes('-15%'));
        const heroCard1Index = css.indexOf('.hero-card-1');
        if (heroCard1Index !== -1) {
            console.log("Hero Card 1 CSS:", css.substring(heroCard1Index, heroCard1Index + 100));
        }
    });
