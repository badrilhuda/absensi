// ============================================================
// PIKET.JS
// ABSENSI GURU PIKET
// GPS RADIUS 10 METER
// ============================================================


// ============================================================
// URL GOOGLE APPS SCRIPT
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


// ============================================================
// LOKASI MTs. BADRIL HUDA
// ============================================================

const LAT_SEKOLAH = -7.7575797;
const LNG_SEKOLAH = 113.7043613;


// ============================================================
// RADIUS ABSENSI
// ============================================================

const RADIUS_METER = 10;


// ============================================================
// AKURASI GPS MAKSIMAL
// ============================================================

const AKURASI_MAKSIMAL = 30;


// ============================================================
// DATA LOKASI TERAKHIR
// ============================================================

let lokasiSekarang = null;

let watchID = null;

let daftarGuru = [];


// ============================================================
// SAAT HALAMAN SELESAI DIMUAT
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  function () {

    tampilkanTanggal();

    mulaiGPS();

    muatPiket();

  }
);


// ============================================================
// TANGGAL
// ============================================================

function tampilkanTanggal() {

  const sekarang = new Date();

  const namaHari = [
    "MINGGU",
    "SENIN",
    "SELASA",
    "RABU",
    "KAMIS",
    "JUMAT",
    "SABTU"
  ];

  const hari =
    namaHari[
      sekarang.getDay()
    ];

  const tanggal =
    new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(sekarang);


  const elHari =
    document.getElementById(
      "hari"
    );

  const elTanggal =
    document.getElementById(
      "tanggal"
    );


  if (elHari) {

    elHari.textContent =
      hari;

  }


  if (elTanggal) {

    elTanggal.textContent =
      tanggal;

  }

}


// ============================================================
// PANGGIL API GOOGLE APPS SCRIPT
// MENGGUNAKAN JSONP
// ============================================================

