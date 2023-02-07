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

async function format_html(filename) {
    const html_data = await read_html(filename)
    const document = htmlparser2.parseDocument(html_data)
    const $ = cheerio.load(document)
    let i = 1
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
            if (response.ok) {
                process.stdout.write(`### Formatting ${filename} example tag #${i++}... `)
                // console._stdout.write(`### Formatting ${filename} example tag #${i++}... `)
                // console.log($(example).html())
                html_text = await response.text()
                $(example).replaceWith(html_text)
                write_html(filename, $.html().replaceAll('<br></br>', '<br />'))
                console.log('Finished!')
            } else {
                console.error('### API Response Error! ###')
            }
        }
    )
}

const files = await list_html()
files.map(async file => await format_html(file))

})()