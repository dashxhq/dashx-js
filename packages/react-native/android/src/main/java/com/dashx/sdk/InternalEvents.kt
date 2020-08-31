@file:JvmName("InternalEvents")

package com.dashx.sdk

import android.content.SharedPreferences
import android.os.Build
import android.text.format.DateUtils
import com.facebook.react.bridge.Arguments
import kotlin.math.roundToInt

fun DashXClient.trackAppStarted() {
    val context = this.reactApplicationContext?.applicationContext ?: return

    when {
        getDashXSharedPreferences(context).getLong(SHARED_PREFERENCES_KEY_BUILD, Long.MIN_VALUE) == Long.MIN_VALUE ->
            this.track(INTERNAL_EVENT_APP_INSTALLED, eventProperties)
        getDashXSharedPreferences(context).getLong(SHARED_PREFERENCES_KEY_BUILD, Long.MIN_VALUE) < currentBuild ->
            this.track(INTERNAL_EVENT_APP_UPDATED, eventProperties)
        else -> this.track(INTERNAL_EVENT_APP_OPENED, eventProperties)
    }

    val editor: SharedPreferences.Editor = getDashXSharedPreferences(context).edit()
    editor.putString(SHARED_PREFERENCES_KEY_VERSION, packageInfo.versionName)
    editor.putLong(SHARED_PREFERENCES_KEY_BUILD, currentBuild)
    editor.apply()
}

fun DashXClient.trackAppSession(elapsedTime: Double) {
    val elapsedTimeRounded = ((elapsedTime / 1000) * 10.0).roundToInt() / 10.0
    val eventProperties = Arguments.createMap()
    eventProperties.putString("session_length", DateUtils.formatElapsedTime(elapsedTimeRounded.toLong()))
    this.track(INTERNAL_EVENT_APP_BACKGROUNDED, eventProperties)
}

fun DashXClient.trackAppCrashed(exception: Throwable?) {
    val message = exception?.message
    val eventProperties = Arguments.createMap()
    eventProperties.putString("exception", message)
    this.track(INTERNAL_EVENT_APP_CRASHED, eventProperties)
}
