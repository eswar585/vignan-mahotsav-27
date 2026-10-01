/**
 * MAHOTSAV 2027 — ADMIN CAMERA BARCODE & QR SCANNER
 * Uses Html5Qrcode library with manual search fallback.
 */

class MahotsavAdminScanner {
    constructor(onScanSuccessCallback) {
        this.html5QrCode = null;
        this.isScanning = false;
        this.onScanSuccessCallback = onScanSuccessCallback;
    }

    async startCamera(readerElementId = "qr-reader") {
        if (!window.Html5Qrcode) {
            showToast("Scanner library not loaded. Use manual MHID lookup below.", "warning");
            return;
        }

        try {
            if (!this.html5QrCode) {
                this.html5QrCode = new window.Html5Qrcode(readerElementId);
            }

            const config = {
                fps: 10,
                qrbox: { width: 280, height: 280 },
                aspectRatio: 1.0
            };

            await this.html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    this.handleScan(decodedText);
                },
                (errorMessage) => {
                    // Ignore transient frame recognition errors
                }
            );

            this.isScanning = true;
            const toggleBtn = document.getElementById("btn-toggle-camera");
            if (toggleBtn) {
                toggleBtn.textContent = "Stop Camera";
                toggleBtn.classList.replace("btn-gold", "btn-outline-danger");
            }
            showToast("Camera scanner active. Hold barcode or QR code in view.", "info");
        } catch (err) {
            console.error("Camera access error:", err);
            showToast("Camera access was denied or not supported on this device. You can type the MHID manually.", "warning");
        }
    }

    async stopCamera() {
        if (this.html5QrCode && this.isScanning) {
            try {
                await this.html5QrCode.stop();
                this.isScanning = false;
                const toggleBtn = document.getElementById("btn-toggle-camera");
                if (toggleBtn) {
                    toggleBtn.textContent = "Start Camera Scanner";
                    toggleBtn.classList.replace("btn-outline-danger", "btn-gold");
                }
            } catch (err) {
                console.warn("Stop camera error:", err);
            }
        }
    }

    async toggleCamera(readerElementId = "qr-reader") {
        if (this.isScanning) {
            await this.stopCamera();
        } else {
            await this.startCamera(readerElementId);
        }
    }

    handleScan(scannedText) {
        // Scanned text could be an MHID (e.g. MH270001) or a verification URL
        let mhid = scannedText.trim();
        if (mhid.includes("mhid=")) {
            const url = new URL(mhid);
            mhid = url.searchParams.get("mhid") || mhid;
        }

        // Vibrate if supported
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }

        if (this.onScanSuccessCallback) {
            this.onScanSuccessCallback(mhid);
        }
    }
}

if (typeof window !== "undefined") {
    window.MahotsavAdminScanner = MahotsavAdminScanner;
}
