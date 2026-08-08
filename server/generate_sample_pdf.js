const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createSampleBankStatement(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header styling
    doc.fillColor('#0f2b5c').fontSize(20).text('HDFC BANK LIMITED', { align: 'left' });
    doc.fontSize(10).fillColor('#666666').text('Jodhpur Main Branch, Residency Road, Jodhpur - 342001', { align: 'left' });
    doc.moveDown(0.5);

    doc.strokeColor('#0f2b5c').lineWidth(2).moveTo(40, doc.y).lineTo(570, doc.y).stroke();
    doc.moveDown(1);

    // Statement title & details
    doc.fillColor('#111111').fontSize(14).text('SAVINGS ACCOUNT STATEMENT', { underline: true });
    doc.moveDown(0.5);

    doc.fontSize(9).fillColor('#333333');
    doc.text('Account Name: Harshit Mathur');
    doc.text('Account Number: 50100298412093');
    doc.text('Statement Period: 01-Jul-2026 to 31-Jul-2026');
    doc.text('Currency: INR (₹)');
    doc.moveDown(1);

    // Financial Summary Box
    const boxY = doc.y;
    doc.rect(40, boxY, 530, 55).fillAndStroke('#f0f4f8', '#cccccc');
    doc.fillColor('#111111').fontSize(10);
    doc.text('STATEMENT SUMMARY', 50, boxY + 8, { underline: true });

    doc.fontSize(9).fillColor('#333333');
    doc.text('Opening Balance: ₹45,200.00', 50, boxY + 25);
    doc.fillColor('#006c47').text('Total Credits (Salary): ₹1,25,000.00', 210, boxY + 25);
    doc.fillColor('#ba1a1a').text('Total Debits (Expenses): ₹42,500.00', 390, boxY + 25);
    doc.fillColor('#111111').text('Closing Balance: ₹1,27,700.00', 50, boxY + 38);
    
    doc.y = boxY + 70;
    doc.moveDown(1);

    // Transaction Details Table Header
    doc.fillColor('#0f2b5c').fontSize(11).text('TRANSACTION DETAILS', { underline: true });
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.fontSize(9).fillColor('#ffffff');
    doc.rect(40, tableTop, 530, 20).fill('#0f2b5c');

    doc.fillColor('#ffffff');
    doc.text('Date', 45, tableTop + 5);
    doc.text('Description / Particulars', 110, tableTop + 5);
    doc.text('Type', 360, tableTop + 5);
    doc.text('Amount (₹)', 410, tableTop + 5);
    doc.text('Balance (₹)', 490, tableTop + 5);

    const transactions = [
      { date: '01-Jul-2026', desc: 'ACH Cr - ACME CORP MONTHLY SALARY', type: 'Credit', amount: '1,25,000.00', balance: '1,70,200.00' },
      { date: '03-Jul-2026', desc: 'NEFT Dr - APARTMENT RENT DEBIT', type: 'Debit', amount: '22,000.00', balance: '1,48,200.00' },
      { date: '05-Jul-2026', desc: 'UPI Dr - SWIGGY & GROCERY PAYMENT', type: 'Debit', amount: '3,500.00', balance: '1,44,700.00' },
      { date: '10-Jul-2026', desc: 'BillDesk Dr - JODHPUR ELECTRICITY BILL', type: 'Debit', amount: '4,200.00', balance: '1,40,500.00' },
      { date: '15-Jul-2026', desc: 'POS Dr - SHELL FUEL STATION', type: 'Debit', amount: '2,800.00', balance: '1,37,700.00' },
      { date: '20-Jul-2026', desc: 'UPI Dr - AMAZON ONLINE SHOPPING', type: 'Debit', amount: '6,000.00', balance: '1,31,700.00' },
      { date: '25-Jul-2026', desc: 'ATM Dr - CASH WITHDRAWAL JODHPUR', type: 'Debit', amount: '4,000.00', balance: '1,27,700.00' }
    ];

    let currentY = tableTop + 25;
    transactions.forEach((tx, idx) => {
      if (idx % 2 === 1) {
        doc.rect(40, currentY - 3, 530, 18).fill('#f9fafb');
      }

      doc.fillColor('#333333').fontSize(8.5);
      doc.text(tx.date, 45, currentY);
      doc.text(tx.desc, 110, currentY, { width: 240 });
      doc.fillColor(tx.type === 'Credit' ? '#006c47' : '#ba1a1a');
      doc.text(tx.type, 360, currentY);
      doc.text(tx.amount, 410, currentY);
      doc.fillColor('#333333');
      doc.text(tx.balance, 490, currentY);

      currentY += 20;
    });

    doc.moveDown(2);
    doc.y = currentY + 15;
    doc.fontSize(8).fillColor('#777777').text('This is a computer-generated bank statement for Sovereign Curator automated ingestion testing.', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', (err) => reject(err));
  });
}

// Generate files in client public and server data
const clientPublicPath = path.join(__dirname, '../client/public/Sample_Bank_Statement.pdf');
const rootPath = path.join(__dirname, '../Sample_Bank_Statement.pdf');

fs.mkdirSync(path.dirname(clientPublicPath), { recursive: true });

Promise.all([
  createSampleBankStatement(clientPublicPath),
  createSampleBankStatement(rootPath)
]).then(([p1, p2]) => {
  console.log('Sample Bank Statements generated successfully:');
  console.log(' - Public URL access:', p1);
  console.log(' - Root path:', p2);
}).catch(err => {
  console.error('Error generating sample PDF:', err);
});
