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


/* =====================================================
   HALAMAN
===================================================== */

function sembunyikanSemua() {

  document
    .querySelectorAll(".page")
    .forEach(
      function(page) {

        page.classList.add(
          "hidden"
        );

      }
    );

}


function kembaliHome() {

  hentikanScanner();

  tutupQR();

  sembunyikanSemua();

  const home =
    el("homePage");

  if (home) {

    home.classList.remove(
      "hidden"
    );

  }

}


function bukaAdmin() {

  hentikanScanner();

  tutupQR();

  sembunyikanSemua();

  const page =
    el("adminPage");

  if (page) {

    page.classList.remove(
      "hidden"
    );

  }


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

  tutupQR();

  sembunyikanSemua();

  const page =
    el("guruPage");

  if (page) {

    page.classList.remove(
      "hidden"
    );

  }

}


function bukaRekap() {

  hentikanScanner();

  tutupQR();

  sembunyikanSemua();

  const page =
    el("rekapPage");

  if (page) {

    page.classList.remove(
      "hidden"
    );

  }

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
   * Ini mencegah masalah CSS hidden.
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

    el("adminPin").value =
      "";

  }


  if (el("loginMessage")) {

    el("loginMessage").innerHTML =
      "";

  }

}


/* =====================================================
   LOGIN ADMIN
   PENTING:
   ACTION HARUS loginAdmin
===================================================== */

