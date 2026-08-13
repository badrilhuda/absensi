// ============================================================
// PIKET.JS
// ABSENSI GURU PIKET
// ============================================================


// ============================================================
// URL GOOGLE APPS SCRIPT
// ============================================================

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


// ============================================================
// API JSONP
// ============================================================

function panggilAPI(
  parameter,
  callback
) {

  const callbackName =
    "piketCallback_" +
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


      tampilkanPesan(
        "Tidak dapat terhubung ke server.",
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


      // ------------------------------------------------------
      // HARI
      // ------------------------------------------------------

      const hari =
        document.getElementById(
          "hari"
        );


      if (hari) {

        hari.textContent =
          result.hari || "";

      }


      // ------------------------------------------------------
      // TANGGAL
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // GURU
      // ------------------------------------------------------

      tampilkanGuru(
        result.data || []
      );

    }

  );

}


// ============================================================
// TAMPILKAN DAFTAR GURU
// ============================================================

function tampilkanGuru(
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


      // ------------------------------------------------------
      // SUDAH ABSEN
      // ------------------------------------------------------

      if (
        guru.sudahAbsen
      ) {

        statusText =
          "✓ Sudah absen hari ini • " +
          (guru.jamAbsen || "");


        statusClass =
          "status-success";


        disabled =
          "disabled";


        extraClass =
          "sudah";

      }


      // ------------------------------------------------------
      // BUKAN GURU PIKET
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // GURU PIKET
      // ------------------------------------------------------

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
  // KUNCI TOMBOL SEMENTARA
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
      "⏳ Memproses absensi...";

  }


  // ----------------------------------------------------------
  // KIRIM KE GOOGLE APPS SCRIPT
  // ----------------------------------------------------------

  panggilAPI(
    {
      action:
        "absensiPiket",

      kodeQR:
        kodeQR
    },

    function(result) {

      // ------------------------------------------------------
      // BERHASIL
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // TIDAK PUNYA JADWAL
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // SUDAH ABSEN
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // ABSENSI DITUTUP
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // BELUM DIBUKA
      // ------------------------------------------------------

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


      // ------------------------------------------------------
      // ERROR UMUM
      // ------------------------------------------------------

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
    type;


  box.textContent =
    text;


  // ----------------------------------------------------------
  // AUTO HILANG UNTUK PESAN BERHASIL
  // ----------------------------------------------------------

  if (
    type === "success"
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

  /*
   * Karena sekarang piket.html berada di GitHub,
   * kembali menggunakan history lebih aman.
   */

  if (
    window.history.length > 1
  ) {

    window.history.back();

    return;

  }


  /*
   * Jika history tidak tersedia,
   * kembali ke halaman utama GitHub.
   *
   * GANTI URL DI BAWAH dengan URL index.html
   * GitHub Pages Anda jika diperlukan.
   */

  window.location.href =
    "index.html";

}


// ============================================================
// CEGAH HALAMAN TERBUKA DENGAN DATA LAMA
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
