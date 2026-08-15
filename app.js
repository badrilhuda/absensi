/* =====================================================
   ABSENSI GURU
   MTs. BADRIL HUDA
   APP.JS
===================================================== */


/* =====================================================
   GOOGLE APPS SCRIPT
===================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";


/* =====================================================
   GLOBAL
===================================================== */

let qrScanner = null;

let sedangScan = false;

let adminSudahLogin = false;


/* =====================================================
   UTILITAS
===================================================== */

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


/* =====================================================
   HALAMAN
===================================================== */

function sembunyikanSemua() {

  document
    .querySelectorAll(".page")
    .forEach(function(page) {

      page.classList.add("hidden");

    });

}


function kembaliHome() {

  hentikanScanner();

  sembunyikanSemua();

  el("homePage")
    .classList
    .remove("hidden");

}


function bukaAdmin() {

  hentikanScanner();

  sembunyikanSemua();

  el("adminPage")
    .classList
    .remove("hidden");


  if (adminSudahLogin) {

    tampilkanPanelAdmin();

  }

  else {

    tampilkanLoginAdmin();

  }

}


function bukaGuru() {

  hentikanScanner();

  sembunyikanSemua();

  el("guruPage")
    .classList
    .remove("hidden");

}


function bukaRekap() {

  hentikanScanner();

  sembunyikanSemua();

  el("rekapPage")
    .classList
    .remove("hidden");

}


/* =====================================================
   LOGIN ADMIN
===================================================== */

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


/* =====================================================
   PANEL ADMIN
===================================================== */

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


/* =====================================================
   API JSONP
===================================================== */

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


/* =====================================================
   DATA GURU
===================================================== */

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


/* =====================================================
   TAMPILKAN GURU
===================================================== */

