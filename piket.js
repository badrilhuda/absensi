/* ============================================================
   PIKET.JS FINAL - ABSENSI GURU PIKET
   GPS otomatis + tombol refresh manual
   Titik, radius, dan batas tetap dipertahankan.
   ============================================================ */

const API_URL = "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";

// JANGAN DIUBAH
const LAT_SEKOLAH = -7.757670;
const LNG_SEKOLAH = 113.704187;
const RADIUS_GPS = 20;
const BATAS_MAKSIMAL_GPS = 40;
const AKURASI_MAKSIMAL = 30;

let lokasiSekarang = null;
let watchID = null;

/* ============================================================
   INISIALISASI
   ============================================================ */
function mulaiAplikasiPiket() {
  tampilkanTanggal();
  mulaiGPS();
  muatPiket();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mulaiAplikasiPiket, { once: true });
} else {
  mulaiAplikasiPiket();
}

/* ============================================================
   TANGGAL
   ============================================================ */
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

  const hari = namaHari[sekarang.getDay()];

  const tanggal = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(sekarang);

  const elHari = document.getElementById("hari");
  const elTanggal = document.getElementById("tanggal");

  if (elHari) {
    elHari.textContent = hari;
  }

  if (elTanggal) {
    elTanggal.textContent = tanggal;
  }
}

/* ============================================================
   API JSONP
   ============================================================ */
function panggilAPI(parameter, callback) {

  const callbackName =
    "piketCallback_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 99999);

  let selesai = false;

  const script =
    document.createElement("script");


  function bersihkan() {

    try {
      delete window[callbackName];
    } catch (e) {}

    script.remove();
  }


  function selesaiAPI(result) {

    if (selesai) {
      return;
    }

    selesai = true;

    bersihkan();

    try {
      callback(result);
    } catch (error) {
      console.error(error);
    }
  }


  window[callbackName] =
    selesaiAPI;


  const params =
    new URLSearchParams();


  Object.keys(
    parameter || {}
  ).forEach(
    function(key) {

      const value =
        parameter[key];

      params.append(
        key,
        value == null
          ? ""
          : value
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

      selesaiAPI({

        sukses:
          false,

        pesan:
          "Tidak dapat terhubung ke server Google Apps Script."

      });

    };


  document.body.appendChild(
    script
  );


  setTimeout(
    function() {

      if (!selesai) {

        selesaiAPI({

          sukses:
            false,

          pesan:
            "Server terlalu lama memberikan respons."

        });

      }

    },
    15000
  );

}


/* ============================================================
   MUAT GURU PIKET
   ============================================================ */
function muatPiket() {

  const list =
    document.getElementById(
      "guruList"
    );


  if (list) {

    list.innerHTML = `
      <div class="loading">
        ⏳ Memuat jadwal guru piket...
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

        if (list) {

          list.innerHTML = `
            <div class="error-box">
              ${
                escapeHTML(
                  result?.pesan ||
                  "Gagal memuat jadwal guru piket."
                )
              }
            </div>
          `;

        }

        return;

      }


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


      tampilkanGuru(
        result.data ||
        []
      );

    }

  );

}


/* ============================================================
   TAMPILKAN GURU
   ============================================================ */
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
      <div class="empty-box">
        Tidak ada jadwal guru piket hari ini.
      </div>
    `;

    return;
  }


  list.innerHTML =
    data.map(
      function(guru) {

        const kodeQR =
          guru.kodeQR ||
          guru.kode ||
          "";


        const nama =
          guru.nama ||
          "Nama Guru";


        const jabatan =
          guru.jabatan ||
          "";


        let status =
          "Tekan untuk absen";


        let statusClass =
          "status-normal";


        let disabled =
          "";


        let tambahan =
          "";


        if (
          guru.sudahAbsen
        ) {

          status =
            "✓ Sudah absen hari ini" +
            (
              guru.jamAbsen
                ? " • " +
                  guru.jamAbsen
                : ""
            );

          statusClass =
            "status-success";

          disabled =
            "disabled";

          tambahan =
            "sudah";

        }

        else if (
          guru.punyaJadwal === false ||
          guru.tidakPiket === true
        ) {

          status =
            "Tidak ada jadwal piket hari ini";

          statusClass =
            "status-disabled";

          disabled =
            "disabled";

          tambahan =
            "bukan-piket";

        }


        return `

          <button
            type="button"
            class="guru-button ${tambahan}"
            ${disabled}
            data-kode="${escapeHTML(kodeQR)}"
          >

            <span class="guru-nama">
              ${escapeHTML(nama)}
            </span>

            <span class="guru-jabatan">
              ${escapeHTML(jabatan)}
            </span>

            <span
              class="guru-status ${statusClass}"
            >
              ${escapeHTML(status)}
            </span>

          </button>

        `;

      }
    ).join("");


  list
    .querySelectorAll(
      ".guru-button"
    )
    .forEach(
      function(button) {

        button.addEventListener(
          "click",
          function() {

            absenPiket(
              button.dataset.kode ||
              "",
              button
            );

          }
        );

      }
    );

}


/* ============================================================
   HITUNG JARAK
   ============================================================ */
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
    ) ** 2 +

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
    ) ** 2;


  return (
    R *
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(
        1 - a
      )
    )
  );

}


