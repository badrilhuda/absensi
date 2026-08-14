/* ==========================================================
   REKAP ABSENSI GURU PIKET
   ========================================================== */


/* ==========================================================
   URL GOOGLE APPS SCRIPT
   ========================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


/* ==========================================================
   HELPER
   ========================================================== */

function el(id) {
  return document.getElementById(id);
}


function escapeHtml(value) {

  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* ==========================================================
   PANGGIL GOOGLE APPS SCRIPT
   MENGGUNAKAN JSONP
   ========================================================== */

function panggilAPI(parameter, callback) {

  const callbackName =
    "rekapPiketCallback_" +
    Date.now() +
    "_" +
    Math.floor(Math.random() * 99999);


  window[callbackName] = function(result) {

    try {

      callback(result);

    }

    catch (error) {

      console.error(
        "Kesalahan callback:",
        error
      );

      callback({
        sukses: false,
        pesan: error.message
      });

    }

    finally {

      delete window[callbackName];

    }

  };


  const script =
    document.createElement("script");


  const params =
    new URLSearchParams();


  Object.keys(parameter).forEach(
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

      delete window[callbackName];

      callback({

        sukses: false,

        pesan:
          "Tidak dapat terhubung ke server Apps Script."

      });

    };


  document.body.appendChild(script);


  setTimeout(
    function() {

      if (script.parentNode) {

        script.parentNode.removeChild(
          script
        );

      }

      delete window[callbackName];

    },
    15000
  );

}


/* ==========================================================
   SET BULAN SEKARANG
   ========================================================== */

function setBulanSekarang() {

  const input =
    el("bulanRekap");


  if (!input) {

    return;

  }


  if (!input.value) {

    const sekarang =
      new Date();


    const tahun =
      sekarang.getFullYear();


    const bulan =
      String(
        sekarang.getMonth() + 1
      ).padStart(2, "0");


    input.value =
      tahun +
      "-" +
      bulan;

  }

}


/* ==========================================================
   FORMAT BULAN
   ========================================================== */

function formatBulan(bulan) {

  if (!bulan) {

    return "";

  }


  const parts =
    bulan.split("-");


  if (parts.length !== 2) {

    return bulan;

  }


  const tahun =
    parts[0];


  const nomorBulan =
    Number(parts[1]);


  const namaBulan = [

    "",

    "Januari",

    "Februari",

    "Maret",

    "April",

    "Mei",

    "Juni",

    "Juli",

    "Agustus",

    "September",

    "Oktober",

    "November",

    "Desember"

  ];


  return (

    namaBulan[nomorBulan] +
    " " +
    tahun

  );

}


/* ==========================================================
   MEMUAT REKAP
   ========================================================== */

function muatRekap() {

  const input =
    el("bulanRekap");


  const hasil =
    el("hasilRekap");


  const message =
    el("rekapMessage");


  const summary =
    el("summary");


  if (!input) {

    return;

  }


  const bulan =
    input.value;


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  if (summary) {

    summary.style.display =
      "none";

  }


  if (message) {

    message.innerHTML =
      "";

  }


  if (hasil) {

    hasil.innerHTML = `

      <div class="loading">

        ⏳ Mengambil rekap Guru Piket...

      </div>

    `;

  }


  panggilAPI(

    {

      action:
        "getRekapPiket",

      bulan:
        bulan

    },


    function(result) {


      console.log(
        "HASIL REKAP PIKET:",
        result
      );


      if (
        !result ||
        result.sukses !== true
      ) {

        if (hasil) {

          hasil.innerHTML = `

            <div class="error-box">

              ✕

              ${
                escapeHtml(

                  result &&
                  result.pesan

                    ? result.pesan

                    : "Gagal mengambil data rekap."

                )
              }

            </div>

          `;

        }

        return;

      }


      const data =
        Array.isArray(result.data)

          ? result.data

          : [];


      if (!data.length) {

        if (hasil) {

          hasil.innerHTML = `

            <div class="empty-box">

              Belum ada data Guru Piket

              pada bulan

              <strong>

                ${escapeHtml(

                  formatBulan(bulan)

                )}

              </strong>.

            </div>

          `;

        }

        return;

      }


      tampilkanRingkasan(
        data
      );


      tampilkanTabel(
        data,
        bulan
      );

    }

  );

}


/* ==========================================================
   RINGKASAN
   ========================================================== */

function tampilkanRingkasan(data) {

  let totalJadwal =
    0;


  let totalHadir =
    0;


  let totalTerlambat =
    0;


  let totalTidak =
    0;


  data.forEach(
    function(row) {


      totalJadwal +=
        Number(
          row.jadwal || 0
        );


      totalHadir +=
        Number(
          row.hadir || 0
        );


      totalTerlambat +=
        Number(
          row.terlambat || 0
        );


      totalTidak +=
        Number(
          row.tidakHadir || 0
        );

    }
  );


  if (el("totalJadwal")) {

    el("totalJadwal").textContent =
      totalJadwal;

  }


  if (el("totalHadir")) {

    el("totalHadir").textContent =
      totalHadir;

  }


  if (el("totalTerlambat")) {

    el("totalTerlambat").textContent =
      totalTerlambat;

  }


  if (el("totalTidak")) {

    el("totalTidak").textContent =
      totalTidak;

  }


  if (el("summary")) {

    el("summary").style.display =
      "grid";

  }

}


/* ==========================================================
   TABEL REKAP
   ========================================================== */

function tampilkanTabel(
  data,
  bulan
) {


  let html = `

    <div

      style="
        margin-bottom:14px;
        color:#087f5b;
        font-weight:900;
        font-size:17px;
      "

    >

      📊 Rekap Guru Piket
      ${escapeHtml(
        formatBulan(bulan)
      )}

    </div>


    <div class="table-wrap">

      <table>

        <thead>

          <tr>

            <th>
              Nama Guru
            </th>

            <th>
              Jadwal
            </th>

            <th>
              Hadir
            </th>

            <th>
              Terlambat
            </th>

            <th>
              Tidak Hadir
            </th>

          </tr>

        </thead>


        <tbody>

  `;


  data.forEach(
    function(row) {


      const nama =
        String(
          row.nama || "-"
        ).trim();


      const nip =
        String(
          row.nip || ""
        ).trim();


      const jadwal =
        Number(
          row.jadwal || 0
        );


      const hadir =
        Number(
          row.hadir || 0
        );


      const terlambat =
        Number(
          row.terlambat || 0
        );


      const tidakHadir =
        Number(
          row.tidakHadir || 0
        );


      html += `

        <tr>


          <td>

            <span class="guru-name">

              ${escapeHtml(
                nama
              )}

            </span>


            ${
              nip

                ? `

                  <span class="guru-nip">

                    NIP:
                    ${escapeHtml(
                      nip
                    )}

                  </span>

                `

                : ""

            }

          </td>


          <td>

            <strong>

              ${jadwal}

            </strong>

          </td>


          <td>

            <span class="num-hadir">

              ${hadir}

            </span>

          </td>


          <td>

            <span class="num-terlambat">

              ${terlambat}

            </span>

          </td>


          <td>

            <span class="num-tidak">

              ${tidakHadir}

            </span>

          </td>


        </tr>

      `;

    }
  );


  html += `

        </tbody>

      </table>

    </div>

  `;


  if (el("hasilRekap")) {

    el("hasilRekap").innerHTML =
      html;

  }

}


/* ==========================================================
   KEMBALI
   ========================================================== */

function kembali() {

  if (
    window.history.length > 1
  ) {

    window.history.back();

  }

  else {

    window.location.href =
      "index.html";

  }

}


/* ==========================================================
   SAAT HALAMAN DIBUKA
   ========================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {


    setBulanSekarang();


    /*
     * Otomatis menampilkan
     * rekap bulan berjalan.
     */

    muatRekap();

  }
);
