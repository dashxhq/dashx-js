package com.dashx.sdk

import android.content.SharedPreferences
import android.os.Build
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter
import com.google.firebase.messaging.RemoteMessage
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONException
import java.io.IOException
import java.util.*


class DashXClient {
    private val tag = DashXClient::class.java.simpleName

    // Setup variables
    private var baseURI: String = "https://api.dashx.com/v1"
    private var publicKey: String? = null

    // Account variables
    private var anonymousUid: String? = null
    private var uid: String? = null

    private val httpClient = OkHttpClient()
    private val gson = Gson()
    private val json = "application/json; charset=utf-8".toMediaType()
    private val dashXNotificationFilter = "DASH_X_PN_TYPE"

    var reactApplicationContext: ReactApplicationContext? = null

    fun setBaseURI(baseURI: String) {
        this.baseURI = baseURI
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    fun setDeviceToken(deviceToken: String) {
        this.deviceToken = deviceToken
        subscribe()
    }

    fun generateAnonymousUid() {
        val dashXSharedPreferences: SharedPreferences = getDashXSharedPreferences(reactApplicationContext!!.applicationContext)
        val anonymousUid = dashXSharedPreferences.getString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, null)
        if (anonymousUid != null) {
            this.anonymousUid = anonymousUid
        } else {
            this.anonymousUid = UUID.randomUUID().toString()
            dashXSharedPreferences.edit()
                .putString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, this.anonymousUid)
                .apply()
        }
    }

fun handleMessage(remoteMessage: RemoteMessage) {
        val notification = remoteMessage.notification
        val eventProperties: WritableMap = Arguments.createMap()
        DashXLog.d(tag, "Data: " + remoteMessage.data)

        try {
            eventProperties.putMap("data", convertToWritableMap(remoteMessage.data, Arrays.asList(dashXNotificationFilter)))
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing notification data")
            e.printStackTrace()
        }

        if (notification != null) {
            val notificationProperties: WritableMap = Arguments.createMap()
            notificationProperties.putString("title", notification.title)
            notificationProperties.putString("body", notification.body)
            eventProperties.putMap("notification", notificationProperties)
            DashXLog.d(tag, "onMessageReceived: " + notification.title)
        }

        sendJsEvent("messageReceived", eventProperties)
    }

    private fun sendJsEvent(eventName: String, params: WritableMap) {
        reactApplicationContext
            ?.getJSModule(RCTDeviceEventEmitter::class.java)
            ?.emit(eventName, params)
    }
    
    private fun <T> makeHttpRequest(uri: String, body: T, callback: Callback) {
        val request: Request = Request.Builder()
            .url("$baseURI/$uri")
            .addHeader("X-Public-Key", publicKey!!)
            .post(gson.toJson(body).toString().toRequestBody(json))
            .build()

        httpClient.newCall(request).enqueue(callback)
    }

    fun identify(uid: String?, options: ReadableMap?) {
        if (uid != null) {
            this.uid = uid
            DashXLog.d(tag, "Set Uid: $uid")
            return
        }

        if (options == null) {
            throw Exception("Cannot be called with null, either pass uid: string or options: object")
        }

        val identifyRequest = try {
            val optionsHashMap = options.toHashMap() as? HashMap<String, String?>
            IdentifyRequest(
                optionsHashMap?.get("firstName"),
                optionsHashMap?.get("lastName"),
                optionsHashMap?.get("email"),
                optionsHashMap?.get("phone"),
                anonymousUid
            )
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        makeHttpRequest("identify", identifyRequest, object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not identify with: $uid $options")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during identify(): " + response.body?.string())
                    return
                }

                DashXLog.d(tag, "Sent identify: $identifyRequest")
            }
        })
    }

    fun track(event: String, data: ReadableMap?) {
        val trackRequest = try {
            TrackRequest(event, convertMapToJson(data), uid, anonymousUid)
        } catch (e: Exception) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        makeHttpRequest("track", trackRequest, object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not track: $event $data")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during track():" + response.body?.string())
                    return
                }

                val trackResponse: TrackResponse = gson.fromJson(response.body?.string(), TrackResponse::class.java)

                if (!trackResponse.success) {
                    DashXLog.d(tag, "Encountered an error during track(): $trackResponse")
                    return
                }

                DashXLog.d(tag, "Sent event: $trackRequest")
            }
        })
    }

    private fun subscribe() {
        val deviceName = Build.BRAND + " " + Build.MODEL
        val deviceKind = "android"

        val subscribeRequest = try {
            deviceToken?.let { deviceToken ->
                SubscribeRequest(deviceToken, deviceName, deviceKind, uid, if (uid != null) null else anonymousUid)
            }
        } catch (e: JSONException) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        val request: Request = Request.Builder()
            .url("$baseURI/subscribe")
            .addHeader("X-Public-Key", publicKey!!)
            .post(gson.toJson(subscribeRequest).toString().toRequestBody(json))
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                DashXLog.d(tag, "Could not subscribe: $deviceToken")
                e.printStackTrace()
            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(tag, "Encountered an error during subscribe():" + response.body?.string())
                    return
                }

                val subscribeResponse: SubscribeResponse = gson.fromJson(response.body?.string(), SubscribeResponse::class.java)

                if (!subscribeResponse.success) {
                    DashXLog.d(tag, "Encountered an error during track(): $subscribeResponse")
                    return
                }

                DashXLog.d(tag, "Subscribed: $deviceToken")
            }
        })
    }

    companion object {
        var instance: DashXClient? = null
            get() {
                if (field == null) {
                    field = DashXClient()
                }
                return field
            }
            private set
    }
}