function tampilkanDaftarGuru(
  data
) {

  const container =
    el("daftarGuru");


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
          guru.aktif
        ).toUpperCase() === "YA";


      const status =
        aktif
          ? "🟢 Aktif"
          : "🔴 Nonaktif";


      const statusBaru =
        aktif
          ? "TIDAK"
          : "YA";


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
                  escapeHtml(
                    guru.nip
                  )
                : ""
            }

          </div>


          <div class="guru-code">

            ${escapeHtml(
              guru.kodeQR
            )}

          </div>


          <div class="guru-status">

            ${status}

          </div>


          <div class="guru-actions">


            <!-- QR -->

            <button
              class="qr-button"
              onclick="tampilkanQR(
                '${escapeJs(guru.kodeQR)}',
                '${escapeJs(guru.nama)}'
              )"
            >

              📷 QR

            </button>


            <!-- AKTIF / NONAKTIF -->

            <button
              class="status-button"
              onclick="ubahStatus(
                '${escapeJs(guru.kodeQR)}',
                '${statusBaru}'
              )"
            >

              ${
                aktif
                  ? "NONAKTIFKAN"
                  : "AKTIFKAN"
              }

            </button>


            <!-- DELETE -->

            <button
              class="delete-button"
              onclick="hapusGuru(
                '${escapeJs(guru.kodeQR)}',
                '${escapeJs(guru.nama)}'
              )"
            >

              🗑️ DELETE

            </button>


          </div>


        </div>

      `;

    }
  );


  container.innerHTML =
    html;

}


/* =====================================================
   ESCAPE JAVASCRIPT
===================================================== */

function escapeJs(text) {

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


/* =====================================================
   TAMBAH GURU
===================================================== */

function simpanGuru() {

  const nip =
    el("guruNip")
      .value
      .trim();


  const nama =
    el("guruNama")
      .value
      .trim();


  const jabatan =
    el("guruJabatan")
      .value
      .trim();


  const jp =
    el("guruJP")
      .value
      .trim();


  const message =
    el("tambahGuruMessage");


  if (!nama) {

    message.innerHTML = `

      <div class="admin-message-error">

        Nama guru wajib diisi.

      </div>

    `;

    return;

  }


  if (jp === "") {

    message.innerHTML = `

      <div class="admin-message-error">

        JP / Hari wajib diisi.

      </div>

    `;

    return;

  }


  if (
    Number(jp) < 0
  ) {

    message.innerHTML = `

      <div class="admin-message-error">

        JP tidak boleh kurang dari 0.

      </div>

    `;

    return;

  }


  message.innerHTML = `

    <div class="loading">

      ⏳ Menyimpan guru...

    </div>

  `;


  panggilAPI(

    {

      action: "tambahGuru",

      nip: nip,

      nama: nama,

      jabatan: jabatan,

      jp: jp

    },


    function(result) {

      console.log(
        "HASIL TAMBAH GURU:",
        result
      );


      if (
        result &&
        result.sukses === true
      ) {

        message.innerHTML = `

          <div class="admin-message-success">

            ✓ Guru berhasil ditambahkan.

            <br><br>

            <strong>

              ${escapeHtml(
                result.nama
              )}

            </strong>

            <br>

            JP:
            ${escapeHtml(
              result.jp
            )}
            JP

            <br><br>

            Kode QR:

            <strong>

              ${escapeHtml(
                result.kodeQR
              )}

            </strong>

          </div>

        `;


        el("guruNip").value =
          "";

        el("guruNama").value =
          "";

        el("guruJabatan").value =
          "";

        el("guruJP").value =
          "";


        muatDaftarGuru();


        setTimeout(
          function() {

            tampilkanQR(
              result.kodeQR,
              result.nama
            );

          },
          300
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


/* =====================================================
   HAPUS GURU
===================================================== */

function hapusGuru(
  kodeQR,
  nama
) {

  kodeQR =
    String(
      kodeQR || ""
    ).trim();


  nama =
    String(
      nama || ""
    ).trim();


  if (!kodeQR) {

    alert(
      "Kode QR guru tidak ditemukan."
    );

    return;

  }


  const yakin =
    confirm(

      "⚠️ HAPUS DATA GURU?\n\n" +

      "Nama: " +
      nama +

      "\n\n" +

      "Data guru akan dihapus dari daftar guru.\n\n" +

      "Tindakan ini tidak dapat dibatalkan."

    );


  if (!yakin) {

    return;

  }


  const container =
    el("daftarGuru");


  if (container) {

    container.innerHTML = `

      <div class="loading">

        ⏳ Menghapus data

        ${escapeHtml(
          nama
        )}

        ...

      </div>

    `;

  }


  panggilAPI(

    {

      action:
        "deleteGuru",

      kodeQR:
        kodeQR

    },


    function(result) {

      console.log(
        "HASIL DELETE GURU:",
        result
      );


      if (
        result &&
        result.sukses === true
      ) {

        alert(
          "✓ Data guru berhasil dihapus."
        );


        muatDaftarGuru();

      }

      else {

        alert(

          result &&
          result.pesan

            ? result.pesan

            : "Gagal menghapus data guru."

        );


        muatDaftarGuru();

      }

    }

  );

}
/* =====================================================
   UBAH STATUS GURU
===================================================== */

function ubahStatus(
  kodeQR,
  status
) {

  kodeQR =
    String(
      kodeQR || ""
    ).trim();


  status =
    String(
      status || ""
    ).trim();


  if (!kodeQR) {

    alert(
      "Kode QR tidak ditemukan."
    );

    return;

  }


  panggilAPI(

    {

      action:
        "ubahStatusGuru",

      kodeQR:
        kodeQR,

      aktif:
        status

    },


    function(result) {

      console.log(
        "HASIL UBAH STATUS:",
        result
      );


      if (
        result &&
        result.sukses === true
      ) {

        alert(
          "✓ Status guru berhasil diubah."
        );


        muatDaftarGuru();

      }

      else {

        alert(

          result &&
          result.pesan

            ? result.pesan

            : "Gagal mengubah status guru."

        );

      }

    }

  );

}


/* =====================================================
   TAMPILKAN QR CODE
===================================================== */

function tampilkanQR(
  kodeQR,
  nama
) {

  kodeQR =
    String(
      kodeQR || ""
    ).trim();


  nama =
    String(
      nama || ""
    ).trim();


  if (!kodeQR) {

    alert(
      "Kode QR tidak ditemukan."
    );

    return;

  }


  const modal =
    el("qrModal");


  const qrContainer =
    el("qrCodeContainer");


  const qrNama =
    el("qrNama");


  const qrKode =
    el("qrKode");


  if (!modal || !qrContainer) {

    alert(
      "Container QR Code tidak ditemukan di index.html."
    );

    return;

  }


  qrContainer.innerHTML =
    "";


  if (qrNama) {

    qrNama.textContent =
      nama;

  }


  if (qrKode) {

    qrKode.textContent =
      kodeQR;

  }


  try {

    if (
      typeof QRCode ===
      "undefined"
    ) {

      throw new Error(
        "Library QRCode belum tersedia."
      );

    }


    new QRCode(

      qrContainer,

      {

        text:
          kodeQR,

        width:
          250,

        height:
          250,

        colorDark:
          "#000000",

        colorLight:
          "#ffffff",

        correctLevel:
          QRCode.CorrectLevel.H

      }

    );


    modal.classList.remove(
      "hidden"
    );


    modal.style.display =
      "flex";

  }


  catch(error) {

    console.error(
      "QR CODE:",
      error
    );


    qrContainer.innerHTML = `

      <div
        style="
          padding:20px;
          color:#dc3545;
          text-align:center;
        "
      >

        QR Code tidak dapat dibuat.

        <br><br>

        ${escapeHtml(
          error.message
        )}

      </div>

    `;


    modal.classList.remove(
      "hidden"
    );


    modal.style.display =
      "flex";

  }

}


/* =====================================================
   TUTUP MODAL QR
===================================================== */

function tutupQR() {

  const modal =
    el("qrModal");


  if (!modal) {

    return;

  }


  modal.classList.add(
    "hidden"
  );


  modal.style.display =
    "none";


  const container =
    el("qrCodeContainer");


  if (container) {

    container.innerHTML =
      "";

  }

}


/* =====================================================
   CETAK QR
===================================================== */

function cetakQR() {

  const container =
    el("qrCodeContainer");


  const namaEl =
    el("qrNama");


  const kodeEl =
    el("qrKode");


  if (!container) {

    alert(
      "QR Code tidak ditemukan."
    );

    return;

  }


  const gambar =
    container.querySelector(
      "img"
    );


  const canvas =
    container.querySelector(
      "canvas"
    );


  let sumberQR =
    "";


  if (gambar) {

    sumberQR =
      gambar.src;

  }

  else if (canvas) {

    sumberQR =
      canvas.toDataURL(
        "image/png"
      );

  }


  if (!sumberQR) {

    alert(
      "QR Code belum selesai dibuat."
    );

    return;

  }


  const nama =
    namaEl
      ? namaEl.textContent
      : "";


  const kode =
    kodeEl
      ? kodeEl.textContent
      : "";


  const printWindow =
    window.open(
      "",
      "_blank",
      "width=600,height=700"
    );


  if (!printWindow) {

    alert(
      "Popup diblokir browser. Izinkan popup untuk mencetak QR."
    );

    return;

  }


  printWindow.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>
        QR Code ${escapeHtml(nama)}
      </title>


      <style>

        * {
          box-sizing:border-box;
        }


        body {

          margin:0;

          padding:30px;

          font-family:
            Arial,
            sans-serif;

          text-align:center;

          background:#ffffff;

          color:#000000;

        }


        .card {

          width:100%;

          max-width:500px;

          margin:auto;

          padding:30px;

          border:2px solid #222;

          border-radius:15px;

        }


        h1 {

          margin:0 0 10px;

          font-size:25px;

        }


        h2 {

          margin:5px 0 20px;

          font-size:20px;

        }


        img {

          width:300px;

          height:300px;

          max-width:100%;

        }


        .kode {

          margin-top:20px;

          font-size:18px;

          font-weight:bold;

          letter-spacing:2px;

        }


        .petunjuk {

          margin-top:20px;

          font-size:13px;

          color:#555;

        }


        @media print {

          body {

            padding:0;

          }


          .card {

            border:none;

          }

        }

      </style>

    </head>


    <body>

      <div class="card">

        <h1>
          ABSENSI GURU
        </h1>


        <h2>
          ${escapeHtml(nama)}
        </h2>


        <img
          src="${sumberQR}"
        >


        <div class="kode">

          ${escapeHtml(kode)}

        </div>


        <div class="petunjuk">

          Gunakan QR Code ini
          untuk melakukan absensi guru.

        </div>

      </div>


      <script>

        window.onload =
          function() {

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


  printWindow.document.close();

}


/* =====================================================
   TUTUP QR JIKA KLIK AREA LUAR
===================================================== */

document.addEventListener(
  "click",
  function(event) {

    const modal =
      el("qrModal");


    if (!modal) {

      return;

    }


    if (
      event.target ===
      modal
    ) {

      tutupQR();

    }

  }
);


/* =====================================================
   SCANNER QR
===================================================== */

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
        "Library scanner QR belum dimuat."
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

        fps:10,

        qrbox:
          function(
            width,
            height
          ) {

            const ukuran =
              Math.floor(

                Math.min(
                  width,
                  height
                ) * 0.72

              );


            return {

              width:
                ukuran,

              height:
                ukuran

            };

          },

        aspectRatio:
          1

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

        // Error pembacaan QR
        // tidak perlu ditampilkan.

      }

    );

  }


  catch(error) {

    console.error(
      "SCANNER ERROR:",
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


/* =====================================================
   HENTIKAN SCANNER
===================================================== */

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


/* =====================================================
   BATAL SCAN
===================================================== */

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


/* =====================================================
   GPS ABSENSI GURU
===================================================== */

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


/* =====================================================
   HITUNG JARAK GPS
===================================================== */

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
    )

    +

    Math.cos(
      lat1 *
      Math.PI /
      180
    )

    *

    Math.cos(
      lat2 *
      Math.PI /
      180
    )

    *

    Math.sin(
      dLon / 2
    )
    *
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


/* =====================================================
   AMBIL LOKASI GPS
===================================================== */

function ambilLokasiUntukAbsensi(
  callback
) {

  if (
    !navigator.geolocation
  ) {

    callback({

      sukses:false,

      pesan:
        "Browser tidak mendukung GPS."

    });

    return;

  }


  const hasil =
    el("hasilAbsensi");


  if (hasil) {

    hasil.classList
      .remove("hidden");


    hasil.innerHTML = `

      <div class="result-icon">

        📍

      </div>


      <h2>

        MENGAMBIL LOKASI GPS

      </h2>


      <div class="result-info">

        <span>

          Mohon tunggu,
          sedang memeriksa lokasi...

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
        )

        ||

        !Number.isFinite(
          longitude
        )

        ||

        !Number.isFinite(
          accuracy
        )
      ) {

        callback({

          sukses:false,

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

        sukses:true,

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
          "Izin lokasi ditolak. Silakan aktifkan izin lokasi pada browser.";

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

        sukses:false,

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


/* =====================================================
   PROSES KODE QR + GPS
===================================================== */

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

      sukses:false,

      pesan:
        "Kode QR tidak ditemukan."

    });

    return;

  }


  hasil
    .classList
    .remove("hidden");


  hasil.innerHTML = `

    <div class="result-icon">

      📍

    </div>


    <h2>

      MEMERIKSA LOKASI

    </h2>


    <div class="result-info">

      <span>

        Menyiapkan pemeriksaan GPS...

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

          sukses:false,

          gpsTidakValid:true,

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


      /* =========================================
         CEK AKURASI
      ========================================= */

      if (
        accuracy >
        AKURASI_MAKSIMAL_GPS
      ) {

        tampilkanHasilAbsensi({

          sukses:false,

          gpsTidakValid:true,

          pesan:

            "Akurasi GPS sekitar " +

            Math.round(
              accuracy
            ) +

            " meter. Maksimal " +

            AKURASI_MAKSIMAL_GPS +

            " meter."

        });

        return;

      }


      /* =========================================
         CEK BATAS 40 METER
      ========================================= */

      if (
        jarak >
        BATAS_MAKSIMAL_GPS
      ) {

        tampilkanHasilAbsensi({

          sukses:false,

          diluarRadius:true,

          jarak:
            jarak,

          pesan:

            "Anda berada sekitar " +

            Math.round(
              jarak
            ) +

            " meter dari sekolah. " +

            "Batas maksimal absensi adalah " +

            BATAS_MAKSIMAL_GPS +

            " meter."

        });

        return;

      }


      const zona =
        jarak <=
        RADIUS_GPS

          ? "Dalam radius normal 20 meter"

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

            Jarak:
            ${Math.round(
              jarak
            )} meter

          </span>


          <span>

            ${escapeHtml(
              zona
            )}

          </span>


          <span>

            ⏳ Menyimpan absensi...

          </span>

        </div>

      `;


      /* =========================================
         KIRIM KE APPS SCRIPT
      ========================================= */

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
/* =====================================================
   TAMPILKAN HASIL ABSENSI
===================================================== */

