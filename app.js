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
      action: "login",
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

              📷 QR

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
      action: "ubahStatus",
      kodeQR: kodeQR,
      status: status
    },

    function(result) {

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
            : "Gagal mengubah status."
        );

      }

    }

  );

}


/* =====================================================
   QR CODE
===================================================== */

function tampilkanQR(
  kodeQR,
  nama
) {

  tutupQR();


  const qrURL =
    "https://api.qrserver.com/v1/create-qr-code/" +
    "?size=500x500" +
    "&margin=15" +
    "&data=" +
    encodeURIComponent(
      kodeQR
    );


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "qrModal";


  modal.className =
    "qr-modal";


  modal.innerHTML = `

    <div class="qr-box">


      <h2>
        QR GURU
      </h2>


      <div>

        ${escapeHtml(
          nama
        )}

      </div>


      <img
        src="${qrURL}"
        alt="QR Guru">


      <div class="qr-code-text">

        ${escapeHtml(
          kodeQR
        )}

      </div>


      <button
        class="primary-button"
        onclick="cetakQR(
          '${escapeJs(kodeQR)}',
          '${escapeJs(nama)}',
          '${escapeJs(qrURL)}'
        )">

        🖨️ CETAK QR

      </button>


      <br><br>


      <button
        class="danger-button"
        onclick="tutupQR()">

        TUTUP

      </button>


    </div>

  `;


  document.body.appendChild(
    modal
  );

}


/* =====================================================
   TUTUP QR
===================================================== */

function tutupQR() {

  const modal =
    el("qrModal");


  if (modal) {

    modal.remove();

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

  const win =
    window.open(
      "",
      "_blank"
    );


  if (!win) {

    alert(
      "Popup diblokir browser. Izinkan popup untuk mencetak QR."
    );

    return;

  }


  win.document.write(`

    <!DOCTYPE html>

    <html>

    <head>

      <title>
        QR Guru
      </title>


      <style>

        body {
          font-family:Arial;
          text-align:center;
          padding:30px;
        }

        h1 {
          color:#075c43;
        }

        img {
          width:350px;
          height:350px;
        }

        .kode {
          font-size:24px;
          font-family:monospace;
          font-weight:bold;
          letter-spacing:4px;
          margin:15px;
        }

      </style>

    </head>


    <body>

      <h1>
        ABSENSI GURU
      </h1>

      <h2>
        MTs. BADRIL HUDA
      </h2>

      <h3>
        ${escapeHtml(nama)}
      </h3>

      <img
        src="${qrURL}">

      <div class="kode">
        ${escapeHtml(kodeQR)}
      </div>


      <script>

        window.onload =
          function() {

            setTimeout(
              function() {

                window.print();

              },
              700
            );

          };

      <\/script>

    </body>

    </html>

  `);


  win.document.close();

}


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


  scannerContent
    .classList
    .add("hidden");


  reader
    .classList
    .remove("hidden");


  batal
    .classList
    .remove("hidden");


  try {

    if (
      typeof Html5Qrcode ===
      "undefined"
    ) {

      throw new Error(
        "Scanner QR belum dimuat."
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


    /*
     * Prioritas kamera belakang.
     */

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

        fps: 10,

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
                ) * .72
              );


            return {

              width:
                size,

              height:
                size

            };

          },

        aspectRatio: 1

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

        /*
         * Tidak perlu menampilkan
         * error scan biasa.
         */

      }

    );

  }

  catch(error) {

    console.error(
      "KAMERA:",
      error
    );


    sedangScan =
      false;


    reader
      .classList
      .add("hidden");


    batal
      .classList
      .add("hidden");


    scannerContent
      .classList
      .remove("hidden");


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


  reader
    .classList
    .add("hidden");


  batal
    .classList
    .add("hidden");


  scannerContent
    .classList
    .remove("hidden");

}


/* =====================================================
   PROSES QR
===================================================== */

