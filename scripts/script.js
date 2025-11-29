const emojis = ["🅰️", "✅", "☑️","😀","😁","😂","😊","😍","😎","😢","😭","😡","👍","👎","🙏","👏","💪","🔥","🎉","💰","💸","❌","⭐","🌟","💖","📞","💬"];

const emojiPicker = document.getElementById("emojiPicker");
let currentTarget = null;

emojis.forEach(emoji => {
    const span = document.createElement("span");
    span.textContent = emoji;
    span.classList.add("emoji");
    span.onclick = () => selectEmoji(emoji);
    emojiPicker.appendChild(span);
});

function openPicker(target) {
    currentTarget = target;
    const rect = document.getElementById(target + "EmojiDisplay").getBoundingClientRect();
    emojiPicker.style.left = rect.left + "px";
    emojiPicker.style.top = rect.bottom + "px";
    emojiPicker.style.display = "block";
}

function selectEmoji(emoji) {
    if (currentTarget === "partial") {
        document.getElementById("partialEmojiDisplay").textContent = emoji;
    } else if (currentTarget === "full") {
        document.getElementById("fullEmojiDisplay").textContent = emoji;
    }
    emojiPicker.style.display = "none";
}

document.addEventListener("click", (e) => {
    if (!emojiPicker.contains(e.target) && !e.target.classList.contains("emoji-display")) {
        emojiPicker.style.display = "none";
    }
});

function generateMessage() {   
    const fileInput = document.getElementById("excelFile");
    const expectedEmoji = document.getElementById("expectedEmojiDisplay").textContent;
    const partialEmoji = document.getElementById("partialEmojiDisplay").textContent;
    const fullEmoji = document.getElementById("fullEmojiDisplay").textContent;
    const output = document.getElementById("output");

    document.getElementById("loading").style.display = "block";
    document.getElementById("generate-btn").disabled = true;

    if (!fileInput.files.length) {
        alert("Please enter the link or upload an Excel file.");
        document.getElementById("loading").style.display = "none";
        document.getElementById("generate-btn").disabled = false;
        return
    }

    const reader = new FileReader();
    let messages = "";

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error("No sheets found in workbook");
            }
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                header: ["sn", "name", "amountToPay", "amountPaid"],
                defval: ""
            });

            messages = `Contributions Summary\n`;
            messages += `${expectedEmoji} - Expected Payment \n`
            messages += `${partialEmoji} - Partially Paid\n`
            messages += `${fullEmoji} - Fully Paid\n\n`;

            jsonData.forEach((row, index) => {
                if (index === 0) return;
                let msg = `${row.sn ? row.sn + '.' : ''} ${row.name} `;
                if (row.amountPaid) {
                    if (row.amountToPay === row.amountPaid) {
                        msg += `${row.amountToPay.toLocaleString()}${fullEmoji}`
                    } else {
                        msg += `${row.amountToPay.toLocaleString()}${expectedEmoji}(${row.amountPaid.toLocaleString()}${partialEmoji})`
                    }
                } else {
                    msg += `${row.amountToPay.toLocaleString()}${expectedEmoji}`
                }
                messages += msg + "\n";
            });
            output.value = messages;
            document.getElementById("loading").style.display = "none";
            document.getElementById("generate-btn").disabled = false;
        } catch (err) {
            output.value = `Failed to parse workbook: ${err}`;
            document.getElementById("loading").style.display = "none";
            document.getElementById("generate-btn").disabled = false;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function cleanForWhatsApp(text) {
    return text
        .replace(/\r\n|\r/g, "\n")        
        .replace(/\t/g, "")               
        .replace(/\s+$/gm, "")            
        .normalize("NFC");                
}

function copyText() {
    const txt = document.getElementById("output").value;
    navigator.clipboard.writeText(txt)
        .then(() => alert("Copied!"))
        .catch(() => alert("Unable to copy")); 
}

function shareText() {
    let text = document.getElementById("output").value;
    let cleaned = cleanForWhatsApp(text);

    const url = "https://wa.me/?text=" + encodeURIComponent(cleaned);

    window.open(url, "_blank");
}