function generateMessages() {
    const fileInput = document.getElementById('excelFile');
    const partialEmoji = document.getElementById('partialEmoji').value.trim();
    const fullEmoji = document.getElementById('fullEmoji').value.trim();
    const output = document.getElementById('output');

    if (!fileInput.files.length) {
        alert('Please upload an Excel file.');
        return;
    }
    if (!partialEmoji || !fullEmoji) {
        alert('Please select both emojis.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: ['sn','name','amountToBePaid','amountPaid'], defval: '' });

        let messages = '';

        jsonData.forEach((row, index) => {
            if (index === 0) return; // skip header row if exists
            let msg = `${row.sn} ${row.name} ${row.amountToBePaid.toLocaleString()} ${fullEmoji}`;
            if (row.amountPaid) {
                msg += ` (${row.amountPaid.toLocaleString()} ${partialEmoji})`;
                // if (parseFloat(row.amountPaid) >= parseFloat(row.amountToBePaid)) {
                //     msg += ` ${fullEmoji}`;
                // } else {
                //     msg += ` ${partialEmoji}`;
                // }
            }
            messages += msg + '\n';
        });

        output.value = messages;
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}