function loginAdmin() {

  const pinInput =
    el("adminPin");

  const message =
    el("loginMessage");


  if (
    !pinInput ||
    !message
  ) {

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


  /*
   * JANGAN diganti menjadi "login".
   *
   * Code.gs menggunakan:
   *
   * action === 'loginAdmin'
   */

  panggilAPI(

    {

      action:
        "loginAdmin",

      pin:
        pin

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

          <div
            class="admin-message-success"
          >

            ✓ Login berhasil.

          </div>

        `;


        tampilkanPanelAdmin();

      }

      else {

        message.innerHTML = `

          <div
            class="admin-message-error"
          >

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
   * Login disembunyikan.
   */

  if (loginBox) {

    loginBox.style.display =
      "none";

  }


  /*
   * Panel Admin ditampilkan.
   */

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
      Math.random() *
      99999
    );


  window[callbackName] =
    function(result) {

      try {

        callback(
          result
        );

      }

      catch(error) {

        console.error(
          "Callback error:",
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

        sukses:
          false,

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

      action:
        "getGuru"

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

      let data = [];


      if (
        Array.isArray(result)
      ) {

        data =
          result;

      }

      else if (
        result &&
        Array.isArray(
          result.data
        )
      ) {

        data =
          result.data;

      }

      else if (
        result &&
        Array.isArray(
          result.hasil
        )
      ) {

        data =
          result.hasil;

      }


      if (
        !Array.isArray(data)
      ) {

        container.innerHTML = `

          <div
            class="admin-message-error"
          >

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


/* =====================================================
   TAMPILKAN GURU
===================================================== */

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
          guru.aktif ||
          ""
        )
          .toUpperCase() ===
          "YA";

      }
    ).length;


  const nonaktif =
    total -
    aktif;


  if (
    el("totalGuru")
  ) {

    el("totalGuru")
      .textContent =
      total;

  }


  if (
    el("guruAktif")
  ) {

    el("guruAktif")
      .textContent =
      aktif;

  }


  if (
    el("guruNonaktif")
  ) {

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


  let html =
    "";


  data.forEach(
    function(guru) {

      const aktif =
        String(
          guru.aktif ||
          ""
        )
          .toUpperCase() ===
          "YA";


      const status =
        aktif
          ? "🟢 Aktif"
          : "🔴 Nonaktif";


      const statusBaru =
        aktif
          ? "TIDAK"
          : "YA";


      html += `

        <div
          class="guru-item"
        >

          <div
            class="guru-name"
          >

            ${escapeHtml(
              guru.nama
            )}

          </div>


          <div
            class="guru-info"
          >

            ${escapeHtml(
              guru.jabatan ||
              "Guru"
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


          <div
            class="guru-code"
          >

            ${escapeHtml(
              guru.kodeQR ||
              ""
            )}

          </div>


          <div
            class="guru-status"
          >

            ${status}

          </div>


          <div
            class="guru-actions"
          >

            <!-- =========================
                 TOMBOL QR
            ========================== -->

            <button
              class="qr-button"
              onclick="tampilkanQR(
                '${escapeJs(
                  guru.kodeQR
                )}',
                '${escapeJs(
                  guru.nama
                )}'
              )"
            >

              📷 QR

            </button>


            <!-- =========================
                 TOMBOL STATUS
            ========================== -->

            <button
              class="status-button"
              onclick="ubahStatus(
                '${escapeJs(
                  guru.kodeQR
                )}',
                '${statusBaru}'
              )"
            >

              ${
                aktif
                  ? "NONAKTIFKAN"
                  : "AKTIFKAN"
              }

            </button>


            <!-- =========================
                 TOMBOL DELETE
            ========================== -->

            <button
              class="delete-button"
              onclick="hapusGuru(
                '${escapeJs(
                  guru.kodeQR
                )}',
                '${escapeJs(
                  guru.nama
                )}'
              )"
              style="
                background:#eeeeee;
                color:#222;
                border:none;
                cursor:pointer;
              "
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

      <div
        class="admin-message-error"
      >

        Nama guru wajib diisi.

      </div>

    `;

    return;

  }


  if (jp === "") {

    message.innerHTML = `

      <div
        class="admin-message-error"
      >

        JP / Hari wajib diisi.

      </div>

    `;

    return;

  }


  if (
    Number(jp) < 0
  ) {

    message.innerHTML = `

      <div
        class="admin-message-error"
      >

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

      action:
        "tambahGuru",

      nip:
        nip,

      nama:
        nama,

      jabatan:
        jabatan,

      jp:
        jp

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

          <div
            class="admin-message-success"
          >

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


        if (
          el("guruNip")
        ) {

          el("guruNip")
            .value = "";

        }


        if (
          el("guruNama")
        ) {

          el("guruNama")
            .value = "";

        }


        if (
          el("guruJabatan")
        ) {

          el("guruJabatan")
            .value = "";

        }


        if (
          el("guruJP")
        ) {

          el("guruJP")
            .value = "";

        }


        muatDaftarGuru();


        /*
         * Setelah guru berhasil dibuat,
         * langsung tampilkan QR baru.
         */

        if (
          result.kodeQR
        ) {

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

      }

      else {

        message.innerHTML = `

          <div
            class="admin-message-error"
          >

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

      /*
       * SESUAI DENGAN Code.gs
       */
      action:
        "ubahStatusGuru",

      kodeQR:
        kodeQR,

      status:
        status

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
   DELETE GURU
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

      "HAPUS DATA GURU?\n\n" +

      "Nama: " +
      nama +
      "\n" +

      "Kode QR: " +
      kodeQR +
      "\n\n" +

      "Data guru akan dihapus dari daftar Guru.\n" +

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

        ⏳ Menghapus data guru...

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
   QR CODE GURU
   MODAL DIBUAT LANGSUNG OLEH APP.JS
   TIDAK MEMBUTUHKAN qrModal / qrCodeContainer
   DARI index.html
===================================================== */


/* =====================================================
   TAMPILKAN QR GURU
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
   * Hapus modal QR lama jika masih ada.
   *
   * Dengan cara ini kita tidak menggunakan
   * modal QR versi lama dari index.html.
   */

  const modalLama =
    document.getElementById(
      "qrGuruModal"
    );


  if (modalLama) {

    modalLama.remove();

  }


  /*
   * Buat modal baru
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

    padding:20px;

    background:
      rgba(0,0,0,0.68);

    box-sizing:border-box;

  `;


  /*
   * Card QR
   */

  const card =
    document.createElement(
      "div"
    );


  card.style.cssText = `

    width:100%;

    max-width:430px;

    max-height:95vh;

    overflow-y:auto;

    box-sizing:border-box;

    background:#ffffff;

    border-radius:22px;

    padding:25px;

    text-align:center;

    box-shadow:
      0 20px 60px
      rgba(0,0,0,0.35);

  `;


  /*
   * Judul dan container QR
   */

  card.innerHTML = `

    <div
      style="
        font-size:25px;
        font-weight:800;
        color:#007f5f;
        margin-bottom:8px;
      "
    >

      QR ABSENSI GURU

    </div>


    <div
      style="
        font-size:18px;
        font-weight:700;
        color:#222;
        line-height:1.4;
        margin-bottom:5px;
      "
    >

      ${escapeHtml(
        nama
      )}

    </div>


    <div
      style="
        font-size:14px;
        color:#777;
        margin-bottom:18px;
      "
    >

      Kode QR:

      <strong>

        ${escapeHtml(
          kodeQR
        )}

      </strong>

    </div>


    <div
      id="qrGuruContainer"
      style="
        width:280px;
        height:280px;

        max-width:100%;

        margin:0 auto 18px;

        display:flex;

        align-items:center;

        justify-content:center;

        background:#ffffff;

        border:1px solid #e5e5e5;

        border-radius:14px;

        box-sizing:border-box;
      "
    >

      <div
        style="
          color:#777;
          font-size:14px;
        "
      >

        Membuat QR Code...

      </div>

    </div>


    <div
      style="
        font-size:13px;
        line-height:1.5;
        color:#666;
        margin-bottom:18px;
      "
    >

      Gunakan QR Code ini untuk
      absensi guru.

    </div>


    <div
      style="
        display:flex;
        gap:10px;
      "
    >

      <button
        type="button"
        id="btnCetakQRGuru"
        style="
          flex:1;
          border:0;
          border-radius:12px;
          padding:13px 10px;

          background:#087f5b;
          color:#ffffff;

          font-size:15px;
          font-weight:700;

          cursor:pointer;
        "
      >

        🖨️ CETAK

      </button>


      <button
        type="button"
        id="btnTutupQRGuru"
        style="
          flex:1;
          border:0;
          border-radius:12px;
          padding:13px 10px;

          background:#eeeeee;
          color:#222222;

          font-size:15px;
          font-weight:700;

          cursor:pointer;
        "
      >

        ✕ TUTUP

      </button>

    </div>

  `;


  modal.appendChild(
    card
  );


  document.body.appendChild(
    modal
  );


  /*
   * Container QR
   */

  const qrContainer =
    document.getElementById(
      "qrGuruContainer"
    );


  /*
   * Buat QR
   */

  buatQRGuru(
    qrContainer,
    kodeQR
  );


  /*
   * Tombol tutup
   */

  const tombolTutup =
    document.getElementById(
      "btnTutupQRGuru"
    );


  if (tombolTutup) {

    tombolTutup.onclick =
      function() {

        tutupQR();

      };

  }


  /*
   * Tombol cetak
   */

  const tombolCetak =
    document.getElementById(
      "btnCetakQRGuru"
    );


  if (tombolCetak) {

    tombolCetak.onclick =
      function() {

        cetakQRGuru(
          kodeQR,
          nama,
          qrContainer
        );

      };

  }


  /*
   * Klik area gelap di luar card
   */

  modal.onclick =
    function(event) {

      if (
        event.target ===
        modal
      ) {

        tutupQR();

      }

    };


  /*
   * ESC untuk menutup
   */

  document.addEventListener(
    "keydown",
    qrEscapeHandler
  );

}


