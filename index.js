const fs = require('fs')
const cheerio = require('cheerio')
const htmlparser2 = require('htmlparser2')

async function read_html(url) {
    try {
        const html_data = await fs.promises.readFile(url, 'utf-8')
        return html_data
    } catch(error) {
        console.error(error)
    }
}

async function write_html(url, data) {
    try {
        await fs.promises.writeFile(url, data)
    } catch(error) {
        console.error(error)
    }
}

const file_url = 'layout_serigy.html'
const api_url = 'http://hilite.me/api'

read_html(file_url).then(html => {
    const document = htmlparser2.parseDocument(html)
    const $ = cheerio.load(document)
    $('example').get().map(
        async example => {
            // console.log($(example).html())
            let form_data = new FormData()
            form_data.append('code', $(example).html())
            form_data.append('lexer', 'html')
            form_data.append('options', '')
            form_data.append('style', 'autumn')
            form_data.append('linenos', '')
            form_data.append('divstyles', 'border:solid #0072c6;border-width:.1em .1em .1em .8em;padding:.2em .6em;')
            // form_data.append('divstyles', 'border:solid #008f05;border-width:.1em .1em .1em .8em;padding:.2em .6em;')
            const response = await fetch(
                api_url,
                {
                    method: 'POST',
                    body: form_data
                }
            )
            response.text().then(
                html => {
                    $(example).replaceWith(html)
                    write_html(`new_${file_url}`, $.html().replaceAll('<br></br>', '<br />'))
                }
            )
        }
    )
}).catch(error => console.error(error))
