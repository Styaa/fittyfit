@file:Suppress("UNUSED_VARIABLE", "DEPRECATION")

package expo.modules.shadowlock

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.AlarmClock
import android.provider.Settings
import android.provider.Telephony
import android.telecom.TelecomManager
import android.view.inputmethod.InputMethodManager

/**
 * Aplikasi yang TIDAK PERNAH dikunci: telepon, SMS, alarm, peta, pengaturan,
 * ditambah komponen sistem yang wajib (UI sistem, keyboard, layar izin, panggilan masuk).
 */
object AllowList {
  private val BASE = setOf(
    "android",
    "com.android.systemui",
    // pengaturan
    "com.android.settings",
    "com.samsung.android.settings",
    // telepon & panggilan (termasuk layar panggilan masuk & darurat)
    "com.android.phone",
    "com.android.server.telecom",
    "com.android.incallui",
    "com.android.dialer",
    "com.google.android.dialer",
    "com.samsung.android.dialer",
    "com.samsung.android.incallui",
    "com.android.emergency",
    "com.google.android.apps.safetyhub",
    // SMS
    "com.android.mms",
    "com.google.android.apps.messaging",
    "com.samsung.android.messaging",
    // alarm / jam
    "com.android.deskclock",
    "com.google.android.deskclock",
    "com.sec.android.app.clockpackage",
    // peta
    "com.google.android.apps.maps",
    // dialog izin & pemasang paket (agar izin tetap bisa diberikan)
    "com.android.permissioncontroller",
    "com.google.android.permissioncontroller",
    "com.android.packageinstaller",
    "com.google.android.packageinstaller",
  )

  fun packages(ctx: Context): Set<String> {
    val out = HashSet(BASE)
    out.add(ctx.packageName)
    val pm = ctx.packageManager
    fun addResolved(intent: Intent) {
      try {
        pm.queryIntentActivities(intent, 0).forEach { out.add(it.activityInfo.packageName) }
      } catch (e: Exception) {
      }
    }
    addResolved(Intent(Intent.ACTION_DIAL))
    addResolved(Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:")))
    addResolved(Intent(AlarmClock.ACTION_SHOW_ALARMS))
    addResolved(Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0")))
    addResolved(Intent(Settings.ACTION_SETTINGS))
    try {
      (ctx.getSystemService(Context.TELECOM_SERVICE) as? TelecomManager)?.defaultDialerPackage?.let { out.add(it) }
    } catch (e: Exception) {
    }
    try {
      Telephony.Sms.getDefaultSmsPackage(ctx)?.let { out.add(it) }
    } catch (e: Exception) {
    }
    // keyboard aktif harus tetap bisa muncul (mis. saat mengetik kalimat buka darurat)
    try {
      (ctx.getSystemService(Context.INPUT_METHOD_SERVICE) as? InputMethodManager)
        ?.enabledInputMethodList
        ?.forEach { out.add(it.packageName) }
    } catch (e: Exception) {
    }
    return out
  }

  /** Buka aplikasi yang diizinkan dari layar lockdown */
  fun open(ctx: Context, kind: String): Boolean {
    val intent: Intent = when (kind) {
      "dialer" -> Intent(Intent.ACTION_DIAL)
      "sms" -> Intent.makeMainSelectorActivity(Intent.ACTION_MAIN, Intent.CATEGORY_APP_MESSAGING)
      "alarm" -> Intent(AlarmClock.ACTION_SHOW_ALARMS)
      "maps" -> Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q="))
      "settings" -> Intent(Settings.ACTION_SETTINGS)
      else -> return false
    }
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    return try {
      ctx.startActivity(intent)
      true
    } catch (e: Exception) {
      if (kind == "sms") {
        try {
          val pkg = Telephony.Sms.getDefaultSmsPackage(ctx)
          val launch = pkg?.let { ctx.packageManager.getLaunchIntentForPackage(it) }
          if (launch != null) {
            launch.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            ctx.startActivity(launch)
            return true
          }
        } catch (e: Exception) {
        }
      }
      false
    }
  }
}
