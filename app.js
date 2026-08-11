// ==========================================
// ABSENSI GURU
// MTs. BADRIL HUDA
// ==========================================

// PIN sementara untuk tampilan awal.
// Nanti akan diganti dengan login Admin dari Google Sheet.
const ADMIN_PIN = "123456";


// ==========================================
// PINDAH HALAMAN
// ==========================================

function sembunyikanSemua() {

  document.querySelectorAll(".page").forEach(function(page) {
    page.classList.add("hidden");
  });

}


function bukaAdmin() {

  sembunyikanSemua();

  document
    .getElementById("adminPage")
    .classList
    .remove("hidden");

}


function bukaGuru() {

  sembunyikanSemua();

  document
    .getElementById("guruPage")
    .classList
    .remove("hidden");

}


function bukaRekap() {

  sembunyikanSemua();

  document
    .getElementById("rekapPage")
    .classList
    .remove("hidden");

}


function kembaliHome() {

  sembunyikanSemua();

  document
    .getElementById("homePage")
    .classList
    .remove("hidden");

}


// ==========================================
// LOGIN ADMIN
// ==========================================

function loginAdmin() {

  const pin =
    document
      .getElementById("adminPin")
      .value
      .trim();

  const message =
    document
      .getElementById("loginMessage");


  if (!pin) {

    message.innerHTML =
      "<p style='color:#dc3545'>PIN belum diisi.</p>";

    return;

  }


  if (pin === ADMIN_PIN) {

    message.innerHTML =
      "<p style='color:#087f5b'>✓ Login berhasil.</p>";


    setTimeout(function() {

      bukaHalamanAdmin();

    }, 500);

  } else {

    message.innerHTML =
      "<p style='color:#dc3545'>✕ PIN Admin salah.</p>";

  }

}


function bukaHalamanAdmin() {

  alert(
    "Halaman Admin akan kita hubungkan ke Google Sheet."
  );

}


// ==========================================
// SCAN QR
// ==========================================

function mulaiScan() {

  alert(
    "Scanner QR akan kita aktifkan pada tahap berikutnya."
  );

}


// ==========================================
// REKAP
// ==========================================

function tampilkanRekap() {

  const bulan =
    document
      .getElementById("bulanRekap")
      .value;


  if (!bulan) {

    alert(
      "Silakan pilih bulan terlebih dahulu."
    );

    return;

  }


  document
    .getElementById("hasilRekap")
    .innerHTML = `

      <div style="
        margin-top:15px;
        padding:15px;
        background:#f0f8f5;
        border-radius:12px;
        color:#087f5b;
      ">

        Rekap bulan
        <strong>${bulan}</strong>

        <br><br>

        Fitur rekap akan kita hubungkan
        dengan Google Sheet.

      </div>

    `;

}


// ==========================================
// BULAN DEFAULT
// ==========================================

window.addEventListener(
  "DOMContentLoaded",
  function() {

    const sekarang = new Date();

    const bulan =
      sekarang.getFullYear() +
      "-" +
      String(
        sekarang.getMonth() + 1
      ).padStart(2, "0");


    const input =
      document.getElementById("bulanRekap");


    if (input) {

      input.value = bulan;

    }

  }
);