/* ============================================================
   GPS OTOMATIS
   ============================================================ */
function mulaiGPS() {

  if (
    !navigator.geolocation
  ) {

    tampilkanStatusGPS(
      "❌ Browser tidak mendukung GPS.",
      "error"
    );

    return;
  }


  if (
    watchID !== null
  ) {

    return;
  }


  tampilkanStatusGPS(
    "⏳ Mencari lokasi GPS...",
    ""
  );


  watchID =
    navigator.geolocation.watchPosition(

      function(position) {

        prosesLokasi(
          position
        );

      },


      function(error) {

        prosesErrorGPS(
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

/* ============================================================
   REFRESH MANUAL
   ============================================================ */
function perbaruiLokasi() {

  if (
    !navigator.geolocation
  ) {

    tampilkanStatusGPS(
      "❌ Browser tidak mendukung GPS.",
      "error"
    );

    return;
  }


  tampilkanStatusGPS(
    "⏳ Mencari lokasi GPS...",
    ""
  );


  navigator.geolocation.getCurrentPosition(

    function(position) {

      prosesLokasi(
        position
      );

    },


    function(error) {

      prosesErrorGPS(
        error
      );

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


/* ============================================================
   PROSES LOKASI
   ============================================================ */
function prosesLokasi(
  position
) {

  if (
    !position ||
    !position.coords
  ) {

    tampilkanStatusGPS(
      "❌ Data GPS tidak tersedia.",
      "error"
    );

    return;
  }


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
    ![
      latitude,
      longitude,
      accuracy
    ].every(
      Number.isFinite
    )
  ) {

    tampilkanStatusGPS(
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


  /* ----------------------------------------------------------
     AKURASI GPS
     ---------------------------------------------------------- */

  if (
    accuracy >
    AKURASI_MAKSIMAL
  ) {

    tampilkanStatusGPS(

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

      "⚠️ Akurasi GPS belum cukup baik.",

      "warning"

    );

    return;
  }


  /* ----------------------------------------------------------
     RADIUS UTAMA 20 METER
     ---------------------------------------------------------- */

  if (
    jarak <=
    RADIUS_GPS
  ) {

    tampilkanStatusGPS(

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

      "📍 Lokasi memenuhi radius 20 meter.",

      "ok"

    );

    return;
  }


  /* ----------------------------------------------------------
     ZONA TOLERANSI 20–40 METER
     ---------------------------------------------------------- */

  if (
    jarak <=
    BATAS_MAKSIMAL_GPS
  ) {

    tampilkanStatusGPS(

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

      "📍 Zona toleransi 20–40 meter.",

      "warning"

    );

    return;
  }


  /* ----------------------------------------------------------
     DI LUAR 40 METER
     ---------------------------------------------------------- */

  tampilkanStatusGPS(

    "❌ GPS aktif.<br>" +

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

    "❌ Di luar batas maksimal 40 meter.",

    "error"

  );

}


/* ============================================================
   ERROR GPS
   ============================================================ */
function prosesErrorGPS(
  error
) {

  let pesan =
    "Tidak dapat mengambil lokasi GPS.";


  if (
    error?.code ===
    1
  ) {

    pesan =
      "Izin lokasi ditolak. Silakan izinkan lokasi untuk browser ini.";

  }

  else if (
    error?.code ===
    2
  ) {

    pesan =
      "Lokasi GPS tidak tersedia. Pastikan GPS/Lokasi HP aktif.";

  }

  else if (
    error?.code ===
    3
  ) {

    pesan =
      "GPS terlalu lama mendapatkan lokasi. Tekan PERBARUI LOKASI dan coba lagi.";

  }


  tampilkanStatusGPS(
    "❌ " + pesan,
    "error"
  );


  tampilkanPesan(
    pesan,
    "error"
  );

}


/* ============================================================
   TAMPILKAN STATUS GPS
   ============================================================ */
function tampilkanStatusGPS(
  pesan,
  tipe
) {

  const element =

    document.getElementById(
      "locationStatus"
    ) ||

    document.getElementById(
      "statusLokasi"
    ) ||

    document.getElementById(
      "gpsStatus"
    );


  if (!element) {
    return;
  }


  element.innerHTML =
    pesan;


  element.className =
    "location-status " +
    (
      tipe ||
      ""
    );

}


/* ============================================================
   ABSEN GURU
   ============================================================ */
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


  if (
    !kodeQR
  ) {

    tampilkanPesan(
      "Identitas guru tidak ditemukan.",
      "error"
    );

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
      "📍 Mengambil lokasi GPS...";

  }


  /* ----------------------------------------------------------
     Gunakan GPS otomatis yang sudah tersedia
     ---------------------------------------------------------- */

  if (
    lokasiSekarang
  ) {

    prosesAbsensiDenganLokasi(

      kodeQR,

      button,

      lokasiSekarang

    );

    return;
  }


  /* ----------------------------------------------------------
     Fallback jika GPS otomatis belum mendapatkan lokasi
     ---------------------------------------------------------- */

  if (
    !navigator.geolocation
  ) {

    button.disabled =
      false;

    tampilkanPesan(
      "Browser tidak mendukung GPS.",
      "error"
    );

    return;
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
        ![
          latitude,
          longitude,
          accuracy
        ].every(
          Number.isFinite
        )
      ) {

        button.disabled =
          false;

        tampilkanPesan(
          "Data GPS tidak valid.",
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


      prosesAbsensiDenganLokasi(

        kodeQR,

        button,

        lokasiSekarang

      );

    },


    function(error) {

      button.disabled =
        false;

      prosesErrorGPS(
        error
      );

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


/* ============================================================
   PROSES ABSENSI
   ============================================================ */
function prosesAbsensiDenganLokasi(

  kodeQR,

  button,

  lokasi

) {

  const status =
    button.querySelector(
      ".guru-status"
    );


  const latitude =
    Number(
      lokasi?.latitude
    );


  const longitude =
    Number(
      lokasi?.longitude
    );


  const accuracy =
    Number(
      lokasi?.accuracy
    );


  const jarak =
    Number(
      lokasi?.jarak
    );


  if (
    ![
      latitude,
      longitude,
      accuracy,
      jarak
    ].every(
      Number.isFinite
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
      "Lokasi GPS tidak valid.",
      "error"
    );

    return;
  }


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

      "Akurasi GPS " +
      Math.round(
        accuracy
      ) +
      " meter. " +

      "Maksimal yang diterima " +
      AKURASI_MAKSIMAL +
      " meter. " +

      "Silakan tekan PERBARUI LOKASI.",

      "error"

    );

    return;
  }


  if (
    jarak >
    BATAS_MAKSIMAL_GPS
  ) {

    button.disabled =
      false;


    if (status) {

      status.className =
        "guru-status status-error";

      status.textContent =
        "✕ Di luar 40 meter";

    }


    tampilkanPesan(

      "Jarak Anda sekitar " +
      Math.round(
        jarak
      ) +
      " meter dari sekolah. " +

      "Absensi hanya diperbolehkan sampai " +
      BATAS_MAKSIMAL_GPS +
      " meter.",

      "error"

    );

    return;
  }


  if (status) {

    status.className =
      "guru-status status-normal";


    if (
      jarak <=
      RADIUS_GPS
    ) {

      status.textContent =
        "📍 " +
        Math.round(
          jarak
        ) +
        " meter • Dalam radius";

    }

    else {

      status.textContent =
        "⚠️ " +
        Math.round(
          jarak
        ) +
        " meter • Zona toleransi";

    }

  }


  tampilkanPesan(

    "⏳ Lokasi sesuai batas. Menyimpan absensi...",

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

      if (
        result?.sukses ===
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

          if (
        result?.sudahAbsen
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
            "✓ Sudah absen hari ini";

        }


        tampilkanPesan(

          result.pesan ||
          "Anda sudah absen hari ini.",

          "success"

        );

        return;
      }


      if (
        result?.tidakPiket
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


      if (
        result?.diluarRadius ||
        result?.diLuarRadius ||
        result?.jarakTerlaluJauh
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
          "Anda berada di luar batas absensi.",

          "error"

        );

        return;
      }


      if (
        result?.gpsTidakValid ||
        result?.lokasiTidakValid
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


      if (
        result?.diluarJam
      ) {

        button.disabled =
          false;


        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "Absensi belum dibuka";

        }


        tampilkanPesan(

          result.pesan ||
          "Absensi belum dibuka.",

          "error"

        );

        return;
      }


      if (
        result?.ditutup
      ) {

        button.disabled =
          true;


        if (status) {

          status.className =
            "guru-status status-error";

          status.textContent =
            "Absensi sudah ditutup";

        }


        tampilkanPesan(

          result.pesan ||
          "Absensi sudah ditutup.",

          "error"

        );

        return;
      }


      button.disabled =
        false;


      if (status) {

        status.className =
          "guru-status status-error";

        status.textContent =
          "✕ Absensi gagal";

      }


      tampilkanPesan(

        result?.pesan ||
        "Absensi gagal.",

        "error"

      );

    }

  );

}


/* ============================================================
   UTILITAS
   ============================================================ */

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
    pesan ||
    "";


  element.className =
    "message " +
    (
      tipe ||
      ""
    );


  element.style.display =
    pesan
      ? "block"
      : "none";

}


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
    bagian.length !==
    3
  ) {

    return tanggal;
  }


  const date =
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


function kembaliGuru() {

  if (
    document.referrer &&
    document.referrer.includes(
      "badrilhuda.github.io"
    )
  ) {

    history.back();

    return;
  }


  window.location.href =
    "index.html";

}
