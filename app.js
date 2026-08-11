// ==========================================
// ABSENSI GURU
// MTs. BADRIL HUDA
// ==========================================


// ==========================================
// URL BACKEND GOOGLE APPS SCRIPT
// ==========================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


// ==========================================
// VARIABEL SCANNER
// ==========================================

let qrScanner = null;

let sedangScan = false;


// ==========================================
// HALAMAN
// ==========================================

function sembunyikanSemua() {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.add("hidden");

    });

}


function bukaAdmin() {

  sembunyikanSemua();

  document
    .getElementById("adminPage")
    .classList
    .remove("hidden");

}


function bukaGuru() {

  sembunyikanSemua();

  document
    .getElementById("guruPage")
    .classList
    .remove("hidden");

}


function bukaRekap() {

  sembunyikanSemua();

  document
    .getElementById("rekapPage")
    .classList
    .remove("hidden");

}


function kembaliHome() {

  hentikanScanner();

  sembunyikanSemua();

  document
    .getElementById("homePage")
    .classList
    .remove("hidden");

}


// ==========================================
// SCANNER QR
// ==========================================

async function mulaiScan() {

  if (sedangScan) {
    return;
  }


  sedangScan = true;


  // Sembunyikan hasil sebelumnya

  document
    .getElementById("hasilAbsensi")
    .classList
    .add("hidden");


  const scanCard =
    document.querySelector(".scan-card");


  scanCard.innerHTML = `

    <div class="scan-icon">
      📷
    </div>

    <h2>
      Scan QR Guru
    </h2>

    <p>
      Arahkan kamera ke QR Code guru
    </p>

    <div id="qr-reader"
         style="
           width:100%;
           margin-top:15px;
           border-radius:16px;
           overflow:hidden;
         ">
    </div>

    <button
      class="scan-button"
      onclick="batalScan()"
      style="
        margin-top:15px;
        background:#dc3545;
      ">

      ✕ BATAL

    </button>

  `;


  try {

    qrScanner =
      new Html5Qrcode(
        "qr-reader"
      );


    const cameras =
      await Html5Qrcode.getCameras();


    if (
      !cameras ||
      cameras.length === 0
    ) {

      throw new Error(
        "Kamera tidak ditemukan."
      );

    }


    // Cari kamera belakang

    let kameraBelakang =
      cameras.find(
        function(camera) {

          return /back|rear|environment/i
            .test(camera.label);

        }
      );


    // Kalau nama kamera tidak tersedia,
    // gunakan kamera terakhir

    if (!kameraBelakang) {

      kameraBelakang =
        cameras[
          cameras.length - 1
        ];

    }


    await qrScanner.start(

      kameraBelakang.id,

      {

        fps: 10,

        qrbox: function(
          width,
          height
        ) {

          const size =
            Math.min(
              width,
              height
            ) * 0.70;


          return {

            width: size,

            height: size

          };

        },

        aspectRatio: 1.0

      },


      function(decodedText) {

        if (sedangScan !== true) {
          return;
        }


        sedangScan = false;


        hentikanScanner();


        prosesKodeQR(
          decodedText
        );

      },


      function(errorMessage) {

        // Error scan biasa
        // tidak perlu ditampilkan

      }

    );

  }

  catch(error) {

    console.error(error);


    sedangScan = false;


    tampilErrorScanner(
      error.message
    );

  }

}


// ==========================================
// HENTIKAN SCANNER
// ==========================================

async function hentikanScanner() {

  if (!qrScanner) {
    return;
  }


  try {

    await qrScanner.stop();

  }

  catch(error) {

    console.log(error);

  }


  try {

    qrScanner.clear();

  }

  catch(error) {

    console.log(error);

  }


  qrScanner = null;

}


// ==========================================
// BATAL SCAN
// ==========================================

