package com.dashx.sdk

import android.content.SharedPreferences
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableMap
import com.google.gson.Gson
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONException
import java.io.IOException
import java.util.*


class DashXClient {
    private val tag = DashXClient::class.java.simpleName
    private var anonymousUid: String? = null
    private var baseURI: String = "https://api.dashx.com/v1"
    private var publicKey: String? = null
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

    fun identify(uid: String?, options: ReadableMap?) {
        val identifyRequest = try {
            if (options != null) {
                val optionsHashMap = options.toHashMap() as HashMap<String, String?>
                IdentifyRequest(
                    optionsHashMap["firstName"],
                    optionsHashMap["lastName"],
                    optionsHashMap["email"],
                    optionsHashMap["phone"],
                    uid,
                    if (uid != null) null else anonymousUid
                )
            } else {
                IdentifyRequest(
                    null, null, null, null, uid, if (uid != null) null else anonymousUid
                )
            }
        } catch (e: JSONException) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        val request: Request = Request.Builder()
            .url("$baseURI/identify")
            .addHeader("X-Public-Key", publicKey!!)
            .post(gson.toJson(identifyRequest).toString().toRequestBody(json))
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
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

                val identifyResponse: IdentifyResponse? = gson.fromJson(response.body?.string(), IdentifyResponse::class.java)

                this@DashXClient.uid = uid

                DashXLog.d(tag, "Sent identify: $identifyRequest")
            }
        })
    }

    fun track(event: String, data: ReadableMap?) {
        val trackRequest = try {
            TrackRequest(event, convertMapToJson(data), uid, if (uid != null) null else anonymousUid)
        } catch (e: JSONException) {
            DashXLog.d(tag, "Encountered an error while parsing data")
            e.printStackTrace()
            return
        }

        val request: Request = Request.Builder()
            .url("$baseURI/track")
            .addHeader("X-Public-Key", publicKey!!)
            .post(gson.toJson(trackRequest).toString().toRequestBody(JSON))
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
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
