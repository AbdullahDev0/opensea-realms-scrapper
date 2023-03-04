const fs = require("fs");
const { parse } = require("csv-parse");
const puppeteer = require("puppeteer");
const { stringify } = require("csv-stringify");
var csvHeaders = require('csv-headers');

// CSV Headers
const headers = [
    'name',
    'link',
    'price',
    'Regions',
    'Rivers',
    'Harbors',
    'Cities',
    'Resource [The Order of the Twins]',
    'Resource [Coal]',
    'Resource [The Order of Protection]',
    'Resource [Obsidian]',
    'Resource [Wood]',
    'Resource [Copper]',
    'Resource [Stone]',
    'Resource [The Order of Giants]',
    'Resource [Silver]',
    'Resource [Gold]',
    'Resource [The Order of Detection]',
    'Resource [Ignium]',
    'Resource [The Order of Vitriol]',
    'Resource [Cold Iron]',
    'Resource [The Order of Reflection]',
    'Resource [Twilight Quartz]',
    'Resource [The Order of Anger]',
    'Resource [The Order of Enlightenment]',
    'Resource [Alchemical Silver]',
    'Resource [Ironwood]',
    'Resource [The Order of Titans]',
    'Resource [Ethereal Silica]',
    'Resource [The Order of Rage]',
    'Resource [Ruby]',
    'Resource [The Order of Brilliance]',
    'Resource [The Order of Fury]',
    'Resource [The Order of Power]',
    'Resource [The Order of the Fox]',
    'Resource [Deep Crystal]',
    'Resource [True Ice]',
    'Resource [Hartwood]',
    'Resource [The Order of Skill]',
    'Resource [The Order of Perfection]',
    'Resource [Diamonds]',
    'Resource [Sapphire]',
    'Resource [The Ancestral Trees]',
    'Resource [Mithral]',
    'Resource [The Weeping Willow]',
    'Resource [The Argent Catacombs]',
    'Resource [Sanctum Of Purpose]',
    'Resource [Adamantine]',
    'Resource [The Sanctified Fjord]',
    'Resource [The Ancestral Willow]',
    'Resource [Dragonhide]',
    'Resource [The Origin Oasis]',
    'Resource [The Perpetual Ridge]',
    'Resource [Synagogue Of Collapse]',
    'Resource [The Cerulean Chamber]',
    'Resource [The Azure Lake]',
    'Resource [The Immortal Hot Spring]',
    'Resource [The Pale Pillar]',
    'Resource [The Mirror Grotto]',
    'Resource [Sanctum Of The Oracle]',
    'Resource [Pantheon Of Chaos]',
    'Resource [The Exalted Basin]',
    'Resource [The Crying Oak]',
    'Resource [The Mother Grove]',
    'Resource [The Pale Vertex]',
    'Resource [Infinity Spire]',
    'Resource [Pagoda Of Fortune]',
    'Resource [Altar Of Perfection]',
    'Resource [The Pearl Summit]',
    'Resource [The Glowing Geyser]',
    'Resource [The Omen Graves]',
    'Resource [The Amaranthine Rock]',
    'Resource [The Eternal Orchard]',
    'Resource [The Pure Stone]',
    'Resource [The Exalted Geyser]',
    'Resource [The Celestial Vertex]',
    'Resource [The Devout Summit]',
    'Resource [The Mythic Trees]',
    'Resource [Cathedral Of Agony]',
    'Resource [The Cerulean Reliquary]',
    'Resource [The Fading Yew]',
    'Resource [The Ancient Lagoon]',
    'Resource [The Ethereal Isle]',
    'Resource [The Dark Mountain]',
    'Resource [Mosque Of Mercy]',
    'Resource [The Perpetual Fjord]',
    'Resource [The Solemn Catacombs]',
    'Resource [Altar Of Divine Will]',
    'Resource [Sanctuary Of The Ancients]',
    'Resource [The Pearl River]',
    'Resource [Sky Mast]',
    'Resource [The Exalted Maple]',
    'Resource [Altar Of The Void]',
    'Resource [The Glowing Pinnacle]',
    'Resource [The Oracle Pool]'
]

// Converting data to CSV Compatible file
function csvConvertedData(link){
    let csv_data_array = []
    for (const header_column of headers) {
        if(header_column === 'link'){
            csv_data_array.push(link)
        }
        else{
            csv_data_array.push('')
        }
    }
    return csv_data_array;
}

// Auto scrolling to end of the page
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 1000;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 3000);
        });
    });
}

// Get Data from CSV sheet
const data = new Promise(function (resolve, reject) {
    const userData = [];
    fs.createReadStream('updated_links.csv')
        .pipe(parse({ columns: true, delimiter: "," }))
        .on("data", function async(row) {
            userData.push(row)
        })
        .on("end", function () {
            return resolve(userData);
        })
        .on("error", function (error) {
            console.log(error.message);
        });
});


