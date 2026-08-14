// ============================================================
// PIKET.JS
// ABSENSI GURU PIKET
// GPS RADIUS 10 METER
// VERSI BERSIH
// ============================================================


// ============================================================
// URL GOOGLE APPS SCRIPT
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbwQWJ5fS6Yt9P8xQ7vN3mL2kR1sT0uV9wX8yZ7aB6cD5eF4gH3jK2lM1nO0p/exec";


// ============================================================
// KOORDINAT SEKOLAH
// ============================================================

const LAT_SEKOLAH =
  -7.7575797;

const LNG_SEKOLAH =
  113.7043613;


// Radius maksimal absensi
const RADIUS_METER =
  10;


// Akurasi GPS maksimal yang diterima
const AKURASI_MAKSIMAL =
  15;


// ============================================================
// VARIABEL GLOBAL
// ============================================================

let daftarGuru = [];


// ============================================================
// SAAT HALAMAN SELESAI DIMUAT
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    muatDaftarGuru();

  }
);


// ============================================================
// PANGGIL GOOGLE APPS SCRIPT
// JSONP
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


  let selesai =
    false;


  function selesaiRequest(data) {

    if (selesai) {
      return;
    }

    selesai = true;


    try {

      callback(
        data
      );

    } catch (error) {

      console.error(
        error
      );

    }


    try {

      delete window[
        callbackName
      ];

    } catch (e) {}


    if (script) {

      script.remove();

    }

  }


  window[
    callbackName
  ] =
    selesaiRequest;


  const query =
    new URLSearchParams();


  Object.keys(params)
    .forEach(
      function (key) {

        const value =
          params[key];


        if (
          value !== undefined &&
          value !== null
        ) {

          query.append(
            key,
            String(value)
          );

        }

      }
    );


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

      selesaiRequest({

        sukses:
          false,

        pesan:
          "Gagal terhubung ke server Google Apps Script."

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


  container.innerHTML =
    "";


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
// PROSES ABSENSI GURU PIKET
// DENGAN GPS
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
      "📍 Mengambil lokasi GPS...";

  }


  tampilkanPesan(
    "📍 Mengambil lokasi GPS...",
    "info"
  );


  // ----------------------------------------------------------
  // CEK GPS
  // ----------------------------------------------------------

  if (
    !navigator.geolocation
  ) {

    button.disabled =
      false;


    if (status) {

      status.className =
        "guru-status status-error";

      status.textContent =
        "GPS tidak tersedia";

    }


    tampilkanPesan(
      "GPS tidak didukung oleh browser ini.",
      "error"
    );


    return;

  }


  // ----------------------------------------------------------
  // MINTA LOKASI
  // ----------------------------------------------------------

  navigator.geolocation.getCurrentPosition(

    function (position) {

      // ------------------------------------------------------
      // AMBIL DATA GPS
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


      console.log(
        "GPS Latitude:",
        latitude
      );


      console.log(
        "GPS Longitude:",
        longitude
      );


      console.log(
        "GPS Accuracy:",
        accuracy
      );


      // ------------------------------------------------------
      // VALIDASI GPS
      // ------------------------------------------------------

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

        button.disabled =
          false;


        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "GPS tidak valid";

        }


        tampilkanPesan(
          "Koordinat GPS tidak berhasil diperoleh.",
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

          "Akurasi GPS saat ini sekitar " +
          Math.round(
            accuracy
          ) +
          " meter. " +
          "Silakan tunggu beberapa detik kemudian coba lagi.",

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


      console.log(
        "Jarak:",
        jarak
      );


      // ------------------------------------------------------
      // TAMPILKAN JARAK
      // ------------------------------------------------------

      if (status) {

        status.className =
          "guru-status status-normal";

        status.textContent =
          "📍 Jarak " +
          Math.round(
            jarak
          ) +
          " meter • Memeriksa...";

      }


      tampilkanPesan(

        "📍 Lokasi ditemukan. Jarak dari sekolah: " +
        Math.round(
          jarak
        ) +
        " meter.",

        "info"

      );


      // ------------------------------------------------------
      // CEK RADIUS DI BROWSER
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
            "✕ Di luar radius 10 meter";

        }


        tampilkanPesan(

          "Anda berada sekitar " +
          Math.round(
            jarak
          ) +
          " meter dari lokasi sekolah. " +
          "Absensi hanya dapat dilakukan dalam radius 10 meter.",

          "error"

        );


        return;

      }


      // ------------------------------------------------------
      // LOKASI VALID
      // ------------------------------------------------------

      if (status) {

        status.className =
          "guru-status status-normal";

        status.textContent =
          "✓ Lokasi valid • " +
          Math.round(
            jarak
          ) +
          " m • Menyimpan...";

      }


      tampilkanPesan(

        "✓ Lokasi valid. Menyimpan absensi...",

        "info"

      );


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


        function (result) {

          prosesHasilAbsensi(
            result,
            button,
            status
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


      console.error(
        "GPS Error:",
        error
      );


      let pesan =
        "Tidak dapat mengambil lokasi GPS.";


      // ------------------------------------------------------
      // IZIN DITOLAK
      // ------------------------------------------------------

      if (
        error.code ===
        error.PERMISSION_DENIED
      ) {

        pesan =
          "Izin lokasi ditolak. " +
          "Silakan izinkan akses lokasi untuk situs ini, kemudian coba lagi.";

      }


      // ------------------------------------------------------
      // LOKASI TIDAK TERSEDIA
      // ------------------------------------------------------

      else if (
        error.code ===
        error.POSITION_UNAVAILABLE
      ) {

        pesan =
          "Lokasi tidak tersedia. " +
          "Pastikan GPS/Lokasi HP aktif.";

      }


      // ------------------------------------------------------
      // TIMEOUT
      // ------------------------------------------------------

      else if (
        error.code ===
        error.TIMEOUT
      ) {

        pesan =
          "GPS terlalu lama mendapatkan lokasi. " +
          "Pastikan GPS aktif dan coba lagi.";

      }


      if (status) {

        status.className =
          "guru-status status-error";

        status.textContent =
          "✕ GPS gagal";

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
        30000,

      maximumAge:
        0

    }

  );

}


// ============================================================
// PROSES HASIL ABSENSI
// ============================================================

function prosesHasilAbsensi(
  result,
  button,
  status
) {

  // ----------------------------------------------------------
  // SERVER TIDAK MERESPON
  // ----------------------------------------------------------

  if (!result) {

    button.disabled =
      false;


    if (status) {

      status.className =
        "guru-status status-error";

      status.textContent =
        "Server tidak merespon";

    }


    tampilkanPesan(
      "Tidak ada respon dari server.",
      "error"
    );


    return;

  }


  // ----------------------------------------------------------
  // BERHASIL
  // ----------------------------------------------------------

  if (
    result.sukses ===
    true
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
        "✓ Sudah absen hari ini" +
        (
          result.jam
            ? " • " + result.jam
            : ""
        );

    }


    tampilkanPesan(

      result.pesan ||
      "Absensi berhasil.",

      "success"

    );


    return;

  }


  // ----------------------------------------------------------
  // GPS TIDAK VALID
  // ----------------------------------------------------------

  if (
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


  // ----------------------------------------------------------
  // DI LUAR RADIUS
  // ----------------------------------------------------------

  if (
    result.diluarRadius ||
    result.diLuarRadius ||
    result.jarakTerlaluJauh
  ) {

    button.disabled =
      false;


    if (status) {

      status.className =
        "guru-status status-error";

      status.textContent =
        "✕ Di luar radius 10 meter";

    }


    tampilkanPesan(

      result.pesan ||
      "Anda berada di luar radius absensi 10 meter.",

      "error"

    );


    return;

  }


  // ----------------------------------------------------------
  // TIDAK MEMILIKI JADWAL
  // ----------------------------------------------------------

  if (
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
        "✕ Tidak ada jadwal piket";

    }


    tampilkanPesan(

      result.pesan ||
      "Anda tidak memiliki jadwal piket hari ini.",

      "error"

    );


    return;

  }


  // ----------------------------------------------------------
  // SUDAH ABSEN
  // ----------------------------------------------------------

  if (
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
        "✓ Sudah absen hari ini" +
        (
          result.jam
            ? " • " + result.jam
            : ""
        );

    }


    tampilkanPesan(

      result.pesan ||
      "Anda sudah absen hari ini.",

      "success"

    );


    return;

  }


  // ----------------------------------------------------------
  // ABSENSI DITUTUP
  // ----------------------------------------------------------

  if (
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


  // ----------------------------------------------------------
  // BELUM DIBUKA
  // ----------------------------------------------------------

  if (
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


  // ----------------------------------------------------------
  // ERROR UMUM
  // ----------------------------------------------------------

  button.disabled =
    false;


  if (status) {

    status.className =
      "guru-status status-error";

    status.textContent =
      result.pesan ||
      "Absensi gagal.";

  }


  tampilkanPesan(

    result.pesan ||
    "Absensi gagal.",

    "error"

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

    console.log(
      pesan
    );

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
    document.referrer.includes(
      "badrilhuda.github.io"
    )
  ) {

    history.back();

  } else {

    window.location.href =
      "index.html";

  }

}


// ============================================================
// DEBUG GPS
// ============================================================

// Fungsi ini tidak dipanggil otomatis.
// Bisa digunakan dari Console browser:
// tesGPS();
//
// ============================================================

function tesGPS() {

  if (
    !navigator.geolocation
  ) {

    console.log(
      "GPS tidak didukung."
    );

    return;

  }


  console.log(
    "Memulai tes GPS..."
  );


  navigator.geolocation.getCurrentPosition(

    function (position) {

      const lat =
        position.coords.latitude;

      const lon =
        position.coords.longitude;

      const accuracy =
        position.coords.accuracy;


      const jarak =
        hitungJarak(

          lat,

          lon,

          LAT_SEKOLAH,

          LNG_SEKOLAH

        );


      console.log(
        "================================"
      );

      console.log(
        "LATITUDE:",
        lat
      );

      console.log(
        "LONGITUDE:",
        lon
      );

      console.log(
        "AKURASI:",
        accuracy,
        "meter"
      );

      console.log(
        "JARAK SEKOLAH:",
        jarak,
        "meter"
      );

      console.log(
        "RADIUS:",
        RADIUS_METER,
        "meter"
      );

      console.log(
        "================================"
      );


      alert(

        "GPS berhasil\n\n" +

        "Latitude: " +
        lat +
        "\n" +

        "Longitude: " +
        lon +
        "\n" +

        "Akurasi: " +
        Math.round(
          accuracy
        ) +
        " meter\n" +

        "Jarak sekolah: " +
        Math.round(
          jarak
        ) +
        " meter"

      );

    },


    function (error) {

      console.error(
        "GPS ERROR:",
        error
      );


      alert(

        "GPS gagal.\n\n" +

        "Kode error: " +
        error.code +
        "\n" +

        "Pesan: " +
        error.message

      );

    },


    {

      enableHighAccuracy:
        true,

      timeout:
        30000,

      maximumAge:
        0

    }

  );

}
