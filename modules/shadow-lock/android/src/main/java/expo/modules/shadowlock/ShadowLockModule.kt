package expo.modules.shadowlock

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.text.TextUtils
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ShadowLockModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ShadowLock")

    /** Apakah layanan aksesibilitas Shadow Fit Lockdown sudah diaktifkan pengguna */
    Function("isServiceEnabled") {
      val expected = ComponentName(context, ShadowLockService::class.java)
      val enabled = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
      val splitter = TextUtils.SimpleStringSplitter(':')
      splitter.setString(enabled)
      var found = false
      while (splitter.hasNext()) {
        val cn = ComponentName.unflattenFromString(splitter.next())
        if (cn != null && cn == expected) {
          found = true
          break
        }
      }
      found
    }

    Function("openAccessibilitySettings") {
      val i = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(i)
    }

    /** Halaman info aplikasi (untuk "Izinkan setelan terbatas" di Android 13+) */
    Function("openAppDetails") {
      val i = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + context.packageName))
        .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(i)
    }

    Function("setConfig") { enabled: Boolean, hour: Int, minute: Int, days: List<Int>, unlocked: List<String> ->
      LockPolicy.prefs(context).edit()
        .putBoolean(LockPolicy.KEY_ENABLED, enabled)
        .putInt(LockPolicy.KEY_HOUR, hour)
        .putInt(LockPolicy.KEY_MINUTE, minute)
        .putStringSet(LockPolicy.KEY_DAYS, days.map { it.toString() }.toSet())
        .putStringSet(LockPolicy.KEY_UNLOCKED, unlocked.toSet())
        .apply()
    }

    /** Mode uji: kunci paksa selama N detik */
    Function("startTest") { seconds: Int ->
      LockPolicy.prefs(context).edit()
        .putLong(LockPolicy.KEY_TEST_UNTIL, System.currentTimeMillis() + seconds * 1000L)
        .apply()
    }

    Function("stopTest") {
      LockPolicy.prefs(context).edit().putLong(LockPolicy.KEY_TEST_UNTIL, 0L).apply()
    }

    Function("isLockedNow") {
      LockPolicy.isLockedNow(context)
    }

    Function("openApp") { kind: String ->
      AllowList.open(context, kind)
    }
  }
}
