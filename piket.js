// ============================================================
// PIKET.JS
// ABSENSI GURU PIKET + GPS RADIUS 10 METER
// ============================================================


// ============================================================
// KONFIGURASI GPS
// ============================================================

const LAT_SEKOLAH = -7.7575797;
const LNG_SEKOLAH = 113.7043613;

const RADIUS_METER = 10;

// Akurasi GPS maksimal yang diterima
const AKURASI_MAKSIMAL = 15;


// ============================================================
// URL GOOGLE APPS SCRIPT
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


// ============================================================
// API JSONP
// ============================================================

function panggilAPI(parameter, callback) {

  const callbackName =
    "piketCallback_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 99999);

  window[callbackName] = function(result) {

    try {
      callback(result);
    }

    catch (error) {

      console.error(
        "Error callback:",
        error
      );

      tampilkanPesan(
        "Terjadi kesalahan saat menerima data server.",
        "error"
      );

    }

    finally {

      try {

        delete window[
          callbackName
        ];

      }

      catch (e) {}

    }

  };


  const script =
    document.createElement("script");


  const params =
    new URLSearchParams();


  Object.keys(parameter).forEach(
    function(key) {

      const value =
        parameter[key];

      params.append(
        key,
        value === undefined ||
        value === null
          ? ""
          : String(value)
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

      try {

        delete window[
          callbackName
        ];

      }

      catch (e) {}


      tampilkanPesan(
        "Tidak dapat terhubung ke server Google Apps Script.",
        "error"
      );

    };


  document.body.appendChild(
    script
  );

}


// ============================================================
// MUAT DATA PIKET HARI INI
// ============================================================

function muatPiket() {

  const guruList =
    document.getElementById(
      "guruList"
    );


  if (guruList) {

    guruList.innerHTML = `
      <div class="loading">
        ⏳ Memuat daftar guru...
      </div>
    `;

  }


  panggilAPI(
    {
      action:
        "getPiketHariIni"
    },

    function(result) {

      if (
        !result ||
        result.sukses !== true
      ) {

        tampilkanPesan(
          result?.pesan ||
          "Gagal mengambil jadwal piket.",
          "error"
        );

        return;

      }


      // --------------------------------------------------------
      // HARI
      // --------------------------------------------------------

      const hari =
        document.getElementById(
          "hari"
        );


      if (hari) {

        hari.textContent =
          result.hari || "";

      }


      // --------------------------------------------------------
      // TANGGAL
      // --------------------------------------------------------

      const tanggal =
        document.getElementById(
          "tanggal"
        );


      if (tanggal) {

        tanggal.textContent =
          formatTanggal(
            result.tanggal
          );

      }


      // --------------------------------------------------------
      // DATA GURU
      // --------------------------------------------------------

      tampilkanGuru(
        result.data || []
      );

    }

  );

}


// ============================================================
// TAMPILKAN DAFTAR GURU
// ============================================================

function tampilkanGuru(data) {

  const list =
    document.getElementById(
      "guruList"
    );


  if (!list) {
    return;
  }


  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {

    list.innerHTML = `
      <div class="loading">
        Tidak ada data guru.
      </div>
    `;

    return;

  }


  let html = "";


  data.forEach(
    function(guru) {

      let statusText =
        "Ketuk untuk absensi";

      let statusClass =
        "status-normal";

      let disabled =
        "";

      let extraClass =
        "";


      // --------------------------------------------------------
      // SUDAH ABSEN
      // --------------------------------------------------------

      if (
        guru.sudahAbsen
      ) {

        statusText =
          "✓ Sudah absen hari ini • " +
          (
            guru.jamAbsen ||
            ""
          );

        statusClass =
          "status-success";

        disabled =
          "disabled";

        extraClass =
          "sudah";

      }


      // --------------------------------------------------------
      // BUKAN GURU PIKET
      // --------------------------------------------------------

      else if (
        !guru.punyaJadwal
      ) {

        statusText =
          "Tidak bisa absen hari ini";

        statusClass =
          "status-disabled";

        extraClass =
          "bukan-piket";

        disabled =
          "disabled";

      }


      // --------------------------------------------------------
      // GURU PIKET
      // --------------------------------------------------------

      else {

        statusText =
          "Ketuk untuk absensi";

        statusClass =
          "status-normal";

      }


      html += `
        <button
          type="button"
          class="guru-button ${extraClass}"
          ${disabled}
          onclick="absenPiket(
            '${escapeJs(guru.kodeQR)}',
            this
          )"
        >

          <span class="guru-nama">
            ${escapeHtml(guru.nama)}
          </span>

          <span class="guru-jabatan">
            ${escapeHtml(guru.jabatan)}
          </span>

          <span
            class="guru-status ${statusClass}"
          >
            ${statusText}
          </span>

        </button>
      `;

    }
  );


  list.innerHTML =
    html;

}


// ============================================================
// HITUNG JARAK GPS
// ============================================================

function hitungJarak(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371000;


  const dLat =
    (
      lat2 -
      lat1
    ) *
    Math.PI /
    180;


  const dLon =
    (
      lon2 -
      lon1
    ) *
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
      Math.sqrt(1 - a)
    );


  return R * c;

}


// ============================================================
// CEK DUKUNGAN GPS
// ============================================================

function cekDukunganGPS() {

  if (
    !navigator.geolocation
  ) {

    tampilkanPesan(
      "HP atau browser ini tidak mendukung GPS.",
      "error"
    );

    return false;

  }


  if (
    window.location.protocol !== "https:" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {

    tampilkanPesan(
      "GPS membutuhkan koneksi HTTPS. Buka halaman melalui GitHub Pages.",
      "error"
    );

    return false;

  }


  return true;

}


// ============================================================
// PROSES ABSENSI GURU PIKET
// ============================================================

function absenPiket(
  kodeQR,
  button
) {

  if (
    !button ||
    button.disabled
  ) {

    return;

  }


  // ----------------------------------------------------------
  // CEK GPS
  // ----------------------------------------------------------

  if (
    !cekDukunganGPS()
  ) {

    return;

  }


  // ----------------------------------------------------------
  // KUNCI TOMBOL
  // ----------------------------------------------------------

  button.disabled =
    true;


  const status =
    button.querySelector(
      ".guru-status"
    );


  if (status) {

    status.className =
      "guru-status status-normal";

    status.textContent =
      "📍 Meminta izin lokasi...";

  }


  tampilkanPesan(
    "📍 Mohon izinkan akses lokasi pada HP Anda.",
    "normal"
  );


  // ----------------------------------------------------------
  // AMBIL GPS DARI HP
  // ----------------------------------------------------------

  navigator.geolocation.getCurrentPosition(

    function(position) {

      // ------------------------------------------------------
      // KOORDINAT
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // VALIDASI KOORDINAT
      // ------------------------------------------------------

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(accuracy)
      ) {

        button.disabled =
          false;

        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "GPS tidak valid";

        }


        tampilkanPesan(
          "Lokasi GPS tidak valid. Silakan aktifkan lokasi kemudian coba lagi.",
          "error"
        );

        return;

      }


      // ------------------------------------------------------
      // CEK AKURASI GPS
      // ------------------------------------------------------

      if (
        accuracy >
        AKURASI_MAKSIMAL
      ) {

        button.disabled =
          false;


        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "GPS kurang akurat";

        }


        tampilkanPesan(
          "GPS belum cukup akurat (" +
          Math.round(accuracy) +
          " meter). Silakan keluar ke tempat terbuka dan coba lagi.",
          "error"
        );

        return;

      }


      // ------------------------------------------------------
      // HITUNG JARAK KE SEKOLAH
      // ------------------------------------------------------

      const jarak =
        hitungJarak(
          latitude,
          longitude,
          LAT_SEKOLAH,
          LNG_SEKOLAH
        );


      // ------------------------------------------------------
      // TAMPILKAN PROSES
      // ------------------------------------------------------

      if (status) {

        status.className =
          "guru-status status-normal";

        status.textContent =
          "📍 Lokasi ditemukan • " +
          Math.round(jarak) +
          " meter";

      }


      tampilkanPesan(
        "📍 Lokasi ditemukan. Jarak Anda sekitar " +
        Math.round(jarak) +
        " meter dari sekolah.",
        "normal"
      );


      // ------------------------------------------------------
      // CEK RADIUS DI SISI CLIENT
      // ------------------------------------------------------

      if (
        jarak >
        RADIUS_METER
      ) {

        button.disabled =
          false;


        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "Di luar radius 10 meter";

        }


        tampilkanPesan(
          "❌ Anda berada sekitar " +
          Math.round(jarak) +
          " meter dari lokasi sekolah. Absensi hanya dapat dilakukan dalam radius 10 meter.",
          "error"
        );

        return;

      }


      // ------------------------------------------------------
      // KIRIM KE GOOGLE APPS SCRIPT
      // ------------------------------------------------------

      if (status) {

        status.textContent =
          "⏳ Menyimpan absensi...";

      }


      tampilkanPesan(
        "⏳ Lokasi sesuai. Menyimpan absensi...",
        "normal"
      );


      panggilAPI(
        {

          action:
            "absensiPiket",

          kodeQR:
            kodeQR,

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

          // --------------------------------------------------
          // BERHASIL
          // --------------------------------------------------

          if (
            result &&
            result.sukses === true
          ) {

            button.disabled =
              true;

            button.classList.add(
              "sudah"
            );


            if (status) {

              status.className =
                "guru-status status-success";

              status.textContent =
                "✓ Sudah absen hari ini • " +
                (
                  result.jam ||
                  ""
                );

            }


            tampilkanPesan(
              result.pesan ||
              "Absensi berhasil.",
              "success"
            );


            return;

          }


          // --------------------------------------------------
          // LOKASI DITOLAK SERVER
          // --------------------------------------------------

          if (
            result &&
            (
              result.lokasiTidakValid ||
              result.diluarRadius
            )
          ) {

            button.disabled =
              false;


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                result.pesan ||
                "Lokasi tidak memenuhi syarat.";

            }


            tampilkanPesan(
              result.pesan ||
              "Lokasi tidak memenuhi syarat.",
              "error"
            );


            return;

          }


          // --------------------------------------------------
          // TIDAK PUNYA JADWAL
          // --------------------------------------------------

          if (
            result &&
            result.tidakPiket
          ) {

            button.disabled =
              true;

            button.classList.add(
              "bukan-piket"
            );


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                "✕ Tidak bisa absen hari ini";

            }


            tampilkanPesan(
              result.pesan ||
              "Anda tidak memiliki jadwal piket hari ini.",
              "error"
            );


            return;

          }


          // --------------------------------------------------
          // SUDAH ABSEN
          // --------------------------------------------------

          if (
            result &&
            result.sudahAbsen
          ) {

            button.disabled =
              true;

            button.classList.add(
              "sudah"
            );


            if (status) {

              status.className =
                "guru-status status-success";

              status.textContent =
                "✓ Sudah absen hari ini • " +
                (
                  result.jam ||
                  ""
                );

            }


            tampilkanPesan(
              result.pesan ||
              "Anda sudah absen hari ini.",
              "error"
            );


            return;

          }


          // --------------------------------------------------
          // ABSENSI DITUTUP
          // --------------------------------------------------

          if (
            result &&
            result.ditutup
          ) {

            button.disabled =
              true;


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                result.pesan ||
                "Absensi Guru Piket sudah ditutup.";

            }


            tampilkanPesan(
              result.pesan ||
              "Absensi Guru Piket sudah ditutup.",
              "error"
            );


            return;

          }


          // --------------------------------------------------
          // BELUM DIBUKA
          // --------------------------------------------------

          if (
            result &&
            result.diluarJam
          ) {

            button.disabled =
              false;


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                result.pesan ||
                "Absensi belum dibuka.";

            }


            tampilkanPesan(
              result.pesan ||
              "Absensi belum dibuka.",
              "error"
            );


            return;

          }


          // --------------------------------------------------
          // ERROR UMUM
          // --------------------------------------------------

          button.disabled =
            false;


          if (status) {

            status.className =
              "guru-status status-error";

            status.textContent =
              result?.pesan ||
              "Absensi gagal.";

          }


          tampilkanPesan(
            result?.pesan ||
            "Absensi gagal.",
            "error"
          );

        }

      );

    },


    // ========================================================
    // ERROR GPS
    // ========================================================

    function(error) {

      button.disabled =
        false;


      let pesan =
        "Tidak dapat mengambil lokasi GPS.";


      if (
        error &&
        error.code ===
        1
      ) {

        pesan =
          "Izin lokasi ditolak. Silakan izinkan akses lokasi untuk situs ini melalui pengaturan browser.";

      }

      else if (
        error &&
        error.code ===
        2
      ) {

        pesan =
          "Lokasi GPS tidak tersedia. Pastikan GPS/Lokasi HP aktif kemudian coba lagi.";

      }

      else if (
        error &&
        error.code ===
        3
      ) {

        pesan =
          "GPS terlalu lama mendapatkan lokasi. Silakan coba lagi di tempat terbuka.";

      }


      if (status) {

        status.className =
          "guru-status status-error";

        status.textContent =
          "❌ " +
          pesan;

      }


      tampilkanPesan(
        pesan,
        "error"
      );

    },


    // ========================================================
    // OPSI GPS
    // ========================================================

    {
      enableHighAccuracy:
        true,

      timeout:
        20000,

      maximumAge:
        0

    }

  );

}


