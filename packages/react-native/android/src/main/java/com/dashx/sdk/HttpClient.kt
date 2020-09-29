package com.dashx.sdk

import com.google.gson.FieldNamingPolicy
import com.google.gson.GsonBuilder
import okhttp3.CacheControl
import okhttp3.Callback
import okhttp3.Headers
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class HttpClient private constructor(
    private val cacheControl: CacheControl,
    private val baseUri: String,
    private val publicKey: String,
    private val extraHeaders: Headers?
) {
    fun makeRequest(uri: String, body: Any, callback: Callback) {
        val headerBuilder = Headers.Builder().add("X-Public-Key", publicKey)
        extraHeaders?.let { it -> headerBuilder.addAll(it) }

        val json = "application/json; charset=utf-8".toMediaType()

        val gson = GsonBuilder()
            .setFieldNamingPolicy(FieldNamingPolicy.LOWER_CASE_WITH_UNDERSCORES)
            .create()

        val request: Request = Request.Builder()
            .cacheControl(cacheControl)
            .url(baseUri + uri)
            .headers(headerBuilder.build())
            .post(gson.toJson(body).toString().toRequestBody(json))
            .build()

        OkHttpClient().newCall(request).enqueue(callback)
    }

    class Builder {
        private lateinit var publicKey: String
        private lateinit var baseUri: String
        private var cacheControl: CacheControl = CacheControl.FORCE_NETWORK
        private var extraHeaders: Headers? = null

        fun setBaseUri(baseUri: String) = apply {
            this.baseUri = baseUri
        }

        fun setPublicKey(publicKey: String) = apply {
            this.publicKey = publicKey
        }

        fun forceCache() = apply {
            this.cacheControl = CacheControl.FORCE_CACHE
        }

        fun setExtraHeaders(extraHeaders: Headers) = apply {
            this.extraHeaders = extraHeaders
        }

        fun build(): HttpClient {
            return HttpClient(
                cacheControl = cacheControl,
                baseUri = baseUri,
                publicKey = publicKey,
                extraHeaders = extraHeaders
            )
        }
    }
}
