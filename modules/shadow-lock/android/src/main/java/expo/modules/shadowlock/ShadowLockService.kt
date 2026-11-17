package expo.modules.shadowlock
@file:Suppress("UNUSED_VARIABLE", "DEPRECATION")

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent

/**
 * Layanan aksesibilitas Shadow Fit Lockdown.
 * Hanya memakai NAMA PAKET aplikasi yang sedang dibuka; tidak membaca isi layar.
 * Jika lockdown aktif dan aplikasi itu tidak diizinkan, layar lockdown Shadow Fit dibuka di atasnya.
 */
class ShadowLockService : AccessibilityService() {
  private val handler = Handler(Looper.getMainLooper())
  private var allow: Set<String> = emptySet()
  private var allowLoadedAt = 0L
  private var lastLaunch = 0L
  private var lastPackage: String? = null

  private val ticker = object : Runnable {
    override fun run() {
      // pengecekan berkala: lockdown dimulai (22.00) saat pengguna sedang di aplikasi lain
      try {
        val pkg = rootInActiveWindow?.packageName?.toString() ?: lastPackage
        if (pkg != null) evaluate(pkg)
      } catch (e: Exception) {
      }
      handler.postDelayed(this, TICK_MS)
    }
  }

  override fun onServiceConnected() {
    super.onServiceConnected()
    refreshAllow(force = true)
    handler.removeCallbacks(ticker)
    handler.postDelayed(ticker, TICK_MS)
  }

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val pkg = event.packageName?.toString() ?: return
    lastPackage = pkg
    evaluate(pkg)
  }

  private fun refreshAllow(force: Boolean = false) {
    val now = System.currentTimeMillis()
    if (force || now - allowLoadedAt > ALLOW_REFRESH_MS) {
      allow = AllowList.packages(this)
      allowLoadedAt = now
    }
  }

  private fun evaluate(pkg: String) {
    if (!LockPolicy.isLockedNow(this)) return
    refreshAllow()
    if (allow.contains(pkg)) return
    val now = System.currentTimeMillis()
    if (now - lastLaunch < LAUNCH_COOLDOWN_MS) return
    lastLaunch = now
    openLockScreen()
  }

  private fun openLockScreen() {
    val deepLink = Intent(Intent.ACTION_VIEW, Uri.parse("shadowfit://lock")).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
    }
    try {
      startActivity(deepLink)
    } catch (e: Exception) {
      try {
        packageManager.getLaunchIntentForPackage(packageName)?.let {
          it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
          startActivity(it)
        }
      } catch (e: Exception) {
      }
    }
  }

  override fun onInterrupt() {}

  override fun onDestroy() {
    handler.removeCallbacks(ticker)
    super.onDestroy()
  }

  companion object {
    private const val TICK_MS = 20_000L
    private const val ALLOW_REFRESH_MS = 5 * 60_000L
    private const val LAUNCH_COOLDOWN_MS = 1_200L
  }
}
