// ============================================================
// PIKET.JS
// ABSENSI GURU PIKET
// GPS RADIUS 10 METER
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwQWJ5fS6Yt9P8xQ7vN3mL2kR1sT0uV9wX8yZ7aB6cD5eF4gH3jK2lM1nO0p/exec";


// ============================================================
// KONFIGURASI GPS SEKOLAH
// ============================================================

const LAT_SEKOLAH = -7.7575797;
const LNG_SEKOLAH = 113.7043613;

const RADIUS_METER = 10;

// GPS harus mempunyai akurasi maksimal 15 meter
const AKURASI_MAKSIMAL = 15;


// ============================================================
// KONFIGURASI ABSENSI
// ============================================================

const JAM_BUKA =
  5 * 60;

const JAM_TUTUP =
  8 * 60;


// ============================================================
// DATA GURU
// ============================================================

let daftarGuru = [];


// ============================================================
// CEK HALAMAN
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    const bulan =
      document.getElementById(
        "bulanRekap"
      );

    if (bulan) {

      const sekarang =
        new Date();

      const tahun =
        sekarang.getFullYear();

      const bulanSekarang =
        String(
          sekarang.getMonth() + 1
        ).padStart(2, "0");

      bulan.value =
        `${tahun}-${bulanSekarang}`;
    }

    muatDaftarGuru();

  }
);


// ============================================================
// PANGGIL API GOOGLE APPS SCRIPT
// ============================================================

function panggilAPI(
  params,
  callback
) {

  const callbackName =
    "jsonpCallback_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 100000
    );

  window[callbackName] =
    function (data) {

      try {

        callback(data);

      } finally {

        delete window[
          callbackName
        ];

        if (script) {
          script.remove();
        }

      }

    };


  const query =
    new URLSearchParams();

  Object.keys(params)
    .forEach(function (key) {

      if (
        params[key] !== undefined &&
        params[key] !== null
      ) {

        query.append(
          key,
          params[key]
        );

      }

    });


  query.append(
    "callback",
    callbackName
  );


  const script =
    document.createElement(
      "script"
    );

  script.src =
    API_URL +
    "?" +
    query.toString();

  script.onerror =
    function () {

      delete window[
        callbackName
      ];

      script.remove();

      callback({
        sukses: false,
        pesan:
          "Gagal terhubung ke server."
      });

    };


  document.body.appendChild(
    script
  );

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

  const R = 6371000;

  const dLat =
    (lat2 - lat1) *
    Math.PI /
    180;

  const dLon =
    (lon2 - lon1) *
    Math.PI /
    180;


  const a =
    Math.sin(dLat / 2) *
    Math.sin(dLat / 2) +

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

    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);


  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return R * c;

}


// ============================================================
// MUAT DAFTAR GURU
// ============================================================

function muatDaftarGuru() {

  const container =
    document.getElementById(
      "daftarGuru"
    );

  if (!container) {
    return;
  }


  container.innerHTML =
    '<div class="loading">Memuat daftar guru...</div>';


  panggilAPI(
    {
      action:
        "getDaftarGuru"
    },

    function (result) {

      if (
        !result ||
        result.sukses !== true
      ) {

        container.innerHTML =
          '<div class="error-box">' +
          (
            result?.pesan ||
            "Gagal memuat daftar guru."
          ) +
          "</div>";

        return;
      }


      daftarGuru =
        result.data ||
        result.guru ||
        [];


      if (
        !Array.isArray(
          daftarGuru
        ) ||
        daftarGuru.length === 0
      ) {

        container.innerHTML =
          '<div class="empty-box">' +
          "Data guru belum tersedia." +
          "</div>";

        return;
      }


      tampilkanDaftarGuru();

    }
  );

}


// ============================================================
// TAMPILKAN DAFTAR GURU
// ============================================================

function tampilkanDaftarGuru() {

  const container =
    document.getElementById(
      "daftarGuru"
    );

  if (!container) {
    return;
  }


  container.innerHTML = "";


  daftarGuru.forEach(
    function (guru) {

      const kodeQR =
        guru.kodeQR ||
        guru.kode ||
        guru.id ||
        "";


      const nama =
        guru.nama ||
        guru.name ||
        "Nama Guru";


      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.className =
        "guru-button";


      button.dataset.kode =
        kodeQR;


      button.innerHTML =
        `
        <span class="guru-name">
          ${escapeHTML(nama)}
        </span>

        <small class="guru-status status-normal">
          Tekan untuk absen
        </small>
        `;


      button.addEventListener(
        "click",
        function () {

          absenPiket(
            kodeQR,
            button
          );

        }
      );


      container.appendChild(
        button
      );

    }
  );

}


