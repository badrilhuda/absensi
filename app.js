/* ==========================================================
   ABSENSI GURU
   MTs. BADRIL HUDA
   APP.JS
   ========================================================== */


/* ==========================================================
   GOOGLE APPS SCRIPT
   ========================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


/* ==========================================================
   GLOBAL
   ========================================================== */

let qrScanner = null;

let sedangScan = false;

let adminSudahLogin = false;


/* ==========================================================
   UTILITAS
   ========================================================== */

function el(id) {
  return document.getElementById(id);
}


function escapeHtml(text) {

  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


function escapeJs(text) {

  return String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");

}


/* ==========================================================
   HALAMAN
   ========================================================== */

function sembunyikanSemua() {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.add("hidden");

    });

}


/* ==========================================================
   NAVIGASI HALAMAN
   HOME / ADMIN / GURU / REKAP
   ========================================================== */

let sedangNavigasiBack = false;


/* ==========================================================
   SEMBUNYIKAN SEMUA HALAMAN
   ========================================================== */

function sembunyikanSemua() {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.add("hidden");

    });

}


/* ==========================================================
   TAMPILKAN HOME
   ========================================================== */

function tampilkanHome() {

  hentikanScanner();

  sembunyikanSemua();

  const page =
    el("homePage");

  if (page) {

    page.classList.remove("hidden");

  }

}


/* ==========================================================
   TAMPILKAN ADMIN
   ========================================================== */

function tampilkanAdmin() {

  hentikanScanner();

  sembunyikanSemua();

  const page =
    el("adminPage");

  if (page) {

    page.classList.remove("hidden");

  }

  if (adminSudahLogin) {

    tampilkanPanelAdmin();

  } else {

    tampilkanLoginAdmin();

  }

}


/* ==========================================================
   TAMPILKAN GURU
   ========================================================== */

function tampilkanGuru() {

  hentikanScanner();

  sembunyikanSemua();

  const page =
    el("guruPage");

  if (page) {

    page.classList.remove("hidden");

  }

}


/* ==========================================================
   TAMPILKAN REKAP
   ========================================================== */

function tampilkanHalamanRekap() {

  hentikanScanner();

  sembunyikanSemua();

  const page =
    el("rekapPage");

  if (page) {

    page.classList.remove("hidden");

  }

}


/* ==========================================================
   KEMBALI KE HOME
   ========================================================== */

function kembaliHome() {

  hentikanScanner();

  /*
   * Jika sedang berada di:
   * #admin
   * #guru
   * #rekap
   *
   * gunakan history.back()
   * agar tombol Back Android dan tombol
   * Kembali memiliki perilaku yang sama.
   */

  if (
    location.hash === "#admin" ||
    location.hash === "#guru" ||
    location.hash === "#rekap"
  ) {

    history.back();

    return;

  }

  tampilkanHome();

}


/* ==========================================================
   BUKA ADMIN
   ========================================================== */

function bukaAdmin() {

  hentikanScanner();

  /*
   * location.hash membuat entry history baru.
   * Ini yang akan dibaca oleh tombol Back Android.
   */

  if (location.hash !== "#admin") {

    location.hash = "admin";

  } else {

    tampilkanAdmin();

  }

}


/* ==========================================================
   BUKA GURU
   ========================================================== */

function bukaGuru() {

  hentikanScanner();

  if (location.hash !== "#guru") {

    location.hash = "guru";

  } else {

    tampilkanGuru();

  }

}


/* ==========================================================
   BUKA REKAP
   ========================================================== */

function bukaRekap() {

  hentikanScanner();

  if (location.hash !== "#rekap") {

    location.hash = "rekap";

  } else {

    tampilkanHalamanRekap();

  }

}


/* ==========================================================
   ROUTER HALAMAN
   ========================================================== */

