// ======================================================
// ABSENSI GURU
// MTs. BADRIL HUDA
// GitHub Pages + Google Apps Script
// ======================================================


// ======================================================
// URL GOOGLE APPS SCRIPT
// ======================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


// ======================================================
// VARIABEL GLOBAL
// ======================================================

let qrScanner = null;
let sedangScan = false;

let adminSudahLogin = false;


// ======================================================
// PINDAH HALAMAN
// ======================================================

function sembunyikanSemua() {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.add("hidden");

    });

}


function bukaAdmin() {

  hentikanScanner();

  sembunyikanSemua();

  document
    .getElementById("adminPage")
    .classList
    .remove("hidden");


  if (adminSudahLogin) {

    tampilkanPanelAdmin();

  } else {

    document
      .getElementById("adminLoginBox")
      .classList
      .remove("hidden");

    document
      .getElementById("adminPanel")
      .classList
      .add("hidden");

  }

}


function bukaGuru() {

  hentikanScanner();

  sembunyikanSemua();

  document
    .getElementById("guruPage")
    .classList
    .remove("hidden");

}


function bukaRekap() {

  hentikanScanner();

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


// ======================================================
// API JSONP
// ======================================================

function panggilAPI(
  parameter,
  callback
) {

  const callbackName =
    "apiCallback_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 10000
    );


  window[callbackName] =
    function(result) {

      try {

        callback(result);

      }

      catch(error) {

        console.error(error);

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


  const params =
    new URLSearchParams(
      parameter
    );


  params.set(
    "callback",
    callbackName
  );


  script.src =
    API_URL +
    "?" +
    params.toString();


  script.onerror =
    function() {

      delete window[
        callbackName
      ];

      callback({

        sukses: false,

        pesan:
          "Tidak dapat terhubung ke server."

      });

    };


  document
    .body
    .appendChild(script);


  setTimeout(
    function() {

      if (
        script.parentNode
      ) {

        script.parentNode
          .removeChild(script);

      }

    },
    15000
  );

}


// ======================================================
// LOGIN ADMIN
// ======================================================

function loginAdmin() {

  const pinInput =
    document.getElementById("adminPin");

  const message =
    document.getElementById("loginMessage");

  const pin =
    pinInput.value.trim();

  if (!pin) {

    message.innerHTML = `
      <div class="admin-message-error">
        PIN Admin belum diisi.
      </div>
    `;

    return;
  }

  message.innerHTML = `
    <div class="loading-admin">
      ⏳ Memeriksa PIN...
    </div>
  `;

  panggilAPI(
    {
      action: "login",
      pin: pin
    },

    function(result) {

      console.log(
        "HASIL LOGIN:",
        result
      );

      if (
        result &&
        result.sukses === true
      ) {

        adminSudahLogin = true;

        message.innerHTML = `
          <div class="admin-message-success">
            ✓ Login berhasil.
          </div>
        `;

        setTimeout(
          function() {
            tampilkanPanelAdmin();
          },
          300
        );

      } else {

        message.innerHTML = `
          <div class="admin-message-error">
            ✕ ${
              escapeHtml(
                result &&
                result.pesan
                  ? result.pesan
                  : "PIN Admin salah."
              )
            }
          </div>
        `;

      }

    }
  );

}

// ======================================================
// TAMPILKAN PANEL ADMIN
// ======================================================

function tampilkanPanelAdmin() {

  document
    .getElementById("adminLoginBox")
    .classList
    .add("hidden");


  document
    .getElementById("adminPanel")
    .classList
    .remove("hidden");


  muatDaftarGuru();

}


// ======================================================
// DAFTAR GURU
// ======================================================

function muatDaftarGuru() {

  const container =
    document.getElementById(
      "daftarGuru"
    );


  container.innerHTML = `
    <div class="loading-admin">
      ⏳ Memuat data guru...
    </div>
  `;


  panggilAPI(
    {
      action: "getGuru"
    },

    function(result) {

      if (
        !Array.isArray(result)
      ) {

        container.innerHTML = `
          <div class="admin-message-error">
            Data guru tidak dapat dibaca.
          </div>
        `;

        return;

      }


      tampilkanDaftarGuru(
        result
      );

    }

  );

}


// ======================================================
// TAMPILKAN DAFTAR GURU
// ======================================================

function tampilkanDaftarGuru(
  data
) {

  const container =
    document.getElementById(
      "daftarGuru"
    );


  const total =
    data.length;


  const aktif =
    data.filter(
      function(guru) {

        return String(
          guru.aktif
        ).toUpperCase() === "YA";

      }
    ).length;


  const nonaktif =
    total - aktif;


  document
    .getElementById(
      "totalGuru"
    )
    .textContent =
    total;


  document
    .getElementById(
      "guruAktif"
    )
    .textContent =
    aktif;


  document
    .getElementById(
      "guruNonaktif"
    )
    .textContent =
    nonaktif;


  if (data.length === 0) {

    container.innerHTML = `
      <div class="loading-admin">
        Belum ada data guru.
      </div>
    `;

    return;

  }


  let html = "";


  data.forEach(
    function(guru) {

      const aktif =
        String(
          guru.aktif
        ).toUpperCase() === "YA";


      const statusText =
        aktif
          ? "🟢 Aktif"
          : "🔴 Nonaktif";


      const statusButton =
        aktif
          ? "NONAKTIFKAN"
          : "AKTIFKAN";


      html += `

        <div class="guru-item">

          <div class="guru-name">
            ${escapeHtml(
              guru.nama
            )}
          </div>

          <div class="guru-info">

            ${escapeHtml(
              guru.jabatan || "Guru"
            )}

            ${
              guru.nip
                ? " • NIP " +
                  escapeHtml(guru.nip)
                : ""
            }

          </div>

          <div class="guru-code">
            ${escapeHtml(
              guru.kodeQR
            )}
          </div>

          <div class="guru-info"
               style="margin-top:6px">

            ${statusText}

          </div>

          <div class="guru-actions">

            <button
              class="qr-button"
              onclick='tampilkanQR(
                ${JSON.stringify(
                  guru.kodeQR
                )},
                ${JSON.stringify(
                  guru.nama
                )}
              )'>

              📷 QR

            </button>


            <button
              class="status-button"
              onclick='ubahStatus(
                ${JSON.stringify(
                  guru.kodeQR
                )},
                ${JSON.stringify(
                  aktif ? "TIDAK" : "YA"
                )}
              )'>

              ${statusButton}

            </button>

          </div>

        </div>

      `;

    }
  );


  container.innerHTML =
    html;

}


// ======================================================
// TAMBAH GURU
// ======================================================

function simpanGuru() {

  const nip =
    document
      .getElementById(
        "guruNip"
      )
      .value
      .trim();


  const nama =
    document
      .getElementById(
        "guruNama"
      )
      .value
      .trim();


  const jabatan =
    document
      .getElementById(
        "guruJabatan"
      )
      .value
      .trim();


  const message =
    document
      .getElementById(
        "tambahGuruMessage"
      );


  if (!nama) {

    message.innerHTML = `
      <div class="admin-message-error">
        Nama guru wajib diisi.
      </div>
    `;

    return;

  }


  message.innerHTML = `
    <div class="loading-admin">
      ⏳ Menyimpan guru...
    </div>
  `;


  panggilAPI(
    {
      action: "tambahGuru",
      nip: nip,
      nama: nama,
      jabatan: jabatan
    },

    function(result) {

      if (
        result &&
        result.sukses
      ) {

        message.innerHTML = `
          <div class="admin-message-success">

            ✓ Guru berhasil ditambahkan.

            <br><br>

            <strong>
              Kode QR:
              ${escapeHtml(
                result.kodeQR
              )}
            </strong>

          </div>
        `;


        document
          .getElementById(
            "guruNip"
          )
          .value = "";


        document
          .getElementById(
            "guruNama"
          )
          .value = "";


        document
          .getElementById(
            "guruJabatan"
          )
          .value = "";


        muatDaftarGuru();


        setTimeout(
          function() {

            tampilkanQR(
              result.kodeQR,
              result.nama
            );

          },
          500
        );

      }

      else {

        message.innerHTML = `
          <div class="admin-message-error">

            ✕ ${
              escapeHtml(
                result &&
                result.pesan
                  ? result.pesan
                  : "Gagal menambahkan guru."
              )
            }

          </div>
        `;

      }

    }

  );

}


// ======================================================
// UBAH STATUS GURU
// ======================================================

function ubahStatus(
  kodeQR,
  status
) {

  const konfirmasi =
    status === "YA"
      ? "Aktifkan guru ini?"
      : "Nonaktifkan guru ini?";


  if (
    !confirm(
      konfirmasi
    )
  ) {

    return;

  }


  panggilAPI(
    {
      action: "ubahStatus",
      kodeQR: kodeQR,
      status: status
    },

    function(result) {

      if (
        result &&
        result.sukses
      ) {

        muatDaftarGuru();

      }

      else {

        alert(
          result &&
          result.pesan
            ? result.pesan
            : "Gagal mengubah status."
        );

      }

    }

  );

}


// ======================================================
// TAMPILKAN QR
// ======================================================

function tampilkanQR(
  kodeQR,
  nama
) {

  tutupQR();


  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "qrModal";


  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.65);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index:99999;
    padding:20px;
  `;


  const box =
    document.createElement(
      "div"
    );


  box.style.cssText = `
    width:100%;
    max-width:360px;
    background:white;
    border-radius:24px;
    padding:25px;
    text-align:center;
    box-shadow:0 10px 40px rgba(0,0,0,.3);
  `;


  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=500x500&margin=15&data=" +
    encodeURIComponent(
      kodeQR
    );


  box.innerHTML = `

    <h2 style="
      color:#075c43;
      margin-top:0;
    ">

      QR GURU

    </h2>


    <div style="
      font-weight:bold;
      font-size:17px;
      margin-bottom:15px;
    ">

      ${escapeHtml(
        nama
      )}

    </div>


    <img
      src="${qrURL}"
      alt="QR ${escapeHtml(
        nama
      )}"
      style="
        width:260px;
        height:260px;
        max-width:100%;
        display:block;
        margin:auto;
      ">


    <div style="
      margin:15px 0;
      padding:10px;
      border-radius:10px;
      background:#eef7f4;
      color:#075c43;
      font-family:monospace;
      font-size:20px;
      font-weight:bold;
      letter-spacing:2px;
    ">

      ${escapeHtml(
        kodeQR
      )}

    </div>


    <button
      onclick="cetakQR()"
      style="
        width:100%;
        padding:13px;
        border:none;
        border-radius:12px;
        background:#087f5b;
        color:white;
        font-weight:bold;
        margin-bottom:8px;
      ">

      🖨️ CETAK QR

    </button>


    <button
      onclick="tutupQR()"
      style="
        width:100%;
        padding:13px;
        border:none;
        border-radius:12px;
        background:#eee;
        color:#444;
        font-weight:bold;
      ">

      TUTUP

    </button>

  `;


  overlay.appendChild(
    box
  );


  document
    .body
    .appendChild(
      overlay
    );


  window.qrCetakData = {
    kodeQR: kodeQR,
    nama: nama,
    qrURL: qrURL
  };

}


// ======================================================
// TUTUP QR
// ======================================================

function tutupQR() {

  const modal =
    document.getElementById(
      "qrModal"
    );


  if (modal) {

    modal.remove();

  }

}


// ======================================================
// CETAK QR
// ======================================================

function cetakQR() {

  if (
    !window.qrCetakData
  ) {

    return;

  }


  const data =
    window.qrCetakData;


  const win =
    window.open(
      "",
      "_blank"
    );


  win.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <title>
        QR Guru - ${escapeHtml(
          data.nama
        )}
      </title>

      <style>

        body {
          font-family:Arial;
          text-align:center;
          padding:30px;
        }

        img {
          width:350px;
          height:350px;
        }

        h1 {
          color:#075c43;
        }

        .kode {
          font-size:24px;
          font-family:monospace;
          font-weight:bold;
          letter-spacing:3px;
          margin:15px;
        }

      </style>

    </head>

    <body>

      <h1>
        ABSENSI GURU
      </h1>

      <h2>
        MTs. BADRIL HUDA
      </h2>

      <h3>
        ${escapeHtml(
          data.nama
        )}
      </h3>

      <img
        src="${data.qrURL}"
        alt="QR Guru">

      <div class="kode">
        ${escapeHtml(
          data.kodeQR
        )}
      </div>

      <script>

        window.onload = function() {
          setTimeout(
            function() {
              window.print();
            },
            500
          );
        };

      <\/script>

    </body>

    </html>

  `);


  win.document.close();

}


