package com.dashx.rn.sdk

import android.content.SharedPreferences
import android.os.Build
import com.dashx.sdk.DashXClient as DashX
import com.dashx.sdk.DashXLog
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter


class DashXClientInstance private constructor() {
    private val tag = DashXClientInstance::class.java.simpleName

    private var client: com.dashx.sdk.DashXClient? = null
    var reactApplicationContext: ReactApplicationContext? = null

    fun createDashXClient(publicKey: String, baseURI: String?, accountType: String?, targetEnvironment: String?, targetInstallation: String?) {
        client = DashX(publicKey!!, baseURI, accountType, targetEnvironment, targetInstallation)
        client?.applicationContext = reactApplicationContext?.applicationContext
    }

    fun getDashXClient(): com.dashx.sdk.DashXClient {
        if (client == null) {
            throw Exception("DashXClient not initialised")
        }

        return client!!
    }

    private fun sendJsEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            ?.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    fun fetchContent(urn: String, options: ReadableMap?, promise: Promise) {
        client?.fetchContent(
            urn,
            options?.getBooleanIfPresent("preview"),
            options?.getStringIfPresent("language"),
            options?.getArray("fields")?.toArrayList() as List<String>?,
            options?.getArray("include")?.toArrayList() as List<String>?,
            options?.getArray("exclude")?.toArrayList() as List<String>?,
            onError = {
                promise.reject("EUNSPECIFIED", it)
            },
            onSuccess = {
                promise.resolve(it)
            }
        )
    }

    fun searchContent(contentType: String, options: ReadableMap?, promise: Promise) {
        dashXClient?.searchContent(
            contentType,
            options?.getString("returnType") ?: "all",
            options?.getMap("filter"),
            options?.getMap("order"),
            options?.let {
                if (it.hasKey("limit")) it.getInt("limit") else null
            },
            false,
            options?.let {
                if (it.hasKey("language")) it.getString("language") else null
            },
            options?.getArray("fields")?.toArrayList() as List<String>?,
            options?.getArray("include")?.toArrayList() as List<String>?,
            options?.getArray("exclude")?.toArrayList() as List<String>?,
            onError = {
                promise.reject("EUNSPECIFIED", it)
            },
            onSuccess = { content ->
                val readableArray = Arguments.createArray()
                content.forEach {
                    readableArray.pushString(it.toString())
                }
            }
        )
    }

    fun trackAppStarted(fromBackground: Boolean = false) {
        val context = reactApplicationContext?.applicationContext ?: return

        val packageInfo = getPackageInfo(context)
        val currentBuild = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo.longVersionCode
        } else {
            packageInfo.versionCode.toLong()
        }

        fun saveBuildInPreferences() {
            val editor: SharedPreferences.Editor = getDashXSharedPreferences(context).edit()
            editor.putLong(SHARED_PREFERENCES_KEY_BUILD, currentBuild)
            editor.apply()
        }

        val eventProperties = Arguments.createMap()
        eventProperties.putString("version", packageInfo.versionName)
        eventProperties.putString("build", currentBuild.toString())
        if (fromBackground) eventProperties.putBoolean("from_background", true)

        when {
            getDashXSharedPreferences(context).getLong(SHARED_PREFERENCES_KEY_BUILD, Long.MIN_VALUE) == Long.MIN_VALUE
            -> {
                track(INTERNAL_EVENT_APP_INSTALLED, eventProperties)
                saveBuildInPreferences()
            }
            getDashXSharedPreferences(context).getLong(SHARED_PREFERENCES_KEY_BUILD, Long.MIN_VALUE) < currentBuild
            -> {
                track(INTERNAL_EVENT_APP_UPDATED, eventProperties)
                saveBuildInPreferences()
            }
            else -> track(INTERNAL_EVENT_APP_OPENED, eventProperties)
        }
    }

    fun trackAppSession(elapsedTime: Double) {
        val elapsedTimeRounded = elapsedTime / 1000
        val eventProperties = Arguments.createMap()
        eventProperties.putString("session_length", elapsedTimeRounded.toString())
        track(INTERNAL_EVENT_APP_BACKGROUNDED, eventProperties)
    }

    fun trackAppCrashed(exception: Throwable?) {
        val message = exception?.message
        val eventProperties = Arguments.createMap()
        eventProperties.putString("exception", message)
        track(INTERNAL_EVENT_APP_CRASHED, eventProperties)
    }

    fun screen(screenName: String, properties: ReadableMap?) {
        val data = Arguments.createMap()
        data.putString("name", screenName)
        properties?.let { it -> data.merge(it) }
        track(INTERNAL_EVENT_APP_SCREEN_VIEWED, data)
    }

    companion object {
        val instance: DashXClientInstance by lazy {
            DashXClientInstance()
        }
    }
}
