// Proje Durum Değişkenleri
let timeLeft = 25 * 60; // Saniye cinsinden (25 dk)
let timerId = null;
let isBreak = false;
let currentStationIndex = 0; // 0: İstanbul, 1: Eskişehir, 2: Kütahya, 3: Balıkesir, 4: İzmir

// İstasyonların harita üzerindeki yüzde konumları
const stationPositions = [0, 25, 50, 75, 100];
const stationNames = ["İstanbul", "Eskişehir", "Kütahya", "Balıkesir", "İzmir"];

// DOM Elemanları
const entryScreen = document.getElementById('entry-screen');
const journeyScreen = document.getElementById('journey-screen');
const statusTitle = document.getElementById('status-title');
const passengerInfoDisplay = document.getElementById('passenger-info-display');
const timerDisplay = document.getElementById('timer-display');
const mainActionBtn = document.getElementById('main-action-btn');
const trainToken = document.getElementById('train-token');
const stations = document.querySelectorAll('.station');
const whistleSound = document.getElementById('train-whistle');

// 🎫 BİLETİ KES VE EKRAN DEĞİŞTİR
function startJourney() {
    const name = document.getElementById('passenger-name').value;
    const wagon = document.getElementById('wagon-class').value;
    const seat = document.getElementById('seat-number').value;

    // Bilgileri güncelle
    passengerInfoDisplay.textContent = `Yolcu: ${name.toUpperCase()} | Vagon-Koltuk: ${wagon} No:${seat}`;
    statusTitle.textContent = "Tren Peronda, Makinistin Harekete Geçmesini Bekliyor...";

    // Ekran geçişleri
    entryScreen.classList.add('hidden');
    journeyScreen.classList.remove('hidden');
    
    resetJourneyState();
}

// ⏱️ SAYAÇ BAŞLAT / DURDUR
function toggleTimer() {
    if (timerId === null) {
        // BAŞLATMA MODU
        timerId = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();

            if (timeLeft === 0) {
                clearInterval(timerId);
                timerId = null;
                whistleSound.play(); // Kondüktör düdüğü çal!
                handleSegmentComplete();
            }
        }, 1000);

        mainActionBtn.textContent = "Freni Çek (Duraklat)";
        mainActionBtn.style.backgroundColor = "#d35400";
        trainToken.classList.add('train-moving');
        
        if(!isBreak) {
            statusTitle.textContent = "Tren Hareket Halinde... Odaklanma Zamanı 🚂💨";
        }
    } else {
        // DURAKLATMA MODU
        clearInterval(timerId);
        timerId = null;
        mainActionBtn.textContent = "Makinisti Harekete Geçir";
        mainActionBtn.style.backgroundColor = "#1e4620";
        trainToken.classList.remove('train-moving');
        statusTitle.textContent = "Tren Geçici Olarak Durduruldu 🛑";
    }
}

// 🕒 EKRANDAKİ SAATİ GÜNCELLE
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// 🚉 BİR ETAP BİTTİĞİNDE (ÇALIŞMA VEYA MOLA BİTİMİ)
function handleSegmentComplete() {
    trainToken.classList.remove('train-moving');

    if (!isBreak) {
        // Çalışma bitti -> İstasyona ulaştık, Mola başlıyor
        currentStationIndex++;
        updateMapVisuals();

        if (currentStationIndex === 4) {
            // İzmir'e varış!
            statusTitle.textContent = "🎉 Tebrikler! İzmir Basmane Garı'na ulaştık! Yolculuk Tamamlandı.";
            timerDisplay.textContent = "00:00";
            mainActionBtn.classList.add('hidden');
            return;
        }

        isBreak = true;
        timeLeft = 5 * 60; // 5 dakika mola
        statusTitle.textContent = `🚉 ${stationNames[currentStationIndex]} İstasyonu'na vardık. 5 Dk Mola!`;
        mainActionBtn.textContent = "Molayı Başlat";
    } else {
        // Mola bitti -> Yeni çalışma etabı başlıyor
        isBreak = false;
        timeLeft = 25 * 60; // 25 dakika çalışma
        statusTitle.textContent = "Mola Bitti! Tren Kalkıyor, Odaklanma Zamanı...";
        mainActionBtn.textContent = "Makinisti Harekete Geçir";
    }
    
    mainActionBtn.style.backgroundColor = "#1e4620";
    updateTimerDisplay();
}

// 🗺️ HARİTADA TRENİ VE İSTASYONLARI GÜNCELLE
function updateMapVisuals() {
    // Treni yürüt
    const targetPercent = stationPositions[currentStationIndex];
    trainToken.style.left = `${targetPercent}%`;

    // İstasyon ışıklarını yak
    stations.forEach((station, index) => {
        if (index <= currentStationIndex) {
            station.classList.add('active');
        } else {
            station.classList.remove('active');
        }
    });
}

// 🔄 YOLCULUĞU İPTAL ET (GİRİŞE DÖN)
function abandonJourney() {
    if (confirm("Yolculuğu iptal edip bilet gişesine dönmek istediğinize emin misiniz?")) {
        clearInterval(timerId);
        timerId = null;
        journeyScreen.classList.add('hidden');
        entryScreen.classList.remove('hidden');
    }
}

// ⚙️ SIFIRLAMA REÇETESİ
function resetJourneyState() {
    timeLeft = 25 * 60;
    isBreak = false;
    currentStationIndex = 0;
    updateMapVisuals();
    updateTimerDisplay();
    mainActionBtn.classList.remove('hidden');
    mainActionBtn.textContent = "Makinisti Harekete Geçir";
    mainActionBtn.style.backgroundColor = "#1e4620";
    trainToken.classList.remove('train-moving');
}