function tampilkanHasilAbsensi(
  result
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


  if (
    !result
  ) {

    hasil.innerHTML = `

      <div class="result-icon">

        ❌

      </div>


      <h2>

        GAGAL

      </h2>


      <div class="result-info">

        <span>

          Tidak ada respons dari server.

        </span>

      </div>

    `;

    return;

  }


  if (
    result.sukses === true
  ) {

    hasil.innerHTML = `

      <div class="result-success">

        <div class="result-icon">

          ✓

        </div>


        <h2>

          ABSENSI BERHASIL

        </h2>


        <div class="result-info">

          ${
            result.nama
              ? `
                <span>
                  <strong>
                    ${escapeHtml(
                      result.nama
                    )}
                  </strong>
                </span>
              `
              : ""
          }


          ${
            result.jabatan
              ? `
                <span>
                  ${escapeHtml(
                    result.jabatan
                  )}
                </span>
              `
              : ""
          }


          ${
            result.jam
              ? `
                <span>
                  Jam:
                  ${escapeHtml(
                    result.jam
                  )}
                </span>
              `
              : ""
          }


          ${
            result.tanggal
              ? `
                <span>
                  Tanggal:
                  ${escapeHtml(
                    result.tanggal
                  )}
                </span>
              `
              : ""
          }


          ${
            Number.isFinite(
              Number(
                result.jarak
              )
            )
              ? `
                <span>
                  Jarak:
                  ${Math.round(
                    Number(
                      result.jarak
                    )
                  )} meter
                </span>
              `
              : ""
          }

        </div>

      </div>

    `;

    return;

  }


  let icon =
    "❌";


  let judul =
    "ABSENSI GAGAL";


  if (
    result.diluarRadius ===
    true
  ) {

    icon =
      "📍";

    judul =
      "DI LUAR RADIUS";

  }


  if (
    result.gpsTidakValid ===
    true
  ) {

    icon =
      "⚠️";

    judul =
      "GPS TIDAK VALID";

  }


  hasil.innerHTML = `

    <div class="result-error">

      <div class="result-icon">

        ${icon}

      </div>


      <h2>

        ${judul}

      </h2>


      <div class="result-info">

        <span>

          ${
            result.pesan
              ? escapeHtml(
                  result.pesan
                )
              : "Absensi tidak dapat diproses."
          }

        </span>


        ${
          Number.isFinite(
            Number(
              result.jarak
            )
          )
            ? `

              <span>

                Jarak dari sekolah:

                ${Math.round(
                  Number(
                    result.jarak
                  )
                )}

                meter

              </span>

            `
            : ""
        }


        ${
          Number.isFinite(
            Number(
              result.accuracy
            )
          )
            ? `

              <span>

                Akurasi GPS:

                ${Math.round(
                  Number(
                    result.accuracy
                  )
                )}

                meter

              </span>

            `
            : ""
        }

      </div>


      <button
        type="button"
        onclick="kembaliScan()"
        class="btn-primary"
      >

        🔄 Coba Lagi

      </button>

    </div>

  `;

}


