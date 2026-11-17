package expo.modules.shadowlock

import android.content.Context
import android.content.SharedPreferences
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Locale

/**
 * Aturan lockdown, dibaca langsung oleh layanan aksesibilitas (tanpa JavaScript),
 * sehingga tetap berjalan walaupun aplikasi Shadow Fit sedang tertutup.
 * Konfigurasi ditulis dari JS lewat ShadowLockModule.setConfig().
 */
object LockPolicy {
  private const val PREFS = "shadow_lock"
  const val KEY_ENABLED = "enabled"
  const val KEY_HOUR = "hour"
  const val KEY_MINUTE = "minute"
  const val KEY_DAYS = "days" // hari latihan, ISO: 1 = Senin ... 7 = Minggu
  const val KEY_UNLOCKED = "unlocked" // tanggal yyyy-MM-dd yang sudah aman (latihan / Rest Pass / buka darurat)
  const val KEY_TEST_UNTIL = "testUntil" // mode uji: kunci paksa sampai waktu ini (epoch ms)

  fun prefs(ctx: Context): SharedPreferences = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun today(cal: Calendar = Calendar.getInstance()): String =
    SimpleDateFormat("yyyy-MM-dd", Locale.US).format(cal.time)

  /** Calendar.SUNDAY = 1 ... SATURDAY = 7  →  ISO Senin = 1 ... Minggu = 7 */
  fun isoDay(cal: Calendar): Int = ((cal.get(Calendar.DAY_OF_WEEK) + 5) % 7) + 1

  fun isLockedNow(ctx: Context): Boolean {
    val p = prefs(ctx)
    val now = System.currentTimeMillis()
    if (p.getLong(KEY_TEST_UNTIL, 0L) > now) return true
    if (!p.getBoolean(KEY_ENABLED, false)) return false
    val cal = Calendar.getInstance()
    val days = p.getStringSet(KEY_DAYS, emptySet()) ?: emptySet()
    if (!days.contains(isoDay(cal).toString())) return false
    val start = p.getInt(KEY_HOUR, 22) * 60 + p.getInt(KEY_MINUTE, 0)
    val nowMinutes = cal.get(Calendar.HOUR_OF_DAY) * 60 + cal.get(Calendar.MINUTE)
    if (nowMinutes < start) return false
    val unlocked = p.getStringSet(KEY_UNLOCKED, emptySet()) ?: emptySet()
    return !unlocked.contains(today(cal))
  }
}