function batalScan() {

  hentikanScanner();

  sedangScan = false;


  // Kembalikan tampilan scan card

  const scanCard =
    document.querySelector(
      ".scan-card"
    );


  scanCard.innerHTML = `

    <div class="scan-icon">
      📷
    </div>

    <h2>
      Scan QR Guru
    </h2>

    <p>
      Arahkan kamera ke QR Code guru
    </p>

    <button
      class="scan-button"
      onclick="mulaiScan()">

      📷 SCAN QR

    </button>

    <div class="time-info">

      Absensi dibuka

      <strong>
        06.30 - 07.30 WIB
      </strong>

    </div>

  `;

}


// ==========================================
// KIRIM QR KE APPS SCRIPT
// ==========================================

function prosesKodeQR(
  kodeQR
) {

  tampilMenunggu();


  const callbackName =
    "absensiCallback_" +
    Date.now();


  window[callbackName] =
    function(result) {

      try {

        prosesHasilAbsensi(
          result
        );

      }

      finally {

        delete window[
          callbackName
        ];

      }

    };


  const script =
    document.createElement(
      "script"
    );


  const url =
    API_URL +
    "?action=absensi" +
    "&kodeQR=" +
    encodeURIComponent(
      kodeQR
    ) +
    "&callback=" +
    callbackName;


  script.src = url;


  script.onerror =
    function() {

      delete window[
        callbackName
      ];


      tampilError(
        "Tidak dapat terhubung ke server absensi."
      );

    };


  document
    .body
    .appendChild(script);


  // Hapus script setelah selesai

  setTimeout(
    function() {

      if (
        script.parentNode
      ) {

        script.parentNode
          .removeChild(script);

      }

    },
    10000
  );

}


// ==========================================
// MENUNGGU
// ==========================================

function tampilMenunggu() {

  const hasil =
    document.getElementById(
      "hasilAbsensi"
    );


  hasil.classList.remove(
    "hidden"
  );


  hasil.style.background =
    "#e7f3ff";


  hasil.style.color =
    "#0066a1";


  hasil.innerHTML = `

    <div class="success-icon"
         style="
           background:#0d6efd;
         ">

      ⏳

    </div>

    <h2>
      MEMERIKSA ABSENSI
    </h2>

    <div class="guru-result">

      <span>
        Mohon tunggu...
      </span>

    </div>

  `;

}


// ==========================================
// HASIL ABSENSI
// ==========================================

function prosesHasilAbsensi(
  result
) {

  const hasil =
    document.getElementById(
      "hasilAbsensi"
    );


  hasil.classList.remove(
    "hidden"
  );


  // ========================================
  // BERHASIL
  // ========================================

  if (
    result &&
    result.sukses
  ) {

    hasil.style.background =
      "#dff7eb";


    hasil.style.color =
      "#075c43";


    hasil.innerHTML = `

      <div class="success-icon">
        ✓
      </div>

      <h2>
        ABSENSI BERHASIL
      </h2>

      <div class="guru-result">

        <strong>
          ${escapeHtml(
            result.nama
          )}
        </strong>

        <span>
          ${escapeHtml(
            result.jabatan
          )}
        </span>

        <span>
          Jam Masuk:
          <b>
            ${escapeHtml(
              result.jam
            )}
          </b>
        </span>

      </div>

      <button
        onclick="suaraBerhasil()"
        class="scan-button">

        🔊 ABSENSI BERHASIL

      </button>

      <button
        onclick="mulaiScan()"
        class="scan-button"
        style="
          margin-top:10px;
        ">

        📷 SCAN LAGI

      </button>

    `;


    suaraBerhasil();

    return;

  }


  // ========================================
  // SUDAH ABSEN
  // ========================================

  if (
    result &&
    result.sudahAbsen
  ) {

    hasil.style.background =
      "#dff7eb";


    hasil.style.color =
      "#075c43";


    hasil.innerHTML = `

      <div class="success-icon">
        ✓
      </div>

      <h2>
        SUDAH ABSEN
      </h2>

      <div class="guru-result">

        <strong>
          ${escapeHtml(
            result.nama
          )}
        </strong>

        <span>
          Jam:
          <b>
            ${escapeHtml(
              result.jam
            )}
          </b>
        </span>

      </div>

      <button
        onclick="mulaiScan()"
        class="scan-button">

        📷 SCAN LAGI

      </button>

    `;


    return;

  }


  // ========================================
  // ERROR
  // ========================================

  tampilError(
    result &&
    result.pesan
      ? result.pesan
      : "Absensi gagal."
  );

}


