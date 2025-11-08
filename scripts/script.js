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

function generateMessages() {   
    const fileInput = document.getElementById("excelFile");
    const expectEmoji = document.getElementById("expectedEmojiDisplay").textContent;
    const partialEmoji = document.getElementById("partialEmojiDisplay").textContent;
    const fullEmoji = document.getElementById("fullEmojiDisplay").textContent;
    const output = document.getElementById("output");

    if (!fileInput.files.length) {
        alert("Please enter the link or upload an Excel file.");
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
                header: ["sn", "name", "amountToBePaid", "amountPaid"],
                defval: ""
            });

            jsonData.forEach((row, index) => {
                if (index === 0) return;
                let msg = `${row.sn}.${row.name} `;
                if (row.amountPaid) {
                    if (row.amountToBePaid === row.amountPaid) {
                        msg += `${row.amountToBePaid.toLocaleString()}${fullEmoji}`
                    } else {
                        msg += `${row.amountToBePaid.toLocaleString()}${expectEmoji}(${row.amountPaid.toLocaleString()}${partialEmoji})`
                    }
                } else {
                    msg += `${row.amountToBePaid.toLocaleString()}${expectEmoji}`
                }
                messages += msg + "\n";
            });
            output.value = messages;
        } catch (err) {
            output.value = `Failed to parse workbook: ${err}`;
        }
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}