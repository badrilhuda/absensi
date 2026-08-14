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


  // ----------------------------------------------------------
  // KUNCI TOMBOL SEMENTARA
  // ----------------------------------------------------------

  button.disabled = true;


  const status =
    button.querySelector(
      ".guru-status"
    );


  if (status) {

    status.className =
      "guru-status status-normal";

    status.textContent =
      "📍 Mengambil lokasi GPS...";

  }


  // ----------------------------------------------------------
  // CEK GPS TERSEDIA
  // ----------------------------------------------------------

  if (
    !navigator.geolocation
  ) {

    button.disabled = false;

    tampilkanPesan(
      "GPS tidak didukung oleh browser ini.",
      "error"
    );

    if (status) {

      status.className =
        "guru-status status-error";

      status.textContent =
        "GPS tidak tersedia";

    }

    return;
  }


  // ----------------------------------------------------------
  // AMBIL LOKASI GPS
  // ----------------------------------------------------------

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


      // ------------------------------------------------------
      // VALIDASI KOORDINAT
      // ------------------------------------------------------

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(accuracy)
      ) {

        button.disabled = false;

        tampilkanPesan(
          "Lokasi GPS tidak valid. Silakan aktifkan GPS kemudian coba lagi.",
          "error"
        );

        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "GPS tidak valid";

        }

        return;
      }


      // ------------------------------------------------------
      // KOORDINAT MTs. BADRIL HUDA
      // ------------------------------------------------------

      const LAT_SEKOLAH =
        -7.7575797;

      const LNG_SEKOLAH =
        113.7043613;


      // ------------------------------------------------------
      // HITUNG JARAK
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
          "📍 Jarak " +
          Math.round(jarak) +
          " meter • Memeriksa...";

      }


      // ------------------------------------------------------
      // KIRIM KE GOOGLE APPS SCRIPT
      // ------------------------------------------------------

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
          // GPS DI LUAR RADIUS
          // --------------------------------------------------

          if (
            result &&
            (
              result.diluarRadius ||
              result.jarakTerlaluJauh
            )
          ) {

            button.disabled =
              false;


            if (status) {

              status.className =
                "guru-status status-error";

              status.textContent =
                "📍 Di luar radius 10 meter";

            }


            tampilkanPesan(

              result.pesan ||
              "Anda berada di luar radius absensi 10 meter.",

              "error"

            );

            return;
          }


          // --------------------------------------------------
          // GPS TIDAK VALID
          // --------------------------------------------------

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
                "GPS tidak valid";

            }


            tampilkanPesan(

              result.pesan ||
              "Lokasi GPS tidak valid. Silakan aktifkan GPS kemudian coba lagi.",

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

              "success"

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


    // --------------------------------------------------------
    // ERROR GPS
    // --------------------------------------------------------

    function(error) {

      button.disabled =
        false;


      let pesan =
        "Tidak dapat mengambil lokasi GPS.";


      if (
        error.code ===
        1
      ) {

        pesan =
          "Izin lokasi ditolak. Silakan izinkan akses lokasi untuk situs ini.";

      }

      else if (
        error.code ===
        2
      ) {

        pesan =
          "Lokasi GPS tidak tersedia. Aktifkan GPS kemudian coba lagi.";

      }

      else if (
        error.code ===
        3
      ) {

        pesan =
          "GPS terlalu lama mendapatkan lokasi. Pastikan GPS aktif dan coba lagi.";

      }


      if (status) {

        status.className =
          "guru-status status-error";

        status.textContent =
          "📍 GPS gagal";

      }


      tampilkanPesan(
        pesan,
        "error"
      );

    },


    // --------------------------------------------------------
    // OPSI GPS
    // --------------------------------------------------------

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