function prosesKodeQR(
  kodeQR
) {

  const hasil =
    el("hasilAbsensi");


  hasil
    .classList
    .remove("hidden");


  hasil.innerHTML = `

    <div class="result-icon">
      ⏳
    </div>

    <h2>
      MEMERIKSA ABSENSI
    </h2>

    <div class="result-info">

      <span>
        Mohon tunggu...
      </span>

    </div>

  `;


  panggilAPI(

    {
      action: "absensi",
      kodeQR: kodeQR
    },

    function(result) {

      tampilkanHasilAbsensi(
        result
      );

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


  hasil
    .classList
    .remove("hidden");


  if (
    result &&
    result.sukses === true
  ) {

    hasil.innerHTML = `

      <div class="result-icon">
        ✓
      </div>

      <h2>
        ABSENSI BERHASIL
      </h2>

      <div class="result-info">

        <strong>
          ${escapeHtml(
            result.nama || "Guru"
          )}
        </strong>

        <span>
          ${escapeHtml(
            result.jabatan || "Guru"
          )}
        </span>

        <span>
          Jam Masuk:
          <strong>
            ${escapeHtml(
              result.jam || "-"
            )}
          </strong>
        </span>

      </div>


      <button
        class="primary-button"
        onclick="suaraBerhasil()">

        🔊 ABSENSI BERHASIL

      </button>


      <br><br>


      <button
        class="primary-button"
        onclick="mulaiScan()">

        📷 SCAN LAGI

      </button>

    `;


    suaraBerhasil();


    return;

  }


  if (
    result &&
    result.sudahAbsen
  ) {

    hasil.innerHTML = `

      <div class="result-icon">
        ✓
      </div>

      <h2>
        SUDAH ABSEN
      </h2>

      <div class="result-info">

        <strong>
          ${escapeHtml(
            result.nama || "Guru"
          )}
        </strong>

        <span>
          Jam:
          ${escapeHtml(
            result.jam || "-"
          )}
        </span>

      </div>


      <button
        class="primary-button"
        onclick="mulaiScan()">

        📷 SCAN LAGI

      </button>

    `;

    return;

  }


  tampilError(

    result &&
    result.pesan

      ? result.pesan

      : "Absensi gagal."

  );

}


/* =====================================================
   ERROR ABSENSI
===================================================== */

function tampilError(
  pesan
) {

  const hasil =
    el("hasilAbsensi");


  hasil
    .classList
    .remove("hidden");


  hasil.style.background =
    "#ffe3e3";


  hasil.style.color =
    "#b00020";


  hasil.innerHTML = `

    <div
      class="result-icon"
      style="
        background:#dc3545;
      ">

      !

    </div>


    <h2>
      ABSENSI GAGAL
    </h2>


    <div class="result-info">

      <span>

        ${escapeHtml(
          pesan
        )}

      </span>

    </div>


    <button
      class="primary-button"
      onclick="mulaiScan()">

      📷 COBA LAGI

    </button>

  `;

}


/* =====================================================
   ERROR KAMERA
===================================================== */

function tampilErrorScanner(
  pesan
) {

  const reader =
    el("qr-reader");


  reader.classList.add(
    "hidden"
  );


  const hasil =
    el("hasilAbsensi");


  hasil.classList.remove(
    "hidden"
  );


  hasil.innerHTML = `

    <div
      class="result-icon"
      style="
        background:#dc3545;
      ">

      !

    </div>


    <h2>
      KAMERA TIDAK DAPAT DIBUKA
    </h2>


    <div class="result-info">

      <span>

        ${escapeHtml(
          pesan ||
          "Akses kamera ditolak."
        )}

      </span>

    </div>


    <button
      class="primary-button"
      onclick="mulaiScan()">

      📷 COBA LAGI

    </button>

  `;

}


/* =====================================================
   SUARA
===================================================== */

function suaraBerhasil() {

  try {

    window.speechSynthesis.cancel();


    const suara =
      new SpeechSynthesisUtterance(
        "Absensi berhasil"
      );


    suara.lang =
      "id-ID";


    suara.rate =
      1;


    suara.pitch =
      1;


    window.speechSynthesis
      .speak(
        suara
      );

  }

  catch(error) {

    console.log(
      error
    );

  }

}


/* =====================================================
   REKAP
===================================================== */

function tampilkanRekap() {

  const bulan =
    el("bulanRekap").value;


  const hasil =
    el("hasilRekap");


  if (!bulan) {

    alert(
      "Silakan pilih bulan."
    );

    return;

  }


  hasil.innerHTML = `

    <div class="loading">

      ⏳ Mengambil data rekap...

    </div>

  `;


  panggilAPI(

    {
      action: "rekap",
      bulan: bulan
    },

    function(result) {

      console.log(
        "REKAP:",
        result
      );


      if (
        !result ||
        result.sukses === false
      ) {

        hasil.innerHTML = `

          <div class="admin-message-error">

            ${
              escapeHtml(
                result &&
                result.pesan
                  ? result.pesan
                  : "Rekap tidak tersedia."
              )
            }

          </div>

        `;

        return;

      }


      /*
       * Jika backend mengembalikan array.
       */

      const data =
        Array.isArray(result)
          ? result
          : (
              Array.isArray(
                result.data
              )
                ? result.data
                : []
            );


      if (!data.length) {

        hasil.innerHTML = `

          <div class="loading">

            Belum ada data absensi
            pada bulan ini.

          </div>

        `;

        return;

      }


      let html = `

        <div style="
          overflow-x:auto;
        ">

          <table
            class="rekap-table">

            <thead>

              <tr>

                <th>
                  Nama
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

              </tr>

            </thead>

            <tbody>

      `;


      data.forEach(
        function(row) {

          html += `

            <tr>

              <td>
                ${escapeHtml(
                  row.nama || "-"
                )}
              </td>

              <td>
                ${escapeHtml(
                  row.hadir ?? "-"
                )}
              </td>

              <td>
                ${escapeHtml(
                  row.terlambat ?? "-"
                )}
              </td>

              <td>
                ${escapeHtml(
                  row.tidakHadir ?? "-"
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


      hasil.innerHTML =
        html;

    }

  );

}


/* =====================================================
   DEFAULT
===================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    /*
     * Set bulan sekarang.
     */

    const sekarang =
      new Date();


    const bulan =
      sekarang.getFullYear() +
      "-" +
      String(
        sekarang.getMonth() + 1
      ).padStart(
        2,
        "0"
      );


    if (el("bulanRekap")) {

      el("bulanRekap").value =
        bulan;

    }


    /*
     * Pastikan halaman awal
     * hanya Home.
     */

    sembunyikanSemua();


    el("homePage")
      .classList
      .remove("hidden");


    /*
     * Admin harus login setiap
     * kali halaman dimuat.
     */

    adminSudahLogin =
      false;

  }
);

// ==========================================================
// EXPORT EXCEL
// ==========================================================

function exportExcel() {

  const bulan =
    el("bulanRekap").value;


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  const message =
    el("rekapMessage");


  message.innerHTML = `
    <div class="loading">
      ⏳ Menyiapkan file Excel...
    </div>
  `;


  panggilAPI(

    {
      action: "exportExcel",
      bulan: bulan
    },

    function(result) {

      console.log(
        "EXPORT EXCEL:",
        result
      );


      if (
        result &&
        result.sukses === true &&
        result.url
      ) {

        message.innerHTML = `
          <div class="admin-message-success">

            ✓ File Excel berhasil dibuat.

            <br><br>

            <a
              href="${result.url}"
              target="_blank"
              class="primary-button"
              style="
                display:block;
                text-align:center;
                text-decoration:none;
              "
            >
              📊 BUKA / DOWNLOAD EXCEL
            </a>

          </div>
        `;

      }

      else {

        message.innerHTML = `
          <div class="admin-message-error">

            ✕ Gagal membuat file Excel.

          </div>
        `;

      }

    }

  );

}


// ==========================================================
// EXPORT PDF
// ==========================================================

function exportPDF() {

  const bulan =
    el("bulanRekap").value;


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  const message =
    el("rekapMessage");


  message.innerHTML = `
    <div class="loading">
      ⏳ Menyiapkan file PDF...
    </div>
  `;


  panggilAPI(

    {
      action: "exportPDF",
      bulan: bulan
    },

    function(result) {

      console.log(
        "EXPORT PDF:",
        result
      );


      if (
        result &&
        result.sukses === true &&
        result.url
      ) {

        message.innerHTML = `
          <div class="admin-message-success">

            ✓ File PDF berhasil dibuat.

            <br><br>

            <a
              href="${result.url}"
              target="_blank"
              class="primary-button"
              style="
                display:block;
                text-align:center;
                text-decoration:none;
              "
            >
              📄 BUKA / DOWNLOAD PDF
            </a>

          </div>
        `;

      }

      else {

        message.innerHTML = `
          <div class="admin-message-error">

            ✕ Gagal membuat file PDF.

          </div>
        `;

      }

    }

  );

}
