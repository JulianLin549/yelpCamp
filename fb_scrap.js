const puppeteer = require('puppeteer');
const fs = require('fs');
const WAIT_FOR_PAGE = 5000;
const DELAY_USER_INPUT = 20;
const DELAY_PW_INPUT = 10;
const FB_USER = 'julianlin549@gmail.com';
const FB_PW = 'Test7625';


try {
    (async () => {
        // Viewport && Window size
        const width = 400
        const height = 300

        const browser = await puppeteer.launch({
            headless: false,
            args: [
                `--window-size=${ width },${ height }`
            ],
            defaultViewport: {
                width,
                height
            },
            userDataDir: "./userData"
        })

        const context = browser.defaultBrowserContext();
        context.overridePermissions("https://www.facebook.com", ["geolocation", "notifications"]);
        let page = await browser.newPage();
        await page.setViewport({ width: width, height: width });

        //登入只有第一次需要做。
        /* await page.goto("https://www.facebook.com");
        await page.type('#email', FB_USER, { delay: DELAY_USER_INPUT });
        await page.type('#pass', FB_PW, { delay: DELAY_PW_INPUT });
        await page.click("#u_0_b");
        await page.waitFor(1000); */

        await page.goto("https://mbasic.facebook.com/groups/codingmeme");
        await page.waitForSelector("#m_group_stories_container")

        //下一頁按鈕一直按到底
        while (await page.$('#m_group_stories_container > div > a', { timeout: 5000 })) {
            await page.click('#m_group_stories_container > div > a')
            await page.waitForSelector('#m_group_stories_container')
        }
        //找出貼文裡面文字


        const posts = await page.evaluate(() => {
            let data = []
            /** this can be changed for other website.*/
            const list = document.querySelectorAll('#m_group_stories_container > section > article');
            for (const a of list) {
                data.push([a.innerHTML, a.innerText])
            }
            return data;
        })


        let atag = posts[1][0].match(/<a[^>]*>([^<]+)<\/a>/g)
        console.log(atag)
        /* ==========================
        posts 裡面的結構：
        posts[0] = HTML
        posts[1] = innerText
        =============================
        atag 裡面的結構：
        1. 作者，會有<a href="/jack527001 是本人的id https://www.facebook.com/jack527001
        2. 本社團的連結，不太重要
        3. 讚
        4. 傳達心情
        5. 分享
        6. 完整動態
        7. 儲存
        8. 更多
    
        重點是""完整動態""的連結。
        連結ID: Regex: /permalink&amp;id=([0-9])\w+&amp/   https://www.facebook.com/groups/codingmeme/permalink/728573517981631/

        */


        await browser.close();
    })();
} catch (error) {

}