function jalankanRouter() {

  const halaman =
    location.hash
      .replace("#", "")
      .toLowerCase()
      .trim();


  /* ------------------------------------------
     HOME
     ------------------------------------------ */

  if (!halaman) {

    tampilkanHome();

    return;

  }


  /* ------------------------------------------
     ADMIN
     ------------------------------------------ */

  if (halaman === "admin") {

    tampilkanAdmin();

    return;

  }


  /* ------------------------------------------
     GURU
     ------------------------------------------ */

  if (halaman === "guru") {

    tampilkanGuru();

    return;

  }


  /* ------------------------------------------
     REKAP
     ------------------------------------------ */

  if (halaman === "rekap") {

    tampilkanHalamanRekap();

    return;

  }


  /* ------------------------------------------
     HASH TIDAK DIKENAL
     ------------------------------------------ */

  /*
   * Jangan menggunakan history.back()
   * di sini karena bisa menyebabkan Web App
   * keluar pada Android.
   */

  history.replaceState(
    {
      halaman: "home"
    },
    "",
    location.pathname +
    location.search
  );

  tampilkanHome();

}


/* ==========================================================
   HASH CHANGE
   ========================================================== */

window.addEventListener(
  "hashchange",
  function() {

    jalankanRouter();

  }
);


/* ==========================================================
   POPSTATE
   ========================================================== */

window.addEventListener(
  "popstate",
  function() {

    /*
     * Saat tombol Back Android ditekan,
     * jalankan router berdasarkan hash terbaru.
     */

    jalankanRouter();

  }
);


/* ==========================================================
   POSISI AWAL APLIKASI
   ========================================================== */

if (
  !location.hash
) {

  history.replaceState(
    {
      halaman: "home"
    },
    "",
    location.pathname +
    location.search
  );

}


/* ==========================================================
   JALANKAN HALAMAN PERTAMA
   ========================================================== */

setTimeout(
  function() {

    jalankanRouter();

  },
  0
);


/* ==========================================================
   LOGIN ADMIN
   ========================================================== */

function tampilkanLoginAdmin() {

  const loginBox =
    el("adminLoginBox");

  const panel =
    el("adminPanel");


  if (loginBox) {

    loginBox.style.display =
      "block";

  }


  if (panel) {

    panel.style.display =
      "none";

  }


  if (el("adminPin")) {

    el("adminPin").value = "";

  }


  if (el("loginMessage")) {

    el("loginMessage").innerHTML =
      "";

  }

}