// ============================================================
// PROSES ABSENSI GURU PIKET + GPS
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
      "📍 Mencari lokasi...";

  }


  // ==========================================================
  // CEK GPS
  // ==========================================================

  if (!navigator.geolocation) {

    button.disabled =
      false;


    if (status) {

      status.className =
        "guru-status status-error";

      status.textContent =
        "✕ GPS tidak tersedia";

    }


    tampilkanPesan(
      "HP/browser ini tidak mendukung GPS.",
      "error"
    );


    return;

  }


  // ==========================================================
  // AMBIL GPS
  // ==========================================================

  navigator.geolocation.getCurrentPosition(

    function (position) {

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


      // ======================================================
      // HITUNG JARAK
      // ======================================================

      const jarak =
        hitungJarak(
          latitude,
          longitude,
          LAT_SEKOLAH,
          LNG_SEKOLAH
        );


      const jarakBulat =
        Math.round(
          jarak * 10
        ) / 10;


      // ======================================================
      // CEK AKURASI
      // ======================================================

      if (
        !Number.isFinite(
          accuracy
        ) ||
        accuracy >
        AKURASI_MAKSIMAL
      ) {

        button.disabled =
          false;


        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "📍 GPS belum akurat";

        }


        tampilkanPesan(
          "GPS belum cukup akurat. " +
          "Akurasi saat ini sekitar " +
          Math.round(
            accuracy || 0
          ) +
          " meter. " +
          "Silakan aktifkan lokasi dengan akurasi tinggi " +
          "dan coba lagi.",
          "error"
        );


        return;

      }


      // ======================================================
      // CEK RADIUS 10 METER
      // ======================================================

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
            "✕ Di luar area absensi";

        }


        tampilkanPesan(
          "Lokasi Anda sekitar " +
          jarakBulat +
          " meter dari sekolah. " +
          "Absensi hanya dapat dilakukan " +
          "dalam radius " +
          RADIUS_METER +
          " meter.",
          "error"
        );


        return;

      }


      // ======================================================
      // LOKASI VALID
      // ======================================================

      if (status) {

        status.className =
          "guru-status status-normal";

        status.textContent =
          "✓ Lokasi valid • " +
          jarakBulat +
          " m";

      }


      // ======================================================
      // KIRIM ABSENSI
      // ======================================================

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


        function (result) {

          // ==================================================
          // BERHASIL
          // ==================================================

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


          // ==================================================
          // DI LUAR RADIUS
          // ==================================================

          if (
            result &&
            result.diLuarRadius
          ) {

            button.disabled =
              false;


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                "✕ Di luar area absensi";

            }


            tampilkanPesan(
              result.pesan ||
              "Anda berada di luar area absensi.",
              "error"
            );


            return;

          }


          // ==================================================
          // GPS TIDAK VALID
          // ==================================================

          if (
            result &&
            result.gpsTidakValid
          ) {

            button.disabled =
              false;


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                "✕ Lokasi tidak valid";

            }


            tampilkanPesan(
              result.pesan ||
              "Lokasi GPS tidak valid.",
              "error"
            );


            return;

          }


          // ==================================================
          // TIDAK PUNYA JADWAL
          // ==================================================

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


          // ==================================================
          // SUDAH ABSEN
          // ==================================================

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


            return;

          }


          // ==================================================
          // ABSENSI DITUTUP
          // ==================================================

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


          // ==================================================
          // BELUM DIBUKA
          // ==================================================

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


          // ==================================================
          // ERROR UMUM
          // ==================================================

          button.disabled =
            false;


          if (status) {

            status.className =
              "guru-status status-error";

            status.textContent =
              (
                result?.pesan ||
                "Absensi gagal."
              );

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

    function (error) {

      button.disabled =
        false;


      if (status) {

        status.className =
          "guru-status status-error";

        status.textContent =
          "✕ GPS gagal";

      }


      let pesan =
        "Tidak dapat mengambil lokasi.";


      if (
        error.code ===
        error.PERMISSION_DENIED
      ) {

        pesan =
          "Izin lokasi ditolak. " +
          "Silakan izinkan lokasi untuk browser ini.";

      }

      else if (
        error.code ===
        error.POSITION_UNAVAILABLE
      ) {

        pesan =
          "Lokasi tidak tersedia. " +
          "Pastikan GPS/lokasi HP aktif.";

      }

      else if (
        error.code ===
        error.TIMEOUT
      ) {

        pesan =
          "GPS terlalu lama mendapatkan lokasi. " +
          "Silakan coba lagi.";

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
  pesan,
  tipe
) {

  const element =
    document.getElementById(
      "pesan"
    ) ||
    document.getElementById(
      "message"
    ) ||
    document.getElementById(
      "rekapMessage"
    );


  if (!element) {

    alert(pesan);

    return;

  }


  element.textContent =
    pesan;


  element.className =
    "message " +
    (
      tipe ||
      ""
    );


  element.style.display =
    "block";

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(
  value
) {

  return String(
    value ?? ""
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
// KEMBALI
// ============================================================

function kembali() {

  if (
    document.referrer &&
    document.referrer
      .includes(
        "badrilhuda.github.io"
      )
  ) {

    history.back();

  } else {

    window.location.href =
      "index.html";

  }

}
