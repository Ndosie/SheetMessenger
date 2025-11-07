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


function readExcelFile(expectEmoji, partialEmoji, fullEmoji) {
    const fileInput = document.getElementById("excelFile");
    if (!fileInput.files.length) {
        alert("Please enter the link or upload an Excel file.");
        return Promise.resolve("");
    }

    return new Promise((resolve, reject) => {
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
                resolve(messages)
            } catch (err) {
                resolve(`Failed to parse workbook: ${err}`);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(fileInput.files[0]);
    });
}

async function readExcelLink(link, expectEmoji, partialEmoji, fullEmoji) {

  const SHEET_ID = link.split('/')[5]
  const SHEET_NAME = "Sheet1"; // change if needed

  //https://docs.google.com/spreadsheets/d/1Pgp5K1XskfQ24FXSYKIyGMMNGNDNTIqIzUgYgpke6bI/edit?usp=sharing

  // Public CSV URL
  const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit?usp=sharing`;

  try {
    const res = await fetch(url);
    const csv = await res.text();
    console.log(csv)

    // Parse CSV manually
    const rows = csv.trim().split("\n").map(r => r.split(","));
    let messages = "";

    for (let i = 1; i < rows.length; i++) { // skip header
      const [sn, name, amountToPay, amountPaid] = rows[i];
      if (!sn || !name || !amountToPay) continue;

      let msg = `${sn}, ${name}, ${amountToPay}`;
      if (amountPaid) {
        msg += ` (${amountPaid})`;
        msg += (parseFloat(amountPaid) >= parseFloat(amountToPay)) ? ` ${fullEmoji}` : ` ${partialEmoji}`;
      }
      messages += msg + "\n";
    }
  } catch (err) {
    messages = "Failed to fetch sheet data.\n" + err;
  }
  return messages;
}

async function generateMessages() {
    
    const linkInput = document.getElementById("excelLink");
    const expectEmoji = document.getElementById("expectedEmojiDisplay").textContent;
    const partialEmoji = document.getElementById("partialEmojiDisplay").textContent;
    const fullEmoji = document.getElementById("fullEmojiDisplay").textContent;
    const output = document.getElementById("output");

    if (linkInput.value) {
        await readExcelLink(linkInput.value, expectEmoji, partialEmoji, fullEmoji).then((data) => {

        })
    } else {
        await readExcelFile(expectEmoji, partialEmoji, fullEmoji).then(data => {
            console.log(data)
            output.value = data
        })
    }
}