function loginAdmin() {

  const pinInput =
    el("adminPin");

  const message =
    el("loginMessage");


  if (!pinInput || !message) {

    alert(
      "Form login Admin tidak ditemukan."
    );

    return;

  }


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
    <div class="loading">
      ⏳ Memeriksa PIN...
    </div>
  `;


  panggilAPI(
    {
      action: "loginAdmin",
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

        adminSudahLogin =
          true;


        message.innerHTML = `
          <div class="admin-message-success">
            ✓ Login berhasil.
          </div>
        `;


        tampilkanPanelAdmin();

      }

      else {

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


/* ==========================================================
   PANEL ADMIN
   ========================================================== */

function tampilkanPanelAdmin() {

  const loginBox =
    el("adminLoginBox");

  const panel =
    el("adminPanel");


  if (loginBox) {

    loginBox.style.display =
      "none";

  }


  if (panel) {

    panel.style.display =
      "block";

    panel.classList.remove(
      "hidden"
    );

  }


  muatDaftarGuru();

}


/* ==========================================================
   API JSONP
   ========================================================== */

function panggilAPI(
  parameter,
  callback
) {

  const callbackName =
    "absensiCallback_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 99999
    );


  window[callbackName] =
    function(result) {

      try {

        callback(result);

      }

      catch(error) {

        console.error(
          "Callback error:",
          error
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


  const params =
    new URLSearchParams();


  Object.keys(
    parameter
  ).forEach(
    function(key) {

      params.append(
        key,
        parameter[key]
      );

    }
  );


  params.append(
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
          "Tidak dapat terhubung ke server Apps Script."

      });

    };


  document.body.appendChild(
    script
  );


  setTimeout(
    function() {

      if (
        script.parentNode
      ) {

        script.parentNode
          .removeChild(
            script
          );

      }

    },
    15000
  );

}


/* ==========================================================
   DATA GURU
   ========================================================== */

function muatDaftarGuru() {

  const container =
    el("daftarGuru");


  if (!container) {

    return;

  }


  container.innerHTML = `
    <div class="loading">
      ⏳ Memuat data guru...
    </div>
  `;


  panggilAPI(
    {
      action: "getGuru"
    },
    function(result) {

      console.log(
        "DATA GURU:",
        result
      );


      let data = [];


      if (
        Array.isArray(result)
      ) {

        data = result;

      }

      else if (
        result &&
        Array.isArray(result.data)
      ) {

        data =
          result.data;

      }

      else if (
        result &&
        Array.isArray(result.hasil)
      ) {

        data =
          result.hasil;

      }


      if (
        !Array.isArray(data)
      ) {

        container.innerHTML = `
          <div class="admin-message-error">
            Data guru tidak dapat dibaca.
          </div>
        `;

        return;

      }


      tampilkanDaftarGuru(
        data
      );

    }
  );

}


/* ==========================================================
   TAMPILKAN DAFTAR GURU
   ========================================================== */

function tampilkanDaftarGuru(
  data
) {

  const container =
    el("daftarGuru");


  if (!container) {

    return;

  }


  const total =
    data.length;


  const aktif =
    data.filter(
      function(guru) {

        return String(
          guru.aktif || ""
        ).toUpperCase() === "YA";

      }
    ).length;


  const nonaktif =
    total - aktif;


  if (el("totalGuru")) {

    el("totalGuru")
      .textContent =
      total;

  }


  if (el("guruAktif")) {

    el("guruAktif")
      .textContent =
      aktif;

  }


  if (el("guruNonaktif")) {

    el("guruNonaktif")
      .textContent =
      nonaktif;

  }


  if (!data.length) {

    container.innerHTML = `
      <div class="loading">
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
          guru.aktif || ""
        ).toUpperCase() === "YA";


      const status =
        aktif
          ? "🟢 Aktif"
          : "🔴 Nonaktif";


      const statusBaru =
        aktif
          ? "TIDAK"
          : "YA";


      const jtm =
        guru.jtm !== undefined
          ? guru.jtm
          : guru.jp !== undefined
            ? guru.jp
            : 0;


      html += `
        <div class="guru-item">

          <div class="guru-name">
            ${escapeHtml(
              guru.nama || "-"
            )}
          </div>

          <div class="guru-info">
            ${escapeHtml(
              guru.jabatan || "Guru"
            )}
            ${
              guru.nip
                ? " • NIP " +
                  escapeHtml(
                    guru.nip
                  )
                : ""
            }
          </div>

          <div class="guru-info">
            JTM: ${escapeHtml(jtm)}
          </div>

          <div class="guru-status">
            ${status}
          </div>

          <button
            type="button"
            onclick="ubahStatusGuru(
              '${escapeJs(guru.kodeQR || "")}',
              '${escapeJs(statusBaru)}'
            )"
          >
            ${
              aktif
                ? "Nonaktifkan"
                : "Aktifkan"
            }
          </button>

        </div>
      `;

    }
  );


  container.innerHTML =
    html;

}


/* ==========================================================
   ... BAGIAN ADMIN / REKAP / DATA GURU ASLI
   TETAP DIPERTAHANKAN
   ========================================================== */


/* ==========================================================
   SCANNER QR
   ========================================================== */

async function mulaiScan() {

  if (sedangScan) {

    return;

  }


  sedangScan =
    true;


  const reader =
    el("qr-reader");

  const scannerContent =
    el("scannerContent");

  const batal =
    el("batalScanButton");

  const hasil =
    el("hasilAbsensi");


  if (hasil) {

    hasil.classList.add(
      "hidden"
    );

    hasil.style.background =
      "";

    hasil.style.color =
      "";

  }


  if (scannerContent) {

    scannerContent
      .classList
      .add("hidden");

  }


  if (reader) {

    reader
      .classList
      .remove("hidden");

  }


  if (batal) {

    batal
      .classList
      .remove("hidden");

  }


  try {

    if (
      typeof Html5Qrcode ===
      "undefined"
    ) {

      throw new Error(
        "Scanner QR belum dimuat."
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
                ) * 0.72
              );


            return {

              width:
                size,

              height:
                size

            };

          },

        aspectRatio: 1

      },


      function(decodedText) {

        if (!sedangScan) {

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

        // Error pembacaan QR biasa
        // tidak perlu ditampilkan.

      }

    );

  }


  catch(error) {

    console.error(
      "KAMERA:",
      error
    );


    sedangScan =
      false;


    if (reader) {

      reader
        .classList
        .add("hidden");

    }


    if (batal) {

      batal
        .classList
        .add("hidden");

    }


    if (scannerContent) {

      scannerContent
        .classList
        .remove("hidden");

    }


    tampilErrorScanner(
      error.message
    );

  }

}


