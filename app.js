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


  /*
   * Setiap kali masuk Admin,
   * kalau belum login tampilkan login.
   */

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


  /*
   * Kita gunakan display langsung.
   * Ini mencegah masalah CSS hidden
   * seperti yang terjadi sebelumnya.
   */

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
      /*
       * PERBAIKAN:
       * Code.gs menggunakan loginAdmin
       */
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


        /*
         * LANGSUNG buka panel.
         */

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


  console.log(
    "ADMIN LOGIN BOX:",
    loginBox
  );

  console.log(
    "ADMIN PANEL:",
    panel
  );


  /*
   * Login benar-benar disembunyikan.
   */

  if (loginBox) {

    loginBox.style.display =
      "none";

  }


  /*
   * Panel benar-benar ditampilkan.
   */

  if (panel) {

    panel.style.display =
      "block";

    panel.classList.remove(
      "hidden"
    );

  }


  /*
   * Ambil data guru.
   */

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
          .removeChild(script);

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


      /*
       * Backend getGuru()
       * mengembalikan array.
       */

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
         
         
           <button
             class="qr-button"
             onclick="tampilkanQR(
               '${escapeJs(guru.kodeQR)}',
               '${escapeJs(guru.nama)}'
             )">
         
             📷 QR Code
         
           </button>
         
         
           <button
             class="status-button"
             onclick="ubahStatus(
               '${escapeJs(guru.kodeQR)}',
               '${statusBaru}'
             )">
         
             ${
               aktif
                 ? "NONAKTIFKAN"
                 : "AKTIFKAN"
             }
         
           </button>
         
         
           <button
             class="delete-button"
             onclick="deleteGuru(
               '${escapeJs(guru.kodeQR)}'
             )">
         
             🗑️ HAPUS
         
           </button>
         
         
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
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");

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


        /*
         * Bersihkan form
         */

        el("guruNip").value =
          "";

        el("guruNama").value =
          "";

        el("guruJabatan").value =
          "";

        el("guruJP").value =
          "";


        /*
         * Muat ulang daftar guru
         */

        muatDaftarGuru();

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
   UBAH STATUS GURU
===================================================== */

