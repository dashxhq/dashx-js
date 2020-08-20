package com.dashx.sdk

import android.R.attr.data
import android.content.SharedPreferences
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.MultipartBody.Part.Companion.create
import okhttp3.RequestBody
import okhttp3.Response
import org.json.JSONException
import java.io.IOException
import java.util.*


class DashXClient {
    private var reactApplicationContext: ReactApplicationContext? = null
    private var anonymousUid: String? = null
    private var baseURI: String? = null
    private var publicKey: String? = null

    fun setBaseURI(baseURI: String) {
        this.baseURI = baseURI
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    fun setReactApplicationContext(reactApplicationContext: ReactApplicationContext?) {
        this.reactApplicationContext = reactApplicationContext
    }

    fun getReactApplicationContext(): ReactApplicationContext? {
        return reactApplicationContext
    }

    fun generateAnonymousUid() {
        val dashXSharedPreferences: SharedPreferences = getDashXSharedPreferences(reactApplicationContext!!.applicationContext)
        val anonymousUid = dashXSharedPreferences.getString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, null)
        if (anonymousUid != null) {
            this.anonymousUid = anonymousUid
        } else {
            this.anonymousUid = UUID.randomUUID().toString()
            dashXSharedPreferences.edit()
                .putString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, anonymousUid)
                .apply()
        }
    }

    fun identify(options: ReadableMap?) {
        val identifyParams = if (options == null) {
            Arguments.createMap().putString("anonymous_uid", anonymousUid)
        } else {
            Arguments.createMap().merge(options)
        }

        val body: RequestBody = create(convertMapToJson(options), JSON)

        val request: Request = Builder()
            .url("$baseURI/event_logs")
            .addHeader("X-Public-Key", publicKey)
            .post(body)
            .build()

        httpClient.newCall(request).enqueue(object : Callback() {
            fun onFailure(call: Call, e: IOException) {
                DashXLog.d(TAG, "Could not track: " + event.toString() + " " + data)
                e.printStackTrace()
            }

            @Throws(IOException::class)
            fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    DashXLog.d(TAG, "Encountered an error during track():" + response.body!!.string())
                    return
                }
                val genericResponse: GenericResponse = gson.fromJson(response.body!!.string(), GenericResponse::class.java)
                if (!genericResponse.getSuccess()) {
                    DashXLog.d(TAG, "Encountered an error during track():" + genericResponse.toString())
                    return
                }
                DashXLog.d(TAG, "Sent event: " + event.toString() + " " + data)
            }
        })
    }

    companion object {
        private val TAG = DashXClient::class.java.simpleName
        var instance: DashXClient? = null
            get() {
                if (field == null) {
                    field = DashXClient()
                }
                return field
            }
            private set
        private val JSON = "application/json; charset=utf-8".toMediaType()
    }
}