/* ==========================================================
   HENTIKAN SCANNER
   ========================================================== */

async function hentikanScanner() {

  if (!qrScanner) {

    sedangScan =
      false;

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


  sedangScan =
    false;

}


/* ==========================================================
   BATAL SCAN
   ========================================================== */

function batalScan() {

  hentikanScanner();


  const reader =
    el("qr-reader");

  const batal =
    el("batalScanButton");

  const scannerContent =
    el("scannerContent");


  if (reader) {

    reader
      .classList
      .add("hidden");

  }


  if (batal) {

    batal
      .classList
      .add("hidden");

  }


  if (scannerContent) {

    scannerContent
      .classList
      .remove("hidden");

  }

}


/* ==========================================================
   GPS ABSENSI GURU
   ========================================================== */

const LOKASI_SEKOLAH_LAT =
  -7.757670;

const LOKASI_SEKOLAH_LNG =
  113.704187;

const RADIUS_GPS =
  20;

const BATAS_MAKSIMAL_GPS =
  40;

const AKURASI_MAKSIMAL_GPS =
  30;


/* ==========================================================
   HITUNG JARAK GPS
   ========================================================== */

function hitungJarakGPS(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371000;


  const dLat =
    (lat2 - lat1) *
    Math.PI /
    180;


  const dLon =
    (lon2 - lon1) *
    Math.PI /
    180;


  const a =
    Math.sin(
      dLat / 2
    ) *
    Math.sin(
      dLat / 2
    ) +

    Math.cos(
      lat1 *
      Math.PI /
      180
    ) *

    Math.cos(
      lat2 *
      Math.PI /
      180
    ) *

    Math.sin(
      dLon / 2
    ) *
    Math.sin(
      dLon / 2
    );


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(
        1 - a
      )
    );


  return R * c;

}


/* ==========================================================
   AMBIL LOKASI GPS UNTUK ABSENSI
   ========================================================== */

function ambilLokasiUntukAbsensi(
  callback
) {

  if (
    !navigator.geolocation
  ) {

    callback({

      sukses:
        false,

      pesan:
        "Browser tidak mendukung GPS."

    });

    return;

  }


  const hasil =
    el("hasilAbsensi");


  if (hasil) {

    hasil.innerHTML = `

      <div class="result-icon">
        📍
      </div>

      <h2>
        MENGAMBIL LOKASI
      </h2>

      <div class="result-info">

        <span>
          Mohon tunggu, sedang memeriksa GPS...
        </span>

      </div>

    `;

  }


  navigator.geolocation.getCurrentPosition(

    function(position) {

      const latitude =
        Number(
          position.coords.latitude
        );


      const longitude =
        Number(
          position.coords.longitude
        );


      const accuracy =
        Number(
          position.coords.accuracy
        );


      if (

        !Number.isFinite(
          latitude
        ) ||

        !Number.isFinite(
          longitude
        ) ||

        !Number.isFinite(
          accuracy
        )

      ) {

        callback({

          sukses:
            false,

          pesan:
            "Data GPS tidak valid."

        });

        return;

      }


      const jarak =
        hitungJarakGPS(

          latitude,

          longitude,

          LOKASI_SEKOLAH_LAT,

          LOKASI_SEKOLAH_LNG

        );


      callback({

        sukses:
          true,

        latitude:
          latitude,

        longitude:
          longitude,

        accuracy:
          accuracy,

        jarak:
          jarak

      });

    },


    function(error) {

      let pesan =
        "Tidak dapat mengambil lokasi GPS.";


      if (
        error &&
        error.code === 1
      ) {

        pesan =
          "Izin lokasi ditolak. Silakan aktifkan izin lokasi untuk browser.";

      }

      else if (
        error &&
        error.code === 2
      ) {

        pesan =
          "Lokasi GPS tidak tersedia. Pastikan GPS/Lokasi HP aktif.";

      }

      else if (
        error &&
        error.code === 3
      ) {

        pesan =
          "GPS terlalu lama mendapatkan lokasi. Silakan aktifkan Lokasi HP lalu coba lagi.";

      }


      callback({

        sukses:
          false,

        pesan:
          pesan

      });

    },


    {

      enableHighAccuracy:
        true,

      timeout:
        15000,

      maximumAge:
        0

    }

  );

}


