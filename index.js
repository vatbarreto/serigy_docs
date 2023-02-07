const fs = require('fs')
const cheerio = require('cheerio')

async function read_html(url) {
    try {
        const html_data = await fs.promises.readFile(url, 'utf-8')
        return html_data
    } catch(error) {
        console.error(error)
    }
}

const file_url = 'layout_serigy.html'