// ============================================================
// TAMPILKAN PESAN
// ============================================================

function tampilkanPesan(
  text,
  type
) {

  const box =
    document.getElementById(
      "message"
    );


  if (!box) {
    return;
  }


  box.className =
    "message " +
    (
      type ||
      ""
    );


  box.textContent =
    text || "";


  // ----------------------------------------------------------
  // AUTO HILANG PESAN BERHASIL
  // ----------------------------------------------------------

  if (
    type ===
    "success"
  ) {

    setTimeout(
      function() {

        box.className =
          "message";

        box.textContent =
          "";

      },
      5000
    );

  }

}


// ============================================================
// FORMAT TANGGAL INDONESIA
// ============================================================

function formatTanggal(
  tanggal
) {

  if (!tanggal) {
    return "";
  }


  const bagian =
    String(
      tanggal
    ).split("-");


  if (
    bagian.length !== 3
  ) {

    return tanggal;

  }


  const tahun =
    Number(
      bagian[0]
    );


  const bulan =
    Number(
      bagian[1]
    );


  const hari =
    Number(
      bagian[2]
    );


  const date =
    new Date(
      tahun,
      bulan - 1,
      hari
    );


  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:
        "numeric",

      month:
        "long",

      year:
        "numeric"
    }
  ).format(
    date
  );

}


// ============================================================
// ESCAPE HTML
// ============================================================

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


// ============================================================
// ESCAPE JAVASCRIPT
// ============================================================

function escapeJs(
  text
) {

  return String(
    text ?? ""
  )

    .replace(
      /\\/g,
      "\\\\"
    )

    .replace(
      /'/g,
      "\\'"
    )

    .replace(
      /\r/g,
      ""
    )

    .replace(
      /\n/g,
      "\\n"
    );

}


// ============================================================
// KEMBALI KE HALAMAN GURU
// ============================================================

function kembaliGuru() {

  if (
    window.history.length > 1
  ) {

    window.history.back();

    return;

  }


  window.location.href =
    "index.html";

}


// ============================================================
// REFRESH SAAT KEMBALI DARI CACHE
// ============================================================

window.addEventListener(
  "pageshow",
  function(event) {

    if (
      event.persisted
    ) {

      muatPiket();

    }

  }
);


// ============================================================
// MULAI APLIKASI
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function() {

    muatPiket();

  }
);
