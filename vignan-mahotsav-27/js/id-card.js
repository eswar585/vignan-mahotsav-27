/**
 * MAHOTSAV 2027 — DIGITAL ID CARD GENERATOR & EXPORTER
 * Uses JsBarcode, QRCode.js, and html2canvas.
 */

class MahotsavIDCard {
    constructor() {
        this.cardContainer = document.getElementById("id-card-render-area");
    }

    renderCard(participant) {
        if (!participant) return;

        // Populate text fields
        const nameEl = document.getElementById("id-card-name");
        const mhidEl = document.getElementById("id-card-mhid");
        const collegeEl = document.getElementById("id-card-college");
        const courseEl = document.getElementById("id-card-course");
        const yearEl = document.getElementById("id-card-year");
        const collegeIdEl = document.getElementById("id-card-college-id");
        const catEl = document.getElementById("id-card-category");
        const avatarEl = document.getElementById("id-card-avatar");

        if (nameEl) nameEl.textContent = participant.name;
        if (mhidEl) mhidEl.textContent = participant.mhid || "MH27XXXX";
        if (collegeEl) collegeEl.textContent = participant.college_name;
        if (courseEl) courseEl.textContent = participant.course;
        if (yearEl) yearEl.textContent = participant.studying_year;
        if (collegeIdEl) collegeIdEl.textContent = participant.college_id;
        if (catEl) catEl.textContent = participant.category || "Culturals";
        
        if (avatarEl) {
            if (participant.photo_url) {
                avatarEl.innerHTML = `<img src="${participant.photo_url}" alt="Participant Photo" />`;
            } else {
                avatarEl.innerHTML = `<span class="id-avatar-initial">${participant.name.charAt(0)}</span>`;
            }
        }

        // Generate barcode using JsBarcode
        const barcodeEl = document.getElementById("id-card-barcode-svg");
        const barcodeValue = participant.mhid || `MH27${participant.id.slice(-6).toUpperCase()}`;
        if (barcodeEl && window.JsBarcode) {
            try {
                window.JsBarcode(barcodeEl, barcodeValue, {
                    format: "CODE128",
                    lineColor: "#1a0b06",
                    width: 2.1,
                    height: 52,
                    displayValue: true,
                    fontSize: 13,
                    font: "Outfit, sans-serif",
                    textMargin: 4,
                    background: "transparent"
                });
            } catch (err) {
                console.error("Barcode generation failed:", err);
            }
        }

        // Generate QR code for mobile scanner verification
        const qrEl = document.getElementById("id-card-qr-box");
        if (qrEl && window.QRCode) {
            qrEl.innerHTML = "";
            new window.QRCode(qrEl, {
                text: `${window.location.origin}/status.html?mhid=${participant.mhid || participant.id}`,
                width: 80,
                height: 80,
                colorDark: "#1a0b06",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    }

    async downloadIDCard(filename = "Mahotsav2027_ID_Card.png") {
        const cardElement = document.getElementById("mahotsav-pass-card");
        if (!cardElement) {
            showToast("ID Card element not found.", "error");
            return;
        }

        const downloadBtn = document.getElementById("btn-download-card");
        if (downloadBtn) {
            downloadBtn.disabled = true;
            downloadBtn.innerHTML = `<span>Generating High-Res Card...</span>`;
        }

        try {
            if (window.html2canvas) {
                const canvas = await window.html2canvas(cardElement, {
                    scale: 3, // crisp high DPI
                    useCORS: true,
                    backgroundColor: null,
                    logging: false
                });

                const link = document.createElement("a");
                link.download = filename;
                link.href = canvas.toDataURL("image/png");
                link.click();

                showToast("Digital ID Card downloaded successfully!", "success");
            } else {
                window.print();
            }
        } catch (err) {
            console.error("ID Card export error:", err);
            showToast("Failed to export image. Opening print view instead.", "warning");
            window.print();
        } finally {
            if (downloadBtn) {
                downloadBtn.disabled = false;
                downloadBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download ID Card`;
            }
        }
    }
}

if (typeof window !== "undefined") {
    window.MahotsavIDCard = MahotsavIDCard;
}