/* =====================================================
   ERROR SCANNER
===================================================== */

function tampilErrorScanner(
  pesan
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    alert(
      pesan
    );

    return;

  }


  hasil.classList
    .remove("hidden");


  hasil.innerHTML = `

    <div class="result-error">

      <div class="result-icon">

        ❌

      </div>


      <h2>

        SCANNER TIDAK DAPAT DIGUNAKAN

      </h2>


      <div class="result-info">

        <span>

          ${escapeHtml(
            pesan ||
            "Terjadi kesalahan pada kamera."
          )}

        </span>

      </div>


      <button
        type="button"
        onclick="mulaiScan()"
        class="btn-primary"
      >

        🔄 Coba Lagi

      </button>

    </div>

  `;

}


/* =====================================================
   KEMBALI SCAN
===================================================== */

function kembaliScan() {

  const hasil =
    el("hasilAbsensi");


  if (hasil) {

    hasil.classList.add(
      "hidden"
    );

    hasil.innerHTML =
      "";

  }


  const reader =
    el("qr-reader");


  const scannerContent =
    el("scannerContent");


  const batal =
    el("batalScanButton");


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


  mulaiScan();

}


/* =====================================================
   REKAP ABSENSI
===================================================== */

function muatRekap() {

  const container =
    el("rekapContainer");


  if (!container) {

    return;

  }


  container.innerHTML = `

    <div class="loading">

      ⏳ Memuat rekap absensi...

    </div>

  `;


  panggilAPI(

    {

      action:
        "getRekap"

    },


    function(result) {

      console.log(
        "DATA REKAP:",
        result
      );


      if (
        !Array.isArray(result)
      ) {

        container.innerHTML = `

          <div class="admin-message-error">

            Data rekap tidak tersedia.

          </div>

        `;

        return;

      }


      tampilkanRekap(
        result
      );

    }

  );

}


