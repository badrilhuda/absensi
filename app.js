/* ==========================================================
   ABSENSI GURU - MTs. BADRIL HUDA
   APP.JS - LENGKAP
========================================================== */

const API_URL =
  "https://script.google.com/macros/s/AKfycbxT6SI7IbqBM_yTMvF0sY6EdikgAnyCKnD-R8fWOaOvw4_atZeAWSTN9t3sAYJbgsbP/exec";

let qrScanner = null;
let sedangScan = false;
let adminSudahLogin = false;


/* ==========================================================
   UTILITAS
========================================================== */

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


function escapeJs(text) {

  return String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/\r/g, "")
    .replace(/\n/g, "\\n");

}


/* ==========================================================
   HALAMAN
========================================================== */

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

  const page = el("homePage");

  if (page) {

    page.classList.remove("hidden");

  }

}


function bukaGuru() {

  hentikanScanner();

  sembunyikanSemua();

  const page = el("guruPage");

  if (page) {

    page.classList.remove("hidden");

  }

}


function bukaRekap() {

  hentikanScanner();

  sembunyikanSemua();

  const page = el("rekapPage");

  if (page) {

    page.classList.remove("hidden");

  }

}


function bukaAdmin() {

  hentikanScanner();

  sembunyikanSemua();

  const page = el("adminPage");

  if (page) {

    page.classList.remove("hidden");

  }

  if (adminSudahLogin) {

    tampilkanPanelAdmin();

  } else {

    tampilkanLoginAdmin();

  }

}


/* ==========================================================
   API JSONP
========================================================== */

function panggilAPI(parameter, callback) {

  const callbackName =
    "absensiCallback_" +
    Date.now() +
    "_" +
    Math.floor(
      Math.random() * 99999
    );


  let selesai = false;


  const script =
    document.createElement("script");


  function selesaiRequest(result) {

    if (selesai) {

      return;

    }

    selesai = true;


    try {

      callback(result);

    } catch (error) {

      console.error(error);

    }


    delete window[callbackName];


    if (script.parentNode) {

      script.parentNode.removeChild(
        script
      );

    }

  }


  window[callbackName] =
    function(result) {

      selesaiRequest(result);

    };


  const params =
    new URLSearchParams();


  Object.keys(parameter || {})
    .forEach(function(key) {

      params.append(
        key,
        parameter[key] ?? ""
      );

    });


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

      selesaiRequest({

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

      if (!selesai) {

        selesaiRequest({

          sukses: false,

          pesan:
            "Server Apps Script tidak merespons."

        });

      }

    },
    15000
  );

}


/* ==========================================================
   LOGIN ADMIN
========================================================== */

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

      } else {

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


/* ==========================================================
   PANEL ADMIN
========================================================== */

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


/* ==========================================================
   DATA GURU
========================================================== */

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


      let data = [];


      if (
        Array.isArray(result)
      ) {

        data = result;

      }

      else if (
        result &&
        Array.isArray(result.data)
      ) {

        data = result.data;

      }

      else if (
        result &&
        Array.isArray(result.hasil)
      ) {

        data = result.hasil;

      }


      if (!Array.isArray(data)) {

        container.innerHTML = `

          <div class="admin-message-error">

            Data guru tidak dapat dibaca.

          </div>

        `;

        return;

      }


      tampilkanDaftarGuru(
        data
      );

    }

  );

}


/* ==========================================================
   TAMPILKAN DATA GURU
========================================================== */

