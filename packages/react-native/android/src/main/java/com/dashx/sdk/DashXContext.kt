package com.dashx.sdk

import android.content.Context
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import java.util.*

class DashXContext(reactApplicationContext: ReactApplicationContext) {
    private var displayMetrics: HashMap<String, String?>
    private var locale: String
    private val timezone: String

    private fun getDisplayMetrics(context: Context): HashMap<String, String?> {
        val displayMetrics = context.resources.displayMetrics
        return hashMapOf(
            "height" to displayMetrics.heightPixels.toString(),
            "width" to displayMetrics.widthPixels.toString(),
            "density" to displayMetrics.density.toString()
        )
    }

    private fun getLocale(context: Context): String {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            context.resources.configuration.locales[0].language
        } else {
            context.resources.configuration.locale.language
        }
    }

    private fun getTimezone(): String {
        return TimeZone.getDefault().displayName.toString()
    }

    init {
        val context = reactApplicationContext.applicationContext
        locale = getLocale(context)
        displayMetrics = getDisplayMetrics(context)
        timezone = getTimezone()
    }
}
