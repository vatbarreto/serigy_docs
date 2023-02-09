(async () => {

    const fs = require('fs')
    const cheerio = require('cheerio')
    const htmlparser2 = require('htmlparser2')
    
    const api_url = 'http://hilite.me/api'
    const input_dir = 'html/input/'
    const output_dir = 'html/output/'
    
    async function list_html() {
        try {
            const files = await fs.promises.readdir(input_dir)
            return files
        } catch(error) {
            console.error(error)
        }
    }
    
    async function read_html(filename) {
        try {
            const html_data = await fs.promises.readFile(`${input_dir}${filename}`, 'utf-8')
            return html_data
        } catch(error) {
            console.error(error)
        }
    }
    
    async function write_html(filename, data) {
        try {
            await fs.promises.writeFile(`${output_dir}${filename}`, data)
        } catch(error) {
            console.error(error)
        }
    }

    async function request_api(html) {
        try {
            let form_data = new FormData()
            form_data.append('code', html)
            form_data.append('lexer', 'html')
            form_data.append('options', '')
            form_data.append('style', 'autumn')
            form_data.append('linenos', '')
            form_data.append('divstyles', 'border:solid #0072c6;border-width:.1em .1em .1em .8em;padding:.2em .6em;')
            // form_data.append('divstyles', 'border:solid #008f05;border-width:.1em .1em .1em .8em;padding:.2em .6em;')
            const response = await fetch(
                api_url, {
                    method: 'POST',
                    body: form_data
                }
            )
            if (!response.ok) {
                console.error(`### ERROR: API Response status code ${response.status}`)
                return null
            }
            return response.text()
        } catch(error) {
            console.error(`### ERROR: API request returned error ${error}`)
            return null
        }
    }
    
    async function format_html(filename) {
        const html_data = await read_html(filename)
        const document = htmlparser2.parseDocument(html_data)
        const $ = cheerio.load(document)
        await Promise.all($('code').get().map(
            async (original_code, i) => {
                try {
                    // process.stdout.write(`# Requesting hilite.me API for code tag #${parseInt(i)+1}... `)
                    const formatted_code = await request_api($(original_code).html())
                    // console.log('ok!')
                    process.stdout.write(`# Formatting '${filename}' code tag #${parseInt(i)+1}... `)
                    $(original_code).replaceWith(formatted_code)
                    console.log('ok!')
                } catch(error) {
                    console.error(error)
                }
            }
        ))
        process.stdout.write(`>>> Saving file '${filename}'... `)
        const html = $.html()
                      .replaceAll('<!-- HTML generated using hilite.me -->', '')
                      .replaceAll('<br></br>', '<br />')
        await write_html(filename, html)
        console.log('Finished!')
    }
    
    const files = await list_html()
    files.forEach(async file => await format_html(file))
    
})()