/* ==========================================================
   PROSES QR + GPS
   ========================================================== */

function prosesKodeQR(
  kodeQR
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


  const kode =
    String(
      kodeQR || ""
    ).trim();


  if (!kode) {

    tampilkanHasilAbsensi({

      sukses:
        false,

      pesan:
        "Kode QR tidak ditemukan."

    });

    return;

  }


  hasil
    .classList
    .remove("hidden");


  hasil.style.background =
    "";

  hasil.style.color =
    "";


  hasil.innerHTML = `

    <div class="result-icon">
      ⏳
    </div>

    <h2>
      MEMERIKSA ABSENSI
    </h2>

    <div class="result-info">

      <span>
        Menyiapkan pemeriksaan lokasi...
      </span>

    </div>

  `;


  ambilLokasiUntukAbsensi(

    function(lokasi) {

      if (
        !lokasi ||
        lokasi.sukses !== true
      ) {

        tampilkanHasilAbsensi({

          sukses:
            false,

          pesan:
            lokasi &&
            lokasi.pesan
              ? lokasi.pesan
              : "Lokasi GPS tidak tersedia."

        });

        return;

      }


      const latitude =
        lokasi.latitude;


      const longitude =
        lokasi.longitude;


      const accuracy =
        lokasi.accuracy;


      const jarak =
        lokasi.jarak;


      /* ------------------------------------------
         CEK AKURASI GPS
         ------------------------------------------ */

      if (
        accuracy >
        AKURASI_MAKSIMAL_GPS
      ) {

        tampilkanHasilAbsensi({

          sukses:
            false,

          gpsTidakValid:
            true,

          pesan:
            "Akurasi GPS saat ini sekitar " +
            Math.round(
              accuracy
            ) +
            " meter. Maksimal yang diterima " +
            AKURASI_MAKSIMAL_GPS +
            " meter. Silakan perbarui lokasi dan coba lagi."

        });

        return;

      }


      /* ------------------------------------------
         CEK BATAS MAKSIMAL 40 METER
         ------------------------------------------ */

      if (
        jarak >
        BATAS_MAKSIMAL_GPS
      ) {

        tampilkanHasilAbsensi({

          sukses:
            false,

          diluarRadius:
            true,

          jarak:
            Math.round(
              jarak
            ),

          pesan:
            "Anda berada sekitar " +
            Math.round(
              jarak
            ) +
            " meter dari sekolah. Absensi hanya diperbolehkan sampai batas maksimal " +
            BATAS_MAKSIMAL_GPS +
            " meter."

        });

        return;

      }


      /* ------------------------------------------
         STATUS LOKASI
         ------------------------------------------ */

      const zona =
        jarak <=
        RADIUS_GPS

          ? "Dalam radius normal"

          : "Zona toleransi 20–40 meter";


      hasil.innerHTML = `

        <div class="result-icon">
          📍
        </div>

        <h2>
          LOKASI SESUAI
        </h2>

        <div class="result-info">

          <span>
            Akurasi GPS:
            ${Math.round(
              accuracy
            )} meter
          </span>

          <span>
            Jarak sekolah:
            ${Math.round(
              jarak
            )} meter
          </span>

          <span>
            ${zona}
          </span>

          <span>
            ⏳ Menyimpan absensi...
          </span>

        </div>

      `;


      /* ------------------------------------------
         KIRIM KE SERVER
         ------------------------------------------ */

      panggilAPI(

        {

          action:
            "absensi",

          kodeQR:
            kode,

          latitude:
            latitude,

          longitude:
            longitude,

          accuracy:
            accuracy,

          jarak:
            jarak

        },


        function(result) {

          console.log(
            "HASIL ABSENSI:",
            result
          );


          tampilkanHasilAbsensi(
            result
          );

        }

      );

    }

  );

}