function panggilAPI(
  params,
  callback
) {

  const callbackName =
    "piketCallback_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 100000
    );


  let selesai = false;


  let script =
    document.createElement(
      "script"
    );


  function selesaiAPI(
    result
  ) {

    if (selesai) {

      return;

    }


    selesai = true;


    try {

      callback(
        result
      );

    }

    catch (error) {

      console.error(
        error
      );

    }


    try {

      delete window[
        callbackName
      ];

    }

    catch (error) {}


    if (script) {

      script.remove();

    }

  }


  window[
    callbackName
  ] =
    function (result) {

      selesaiAPI(
        result
      );

    };


  const query =
    new URLSearchParams();


  Object.keys(
    params || {}
  ).forEach(
    function (key) {

      const value =
        params[key];


      if (
        value !== undefined &&
        value !== null
      ) {

        query.append(
          key,
          value
        );

      }

    }
  );


  query.append(
    "callback",
    callbackName
  );


  script.src =
    API_URL +
    "?" +
    query.toString();


  script.onerror =
    function () {

      selesaiAPI({

        sukses: false,

        pesan:
          "Tidak dapat terhubung ke server Google Apps Script."

      });

    };


  document.body.appendChild(
    script
  );


  // Timeout 20 detik

  setTimeout(
    function () {

      if (!selesai) {

        selesaiAPI({

          sukses: false,

          pesan:
            "Server terlalu lama memberikan jawaban. Silakan coba lagi."

        });

      }

    },
    20000
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
// MULAI GPS
// ============================================================

function mulaiGPS() {

  const status =
    document.getElementById(
      "locationStatus"
    );


  if (
    !navigator.geolocation
  ) {

    tampilkanStatusLokasi(
      "❌ Browser tidak mendukung GPS.",
      "error"
    );

    return;

  }


  tampilkanStatusLokasi(
    "⏳ Mengambil lokasi GPS...",
    ""
  );


  watchID =
    navigator.geolocation.watchPosition(

      function (position) {

        simpanLokasi(
          position
        );

      },

      function (error) {

        tampilkanErrorGPS(
          error
        );

      },

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
// SIMPAN LOKASI
// ============================================================

function simpanLokasi(
  position
) {

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

    tampilkanStatusLokasi(
      "❌ Data GPS tidak valid.",
      "error"
    );

    return;

  }


  const jarak =
    hitungJarak(
      latitude,
      longitude,
      LAT_SEKOLAH,
      LNG_SEKOLAH
    );


  lokasiSekarang = {

    latitude:
      latitude,

    longitude:
      longitude,

    accuracy:
      accuracy,

    jarak:
      jarak

  };


  // ==========================================================
  // AKURASI BELUM CUKUP
  // ==========================================================

  if (
    accuracy >
    AKURASI_MAKSIMAL
  ) {

    tampilkanStatusLokasi(

      "⚠️ GPS aktif.<br>" +
      "Akurasi: " +
      Math.round(
        accuracy
      ) +
      " meter<br>" +
      "Menunggu GPS lebih akurat...",

      "warning"

    );

    return;

  }


  // ==========================================================
  // DI DALAM RADIUS
  // ==========================================================

  if (
    jarak <=
    RADIUS_METER
  ) {

    tampilkanStatusLokasi(

      "✅ GPS aktif.<br>" +
      "Akurasi: " +
      Math.round(
        accuracy
      ) +
      " meter<br>" +
      "Jarak sekolah: " +
      Math.round(
        jarak
      ) +
      " meter<br>" +
      "📍 Lokasi memenuhi syarat absensi.",

      "ok"

    );

  }

  else {

    tampilkanStatusLokasi(

      "⚠️ GPS aktif.<br>" +
      "Akurasi: " +
      Math.round(
        accuracy
      ) +
      " meter<br>" +
      "Jarak sekolah: " +
      Math.round(
        jarak
      ) +
      " meter<br>" +
      "📍 Anda berada di luar radius 10 meter.",

      "warning"

    );

  }

}


// ============================================================
// PERBARUI LOKASI
// ============================================================

function perbaruiLokasi() {

  if (
    !navigator.geolocation
  ) {

    tampilkanStatusLokasi(
      "❌ GPS tidak didukung browser.",
      "error"
    );

    return;

  }


  tampilkanStatusLokasi(
    "⏳ Memperbarui lokasi GPS...",
    ""
  );


  navigator.geolocation.getCurrentPosition(

    function (position) {

      simpanLokasi(
        position
      );

    },

    function (error) {

      tampilkanErrorGPS(
        error
      );

    },

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
// ERROR GPS
// ============================================================

function tampilkanErrorGPS(
  error
) {

  let pesan =
    "❌ Tidak dapat mengambil lokasi GPS.";


  if (
    error &&
    error.code ===
    1
  ) {

    pesan =
      "❌ Izin lokasi ditolak.<br>" +
      "Izinkan akses lokasi untuk browser ini.";

  }

  else if (
    error &&
    error.code ===
    2
  ) {

    pesan =
      "❌ Lokasi tidak tersedia.<br>" +
      "Pastikan GPS/Lokasi HP aktif.";

  }

  else if (
    error &&
    error.code ===
    3
  ) {

    pesan =
      "⚠️ GPS terlalu lama mendapatkan lokasi.<br>" +
      "Silakan tekan PERBARUI LOKASI.";

  }


  tampilkanStatusLokasi(
    pesan,
    "error"
  );

}


// ============================================================
// TAMPILKAN STATUS LOKASI
// ============================================================

function tampilkanStatusLokasi(
  pesan,
  tipe
) {

  const element =
    document.getElementById(
      "locationStatus"
    );


  if (!element) {

    return;

  }


  element.innerHTML =
    pesan;


  element.className =
    "location-status " +
    (
      tipe || ""
    );

}


// ============================================================
// MUAT DATA PIKET
// ============================================================

function muatPiket() {

  const list =
    document.getElementById(
      "guruList"
    );


  if (!list) {

    return;

  }


  list.innerHTML =
    '<div class="loading">' +
    '⏳ Memuat jadwal guru piket...' +
    '</div>';


  panggilAPI(

    {

      action:
        "getPiketHariIni"

    },

    function (result) {


      // ======================================================
      // JIKA SERVER ERROR
      // ======================================================

      if (
        !result ||
        result.sukses !== true
      ) {

        list.innerHTML =
          '<div class="loading">' +
          '❌ ' +
          escapeHTML(
            result &&
            result.pesan
              ? result.pesan
              : "Gagal memuat jadwal guru piket."
          ) +
          '</div>';

        return;

      }


      // ======================================================
      // TANGGAL DARI SERVER
      // ======================================================

      const hari =
        document.getElementById(
          "hari"
        );


      const tanggal =
        document.getElementById(
          "tanggal"
        );


      if (hari) {

        hari.textContent =
          result.hari ||
          "";

      }


      if (tanggal) {

        tanggal.textContent =
          formatTanggal(
            result.tanggal
          );

      }


      // ======================================================
      // DATA GURU
      // ======================================================

      daftarGuru =
        Array.isArray(
          result.data
        )
          ? result.data
          : [];


      tampilkanDaftarGuru(
        daftarGuru
      );

    }

  );

}


// ============================================================
// TAMPILKAN DAFTAR GURU
// ============================================================

function tampilkanDaftarGuru(
  data
) {

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

    list.innerHTML =
      '<div class="loading">' +
      'Tidak ada data guru.' +
      '</div>';

    return;

  }


  let html = "";


  data.forEach(
    function (guru) {

      const kodeQR =
        String(
          guru.kodeQR ||
          ""
        );


      const nama =
        guru.nama ||
        "Nama Guru";


      const jabatan =
        guru.jabatan ||
        "";


      let statusText =
        "Ketuk untuk absensi";


      let statusClass =
        "status-normal";


      let extraClass =
        "";


      let disabled =
        "";


      // ======================================================
      // SUDAH ABSEN
      // ======================================================

      if (
        guru.sudahAbsen
      ) {

        statusText =
          "✓ Sudah absen hari ini";

        if (
          guru.jamAbsen
        ) {

          statusText +=
            " • " +
            guru.jamAbsen;

        }


        statusClass =
          "status-success";


        extraClass =
          "sudah";


        disabled =
          "disabled";

      }


      // ======================================================
      // BUKAN PIKET
      // ======================================================

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


      // ======================================================
      // GURU PIKET
      // ======================================================

      html +=

        '<button ' +

        'type="button" ' +

        'class="guru-button ' +
        extraClass +
        '" ' +

        disabled +

        ' data-kode="' +
        escapeHTML(
          kodeQR
        ) +
        '">' +

        '<span class="guru-nama">' +
        escapeHTML(
          nama
        ) +
        '</span>' +

        '<span class="guru-jabatan">' +
        escapeHTML(
          jabatan
        ) +
        '</span>' +

        '<span class="guru-status ' +
        statusClass +
        '">' +
        escapeHTML(
          statusText
        ) +
        '</span>' +

        '</button>';

    }
  );


  list.innerHTML =
    html;


  // ==========================================================
  // PASANG EVENT CLICK
  // ==========================================================

  const buttons =
    list.querySelectorAll(
      ".guru-button"
    );


  buttons.forEach(
    function (button) {

      if (
        button.disabled
      ) {

        return;

      }


      button.addEventListener(
        "click",
        function () {

          const kodeQR =
            button.dataset.kode ||
            "";


          absenPiket(
            kodeQR,
            button
          );

        }
      );

    }
  );

}


// ============================================================
// ABSEN GURU PIKET
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


  // ==========================================================
  // CEK GPS
  // ==========================================================

  if (
    !lokasiSekarang
  ) {

    tampilkanPesan(
      "Lokasi GPS belum tersedia. Silakan aktifkan GPS dan tekan PERBARUI LOKASI.",
      "error"
    );

    perbaruiLokasi();

    return;

  }


  const latitude =
    Number(
      lokasiSekarang.latitude
    );


  const longitude =
    Number(
      lokasiSekarang.longitude
    );


  const accuracy =
    Number(
      lokasiSekarang.accuracy
    );


  const jarak =
    Number(
      lokasiSekarang.jarak
    );


  // ==========================================================
  // CEK DATA GPS
  // ==========================================================

  if (
    !Number.isFinite(
      latitude
    ) ||

    !Number.isFinite(
      longitude
    ) ||

    !Number.isFinite(
      accuracy
    ) ||

    !Number.isFinite(
      jarak
    )
  ) {

    tampilkanPesan(
      "Data lokasi GPS tidak valid. Silakan perbarui lokasi.",
      "error"
    );

    return;

  }


  // ==========================================================
  // CEK AKURASI
  // ==========================================================

  if (
    accuracy >
    AKURASI_MAKSIMAL
  ) {

    tampilkanPesan(

      "Akurasi GPS masih " +
      Math.round(
        accuracy
      ) +
      " meter. Tunggu GPS lebih akurat kemudian tekan PERBARUI LOKASI.",

      "warning"

    );

    return;

  }


  // ==========================================================
  // CEK RADIUS
  // ==========================================================

  if (
    jarak >
    RADIUS_METER
  ) {

    tampilkanPesan(

      "Anda berada " +
      Math.round(
        jarak
      ) +
      " meter dari lokasi sekolah. Absensi hanya dapat dilakukan dalam radius 10 meter.",

      "error"

    );

    return;

  }


  // ==========================================================
  // KUNCI TOMBOL
  // ==========================================================

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
      "⏳ Mengirim absensi...";

  }


  // ==========================================================
  // KIRIM KE APPS SCRIPT
  // ==========================================================

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


      // ======================================================
      // BERHASIL
      // ======================================================

      if (
        result &&
        result.sukses === true
      ) {

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
                ? " • " +
                  result.jam
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


      // ======================================================
      // SUDAH ABSEN
      // ======================================================

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
            "✓ Sudah absen hari ini" +
            (
              result.jam
                ? " • " +
                  result.jam
                : ""
            );

        }


        tampilkanPesan(
          result.pesan ||
          "Guru sudah absen hari ini.",
          "success"
        );


        return;

      }


      // ======================================================
      // TIDAK PIKET
      // ======================================================

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
            "guru-status status-disabled";


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


      // ======================================================
      // DILUAR RADIUS DARI SERVER
      // ======================================================

      if (
        result &&
        (
          result.diluarRadius ||
          result.diLuarRadius ||
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
          "Anda berada di luar radius absensi.",
          "error"
        );


        return;

      }


      // ======================================================
      // GPS TIDAK VALID DARI SERVER
      // ======================================================

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
            "📍 GPS tidak valid";

        }


        tampilkanPesan(
          result.pesan ||
          "Lokasi GPS tidak valid.",
          "error"
        );


        return;

      }


      // ======================================================
      // ABSENSI BELUM DIBUKA
      // ======================================================

      if (
        result &&
        result.diluarJam
      ) {

        button.disabled =
          false;


        if (status) {

          status.className =
            "guru-status status-warning";


          status.textContent =
            result.pesan ||
            "Absensi belum dibuka.";

        }


        tampilkanPesan(
          result.pesan ||
          "Absensi belum dibuka.",
          "warning"
        );


        return;

      }


      // ======================================================
      // ABSENSI DITUTUP
      // ======================================================

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
            "Absensi sudah ditutup.";

        }


        tampilkanPesan(
          result.pesan ||
          "Absensi sudah ditutup.",
          "error"
        );


        return;

      }


      // ======================================================
      // ERROR UMUM
      // ======================================================

      button.disabled =
        false;


      if (status) {

        status.className =
          "guru-status status-error";


        status.textContent =
          result &&
          result.pesan
            ? result.pesan
            : "Absensi gagal.";

      }


      tampilkanPesan(

        result &&
        result.pesan
          ? result.pesan
          : "Absensi gagal.",

        "error"

      );

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
      "message"
    );


  if (!element) {

    return;

  }


  element.textContent =
    pesan || "";


  element.className =
    "message " +
    (
      tipe || ""
    );


  element.style.display =
    "block";


  // Scroll ke pesan

  element.scrollIntoView({
    behavior:"smooth",
    block:"nearest"
  });

}


// ============================================================
// FORMAT TANGGAL
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


  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:"numeric",
      month:"long",
      year:"numeric"
    }
  ).format(

    new Date(
      Number(
        bagian[0]
      ),

      Number(
        bagian[1]
      ) - 1,

      Number(
        bagian[2]
      )
    )

  );

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

function kembaliGuru() {

  if (
    document.referrer &&
    document.referrer.includes(
      "badrilhuda.github.io"
    )
  ) {

    history.back();

  }

  else {

    window.location.href =
      "index.html";

  }

}