/* =====================================================
   BUAT QR CODE
===================================================== */

function buatQRGuru(
  container,
  kodeQR
) {

  if (!container) {

    return;

  }


  container.innerHTML =
    "";


  /*
   * Pastikan library QRCode tersedia.
   */

  if (
    typeof QRCode ===
    "undefined"
  ) {

    container.innerHTML = `

      <div
        style="
          padding:20px;
          color:#c62828;
          font-size:14px;
          line-height:1.5;
        "
      >

        <strong>
          Library QR Code belum tersedia.
        </strong>

        <br><br>

        Kode QR:

        <strong>
          ${escapeHtml(
            kodeQR
          )}
        </strong>

      </div>

    `;

    console.error(
      "QRCode library tidak ditemukan."
    );

    return;

  }


  try {

    new QRCode(

      container,

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

  }

  catch(error) {

    console.error(
      "Gagal membuat QR Code:",
      error
    );


    container.innerHTML = `

      <div
        style="
          padding:20px;
          color:#c62828;
          font-size:14px;
        "
      >

        Gagal membuat QR Code.

        <br><br>

        ${escapeHtml(
          error.message
        )}

      </div>

    `;

  }

}


/* =====================================================
   TUTUP QR
   VERSI BARU
===================================================== */

function tutupQR() {

  const modal =
    document.getElementById(
      "qrGuruModal"
    );


  if (modal) {

    modal.remove();

  }


  document.removeEventListener(
    "keydown",
    qrEscapeHandler
  );

}


/* =====================================================
   ESCAPE UNTUK MODAL QR
===================================================== */

function qrEscapeHandler(
  event
) {

  if (
    event.key ===
    "Escape"
  ) {

    tutupQR();

  }

}


/* =====================================================
   CETAK QR GURU
===================================================== */

function cetakQRGuru(
  kodeQR,
  nama,
  container
) {

  if (!container) {

    alert(
      "Container QR tidak ditemukan."
    );

    return;

  }


  let sumberQR =
    "";


  /*
   * QRCode.js biasanya menghasilkan
   * canvas dan/atau img.
   */

  const canvas =
    container.querySelector(
      "canvas"
    );


  const img =
    container.querySelector(
      "img"
    );


  if (canvas) {

    try {

      sumberQR =
        canvas.toDataURL(
          "image/png"
        );

    }

    catch(error) {

      console.error(
        error
      );

    }

  }


  if (
    !sumberQR &&
    img &&
    img.src
  ) {

    sumberQR =
      img.src;

  }


  if (!sumberQR) {

    alert(
      "QR Code belum selesai dibuat. Silakan tunggu sebentar lalu coba lagi."
    );

    return;

  }


  /*
   * Buka jendela cetak
   */

  const win =
    window.open(
      "",
      "_blank",
      "width=650,height=750"
    );


  if (!win) {

    alert(
      "Popup diblokir browser. Izinkan popup untuk mencetak QR Code."
    );

    return;

  }


  win.document.open();


  win.document.write(`

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

          background:#ffffff;

          font-family:
            Arial,
            Helvetica,
            sans-serif;

          text-align:center;

        }


        .card {

          width:100%;

          max-width:450px;

          margin:0 auto;

          padding:30px;

          border:2px solid #222;

          border-radius:20px;

        }


        h1 {

          margin:0 0 10px;

          font-size:25px;

          color:#087f5b;

        }


        h2 {

          margin:5px 0 8px;

          font-size:20px;

          color:#222;

        }


        .kode-label {

          margin-bottom:20px;

          font-size:14px;

          color:#666;

        }


        .kode {

          font-weight:bold;

          letter-spacing:3px;

          color:#222;

        }


        .qr {

          width:300px;

          height:300px;

          max-width:100%;

          margin:0 auto;

        }


        .qr img {

          width:300px;

          height:300px;

          max-width:100%;

        }


        .info {

          margin-top:20px;

          font-size:14px;

          color:#555;

        }


        @media print {

          @page {

            margin:10mm;

          }


          body {

            padding:0;

          }


          .card {

            border:2px solid #222;

          }

        }

      </style>

    </head>


    <body>

      <div class="card">

        <h1>

          QR ABSENSI GURU

        </h1>


        <h2>

          ${escapeHtml(
            nama
          )}

        </h2>


        <div
          class="kode-label"
        >

          Kode QR:

          <span
            class="kode"
          >

            ${escapeHtml(
              kodeQR
            )}

          </span>

        </div>


        <div
          class="qr"
        >

          <img
            src="${sumberQR}"
            alt="QR Absensi Guru"
          >

        </div>


        <div
          class="info"
        >

          MTs. BADRIL HUDA

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


  win.document.close();

}


/* =====================================================
   TAMBAH GURU - RESET FORM
===================================================== */

function resetFormGuru() {

  const fields = [

    "guruNip",

    "guruNama",

    "guruJabatan",

    "guruJP"

  ];


  fields.forEach(
    function(id) {

      const input =
        el(id);


      if (input) {

        input.value =
          "";

      }

    }
  );


  const message =
    el(
      "tambahGuruMessage"
    );


  if (message) {

    message.innerHTML =
      "";

  }

}


/* =====================================================
   LOGOUT ADMIN
===================================================== */

function logoutAdmin() {

  if (
    !confirm(
      "Keluar dari Admin?"
    )
  ) {

    return;

  }


  adminSudahLogin =
    false;


  tutupQR();


  tampilkanLoginAdmin();

}

/* =====================================================
   SCANNER QR GURU
===================================================== */

function mulaiScanner() {

  const reader =
    el("reader");


  if (!reader) {

    alert(
      "Area scanner QR tidak ditemukan."
    );

    return;

  }


  hentikanScanner();


  sedangScan =
    true;


  reader.innerHTML =
    "";


  /*
   * Pastikan library Html5Qrcode tersedia.
   */

  if (
    typeof Html5Qrcode ===
    "undefined"
  ) {

    reader.innerHTML = `

      <div
        style="
          padding:20px;
          color:#c62828;
        "
      >

        Library scanner QR belum tersedia.

      </div>

    `;

    sedangScan =
      false;

    return;

  }


  qrScanner =
    new Html5Qrcode(
      "reader"
    );


  qrScanner
    .start(

      {
        facingMode:
          "environment"
      },

      {
        fps:
          10,

        qrbox:
          {
            width:250,
            height:250
          }

      },

      function(decodedText) {

        if (
          !sedangScan
        ) {

          return;

        }


        console.log(
          "QR TERBACA:",
          decodedText
        );


        hentikanScanner();


        prosesKodeQR(
          decodedText
        );

      },

      function(errorMessage) {

        /*
         * Error scan biasa tidak perlu
         * ditampilkan kepada pengguna.
         */

      }

    )

    .catch(
      function(error) {

        console.error(
          "Scanner error:",
          error
        );


        sedangScan =
          false;


        reader.innerHTML = `

          <div
            style="
              padding:20px;
              color:#c62828;
              line-height:1.5;
            "
          >

            <strong>
              Kamera tidak dapat digunakan.
            </strong>

            <br><br>

            Pastikan izin kamera
            sudah diberikan.

          </div>

        `;

      }
    );

}


/* =====================================================
   HENTIKAN SCANNER
===================================================== */

function hentikanScanner() {

  sedangScan =
    false;


  if (!qrScanner) {

    return;

  }


  try {

    qrScanner
      .stop()

      .then(
        function() {

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

        }
      )

      .catch(
        function(error) {

          console.log(
            "Scanner stop:",
            error
          );


          qrScanner =
            null;

        }
      );

  }

  catch(error) {

    console.log(
      "Scanner stop error:",
      error
    );


    qrScanner =
      null;

  }

}


/* =====================================================
   PROSES QR
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
   * Jika ada fungsi absensi yang sudah
   * disediakan oleh sistem lama,
   * gunakan fungsi tersebut.
   */

  if (
    typeof prosesAbsensiGuru ===
    "function"
  ) {

    prosesAbsensiGuru(
      kodeQR
    );

    return;

  }


  /*
   * Fallback:
   * tampilkan kode yang terbaca.
   */

  console.log(
    "Kode QR Guru:",
    kodeQR
  );


  const hasil =
    el("hasilScan");


  if (hasil) {

    hasil.innerHTML = `

      <div
        class="admin-message-success"
      >

        ✓ QR berhasil dibaca.

        <br><br>

        Kode:

        <strong>

          ${escapeHtml(
            kodeQR
          )}

        </strong>

      </div>

    `;

  }

}


/* =====================================================
   LOKASI / GPS
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

        const latitude =
          position.coords.latitude;


        const longitude =
          position.coords.longitude;


        const accuracy =
          position.coords.accuracy;


        callback({

          sukses:
            true,

          latitude:
            latitude,

          longitude:
            longitude,

          accuracy:
            accuracy

        });

      },

      function(error) {

        let pesan =
          "Lokasi tidak dapat diperoleh.";


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
          10000,

        maximumAge:
          0

      }

    );

}


/* =====================================================
   JARAK DUA KOORDINAT
===================================================== */

function hitungJarak(
  lat1,
  lon1,
  lat2,
  lon2
) {

  const R =
    6371000;


  const rad =
    Math.PI / 180;


  const dLat =
    (lat2 - lat1) *
    rad;


  const dLon =
    (lon2 - lon1) *
    rad;


  const a =

    Math.sin(
      dLat / 2
    ) *
    Math.sin(
      dLat / 2
    )

    +

    Math.cos(
      lat1 * rad
    ) *

    Math.cos(
      lat2 * rad
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


/* =====================================================
   FORMAT JARAK
===================================================== */

function formatJarak(
  jarak
) {

  jarak =
    Number(
      jarak
    );


  if (
    !Number.isFinite(
      jarak
    )
  ) {

    return "-";

  }


  if (
    jarak < 1000
  ) {

    return (
      Math.round(
        jarak
      ) +
      " meter"
    );

  }


  return (
    (jarak / 1000)
      .toFixed(2) +
    " km"
  );

}


/* =====================================================
   FORMAT WAKTU
===================================================== */

function formatTanggal(
  value
) {

  if (!value) {

    return "-";

  }


  try {

    const date =
      new Date(
        value
      );


    if (
      isNaN(
        date.getTime()
      )
    ) {

      return String(
        value
      );

    }


    return date
      .toLocaleString(
        "id-ID",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short"
        }
      );

  }

  catch(error) {

    return String(
      value
    );

  }

}


/* =====================================================
   REKAP ABSENSI
===================================================== */

function muatRekap() {

  const container =
    el("rekapData");


  if (!container) {

    return;

  }


  container.innerHTML = `

    <div class="loading">

      ⏳ Memuat rekap...

    </div>

  `;


  const tanggal =
    el("rekapTanggal");


  const nilaiTanggal =
    tanggal
      ? tanggal.value
      : "";


  panggilAPI(

    {

      action:
        "getRekap",

      tanggal:
        nilaiTanggal

    },

    function(result) {

      console.log(
        "HASIL REKAP:",
        result
      );


      let data = [];


      if (
        Array.isArray(
          result
        )
      ) {

        data =
          result;

      }

      else if (
        result &&
        Array.isArray(
          result.data
        )
      ) {

        data =
          result.data;

      }


      if (
        !data.length
      ) {

        container.innerHTML = `

          <div class="loading">

            Belum ada data absensi.

          </div>

        `;

        return;

      }


      let html = `

        <div
          style="
            overflow-x:auto;
          "
        >

          <table
            style="
              width:100%;
              border-collapse:collapse;
            "
          >

            <thead>

              <tr>

                <th>No</th>

                <th>Nama</th>

                <th>Waktu</th>

                <th>Status</th>

                <th>Jarak</th>

              </tr>

            </thead>

            <tbody>

      `;


      data.forEach(
        function(item,index) {

          html += `

            <tr>

              <td>

                ${index + 1}

              </td>


              <td>

                ${escapeHtml(
                  item.nama ||
                  item.Nama ||
                  "-"
                )}

              </td>


              <td>

                ${escapeHtml(
                  formatTanggal(
                    item.waktu ||
                    item.Waktu
                  )
                )}

              </td>


              <td>

                ${escapeHtml(
                  item.status ||
                  item.Status ||
                  "-"
                )}

              </td>


              <td>

                ${escapeHtml(
                  item.jarak ||
                  item.Jarak ||
                  "-"
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

  );

}


/* =====================================================
   DOWNLOAD / EXPORT
===================================================== */

function cetakHalaman() {

  window.print();

}


/* =====================================================
   EVENT KEYBOARD
===================================================== */

document.addEventListener(
  "keydown",
  function(event) {

    /*
     * Jangan membuat handler QR kedua.
     * Modal QR ditangani oleh qrEscapeHandler.
     */

    if (
      event.key ===
      "Escape"
    ) {

      const qrModal =
        document.getElementById(
          "qrGuruModal"
        );


      if (qrModal) {

        tutupQR();

      }

    }

  }
);


/* =====================================================
   INISIALISASI
===================================================== */

function inisialisasiAplikasi() {

  console.log(
    "Aplikasi Absensi Guru dimulai..."
  );


  /*
   * Pastikan semua halaman
   * dalam kondisi awal.
   */

  document
    .querySelectorAll(
      ".page"
    )
    .forEach(
      function(page) {

        page.classList.add(
          "hidden"
        );

      }
    );


  /*
   * Tampilkan halaman utama.
   */

  const home =
    el("homePage");


  if (home) {

    home.classList.remove(
      "hidden"
    );

  }


  /*
   * Event tombol login admin
   */

  const tombolLogin =
    el("btnLoginAdmin");


  if (tombolLogin) {

    tombolLogin.onclick =
      loginAdmin;

  }


  /*
   * Event tombol logout
   */

  const tombolLogout =
    el("btnLogoutAdmin");


  if (tombolLogout) {

    tombolLogout.onclick =
      logoutAdmin;

  }


  /*
   * Event tombol scan.
   */

  const tombolScan =
    el("btnMulaiScan");


  if (tombolScan) {

    tombolScan.onclick =
      mulaiScanner;

  }


  /*
   * Event tombol berhenti scanner.
   */

  const tombolStopScan =
    el("btnStopScan");


  if (tombolStopScan) {

    tombolStopScan.onclick =
      hentikanScanner;

  }


  /*
   * Event rekap.
   */

  const tombolRekap =
    el("btnMuatRekap");


  if (tombolRekap) {

    tombolRekap.onclick =
      muatRekap;

  }

}


/* =====================================================
   DOM READY
===================================================== */

if (
  document.readyState ===
  "loading"
) {

  document.addEventListener(
    "DOMContentLoaded",
    inisialisasiAplikasi
  );

}

else {

  inisialisasiAplikasi();

}


/* =====================================================
   DEBUG
===================================================== */

console.log(
  "APP.JS berhasil dimuat."
);

console.log(
  "Login Admin menggunakan action: loginAdmin"
);

console.log(
  "QR Guru menggunakan modal internal app.js"
);

console.log(
  "Delete Guru menggunakan action: deleteGuru"
);