/* ==========================================================
   HASIL ABSENSI
   ========================================================== */

function tampilkanHasilAbsensi(
  result
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


  hasil
    .classList
    .remove("hidden");


  /*
   * ABSENSI BERHASIL
   */

  if (
    result &&
    result.sukses === true
  ) {

    const status =
      String(
        result.status || "HADIR"
      )
      .toUpperCase();


    const terlambat =
      status === "TERLAMBAT";


    hasil.innerHTML = `

      <div class="result-icon">
        ${terlambat ? "⚠️" : "✅"}
      </div>

      <h2>
        ${terlambat
          ? "ABSENSI TERLAMBAT"
          : "ABSENSI BERHASIL"
        }
      </h2>

      <div class="result-info">

        <span>
          ${escapeHtml(
            result.nama || "-"
          )}
        </span>

        <span>
          ${escapeHtml(
            result.jam || ""
          )}
        </span>

        <span>
          ${escapeHtml(
            result.pesan || ""
          )}
        </span>

      </div>

    `;

    return;

  }


  /*
   * ABSENSI SUDAH ADA
   */

  if (
    result &&
    result.sudahAbsen
  ) {

    hasil.innerHTML = `

      <div class="result-icon">
        ℹ️
      </div>

      <h2>
        SUDAH ABSEN
      </h2>

      <div class="result-info">

        <span>
          ${escapeHtml(
            result.nama || "-"
          )}
        </span>

        <span>
          ${
            result.jam
              ? "Jam: " +
                escapeHtml(
                  result.jam
                )
              : ""
          }
        </span>

        <span>
          ${escapeHtml(
            result.pesan ||
            "Guru sudah melakukan absensi hari ini."
          )}
        </span>

      </div>

    `;

    return;

  }


  /*
   * DILUAR RADIUS
   */

  if (
    result &&
    (
      result.diluarRadius ||
      result.diLuarRadius ||
      result.jarakTerlaluJauh
    )
  ) {

    hasil.innerHTML = `

      <div class="result-icon">
        📍
      </div>

      <h2>
        DI LUAR AREA ABSENSI
      </h2>

      <div class="result-info">

        <span>
          ${
            result.jarak !== undefined
              ? "Jarak: " +
                Math.round(
                  Number(
                    result.jarak
                  )
                ) +
                " meter"
              : ""
          }
        </span>

        <span>
          ${escapeHtml(
            result.pesan ||
            "Anda berada di luar batas absensi."
          )}
        </span>

      </div>

    `;

    return;

  }


  /*
   * GPS TIDAK VALID
   */

  if (
    result &&
    (
      result.gpsTidakValid ||
      result.lokasiTidakValid
    )
  ) {

    hasil.innerHTML = `

      <div class="result-icon">
        📍
      </div>

      <h2>
        GPS TIDAK VALID
      </h2>

      <div class="result-info">

        <span>
          ${escapeHtml(
            result.pesan ||
            "Lokasi GPS tidak valid."
          )}
        </span>

      </div>

    `;

    return;

  }


  /*
   * ERROR UMUM
   */

  hasil.innerHTML = `

    <div class="result-icon">
      ❌
    </div>

    <h2>
      ABSENSI GAGAL
    </h2>

    <div class="result-info">

      <span>
        ${escapeHtml(
          result &&
          result.pesan
            ? result.pesan
            : "Absensi gagal."
        )}
      </span>

    </div>

  `;

}


/* ==========================================================
   FUNGSI LAIN DI APP.JS ANDA
   TETAP SEPERTI VERSI ASLI
   ========================================================== */