// ==========================================
// ERROR
// ==========================================

function tampilError(
  pesan
) {

  const hasil =
    document.getElementById(
      "hasilAbsensi"
    );


  hasil.classList.remove(
    "hidden"
  );


  hasil.style.background =
    "#ffe3e3";


  hasil.style.color =
    "#b00020";


  hasil.innerHTML = `

    <div class="success-icon"
         style="
           background:#dc3545;
         ">

      !

    </div>

    <h2>
      ABSENSI GAGAL
    </h2>

    <div class="guru-result">

      <span>
        ${escapeHtml(pesan)}
      </span>

    </div>

    <button
      onclick="mulaiScan()"
      class="scan-button">

      📷 COBA LAGI

    </button>

  `;

}


function tampilErrorScanner(
  pesan
) {

  const scanCard =
    document.querySelector(
      ".scan-card"
    );


  scanCard.innerHTML = `

    <div class="scan-icon">
      ⚠️
    </div>

    <h2>
      KAMERA TIDAK DAPAT DIBUKA
    </h2>

    <p>
      ${escapeHtml(pesan)}
    </p>

    <button
      class="scan-button"
      onclick="mulaiScan()">

      📷 COBA LAGI

    </button>

  `;

}


// ==========================================
// SUARA
// ==========================================

function suaraBerhasil() {

  try {

    const suara =
      new SpeechSynthesisUtterance(
        "Absensi berhasil"
      );


    suara.lang =
      "id-ID";


    suara.rate =
      1;


    suara.pitch =
      1;


    window
      .speechSynthesis
      .cancel();


    window
      .speechSynthesis
      .speak(
        suara
      );

  }

  catch(error) {

    console.log(error);

  }

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(
  text
) {

  return String(
    text ?? ""
  )

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


// ==========================================
// LOGIN ADMIN SEMENTARA
// ==========================================

const ADMIN_PIN =
  "123456";


function loginAdmin() {

  const pin =
    document
      .getElementById(
        "adminPin"
      )
      .value
      .trim();


  const message =
    document
      .getElementById(
        "loginMessage"
      );


  if (!pin) {

    message.innerHTML =
      "<p style='color:#dc3545'>PIN belum diisi.</p>";

    return;

  }


  if (
    pin ===
    ADMIN_PIN
  ) {

    message.innerHTML =
      "<p style='color:#087f5b'>✓ Login berhasil.</p>";


    setTimeout(
      function() {

        alert(
          "Halaman Admin akan kita hubungkan ke Google Sheet pada tahap berikutnya."
        );

      },
      400
    );

  }

  else {

    message.innerHTML =
      "<p style='color:#dc3545'>✕ PIN Admin salah.</p>";

  }

}


// ==========================================
// REKAP SEMENTARA
// ==========================================

function tampilkanRekap() {

  const bulan =
    document
      .getElementById(
        "bulanRekap"
      )
      .value;


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  document
    .getElementById(
      "hasilRekap"
    )
    .innerHTML = `

      <div style="
        margin-top:15px;
        padding:15px;
        background:#f0f8f5;
        border-radius:12px;
        color:#087f5b;
      ">

        Rekap bulan
        <strong>
          ${escapeHtml(
            bulan
          )}
        </strong>

        <br><br>

        Rekap Google Sheet
        akan kita aktifkan
        pada tahap berikutnya.

      </div>

    `;

}


// ==========================================
// DEFAULT BULAN
// ==========================================

window.addEventListener(
  "DOMContentLoaded",
  function() {

    const sekarang =
      new Date();


    const bulan =
      sekarang.getFullYear() +
      "-" +
      String(
        sekarang.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    const input =
      document.getElementById(
        "bulanRekap"
      );


    if (input) {

      input.value =
        bulan;

    }

  }
);
