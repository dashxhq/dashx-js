package com.dashx.sdk

import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
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

    var reactApplicationContext: ReactApplicationContext? = null

    fun setBaseURI(baseURI: String) {
        this.baseURI = baseURI
    }

    fun setPublicKey(publicKey: String) {
        this.publicKey = publicKey
    }

    fun generateAnonymousUid(regenerate: Boolean = false) {
        val dashXSharedPreferences: SharedPreferences = getDashXSharedPreferences(reactApplicationContext!!.applicationContext)
        val anonymousUid = dashXSharedPreferences.getString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, null)
        if (!regenerate && anonymousUid != null) {
            this.anonymousUid = anonymousUid
        } else {
            this.anonymousUid = UUID.randomUUID().toString()
            dashXSharedPreferences.edit()
                .putString(SHARED_PREFERENCES_KEY_ANONYMOUS_UID, this.anonymousUid)
                .apply()
        }
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

    fun reset () {
        uid = null
        generateAnonymousUid(regenerate = true)
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