// Creating base CSV by extracting links from sales page and populating the CSV file
async function createBaseCSV(page, url)
{
    await page.goto(url, { waitUntil: "networkidle2", timeout: 0 });
    const list_order = '#main > div > div > div > div.sc-29427738-0.sc-e1213540-0.hDRGXV.flEkxA > div > div.sc-29427738-0.sc-630fc9ab-0.sc-d48a58b1-0.gtDMWH.jSPhMX.gGHyCh > div > div > div > div.sc-29427738-0.kQKAhB > div > div > button.sc-29427738-0.sc-788bb508-0.dULEQL.dOsloX.sc-fc3e6bed-0.Nslxj.sc-697bd841-0.oIWTJ.sc-c51ec659-0.eTAozi';
    await page.waitForSelector(list_order, { timeout: 100 })
    await autoScroll(page)
    const hrefs = await page.$$eval('a', as => as.map(a => a.href));
    const filtered_links = hrefs.filter(name => name.includes('/assets/ethereum/'))
    

    const filename = 'updated_links.csv';
    const writableStream = fs.createWriteStream(filename);
    const stringifier = stringify({ header: true, columns: headers });
    for (const filtered_link of filtered_links) {
        try{
            stringifier.write(csvConvertedData(filtered_link));
        }catch(err){
            console.log(err)
        }
    }
    stringifier.pipe(writableStream);
    console.log("Finished writing data");
    const delay = 2000 // In milliseconds
    setTimeout(() => {
        writableStream.close()
    }, delay)
}


// Updating all data from old CSV file
async function updateData(page, resource_data) {
    try {
        // Going to individual website to get price and resources values
        console.log('URL: ', resource_data.link)
        await page.goto(resource_data.link, { waitUntil: "networkidle2", timeout: 0 });

        const name_selector = '#main > div > div > div > div.fresnel-container.fresnel-greaterThanOrEqual-lg > div > div.item--wrapper > div.item--main > section.item--header > div.sc-29427738-0.sc-630fc9ab-0.dJYDEb.jSPhMX > h1';
        await page.waitForSelector(name_selector, { timeout: 100 })
        const name = await page.evaluate(el => el.textContent, await page.$(name_selector))

        let eth_price_text = '0';
        try {
            const price_eth = '#main > div > div > div > div.fresnel-container.fresnel-greaterThanOrEqual-lg > div > div.item--wrapper > div.item--main > div:nth-child(3) > div > section > form > div.sc-29427738-0.sc-630fc9ab-0.sc-ecfc7326-0.dVNeWL.jSPhMX.dwHBvC > div > div > div > div > div';
            await page.waitForSelector(price_eth, { timeout: 100 })
            eth_price_text = await page.evaluate(el => el.textContent, await page.$(price_eth))
        }
        catch {
            console.log('Current price not found')
        }

        const attributes_xpath = '/html/body/div[1]/div/main/div/div/div/div[1]/div/div[1]/div[1]/section/div/div[2]/div/div/div/div/div';
        let [el] = await page.$x(attributes_xpath)
        const attributes_data = (await page.evaluate(name => name.innerText, el)).split("\n");

        // Filtering data

        resource_data.name = name
        resource_data.price = parseFloat(eth_price_text.match(/(\d+)(\.\d+)?/g))

        const levels_xpath = '/html/body/div[1]/div/main/div/div/div/div[1]/div/div[1]/div[1]/section/div/div[3]/div/div/div/div';
        [el] = await page.$x(levels_xpath)
        const levels = await page.evaluate(name => name.innerText, el);
        levels_names = ['Cities', 'Harbors', 'Regions', 'Rivers']
        for(const levels_name of levels_names){
            let raw_data = levels.substring(levels.lastIndexOf(levels_name))
            resource_data[levels_name] = parseInt(raw_data.split(' ')[0].match(/(\d+)(\.\d+)?/g))
        }

        for (var i = 0; i < attributes_data.length; i++) {
            if (i % 3 == 0 || i % 3 == 1) {
                continue
            }
            for (const [key, value] of Object.entries(resource_data)) {
                if (key.toLowerCase().includes('resource')) {
                    if (key.toLowerCase().includes('[' + attributes_data[i - 1].toLowerCase() + ']')) {
                        resource_data[key] = attributes_data[i].replace(/[^0-9]/g, '')
                        continue
                    }
                    if (value.toLowerCase() == 'false' || value.toLowerCase() == 'true') {
                        resource_data[key] = '';
                    }
                }
            }
        }
        return resource_data;
    }
    catch (err) {
        console.log(err)
    }

}


// Calling the function on script execution
(async () => {
    try {
        const raw_data_file = 'updated_links.csv';
        var options = {
            file: raw_data_file,
            delimiter: ','
        };
        const test = async () => {
            return new Promise((resolve, reject) => {
                csvHeaders(options, function (err, headers) {
                    if (!err) {
                        resolve(headers)
                    }
                });
            })
        };
        const old_csv_headers = await test().catch((err) => {
            console.log(err); // handle error
        });
        const filename = Date.now() + ".csv";
        const writableStream = fs.createWriteStream(filename);
        const stringifier = stringify({ header: true, columns: old_csv_headers });
        const browser = await puppeteer.launch({
            headless: false, args: ['--window-size=1280,720', '--profile-directory=Profile 7'],
            defaultViewport: {
                width: 1280,
                height: 720
            }
        });
        var page = await browser.newPage();
        await createBaseCSV(page, "https://opensea.io/collection/lootrealms?search[toggles][0]=BUY_NOW");

        resources_data = await data;
        for (const resource_data of resources_data) {
            try {
                let updated_data = await updateData(page, resource_data)
                if (updated_data == null) {
                    console.log('Undefined value found')
                    continue;
                }
                stringifier.write(updated_data);
            }
            catch (err) {
                console.log(err)
            }
        }

        stringifier.pipe(writableStream);
        console.log("Finished writing data");
        await browser.close()

    } catch (error) {

    }


})()