function tampilkanDaftarGuru(
  data
) {

  const container =
    el("daftarGuru");


  if (!container) {

    return;

  }


  const total =
    data.length;


  const aktif =
    data.filter(
      function(guru) {

        return String(
          guru.aktif || ""
        ).toUpperCase() === "YA";

      }
    ).length;


  if (el("totalGuru")) {

    el("totalGuru").textContent =
      total;

  }


  if (el("guruAktif")) {

    el("guruAktif").textContent =
      aktif;

  }


  if (el("guruNonaktif")) {

    el("guruNonaktif").textContent =
      total - aktif;

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
          guru.aktif || ""
        ).toUpperCase() === "YA";


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
                  escapeHtml(guru.nip)
                : ""
            }

          </div>


          <div class="guru-code">

            ${escapeHtml(
              guru.kodeQR || ""
            )}

          </div>


          <div class="guru-status">

            ${
              aktif
                ? "🟢 Aktif"
                : "🔴 Nonaktif"
            }

          </div>


          <div class="guru-actions">

            <button
              class="qr-button"
              onclick="tampilkanQR(
                '${escapeJs(guru.kodeQR)}',
                '${escapeJs(guru.nama)}'
              )"
            >

              📷 QR

            </button>


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

          </div>

        </div>

      `;

    }
  );


  container.innerHTML =
    html;

}


/* ==========================================================
   TAMBAH GURU
========================================================== */

function simpanGuru() {

  const nip =
    el("guruNip")?.value.trim() || "";


  const nama =
    el("guruNama")?.value.trim() || "";


  const jabatan =
    el("guruJabatan")?.value.trim() || "";


  const jp =
    el("guruJP")?.value.trim() || "";


  const message =
    el("tambahGuruMessage");


  if (!message) {

    return;

  }


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


  if (Number(jp) < 0) {

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
                result.nama || nama
              )}
            </strong>

            <br>

            JP:
            ${escapeHtml(
              result.jp ?? jp
            )}
            JP

            <br><br>

            Kode QR:

            <strong>

              ${escapeHtml(
                result.kodeQR || ""
              )}

            </strong>

          </div>

        `;


        [
          "guruNip",
          "guruNama",
          "guruJabatan",
          "guruJP"
        ]
        .forEach(
          function(id) {

            if (el(id)) {

              el(id).value = "";

            }

          }
        );


        muatDaftarGuru();


        if (result.kodeQR) {

          setTimeout(
            function() {

              tampilkanQR(
                result.kodeQR,
                result.nama || nama
              );

            },
            300
          );

        }

      } else {

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


/* ==========================================================
   UBAH STATUS
========================================================== */

function ubahStatus(
  kodeQR,
  status
) {

  if (
    !confirm(
      status === "YA"
        ? "Aktifkan guru ini?"
        : "Nonaktifkan guru ini?"
    )
  ) {

    return;

  }


  panggilAPI(

    {
      action: "ubahStatusGuru",

      kodeQR: kodeQR,

      status: status

    },

    function(result) {

      if (
        result &&
        result.sukses === true
      ) {

        muatDaftarGuru();

      } else {

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


/* ==========================================================
   QR GURU
========================================================== */

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
        alt="QR Guru"
      >


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
        )"
      >

        🖨️ CETAK QR

      </button>


      <br><br>


      <button
        class="danger-button"
        onclick="tutupQR()"
      >

        TUTUP

      </button>

    </div>

  `;


  document.body.appendChild(
    modal
  );

}


function tutupQR() {

  const modal =
    el("qrModal");


  if (modal) {

    modal.remove();

  }

}


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

      <title>QR Guru</title>

      <style>

        body {
          font-family: Arial;
          text-align: center;
          padding: 30px;
        }

        h1 {
          color: #075c43;
        }

        img {
          width: 350px;
          height: 350px;
        }

        .kode {
          font-size: 24px;
          font-family: monospace;
          font-weight: bold;
          letter-spacing: 4px;
          margin: 15px;
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
        src="${qrURL}"
      >

      <div class="kode">

        ${escapeHtml(kodeQR)}

      </div>

      <script>

        window.onload = function() {

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


/* ==========================================================
   SCANNER QR
========================================================== */

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


  if (
    !reader ||
    !scannerContent
  ) {

    sedangScan =
      false;

    return;

  }


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


  if (batal) {

    batal.classList.remove(
      "hidden"
    );

  }


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
                ) * 0.72
              );


            return {

              width: size,

              height: size

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

        // Abaikan error scan sementara.

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


    if (batal) {

      batal.classList.add(
        "hidden"
      );

    }


    scannerContent
      .classList
      .remove("hidden");


    tampilErrorScanner(
      error.message
    );

  }

}


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

    console.log(error);

  }


  try {

    qrScanner.clear();

  }

  catch(error) {

    console.log(error);

  }


  qrScanner =
    null;


  sedangScan =
    false;

}


function batalScan() {

  hentikanScanner();


  if (el("qr-reader")) {

    el("qr-reader")
      .classList
      .add("hidden");

  }


  if (el("batalScanButton")) {

    el("batalScanButton")
      .classList
      .add("hidden");

  }


  if (el("scannerContent")) {

    el("scannerContent")
      .classList
      .remove("hidden");

  }

}


/* ==========================================================
   PROSES ABSENSI
========================================================== */

function prosesKodeQR(
  kodeQR
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


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


function tampilkanHasilAbsensi(
  result
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


  hasil
    .classList
    .remove("hidden");


  hasil.style.background =
    "";


  hasil.style.color =
    "";


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
        onclick="suaraBerhasil()"
      >

        🔊 ABSENSI BERHASIL

      </button>


      <br><br>


      <button
        class="primary-button"
        onclick="mulaiScan()"
      >

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
        onclick="mulaiScan()"
      >

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


function tampilError(
  pesan
) {

  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


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
      style="background:#dc3545"
    >

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
      onclick="mulaiScan()"
    >

      📷 COBA LAGI

    </button>

  `;

}


function tampilErrorScanner(
  pesan
) {

  const reader =
    el("qr-reader");


  if (reader) {

    reader.classList.add(
      "hidden"
    );

  }


  const hasil =
    el("hasilAbsensi");


  if (!hasil) {

    return;

  }


  hasil
    .classList
    .remove("hidden");


  hasil.innerHTML = `

    <div
      class="result-icon"
      style="background:#dc3545"
    >

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
      onclick="mulaiScan()"
    >

      📷 COBA LAGI

    </button>

  `;

}


function suaraBerhasil() {

  try {

    if (
      !window.speechSynthesis
    ) {

      return;

    }


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


    window.speechSynthesis.speak(
      suara
    );

  }

  catch(error) {

    console.log(error);

  }

}


/* ==========================================================
   REKAP BULANAN
========================================================== */

function tampilkanRekap() {

  const bulan =
    el("bulanRekap")?.value || "";


  const hasil =
    el("hasilRekap");


  const message =
    el("rekapMessage");


  if (!hasil) {

    return;

  }


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


  if (message) {

    message.innerHTML =
      "";

  }


  panggilAPI(

    {
      action: "rekap",

      bulan: bulan

    },

    function(result) {

      console.log(
        "HASIL REKAP:",
        result
      );


      if (
        !result ||
        result.sukses === false
      ) {

        hasil.innerHTML = `

          <div class="admin-message-error">

            ✕ ${
              escapeHtml(
                result &&
                result.pesan
                  ? result.pesan
                  : "Gagal mengambil data rekap."
              )
            }

          </div>

        `;

        return;

      }


      const dataAbsensi =

        Array.isArray(
          result.data
        )
          ? result.data

          : Array.isArray(
              result.hasil
            )
            ? result.hasil

            : Array.isArray(
                result
              )
              ? result

              : [];


      if (
        !Array.isArray(
          dataAbsensi
        )
      ) {

        hasil.innerHTML = `

          <div class="admin-message-error">

            ✕ Format data rekap tidak sesuai.

          </div>

        `;

        return;

      }


      if (
        dataAbsensi.length === 0
      ) {

        hasil.innerHTML = `

          <div class="loading">

            Belum ada data absensi pada bulan ini.

          </div>

        `;

        return;

      }


      /*
       * =====================================================
       * FALLBACK JP
       *
       * Jika Kode.gs sudah mengirim row.jp,
       * langsung gunakan row.jp.
       *
       * Jika belum, ambil dari getGuru().
       * =====================================================
       */

      function buatTabel(
        daftarGuru
      ) {

        const jpGuru = {};


        if (
          Array.isArray(
            daftarGuru
          )
        ) {

          daftarGuru.forEach(
            function(guru) {

              const nip =
                String(
                  guru.nip || ""
                ).trim();


              const nama =
                String(
                  guru.nama || ""
                )
                  .trim()
                  .toLowerCase();


              const jp =
                Number(
                  guru.jp ?? 0
                ) || 0;


              if (nip) {

                jpGuru[
                  "nip:" + nip
                ] = jp;

              }


              if (nama) {

                jpGuru[
                  "nama:" + nama
                ] = jp;

              }

            }
          );

        }


        const rekapGuru = {};


        dataAbsensi.forEach(
          function(row) {

            const nama =
              String(
                row.nama || "-"
              ).trim();


            const nip =
              String(
                row.nip || ""
              ).trim();


            const key =
              nip
                ? "nip:" + nip
                : "nama:" +
                  nama.toLowerCase();


            /*
             * UTAMAKAN JP DARI BACKEND
             */

            let jp = 0;


            if (
              row.jp !== undefined &&
              row.jp !== null &&
              String(
                row.jp
              ).trim() !== ""
            ) {

              jp =
                Number(
                  row.jp
                ) || 0;

            }

            else if (
              jpGuru[key] !== undefined
            ) {

              jp =
                Number(
                  jpGuru[key]
                ) || 0;

            }

            else if (
              jpGuru[
                "nama:" +
                nama.toLowerCase()
              ] !== undefined
            ) {

              jp =
                Number(
                  jpGuru[
                    "nama:" +
                    nama.toLowerCase()
                  ]
                ) || 0;

            }


            if (!rekapGuru[key]) {

              rekapGuru[key] = {

                nama:
                  nama,

                nip:
                  nip,

                jabatan:
                  String(
                    row.jabatan || ""
                  ),

                jp:
                  jp,

                hadir:
                  0,

                terlambat:
                  0,

                tidak:
                  0

              };

            }


            /*
             * Jika baris berikutnya
             * punya JP, gunakan JP tersebut.
             */

            if (
              row.jp !== undefined &&
              row.jp !== null &&
              String(
                row.jp
              ).trim() !== ""
            ) {

              rekapGuru[key].jp =
                Number(
                  row.jp
                ) || 0;

            }


            const status =
              String(
                row.status || ""
              )
                .trim()
                .toUpperCase();


            if (
              status === "HADIR"
            ) {

              rekapGuru[key]
                .hadir++;

            }

            else if (
              status === "TERLAMBAT"
            ) {

              rekapGuru[key]
                .terlambat++;

            }

            else if (
              status === "TIDAK"
            ) {

              rekapGuru[key]
                .tidak++;

            }

          }
        );


        const daftarRekap =
          Object.values(
            rekapGuru
          );


        if (
          daftarRekap.length === 0
        ) {

          hasil.innerHTML = `

            <div class="loading">

              Belum ada data absensi pada bulan ini.

            </div>

          `;

          return;

        }


        let html = `

          <div
            class="rekap-summary"
            style="
              margin-bottom:15px;
              font-weight:bold;
              color:#087f5b;
            "
          >

            📊 Rekap Kehadiran
            ${escapeHtml(bulan)}

          </div>


          <div
            style="overflow-x:auto;"
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
                    JP/Hari
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


        daftarRekap.forEach(
          function(row) {

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


            const jp =
              Number(
                row.jp || 0
              );


            /*
             * HADIR + TERLAMBAT
             * dianggap hari mengajar.
             */

            const hariDihitung =
              hadir +
              terlambat;


            const totalJP =
              hariDihitung *
              jp;


            html += `

              <tr>

                <td>

                  <strong>

                    ${escapeHtml(
                      row.nama
                    )}

                  </strong>

                  ${
                    row.nip
                      ? `
                        <br>

                        <small>

                          NIP:
                          ${escapeHtml(
                            row.nip
                          )}

                        </small>
                      `
                      : ""
                  }

                </td>


                <td>

                  ${jp}

                </td>


                <td>

                  <strong>

                    ${hadir}

                  </strong>

                </td>


                <td>

                  ${terlambat}

                </td>


                <td>

                  ${tidak}

                </td>


                <td>

                  <strong
                    style="
                      color:#087f5b;
                    "
                  >

                    ${totalJP}

                  </strong>

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


      /*
       * Kalau backend sudah mengirim JP,
       * langsung tampilkan.
       */

      const backendMengirimJP =
        dataAbsensi.some(
          function(row) {

            return (

              row &&

              row.jp !== undefined &&

              row.jp !== null &&

              String(
                row.jp
              ).trim() !== ""

            );

          }
        );


      if (
        backendMengirimJP
      ) {

        buatTabel([]);

        return;

      }


      /*
       * Fallback:
       * ambil data guru.
       */

      panggilAPI(

        {
          action: "getGuru"
        },

        function(guruResult) {

          console.log(
            "DATA GURU UNTUK JP:",
            guruResult
          );


          let daftarGuru = [];


          if (
            Array.isArray(
              guruResult
            )
          ) {

            daftarGuru =
              guruResult;

          }

          else if (
            guruResult &&
            Array.isArray(
              guruResult.data
            )
          ) {

            daftarGuru =
              guruResult.data;

          }

          else if (
            guruResult &&
            Array.isArray(
              guruResult.hasil
            )
          ) {

            daftarGuru =
              guruResult.hasil;

          }


          buatTabel(
            daftarGuru
          );

        }

      );

    }

  );

}


/* ==========================================================
   EXPORT EXCEL
========================================================== */

function exportExcel() {

  const bulan =
    el("bulanRekap")?.value || "";


  const message =
    el("rekapMessage");


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  if (message) {

    message.innerHTML = `

      <div class="loading">

        ⏳ Menyiapkan file Excel...

      </div>

    `;

  }


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

        if (message) {

          message.innerHTML = `

            <div class="admin-message-success">

              ✓ File Excel berhasil dibuat.

              <br><br>

              <a
                href="${escapeHtml(
                  result.url
                )}"
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

      } else {

        if (message) {

          message.innerHTML = `

            <div class="admin-message-error">

              ✕ ${
                escapeHtml(
                  result &&
                  result.pesan
                    ? result.pesan
                    : "Gagal membuat file Excel."
                )
              }

            </div>

          `;

        }

      }

    }

  );

}


/* ==========================================================
   EXPORT PDF
========================================================== */

function exportPDF() {

  const bulan =
    el("bulanRekap")?.value || "";


  const message =
    el("rekapMessage");


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  if (message) {

    message.innerHTML = `

      <div class="loading">

        ⏳ Menyiapkan file PDF...

      </div>

    `;

  }


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

        if (message) {

          message.innerHTML = `

            <div class="admin-message-success">

              ✓ File PDF berhasil dibuat.

              <br><br>

              <a
                href="${escapeHtml(
                  result.url
                )}"
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

      } else {

        if (message) {

          message.innerHTML = `

            <div class="admin-message-error">

              ✕ ${
                escapeHtml(
                  result &&
                  result.pesan
                    ? result.pesan
                    : "Gagal membuat file PDF."
                )
              }

            </div>

          `;

        }

      }

    }

  );

}


/* ==========================================================
   SAAT HALAMAN DIMUAT
========================================================== */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    const bulan =
      el("bulanRekap");


    if (
      bulan &&
      !bulan.value
    ) {

      const sekarang =
        new Date();


      bulan.value =
        sekarang.getFullYear() +
        "-" +
        String(
          sekarang.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

    }

  }
);