// ======================================================
// SCANNER QR GURU
// ======================================================

async function mulaiScan() {

  if (
    sedangScan
  ) {

    return;

  }


  sedangScan = true;


  const hasil =
    document.getElementById(
      "hasilAbsensi"
    );


  hasil.classList.add(
    "hidden"
  );


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


    <div
      id="qr-reader"
      style="
        width:100%;
        margin-top:15px;
        border-radius:16px;
        overflow:hidden;
        background:#000;
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

    if (
      typeof Html5Qrcode ===
      "undefined"
    ) {

      throw new Error(
        "Library QR Scanner belum dimuat."
      );

    }


    qrScanner =
      new Html5Qrcode(
        "qr-reader"
      );


    const cameras =
      await Html5Qrcode
        .getCameras();


    if (
      !cameras ||
      cameras.length === 0
    ) {

      throw new Error(
        "Kamera tidak ditemukan."
      );

    }


    let kamera =
      cameras.find(
        function(camera) {

          return /back|rear|environment/i
            .test(
              camera.label
            );

        }
      );


    if (!kamera) {

      kamera =
        cameras[
          cameras.length - 1
        ];

    }


    await qrScanner.start(

      kamera.id,

      {

        fps: 10,

        qrbox:
          function(
            width,
            height
          ) {

            const size =
              Math.floor(
                Math.min(
                  width,
                  height
                ) * .70
              );


            return {

              width:
                size,

              height:
                size

            };

          },

        aspectRatio: 1.0

      },


      function(decodedText) {

        if (
          !sedangScan
        ) {

          return;

        }


        sedangScan =
          false;


        hentikanScanner();


        prosesKodeQR(
          decodedText
        );

      },


      function(errorMessage) {

        // Kesalahan pembacaan
        // tidak perlu ditampilkan.

      }

    );

  }

  catch(error) {

    console.error(
      error
    );


    sedangScan =
      false;


    tampilErrorScanner(
      error.message
    );

  }

}


