package com.dashx.sdk

import com.facebook.react.bridge.*

class DashXModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var dashXClient: DashXClient? = null

    override fun getName(): String {
        return "DashX"
    }

    @ReactMethod
    fun setLogLevel(logLevel: Int) {
        DashXLog.setLogLevel(logLevel)
    }

    @ReactMethod
    fun setup(options: ReadableMap) {
        dashXClient?.setPublicKey(options.getString("publicKey")!!)
        if (options.hasKey("baseUri")) dashXClient?.setBaseURI(options.getString("baseUri")!!)
    }

    @ReactMethod
    fun identify(uid: String?, options: ReadableMap?, promise: Promise) {
        dashXClient?.identify(uid, options, promise)
    }

    @ReactMethod
    fun track(event: String, data: ReadableMap?) {
        dashXClient?.track(event, data)
    }

    init {
        dashXClient = DashXClient.instance
        dashXClient?.reactApplicationContext = reactContext
        dashXClient?.generateAnonymousUid()
    }
}
