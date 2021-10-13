package com.dashx.rn.sdk

import android.content.SharedPreferences
import android.os.Build
import com.dashx.sdk.DashXClient as DashX
import com.apollographql.apollo.ApolloCall
import com.apollographql.apollo.ApolloClient
import com.apollographql.apollo.api.Input
import com.apollographql.apollo.exception.ApolloException
import com.dashx.*
import com.dashx.type.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.firebase.messaging.RemoteMessage
import okhttp3.*
import java.util.UUID


class DashXInterceptor private constructor() {
    private val tag = DashXInterceptor::class.java.simpleName

    // Setup variables
    private var baseURI: String = "https://api.dashx.com/graphql"
    private var publicKey: String? = null
    private var targetEnvironment: String? = null
    private var targetInstallation: String? = null

    // Account variables
    private var anonymousUid: String? = null
    private var uid: String? = null
    private var deviceToken: String? = null
    private var identityToken: String? = null
    private var accountType: String? = null

    private val dashXNotificationFilter = "DASHX_PN_TYPE"

    private var dashXClient: com.dashx.sdk.DashXClient? = null

    var reactApplicationContext: ReactApplicationContext? = null

    fun setBaseURI(baseURI: String) {
        this.baseURI = baseURI
    }

    fun createDashXClient() {
        dashXClient = DashX(publicKey!!, baseURI, accountType, targetEnvironment, targetInstallation)
    }

    fun setTargetEnvironment(targetEnvironment: String) {
        this.targetEnvironment = targetEnvironment
    }

    fun setTargetInstallation(targetInstallation: String) {
        this.targetEnvironment = targetInstallation
    }

    fun setAccountType(accountType: String) {
        this.accountType = accountType
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    private fun sendJsEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            ?.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }

    fun identify(uid: String?, options: ReadableMap?) {
        val optionsHashMap = options?.toHashMap()
        dashXClient?.identify(uid, optionsHashMap as HashMap<String, String>)
    }

    fun reset() {
        uid = null
        dashXClient?.generateAnonymousUid(regenerate = true)
    }

    fun track(event: String, data: ReadableMap?) {
        val jsonData = try {
            data?.toHashMap() as HashMap<String, String>
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        dashXClient?.track(event, jsonData)
    }

    fun fetchContent(urn: String, options: ReadableMap?, promise: Promise) {
        dashXClient?.fetchContent(
            urn,
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

    private fun subscribe() {
        if (deviceToken == null || identityToken == null) {
            DashXLog.d(tag,
                "Subscribe called with deviceToken: $deviceToken and identityToken: $identityToken")
            return
        }

        val subscribeContactInput = SubscribeContactInput(
            uid!!,
            Input.fromNullable("Android"),
            ContactKind.ANDROID,
            deviceToken!!
        )
        val subscribeContactMutation = SubscribeContactMutation(subscribeContactInput)

        apolloClient
            .mutate(subscribeContactMutation)
            .enqueue(object : ApolloCall.Callback<SubscribeContactMutation.Data>() {
                override fun onFailure(e: ApolloException) {
                    DashXLog.d(tag, "Could not subscribe: $deviceToken")
                    e.printStackTrace()
                }

                override fun onResponse(response: com.apollographql.apollo.api.Response<SubscribeContactMutation.Data>) {
                    val subscribeContactResponse = response.data?.subscribeContact
                    DashXLog.d(tag, "Subscribed: $deviceToken, $subscribeContactResponse")
                }
            })
    }

    companion object {
        val instance: DashXClient by lazy {
            DashXClient()
        }
    }
}