function ubahStatus(
  kodeQR,
  status
) {

  const pertanyaan =
    status === "YA"
      ? "Aktifkan guru ini?"
      : "Nonaktifkan guru ini?";


  if (
    !confirm(
      pertanyaan
    )
  ) {

    return;

  }


  panggilAPI(

    {
      action:
        "ubahStatusGuru",

      kodeQR:
        kodeQR,

      status:
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
   HAPUS GURU
===================================================== */

function deleteGuru(
  kodeQR
) {

  if (!kodeQR) {

    alert(
      "Kode QR guru tidak ditemukan."
    );

    return;

  }


  const yakin =
    confirm(
      "Apakah Anda yakin ingin menghapus guru ini?"
    );


  if (!yakin) {

    return;

  }


  const yakin2 =
    confirm(
      "Data guru dan kode QR akan dihapus. Lanjutkan?"
    );


  if (!yakin2) {

    return;

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
        "HASIL HAPUS GURU:",
        result
      );


      if (
        result &&
        result.sukses === true
      ) {

        alert(
          result.pesan ||
          "Guru berhasil dihapus."
        );


        muatDaftarGuru();

      }

      else {

        alert(
          result &&
          result.pesan
            ? result.pesan
            : "Gagal menghapus guru."
        );

      }

    }

  );

}


/* =====================================================
   SELESAI BAGIAN 1
===================================================== */
/* =====================================================
   APP.JS FINAL
   BAGIAN 2 / 3
===================================================== */


/* =====================================================
   QR CODE GURU
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
      "Kode QR guru tidak ditemukan."
    );

    return;

  }


  /*
   * Tutup modal QR lama jika masih ada
   */

  tutupQR();


  /*
   * Membuat modal langsung dari app.js
   */

  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "qrGuruModal";


  modal.style.cssText = `

    position:fixed;
    inset:0;
    z-index:999999;

    display:flex;
    align-items:center;
    justify-content:center;

    padding:15px;

    background:
      rgba(0,0,0,.75);

    box-sizing:border-box;

  `;


  /*
   * QR menggunakan QRServer.
   * Tidak bergantung pada library QRCode.js.
   */

  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=500x500" +
    "&margin=15" +
    "&data=" +
    encodeURIComponent(
      kodeQR
    );


  modal.innerHTML = `

    <div
      style="
        width:100%;
        max-width:500px;

        max-height:95vh;
        overflow-y:auto;

        background:#ffffff;

        border-radius:22px;

        padding:25px;

        box-sizing:border-box;

        text-align:center;

        box-shadow:
          0 20px 60px
          rgba(0,0,0,.40);
      "
    >

      <h2
        style="
          margin:0 0 8px;

          color:#087f5b;

          font-size:26px;

          font-weight:800;
        "
      >

        QR ABSENSI GURU

      </h2>


      <div
        style="
          margin-bottom:5px;

          color:#222;

          font-size:20px;

          font-weight:700;
        "
      >

        ${escapeHtml(
          nama
        )}

      </div>


      <div
        style="
          margin-bottom:18px;

          color:#777;

          font-size:14px;
        "
      >

        Kode:

        <strong>

          ${escapeHtml(
            kodeQR
          )}

        </strong>

      </div>


      <div
        style="
          width:310px;
          max-width:100%;

          margin:0 auto 20px;

          padding:10px;

          box-sizing:border-box;

          background:#ffffff;

          border:1px solid #ddd;

          border-radius:15px;
        "
      >

        <img
          src="${qrURL}"
          alt="QR Absensi Guru"
          style="
            display:block;

            width:100%;
            height:auto;

            max-width:290px;

            margin:auto;
          "
        >

      </div>


      <div
        style="
          color:#666;

          font-size:13px;

          line-height:1.5;

          margin-bottom:18px;
        "
      >

        Tunjukkan QR Code ini
        kepada guru untuk melakukan
        absensi.

      </div>


      <div
        style="
          display:flex;

          gap:10px;

          width:100%;
        "
      >

        <button
          type="button"
          onclick="cetakQR(
            '${escapeJs(kodeQR)}',
            '${escapeJs(nama)}',
            '${escapeJs(qrURL)}'
          )"
          style="
            flex:1;

            border:0;

            border-radius:12px;

            padding:13px;

            background:#087f5b;

            color:#fff;

            font-size:15px;

            font-weight:700;

            cursor:pointer;
          "
        >

          🖨️ CETAK

        </button>


        <button
          type="button"
          onclick="tutupQR()"
          style="
            flex:1;

            border:0;

            border-radius:12px;

            padding:13px;

            background:#eeeeee;

            color:#222;

            font-size:15px;

            font-weight:700;

            cursor:pointer;
          "
        >

          ✕ TUTUP

        </button>

      </div>

    </div>

  `;


  document.body.appendChild(
    modal
  );


  /*
   * Klik area gelap untuk menutup
   */

  modal.addEventListener(
    "click",
    function(event) {

      if (
        event.target ===
        modal
      ) {

        tutupQR();

      }

    }
  );

}


/* =====================================================
   TUTUP QR
===================================================== */

function tutupQR() {

  const modal =
    document.getElementById(
      "qrGuruModal"
    );


  if (modal) {

    modal.remove();

  }


  /*
   * Hapus modal QR versi lama
   * jika masih ada di index.html.
   */

  const modalLama =
    document.getElementById(
      "qrModal"
    );


  if (modalLama) {

    modalLama.remove();

  }

}


/* =====================================================
   CETAK QR
===================================================== */

