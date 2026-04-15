const fs = require('fs');
const marked = require('marked');
const puppeteer = require('puppeteer-core');

(async () => {
    try {
        const md = fs.readFileSync('ACID_Explanation.md', 'utf-8');
        const htmlContent = marked.parse(md);
        
        const fullHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    @page {
                        margin: 20mm;
                    }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        line-height: 1.6; 
                        padding: 0; 
                        margin: 0;
                        color: #333; 
                    }
                    h1 { color: #2c3e50; text-align: center; margin-top: 0; }
                    h2 { 
                        color: #2980b9; 
                        border-bottom: 2px solid #eee; 
                        padding-bottom: 5px; 
                        margin-top: 30px;
                        page-break-after: avoid;
                    }
                    h3 { color: #e67e22; page-break-after: avoid; }
                    strong { color: #e74c3c; }
                    ul { background: #f9f9f9; padding: 20px 40px; border-radius: 8px; }
                    li { margin-bottom: 15px; }
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin: 20px 0; 
                    }
                    th, td { 
                        border: 1px solid #ddd; 
                        padding: 12px; 
                        text-align: left; 
                    }
                    th { background-color: #f2f2f2; }
                    hr { border: 0; border-top: 1px solid #eee; margin: 40px 0; }
                    .content-section {
                        page-break-inside: auto;
                    }
                </style>
            </head>
            <body>
                <div class="content-section">
                    ${htmlContent}
                </div>
            </body>
            </html>
        `;

        const browser = await puppeteer.launch({ 
            headless: 'new',
            executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
        });
        const page = await browser.newPage();
        await page.setContent(fullHtml, { waitUntil: 'networkidle0' });
        
        // Use standard A4 format with margins to ensure it spans multiple pages
        await page.pdf({ 
            path: 'ACID_Explanation.pdf', 
            format: 'A4', 
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '20mm',
                right: '20mm'
            }
        });
        
        await browser.close();
        console.log('PDF Generated Successfully!');
    } catch (e) {
        console.error('Error:', e);
    }
})();
