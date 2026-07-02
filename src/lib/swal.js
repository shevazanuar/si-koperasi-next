import Swal from "sweetalert2";

// Wrapper for all SweetAlert2 popups with premium custom styles
const swalCustom = Swal.mixin({
  customClass: {
    popup: "rounded-3xl p-6 shadow-2xl border border-gray-100 font-sans max-w-sm md:max-w-md",
    title: "text-lg md:text-xl font-black text-gray-900",
    htmlContainer: "text-xs md:text-sm text-gray-500 font-medium mt-2 leading-relaxed",
    confirmButton: "px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm outline-none transition-all active:scale-95 shadow-md shadow-blue-500/20 cursor-pointer inline-flex justify-center items-center gap-1",
    cancelButton: "px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm outline-none transition-all active:scale-95 cursor-pointer inline-flex justify-center items-center gap-1 ml-2",
  },
  buttonsStyling: false,
});

/**
 * Menampilkan alert sukses berupa toast di pojok kanan atas yang hilang otomatis.
 * @param {string} title - Judul pesan
 * @param {string} text - Konten pesan
 */
export const showSuccess = (title, text) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2500,
    timerProgressBar: true,
    icon: "success",
    title,
    text,
    iconColor: "#10b981", // Emerald 500
    customClass: {
      popup: "rounded-2xl p-3 shadow-xl border border-emerald-100 bg-white font-sans max-w-xs md:max-w-sm animate-in slide-in-from-right duration-300",
      title: "text-sm font-bold text-gray-900 text-left",
      htmlContainer: "text-xs text-gray-500 font-medium text-left mt-0.5",
    },
  });
};

/**
 * Menampilkan alert error/kesalahan.
 * @param {string} title - Judul kesalahan
 * @param {string} text - Penjelasan kesalahan
 */
export const showError = (title, text) => {
  return swalCustom.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Mengerti",
    iconColor: "#ef4444", // Red 500
  });
};

/**
 * Menampilkan alert peringatan/informasi.
 * @param {string} title - Judul pesan
 * @param {string} text - Konten pesan
 * @param {string} icon - Tipe ikon ('info' atau 'warning')
 */
export const showAlert = (title, text, icon = "info") => {
  return swalCustom.fire({
    title,
    text,
    icon,
    confirmButtonText: "Ok",
    iconColor: icon === "warning" ? "#f59e0b" : "#f59e0b",
  });
};

/**
 * Menampilkan konfirmasi aksi (seperti hapus data).
 * @param {string} title - Judul konfirmasi
 * @param {string} text - Penjelasan konfirmasi
 * @param {string} confirmText - Teks tombol setuju
 * @param {string} cancelText - Teks tombol batal
 * @returns {Promise<boolean>} - Mengembalikan true jika dikonfirmasi, false jika dibatalkan
 */
export const showConfirm = async (title, text, confirmText = "Ya, Hapus", cancelText = "Batal", isDanger = false, isSuccess = false) => {
  const result = await swalCustom.fire({
    title,
    text,
    icon: isSuccess ? "question" : "warning",
    iconColor: isDanger ? "#ef4444" : isSuccess ? "#10b981" : "#f59e0b", // Red 500 or Emerald 500 or Amber 500
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: "rounded-3xl p-6 shadow-2xl border border-gray-100 font-sans max-w-sm md:max-w-md",
      title: "text-lg md:text-xl font-black text-gray-900",
      htmlContainer: "text-xs md:text-sm text-gray-500 font-medium mt-2 leading-relaxed",
      confirmButton: isDanger
        ? "px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-sm outline-none transition-all active:scale-95 shadow-md shadow-red-500/20 cursor-pointer inline-flex justify-center items-center gap-1"
        : isSuccess
          ? "px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm outline-none transition-all active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer inline-flex justify-center items-center gap-1"
          : "px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm outline-none transition-all active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer inline-flex justify-center items-center gap-1",
      cancelButton: "px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-bold text-sm outline-none transition-all active:scale-95 cursor-pointer inline-flex justify-center items-center gap-1 ml-2",
    },
  });
  return result.isConfirmed;
};
