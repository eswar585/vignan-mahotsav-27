/**
 * MAHOTSAV 2027 — BACKGROUND MUSIC CONTROLLER
 * Uses uploaded music.mpeg asset.
 * Features persistent playback across pages, autoplay handling,
 * volume preference memory, and animated sound visualizer.
 */

class MahotsavMusicController {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.audioSrc = "music.mpeg";
        this.storageMuteKey = "mahotsav_music_muted";
        this.storageTimeKey = "mahotsav_music_playback_time";
        this.storagePlayingKey = "mahotsav_music_was_playing";
        this.init();
    }

    init() {
        if (typeof window === "undefined") return;

        // Create persistent audio element
        this.audio = new Audio(this.audioSrc);
        this.audio.loop = true;
        this.audio.preload = "auto";
        this.audio.volume = 0.55; // pleasing background level

        // Restore mute preference
        const savedMute = localStorage.getItem(this.storageMuteKey);
        if (savedMute !== null) {
            this.isMuted = savedMute === "true";
            this.audio.muted = this.isMuted;
        }

        // Restore playback position across page navigations
        const savedTime = sessionStorage.getItem(this.storageTimeKey);
        if (savedTime) {
            const timeNum = parseFloat(savedTime);
            if (!isNaN(timeNum) && timeNum > 0) {
                this.audio.currentTime = timeNum;
            }
        }

        // Periodically track playback time
        this.audio.addEventListener("timeupdate", () => {
            sessionStorage.setItem(this.storageTimeKey, this.audio.currentTime.toString());
        });

        // Track play/pause state
        this.audio.addEventListener("play", () => {
            this.isPlaying = true;
            sessionStorage.setItem(this.storagePlayingKey, "true");
            this.updateUI();
        });

        this.audio.addEventListener("pause", () => {
            this.isPlaying = false;
            sessionStorage.setItem(this.storagePlayingKey, "false");
            this.updateUI();
        });

        // Build floating UI widget on DOM load
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => this.injectUI());
        } else {
            this.injectUI();
        }

        // Attempt autoplay
        this.attemptAutoPlay();
    }

    injectUI() {
        if (document.getElementById("mahotsav-music-widget")) return;

        const widget = document.createElement("div");
        widget.id = "mahotsav-music-widget";
        widget.className = "music-widget";
        widget.innerHTML = `
            <div class="music-widget-inner" id="music-widget-pill" title="Mahotsav Anthem (Click to Toggle)">
                <div class="sound-bars ${this.isPlaying && !this.isMuted ? 'active' : ''}" id="music-sound-bars">
                    <span></span><span></span><span></span><span></span>
                </div>
                <div class="music-info">
                    <span class="music-title">Mahotsav Anthem</span>
                    <span class="music-status" id="music-status-text">${this.isPlaying ? (this.isMuted ? 'Muted' : 'Playing') : 'Paused'}</span>
                </div>
                <button class="music-btn-icon" id="music-play-btn" aria-label="Play or Pause Music">
                    <svg id="music-icon-play" class="${this.isPlaying ? 'hidden' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    <svg id="music-icon-pause" class="${this.isPlaying ? '' : 'hidden'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16"></rect>
                        <rect x="14" y="4" width="4" height="16"></rect>
                    </svg>
                </button>
                <button class="music-btn-icon" id="music-mute-btn" aria-label="Mute or Unmute Music">
                    <svg id="music-icon-volume" class="${this.isMuted ? 'hidden' : ''}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                    </svg>
                    <svg id="music-icon-muted" class="${this.isMuted ? '' : 'hidden'}" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(widget);

        // Bind events
        document.getElementById("music-play-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.togglePlay();
        });

        document.getElementById("music-mute-btn")?.addEventListener("click", (e) => {
            e.stopPropagation();
            this.toggleMute();
        });

        document.getElementById("music-widget-pill")?.addEventListener("click", () => {
            this.togglePlay();
        });
    }

    attemptAutoPlay() {
        const wasPlaying = sessionStorage.getItem(this.storagePlayingKey);
        
        // Try playing
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                this.updateUI();
            }).catch(() => {
                // Autoplay was blocked by browser policy
                this.isPlaying = false;
                this.updateUI();
                this.showAutoplayNotice();
            });
        }
    }

    showAutoplayNotice() {
        // If notice already exists, skip
        if (document.getElementById("music-autoplay-banner")) return;

        const banner = document.createElement("div");
        banner.id = "music-autoplay-banner";
        banner.className = "music-autoplay-pill";
        banner.innerHTML = `
            <span>🎵 Tap to experience MAHOTSAV with Anthem</span>
            <button class="btn btn-sm btn-gold">Play</button>
        `;

        banner.addEventListener("click", () => {
            this.audio.play().then(() => {
                this.isPlaying = true;
                this.updateUI();
                banner.remove();
            }).catch(console.warn);
        });

        // Also start audio on the first user interaction anywhere on the document
        const onFirstInteract = () => {
            if (!this.isPlaying) {
                this.audio.play().then(() => {
                    this.isPlaying = true;
                    this.updateUI();
                    if (banner.parentNode) banner.remove();
                }).catch(() => {});
            }
            document.removeEventListener("click", onFirstInteract);
            document.removeEventListener("keydown", onFirstInteract);
        };

        document.addEventListener("click", onFirstInteract, { once: true });
        document.addEventListener("keydown", onFirstInteract, { once: true });

        document.body.appendChild(banner);
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audio.pause();
        } else {
            this.audio.play().then(() => {
                const banner = document.getElementById("music-autoplay-banner");
                if (banner) banner.remove();
            }).catch(console.warn);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.audio.muted = this.isMuted;
        localStorage.setItem(this.storageMuteKey, this.isMuted.toString());
        this.updateUI();
    }

    updateUI() {
        const soundBars = document.getElementById("music-sound-bars");
        const statusText = document.getElementById("music-status-text");
        const iconPlay = document.getElementById("music-icon-play");
        const iconPause = document.getElementById("music-icon-pause");
        const iconVolume = document.getElementById("music-icon-volume");
        const iconMuted = document.getElementById("music-icon-muted");

        if (soundBars) {
            if (this.isPlaying && !this.isMuted) {
                soundBars.classList.add("active");
            } else {
                soundBars.classList.remove("active");
            }
        }

        if (statusText) {
            statusText.textContent = this.isPlaying ? (this.isMuted ? "Muted" : "Playing") : "Paused";
        }

        if (iconPlay && iconPause) {
            if (this.isPlaying) {
                iconPlay.classList.add("hidden");
                iconPause.classList.remove("hidden");
            } else {
                iconPlay.classList.remove("hidden");
                iconPause.classList.add("hidden");
            }
        }

        if (iconVolume && iconMuted) {
            if (this.isMuted) {
                iconVolume.classList.add("hidden");
                iconMuted.classList.remove("hidden");
            } else {
                iconVolume.classList.remove("hidden");
                iconMuted.classList.add("hidden");
            }
        }
    }
}

// Global instance
const MahotsavMusic = new MahotsavMusicController();
if (typeof window !== "undefined") {
    window.MahotsavMusic = MahotsavMusic;
}