// ======================================================
// HENTIKAN SCANNER
// ======================================================

async function hentikanScanner() {

  if (!qrScanner) {

    return;

  }


  try {

    await qrScanner.stop();

  }

  catch(error) {

    console.log(
      error
    );

  }


  try {

    qrScanner.clear();

  }

  catch(error) {

    console.log(
      error
    );

  }


  qrScanner =
    null;

}


// ======================================================
// BATAL SCAN
// ======================================================

function batalScan() {

  hentikanScanner();


  sedangScan =
    false;


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


// ======================================================
// KIRIM KODE QR KE APPS SCRIPT
// ======================================================

function prosesKodeQR(
  kodeQR
) {

  tampilMenunggu();


  panggilAPI(
    {
      action: "absensi",
      kodeQR: kodeQR
    },

    function(result) {

      prosesHasilAbsensi(
        result
      );

    }

  );

}


// ======================================================
// MENUNGGU HASIL
// ======================================================

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

    <div
      class="success-icon"
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


// ======================================================
// HASIL ABSENSI
// ======================================================

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
            result.jabatan || "Guru"
          )}
        </span>


        <span>
          Jam Masuk:
          <b>
            ${escapeHtml(
              result.jam || "-"
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
        style="margin-top:10px;">

        📷 SCAN LAGI

      </button>

    `;


    suaraBerhasil();


    return;

  }


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
              result.jam || "-"
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


  tampilError(
    result &&
    result.pesan
      ? result.pesan
      : "Absensi gagal."
  );

}


// ======================================================
// ERROR ABSENSI
// ======================================================

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

    <div
      class="success-icon"
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
        ${escapeHtml(
          pesan
        )}
      </span>

    </div>


    <button
      onclick="mulaiScan()"
      class="scan-button">

      📷 COBA LAGI

    </button>

  `;

}


// ======================================================
// ERROR KAMERA
// ======================================================

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
      ${escapeHtml(
        pesan
      )}
    </p>


    <button
      class="scan-button"
      onclick="mulaiScan()">

      📷 COBA LAGI

    </button>

  `;

}


// ======================================================
// SUARA ABSENSI
// ======================================================

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

    console.log(
      error
    );

  }

}


// ======================================================
// REKAP SEMENTARA
// ======================================================

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


  const hasil =
    document
      .getElementById(
        "hasilRekap"
      );


  hasil.innerHTML = `

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

      Fitur rekap akan kita
      sambungkan ke Google Sheet
      pada tahap berikutnya.

    </div>

  `;

}


// ======================================================
// ESCAPE HTML
// ======================================================

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


// ======================================================
// DEFAULT BULAN
// ======================================================

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