/* =====================================================
   TAMPILKAN REKAP
===================================================== */

function tampilkanRekap(
  data
) {

  const container =
    el("rekapContainer");


  if (!data.length) {

    container.innerHTML = `

      <div class="loading">

        Belum ada data absensi.

      </div>

    `;

    return;

  }


  let html = `

    <div
      class="table-wrapper"
      style="overflow-x:auto;"
    >

      <table
        class="rekap-table"
      >

        <thead>

          <tr>

            <th>
              No
            </th>

            <th>
              Tanggal
            </th>

            <th>
              Jam
            </th>

            <th>
              NIP
            </th>

            <th>
              Nama
            </th>

            <th>
              Jabatan
            </th>

            <th>
              Status
            </th>

          </tr>

        </thead>


        <tbody>

  `;


  data.forEach(
    function(row, index) {

      html += `

        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            ${escapeHtml(
              row.tanggal ||
              ""
            )}
          </td>

          <td>
            ${escapeHtml(
              row.jam ||
              ""
            )}
          </td>

          <td>
            ${escapeHtml(
              row.nip ||
              ""
            )}
          </td>

          <td>
            ${escapeHtml(
              row.nama ||
              ""
            )}
          </td>

          <td>
            ${escapeHtml(
              row.jabatan ||
              ""
            )}
          </td>

          <td>
            ${escapeHtml(
              row.status ||
              ""
            )}
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


  container.innerHTML =
    html;

}


/* =====================================================
   EXPORT EXCEL
===================================================== */

function exportExcel() {

  panggilAPI(

    {

      action:
        "getRekap"

    },


    function(result) {

      if (
        !Array.isArray(result) ||
        result.length === 0
      ) {

        alert(
          "Tidak ada data untuk diekspor."
        );

        return;

      }


      let csv =
        "";


      csv +=
        "No,Tanggal,Jam,NIP,Nama,Jabatan,Status\n";


      result.forEach(
        function(row, index) {

          csv += [

            index + 1,

            row.tanggal ||
              "",

            row.jam ||
              "",

            row.nip ||
              "",

            row.nama ||
              "",

            row.jabatan ||
              "",

            row.status ||
              ""

          ]
            .map(
              function(value) {

                return '"' +
                  String(
                    value
                  )
                  .replace(
                    /"/g,
                    '""'
                  ) +
                  '"';

              }
            )
            .join(",") +

            "\n";

        }
      );


      const blob =
        new Blob(
          [csv],
          {
            type:
              "text/csv;charset=utf-8;"
          }
        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          "a"
        );


      link.href =
        url;


      link.download =
        "rekap-absensi-guru.csv";


      document.body
        .appendChild(
          link
        );


      link.click();


      link.remove();


      URL.revokeObjectURL(
        url
      );

    }

  );

}


/* =====================================================
   CETAK REKAP
===================================================== */

function cetakRekap() {

  const table =
    document.querySelector(
      ".rekap-table"
    );


  if (!table) {

    alert(
      "Data rekap belum tersedia."
    );

    return;

  }


  const printWindow =
    window.open(
      "",
      "_blank",
      "width=1000,height=700"
    );


  if (!printWindow) {

    alert(
      "Popup diblokir browser."
    );

    return;

  }


  printWindow.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>
        Rekap Absensi Guru
      </title>


      <style>

        body {

          font-family:
            Arial,
            sans-serif;

          padding:20px;

        }


        h1 {

          text-align:center;

          margin-bottom:5px;

        }


        p {

          text-align:center;

          margin-top:0;

        }


        table {

          width:100%;

          border-collapse:
            collapse;

          margin-top:20px;

        }


        th,
        td {

          border:
            1px solid #000;

          padding:8px;

          font-size:12px;

        }


        th {

          font-weight:bold;

          text-align:center;

        }


        @media print {

          @page {

            size:
              landscape;

            margin:
              10mm;

          }

        }

      </style>

    </head>


    <body>

      <h1>

        REKAP ABSENSI GURU

      </h1>


      <p>

        MTs. BADRIL HUDA

      </p>


      ${table.outerHTML}


      <script>

        window.onload =
          function() {

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


  printWindow.document.close();

}


/* =====================================================
   LOGOUT ADMIN
===================================================== */

function logoutAdmin() {

  hentikanScanner();


  adminSudahLogin =
    false;


  const loginBox =
    el("adminLoginBox");


  const panel =
    el("adminPanel");


  if (panel) {

    panel.style.display =
      "none";

  }


  if (loginBox) {

    loginBox.style.display =
      "block";

  }


  if (el("adminPin")) {

    el("adminPin").value =
      "";

  }


  kembaliHome();

}


/* =====================================================
   EVENT DOM READY
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "APP.JS aktif."
    );


    /* -----------------------------------------------
       TOMBOL HOME
    ----------------------------------------------- */

    const homeButtons =
      document.querySelectorAll(
        "[data-page='home']"
      );


    homeButtons.forEach(
      function(button) {

        button.addEventListener(
          "click",
          kembaliHome
        );

      }
    );


    /* -----------------------------------------------
       ENTER PADA PIN ADMIN
    ----------------------------------------------- */

    const pin =
      el("adminPin");


    if (pin) {

      pin.addEventListener(
        "keydown",
        function(event) {

          if (
            event.key ===
            "Enter"
          ) {

            loginAdmin();

          }

        }
      );

    }


    /* -----------------------------------------------
       TUTUP QR DENGAN ESC
    ----------------------------------------------- */

    document.addEventListener(
      "keydown",
      function(event) {

        if (
          event.key ===
          "Escape"
        ) {

          tutupQR();

        }

      }
    );


  }
);
