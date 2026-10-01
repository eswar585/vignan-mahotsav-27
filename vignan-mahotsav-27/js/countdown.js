/**
 * MAHOTSAV 2027 — LIVE FESTIVAL COUNTDOWN TIMER
 * Target: 11 Feb 2027, 09:00:00 AM IST
 */

class MahotsavCountdown {
    constructor() {
        this.targetDate = new Date("2027-02-11T09:00:00+05:30").getTime();
        this.timerInterval = null;
        this.prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
    }

    start() {
        this.update();
        this.timerInterval = setInterval(() => this.update(), 1000);
    }

    update() {
        const now = new Date().getTime();
        const difference = this.targetDate - now;

        const daysEl = document.getElementById("cd-days");
        const hoursEl = document.getElementById("cd-hours");
        const minsEl = document.getElementById("cd-minutes");
        const secsEl = document.getElementById("cd-seconds");

        if (!daysEl || !hoursEl || !minsEl || !secsEl) return;

        if (difference <= 0) {
            daysEl.textContent = "00";
            hoursEl.textContent = "00";
            minsEl.textContent = "00";
            secsEl.textContent = "00";
            const banner = document.getElementById("countdown-status-text");
            if (banner) banner.textContent = "🎉 MAHOTSAV 2027 IS LIVE NOW! WELCOME TO VIGNAN! 🎉";
            if (this.timerInterval) clearInterval(this.timerInterval);
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        this.setDigit(daysEl, days, "days");
        this.setDigit(hoursEl, hours, "hours");
        this.setDigit(minsEl, minutes, "minutes");
        this.setDigit(secsEl, seconds, "seconds");
    }

    setDigit(element, value, key) {
        const strVal = String(value).padStart(2, "0");
        if (this.prevValues[key] !== value) {
            element.textContent = strVal;
            element.classList.remove("digit-pulse");
            void element.offsetWidth; // trigger reflow
            element.classList.add("digit-pulse");
            this.prevValues[key] = value;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const cd = new MahotsavCountdown();
    cd.start();
});