function cetakQR(
  kodeQR,
  nama,
  qrURL
) {

  const printWindow =
    window.open(
      "",
      "_blank"
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
        QR Absensi Guru
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

          color:#111;

        }

        h1 {

          margin:0 0 10px;

          font-size:28px;

        }

        h2 {

          margin:0 0 8px;

          font-size:22px;

        }

        .kode {

          margin-bottom:20px;

          color:#555;

          font-size:15px;

        }

        img {

          width:400px;

          max-width:90vw;

          height:auto;

        }

        .keterangan {

          margin-top:20px;

          font-size:14px;

          color:#555;

        }

        @media print {

          body {

            padding:10mm;

          }

          img {

            width:100mm;

            max-width:none;

          }

        }

      </style>

    </head>


    <body>

      <h1>
        QR ABSENSI GURU
      </h1>

      <h2>
        ${escapeHtml(nama)}
      </h2>

      <div class="kode">

        Kode QR:

        <strong>
          ${escapeHtml(kodeQR)}
        </strong>

      </div>


      <img
        src="${qrURL}"
        alt="QR Absensi Guru"
      >


      <div class="keterangan">

        Gunakan QR Code ini
        untuk melakukan absensi guru.

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
   SCANNER QR GURU
===================================================== */

async function mulaiScan() {

  /*
   * Cegah scanner dijalankan dua kali.
   */

  if (
    sedangScan
  ) {

    return;

  }


  const reader =
    el("qr-reader");


  const scannerContent =
    el("scannerContent");


  const batalButton =
    el("batalScanButton");


  const hasil =
    el("hasilAbsensi");


  if (!reader) {

    alert(
      "Area kamera tidak ditemukan."
    );

    return;

  }


  /*
   * Pastikan library Html5Qrcode tersedia.
   */

  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    alert(
      "Scanner QR belum tersedia. Pastikan library Html5Qrcode dimuat di index.html."
    );

    return;

  }


  sedangScan =
    true;


  /*
   * Sembunyikan konten awal scanner.
   */

  if (scannerContent) {

    scannerContent
      .classList
      .add("hidden");

  }


  /*
   * Tampilkan kamera.
   */

  reader
    .classList
    .remove("hidden");


  if (batalButton) {

    batalButton
      .classList
      .remove("hidden");

  }


  if (hasil) {

    hasil
      .classList
      .add("hidden");

  }


  /*
   * Bersihkan scanner sebelumnya.
   */

  try {

    if (qrScanner) {

      await hentikanScanner();

    }

  }
  catch(error) {

    console.log(
      error
    );

  }


  /*
   * Buat scanner baru.
   */

  try {

    qrScanner =
      new Html5Qrcode(
        "qr-reader"
      );


    /*
     * Ambil daftar kamera.
     */

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


    /*
     * Prioritaskan kamera belakang.
     */

    let kamera =
      cameras.find(
        function(camera) {

          return /back|rear|environment/i
            .test(
              camera.label || ""
            );

        }
      );


    /*
     * Jika nama kamera tidak menunjukkan
     * kamera belakang, gunakan kamera terakhir.
     */

    if (!kamera) {

      kamera =
        cameras[
          cameras.length - 1
        ];

    }


    console.log(
      "Kamera digunakan:",
      kamera
    );


    /*
     * Mulai scanner.
     */

    await qrScanner.start(

      kamera.id,

      {

        fps:
          10,

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

        aspectRatio:
          1

      },


      function(decodedText) {

        /*
         * Abaikan pembacaan berikutnya
         * setelah QR pertama berhasil.
         */

        if (
          !sedangScan
        ) {

          return;

        }


        sedangScan =
          false;


        console.log(
          "QR TERBACA:",
          decodedText
        );


        /*
         * Hentikan kamera.
         */

        hentikanScanner();


        /*
         * Proses absensi.
         */

        prosesKodeQR(
          decodedText
        );

      },


      function(errorMessage) {

        /*
         * Error scan normal tidak perlu
         * ditampilkan kepada pengguna.
         */

      }

    );

  }

  catch(error) {

    console.error(
      "ERROR KAMERA:",
      error
    );


    sedangScan =
      false;


    try {

      await hentikanScanner();

    }
    catch(e) {

      console.log(e);

    }


    if (reader) {

      reader
        .classList
        .add("hidden");

    }


    if (batalButton) {

      batalButton
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
   ERROR SCANNER
===================================================== */

function tampilErrorScanner(
  pesan
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    alert(
      pesan ||
      "Kamera tidak dapat digunakan."
    );

    return;

  }


  hasil.classList
    .remove("hidden");


  hasil.innerHTML = `

    <div
      class="admin-message-error"
      style="
        line-height:1.6;
      "
    >

      <strong>
        Kamera tidak dapat digunakan.
      </strong>

      <br><br>

      ${escapeHtml(
        pesan ||
        "Pastikan izin kamera telah diberikan."
      )}

      <br><br>

      Silakan tekan
      <strong>
        AKTIFKAN KAMERA
      </strong>
      kembali.

    </div>

  `;

}


/* =====================================================
   HENTIKAN SCANNER
===================================================== */

async function hentikanScanner() {

  sedangScan =
    false;


  if (!qrScanner) {

    return;

  }


  const scanner =
    qrScanner;


  qrScanner =
    null;


  try {

    /*
     * Hentikan kamera.
     */

    if (
      scanner.isScanning
    ) {

      await scanner.stop();

    }

  }
  catch(error) {

    console.log(
      "STOP SCANNER:",
      error
    );

  }


  try {

    /*
     * Bersihkan canvas/video.
     */

    scanner.clear();

  }
  catch(error) {

    console.log(
      "CLEAR SCANNER:",
      error
    );

  }

}


/* =====================================================
   BATAL SCAN
===================================================== */

function batalScan() {

  hentikanScanner();


  const reader =
    el("qr-reader");


  const scannerContent =
    el("scannerContent");


  const batalButton =
    el("batalScanButton");


  if (reader) {

    reader
      .classList
      .add("hidden");

  }


  if (batalButton) {

    batalButton
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
   PROSES KODE QR
===================================================== */

function prosesKodeQR(
  kodeQR
) {

  kodeQR =
    String(
      kodeQR || ""
    ).trim();


  if (!kodeQR) {

    alert(
      "Kode QR kosong."
    );

    return;

  }


  /*
   * Setelah QR dibaca,
   * jalankan absensi guru.
   */

  prosesAbsensiGuru(
    kodeQR
  );

}


/* =====================================================
   ABSENSI GURU
===================================================== */

function prosesAbsensiGuru(
  kodeQR
) {

  const hasil =
    el("hasilAbsensi");


  if (hasil) {

    hasil
      .classList
      .remove("hidden");


    hasil.innerHTML = `

      <div class="loading">

        ⏳ Mengambil lokasi GPS...

      </div>

    `;

  }


  /*
   * GPS wajib aktif.
   */

  ambilLokasi(
    function(lokasi) {

      if (
        !lokasi ||
        lokasi.sukses !== true
      ) {

        if (hasil) {

          hasil.innerHTML = `

            <div class="admin-message-error">

              ✕ ${
                escapeHtml(
                  lokasi &&
                  lokasi.pesan
                    ? lokasi.pesan
                    : "Lokasi GPS tidak dapat diperoleh."
                )
              }

            </div>

          `;

        }

        return;

      }


      /*
       * Kirim absensi ke Code.gs.
       */

      hasil.innerHTML = `

        <div class="loading">

          ⏳ Memeriksa lokasi dan
          menyimpan absensi...

        </div>

      `;


      panggilAPI(

        {

          action:
            "absensi",

          kodeQR:
            kodeQR,

          latitude:
            lokasi.latitude,

          longitude:
            lokasi.longitude,

          accuracy:
            lokasi.accuracy

        },

        function(result) {

          console.log(
            "HASIL ABSENSI:",
            result
          );


          if (
            result &&
            result.sukses === true
          ) {

            tampilkanHasilAbsensi(
              result
            );

          }

          else {

            hasil.innerHTML = `

              <div
                class="admin-message-error"
              >

                ✕ ${
                  escapeHtml(
                    result &&
                    result.pesan
                      ? result.pesan
                      : "Absensi gagal."
                  )
                }

              </div>

            `;

          }

        }

      );

    }

  );

}


/* =====================================================
   GPS
===================================================== */

function ambilLokasi(
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


  navigator.geolocation
    .getCurrentPosition(

      function(position) {

        const coords =
          position.coords;


        callback({

          sukses:
            true,

          latitude:
            coords.latitude,

          longitude:
            coords.longitude,

          accuracy:
            coords.accuracy

        });

      },


      function(error) {

        let pesan =
          "Lokasi GPS tidak dapat diperoleh.";


        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {

          pesan =
            "Izin lokasi ditolak. Aktifkan lokasi pada browser.";

        }

        else if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {

          pesan =
            "Lokasi GPS tidak tersedia.";

        }

        else if (
          error.code ===
          error.TIMEOUT
        ) {

          pesan =
            "Pengambilan lokasi terlalu lama.";

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


/* =====================================================
   HASIL ABSENSI
===================================================== */

function tampilkanHasilAbsensi(
  result
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


  const nama =
    result.nama ||
    "-";


  const waktu =
    result.waktu ||
    "-";


  const status =
    result.status ||
    "Berhasil";


  hasil.classList
    .remove("hidden");


  hasil.innerHTML = `

    <div
      style="
        padding:22px;

        border-radius:18px;

        background:#e8f5e9;

        border:1px solid #a5d6a7;

        text-align:center;
      "
    >

      <div
        style="
          font-size:45px;
          margin-bottom:8px;
        "
      >

        ✓

      </div>


      <div
        style="
          font-size:20px;
          font-weight:800;
          color:#2e7d32;
        "
      >

        ABSENSI BERHASIL

      </div>


      <div
        style="
          margin-top:12px;

          font-size:18px;

          font-weight:700;

          color:#222;
        "
      >

        ${escapeHtml(
          nama
        )}

      </div>


      <div
        style="
          margin-top:6px;

          color:#555;
        "
      >

        ${escapeHtml(
          status
        )}

      </div>


      <div
        style="
          margin-top:6px;

          color:#777;

          font-size:13px;
        "
      >

        ${escapeHtml(
          waktu
        )}

      </div>

    </div>

  `;

}


/* =====================================================
   SELESAI BAGIAN 2
===================================================== */

/* =====================================================
   APP.JS FINAL
   BAGIAN 3 / 3
===================================================== */

/* ==========================================================
   REKAP ABSENSI GURU QR
   FORMAT SAMA DENGAN REKAP GURU PIKET
========================================================== */

function tampilkanRekap() {

  const bulanEl =
    el("bulanRekap");

  const hasil =
    el("hasilRekap");

  const message =
    el("rekapMessage");


  if (!bulanEl || !hasil) {

    console.error(
      "Elemen rekap tidak ditemukan."
    );

    return;

  }


  const bulan =
    String(
      bulanEl.value || ""
    ).trim();


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  if (message) {

    message.innerHTML = `
      <div class="loading">
        ⏳ Mengambil data rekap...
      </div>
    `;

  }


  hasil.innerHTML = "";


  panggilAPI(

    {
      action: "rekap",
      bulan: bulan
    },

    function(result) {

      console.log(
        "REKAP GURU:",
        result
      );


      if (
        !result ||
        result.sukses !== true
      ) {

        if (message) {

          message.innerHTML = `

            <div class="admin-message-error">

              ✕ ${
                escapeHtml(
                  result &&
                  result.pesan
                    ? result.pesan
                    : "Gagal mengambil rekap."
                )
              }

            </div>

          `;

        }

        return;

      }


      let data = [];


      if (
        Array.isArray(
          result.data
        )
      ) {

        data =
          result.data;

      }

      else if (
        Array.isArray(
          result.hasil
        )
      ) {

        data =
          result.hasil;

      }

      else if (
        Array.isArray(result)
      ) {

        data =
          result;

      }


      if (!data.length) {

        if (message) {

          message.innerHTML = "";

        }

        hasil.innerHTML = `

          <div
            class="loading"
            style="
              padding:25px;
              text-align:center;
            "
          >

            📊 Belum ada data absensi
            pada bulan ${escapeHtml(bulan)}.

          </div>

        `;

        return;

      }


      /*
       * ======================================================
       * BUAT TABEL
       * ======================================================
       */

      let html = `

        <div
          class="rekap-summary"
          style="
            margin-bottom:15px;
            font-weight:bold;
            color:#087f5b;
          "
        >

          📊 REKAP ABSENSI BULANAN
          ${escapeHtml(bulan)}

        </div>


        <div
          style="
            overflow-x:auto;
            width:100%;
          "
        >

          <table
            class="rekap-table"
          >

            <thead>

              <tr>

                <th>
                  Nama
                </th>

                <th>
                  JTM/Minggu
                </th>

                <th>
                  Hadir
                </th>

                <th>
                  Terlambat
                </th>

                <th>
                  Tidak
                </th>

                <th>
                  Total JP
                </th>

              </tr>

            </thead>

            <tbody>

      `;


      let totalHadir = 0;
      let totalTerlambat = 0;
      let totalTidak = 0;
      let totalJP = 0;


      data.forEach(
        function(row) {

          const nama =
            row.nama || "-";


          const nip =
            row.nip || "";


          const jp =
            Number(
              row.jp !== undefined
                ? row.jp
                : row.jtm !== undefined
                  ? row.jtm
                  : 0
            ) || 0;


          const hadir =
            Number(
              row.hadir || 0
            );


          const terlambat =
            Number(
              row.terlambat || 0
            );


          const tidak =
            Number(
              row.tidak || 0
            );


          /*
           * Hadir + terlambat =
           * hari mengajar
           */

          const hariDihitung =
            hadir +
            terlambat;


          /*
           * Total JP
           */

          const jumlahJP =
            row.totalJP !== undefined
              ? Number(row.totalJP || 0)
              : hariDihitung * jp;


          totalHadir +=
            hadir;


          totalTerlambat +=
            terlambat;


          totalTidak +=
            tidak;


          totalJP +=
            jumlahJP;


          html += `

            <tr>

              <td>

                <strong>

                  ${escapeHtml(
                    nama
                  )}

                </strong>

                ${
                  nip
                    ? `
                      <br>

                      <small
                        style="
                          color:#777;
                        "
                      >

                        NIP:
                        ${escapeHtml(
                          nip
                        )}

                      </small>
                    `
                    : ""
                }

              </td>


              <td
                style="
                  text-align:center;
                "
              >

                ${jp}

              </td>


              <td
                style="
                  text-align:center;
                "
              >

                <strong>

                  ${hadir}

                </strong>

              </td>


              <td
                style="
                  text-align:center;
                "
              >

                ${terlambat}

              </td>


              <td
                style="
                  text-align:center;
                "
              >

                ${tidak}

              </td>


              <td
                style="
                  text-align:center;
                "
              >

                <strong
                  style="
                    color:#087f5b;
                  "
                >

                  ${jumlahJP}

                </strong>

              </td>

            </tr>

          `;

        }
      );


      /*
       * ======================================================
       * BARIS TOTAL
       * ======================================================
       */

      html += `

            <tr
              style="
                font-weight:bold;
                background:#f2f8f6;
              "
            >

              <td>
                TOTAL
              </td>

              <td>
                -
              </td>

              <td
                style="
                  text-align:center;
                "
              >
                ${totalHadir}
              </td>

              <td
                style="
                  text-align:center;
                "
              >
                ${totalTerlambat}
              </td>

              <td
                style="
                  text-align:center;
                "
              >
                ${totalTidak}
              </td>

              <td
                style="
                  text-align:center;
                  color:#087f5b;
                "
              >
                ${totalJP}
              </td>

            </tr>


            </tbody>

          </table>

        </div>

      `;


      hasil.innerHTML =
        html;


      if (message) {

        message.innerHTML = `

          <div
            class="admin-message-success"
          >

            ✓ Rekap ${escapeHtml(
              bulan
            )} berhasil ditampilkan.

          </div>

        `;

      }

    }

  );

}

/* =====================================================
   EXPORT EXCEL
===================================================== */

function exportExcel() {

  const tanggal =
    el("filterTanggal")
      ? el("filterTanggal").value
      : "";


  panggilAPI(

    {

      action:
        "getRekap",

      tanggal:
        tanggal

    },

    function(result) {

      const data =
        Array.isArray(result)
          ? result
          : (
              result &&
              Array.isArray(
                result.data
              )
                ? result.data
                : []
            );


      if (!data.length) {

        alert(
          "Tidak ada data untuk diekspor."
        );

        return;

      }


      /*
       * Jika SheetJS tersedia,
       * gunakan XLSX.
       */

      if (
        typeof XLSX !==
        "undefined"
      ) {

        const worksheet =
          XLSX.utils.json_to_sheet(
            data
          );


        const workbook =
          XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          "Absensi"
        );


        XLSX.writeFile(
          workbook,
          "Rekap_Absensi_Guru.xlsx"
        );

        return;

      }


      /*
       * Fallback CSV.
       */

      const keys =
        Object.keys(
          data[0]
        );


      let csv =
        keys.join(",") +
        "\n";


      data.forEach(
        function(row) {

          csv +=
            keys
              .map(
                function(key) {

                  return '"' +
                    String(
                      row[key] ??
                      ""
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


      const a =
        document.createElement(
          "a"
        );


      a.href =
        url;


      a.download =
        "Rekap_Absensi_Guru.csv";


      document.body.appendChild(
        a
      );


      a.click();


      a.remove();


      URL.revokeObjectURL(
        url
      );

    }

  );

}


/* =====================================================
   EXPORT PDF
===================================================== */

function exportPDF() {

  const tanggal =
    el("filterTanggal")
      ? el("filterTanggal").value
      : "";


  panggilAPI(

    {

      action:
        "getRekap",

      tanggal:
        tanggal

    },

    function(result) {

      const data =
        Array.isArray(result)
          ? result
          : (
              result &&
              Array.isArray(
                result.data
              )
                ? result.data
                : []
            );


      if (!data.length) {

        alert(
          "Tidak ada data untuk diekspor."
        );

        return;

      }


      /*
       * Gunakan jsPDF apabila tersedia.
       */

      if (
        typeof window.jspdf !==
        "undefined"
      ) {

        const {
          jsPDF
        } =
          window.jspdf;


        const doc =
          new jsPDF(
            "landscape"
          );


        doc.setFontSize(
          16
        );


        doc.text(
          "REKAP ABSENSI GURU",
          14,
          15
        );


        const body =
          data.map(
            function(row, index) {

              return [

                index + 1,

                row.tanggal ||
                row.Tanggal ||
                "",

                row.jam ||
                row.Jam ||
                row.waktu ||
                "",

                row.nama ||
                row.Nama ||
                "",

                row.status ||
                row.Status ||
                "",

                row.lokasi ||
                row.Lokasi ||
                ""

              ];

            }
          );


        if (
          typeof doc.autoTable ===
          "function"
        ) {

          doc.autoTable({

            head: [[

              "No",

              "Tanggal",

              "Jam",

              "Nama Guru",

              "Status",

              "Lokasi"

            ]],

            body:
              body,

            startY:
              22

          });

        }


        doc.save(
          "Rekap_Absensi_Guru.pdf"
        );


        return;

      }


      /*
       * Jika jsPDF belum tersedia,
       * tampilkan versi cetak browser.
       */

      cetakRekap(
        data
      );

    }

  );

}


/* =====================================================
   CETAK REKAP
===================================================== */

function cetakRekap(
  data
) {

  const win =
    window.open(
      "",
      "_blank"
    );


  if (!win) {

    alert(
      "Popup diblokir browser."
    );

    return;

  }


  let rows = "";


  data.forEach(
    function(row, index) {

      rows += `

        <tr>

          <td>
            ${index + 1}
          </td>

          <td>
            ${escapeHtml(
              row.tanggal ||
              row.Tanggal ||
              "-"
            )}
          </td>

          <td>
            ${escapeHtml(
              row.jam ||
              row.Jam ||
              row.waktu ||
              "-"
            )}
          </td>

          <td>
            ${escapeHtml(
              row.nama ||
              row.Nama ||
              "-"
            )}
          </td>

          <td>
            ${escapeHtml(
              row.status ||
              row.Status ||
              "-"
            )}
          </td>

          <td>
            ${escapeHtml(
              row.lokasi ||
              row.Lokasi ||
              "-"
            )}
          </td>

        </tr>

      `;

    }
  );


  win.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <meta charset="UTF-8">

      <title>
        Rekap Absensi Guru
      </title>

      <style>

        body {

          font-family:Arial,sans-serif;

          padding:20px;

        }

        h2 {

          text-align:center;

        }

        table {

          width:100%;

          border-collapse:collapse;

        }

        th,
        td {

          border:1px solid #333;

          padding:7px;

          font-size:12px;

        }

        th {

          background:#eee;

        }

      </style>

    </head>

    <body>

      <h2>
        REKAP ABSENSI GURU
      </h2>

      <table>

        <thead>

          <tr>

            <th>No</th>

            <th>Tanggal</th>

            <th>Jam</th>

            <th>Nama Guru</th>

            <th>Status</th>

            <th>Lokasi</th>

          </tr>

        </thead>

        <tbody>

          ${rows}

        </tbody>

      </table>


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


  win.document.close();

}

/* =====================================================
   ABSENSI GURU PIKET
===================================================== */

function bukaPiket() {

  /*
   * Hentikan kamera QR jika masih aktif
   */
  try {

    hentikanScanner();

  }

  catch(error) {

    console.log(
      "Scanner tidak aktif:",
      error
    );

  }


  /*
   * Buka halaman piket.html
   */
  window.location.href =
    "piket.html";

}

/* =====================================================
   BACK / KEMBALI
===================================================== */

function kembali() {

  /*
   * Ini dibuat sebagai fungsi umum
   * karena beberapa tombol di index.html
   * menggunakan kembali().
   */

  hentikanScanner();


  /*
   * Jika halaman piket sedang terbuka,
   * kembali ke Home.
   */

  const piketPage =
    el("piketPage");


  if (
    piketPage &&
    !piketPage.classList.contains(
      "hidden"
    )
  ) {

    kembaliHome();

    return;

  }


  /*
   * Jika halaman admin sedang terbuka.
   */

  const adminPage =
    el("adminPage");


  if (
    adminPage &&
    !adminPage.classList.contains(
      "hidden"
    )
  ) {

    kembaliHome();

    return;

  }


  /*
   * Jika halaman guru sedang terbuka.
   */

  const guruPage =
    el("guruPage");


  if (
    guruPage &&
    !guruPage.classList.contains(
      "hidden"
    )
  ) {

    kembaliHome();

    return;

  }


  /*
   * Jika halaman rekap sedang terbuka.
   */

  const rekapPage =
    el("rekapPage");


  if (
    rekapPage &&
    !rekapPage.classList.contains(
      "hidden"
    )
  ) {

    kembaliHome();

    return;

  }


  kembaliHome();

}


/* =====================================================
   TOMBOL BACK ANDROID
===================================================== */

/*
 * Gunakan History API.
 *
 * Saat halaman berpindah, kita buat state.
 * Tombol Back Android kemudian akan kembali
 * ke halaman sebelumnya, bukan keluar aplikasi.
 */

let historySudahDipasang =
  false;


function pasangNavigasiHistory() {

  if (
    historySudahDipasang
  ) {

    return;

  }


  historySudahDipasang =
    true;


  /*
   * State awal.
   */

  try {

    history.replaceState(
      {
        page:
          "home"
      },
      "",
      window.location.href
    );

  }
  catch(error) {

    console.log(
      error
    );

  }


  /*
   * Back Android / browser.
   */

  window.addEventListener(
    "popstate",
    function(event) {

      /*
       * Jangan biarkan kamera
       * tetap aktif.
       */

      hentikanScanner();


      const state =
        event.state;


      if (
        state &&
        state.page
      ) {

        bukaHalamanDariHistory(
          state.page
        );

      }

      else {

        kembaliHome();

      }

    }
  );

}


/* =====================================================
   BUKA HALAMAN HISTORY
===================================================== */

function bukaHalamanDariHistory(
  page
) {

  hentikanScanner();


  sembunyikanSemua();


  switch(
    page
  ) {

    case "admin":

      el("adminPage")
        ?.classList
        .remove("hidden");

      if (
        adminSudahLogin
      ) {

        tampilkanPanelAdmin();

      }

      else {

        tampilkanLoginAdmin();

      }

      break;


    case "guru":

      el("guruPage")
        ?.classList
        .remove("hidden");

      break;


    case "rekap":

      el("rekapPage")
        ?.classList
        .remove("hidden");

      break;


    case "piket":

      el("piketPage")
        ?.classList
        .remove("hidden");

      if (
        typeof muatPiket ===
        "function"
      ) {

        muatPiket();

      }

      break;


    default:

      el("homePage")
        ?.classList
        .remove("hidden");

      break;

  }

}


/* =====================================================
   NAVIGASI DENGAN HISTORY
===================================================== */

function navigasiKe(
  page
) {

  try {

    history.pushState(

      {
        page:
          page
      },

      "",

      window.location.href

    );

  }
  catch(error) {

    console.log(
      error
    );

  }


  bukaHalamanDariHistory(
    page
  );

}


/* =====================================================
   WRAPPER NAVIGASI
===================================================== */

/*
 * Kita simpan fungsi asli agar kompatibel
 * dengan tombol index.html.
 */

const _bukaAdminAsli =
  bukaAdmin;

const _bukaGuruAsli =
  bukaGuru;

const _bukaRekapAsli =
  bukaRekap;

const _bukaPiketAsli =
  bukaPiket;

const _kembaliHomeAsli =
  kembaliHome;


/*
 * Ganti fungsi navigasi dengan versi
 * yang mencatat History.
 */

bukaAdmin =
  function() {

    navigasiKe(
      "admin"
    );

  };


bukaGuru =
  function() {

    navigasiKe(
      "guru"
    );

  };


bukaRekap =
  function() {

    navigasiKe(
      "rekap"
    );

  };

/* =====================================================
   HOME
===================================================== */

function tampilHome() {

  hentikanScanner();


  sembunyikanSemua();


  const home =
    el("homePage");


  if (home) {

    home
      .classList
      .remove("hidden");

  }


  try {

    history.pushState(
      {
        page:
          "home"
      },
      "",
      window.location.href
    );

  }
  catch(error) {

    console.log(
      error
    );

  }

}


/* =====================================================
   EVENT DOM READY
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "APP.JS siap."
    );


    /*
     * Pasang tombol Back Android.
     */

    pasangNavigasiHistory();


    /*
     * Pastikan Home menjadi
     * halaman awal.
     */

    sembunyikanSemua();


    const home =
      el("homePage");


    if (home) {

      home
        .classList
        .remove("hidden");

    }


    /*
     * Enter pada PIN Admin
     * otomatis menjalankan loginAdmin().
     */

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

            event.preventDefault();

            loginAdmin();

          }

        }
      );

    }


    /*
     * ESC menutup modal QR.
     */

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


/* =====================================================
   BEFORE UNLOAD
===================================================== */

window.addEventListener(
  "beforeunload",
  function() {

    /*
     * Tidak perlu menunggu promise.
     * Hentikan scanner jika halaman ditutup.
     */

    try {

      if (
        qrScanner &&
        qrScanner.isScanning
      ) {

        qrScanner.stop();

      }

    }
    catch(error) {

      console.log(
        error
      );

    }

  }
);


/* =====================================================
   PROTEKSI ERROR GLOBAL
===================================================== */

window.addEventListener(
  "error",
  function(event) {

    console.error(
      "APP ERROR:",
      event.error ||
      event.message
    );

  }
);


/* =====================================================
   SELESAI APP.JS FINAL
===================================================== */
